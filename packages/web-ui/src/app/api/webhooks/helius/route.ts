import { NextRequest, NextResponse } from 'next/server';
import { processHeliusWebhook } from '@/lib/solana/verify';
import crypto from 'crypto';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Webhook configuration
const WEBHOOK_TIMEOUT = 30000; // 30 seconds timeout
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB max payload size

// Helius webhook event types (matching the interface in verify.ts)
interface HeliusWebhookEvent {
  type: 'TRANSFER' | 'ACCOUNT' | 'SWAP';
  signature: string;
  timestamp: number;
  slot: number;
  nativeTransfers?: Array<{
    amount: string;
    fromUserAccount: string;
    toUserAccount: string;
  }>;
  tokenTransfers?: Array<{
    mint: string;
    tokenAccount: string;
    tokenAmount: string;
    fromTokenAccount: string;
    toTokenAccount: string;
    fromUserAccount: string;
    toUserAccount: string;
  }>;
  accountData?: any;
  source?: string;
  description?: string;
}

// Rate limiting middleware
function checkRateLimit(clientKey: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientKey);

  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(clientKey, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  clientData.count++;
  return true;
}

// Get client identifier for rate limiting
function getClientKey(request: NextRequest): string {
  const ip = (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-client-ip') ||
    'unknown'
  );
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex').substring(0, 16);
}

// Validate webhook payload structure
function validateWebhookPayload(payload: any): { isValid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Invalid payload format' };
  }

  // Check required fields for TRANSFER events
  if (payload.type === 'TRANSFER') {
    if (!payload.signature || typeof payload.signature !== 'string') {
      return { isValid: false, error: 'Missing or invalid signature' };
    }

    if (!payload.timestamp || typeof payload.timestamp !== 'number') {
      return { isValid: false, error: 'Missing or invalid timestamp' };
    }

    if (!payload.slot || typeof payload.slot !== 'number') {
      return { isValid: false, error: 'Missing or invalid slot' };
    }

    // Check for transfer data
    const hasNativeTransfers = Array.isArray(payload.nativeTransfers) && payload.nativeTransfers.length > 0;
    const hasTokenTransfers = Array.isArray(payload.tokenTransfers) && payload.tokenTransfers.length > 0;

    if (!hasNativeTransfers && !hasTokenTransfers) {
      return { isValid: false, error: 'No transfer data found' };
    }
  }

  // Check timestamp is within reasonable range (not too old or future)
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  const maxFuture = 60 * 1000; // 1 minute in future

  if (payload.timestamp && (payload.timestamp < now - maxAge || payload.timestamp > now + maxFuture)) {
    return { isValid: false, error: 'Timestamp out of acceptable range' };
  }

  return { isValid: true };
}

// Log webhook event for audit trail
async function logWebhookEvent(
  clientKey: string,
  signature: string,
  eventType: string,
  processed: boolean,
  error?: string
): Promise<void> {
  try {
    // This would log to database in production
    console.log(`🪝 Webhook Log: ${clientKey} | ${eventType} | ${signature} | ${processed ? '✅' : '❌'}${error ? ` | ${error}` : ''}`);
  } catch (logError) {
    console.error('Failed to log webhook event:', logError);
  }
}

// Main webhook handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const clientKey = getClientKey(request);

  try {
    console.log(`🪝 Helius webhook received from ${clientKey}`);

    // Check rate limiting
    if (!checkRateLimit(clientKey)) {
      await logWebhookEvent(clientKey, 'unknown', 'RATE_LIMIT', false, 'Rate limit exceeded');
      
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per ${RATE_LIMIT_WINDOW / 1000} seconds`,
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString()
          }
        }
      );
    }

    // Get webhook signature from headers
    const signature = request.headers.get('helius-signature') || 
                    request.headers.get('x-helius-signature') ||
                    request.headers.get('signature');

    if (!signature) {
      await logWebhookEvent(clientKey, 'unknown', 'MISSING_SIGNATURE', false, 'No signature provided');
      
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.HELIUS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ HELIUS_WEBHOOK_SECRET environment variable not set');
      
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Read request body with size limit
    let payload: string;
    try {
      const body = await request.text();
      
      if (body.length > MAX_PAYLOAD_SIZE) {
        await logWebhookEvent(clientKey, 'unknown', 'PAYLOAD_TOO_LARGE', false, 'Payload exceeds size limit');
        
        return NextResponse.json(
          { error: 'Payload too large' },
          { status: 413 }
        );
      }
      
      payload = body;
    } catch (error) {
      await logWebhookEvent(clientKey, 'unknown', 'READ_ERROR', false, 'Failed to read request body');
      
      return NextResponse.json(
        { error: 'Failed to read request body' },
        { status: 400 }
      );
    }

    // Parse and validate payload
    let webhookData: HeliusWebhookEvent;
    try {
      webhookData = JSON.parse(payload);
    } catch (error) {
      await logWebhookEvent(clientKey, 'unknown', 'PARSE_ERROR', false, 'Invalid JSON payload');
      
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const validation = validateWebhookPayload(webhookData);
    if (!validation.isValid) {
      await logWebhookEvent(clientKey, webhookData.signature || 'unknown', webhookData.type || 'UNKNOWN', false, validation.error);
      
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Process webhook with existing verification system
    console.log(`🔄 Processing webhook: ${webhookData.type} - ${webhookData.signature}`);
    
    const result = await processHeliusWebhook(payload, signature, webhookSecret);

    // Log processing result
    await logWebhookEvent(
      clientKey, 
      webhookData.signature, 
      webhookData.type, 
      result.success && result.processed,
      result.error
    );

    // Return appropriate response
    if (result.success) {
      const responseTime = Date.now() - startTime;
      
      return NextResponse.json({
        success: true,
        processed: result.processed,
        paymentUpdates: result.paymentUpdates,
        processingTime: responseTime,
        timestamp: new Date().toISOString()
      }, {
        status: 200,
        headers: {
          'X-Processing-Time': responseTime.toString(),
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': Math.max(0, RATE_LIMIT_MAX_REQUESTS - (rateLimitStore.get(clientKey)?.count || 0)).toString(),
          'X-RateLimit-Reset': new Date((rateLimitStore.get(clientKey)?.resetTime || 0)).toISOString()
        }
      });
    } else {
      // Handle different error scenarios
      let statusCode = 500;
      
      if (result.error?.includes('Invalid webhook signature')) {
        statusCode = 401;
      } else if (result.error?.includes('No transfer data')) {
        statusCode = 400;
      } else if (result.error?.includes('already processed')) {
        statusCode = 409; // Conflict
      }

      return NextResponse.json({
        success: false,
        processed: result.processed,
        error: result.error,
        timestamp: new Date().toISOString()
      }, {
        status: statusCode,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': Math.max(0, RATE_LIMIT_MAX_REQUESTS - (rateLimitStore.get(clientKey)?.count || 0)).toString(),
          'X-RateLimit-Reset': new Date((rateLimitStore.get(clientKey)?.resetTime || 0)).toISOString()
        }
      });
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('❌ Helius webhook processing error:', error);
    await logWebhookEvent(clientKey, 'unknown', 'INTERNAL_ERROR', false, error instanceof Error ? error.message : 'Unknown error');

    return NextResponse.json({
      success: false,
      processed: false,
      error: 'Internal server error',
      processingTime: responseTime,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'X-Processing-Time': responseTime.toString()
      }
    });
  }
}

// Health check endpoint for webhook service
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const healthStatus = {
      service: 'Helius Webhook Handler',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      rateLimitStats: {
        activeClients: rateLimitStore.size,
        windowSize: RATE_LIMIT_WINDOW,
        maxRequests: RATE_LIMIT_MAX_REQUESTS
      },
      configuration: {
        maxPayloadSize: MAX_PAYLOAD_SIZE,
        timeout: WEBHOOK_TIMEOUT,
        webhookSecretConfigured: !!process.env.HELIUS_WEBHOOK_SECRET
      }
    };

    return NextResponse.json(healthStatus, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      service: 'Helius Webhook Handler',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 503
    });
  }
}

// HEAD endpoint for simple health checks
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const isHealthy = !!process.env.HELIUS_WEBHOOK_SECRET;
    
    return NextResponse.json(null, {
      status: isHealthy ? 200 : 503,
      headers: {
        'X-Service': 'Helius Webhook Handler',
        'X-Status': isHealthy ? 'healthy' : 'unhealthy',
        'X-Timestamp': new Date().toISOString()
      }
    });

  } catch (error) {
    return NextResponse.json(null, { status: 503 });
  }
}