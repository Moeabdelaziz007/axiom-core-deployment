-- Transactional Outbox Pattern for Event-Driven Architecture
-- Ensures exactly-once semantics and reliable event delivery

CREATE TABLE IF NOT EXISTS transactional_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Event identification
  event_id TEXT UNIQUE NOT NULL,           -- UUID for event deduplication
  event_type TEXT NOT NULL,               -- 'payment_verified', 'payment_failed', etc.
  aggregate_id TEXT NOT NULL,              -- Payment ID or transaction signature
  aggregate_type TEXT NOT NULL,             -- 'payment', 'transaction'
  
  -- Event payload
  event_data TEXT NOT NULL,                -- JSON payload of the event
  event_version INTEGER DEFAULT 1,           -- Event schema version
  
  -- Processing metadata
  status TEXT NOT NULL DEFAULT 'pending',   -- 'pending', 'processing', 'completed', 'failed'
  priority INTEGER DEFAULT 0,               -- Higher numbers = higher priority
  retry_count INTEGER DEFAULT 0,            -- Number of retry attempts
  max_retries INTEGER DEFAULT 3,            -- Maximum retry attempts
  
  -- Timing for exactly-once semantics
  created_at INTEGER NOT NULL,              -- Event creation timestamp
  scheduled_at INTEGER NOT NULL,            -- When to process the event
  processed_at INTEGER,                       -- When event was processed
  next_retry_at INTEGER,                      -- When to retry next
  
  -- Deduplication and ordering
  idempotency_key TEXT UNIQUE NOT NULL,   -- Prevents duplicate processing
  sequence_number INTEGER,                    -- Event ordering within aggregate
  
  -- Error handling
  error_message TEXT,                          -- Last error if failed
  error_details TEXT,                          -- Detailed error information
  
  -- Metadata and indexing
  correlation_id TEXT,                         -- Request tracing
  source_service TEXT DEFAULT 'helius',      -- Event source
  tenant_id TEXT DEFAULT 'default',             -- Multi-tenant support
  
  -- Constraints for reliability
  CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  CHECK (retry_count >= 0),
  CHECK (max_retries >= 0 AND max_retries <= 10),
  CHECK (priority >= 0 AND priority <= 100)
);

-- Indexes for performance and ordering
CREATE INDEX IF NOT EXISTS idx_outbox_status ON transactional_outbox(status);
CREATE INDEX IF NOT EXISTS idx_outbox_scheduled_at ON transactional_outbox(scheduled_at, priority);
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON transactional_outbox(aggregate_id, aggregate_type);
CREATE INDEX IF NOT EXISTS idx_outbox_idempotency ON transactional_outbox(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_outbox_tenant ON transactional_outbox(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_event_type ON transactional_outbox(event_type, created_at);

-- Dead letter queue for failed events
CREATE TABLE IF NOT EXISTS transactional_dead_letter (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  outbox_id INTEGER NOT NULL,               -- Reference to original outbox event
  event_id TEXT NOT NULL,                      -- Original event ID
  event_type TEXT NOT NULL,                    -- Original event type
  event_data TEXT NOT NULL,                    -- Original event payload
  failure_reason TEXT NOT NULL,                  -- Why it failed
  error_details TEXT,                           -- Detailed error information
  retry_count INTEGER NOT NULL,                  -- Total retries attempted
  failed_at INTEGER NOT NULL,                    -- When it finally failed
  tenant_id TEXT DEFAULT 'default',             -- Multi-tenant support
  
  FOREIGN KEY (outbox_id) REFERENCES transactional_outbox(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dead_letter_tenant ON transactional_dead_letter(tenant_id, failed_at);
CREATE INDEX IF NOT EXISTS idx_dead_letter_outbox ON transactional_dead_letter(outbox_id);

-- Event processing metrics for monitoring
CREATE TABLE IF NOT EXISTS outbox_processing_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  tenant_id TEXT DEFAULT 'default',
  processed_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  avg_processing_time_ms INTEGER DEFAULT 0,
  last_processed_at INTEGER,
  recorded_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_metrics_tenant_event ON outbox_processing_metrics(tenant_id, event_type);