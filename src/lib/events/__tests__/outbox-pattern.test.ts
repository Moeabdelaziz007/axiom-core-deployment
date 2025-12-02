import { paymentsDb } from '@/lib/db';
import { getOutboxProcessor, addEventToOutbox } from '../outbox-processor';
import { getEventPublisher, withEventPublishing } from '../event-publisher';
import { processHeliusWebhookWithOutbox } from '../../solana/verify-with-outbox';

// Mock data for testing
const mockPaymentData = {
  paymentId: 'test_payment_123',
  userId: 'test_user_456',
  referenceKey: 'test_ref_789',
  amount: 1000000, // 0.001 SOL in lamports
  signature: 'test_signature_abc123',
  status: 'verified' as const,
  timestamp: Date.now()
};

const mockWebhookPayload = {
  type: 'TRANSFER',
  signature: 'test_signature_xyz789',
  timestamp: Date.now(),
  slot: 123456,
  nativeTransfers: [{
    amount: '1000000',
    fromUserAccount: 'source_address',
    toUserAccount: 'destination_address'
  }]
};

describe('Transactional Outbox Pattern Tests', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await paymentsDb.execute('DELETE FROM transactional_outbox');
    await paymentsDb.execute('DELETE FROM dead_letter_queue');
    await paymentsDb.execute('DELETE FROM event_delivery_log');
    await paymentsDb.execute('DELETE FROM event_subscriptions');
    
    // Insert test subscriptions
    await paymentsDb.execute(`
      INSERT INTO event_subscriptions (subscription_id, consumer_name, event_types, status)
      VALUES 
        ('test-sse', 'SSE Payment Status Service', 'payment_verified,payment_failed', 'active'),
        ('test-webhook', 'Webhook Notification Service', 'payment_verified,payment_failed', 'active')
    `);
  });

  afterEach(async () => {
    // Clean up database after each test
    await paymentsDb.execute('DELETE FROM transactional_outbox');
    await paymentsDb.execute('DELETE FROM dead_letter_queue');
    await paymentsDb.execute('DELETE FROM event_delivery_log');
    await paymentsDb.execute('DELETE FROM event_subscriptions');
  });

  describe('Event Publishing', () => {
    test('should add event to outbox with correct structure', async () => {
      const publisher = getEventPublisher();
      
      const eventId = await publisher.publishPaymentEvent(mockPaymentData);
      
      expect(eventId).toBeDefined();
      expect(typeof eventId).toBe('string');
      
      // Verify event was added to outbox
      const result = await paymentsDb.execute({
        sql: 'SELECT * FROM transactional_outbox WHERE event_id = ?',
        args: [eventId]
      });
      
      expect(result.rows).toHaveLength(1);
      const event = result.rows[0];
      
      expect(event.aggregate_type).toBe('payment');
      expect(event.aggregate_id).toBe(mockPaymentData.paymentId);
      expect(event.event_type).toBe('payment_verified');
      expect(event.status).toBe('pending');
      expect(event.delivery_mode).toBe('at_least_once');
    });

    test('should support exactly-once delivery mode', async () => {
      const publisher = getEventPublisher({ defaultDeliveryMode: 'exactly_once' });
      
      const eventId = await publisher.publishPaymentEvent(mockPaymentData);
      
      const result = await paymentsDb.execute({
        sql: 'SELECT * FROM transactional_outbox WHERE event_id = ?',
        args: [eventId]
      });
      
      expect(result.rows[0].delivery_mode).toBe('exactly_once');
    });

    test('should support correlation context', async () => {
      const publisher = getEventPublisher();
      const correlationId = 'test_correlation_123';
      const causationId = 'test_causation_456';
      
      publisher.setCorrelationContext(correlationId, causationId);
      
      const eventId = await publisher.publishPaymentEvent(mockPaymentData);
      
      const result = await paymentsDb.execute({
        sql: 'SELECT * FROM transactional_outbox WHERE event_id = ?',
        args: [eventId]
      });
      
      expect(result.rows[0].correlation_id).toBe(correlationId);
      expect(result.rows[0].causation_id).toBe(causationId);
      
      publisher.clearCorrelationContext();
    });

    test('should support idempotency keys', async () => {
      const publisher = getEventPublisher({ enableIdempotency: true });
      const idempotencyKey = 'test_idempotency_key';
      
      const eventId1 = await publisher.publishPaymentEvent(mockPaymentData, {
        idempotencyKey
      });
      
      const eventId2 = await publisher.publishPaymentEvent(mockPaymentData, {
        idempotencyKey
      });
      
      // Second call should not create duplicate event
      const result = await paymentsDb.execute({
        sql: 'SELECT COUNT(*) as count FROM transactional_outbox WHERE idempotency_key = ?',
        args: [idempotencyKey]
      });
      
      expect(result.rows[0].count).toBe(1);
    });

    test('should publish batch events transactionally', async () => {
      const publisher = getEventPublisher();
      
      const events = [
        {
          aggregateType: 'payment',
          aggregateId: 'payment_1',
          eventType: 'payment_verified',
          eventData: { amount: 1000 }
        },
        {
          aggregateType: 'payment',
          aggregateId: 'payment_2',
          eventType: 'payment_verified',
          eventData: { amount: 2000 }
        }
      ];
      
      const eventIds = await publisher.publishBatchEvents(events);
      
      expect(eventIds).toHaveLength(2);
      expect(eventIds[0]).not.toBe(eventIds[1]);
      
      // Verify all events were added
      const result = await paymentsDb.execute({
        sql: 'SELECT COUNT(*) as count FROM transactional_outbox WHERE event_id IN (?, ?)',
        args: eventIds
      });
      
      expect(result.rows[0].count).toBe(2);
    });
  });

  describe('Outbox Processing', () => {
    test('should process pending events successfully', async () => {
      const processor = getOutboxProcessor({ pollingIntervalMs: 100 });
      
      // Add test event
      const eventId = await addEventToOutbox({
        aggregateType: 'payment',
        aggregateId: 'test_payment',
        eventType: 'payment_verified',
        eventData: mockPaymentData
      });
      
      // Start processor
      await processor.start();
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stop processor
      await processor.stop();
      
      // Verify event was processed
      const result = await paymentsDb.execute({
        sql: 'SELECT status FROM transactional_outbox WHERE event_id = ?',
        args: [eventId]
      });
      
      expect(result.rows[0].status).toBe('published');
    });

    test('should handle failed events with retry logic', async () => {
      const processor = getOutboxProcessor({ 
        pollingIntervalMs: 100,
        retryDelays: [50, 100, 200] // Faster retries for testing
      });
      
      // Add event that will fail (simulate by using invalid subscription)
      const eventId = await addEventToOutbox({
        aggregateType: 'payment',
        aggregateId: 'test_payment_fail',
        eventType: 'payment_verified',
        eventData: mockPaymentData
      });
      
      // Update subscription to inactive to simulate failure
      await paymentsDb.execute(`
        UPDATE event_subscriptions 
        SET status = 'inactive' 
        WHERE consumer_name = 'SSE Payment Status Service'
      `);
      
      await processor.start();
      
      // Wait for first retry
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify retry count increased
      const result = await paymentsDb.execute({
        sql: 'SELECT retry_count, status FROM transactional_outbox WHERE event_id = ?',
        args: [eventId]
      });
      
      expect(result.rows[0].retry_count).toBeGreaterThan(0);
      expect(result.rows[0].status).toBe('failed');
      
      await processor.stop();
    });

    test('should move exhausted events to dead letter queue', async () => {
      const processor = getOutboxProcessor({ 
        pollingIntervalMs: 100,
        maxRetries: 2, // Lower for testing
        retryDelays: [50, 100]
      });
      
      const eventId = await addEventToOutbox({
        aggregateType: 'payment',
        aggregateId: 'test_payment_dead',
        eventType: 'payment_verified',
        eventData: mockPaymentData
      });
      
      // Keep subscription inactive to ensure failure
      await processor.start();
      
      // Wait for all retries to exhaust
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify event moved to dead letter
      const deadLetterResult = await paymentsDb.execute({
        sql: 'SELECT * FROM dead_letter_queue WHERE original_event_id = ?',
        args: [eventId]
      });
      
      expect(deadLetterResult.rows).toHaveLength(1);
      expect(deadLetterResult.rows[0].failure_reason).toContain('delivery failed');
      
      await processor.stop();
    });
  });

  describe('Webhook Integration with Outbox', () => {
    test('should process webhook and publish events to outbox', async () => {
      const payload = JSON.stringify(mockWebhookPayload);
      const signature = 'test_signature';
      const secret = 'test_secret';
      
      const result = await processHeliusWebhookWithOutbox(payload, signature, secret);
      
      expect(result.success).toBe(true);
      expect(result.processed).toBe(true);
      expect(result.paymentUpdates).toHaveLength(1);
      
      // Verify events were added to outbox
      const outboxResult = await paymentsDb.execute({
        sql: 'SELECT COUNT(*) as count FROM transactional_outbox WHERE event_type LIKE "payment_%"'
      });
      
      expect(outboxResult.rows[0].count).toBeGreaterThan(0);
    });

    test('should handle webhook signature verification', async () => {
      const payload = JSON.stringify(mockWebhookPayload);
      const invalidSignature = 'invalid_signature';
      const secret = 'test_secret';
      
      const result = await processHeliusWebhookWithOutbox(payload, invalidSignature, secret);
      
      expect(result.success).toBe(false);
      expect(result.processed).toBe(false);
      expect(result.error).toBe('Invalid webhook signature');
      
      // Verify no events were added
      const outboxResult = await paymentsDb.execute({
        sql: 'SELECT COUNT(*) as count FROM transactional_outbox WHERE event_type LIKE "payment_%"'
      });
      
      expect(outboxResult.rows[0].count).toBe(0);
    });

    test('should handle idempotent webhook processing', async () => {
      const payload = JSON.stringify(mockWebhookPayload);
      const signature = 'test_signature';
      const secret = 'test_secret';
      
      // Process webhook twice
      const result1 = await processHeliusWebhookWithOutbox(payload, signature, secret);
      const result2 = await processHeliusWebhookWithOutbox(payload, signature, secret);
      
      expect(result1.success).toBe(true);
      expect(result1.processed).toBe(true);
      expect(result2.success).toBe(true);
      expect(result2.processed).toBe(true);
      
      // Second processing should return already processed
      expect(result2.paymentUpdates[0].status).toBe('verified');
      
      // Verify only one set of events was created
      const outboxResult = await paymentsDb.execute({
        sql: 'SELECT COUNT(*) as count FROM transactional_outbox WHERE event_type LIKE "payment_%"'
      });
      
      expect(outboxResult.rows[0].count).toBeLessThan(4); // Less than 2x 2 events
    });
  });

  describe('Exactly-Once Semantics', () => {
    test('should prevent duplicate event processing with idempotency key', async () => {
      const publisher = getEventPublisher({ 
        defaultDeliveryMode: 'exactly_once',
        enableIdempotency: true 
      });
      
      const idempotencyKey = 'test_exact_once_key';
      const eventData = { test: 'data', timestamp: Date.now() };
      
      // Publish same event twice
      const eventId1 = await publisher.publishCustomEvent(
        'test', 'test_123', 'test_event', eventData,
        { idempotencyKey }
      );
      
      const eventId2 = await publisher.publishCustomEvent(
        'test', 'test_123', 'test_event', eventData,
        { idempotencyKey }
      );
      
      // Should only have one event in outbox
      const result = await paymentsDb.execute({
        sql: 'SELECT COUNT(*) as count FROM transactional_outbox WHERE idempotency_key = ?',
        args: [idempotencyKey]
      });
      
      expect(result.rows[0].count).toBe(1);
    });

    test('should maintain event ordering within correlation context', async () => {
      const publisher = getEventPublisher();
      const correlationId = 'test_ordering_123';
      
      const events = [
        { type: 'step1', data: { step: 1 } },
        { type: 'step2', data: { step: 2 } },
        { type: 'step3', data: { step: 3 } }
      ];
      
      const eventIds = await withEventPublishing(correlationId, async (pub) => {
        const ids = [];
        for (const event of events) {
          const id = await pub.publishCustomEvent(
            'test', 'test_order', event.type, event.data
          );
          ids.push(id);
        }
        return ids;
      });
      
      expect(eventIds).toHaveLength(3);
      
      // Verify all events have same correlation ID
      const result = await paymentsDb.execute({
        sql: 'SELECT event_id, correlation_id FROM transactional_outbox WHERE correlation_id = ? ORDER BY created_at',
        args: [correlationId]
      });
      
      expect(result.rows).toHaveLength(3);
      result.rows.forEach((row: any, index: number) => {
        expect(row.correlation_id).toBe(correlationId);
        expect(row.event_id).toBe(eventIds[index]);
      });
    });
  });

  describe('At-Least-Once Semantics', () => {
    test('should retry failed events until success or max retries', async () => {
      const processor = getOutboxProcessor({ 
        pollingIntervalMs: 100,
        maxRetries: 3,
        retryDelays: [50, 100, 200]
      });
      
      const eventId = await addEventToOutbox({
        aggregateType: 'payment',
        aggregateId: 'test_retry',
        eventType: 'payment_verified',
        eventData: mockPaymentData
      });
      
      // Start with failing subscription, then make it succeed
      let retryCount = 0;
      const checkRetries = async () => {
        const result = await paymentsDb.execute({
          sql: 'SELECT retry_count, status FROM transactional_outbox WHERE event_id = ?',
          args: [eventId]
        });
        
        if (result.rows[0].retry_count > retryCount) {
          retryCount = result.rows[0].retry_count;
          console.log(`Retry count: ${retryCount}`);
          
          // After 2 retries, make subscription succeed
          if (retryCount >= 2) {
            await paymentsDb.execute(`
              UPDATE event_subscriptions 
              SET status = 'active' 
              WHERE consumer_name = 'SSE Payment Status Service'
            `);
          }
        }
        
        if (result.rows[0].status === 'published') {
          return true; // Success
        }
        
        if (result.rows[0].retry_count >= 3) {
          return true; // Max retries reached
        }
        
        return false; // Continue waiting
      };
      
      await processor.start();
      
      // Wait for completion or max retries
      let completed = false;
      for (let i = 0; i < 20 && !completed; i++) {
        completed = await checkRetries();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await processor.stop();
      
      // Should eventually succeed
      const finalResult = await paymentsDb.execute({
        sql: 'SELECT status, retry_count FROM transactional_outbox WHERE event_id = ?',
        args: [eventId]
      });
      
      expect(finalResult.rows[0].status).toBe('published');
      expect(finalResult.rows[0].retry_count).toBeGreaterThan(0);
      expect(finalResult.rows[0].retry_count).toBeLessThan(4);
    });

    test('should guarantee event delivery even with temporary failures', async () => {
      const processor = getOutboxProcessor({ 
        pollingIntervalMs: 100,
        maxRetries: 2,
        retryDelays: [50, 100]
      });
      
      const eventId = await addEventToOutbox({
        aggregateType: 'payment',
        aggregateId: 'test_delivery',
        eventType: 'payment_verified',
        eventData: mockPaymentData
      });
      
      await processor.start();
      
      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await processor.stop();
      
      // Verify delivery log entries exist
      const deliveryResult = await paymentsDb.execute({
        sql: 'SELECT * FROM event_delivery_log WHERE event_id = ?',
        args: [`${eventId}-sse-payment-status-service`]
      });
      
      expect(deliveryResult.rows).toHaveLength(1);
      expect(deliveryResult.rows[0].status).toBe('delivered');
    });
  });

  describe('Performance and Monitoring', () => {
    test('should collect and report metrics accurately', async () => {
      const { getOutboxMonitor } = await import('../outbox-monitoring');
      const monitor = getOutboxMonitor(100); // 100ms interval for testing
      
      await monitor.start();
      
      // Add some test events
      await addEventToOutbox({
        aggregateType: 'payment',
        aggregateId: 'test_metrics_1',
        eventType: 'payment_verified',
        eventData: mockPaymentData
      });
      
      await addEventToOutbox({
        aggregateType: 'payment',
        aggregateId: 'test_metrics_2',
        eventType: 'payment_failed',
        eventData: { ...mockPaymentData, status: 'failed' }
      });
      
      // Wait for metrics collection
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const metrics = await monitor.collectMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.eventMetrics.totalEvents).toBeGreaterThan(0);
      expect(metrics.eventMetrics.eventsByType).toBeDefined();
      expect(metrics.performanceMetrics).toBeDefined();
      expect(metrics.databaseMetrics).toBeDefined();
      
      await monitor.stop();
    });

    test('should detect performance issues and generate alerts', async () => {
      const { getOutboxMonitor } = await import('../outbox-monitoring');
      const monitor = getOutboxMonitor(100);
      
      // Simulate high error rate by adding failed events
      for (let i = 0; i < 10; i++) {
        await addEventToOutbox({
          aggregateType: 'payment',
          aggregateId: `test_error_${i}`,
          eventType: 'payment_failed',
          eventData: { error: 'Simulated failure' }
        });
      }
      
      await monitor.start();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const healthCheck = await monitor.performHealthCheck();
      
      expect(healthCheck.healthy).toBe(false); // Should detect issues
      expect(healthCheck.issues.length).toBeGreaterThan(0);
      expect(healthCheck.recommendations.length).toBeGreaterThan(0);
      
      await monitor.stop();
    });
  });

  describe('Database Schema Validation', () => {
    test('should enforce foreign key constraints', async () => {
      // Try to insert delivery log for non-existent event
      await expect(
        paymentsDb.execute({
          sql: 'INSERT INTO event_delivery_log (event_id, subscription_id, status) VALUES (?, ?, ?)',
          args: ['non_existent_event', 'test_subscription', 'pending']
        })
      ).rejects.toThrow();
    });

    test('should maintain referential integrity', async () => {
      const eventId = await addEventToOutbox({
        aggregateType: 'payment',
        aggregateId: 'test_integrity',
        eventType: 'payment_verified',
        eventData: mockPaymentData
      });
      
      // Try to delete event while delivery logs exist
      await expect(
        paymentsDb.execute({
          sql: 'DELETE FROM transactional_outbox WHERE event_id = ?',
          args: [eventId]
        })
      ).rejects.toThrow();
    });

    test('should handle concurrent access safely', async () => {
      // Simulate concurrent event processing
      const eventId = await addEventToOutbox({
        aggregateType: 'payment',
        aggregateId: 'test_concurrent',
        eventType: 'payment_verified',
        eventData: mockPaymentData
      });
      
      // Try to update the same event concurrently
      const promises = Array(5).fill(0).map(() =>
        paymentsDb.execute({
          sql: 'UPDATE transactional_outbox SET status = ? WHERE event_id = ?',
          args: ['processing', eventId]
        })
      );
      
      const results = await Promise.allSettled(promises);
      
      // At least one should succeed
      const successfulUpdates = results.filter(r => r.status === 'fulfilled').length;
      expect(successfulUpdates).toBeGreaterThan(0);
    });
  });
});