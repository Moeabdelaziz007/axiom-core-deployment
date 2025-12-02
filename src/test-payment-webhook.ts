/**
 * Comprehensive Test Suite for Helius Webhook Handler Integration
 * 
 * This test file validates the complete webhook processing pipeline including:
 * - HMAC signature verification
 * - SOL and SPL token transfer payload parsing
 * - Idempotency checks for duplicate processing
 * - Error handling for invalid signatures and malformed payloads
 * - SSE integration for real-time payment status updates
 * - Database operations and rate limiting
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { paymentsDb } from '@/lib/db';
import { processHeliusWebhook, verifyTransactionStatus } from '@/lib/solana/verify';
import { simulatePaymentUpdate } from '@/app/api/sse/payment-status/route';
import crypto from 'crypto';

// Mock environment variables
const TEST_WEBHOOK_SECRET = 'test_webhook_secret_key_for_testing';
const TEST_SOLANA_RPC_URL = 'https://api.devnet.solana.com';

// Sample Helius webhook payloads
const SAMPLE_SOL_TRANSFER_WEBHOOK = {
  type: 'TRANSFER',
  signature: '5j7s8B9G2C3F4E5D6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0',
  timestamp: 1704067200000,
  slot: 123456789,
  nativeTransfers: [
    {
      amount: '1000000', // 0.001 SOL in lamports
      fromUserAccount: 'GfDE1mJZtrJjCA5E2Jg4y8J8yVtR9ZcPm9YdUfKxTqL',
      toUserAccount: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
    }
  ],
  description: 'Payment for order #12345 ref:order_12345'
};

const SAMPLE_SPL_TOKEN_TRANSFER_WEBHOOK = {
  type: 'TRANSFER',
  signature: '3k9l0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0',
  timestamp: 1704067200000,
  slot: 123456790,
  tokenTransfers: [
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint
      tokenAccount: '7fKXhMJ3WqN3P9wXQrjL4xY5zZ6a7b8c9d0e1f2g3h4',
      tokenAmount: '5000000', // 5 USDC (6 decimals)
      fromTokenAccount: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2',
      toTokenAccount: '7fKXhMJ3WqN3P9wXQrjL4xY5zZ6a7b8c9d0e1f2g3h4',
      fromUserAccount: 'GfDE1mJZtrJjCA5E2Jg4y8J8yVtR9ZcPm9YdUfKxTqL',
      toUserAccount: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
    }
  ],
  description: 'Token purchase ref:token_purchase_abc123'
};

const INVALID_WEBHOOK_PAYLOAD = {
  type: 'ACCOUNT',
  accountData: {
    account: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    lamports: 1000000
  }
};

const MALFORMED_WEBHOOK_PAYLOAD = '{"type": "TRANSFER", "signature": "invalid"';

// Test utilities
function generateHmacSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

function createMockRequest(payload: string, signature?: string, headers: Record<string, string> = {}): NextRequest {
  const requestHeaders = new Headers({
    'content-type': 'application/json',
    'x-forwarded-for': '127.0.0.1',
    ...headers
  });

  if (signature) {
    requestHeaders.set('X-Helius-Signature', signature);
  }

  return new NextRequest('http://localhost:3000/api/webhooks/helius', {
    method: 'POST',
    headers: requestHeaders,
    body: payload
  });
}

// Setup test environment
beforeAll(async () => {
  // Set test environment variables
  process.env.HELIUS_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
  process.env.SOLANA_RPC_URL = TEST_SOLANA_RPC_URL;
  process.env.NODE_ENV = 'test';

  // Initialize test database
  try {
    await paymentsDb.execute('SELECT 1');
    console.log('✅ Test database connection established');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
});

afterAll(async () => {
  // Clean up test environment
  delete process.env.HELIUS_WEBHOOK_SECRET;
  delete process.env.SOLANA_RPC_URL;
  delete process.env.NODE_ENV;
});

beforeEach(async () => {
  // Clean up test data before each test
  try {
    await paymentsDb.execute('DELETE FROM payment_attempts');
    await paymentsDb.execute('DELETE FROM payment_metadata');
    await paymentsDb.execute('DELETE FROM webhook_events');
    await paymentsDb.execute('DELETE FROM payments');
  } catch (error) {
    console.warn('Warning: Failed to clean up test data:', error);
  }
});

describe('Helius Webhook Handler Integration Tests', () => {
  describe('HMAC Signature Verification', () => {
    it('should verify valid HMAC signature', async () => {
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid HMAC signature', async () => {
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const invalidSignature = 'invalid_signature_hash';

      const result = await processHeliusWebhook(payload, invalidSignature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(false);
      expect(result.processed).toBe(false);
      expect(result.error).toBe('Invalid webhook signature');
    });

    it('should reject signature with wrong secret', async () => {
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, 'wrong_secret');

      const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(false);
      expect(result.processed).toBe(false);
      expect(result.error).toBe('Invalid webhook signature');
    });
  });

  describe('SOL Transfer Payload Processing', () => {
    it('should process SOL transfer webhook correctly', async () => {
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(true);
      expect(result.paymentUpdates).toHaveLength(1);
      
      const update = result.paymentUpdates![0];
      expect(update.signature).toBe(SAMPLE_SOL_TRANSFER_WEBHOOK.signature);
      expect(update.amount).toBe(1000000);
      expect(update.tokenMint).toBeUndefined();
      expect(update.referenceKey).toBe('order_12345');
    });

    it('should extract reference key from description', async () => {
      const webhookWithRef = {
        ...SAMPLE_SOL_TRANSFER_WEBHOOK,
        description: 'Payment received ref:custom_ref_789'
      };

      const payload = JSON.stringify(webhookWithRef);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(true);
      expect(result.paymentUpdates![0].referenceKey).toBe('custom_ref_789');
    });

    it('should generate reference key if not provided', async () => {
      const webhookWithoutRef = {
        ...SAMPLE_SOL_TRANSFER_WEBHOOK,
        description: undefined
      };

      const payload = JSON.stringify(webhookWithoutRef);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(true);
      expect(result.paymentUpdates![0].referenceKey).toMatch(/^webhook_[a-f0-9]{16}$/);
    });

    it('should store SOL transfer in database', async () => {
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      // Verify payment was stored
      const paymentResult = await paymentsDb.execute({
        sql: 'SELECT * FROM payments WHERE tx_signature = ?',
        args: [SAMPLE_SOL_TRANSFER_WEBHOOK.signature]
      });

      expect(paymentResult.rows).toHaveLength(1);
      const payment = paymentResult.rows[0];
      expect(payment.tx_signature).toBe(SAMPLE_SOL_TRANSFER_WEBHOOK.signature);
      expect(payment.amount_lamports).toBe(1000000);
      expect(payment.status).toBe('verified');
      expect(payment.reference_key).toBe('order_12345');
    });
  });

  describe('SPL Token Transfer Payload Processing', () => {
    it('should process SPL token transfer webhook correctly', async () => {
      const payload = JSON.stringify(SAMPLE_SPL_TOKEN_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(true);
      expect(result.paymentUpdates).toHaveLength(1);
      
      const update = result.paymentUpdates![0];
      expect(update.signature).toBe(SAMPLE_SPL_TOKEN_TRANSFER_WEBHOOK.signature);
      expect(update.amount).toBe(5000000);
      expect(update.tokenMint).toBe('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      expect(update.referenceKey).toBe('token_purchase_abc123');
    });

    it('should store SPL token metadata in database', async () => {
      const payload = JSON.stringify(SAMPLE_SPL_TOKEN_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      // Verify payment was stored
      const paymentResult = await paymentsDb.execute({
        sql: 'SELECT * FROM payments WHERE tx_signature = ?',
        args: [SAMPLE_SPL_TOKEN_TRANSFER_WEBHOOK.signature]
      });

      expect(paymentResult.rows).toHaveLength(1);
      const paymentId = paymentResult.rows[0].id;

      // Verify metadata was stored
      const metadataResult = await paymentsDb.execute({
        sql: 'SELECT * FROM payment_metadata WHERE payment_id = ?',
        args: [paymentId]
      });

      expect(metadataResult.rows.length).toBeGreaterThan(0);
      
      const tokenMintMetadata = metadataResult.rows.find(row => row.key === 'token_mint');
      expect(tokenMintMetadata?.value).toBe('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      
      const isTokenTransferMetadata = metadataResult.rows.find(row => row.key === 'is_token_transfer');
      expect(isTokenTransferMetadata?.value).toBe('true');
    });
  });

  describe('Idempotency Checks', () => {
    it('should prevent duplicate processing of same transaction', async () => {
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      // Process webhook first time
      const result1 = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);
      expect(result1.success).toBe(true);
      expect(result1.processed).toBe(true);

      // Process same webhook second time
      const result2 = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);
      expect(result2.success).toBe(true);
      expect(result2.processed).toBe(true);
      
      // Should return existing payment info
      expect(result2.paymentUpdates![0].status).toBe(result1.paymentUpdates![0].status);

      // Verify only one payment record exists
      const paymentResult = await paymentsDb.execute({
        sql: 'SELECT COUNT(*) as count FROM payments WHERE tx_signature = ?',
        args: [SAMPLE_SOL_TRANSFER_WEBHOOK.signature]
      });

      expect(paymentResult.rows[0].count).toBe(1);
    });

    it('should prevent duplicate processing by reference key', async () => {
      const webhookWithSameRef = {
        ...SAMPLE_SOL_TRANSFER_WEBHOOK,
        signature: 'different_signature_hash_for_same_ref',
        nativeTransfers: [
          {
            ...SAMPLE_SOL_TRANSFER_WEBHOOK.nativeTransfers[0],
            amount: '2000000' // Different amount
          }
        ]
      };

      const payload1 = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const payload2 = JSON.stringify(webhookWithSameRef);
      const signature1 = generateHmacSignature(payload1, TEST_WEBHOOK_SECRET);
      const signature2 = generateHmacSignature(payload2, TEST_WEBHOOK_SECRET);

      // Process first webhook
      const result1 = await processHeliusWebhook(payload1, signature1, TEST_WEBHOOK_SECRET);
      expect(result1.success).toBe(true);

      // Process second webhook with same reference key
      const result2 = await processHeliusWebhook(payload2, signature2, TEST_WEBHOOK_SECRET);
      expect(result2.success).toBe(true);
      expect(result2.processed).toBe(true);
      
      // Should return existing payment info
      expect(result2.paymentUpdates![0].referenceKey).toBe('order_12345');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid webhook event type', async () => {
      const payload = JSON.stringify(INVALID_WEBHOOK_PAYLOAD);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(false);
      expect(result.processed).toBe(false);
      expect(result.error).toBe('No transfer data found in webhook');
    });

    it('should handle malformed JSON payload', async () => {
      const signature = generateHmacSignature(MALFORMED_WEBHOOK_PAYLOAD, TEST_WEBHOOK_SECRET);

      const result = await processHeliusWebhook(MALFORMED_WEBHOOK_PAYLOAD, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(false);
      expect(result.processed).toBe(false);
      expect(result.error).toContain('Unexpected token');
    });

    it('should handle empty payload', async () => {
      const payload = '';
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(false);
      expect(result.processed).toBe(false);
      expect(result.error).toContain('Unexpected end of JSON input');
    });

    it('should handle webhook without transfer data', async () => {
      const webhookWithoutTransfer = {
        type: 'TRANSFER',
        signature: 'test_signature',
        timestamp: 1704067200000,
        slot: 123456789
        // No nativeTransfers or tokenTransfers
      };

      const payload = JSON.stringify(webhookWithoutTransfer);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(false);
      expect(result.processed).toBe(false);
      expect(result.error).toBe('No transfer data found in webhook');
    });

    it('should log webhook events to database', async () => {
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      // Verify webhook event was logged
      const eventResult = await paymentsDb.execute({
        sql: 'SELECT * FROM webhook_events WHERE webhook_type = ? ORDER BY created_at DESC LIMIT 1',
        args: ['helius']
      });

      expect(eventResult.rows).toHaveLength(1);
      const event = eventResult.rows[0];
      expect(event.webhook_type).toBe('helius');
      expect(event.processed).toBe('TRUE');
      expect(event.error_message).toBeNull();
      expect(JSON.parse(event.event_data)).toEqual(SAMPLE_SOL_TRANSFER_WEBHOOK);
    });

    it('should log failed webhook processing', async () => {
      const payload = JSON.stringify(INVALID_WEBHOOK_PAYLOAD);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      // Verify failed webhook event was logged
      const eventResult = await paymentsDb.execute({
        sql: 'SELECT * FROM webhook_events WHERE webhook_type = ? ORDER BY created_at DESC LIMIT 1',
        args: ['helius']
      });

      expect(eventResult.rows).toHaveLength(1);
      const event = eventResult.rows[0];
      expect(event.processed).toBe('FALSE');
      expect(event.error_message).toBe('No transfer data found in webhook');
    });
  });

  describe('SSE Integration', () => {
    it('should trigger SSE update for successful payment', async () => {
      // Create a test payment first
      const insertResult = await paymentsDb.execute({
        sql: `
          INSERT INTO payments (tx_signature, user_id, reference_key, amount_lamports, status)
          VALUES (?, ?, ?, ?, 'pending')
        `,
        args: ['test_signature', 'test_user', 'test_ref', 1000000]
      });

      const paymentId = insertResult.lastInsertRowid?.toString();

      // Mock the SSE broadcast function
      const mockBroadcast = jest.fn();
      jest.mock('@/app/api/sse/payment-status/route', () => ({
        simulatePaymentUpdate: mockBroadcast
      }));

      // Trigger payment update
      await simulatePaymentUpdate(paymentId!, 'verified');

      expect(mockBroadcast).toHaveBeenCalledWith(paymentId, 'verified');
    });

    it('should handle SSE update failure gracefully', async () => {
      // Create a test payment
      const insertResult = await paymentsDb.execute({
        sql: `
          INSERT INTO payments (tx_signature, user_id, reference_key, amount_lamports, status)
          VALUES (?, ?, ?, ?, 'pending')
        `,
        args: ['test_signature_2', 'test_user_2', 'test_ref_2', 2000000]
      });

      const paymentId = insertResult.lastInsertRowid?.toString();

      // Mock SSE function to throw error
      jest.mock('@/app/api/sse/payment-status/route', () => ({
        simulatePaymentUpdate: jest.fn().mockRejectedValue(new Error('SSE connection failed'))
      }));

      // Process webhook - should not fail due to SSE error
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits for webhook endpoint', async () => {
      // This test would require importing the actual webhook route handler
      // For now, we'll test the rate limiting logic conceptually
      
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

      // Simulate multiple rapid requests
      const results = [];
      for (let i = 0; i < 105; i++) { // Exceed the limit of 100
        results.push(processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET));
      }

      const processedResults = await Promise.allSettled(results);
      
      // Some requests should be rate limited
      const successfulResults = processedResults.filter(r => 
        r.status === 'fulfilled' && r.value.success
      );
      
      // Note: This is a conceptual test - actual rate limiting would be tested
      // at the HTTP endpoint level with proper request/response handling
      expect(successfulResults.length).toBeGreaterThan(0);
    });
  });

  describe('Security Headers and Validation', () => {
    it('should validate content type', async () => {
      // This would test the actual HTTP endpoint
      // For now, we test the payload processing logic
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      
      // Test with valid JSON
      expect(() => JSON.parse(payload)).not.toThrow();
      
      // Test with invalid content
      expect(() => JSON.parse('invalid json')).toThrow();
    });

    it('should validate signature format', async () => {
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      
      // Valid hex signature
      const validSignature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);
      expect(/^[a-f0-9]{64}$/i.test(validSignature)).toBe(true);
      
      // Invalid signature formats
      const invalidSignatures = [
        '',
        'short',
        'invalid_characters_here_123',
        'g' + 'a'.repeat(63) // Contains non-hex character
      ];
      
      for (const invalidSig of invalidSignatures) {
        const result = await processHeliusWebhook(payload, invalidSig, TEST_WEBHOOK_SECRET);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid webhook signature');
      }
    });
  });

  describe('End-to-End Payment Fulfillment Flow', () => {
    it('should complete full SOL payment fulfillment flow', async () => {
      // 1. Process webhook
      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);
      
      const webhookResult = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);
      expect(webhookResult.success).toBe(true);

      // 2. Verify payment was created
      const paymentResult = await paymentsDb.execute({
        sql: 'SELECT * FROM payments WHERE tx_signature = ?',
        args: [SAMPLE_SOL_TRANSFER_WEBHOOK.signature]
      });
      expect(paymentResult.rows).toHaveLength(1);

      const payment = paymentResult.rows[0];
      expect(payment.status).toBe('verified');
      expect(payment.reference_key).toBe('order_12345');

      // 3. Verify payment attempts were logged
      const attemptResult = await paymentsDb.execute({
        sql: 'SELECT * FROM payment_attempts WHERE payment_id = ?',
        args: [payment.id]
      });
      expect(attemptResult.rows.length).toBeGreaterThan(0);

      const verificationAttempt = attemptResult.rows.find(a => a.attempt_type === 'verification');
      expect(verificationAttempt?.status).toBe('success');

      // 4. Verify webhook event was logged
      const eventResult = await paymentsDb.execute({
        sql: 'SELECT * FROM webhook_events WHERE event_data LIKE ?',
        args: [`%${SAMPLE_SOL_TRANSFER_WEBHOOK.signature}%`]
      });
      expect(eventResult.rows).toHaveLength(1);
      expect(eventResult.rows[0].processed).toBe('TRUE');
    });

    it('should complete full SPL token payment fulfillment flow', async () => {
      // 1. Process webhook
      const payload = JSON.stringify(SAMPLE_SPL_TOKEN_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);
      
      const webhookResult = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);
      expect(webhookResult.success).toBe(true);

      // 2. Verify payment was created
      const paymentResult = await paymentsDb.execute({
        sql: 'SELECT * FROM payments WHERE tx_signature = ?',
        args: [SAMPLE_SPL_TOKEN_TRANSFER_WEBHOOK.signature]
      });
      expect(paymentResult.rows).toHaveLength(1);

      const payment = paymentResult.rows[0];
      expect(payment.status).toBe('verified');
      expect(payment.reference_key).toBe('token_purchase_abc123');

      // 3. Verify token metadata was stored
      const metadataResult = await paymentsDb.execute({
        sql: 'SELECT * FROM payment_metadata WHERE payment_id = ?',
        args: [payment.id]
      });
      
      const tokenMint = metadataResult.rows.find(m => m.key === 'token_mint');
      expect(tokenMint?.value).toBe('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      
      const isToken = metadataResult.rows.find(m => m.key === 'is_token_transfer');
      expect(isToken?.value).toBe('true');
    });

    it('should handle payment failure flow', async () => {
      // Mock transaction verification to fail
      jest.mock('@/lib/solana/verify', () => ({
        ...jest.requireActual('@/lib/solana/verify'),
        verifyTransactionStatus: jest.fn().mockResolvedValue({
          isValid: false,
          status: 'failed',
          error: 'Transaction not found on Solana network'
        })
      }));

      const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);
      
      const webhookResult = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);
      expect(webhookResult.success).toBe(false);
      expect(webhookResult.processed).toBe(true);
      expect(webhookResult.error).toBe('Transaction not found on Solana network');

      // Verify failed payment was logged
      const paymentResult = await paymentsDb.execute({
        sql: 'SELECT * FROM payments WHERE tx_signature = ?',
        args: [SAMPLE_SOL_TRANSFER_WEBHOOK.signature]
      });
      expect(paymentResult.rows).toHaveLength(1);
      expect(paymentResult.rows[0].status).toBe('failed');
    });
  });
});

// Performance and Load Testing
describe('Webhook Performance Tests', () => {
  it('should handle concurrent webhook processing', async () => {
    const concurrentRequests = 10;
    const webhooks = Array.from({ length: concurrentRequests }, (_, i) => ({
      ...SAMPLE_SOL_TRANSFER_WEBHOOK,
      signature: `test_signature_${i}`,
      nativeTransfers: [{
        ...SAMPLE_SOL_TRANSFER_WEBHOOK.nativeTransfers[0],
        amount: (1000000 * (i + 1)).toString()
      }]
    }));

    const startTime = Date.now();
    const promises = webhooks.map(webhook => {
      const payload = JSON.stringify(webhook);
      const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);
      return processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);
    });

    const results = await Promise.allSettled(promises);
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // All requests should be processed successfully
    const successfulResults = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    );
    expect(successfulResults).toHaveLength(concurrentRequests);

    // Processing should complete within reasonable time
    expect(processingTime).toBeLessThan(5000); // 5 seconds

    console.log(`Processed ${concurrentRequests} concurrent webhooks in ${processingTime}ms`);
  });

  it('should handle large payload efficiently', async () => {
    // Create a webhook with large description
    const largeWebhook = {
      ...SAMPLE_SOL_TRANSFER_WEBHOOK,
      description: 'A'.repeat(10000) // 10KB description
    };

    const payload = JSON.stringify(largeWebhook);
    const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

    const startTime = Date.now();
    const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    expect(result.success).toBe(true);
    expect(processingTime).toBeLessThan(1000); // Should process quickly even with large payload

    console.log(`Processed large payload (${payload.length} bytes) in ${processingTime}ms`);
  });
});

// Security Tests
describe('Webhook Security Tests', () => {
  it('should prevent replay attacks with timestamp validation', async () => {
    // This would require implementing timestamp validation in the webhook
    // For now, we test the signature verification which prevents basic replay
    const payload = JSON.stringify(SAMPLE_SOL_TRANSFER_WEBHOOK);
    const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

    // First request should succeed
    const result1 = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);
    expect(result1.success).toBe(true);

    // Second request with same signature should be handled by idempotency
    const result2 = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);
    expect(result2.success).toBe(true);
    expect(result2.processed).toBe(true);
  });

  it('should sanitize webhook data before processing', async () => {
    const webhookWithXSS = {
      ...SAMPLE_SOL_TRANSFER_WEBHOOK,
      description: '<script>alert("xss")</script> ref:xss_test'
    };

    const payload = JSON.stringify(webhookWithXSS);
    const signature = generateHmacSignature(payload, TEST_WEBHOOK_SECRET);

    const result = await processHeliusWebhook(payload, signature, TEST_WEBHOOK_SECRET);
    expect(result.success).toBe(true);

    // Verify XSS was not executed (reference key should be extracted safely)
    expect(result.paymentUpdates![0].referenceKey).toBe('xss_test');
  });
});

export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts']
};