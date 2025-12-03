import { createClient } from '@libsql/client';
import crypto from 'crypto';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { EventPublisher } from '@/lib/events/event-publisher';
import { PolicyEngine, TransactionContext, PolicyEvaluationResult } from '@/lib/security/policy-engine';

// Database client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Solana connection
const solanaConnection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Webhook interface
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

// Payment verification result
interface PaymentVerificationResult {
  success: boolean;
  processed: boolean;
  error?: string;
  paymentUpdates?: Array<{
    referenceKey: string;
    status: 'verified' | 'provisioned' | 'failed';
    txSignature: string;
    amount: number;
    destination: string;
  }>;
}

// Verify HMAC signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Get payment by reference key
async function getPaymentByReference(referenceKey: string): Promise<any> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM payments WHERE reference_key = ?',
      args: [referenceKey]
    });
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching payment:', error);
    return null;
  }
}

// Update payment status
async function updatePaymentStatus(
  referenceKey: string,
  status: 'verified' | 'provisioned' | 'failed',
  txSignature: string,
  finalizedAt?: number
): Promise<boolean> {
  try {
    await db.execute({
      sql: `
        UPDATE payments 
        SET status = ?, tx_signature = ?, finalized_at = ?
        WHERE reference_key = ?
      `,
      args: [status, txSignature, finalizedAt || Date.now(), referenceKey]
    });
    return true;
  } catch (error) {
    console.error('Error updating payment status:', error);
    return false;
  }
}

// Extract reference key from transaction
function extractReferenceKey(transaction: Transaction): string | null {
  try {
    // Look for memo instruction with reference key
    for (const instruction of transaction.instructions) {
      if (instruction.programId.equals(SystemProgram.programId)) {
        // Check if this is a transfer with memo data
        const data = instruction.data;
        if (data && data.length > 0) {
          // Try to decode reference key from memo
          try {
            const memoText = new TextDecoder().decode(data);
            if (memoText.startsWith('REF:')) {
              return memoText.substring(4); // Remove 'REF:' prefix
            }
          } catch {
            // Not a valid memo, continue
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting reference key:', error);
    return null;
  }
}

// Process Helius webhook with transactional outbox integration
export async function processHeliusWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<PaymentVerificationResult> {
  try {
    console.log('🔄 Processing Helius webhook with outbox integration');

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      return {
        success: false,
        processed: false,
        error: 'Invalid webhook signature'
      };
    }

    // Parse webhook payload
    let webhookData: HeliusWebhookEvent;
    try {
      webhookData = JSON.parse(payload);
    } catch (error) {
      return {
        success: false,
        processed: false,
        error: 'Invalid JSON payload'
      };
    }

    // Only process TRANSFER events
    if (webhookData.type !== 'TRANSFER') {
      return {
        success: true,
        processed: false,
        error: 'Non-TRANSFER event ignored'
      };
    }

    // Get transaction details
    const transaction = await solanaConnection.getTransaction(
      webhookData.signature,
      {
        commitment: 'finalized',
        maxSupportedTransactionVersion: 0
      }
    );

    if (!transaction) {
      return {
        success: false,
        processed: false,
        error: 'Transaction not found or not finalized'
      };
    }

    // Extract reference key
    const referenceKey = extractReferenceKey(transaction.transaction as any);
    if (!referenceKey) {
      return {
        success: false,
        processed: false,
        error: 'No reference key found in transaction'
      };
    }

    // Check if payment already processed
    const existingPayment = await getPaymentByReference(referenceKey);
    if (!existingPayment) {
      return {
        success: false,
        processed: false,
        error: 'Payment not found for reference key'
      };
    }

    if (existingPayment.status === 'verified' || existingPayment.status === 'provisioned') {
      return {
        success: true,
        processed: false,
        error: 'Payment already processed'
      };
    }

    // Verify transaction details
    const amount = transaction.meta?.postBalances?.[1]
      ? transaction.meta.postBalances[1] - (transaction.meta.preBalances?.[1] || 0)
      : 0;

    const destination = transaction.transaction.message.staticAccountKeys?.[1]?.toString();
    const expectedDestination = process.env.SOLANA_TREASURY_ADDRESS;

    if (amount < LAMPORTS_PER_SOL * 0.99) { // Less than 0.99 SOL
      return {
        success: false,
        processed: false,
        error: 'Insufficient payment amount'
      };
    }

    if (destination !== expectedDestination) {
      return {
        success: false,
        processed: false,
        error: 'Invalid destination address'
      };
    }

    // Initialize event publisher
    const eventPublisher = new EventPublisher(db);

    // Update payment status to verified
    const updated = await updatePaymentStatus(
      referenceKey,
      'verified',
      webhookData.signature,
      Date.now()
    );

    if (!updated) {
      return {
        success: false,
        processed: false,
        error: 'Failed to update payment status'
      };
    }

    // Publish payment verified event
    await eventPublisher.publishPaymentVerified(
      existingPayment.id,
      referenceKey,
      webhookData.signature,
      amount,
      destination || '',
      {
        webhookTimestamp: webhookData.timestamp,
        slot: webhookData.slot,
        userId: existingPayment.user_id
      }
    );

    console.log(`✅ Payment verified: ${referenceKey} -> ${webhookData.signature}`);

    return {
      success: true,
      processed: true,
      paymentUpdates: [{
        referenceKey,
        status: 'verified',
        txSignature: webhookData.signature,
        amount: amount / LAMPORTS_PER_SOL,
        destination: destination || ''
      }]
    };

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return {
      success: false,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Verify transaction status (for manual checks)
export async function verifyTransactionStatus(signature: string): Promise<PaymentVerificationResult> {
  try {
    const transaction = await solanaConnection.getTransaction(signature, {
      commitment: 'finalized',
      maxSupportedTransactionVersion: 0
    });

    if (!transaction) {
      return {
        success: false,
        processed: false,
        error: 'Transaction not found or not finalized'
      };
    }

    const referenceKey = extractReferenceKey(transaction.transaction as any);
    if (!referenceKey) {
      return {
        success: false,
        processed: false,
        error: 'No reference key found in transaction'
      };
    }

    const existingPayment = await getPaymentByReference(referenceKey);
    if (!existingPayment) {
      return {
        success: false,
        processed: false,
        error: 'Payment not found for reference key'
      };
    }

    const amount = transaction.meta?.postBalances?.[1]
      ? transaction.meta.postBalances[1] - (transaction.meta.preBalances?.[1] || 0)
      : 0;

    const destination = transaction.transaction.message.staticAccountKeys?.[1]?.toString();

    return {
      success: true,
      processed: existingPayment.status !== 'pending',
      paymentUpdates: existingPayment.status !== 'pending' ? [{
        referenceKey,
        status: existingPayment.status as 'verified' | 'provisioned' | 'failed',
        txSignature: signature,
        amount: amount / LAMPORTS_PER_SOL,
        destination: destination || ''
      }] : undefined
    };

  } catch (error) {
    return {
      success: false,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}