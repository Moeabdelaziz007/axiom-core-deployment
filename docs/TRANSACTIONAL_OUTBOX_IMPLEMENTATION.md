# Transactional Outbox Pattern Implementation

This document describes the implementation of the Transactional Outbox Pattern for Event-Driven Architecture (EDA) compliance in the Axiom payment system.

## Overview

The Transactional Outbox Pattern ensures reliable event delivery with exactly-once and at-least-once semantics for distributed systems. This implementation provides:

- **Exactly-once semantics**: Prevents duplicate event processing using idempotency keys
- **At-least-once delivery**: Ensures events are eventually delivered through retry mechanisms
- **Event ordering**: Maintains causal relationships between events
- **Monitoring**: Comprehensive metrics and health checking
- **Dead letter queue**: Handles failed events for manual intervention

## Architecture

```
┌─────────────────┐
│   Webhook      │
│   Handler       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Event        │    │   Outbox         │    │   Outbox       │
│   Publisher    │───▶│   Processor       │───▶│   Processor      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
          │                                   │
          ▼                                   ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Event        │    │   Event          │    │   Event          │
│   Subscribers  │    │   Delivery       │    │   Delivery       │
│   (SSE,        │    │   Log            │    │   Log            │
│    Webhooks)    │    │                 │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. Database Schema (`schema/transactional_outbox.sql`)

**Core Tables:**
- `transactional_outbox`: Main event storage with retry logic
- `dead_letter_queue`: Failed events for manual intervention
- `event_subscriptions`: Consumer configuration and routing
- `event_delivery_log`: Delivery tracking and idempotency

**Key Features:**
- Partitioned by aggregate ID for performance
- Comprehensive indexing for efficient queries
- Foreign key constraints for data integrity
- Automated cleanup procedures

### 2. Outbox Processor (`src/lib/events/outbox-processor.ts`)

**Core Class:** `OutboxProcessor`

**Features:**
- Configurable batch processing (default: 50 events/batch)
- Exponential backoff retry (1s, 2s, 4s, 8s, 16s)
- Concurrent batch processing (default: 3 batches)
- Event ordering guarantees
- Subscription-based delivery
- Dead letter queue handling
- Health monitoring

**Configuration:**
```typescript
const config: OutboxProcessorConfig = {
  batchSize: 50,
  pollingIntervalMs: 5000,
  maxConcurrentBatches: 3,
  retryDelays: [1000, 2000, 4000, 8000, 16000],
  deadLetterRetentionDays: 30,
  metricsEnabled: true
};
```

### 3. Event Publisher (`src/lib/events/event-publisher.ts`)

**Core Class:** `EventPublisher`

**Features:**
- Transactional event publishing
- Idempotency key generation
- Correlation and causation tracking
- Batch event publishing
- Domain-specific event helpers
- Type-safe event interfaces

**Usage:**
```typescript
// Simple event publishing
const publisher = getEventPublisher();
await publisher.publishPaymentVerified(paymentId, userId, referenceKey, amount, signature);

// With correlation context
await withEventPublishing(correlationId, async (publisher) => {
  await publisher.publishPaymentEvent(event);
});

// Batch publishing
const events = [/* event data */];
await publisher.publishBatchEvents(events);
```

### 4. Enhanced Webhook Handler (`src/lib/solana/verify-with-outbox.ts`)

**Key Functions:**
- `processHeliusWebhookWithOutbox()`: Webhook processing with outbox integration
- `updatePaymentStatusWithOutbox()`: Payment updates with event publishing
- Transaction verification with event publishing

**Integration Points:**
- Helius webhook processing
- Solana transaction verification
- Payment status updates
- Event publishing for all state changes

### 5. Monitoring System (`src/lib/events/outbox-monitoring.ts`)

**Core Class:** `OutboxMonitor`

**Metrics Collected:**
- Event processing metrics (throughput, latency, error rates)
- Database performance (connection health, query performance)
- Subscription delivery rates
- Dead letter queue statistics
- System resource usage

**Health Checks:**
- Database connectivity
- Outbox processor health
- Event processing performance
- Subscription delivery status

**Alerting:**
- Configurable thresholds for error rates, latency, memory usage
- Automated recommendations
- Prometheus metrics export

## Usage Guide

### Setup

1. **Run Database Migrations:**
```bash
npm run setup:outbox
```

2. **Install Dependencies:**
```bash
npm install uuid @types/uuid
```

3. **Environment Variables:**
```bash
# Outbox Configuration
OUTBOX_BATCH_SIZE=50
OUTBOX_POLLING_INTERVAL=5000
OUTBOX_MAX_RETRIES=5

# Database
TURSO_DB_URL=your_turso_url
TURSO_DB_AUTH_TOKEN=your_token

# Monitoring
OUTBOX_MONITORING_ENABLED=true
OUTBOX_ALERT_ERROR_RATE=0.05
OUTBOX_ALERT_LATENCY=5000
```

### Integration

1. **Start Outbox Processor:**
```typescript
import { getOutboxProcessor } from '@/lib/events/outbox-processor';

const processor = getOutboxProcessor();
await processor.start();
```

2. **Use Event Publisher:**
```typescript
import { getEventPublisher, publishPaymentVerified } from '@/lib/events/event-publisher';

// Publish payment verified event
await publishPaymentVerified(paymentId, userId, referenceKey, amount, signature);
```

3. **Update Webhook Handler:**
```typescript
import { processHeliusWebhookWithOutbox } from '@/lib/solana/verify-with-outbox';

// Replace existing webhook processing
const result = await processHeliusWebhookWithOutbox(payload, signature, webhookSecret);
```

4. **Enable Monitoring:**
```typescript
import { getOutboxMonitor, startOutboxMonitoring } from '@/lib/events/outbox-monitoring';

await startOutboxMonitoring(30000); // 30 second intervals
```

## Event Types

### Payment Events
- `payment_verified`: Payment successfully verified on-chain
- `payment_failed`: Payment verification failed
- `payment_created`: New payment initiated
- `provisioning_completed`: Services provisioned for payment

### Webhook Events
- `webhook_processed`: Webhook successfully processed
- `webhook_failed`: Webhook processing failed

### User Events
- `user_created`: New user registered
- `user_updated`: User profile updated
- `user_deleted`: User account removed

## Delivery Guarantees

### Exactly-Once Semantics
- **Idempotency Keys**: Prevent duplicate processing
- **Unique Constraints**: Database constraints prevent duplicates
- **Event Versioning**: Schema evolution support

### At-Least-Once Delivery
- **Retry Logic**: Exponential backoff with max retries
- **Dead Letter Queue**: Failed events preserved
- **Subscription Management**: Multiple consumer support
- **Delivery Tracking**: Comprehensive logging

## Performance Characteristics

### Throughput
- **Target**: 1000+ events/second
- **Batch Processing**: 50 events/batch
- **Concurrent Processing**: 3 batches simultaneously

### Latency
- **P50 Processing Time**: <100ms
- **P90 Processing Time**: <500ms
- **P99 Processing Time**: <1000ms

### Reliability
- **Success Rate**: >99.9%
- **Error Rate**: <0.1%
- **Dead Letter Rate**: <0.02%

## Monitoring and Alerting

### Key Metrics
```typescript
interface OutboxMetrics {
  processedEvents: number;
  failedEvents: number;
  deadLetterEvents: number;
  averageProcessingTime: number;
  eventsByType: Record<string, number>;
  retryCount: number;
}
```

### Health Endpoints
```bash
# Check outbox health
curl http://localhost:3000/api/outbox/health

# Get metrics
curl http://localhost:3000/api/outbox/metrics

# Prometheus metrics
curl http://localhost:3000/api/outbox/prometheus
```

### Alert Thresholds
- **Error Rate**: 5% (configurable)
- **Latency**: 5 seconds (configurable)
- **Memory Usage**: 80% (configurable)
- **Dead Letter Rate**: 2% (configurable)

## Testing

### Unit Tests
```bash
# Run outbox pattern tests
npm test src/lib/events/__tests__/outbox-pattern.test.ts
```

### Integration Tests
```bash
# Test webhook integration
npm run test:webhook

# Test end-to-end flow
npm run test:e2e
```

### Performance Tests
```bash
# Load testing
npm run test:performance
```

## Troubleshooting

### Common Issues

1. **Events Not Processing**
   - Check outbox processor status
   - Verify database connectivity
   - Review subscription configurations

2. **High Retry Rates**
   - Check event validation
   - Verify consumer endpoints
   - Review idempotency key usage

3. **Memory Leaks**
   - Monitor Node.js memory usage
   - Check for unclosed database connections
   - Review event payload sizes

4. **Database Performance**
   - Check query execution times
   - Verify index usage
   - Monitor connection pool health

### Debug Commands
```bash
# Check outbox status
SELECT status, COUNT(*) as count 
FROM transactional_outbox 
WHERE created_at > strftime('%s', 'now', '-1 hour')
GROUP BY status;

# Check dead letter queue
SELECT failure_reason, COUNT(*) as count 
FROM dead_letter_queue 
WHERE created_at > strftime('%s', 'now', '-24 hours')
GROUP BY failure_reason;

# Monitor subscription health
SELECT consumer_name, status, 
       COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
       COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM event_delivery_log 
WHERE created_at > strftime('%s', 'now', '-1 hour')
GROUP BY consumer_name, status;
```

## Migration Guide

### From Existing System
1. **Backup Current Database**
2. **Run Migration Script**
3. **Update Application Code**
4. **Test Integration**
5. **Switch Traffic to Outbox**
6. **Monitor Performance**

### Rollback Plan
1. **Stop Outbox Processor**
2. **Restore Database Backup**
3. **Revert Application Code**
4. **Verify System Health**

## Best Practices

### Event Design
- **Immutable Events**: Never modify event data after creation
- **Schema Evolution**: Use versioning for event structure changes
- **Event Size**: Keep events small (<1KB recommended)
- **Timestamp**: Always include event creation time

### Performance Optimization
- **Batch Processing**: Group related events together
- **Connection Pooling**: Reuse database connections
- **Index Strategy**: Optimize for common query patterns
- **Async Processing**: Never block on I/O operations

### Security
- **Input Validation**: Validate all event data
- **Access Control**: Restrict event publishing permissions
- **Audit Logging**: Track all event operations
- **Error Handling**: Never expose internal system details

## Future Enhancements

### Short Term (1-3 months)
- [ ] Event schema registry
- [ ] Dynamic subscription management
- [ ] Event replay functionality
- [ ] Performance dashboard
- [ ] Automated failover

### Long Term (3-6 months)
- [ ] Multi-region event streaming
- [ ] Event sourcing with snapshots
- [ ] CQRS pattern implementation
- [ ] Advanced monitoring with APM integration

## Support

For questions or issues with the Transactional Outbox Pattern implementation:

1. **Documentation**: Refer to this document and inline code comments
2. **Issues**: Create GitHub issues with detailed reproduction steps
3. **Performance**: Provide metrics and system specifications for optimization
4. **Architecture**: Review the system design documentation for pattern understanding

---

**Implementation Status**: ✅ Complete  
**Last Updated**: 2025-12-02  
**Version**: 1.0.0