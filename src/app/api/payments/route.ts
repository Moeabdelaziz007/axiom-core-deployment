import { NextRequest, NextResponse } from 'next/server';
import { paymentsDb } from '@/lib/db';
import { z } from 'zod';

// Input validation schema
const createPaymentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amountLamports: z.number().positive('Amount must be positive'),
  referenceKey: z.string().min(1, 'Reference key is required'),
  metadata: z.record(z.any()).optional(),
});

const getPaymentsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  status: z.enum(['pending', 'verified', 'provisioned', 'failed']).optional(),
  limit: z.number().positive().max(100).default(20),
  offset: z.number().nonnegative().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const params = getPaymentsSchema.parse({
      userId: searchParams.get('userId'),
      status: searchParams.get('status') as any,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    });

    // Build query dynamically
    let query = 'SELECT * FROM payments WHERE user_id = ?';
    const args: any[] = [params.userId];

    if (params.status) {
      query += ' AND status = ?';
      args.push(params.status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    args.push(params.limit, params.offset);

    const result = await paymentsDb.execute({
      sql: query,
      args
    });

    // Get total count for pagination
    const countQuery = params.status 
      ? 'SELECT COUNT(*) as total FROM payments WHERE user_id = ? AND status = ?'
      : 'SELECT COUNT(*) as total FROM payments WHERE user_id = ?';
    
    const countArgs = params.status ? [params.userId, params.status] : [params.userId];
    const countResult = await paymentsDb.execute({
      sql: countQuery,
      args: countArgs
    });

    return NextResponse.json({
      success: true,
      data: {
        payments: result.rows,
        pagination: {
          total: countResult.rows[0].total,
          limit: params.limit,
          offset: params.offset,
          hasMore: params.offset + params.limit < countResult.rows[0].total
        }
      }
    });
  } catch (error) {
    console.error('Payment fetch error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request parameters',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createPaymentSchema.parse(body);
    const { userId, amountLamports, referenceKey, metadata } = validatedData;

    // Check for existing reference key (idempotency)
    const existingPayment = await paymentsDb.execute({
      sql: 'SELECT id FROM payments WHERE reference_key = ?',
      args: [referenceKey]
    });

    if (existingPayment.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Duplicate payment request',
          message: 'A payment with this reference key already exists'
        },
        { status: 409 }
      );
    }

    // Create payment record with transaction
    const result = await paymentsDb.execute({
      sql: `
        INSERT INTO payments (user_id, reference_key, amount_lamports, status)
        VALUES (?, ?, ?, 'pending')
        RETURNING *
      `,
      args: [userId, referenceKey, amountLamports]
    });

    const payment = result.rows[0];

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      for (const [key, value] of Object.entries(metadata)) {
        await paymentsDb.execute({
          sql: 'INSERT INTO payment_metadata (payment_id, key, value) VALUES (?, ?, ?)',
          args: [payment.id, key, JSON.stringify(value)]
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      data: {
        payment,
        message: 'Payment record created successfully',
        nextSteps: [
          '1. Generate Solana Pay transaction',
          '2. User signs and submits transaction',
          '3. Helius webhook confirms finalization',
          '4. Payment status updates to verified'
        ]
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function PUT(request: NextRequest) {
  try {
    const healthCheck = await paymentsDb.execute('SELECT 1 as test');
    
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        database: healthCheck.success ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: {
          status: 'unhealthy',
          database: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      },
      { status: 503 }
    );
  }
}