import { NextRequest } from 'next/server';
import { paymentsDb } from '@/lib/db';

// Server-Sent Events configuration
const EVENT_STREAM_TIMEOUT = 60000; // 60 seconds
const MAX_CONNECTIONS = 100; // Maximum concurrent connections per payment
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Connection management
const activeConnections = new Map<string, Set<ReadableStreamDefaultController>>();

interface PaymentUpdate {
  paymentId: string;
  status: string;
  timestamp: number;
  metadata?: any;
}

// Sanitize client IP for connection tracking
function getClientKey(request: NextRequest): string {
  const ip = (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.substring(0, 50)}`;
}

// Check if client has exceeded connection limit
function checkConnectionLimit(paymentId: string): boolean {
  const connections = activeConnections.get(paymentId);
  return connections ? connections.size >= MAX_CONNECTIONS : false;
}

// Add connection to tracking
function addConnection(paymentId: string, controller: ReadableStreamDefaultController): void {
  if (!activeConnections.has(paymentId)) {
    activeConnections.set(paymentId, new Set());
  }
  activeConnections.get(paymentId)!.add(controller);
}

// Remove connection from tracking
function removeConnection(paymentId: string, controller: ReadableStreamDefaultController): void {
  const connections = activeConnections.get(paymentId);
  if (connections) {
    connections.delete(controller);
    if (connections.size === 0) {
      activeConnections.delete(paymentId);
    }
  }
}

// Get current payment status from database
async function getPaymentStatus(paymentId: string) {
  try {
    const result = await paymentsDb.execute({
      sql: `
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT pm.key || '=' || pm.value) as metadata_json
        FROM payments p
        LEFT JOIN payment_metadata pm ON p.id = pm.payment_id
        WHERE p.id = ? OR p.reference_key LIKE ?
        GROUP BY p.id
        LIMIT 1
      `,
      args: [paymentId, `%${paymentId}%`]
    });

    if (result.rows.length === 0) {
      return null;
    }

    const payment = result.rows[0];

    // Parse metadata
    let metadata = {};
    if (payment.metadata_json) {
      try {
        const pairs = payment.metadata_json.split(',');
        metadata = pairs.reduce((acc: any, pair: string) => {
          const [key, value] = pair.split('=');
          if (key && value) {
            acc[key] = JSON.parse(value);
          }
          return acc;
        }, {});
      } catch (error) {
        console.warn('Failed to parse metadata:', error);
      }
    }

    return {
      id: payment.id,
      status: payment.status,
      referenceKey: payment.reference_key,
      userId: payment.user_id,
      amountLamports: payment.amount_lamports,
      signature: payment.tx_signature,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
      finalizedAt: payment.finalized_at,
      metadata
    };
  } catch (error) {
    console.error('Failed to get payment status:', error);
    return null;
  }
}

// Broadcast payment update to all connected clients
function broadcastPaymentUpdate(paymentId: string, update: PaymentUpdate): void {
  const connections = activeConnections.get(paymentId);
  if (!connections || connections.size === 0) {
    return;
  }

  const message = `data: ${JSON.stringify(update)}\n\n`;

  for (const controller of connections) {
    try {
      controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      console.error('Failed to send SSE update:', error);
      // Remove failed connection
      removeConnection(paymentId, controller);
    }
  }
}

// Send initial payment status
function sendInitialStatus(controller: ReadableStreamDefaultController, payment: any): void {
  const initialUpdate: PaymentUpdate = {
    paymentId: payment.id,
    status: payment.status,
    timestamp: Date.now(),
    metadata: {
      referenceKey: payment.referenceKey,
      userId: payment.userId,
      amountLamports: payment.amountLamports,
      signature: payment.signature,
      createdAt: payment.createdAt,
      finalizedAt: payment.finalizedAt
    }
  };

  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(initialUpdate)}\n\n`));
}

// Send heartbeat to keep connection alive
function sendHeartbeat(controller: ReadableStreamDefaultController): void {
  controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
}

// Create SSE stream for payment status updates
async function createPaymentStream(
  request: NextRequest,
  paymentId: string
): Promise<Response> {
  const clientKey = getClientKey(request);
  const startTime = Date.now();

  console.log(`🔗 SSE connection started for payment ${paymentId} from ${clientKey}`);

  // Check connection limit
  if (checkConnectionLimit(paymentId)) {
    return new Response(
      JSON.stringify({
        error: 'Connection limit exceeded',
        message: `Maximum ${MAX_CONNECTIONS} connections allowed per payment`
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Create readable stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Add connection to tracking
        addConnection(paymentId, controller);

        // Send initial headers
        controller.enqueue(new TextEncoder().encode(
          `retry: 5000\n` + // Retry delay
          `event: connected\n` +
          `data: ${JSON.stringify({ timestamp: Date.now(), paymentId })}\n\n`
        ));

        // Get current payment status and send immediately
        const currentPayment = await getPaymentStatus(paymentId);
        if (currentPayment) {
          sendInitialStatus(controller, currentPayment);
        } else {
          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify({
              paymentId,
              status: 'not_found',
              error: 'Payment not found',
              timestamp: Date.now()
            })}\n\n`
          ));
          // Close connection if payment not found
          controller.close();
          return;
        }

        // Set up heartbeat interval
        const heartbeatInterval = setInterval(() => {
          try {
            sendHeartbeat(controller);
          } catch (error) {
            console.error('Heartbeat failed:', error);
            clearInterval(heartbeatInterval);
            removeConnection(paymentId, controller);
          }
        }, HEARTBEAT_INTERVAL);

        // Set up timeout for connection
        const timeout = setTimeout(() => {
          console.log(`⏰ SSE connection timeout for payment ${paymentId}`);
          clearInterval(heartbeatInterval);
          removeConnection(paymentId, controller);
          controller.close();
        }, EVENT_STREAM_TIMEOUT);

        // Handle stream cancellation
        request.signal.addEventListener('abort', () => {
          console.log(`🔌 SSE connection aborted for payment ${paymentId}`);
          clearInterval(heartbeatInterval);
          clearTimeout(timeout);
          removeConnection(paymentId, controller);
          try {
            controller.close();
          } catch (error) {
            console.error('Error closing controller:', error);
          }
        });

      } catch (error) {
        console.error('SSE stream start error:', error);
        removeConnection(paymentId, controller);
        controller.error(error);
      }
    },

    cancel() {
      console.log(`🛑 SSE stream cancelled for payment ${paymentId}`);
      const connections = activeConnections.get(paymentId);
      if (connections) {
        // Controller will be removed by abort event listener
      }
    }
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no', // Disable buffering on Nginx
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🔗 New SSE connection request for payment: ${paymentId}`);

    // Create SSE stream
    const response = await createPaymentStream(request, paymentId);

    // Log connection stats
    const connections = activeConnections.get(paymentId);
    console.log(`📊 Active connections for payment ${paymentId}: ${connections?.size || 0}`);

    return response;

  } catch (error) {
    console.error('SSE endpoint error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Health check endpoint for SSE service
export async function HEAD(request: NextRequest) {
  try {
    const healthStatus = {
      service: 'Payment Status SSE',
      activeConnections: activeConnections.size,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };

    return new Response(null, {
      status: 200,
      headers: {
        'X-Health-Check': JSON.stringify(healthStatus),
        'X-Active-Connections': activeConnections.size.toString()
      }
    });
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}

// Utility function to simulate payment updates (for testing)
export async function simulatePaymentUpdate(paymentId: string, status: string): Promise<void> {
  const update: PaymentUpdate = {
    paymentId,
    status,
    timestamp: Date.now()
  };

  console.log(`🧪 Simulating payment update: ${paymentId} -> ${status}`);
  broadcastPaymentUpdate(paymentId, update);
}