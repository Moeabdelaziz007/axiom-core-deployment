-- Payment Fulfillment Schema for Turso/LibSQL
-- This schema implements deterministic payment tracking with anti-replay protection
-- Version: 1.0.0

-- Primary payments table with strict constraints
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_signature TEXT UNIQUE NOT NULL,           -- Solana transaction signature
    user_id TEXT NOT NULL,                       -- User identifier
    reference_key TEXT UNIQUE NOT NULL,          -- Anti-replay protection
    amount_lamports INTEGER NOT NULL,             -- Amount in lamports (64-bit)
    status TEXT CHECK(status IN ('pending', 'verified', 'provisioned', 'failed')) DEFAULT 'pending',
    finalized_at INTEGER,                         -- Unix timestamp when finalized
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Payment metadata for additional context
CREATE TABLE IF NOT EXISTS payment_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    UNIQUE(payment_id, key)
);

-- Webhook event log for audit trail
CREATE TABLE IF NOT EXISTS webhook_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER,
    webhook_type TEXT NOT NULL,                  -- 'helius', 'paymob'
    event_data TEXT NOT NULL,                    -- JSON payload
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

-- Payment attempts table for retry logic
CREATE TABLE IF NOT EXISTS payment_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    attempt_type TEXT NOT NULL,                   -- 'verification', 'provisioning'
    attempt_data TEXT,                            -- JSON context
    status TEXT NOT NULL,                         -- 'pending', 'success', 'failed'
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- Performance indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference_key ON payments(reference_key);
CREATE INDEX IF NOT EXISTS idx_payments_tx_signature ON payments(tx_signature);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_finalized_at ON payments(finalized_at);

-- Indexes for metadata table
CREATE INDEX IF NOT EXISTS idx_payment_metadata_payment_id ON payment_metadata(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_metadata_key ON payment_metadata(key);

-- Indexes for webhook events table
CREATE INDEX IF NOT EXISTS idx_webhook_events_payment_id ON webhook_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_type ON webhook_events(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Indexes for payment attempts table
CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment_id ON payment_attempts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON payment_attempts(status);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_created_at ON payment_attempts(created_at);

-- Triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_payments_timestamp 
    AFTER UPDATE ON payments
    FOR EACH ROW
BEGIN
    UPDATE payments SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- Views for common queries
CREATE VIEW IF NOT EXISTS payment_summary AS
SELECT 
    p.id,
    p.tx_signature,
    p.user_id,
    p.reference_key,
    p.amount_lamports,
    p.status,
    p.finalized_at,
    p.created_at,
    p.updated_at,
    COUNT(pa.id) as attempt_count,
    MAX(pa.created_at) as last_attempt_at
FROM payments p
LEFT JOIN payment_attempts pa ON p.id = pa.payment_id
GROUP BY p.id;

CREATE VIEW IF NOT EXISTS webhook_summary AS
SELECT 
    we.id,
    we.payment_id,
    p.user_id,
    p.reference_key,
    we.webhook_type,
    we.processed,
    we.error_message,
    we.created_at
FROM webhook_events we
LEFT JOIN payments p ON we.payment_id = p.id;