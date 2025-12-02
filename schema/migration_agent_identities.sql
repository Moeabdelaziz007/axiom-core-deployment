-- Migration: Agent Identities and Signing Audit Tables
-- Purpose: Store agent identity information and transaction signing audit logs

-- Create agent identities table
CREATE TABLE IF NOT EXISTS axiom_identities (
  id TEXT PRIMARY KEY,
  agent_id TEXT UNIQUE NOT NULL,
  agent_type TEXT NOT NULL,
  public_key TEXT NOT NULL,
  derivation_path TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create signing audit logs table
CREATE TABLE IF NOT EXISTS signing_audit_logs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  derivation_path TEXT NOT NULL,
  signed_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER DEFAULT ((strftime('%s', 'now')) * 1000)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_axiom_identities_agent_id ON axiom_identities(agent_id);
CREATE INDEX IF NOT EXISTS idx_axiom_identities_agent_type ON axiom_identities(agent_type);
CREATE INDEX IF NOT EXISTS idx_axiom_identities_wallet_address ON axiom_identities(wallet_address);
CREATE INDEX IF NOT EXISTS idx_axiom_identities_created_at ON axiom_identities(created_at);

CREATE INDEX IF NOT EXISTS idx_signing_logs_agent_id ON signing_audit_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_signing_logs_signed_at ON signing_audit_logs(signed_at);
CREATE INDEX IF NOT EXISTS idx_signing_logs_transaction_hash ON signing_audit_logs(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_signing_logs_signature ON signing_audit_logs(signature);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_axiom_identities_updated_at
  AFTER UPDATE ON axiom_identities
  FOR EACH ROW
BEGIN
  UPDATE axiom_identities SET updated_at = ((strftime('%s', 'now')) * 1000) WHERE id = NEW.id;
END;

-- Insert sample data for testing (optional)
-- This would be removed in production
INSERT OR IGNORE INTO axiom_identities (
  id, agent_id, agent_type, public_key, derivation_path, wallet_address, created_at, updated_at
) VALUES (
  'identity_sample_001',
  'sample-tajer-agent',
  'TAJER',
  '11111111111111111111111111111112',
  "m/44'/501'/0'/0'/123456'",
  '11111111111111111111111111111112',
  (strftime('%s', 'now') * 1000),
  (strftime('%s', 'now') * 1000)
);

-- Enable Row Level Security (RLS) if needed
-- This would be uncommented in production with proper policies
-- ALTER TABLE axiom_identities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE signing_audit_logs ENABLE ROW LEVEL SECURITY;