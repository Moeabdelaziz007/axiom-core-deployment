import { createClient } from '@libsql/client';

// Database client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Event types for payment processing
export interface PaymentVerifiedEvent {
  paymentId: string;
  referenceKey: string;
  signature: string;
  amount: number;
  destination: string;
  metadata?: any;
}

export interface PaymentProvisionedEvent {
  paymentId: string;
  referenceKey: string;
  agentId: string;
  walletAddress: string;
  metadata?: any;
}

export interface PaymentFailedEvent {
  paymentId: string;
  referenceKey: string;
  reason: string;
  metadata?: any;
}

// Event Publisher class for transactional outbox pattern
export class EventPublisher {
  private db: any;

  constructor(databaseClient: any) {
    this.db = databaseClient;
  }

  // Publish payment verified event
  async publishPaymentVerified(
    paymentId: string,
    referenceKey: string,
    signature: string,
    amount: number,
    destination: string,
    metadata?: any
  ): Promise<void> {
    try {
      const eventData: PaymentVerifiedEvent = {
        paymentId,
        referenceKey,
        signature,
        amount,
        destination,
        metadata
      };

      await this.publishEvent('PAYMENT_VERIFIED', paymentId, 'payment', eventData);
      console.log(`📤 Published PAYMENT_VERIFIED event: ${referenceKey}`);
    } catch (error) {
      console.error('Failed to publish PAYMENT_VERIFIED event:', error);
      throw error;
    }
  }

  // Publish payment provisioned event
  async publishPaymentProvisioned(
    paymentId: string,
    referenceKey: string,
    agentId: string,
    walletAddress: string,
    metadata?: any
  ): Promise<void> {
    try {
      const eventData: PaymentProvisionedEvent = {
        paymentId,
        referenceKey,
        agentId,
        walletAddress,
        metadata
      };

      await this.publishEvent('PAYMENT_PROVISIONED', paymentId, 'payment', eventData);
      console.log(`📤 Published PAYMENT_PROVISIONED event: ${referenceKey} -> ${agentId}`);
    } catch (error) {
      console.error('Failed to publish PAYMENT_PROVISIONED event:', error);
      throw error;
    }
  }

  // Publish payment failed event
  async publishPaymentFailed(
    paymentId: string,
    referenceKey: string,
    reason: string,
    metadata?: any
  ): Promise<void> {
    try {
      const eventData: PaymentFailedEvent = {
        paymentId,
        referenceKey,
        reason,
        metadata
      };

      await this.publishEvent('PAYMENT_FAILED', paymentId, 'payment', eventData);
      console.log(`📤 Published PAYMENT_FAILED event: ${referenceKey} - ${reason}`);
    } catch (error) {
      console.error('Failed to publish PAYMENT_FAILED event:', error);
      throw error;
    }
  }

  // Generic event publisher
  private async publishEvent(
    eventType: string,
    aggregateId: string,
    aggregateType: string,
    eventData: any
  ): Promise<void> {
    const eventId = `${eventType}_${aggregateId}_${Date.now()}`;
    const now = Date.now();

    try {
      await this.db.execute({
        sql: `
          INSERT INTO transactional_outbox (
            event_id,
            event_type,
            aggregate_id,
            aggregate_type,
            event_data,
            status,
            priority,
            retry_count,
            max_retries,
            created_at,
            scheduled_at,
            idempotency_key
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          eventId,
          eventType,
          aggregateId,
          aggregateType,
          JSON.stringify(eventData),
          'pending',
          0, // priority
          0, // retry_count
          3, // max_retries
          now, // created_at
          now, // scheduled_at
          `${eventType}_${aggregateId}` // idempotency_key
        ]
      });
    } catch (error) {
      console.error(`Failed to insert event ${eventId} into outbox:`, error);
      throw error;
    }
  }
}