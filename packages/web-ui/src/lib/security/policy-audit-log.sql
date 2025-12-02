-- Policy Audit Log Schema for Zero-Trust Security System
-- This table logs all policy evaluations for compliance and auditing

CREATE TABLE IF NOT EXISTS policy_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_signature TEXT NOT NULL,
  user_id TEXT,
  risk_score INTEGER NOT NULL,
  violations_count INTEGER NOT NULL DEFAULT 0,
  allowed BOOLEAN NOT NULL DEFAULT FALSE,
  recommendations TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  processed_at INTEGER,
  violation_types TEXT, -- JSON array of violation types
  severity_levels TEXT, -- JSON array of severity levels
  ip_address TEXT,
  user_agent TEXT,
  policy_version TEXT DEFAULT '1.0.0'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_policy_audit_signature ON policy_audit_log(transaction_signature);
CREATE INDEX IF NOT EXISTS idx_policy_audit_user_id ON policy_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_audit_created_at ON policy_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_policy_audit_risk_score ON policy_audit_log(risk_score);
CREATE INDEX IF NOT EXISTS idx_policy_audit_allowed ON policy_audit_log(allowed);

-- View for high-risk transactions (risk score >= 70)
CREATE VIEW IF NOT EXISTS high_risk_transactions AS
SELECT 
  transaction_signature,
  user_id,
  risk_score,
  violations_count,
  allowed,
  recommendations,
  created_at
FROM policy_audit_log 
WHERE risk_score >= 70
ORDER BY created_at DESC;

-- View for blocked transactions (allowed = FALSE)
CREATE VIEW IF NOT EXISTS blocked_transactions AS
SELECT 
  transaction_signature,
  user_id,
  risk_score,
  violations_count,
  allowed,
  recommendations,
  created_at,
  violation_types,
  severity_levels
FROM policy_audit_log 
WHERE allowed = FALSE
ORDER BY created_at DESC;

-- View for policy violations summary
CREATE VIEW IF NOT EXISTS policy_violation_summary AS
SELECT 
  DATE(created_at / 1000, 'unixepoch') as date,
  COUNT(*) as total_evaluations,
  COUNT(CASE WHEN allowed = FALSE THEN 1 END) as blocked_count,
  COUNT(CASE WHEN risk_score >= 70 THEN 1 END) as high_risk_count,
  AVG(risk_score) as avg_risk_score,
  MAX(risk_score) as max_risk_score
FROM policy_audit_log 
GROUP BY DATE(created_at / 1000, 'unixepoch')
ORDER BY date DESC;