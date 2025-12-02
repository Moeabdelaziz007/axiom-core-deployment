import { NextRequest, NextResponse } from 'next/server';
import { paymentsDb } from '@/lib/db';
import { verifyTransactionStatus } from '@/lib/solana/verify';
import { z } from 'zod';

// Rate limiting for polling
const POLLING_RATE_LIMIT_MAX = 60; // 60 requests
const POLLING_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Simple rate limiter for polling requests
const pollingRateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkPollingRateLimit(clientIP: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const clientData = pollingRateLimiter.get(clientIP) || { count: 0, resetTime: now + POLLING_RATE_LIMIT_WINDOW };

  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + POLLING_RATE_LIMIT_WINDOW;
  }

  clientData.count++;
  pollingRateLimiter.set(clientIP, clientData);

  return {
    allowed: clientData.count <= POLLING_RATE_LIMIT_MAX,
    remaining: Math.max(0, POLLING_RATE_LIMIT_MAX - clientData.count)
  };
}

// Input validation schema
const statusCheckSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  referenceKey: z.string().optional(),
  userId: z.string().optional(),
});

// Get client IP
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Cache for recent verifications to avoid redundant network calls
const verificationCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

function getCachedVerification(signature: string): any | null {
  const cached = verificationCache.get(signature);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  verificationCache.delete(signature);
  return null;
}

function setCachedVerification(signature: string, result: any): void {
  verificationCache.set(signature, { result, timestamp: Date.now() });
  // Cleanup old entries
  for (const [key, value] of verificationCache.entries()) {
    if (Date.now() - value.timestamp > CACHE_TTL) {
      verificationCache.delete(key);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkPollingRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Polling rate limit exceeded',
          message: 'Too many status check requests. Please wait before trying again.',
          retryAfter: 60
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': POLLING_RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'Retry-After': '60'
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate request parameters
    const params = statusCheckSchema.parse({
      paymentId: searchParams.get('paymentId'),
      referenceKey: searchParams.get('referenceKey'),
      userId: searchParams.get('userId'),
    });

    const { paymentId, referenceKey, userId } = params;

    console.log(`🔍 Payment status check: ${paymentId} from ${clientIP}`);

    // Query database for payment information
    let query = `
      SELECT 
        p.*,
        COUNT(pa.id) as attempt_count,
        MAX(pa.created_at) as last_attempt_at,
        GROUP_CONCAT(DISTINCT pm.key || '=' || pm.value) as metadata_json
      FROM payments p
      LEFT JOIN payment_attempts pa ON p.id = pa.payment_id
      LEFT JOIN payment_metadata pm ON p.id = pm.payment_id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];

    if (referenceKey) {
      query += ' AND p.reference_key = ?';
      queryParams.push(referenceKey);
    } else if (paymentId) {
      query += ' AND (p.id = ? OR p.reference_key LIKE ?)';
      queryParams.push(paymentId, `%${paymentId}%`);
    } else {
      return NextResponse.json(
        { success: false, error: 'Either paymentId or referenceKey is required' },
        { status: 400 }
      );
    }

    if (userId) {
      query += ' AND p.user_id = ?';
      queryParams.push(userId);
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT 1';

    const result = await paymentsDb.execute({
      sql: query,
      args: queryParams
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not found',
          message: 'No payment record found with the provided parameters'
        },
        { status: 404 }
      );
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

    // Build status response
    const statusResponse: any = {
      payment: {
        id: payment.id,
        userId: payment.user_id,
        referenceKey: payment.reference_key,
        status: payment.status,
        amountLamports: payment.amount_lamports,
        signature: payment.tx_signature,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        finalizedAt: payment.finalized_at,
        metadata
      },
      timeline: [
        {
          status: 'pending',
          timestamp: payment.created_at,
          description: 'Payment request created'
        }
      ],
      verification: {
        verified: false,
        lastChecked: Date.now()
      },
      rateLimit: {
        remaining: rateLimit.remaining,
        resetTime: Date.now() + POLLING_RATE_LIMIT_WINDOW
      }
    };

    // Add to timeline based on status
    if (payment.status === 'verified' && payment.finalized_at) {
      statusResponse.timeline.push({
        status: 'verified',
        timestamp: payment.finalized_at,
        description: 'Payment verified on Solana network'
      });
    } else if (payment.status === 'failed') {
      statusResponse.timeline.push({
        status: 'failed',
        timestamp: payment.updated_at,
        description: 'Payment verification failed'
      });
    }

    // If payment is pending and has a transaction signature, verify it
    if (payment.status === 'pending' && payment.tx_signature && !payment.tx_signature.startsWith('pending_')) {
      console.log(`🔄 Verifying transaction: ${payment.tx_signature}`);

      // Check cache first
      let verificationResult = getCachedVerification(payment.tx_signature);
      
      if (!verificationResult) {
        // Verify transaction on Solana
        try {
          verificationResult = await verifyTransactionStatus({
            transactionSignature: payment.tx_signature,
            referenceKey: payment.reference_key,
            expectedAmount: payment.amount_lamports
          });

          // Cache the result
          setCachedVerification(payment.tx_signature, verificationResult);
        } catch (error) {
          console.error('Transaction verification failed:', error);
          verificationResult = {
            isValid: false,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Verification failed'
          };
        }
      }

      statusResponse.verification = {
        verified: verificationResult.isValid,
        status: verificationResult.status,
        lastChecked: Date.now(),
        ...(verificationResult.error && { error: verificationResult.error }),
        ...(verificationResult.amount && { amount: verificationResult.amount }),
        ...(verificationResult.destination && { destination: verificationResult.destination }),
        ...(verificationResult.confirmationStatus && { confirmationStatus: verificationResult.confirmationStatus })
      };

      // If verification is successful but payment is still pending, update database
      if (verificationResult.isValid && verificationResult.status === 'finalized' && payment.status === 'pending') {
        try {
          await paymentsDb.execute({
            sql: `
              UPDATE payments 
              SET status = 'verified', finalized_at = strftime('%s', 'now')
              WHERE id = ?
            `,
            args: [payment.id]
          });

          statusResponse.payment.status = 'verified';
          statusResponse.payment.finalizedAt = Math.floor(Date.now() / 1000);
          
          statusResponse.timeline.push({
            status: 'verified',
            timestamp: statusResponse.payment.finalizedAt,
            description: 'Payment verified through polling check'
          });

          console.log(`✅ Payment ${payment.id} updated to verified status`);
        } catch (error) {
          console.error('Failed to update payment status:', error);
        }
      }
    }

    // Add attempt history if available
    if (payment.attempt_count > 0) {
      statusResponse.history = {
        attemptCount: payment.attempt_count,
        lastAttempt: payment.last_attempt_at
      };
    }

    return NextResponse.json({
      success: true,
      data: statusResponse
    });

  } catch (error) {
    console.error('Payment status check error:', error);

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

// POST endpoint for bulk status checks
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkPollingRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many bulk status check requests'
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { paymentIds, userId } = body;

    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'paymentIds array is required',
          message: 'Please provide an array of payment IDs to check'
        },
        { status: 400 }
      );
    }

    if (paymentIds.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many payment IDs',
          message: 'Maximum 50 payment IDs allowed per request'
        },
        { status: 400 }
      );
    }

    console.log(`📊 Bulk status check for ${paymentIds.length} payments from ${clientIP}`);

    // Query multiple payments at once
    const placeholders = paymentIds.map(() => '?').join(',');
    const query = `
      SELECT id, user_id, reference_key, status, amount_lamports, tx_signature, 
             created_at, updated_at, finalized_at
      FROM payments 
      WHERE id IN (${placeholders})
      ${userId ? 'AND user_id = ?' : ''}
      ORDER BY created_at DESC
    `;

    const args = userId ? [...paymentIds, userId] : paymentIds;
    const result = await paymentsDb.execute({
      sql: query,
      args
    });

    // Process results sequentially
    const payments = result.rows.map((payment: any) => ({
      id: payment.id,
      userId: payment.user_id,
      referenceKey: payment.reference_key,
      status: payment.status,
      amountLamports: payment.amount_lamports,
      signature: payment.tx_signature,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
      finalizedAt: payment.finalized_at
    }));

    return NextResponse.json({
      success: true,
      data: {
        payments,
        checked: payments.length,
        requested: paymentIds.length,
        rateLimit: {
          remaining: rateLimit.remaining
        }
      }
    });

  } catch (error) {
    console.error('Bulk status check error:', error);
    
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