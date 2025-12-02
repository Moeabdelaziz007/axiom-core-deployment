import { NextRequest, NextResponse } from 'next/server';
import { paymentsDb, withPaymentTransaction } from '@/lib/db';
import { z } from 'zod';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createTransferTransaction, generateReferenceKey } from '@/lib/solana/transaction';

// Input validation schema
const paymentRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amountLamports: z.number().positive('Amount must be positive'),
  recipient: z.string().min(1, 'Recipient address is required'),
  splToken: z.object({
    mint: z.string().optional(),
    decimals: z.number().positive().optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    
    if (!paymentId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment ID is required'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = paymentRequestSchema.parse(body);
    const { userId, amountLamports, recipient, splToken, metadata } = validatedData;

    // Generate unique reference key for idempotency
    const referenceKey = generateReferenceKey(paymentId, userId);
    
    // Check for existing payment with this reference key
    const existingPayment = await paymentsDb.execute({
      sql: 'SELECT id, status FROM payments WHERE reference_key = ?',
      args: [referenceKey]
    });

    if (existingPayment.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Duplicate payment request',
          message: 'A payment with this reference key already exists',
          referenceKey
        },
        { status: 409 }
      );
    }

    // Create payment record
    const paymentResult = await withPaymentTransaction(async (db) => {
      const result = await db.execute({
        sql: `
          INSERT INTO payments (user_id, reference_key, amount_lamports, tx_signature, status)
          VALUES (?, ?, ?, ?, 'pending')
          RETURNING *
        `,
        args: [userId, referenceKey, amountLamports, 'pending_tx_' + paymentId]
      });

      // Add metadata if provided
      if (metadata && Object.keys(metadata).length > 0) {
        for (const [key, value] of Object.entries(metadata)) {
          await db.execute({
            sql: 'INSERT INTO payment_metadata (payment_id, key, value) VALUES (?, ?, ?)',
            args: [result.rows[0].id, key, JSON.stringify(value)]
          });
        }
      }

      return result.rows[0];
    });

    // Generate Solana Pay transaction
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    );

    try {
      const transaction = await createTransferTransaction({
        connection,
        fromPublicKey: new PublicKey(recipient),
        amountLamports,
        splToken,
        referenceKey,
      });

      // Serialize transaction for client to sign
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });

      // Update payment with transaction signature placeholder
      await paymentsDb.execute({
        sql: 'UPDATE payments SET tx_signature = ? WHERE id = ?',
        args: ['pending_tx_' + paymentId, paymentResult.id]
      });

      return NextResponse.json({
        success: true,
        data: {
          payment: paymentResult,
          transaction: {
            serialized: Buffer.from(serializedTransaction).toString('base64'),
            message: 'Please sign this transaction and submit to Solana network',
            instructions: [
              '1. Connect your Solana wallet',
              '2. Sign the transaction',
              '3. Submit to Solana network',
              '4. Wait for confirmation'
            ]
          },
          referenceKey,
          amount: {
            lamports: amountLamports,
            sol: amountLamports / LAMPORTS_PER_SOL,
            display: splToken 
              ? `${(amountLamports / Math.pow(10, splToken.decimals || 0)).toFixed(splToken.decimals || 0)} ${splToken.mint || 'SPL'}`
              : `${(amountLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`
          },
          recipient,
          status: 'pending',
          nextSteps: [
            '1. Sign and submit transaction',
            '2. Wait for Helius webhook confirmation',
            '3. Payment will be marked as verified'
          ]
        }
      });
    } catch (txError) {
      // Update payment status to failed
      await paymentsDb.execute({
        sql: 'UPDATE payments SET status = ? WHERE id = ?',
        args: ['failed', paymentResult.id]
      });

      // Log payment attempt
      await paymentsDb.execute({
        sql: `
          INSERT INTO payment_attempts (payment_id, attempt_type, status, error_message, retry_count)
          VALUES (?, 'transaction_generation', 'failed', ?, 1)
        `,
        args: [paymentResult.id, txError instanceof Error ? txError.message : 'Unknown error']
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Transaction generation failed',
          message: txError instanceof Error ? txError.message : 'Unknown error',
          paymentId: paymentResult.id
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Payment request error:', error);
    
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

// GET endpoint to check payment request status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    
    if (!paymentId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment ID is required'
        },
        { status: 400 }
      );
    }

    const result = await paymentsDb.execute({
      sql: `
        SELECT p.*, pm.key, pm.value as metadata_value
        FROM payments p
        LEFT JOIN payment_metadata pm ON p.id = pm.payment_id
        WHERE p.reference_key LIKE ?
        ORDER BY p.created_at DESC
      `,
      args: [`%${paymentId}%`]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment not found'
        },
        { status: 404 }
      );
    }

    // Group metadata by payment
    const payment = result.rows.reduce((acc: any, row: any) => {
      if (!acc[row.id]) {
        acc[row.id] = { ...row, metadata: {} };
      }
      if (row.key) {
        acc[row.id].metadata[row.key] = JSON.parse(row.metadata_value);
      }
      return acc;
    }, {});

    const paymentData = Object.values(payment)[0];

    return NextResponse.json({
      success: true,
      data: {
        payment: paymentData,
        statusTimeline: [
          { status: 'pending', at: paymentData.created_at },
          ...(paymentData.finalized_at ? [{ status: 'finalized', at: paymentData.finalized_at }] : [])
        ]
      }
    });
  } catch (error) {
    console.error('Payment status check error:', error);
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