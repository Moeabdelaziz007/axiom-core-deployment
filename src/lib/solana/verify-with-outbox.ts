import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { paymentsDb } from '@/lib/db';
import { isValidTransactionSignature } from './transaction';
import { withEventPublishing, publishPaymentVerified, publishPaymentFailed, publishWebhookProcessed, publishWebhookFailed } from '@/lib/events/event-publisher';
import crypto from 'crypto';

interface TransactionVerificationResult {
  isValid: boolean;
  status: 'confirmed' | 'finalized' | 'failed';
  confirmationStatus?: string;
  amount?: number;
  destination?: string;
  signature?: string;
  metadata?: any;
  error?: string;
}

interface VerificationParams {
  transactionSignature: string;
  referenceKey?: string;
  expectedAmount?: number;
  expectedDestination?: string;
  splTokenMint?: string;
}

// Constants for verification
const FINALIZED_COMMITMENT = 'finalized';
const CONFIRMED_COMMITMENT = 'confirmed';

// Helius Webhook Event Types
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

// Extract transfer event data from Helius webhook
function extractTransferData(webhookData: any): {
  signature: string;
  amount: number;
  destination: string;
  source: string;
  slot: number;
  timestamp: number;
  tokenMint?: string;
  isTokenTransfer: boolean;
  referenceKey?: string;
} | null {
  try {
    // Handle Helius webhook format
    const event: HeliusWebhookEvent = webhookData;
    
    if (!event || !event.signature) {
      console.error('Invalid webhook event structure');
      return null;
    }

    // Only process TRANSFER events
    if (event.type !== 'TRANSFER') {
      console.log(`Skipping non-transfer event: ${event.type}`);
      return null;
    }

    let amount = 0;
    let destination = '';
    let source = '';
    let tokenMint: string | undefined;
    let isTokenTransfer = false;

    // Process native SOL transfers
    if (event.nativeTransfers && event.nativeTransfers.length > 0) {
      const transfer = event.nativeTransfers[0];
      amount = parseInt(transfer.amount) || 0;
      destination = transfer.toUserAccount;
      source = transfer.fromUserAccount;
      isTokenTransfer = false;
    }
    
    // Process SPL token transfers
    else if (event.tokenTransfers && event.tokenTransfers.length > 0) {
      const tokenTransfer = event.tokenTransfers[0];
      amount = parseInt(tokenTransfer.tokenAmount) || 0;
      destination = tokenTransfer.toUserAccount;
      source = tokenTransfer.fromUserAccount;
      tokenMint = tokenTransfer.mint;
      isTokenTransfer = true;
    }
    
    else {
      console.error('No transfer data found in webhook event');
      return null;
    }

    // Extract reference key from transaction memo if available
    let referenceKey: string | undefined;
    if (event.description) {
      // Try to extract reference key from memo/description
      const refMatch = event.description.match(/ref:([a-zA-Z0-9_]+)/);
      if (refMatch) {
        referenceKey = refMatch[1];
      }
    }

    return {
      signature: event.signature,
      amount,
      destination,
      source,
      slot: event.slot,
      timestamp: event.timestamp || Date.now(),
      tokenMint,
      isTokenTransfer,
      referenceKey
    };
  } catch (error) {
    console.error('Failed to extract transfer data:', error);
    return null;
  }
}

// Verify transaction status with strict commitment check
export async function verifyTransactionStatus(
  params: VerificationParams
): Promise<TransactionVerificationResult> {
  const { transactionSignature, referenceKey, expectedAmount, expectedDestination } = params;
  
  // Validate signature format
  if (!isValidTransactionSignature(transactionSignature)) {
    return {
      isValid: false,
      status: 'failed',
      error: 'Invalid transaction signature format'
    };
  }

  const connection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
  );

  try {
    // Get transaction with finalized commitment only
    const transaction = await connection.getTransaction(
      transactionSignature,
      { 
        commitment: FINALIZED_COMMITMENT,
        maxSupportedTransactionVersion: 0
      }
    );

    if (!transaction) {
      return {
        isValid: false,
        status: 'failed',
        error: 'Transaction not found on Solana network'
      };
    }

    // Check if transaction is actually finalized
    const confirmationStatus = transaction.meta?.confirmationStatus || transaction.confirmationStatus;
    
    if (confirmationStatus !== FINALIZED_COMMITMENT) {
      return {
        isValid: false,
        status: 'failed',
        confirmationStatus,
        error: `Transaction not finalized. Status: ${confirmationStatus}`
      };
    }

    // Verify transaction success
    if (transaction.meta?.err) {
      return {
        isValid: false,
        status: 'failed',
        error: `Transaction failed: ${JSON.stringify(transaction.meta.err)}`
      };
    }

    // Extract transfer details
    const preBalances = transaction.meta.preBalances || [];
    const postBalances = transaction.meta.postBalances || [];
    const preTokenBalances = transaction.meta.preTokenBalances || [];
    const postTokenBalances = transaction.meta.postTokenBalances || [];

    // For SOL transfers, check balance changes
    let detectedAmount = 0;
    let detectedDestination = '';

    // Check account balance changes for destination
    const accountKeys = transaction.transaction.message.getAccountKeys();
    
    for (let i = 0; i < accountKeys.length; i++) {
      const balanceChange = postBalances[i] - preBalances[i];
      if (balanceChange > 0) {
        detectedAmount = balanceChange;
        detectedDestination = accountKeys.get(i).toString();
        break;
      }
    }

    // Check expectations if provided
    if (expectedAmount && detectedAmount !== expectedAmount) {
      return {
        isValid: false,
        status: 'failed',
        amount: detectedAmount,
        expectedAmount,
        error: 'Amount mismatch'
      };
    }

    if (expectedDestination && detectedDestination !== expectedDestination) {
      return {
        isValid: false,
        status: 'failed',
        destination: detectedDestination,
        expectedDestination,
        error: 'Destination mismatch'
      };
    }

    return {
      isValid: true,
      status: 'finalized',
      confirmationStatus,
      amount: detectedAmount,
      destination: detectedDestination,
      signature: transactionSignature,
      metadata: {
        slot: transaction.slot,
        version: transaction.version,
        fee: transaction.meta.fee,
        accountKeys: accountKeys.getAll().map(key => key.toString())
      }
    };

  } catch (error) {
    console.error('Transaction verification error:', error);
    return {
      isValid: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown verification error'
    };
  }
}

// Update payment status in database after verification with outbox pattern
export async function updatePaymentStatusWithOutbox(
  referenceKey: string,
  signature: string,
  verificationResult: TransactionVerificationResult
): Promise<void> {
  try {
    // Get payment ID first for event publishing
    const paymentResult = await paymentsDb.execute({
      sql: 'SELECT id, user_id FROM payments WHERE reference_key = ? LIMIT 1',
      args: [referenceKey]
    });

    if (paymentResult.rows.length === 0) {
      console.warn(`Payment not found for reference key: ${referenceKey}`);
      return;
    }

    const paymentId = paymentResult.rows[0].id.toString();
    const userId = paymentResult.rows[0].user_id;

    if (!verificationResult.isValid) {
      // Update payment as failed
      await paymentsDb.execute({
        sql: `
          UPDATE payments
          SET status = 'failed', tx_signature = ?, finalized_at = strftime('%s', 'now')
          WHERE reference_key = ?
        `,
        args: [signature, referenceKey]
      });

      // Log failed attempt
      await paymentsDb.execute({
        sql: `
          INSERT INTO payment_attempts (payment_id, attempt_type, status, error_message, retry_count)
          SELECT id, 'verification', 'failed', ?, 1
          FROM payments WHERE reference_key = ?
        `,
        args: [verificationResult.error, referenceKey]
      });

      // Publish payment failed event to outbox
      await publishPaymentFailed(
        paymentId,
        userId,
        referenceKey,
        verificationResult.amount || 0,
        verificationResult.error || 'Verification failed',
        {
          signature,
          confirmationStatus: verificationResult.confirmationStatus
        }
      );

      return;
    }

    // Update payment as verified/finalized
    await paymentsDb.execute({
      sql: `
        UPDATE payments
        SET status = 'verified', tx_signature = ?, finalized_at = strftime('%s', 'now')
        WHERE reference_key = ?
      `,
      args: [signature, referenceKey]
    });

    // Log successful verification
    await paymentsDb.execute({
      sql: `
        INSERT INTO payment_attempts (payment_id, attempt_type, status, attempt_data, retry_count)
        SELECT id, 'verification', 'success', ?, 1
        FROM payments WHERE reference_key = ?
      `,
      args: [JSON.stringify({
        amount: verificationResult.amount,
        destination: verificationResult.destination,
        metadata: verificationResult.metadata
      }), referenceKey]
    });

    console.log(`✅ Payment verified: ${referenceKey} with signature ${signature}`);

    // Publish payment verified event to outbox
    await publishPaymentVerified(
      paymentId,
      userId,
      referenceKey,
      verificationResult.amount || 0,
      signature,
      {
        destination: verificationResult.destination,
        confirmationStatus: verificationResult.confirmationStatus,
        metadata: verificationResult.metadata
      }
    );
  } catch (error) {
    console.error('Failed to update payment status:', error);
    throw error;
  }
}

// Process Helius webhook with HMAC verification and outbox pattern
export async function processHeliusWebhookWithOutbox(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
  paymentUpdates?: Array<{
    referenceKey: string;
    signature: string;
    status: string;
    amount?: number;
    tokenMint?: string;
  }>;
}> {
  const correlationId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return await withEventPublishing(correlationId, async (publisher) => {
    try {
      // Verify HMAC signature first
      if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
        return {
          success: false,
          processed: false,
          error: 'Invalid webhook signature'
        };
      }

      const webhookData = JSON.parse(payload);
      const transferData = extractTransferData(webhookData);

      if (!transferData) {
        return {
          success: false,
          processed: false,
          error: 'No transfer data found in webhook'
        };
      }

      // Check for idempotency - see if this transaction was already processed
      const existingPayment = await paymentsDb.execute({
        sql: `
          SELECT id, status, reference_key
          FROM payments
          WHERE tx_signature = ? OR reference_key = ?
          LIMIT 1
        `,
        args: [transferData.signature, transferData.referenceKey || transferData.signature]
      });

      if (existingPayment.rows.length > 0) {
        const payment = existingPayment.rows[0];
        console.log(`🔄 Transaction ${transferData.signature} already processed (status: ${payment.status})`);
        
        return {
          success: true,
          processed: true,
          paymentUpdates: [{
            referenceKey: payment.reference_key,
            signature: transferData.signature,
            status: payment.status,
            amount: transferData.amount,
            tokenMint: transferData.tokenMint
          }]
        };
      }

      // Verify the transaction on Solana
      const verificationResult = await verifyTransactionStatus({
        transactionSignature: transferData.signature,
        referenceKey: transferData.referenceKey,
        expectedAmount: transferData.amount,
        expectedDestination: transferData.destination,
        splTokenMint: transferData.tokenMint
      });

      // Publish webhook processed event to outbox
      await publishWebhookProcessed(
        'helius',
        transferData.signature,
        webhookData,
        {
          verificationResult: verificationResult.isValid,
          transferData,
          correlationId
        }
      );

      if (!verificationResult.isValid) {
        // Publish webhook failed event
        await publishWebhookFailed(
          'helius',
          transferData.signature,
          webhookData,
          verificationResult.error || 'Transaction verification failed',
          {
            verificationResult,
            correlationId
          }
        );

        return {
          success: false,
          processed: true,
          error: verificationResult.error
        };
      }

      // Find payment by reference key or create new one if needed
      let referenceKey = transferData.referenceKey;
      if (!referenceKey) {
        // Generate a reference key from signature if not provided
        referenceKey = `webhook_${transferData.signature.substring(0, 16)}`;
      }

      // Check if payment exists with this reference key
      const paymentByRef = await paymentsDb.execute({
        sql: `
          SELECT id, user_id, amount_lamports
          FROM payments
          WHERE reference_key = ?
          LIMIT 1
        `,
        args: [referenceKey]
      });

      let paymentId: string;
      if (paymentByRef.rows.length > 0) {
        paymentId = paymentByRef.rows[0].id.toString();
        
        // Update existing payment using outbox pattern
        await updatePaymentStatusWithOutbox(referenceKey, transferData.signature, verificationResult);
      } else {
        // Create new payment record for webhook-initiated payments
        const insertResult = await paymentsDb.execute({
          sql: `
            INSERT INTO payments (
              tx_signature, user_id, reference_key, amount_lamports, status, finalized_at
            ) VALUES (?, ?, ?, ?, 'verified', strftime('%s', 'now'))
          `,
          args: [
            transferData.signature,
            'webhook_user', // Default user for webhook-initiated payments
            referenceKey,
            transferData.amount
          ]
        });
        
        paymentId = insertResult.lastInsertRowid?.toString() || '0';

        // Publish payment verified event for new payment
        await publishPaymentVerified(
          paymentId,
          'webhook_user',
          referenceKey,
          transferData.amount,
          transferData.signature,
          {
            destination: transferData.destination,
            isTokenTransfer: transferData.isTokenTransfer,
            tokenMint: transferData.tokenMint,
            slot: transferData.slot
          }
        );
      }

      // Store additional metadata for token transfers
      if (transferData.isTokenTransfer && transferData.tokenMint) {
        await paymentsDb.execute({
          sql: `
            INSERT OR REPLACE INTO payment_metadata (payment_id, key, value)
            VALUES (?, 'token_mint', ?), (?, 'is_token_transfer', 'true')
          `,
          args: [paymentId, transferData.tokenMint, paymentId]
        });
      }

      console.log(`✅ Payment processed: ${referenceKey} -> ${verificationResult.status}`);

      return {
        success: true,
        processed: true,
        paymentUpdates: [{
          referenceKey,
          signature: transferData.signature,
          status: verificationResult.status,
          amount: transferData.amount,
          tokenMint: transferData.tokenMint
        }]
      };

    } catch (error) {
      console.error('Helius webhook processing error:', error);
      
      // Publish webhook failed event
      await publishWebhookFailed(
        'helius',
        'unknown',
        payload,
        error instanceof Error ? error.message : 'Webhook processing failed',
        {
          correlationId,
          error: error instanceof Error ? error.stack : JSON.stringify(error)
        }
      );

      // Log failed webhook processing
      try {
        await paymentsDb.execute({
          sql: `
            INSERT INTO webhook_events (webhook_type, event_data, processed, error_message)
            VALUES ('helius', ?, FALSE, ?)
          `,
          args: [payload, error instanceof Error ? error.message : 'Unknown error']
        });
      } catch (logError) {
        console.error('Failed to log webhook error:', logError);
      }

      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed'
      };
    }
  });
}

// Webhook signature verification
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

// Health check for verification system
export async function verificationHealthCheck(): Promise<{
  healthy: boolean;
  connected: boolean;
  averageResponseTime: number;
  lastCheck: number;
}> {
  const startTime = Date.now();
  
  try {
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    );

    // Simple test query
    const currentSlot = await connection.getSlot();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      healthy: true,
      connected: currentSlot > 0,
      averageResponseTime: responseTime,
      lastCheck: endTime
    };
  } catch (error) {
    return {
      healthy: false,
      connected: false,
      averageResponseTime: Date.now() - startTime,
      lastCheck: Date.now()
    };
  }
}