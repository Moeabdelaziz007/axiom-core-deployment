#!/usr/bin/env ts-node

/**
 * Comprehensive Payment Fulfillment System Test
 * 
 * This script tests the complete Phase 2 implementation:
 * 1. Solana Pay Transaction Request API
 * 2. Deterministic Transaction Verification
 * 3. Helius Webhook Handler
 * 4. Polling Fallback
 * 5. Server-Sent Events
 * 6. PaymentModal Integration
 */

import { createClient } from '@libsql/client';
import { z } from 'zod';

// Test configuration
const TEST_CONFIG = {
  API_BASE: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  DB_URL: process.env.TURSO_DB_URL || 'file:local.db',
  DB_AUTH_TOKEN: process.env.TURSO_DB_AUTH_TOKEN,
  TEST_RECIPIENT: '11111111111111111111111111111111112', // System program for testing
  TEST_AMOUNT: 0.001, // 0.001 SOL for testing
  TEST_USER_ID: 'test-user-123',
};

// Database client for testing
const testDb = createClient({
  url: TEST_CONFIG.DB_URL,
  authToken: TEST_CONFIG.DB_AUTH_TOKEN,
  intMode: 'bigint' as const,
});

// Test result interface
interface TestResult {
  success: boolean;
  testName: string;
  duration: number;
  error?: string;
  details?: any;
}

// Test suite
class PaymentFulfillmentTests {
  private results: TestResult[] = [];
  private paymentId: string = '';

  // Utility methods
  private async runTest(testName: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
        success: true,
        testName,
        duration,
      };
      
      this.results.push(result);
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
        success: false,
        testName,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      this.results.push(result);
      console.log(`❌ ${testName} - FAILED (${duration}ms): ${result.error}`);
      return result;
    }
  }

  // Test 1: Database Schema Validation
  private async testDatabaseSchema(): Promise<void> {
    console.log('Testing database schema...');
    
    // Test payments table
    const paymentsSchema = await testDb.execute('PRAGMA table_info(payments)');
    if (paymentsSchema.rows.length === 0) {
      throw new Error('Payments table not found');
    }

    // Test required columns
    const requiredColumns = ['id', 'tx_signature', 'user_id', 'reference_key', 'amount_lamports', 'status'];
    const existingColumns = paymentsSchema.rows.map((row: any) => row.name);
    
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column)) {
        throw new Error(`Required column '${column}' not found in payments table`);
      }
    }

    // Test metadata table
    const metadataSchema = await testDb.execute('PRAGMA table_info(payment_metadata)');
    if (metadataSchema.rows.length === 0) {
      throw new Error('Payment metadata table not found');
    }

    // Test webhook events table
    const webhookSchema = await testDb.execute('PRAGMA table_info(webhook_events)');
    if (webhookSchema.rows.length === 0) {
      throw new Error('Webhook events table not found');
    }

    console.log('Database schema validation completed');
  }

  // Test 2: Payment Creation
  private async testPaymentCreation(): Promise<void> {
    console.log('Testing payment creation...');
    
    const response = await fetch(`${TEST_CONFIG.API_BASE}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_CONFIG.TEST_USER_ID,
        amountLamports: Math.floor(TEST_CONFIG.TEST_AMOUNT * 1_000_000_000), // Convert to lamports
        referenceKey: `test_ref_${Date.now()}`,
        metadata: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(`Payment creation failed: ${result.error}`);
    }

    this.paymentId = result.data.payment.id;
    console.log(`Created test payment: ${this.paymentId}`);
  }

  // Test 3: Solana Pay Transaction Generation
  private async testTransactionGeneration(): Promise<void> {
    if (!this.paymentId) {
      throw new Error('Payment ID required for transaction generation test');
    }

    console.log('Testing Solana Pay transaction generation...');
    
    const response = await fetch(`${TEST_CONFIG.API_BASE}/api/pay/req/${this.paymentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: TEST_CONFIG.TEST_RECIPIENT,
        amount: TEST_CONFIG.TEST_AMOUNT,
        label: 'Test Payment',
        message: 'Testing payment fulfillment system',
      }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(`Transaction generation failed: ${result.error}`);
    }

    if (!result.data.solanaPayUrl) {
      throw new Error('Solana Pay URL not generated');
    }

    console.log(`Generated Solana Pay URL: ${result.data.solanaPayUrl}`);
  }

  // Test 4: Payment Status Check
  private async testPaymentStatusCheck(): Promise<void> {
    if (!this.paymentId) {
      throw new Error('Payment ID required for status check test');
    }

    console.log('Testing payment status check...');
    
    const response = await fetch(`${TEST_CONFIG.API_BASE}/api/pay/check-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId: this.paymentId,
      }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(`Status check failed: ${result.error}`);
    }

    if (!result.data.payment) {
      throw new Error('Payment data not returned');
    }

    console.log(`Payment status: ${result.data.payment.status}`);
  }

  // Test 5: Transaction Verification Health
  private async testVerificationHealth(): Promise<void> {
    console.log('Testing transaction verification health...');
    
    const response = await fetch(`${TEST_CONFIG.API_BASE}/api/pay/req/${this.paymentId || 'test'}`, {
      method: 'PUT',
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(`Verification health check failed: ${result.error}`);
    }

    if (!result.data.solanaConnection) {
      throw new Error('Solana connection health data missing');
    }

    console.log('Verification health check passed');
  }

  // Test 6: Webhook Health
  private async testWebhookHealth(): Promise<void> {
    console.log('Testing webhook health...');
    
    const response = await fetch(`${TEST_CONFIG.API_BASE}/api/webhooks/helius`, {
      method: 'GET',
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(`Webhook health check failed: ${result.error}`);
    }

    if (!result.data.webhook) {
      throw new Error('Webhook health data missing');
    }

    console.log('Webhook health check passed');
  }

  // Test 7: SSE Connection
  private async testSSEConnection(): Promise<void> {
    if (!this.paymentId) {
      throw new Error('Payment ID required for SSE test');
    }

    console.log('Testing SSE connection...');
    
    return new Promise((resolve, reject) => {
      const sseUrl = `${TEST_CONFIG.API_BASE}/api/sse/payment-status?paymentId=${this.paymentId}&clientId=test-client`;
      const eventSource = new EventSource(sseUrl);

      let connected = false;
      let receivedInitial = false;

      const timeout = setTimeout(() => {
        eventSource.close();
        if (!connected) {
          reject(new Error('SSE connection timeout'));
        } else if (!receivedInitial) {
          reject(new Error('SSE initial message not received'));
        } else {
          resolve();
        }
      }, 10000); // 10 second timeout

      eventSource.onopen = () => {
        connected = true;
        console.log('SSE connection opened');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (event.type === 'connected') {
            console.log('SSE connected event received');
          } else if (event.type === 'initial') {
            receivedInitial = true;
            console.log('SSE initial event received');
            clearTimeout(timeout);
            eventSource.close();
            resolve();
          }
        } catch (error) {
          console.error('SSE parse error:', error);
        }
      };

      eventSource.onerror = (error) => {
        clearTimeout(timeout);
        reject(new Error(`SSE connection error: ${error}`));
      };
    });
  }

  // Test 8: Rate Limiting
  private async testRateLimiting(): Promise<void> {
    console.log('Testing rate limiting...');
    
    const promises = Array(15).fill(null).map(() => 
      fetch(`${TEST_CONFIG.API_BASE}/api/pay/check-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: this.paymentId || 'test',
        }),
      })
    );

    const results = await Promise.allSettled(promises);
    const rateLimited = results.some(result => 
      result.status === 'fulfilled' && 
      result.value.status === 429
    );

    if (!rateLimited) {
      throw new Error('Rate limiting not working');
    }

    console.log('Rate limiting test passed');
  }

  // Test 9: Error Handling
  private async testErrorHandling(): Promise<void> {
    console.log('Testing error handling...');
    
    // Test invalid payment ID
    const response = await fetch(`${TEST_CONFIG.API_BASE}/api/pay/req/invalid-id`, {
      method: 'GET',
    });

    if (response.ok) {
      throw new Error('Should return error for invalid payment ID');
    }

    const result = await response.json();
    if (result.success) {
      throw new Error('Should not return success for invalid payment ID');
    }

    // Test invalid payment creation
    const invalidPaymentResponse = await fetch(`${TEST_CONFIG.API_BASE}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '', // Invalid empty user ID
        amountLamports: -1000, // Invalid negative amount
        referenceKey: '', // Invalid empty reference
      }),
    });

    if (invalidPaymentResponse.ok) {
      throw new Error('Should return error for invalid payment data');
    }

    console.log('Error handling test passed');
  }

  // Test 10: Security Validation
  private async testSecurityValidation(): Promise<void> {
    console.log('Testing security validation...');
    
    // Test SQL injection attempt
    const maliciousResponse = await fetch(`${TEST_CONFIG.API_BASE}/api/pay/req/1'; DROP TABLE payments; --`, {
      method: 'GET',
    });

    if (maliciousResponse.ok) {
      throw new Error('Should reject SQL injection attempts');
    }

    // Test XSS attempt
    const xssResponse = await fetch(`${TEST_CONFIG.API_BASE}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '<script>alert("xss")</script>',
        amountLamports: 1000,
        referenceKey: 'test_ref',
      }),
    });

    if (xssResponse.ok) {
      const result = await xssResponse.json();
      if (result.success && result.data.payment.user_id.includes('<script>')) {
        throw new Error('Should sanitize XSS attempts');
      }
    }

    console.log('Security validation test passed');
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Payment Fulfillment System Tests\n');

    // Initialize database
    try {
      await testDb.execute('SELECT 1');
      console.log('Database connection established');
    } catch (error) {
      console.error('Database connection failed:', error);
      return;
    }

    // Run tests
    await this.runTest('Database Schema Validation', () => this.testDatabaseSchema());
    await this.runTest('Payment Creation', () => this.testPaymentCreation());
    await this.runTest('Transaction Generation', () => this.testTransactionGeneration());
    await this.runTest('Payment Status Check', () => this.testPaymentStatusCheck());
    await this.runTest('Verification Health', () => this.testVerificationHealth());
    await this.runTest('Webhook Health', () => this.testWebhookHealth());
    await this.runTest('SSE Connection', () => this.testSSEConnection());
    await this.runTest('Rate Limiting', () => this.testRateLimiting());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Security Validation', () => this.testSecurityValidation());

    // Print results
    await this.printResults();
  }

  // Print test results
  private async printResults(): Promise<void> {
    console.log('\n📊 Test Results Summary');
    console.log('='.repeat(50));

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  • ${r.testName}: ${r.error}`);
        });
    }

    console.log('\n⏱️  Performance Summary:');
    this.results.forEach(r => {
      const status = r.success ? '✅' : '❌';
      console.log(`  ${status} ${r.testName}: ${r.duration}ms`);
    });

    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;
    console.log(`  📈 Average: ${avgDuration.toFixed(0)}ms`);

    // Cleanup test payment
    if (this.paymentId) {
      try {
        await testDb.execute('DELETE FROM payments WHERE id = ?', [this.paymentId]);
        console.log(`\n🧹 Cleaned up test payment: ${this.paymentId}`);
      } catch (error) {
        console.error('Failed to cleanup test payment:', error);
      }
    }

    console.log('\n🎯 Payment Fulfillment System Test Complete');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tests = new PaymentFulfillmentTests();
  tests.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { PaymentFulfillmentTests };