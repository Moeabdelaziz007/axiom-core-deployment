import { paymentsDb } from '@/lib/db';
import crypto from 'crypto';

// Event types for transactional outbox
export interface OutboxEvent {
  id?: number;
  eventId: string;
  eventType: 'payment_verified' | 'payment_failed' | 'transaction_processed' | 'webhook_received';
  aggregateId: string;
  aggregateType: 'payment' | 'transaction';
  eventData: any;
  eventVersion: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  scheduledAt?: number;
  processedAt?: number;
  nextRetryAt?: number;
  idempotencyKey: string;
  correlationId?: string;
  sourceService: string;
  tenantId: string;
  errorMessage?: string;
  errorDetails?: string;
}

// Processing metrics
export interface OutboxMetrics {
  eventType: string;
  tenantId: string;
  processedCount: number;
  failedCount: number;
  avgProcessingTimeMs: number;
  lastProcessedAt: number;
}

// Retry configuration
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // 1s, 2s, 4s, 8s, 16s
const MAX_RETRIES = 3;
const DEFAULT_PRIORITY = 50;
const EVENT_TIMEOUT = 30000; // 30 seconds

// Generate unique event ID
function generateEventId(): string {
  return `evt_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
}

// Generate idempotency key for events
function generateIdempotencyKey(eventData: any): string {
  const keyData = {
    aggregateId: eventData.aggregateId || eventData.signature,
    eventType: eventData.eventType,
    eventData: JSON.stringify(eventData)
  };
  return crypto.createHash('sha256').update(JSON.stringify(keyData)).digest('hex');
}

// Insert event into outbox
export async function insertOutboxEvent(
  eventData: Partial<OutboxEvent>
): Promise<number> {
  try {
    const eventId = eventData.eventId || generateEventId();
    const idempotencyKey = eventData.idempotencyKey || generateIdempotencyKey(eventData);
    const now = Math.floor(Date.now() / 1000);
    
    const result = await paymentsDb.execute({
      sql: `
        INSERT INTO transactional_outbox (
          event_id, event_type, aggregate_id, aggregate_type,
          event_data, event_version, status, priority,
          retry_count, max_retries, created_at, scheduled_at,
          idempotency_key, correlation_id, source_service, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        eventId,
        eventData.eventType,
        eventData.aggregateId,
        eventData.aggregateType,
        JSON.stringify(eventData.eventData),
        eventData.eventVersion || 1,
        eventData.status || 'pending',
        eventData.priority || DEFAULT_PRIORITY,
        0, // retry_count
        eventData.maxRetries || MAX_RETRIES,
        now, // created_at
        eventData.scheduledAt ? Math.floor(eventData.scheduledAt / 1000) : now, // scheduled_at
        idempotencyKey,
        eventData.correlationId,
        eventData.sourceService || 'helius',
        eventData.tenantId || 'default'
      ]
    });

    const outboxId = result.lastInsertRowid?.toString();
    console.log(`📤 Outbox event inserted: ${eventId} (${eventData.eventType}) - ID: ${outboxId}`);
    
    return parseInt(outboxId || '0');
  } catch (error) {
    console.error('Failed to insert outbox event:', error);
    throw error;
  }
}

// Get pending events from outbox
export async function getPendingOutboxEvents(
  limit: number = 100,
  eventType?: string
): Promise<OutboxEvent[]> {
  try {
    const whereClause = eventType ? 'WHERE status = ? AND event_type = ?' : 'WHERE status = ?';
    const args = eventType ? ['pending', eventType] : ['pending'];
    
    const result = await paymentsDb.execute({
      sql: `
        SELECT * FROM transactional_outbox
        ${whereClause}
        ORDER BY priority DESC, created_at ASC
        LIMIT ?
      `,
      args: [...args, limit]
    });

    return result.rows as OutboxEvent[];
  } catch (error) {
    console.error('Failed to get pending outbox events:', error);
    throw error;
  }
}

// Update outbox event status
export async function updateOutboxEventStatus(
  eventId: number,
  status: OutboxEvent['status'],
  errorMessage?: string,
  errorDetails?: string,
  nextRetryAt?: number
): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    await paymentsDb.execute({
      sql: `
        UPDATE transactional_outbox
        SET status = ?, processed_at = ?, error_message = ?, error_details = ?, next_retry_at = ?
        WHERE id = ?
      `,
      args: [
        status,
        now,
        errorMessage || null,
        errorDetails || null,
        nextRetryAt || null,
        eventId
      ]
    });

    console.log(`📤 Outbox event updated: ${eventId} -> ${status}`);
  } catch (error) {
    console.error('Failed to update outbox event status:', error);
    throw error;
  }
}

// Increment retry count for event
export async function incrementOutboxRetry(eventId: number): Promise<void> {
  try {
    await paymentsDb.execute({
      sql: `
        UPDATE transactional_outbox
        SET retry_count = retry_count + 1
        WHERE id = ?
      `,
      args: [eventId]
    });
  } catch (error) {
    console.error('Failed to increment outbox retry count:', error);
    throw error;
  }
}

// Move failed event to dead letter queue
export async function moveToDeadLetterQueue(
  eventId: number,
  failureReason: string,
  errorDetails?: string
): Promise<void> {
  try {
    // Get original event
    const originalEvent = await paymentsDb.execute({
      sql: 'SELECT * FROM transactional_outbox WHERE id = ?',
      args: [eventId]
    });

    if (originalEvent.rows.length === 0) {
      throw new Error(`Event ${eventId} not found for dead letter queue`);
    }

    const event = originalEvent.rows[0] as OutboxEvent;
    const now = Math.floor(Date.now() / 1000);

    // Insert into dead letter queue
    await paymentsDb.execute({
      sql: `
        INSERT INTO transactional_dead_letter (
          outbox_id, event_id, event_type, event_data,
          failure_reason, error_details, retry_count, failed_at, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        eventId,
        event.eventId,
        event.eventType,
        event.eventData,
        failureReason,
        errorDetails || null,
        event.retryCount,
        now,
        event.tenantId
      ]
    });

    // Remove from outbox
    await paymentsDb.execute({
      sql: 'DELETE FROM transactional_outbox WHERE id = ?',
      args: [eventId]
    });

    console.log(`💀 Event moved to dead letter queue: ${eventId} - ${failureReason}`);
  } catch (error) {
    console.error('Failed to move event to dead letter queue:', error);
    throw error;
  }
}

// Calculate retry delay with exponential backoff
function calculateRetryDelay(retryCount: number): number {
  if (retryCount >= RETRY_DELAYS.length) {
    return RETRY_DELAYS[RETRY_DELAYS.length - 1];
  }
  return RETRY_DELAYS[retryCount] || 16000;
}

// Process outbox events with retry logic
export async function processOutboxEvents(): Promise<{
  processed: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    processed: 0,
    failed: 0,
    errors: [] as string[]
  };

  try {
    const pendingEvents = await getPendingOutboxEvents(50);
    console.log(`🔄 Processing ${pendingEvents.length} outbox events`);

    for (const event of pendingEvents) {
      const startTime = Date.now();
      
      try {
        // Update status to processing
        await updateOutboxEventStatus(event.id!, 'processing');

        // Process event based on type
        await processEventByType(event);

        // Mark as completed
        await updateOutboxEventStatus(event.id!, 'completed');
        
        results.processed++;
        console.log(`✅ Event processed: ${event.eventId} (${event.eventType})`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${event.eventId}: ${errorMessage}`);
        
        // Check if should retry
        if (event.retryCount < event.maxRetries) {
          const retryDelay = calculateRetryDelay(event.retryCount);
          const nextRetryAt = Date.now() + retryDelay;
          
          await incrementOutboxRetry(event.id!);
          await updateOutboxEventStatus(
            event.id!, 
            'pending', 
            errorMessage, 
            error instanceof Error ? error.stack : undefined,
            Math.floor(nextRetryAt / 1000)
          );
          
          console.log(`🔄 Event scheduled for retry: ${event.eventId} in ${retryDelay}ms`);
        } else {
          // Move to dead letter queue
          await moveToDeadLetterQueue(
            event.id!, 
            `Max retries exceeded: ${errorMessage}`,
            error instanceof Error ? error.stack : undefined
          );
          
          results.failed++;
          console.log(`💀 Event failed permanently: ${event.eventId}`);
        }
      }
    }

    // Update processing metrics
    await updateOutboxMetrics(results);

    return results;
  } catch (error) {
    console.error('Outbox processing error:', error);
    results.errors.push(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
}

// Process specific event types
async function processEventByType(event: OutboxEvent): Promise<void> {
  const eventData = JSON.parse(event.eventData);
  
  switch (event.eventType) {
    case 'payment_verified':
      await processPaymentVerifiedEvent(eventData);
      break;
      
    case 'payment_failed':
      await processPaymentFailedEvent(eventData);
      break;
      
    case 'webhook_received':
      await processWebhookReceivedEvent(eventData);
      break;
      
    default:
      console.log(`Unknown event type: ${event.eventType}`);
      break;
  }
}

// Process payment verified events
async function processPaymentVerifiedEvent(eventData: any): Promise<void> {
  try {
    // Update payment status to verified
    await paymentsDb.execute({
      sql: `
        UPDATE payments
        SET status = 'verified', finalized_at = strftime('%s', 'now')
        WHERE reference_key = ? OR tx_signature = ?
      `,
      args: [eventData.referenceKey, eventData.signature]
    });

    // Trigger SSE update
    const { simulatePaymentUpdate } = await import('@/app/api/sse/payment-status/route');
    await simulatePaymentUpdate(eventData.paymentId, 'verified', {
      amount: eventData.amount,
      signature: eventData.signature,
      metadata: eventData.metadata
    });

    console.log(`💳 Payment verified event processed: ${eventData.referenceKey}`);
  } catch (error) {
    console.error('Failed to process payment verified event:', error);
    throw error;
  }
}

// Process payment failed events
async function processPaymentFailedEvent(eventData: any): Promise<void> {
  try {
    // Update payment status to failed
    await paymentsDb.execute({
      sql: `
        UPDATE payments
        SET status = 'failed', finalized_at = strftime('%s', 'now')
        WHERE reference_key = ? OR tx_signature = ?
      `,
      args: [eventData.referenceKey, eventData.signature]
    });

    // Trigger SSE update
    const { simulatePaymentUpdate } = await import('@/app/api/sse/payment-status/route');
    await simulatePaymentUpdate(eventData.paymentId, 'failed', {
      error: eventData.error,
      signature: eventData.signature
    });

    console.log(`❌ Payment failed event processed: ${eventData.referenceKey}`);
  } catch (error) {
    console.error('Failed to process payment failed event:', error);
    throw error;
  }
}

// Process webhook received events
async function processWebhookReceivedEvent(eventData: any): Promise<void> {
  console.log(`🪝 Webhook received event processed: ${eventData.signature}`);
  // This is mainly for logging and monitoring
}

// Update outbox processing metrics
async function updateOutboxMetrics(results: { processed: number; failed: number }): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // Get current metrics for payment events
    const currentMetrics = await paymentsDb.execute({
      sql: `
        SELECT * FROM outbox_processing_metrics
        WHERE event_type IN ('payment_verified', 'payment_failed') AND tenant_id = 'default'
        ORDER BY recorded_at DESC LIMIT 1
      `
    });

    const metrics = currentMetrics.rows[0] as OutboxMetrics || {
      eventType: 'payment_events',
      tenantId: 'default',
      processedCount: 0,
      failedCount: 0,
      avgProcessingTimeMs: 0,
      lastProcessedAt: now
    };

    // Update metrics
    const newProcessedCount = (metrics.processedCount || 0) + results.processed;
    const newFailedCount = (metrics.failedCount || 0) + results.failed;
    
    await paymentsDb.execute({
      sql: `
        INSERT OR REPLACE INTO outbox_processing_metrics (
          event_type, tenant_id, processed_count, failed_count,
          avg_processing_time_ms, last_processed_at, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        metrics.eventType,
        metrics.tenantId,
        newProcessedCount,
        newFailedCount,
        metrics.avgProcessingTimeMs,
        now,
        now
      ]
    });

    console.log(`📊 Outbox metrics updated: ${newProcessedCount} processed, ${newFailedCount} failed`);
  } catch (error) {
    console.error('Failed to update outbox metrics:', error);
  }
}

// Get outbox metrics for monitoring
export async function getOutboxMetrics(
  eventType?: string,
  tenantId: string = 'default'
): Promise<OutboxMetrics[]> {
  try {
    const whereClause = eventType ? 'WHERE event_type = ? AND tenant_id = ?' : 'WHERE tenant_id = ?';
    const args = eventType ? [eventType, tenantId] : [tenantId];
    
    const result = await paymentsDb.execute({
      sql: `
        SELECT * FROM outbox_processing_metrics
        ${whereClause}
        ORDER BY recorded_at DESC
        LIMIT 10
      `,
      args: args
    });

    return result.rows as OutboxMetrics[];
  } catch (error) {
    console.error('Failed to get outbox metrics:', error);
    throw error;
  }
}

// Cleanup old processed events
export async function cleanupOldOutboxEvents(daysOld: number = 7): Promise<void> {
  try {
    const cutoffTime = Math.floor((Date.now() - (daysOld * 24 * 60 * 60 * 1000)) / 1000);
    
    await paymentsDb.execute({
      sql: `
        DELETE FROM transactional_outbox
        WHERE status = 'completed' AND processed_at < ?
      `,
      args: [cutoffTime]
    });

    await paymentsDb.execute({
      sql: `
        DELETE FROM transactional_dead_letter
        WHERE failed_at < ?
      `,
      args: [cutoffTime]
    });

    console.log(`🧹 Cleaned up outbox events older than ${daysOld} days`);
  } catch (error) {
    console.error('Failed to cleanup old outbox events:', error);
    throw error;
  }
}