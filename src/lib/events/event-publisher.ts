import { paymentsDb } from '@/lib/db';
import { insertOutboxEvent, OutboxEvent } from './outbox-processor';

// Event publishing service for transactional outbox pattern
export class EventPublisher {
  private static instance: EventPublisher;

  private constructor() {}

  // Singleton pattern for consistent event publishing
  public static getInstance(): EventPublisher {
    if (!EventPublisher.instance) {
      EventPublisher.instance = new EventPublisher();
    }
    return EventPublisher.instance;
  }

  // Publish payment verified event
  public async publishPaymentVerified(
    paymentId: string,
    referenceKey: string,
    signature: string,
    amount: number,
    destination: string,
    metadata?: any
  ): Promise<void> {
    const eventData: Partial<OutboxEvent> = {
      eventType: 'payment_verified',
      aggregateId: paymentId,
      aggregateType: 'payment',
      eventData: {
        paymentId,
        referenceKey,
        signature,
        amount,
        destination,
        metadata,
        verifiedAt: new Date().toISOString()
      },
      priority: 80, // High priority for payment verification
      maxRetries: 5
    };

    await insertOutboxEvent(eventData);
    console.log(`📤 Published payment verified event: ${paymentId} (${referenceKey})`);
  }

  // Publish payment failed event
  public async publishPaymentFailed(
    paymentId: string,
    referenceKey: string,
    signature: string,
    error: string,
    metadata?: any
  ): Promise<void> {
    const eventData: Partial<OutboxEvent> = {
      eventType: 'payment_failed',
      aggregateId: paymentId,
      aggregateType: 'payment',
      eventData: {
        paymentId,
        referenceKey,
        signature,
        error,
        metadata,
        failedAt: new Date().toISOString()
      },
      priority: 90, // Highest priority for payment failures
      maxRetries: 5
    };

    await insertOutboxEvent(eventData);
    console.log(`📤 Published payment failed event: ${paymentId} (${referenceKey})`);
  }

  // Publish transaction processed event
  public async publishTransactionProcessed(
    signature: string,
    status: 'confirmed' | 'finalized' | 'failed',
    amount?: number,
    destination?: string,
    error?: string,
    metadata?: any
  ): Promise<void> {
    const eventData: Partial<OutboxEvent> = {
      eventType: 'transaction_processed',
      aggregateId: signature,
      aggregateType: 'transaction',
      eventData: {
        signature,
        status,
        amount,
        destination,
        error,
        metadata,
        processedAt: new Date().toISOString()
      },
      priority: 60,
      maxRetries: 3
    };

    await insertOutboxEvent(eventData);
    console.log(`📤 Published transaction processed event: ${signature} (${status})`);
  }

  // Publish webhook received event
  public async publishWebhookReceived(
    webhookData: any,
    signature: string,
    source: string = 'helius'
  ): Promise<void> {
    const eventData: Partial<OutboxEvent> = {
      eventType: 'webhook_received',
      aggregateId: signature,
      aggregateType: 'transaction',
      eventData: {
        webhookData,
        signature,
        source,
        receivedAt: new Date().toISOString()
      },
      priority: 40,
      maxRetries: 2
    };

    await insertOutboxEvent(eventData);
    console.log(`📤 Published webhook received event: ${signature}`);
  }

  // Batch publish multiple events
  public async publishBatch(events: Array<{
    type: 'payment_verified' | 'payment_failed' | 'transaction_processed' | 'webhook_received';
    data: any;
  }>): Promise<void> {
    const promises = events.map(event => {
      switch (event.type) {
        case 'payment_verified':
          return this.publishPaymentVerified(
            event.data.paymentId,
            event.data.referenceKey,
            event.data.signature,
            event.data.amount,
            event.data.destination,
            event.data.metadata
          );
          
        case 'payment_failed':
          return this.publishPaymentFailed(
            event.data.paymentId,
            event.data.referenceKey,
            event.data.signature,
            event.data.error,
            event.data.metadata
          );
          
        case 'transaction_processed':
          return this.publishTransactionProcessed(
            event.data.signature,
            event.data.status,
            event.data.amount,
            event.data.destination,
            event.data.error,
            event.data.metadata
          );
          
        case 'webhook_received':
          return this.publishWebhookReceived(
            event.data.webhookData,
            event.data.signature,
            event.data.source
          );
          
        default:
          console.warn(`Unknown event type: ${event.type}`);
          return Promise.resolve();
      }
    });

    await Promise.all(promises);
    console.log(`📦 Batch published ${events.length} events`);
  }

  // Publish custom event
  public async publishCustomEvent(
    eventType: string,
    aggregateId: string,
    aggregateType: string,
    eventData: any,
    priority: number = 50,
    maxRetries: number = 3,
    correlationId?: string
  ): Promise<void> {
    const event: Partial<OutboxEvent> = {
      eventType,
      aggregateId,
      aggregateType,
      eventData,
      priority,
      maxRetries,
      correlationId
    };

    await insertOutboxEvent(event);
    console.log(`📤 Published custom event: ${eventType} (${aggregateId})`);
  }
}

// Export singleton instance
export const eventPublisher = EventPublisher.getInstance();