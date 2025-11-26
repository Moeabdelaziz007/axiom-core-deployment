-- ========================================
-- 🔋 AXIOM ENERGY GRID - Resource Grid Schema
-- Migration: 0006_resource_grid
-- Description: Database schema for comprehensive resource management
-- Author: Axiom Core Team
-- Version: 1.0.0
-- ========================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- RESOURCE QUOTAS TABLE
-- ========================================
-- حصص الموارد (Quotas) - Resource quotas for agents
CREATE TABLE IF NOT EXISTS resource_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  tier_id TEXT NOT NULL CHECK (tier_id IN ('FREE', 'PRO', 'ENTERPRISE', 'CUSTOM')),
  period TEXT NOT NULL CHECK (period IN ('SECONDLY', 'MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY')),
  
  -- JSON object containing limits for each resource type
  -- Example: {"COMPUTE_MS": 3600000, "AI_TOKENS": 1000000, "STORAGE_KB": 10485760, ...}
  limits_json JSONB NOT NULL DEFAULT '{}',
  
  -- JSON object containing current usage for each resource type
  -- Example: {"COMPUTE_MS": 1800000, "AI_TOKENS": 500000, "STORAGE_KB": 5242880, ...}
  usage_json JSONB NOT NULL DEFAULT '{}',
  
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_resource_quotas_agent_id ON resource_quotas(agent_id);
CREATE INDEX IF NOT EXISTS idx_resource_quotas_tier_id ON resource_quotas(tier_id);
CREATE INDEX IF NOT EXISTS idx_resource_quotas_reset_at ON resource_quotas(reset_at);
CREATE INDEX IF NOT EXISTS idx_resource_quotas_limits_gin ON resource_quotas USING GIN(limits_json);
CREATE INDEX IF NOT EXISTS idx_resource_quotas_usage_gin ON resource_quotas USING GIN(usage_json);

-- ========================================
-- USAGE LOGS TABLE
-- ========================================
-- سجل الاستهلاك (The Meter) - Detailed usage logs for all resource consumption
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  task_id TEXT,
  session_id TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'COMPUTE_MS', 'AI_TOKENS', 'STORAGE_KB', 'NETWORK_REQS', 'SOLANA_LAMPORTS'
  )),
  
  amount REAL NOT NULL,
  cost_usd REAL NOT NULL DEFAULT 0,
  
  -- Additional metadata for the usage event
  metadata JSONB DEFAULT '{}',
  
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key to resource_quotas for data integrity
  quota_id UUID REFERENCES resource_quotas(id) ON DELETE SET NULL
);

-- Indexes for efficient querying and analytics
CREATE INDEX IF NOT EXISTS idx_usage_logs_agent_id ON usage_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_resource_type ON usage_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_logs_task_id ON usage_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_session_id ON usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_quota_id ON usage_logs(quota_id);

-- ========================================
-- OPTIMIZATION RULES TABLE
-- ========================================
-- قواعد التحسين (Optimization Rules) - Rules for automatic resource optimization
CREATE TABLE IF NOT EXISTS optimization_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  condition TEXT NOT NULL CHECK (condition IN (
    'HIGH_USAGE', 'LOW_EFFICIENCY', 'BUDGET_RISK', 'PERFORMANCE_DEGRADE',
    'COST_SPIKE', 'RESOURCE_WASTE', 'PREDICTIVE_SCALE', 'TIME_BASED'
  )),
  
  threshold REAL NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'THROTTLE', 'SCALE_DOWN', 'SCALE_UP', 'NOTIFY', 'KILL', 'CACHE',
    'COMPRESS', 'OPTIMIZE_QUERY', 'SWITCH_PROVIDER', 'SCHEDULE_TASK',
    'UPGRADE_TIER', 'DOWNGRADE_TIER'
  )),
  
  auto_execute BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_triggered TIMESTAMP WITH TIME ZONE
);

-- Indexes for optimization rules
CREATE INDEX IF NOT EXISTS idx_optimization_rules_agent_id ON optimization_rules(agent_id);
CREATE INDEX IF NOT EXISTS idx_optimization_rules_enabled ON optimization_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_optimization_rules_priority ON optimization_rules(priority);
CREATE INDEX IF NOT EXISTS idx_optimization_rules_condition ON optimization_rules(condition);

-- ========================================
-- RESOURCE ALLOCATION REQUESTS TABLE
-- ========================================
-- Resource allocation requests tracking
CREATE TABLE IF NOT EXISTS resource_allocation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  task_id TEXT,
  session_id TEXT,
  
  -- Request status tracking
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'approved', 'allocated', 'rejected', 'completed', 'failed'
  )),
  
  -- Resource requirements (JSON)
  requirements_json JSONB NOT NULL DEFAULT '{}',
  
  -- Allocation constraints (JSON)
  constraints_json JSONB DEFAULT '{}',
  
  -- Request metadata (JSON)
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for allocation requests
CREATE INDEX IF NOT EXISTS idx_resource_alloc_requests_agent_id ON resource_allocation_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_resource_alloc_requests_status ON resource_allocation_requests(status);
CREATE INDEX IF NOT EXISTS idx_resource_alloc_requests_created_at ON resource_allocation_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_resource_alloc_requests_requirements_gin ON resource_allocation_requests USING GIN(requirements_json);

-- ========================================
-- RESOURCE ALLOCATIONS TABLE
-- ========================================
-- Active resource allocations
CREATE TABLE IF NOT EXISTS resource_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES resource_allocation_requests(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  
  -- Allocation status
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'revoked', 'completed')),
  
  -- Allocated resources (JSON)
  allocated_resources JSONB NOT NULL DEFAULT '{}',
  
  -- Cost information (JSON)
  cost_info JSONB DEFAULT '{}',
  
  -- Timing information
  allocated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  
  -- Response metadata (JSON)
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for allocations
CREATE INDEX IF NOT EXISTS idx_resource_allocations_agent_id ON resource_allocations(agent_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_status ON resource_allocations(status);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_expires_at ON resource_allocations(expires_at);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_allocated_gin ON resource_allocations USING GIN(allocated_resources);

-- ========================================
-- RESOURCE ALERTS TABLE
-- ========================================
-- Resource-related alerts
CREATE TABLE IF NOT EXISTS resource_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'QUOTA_EXCEEDED', 'BUDGET_WARNING', 'EFFICIENCY_LOW', 'COST_SPIKE', 'RESOURCE_WASTE'
  )),
  
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  
  threshold REAL NOT NULL,
  current_value REAL NOT NULL,
  message TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'COMPUTE_MS', 'AI_TOKENS', 'STORAGE_KB', 'NETWORK_REQS', 'SOLANA_LAMPORTS'
  )),
  
  auto_resolve BOOLEAN NOT NULL DEFAULT false,
  resolved BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for alerts
CREATE INDEX IF NOT EXISTS idx_resource_alerts_agent_id ON resource_alerts(agent_id);
CREATE INDEX IF NOT EXISTS idx_resource_alerts_type ON resource_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_resource_alerts_severity ON resource_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_resource_alerts_resolved ON resource_alerts(resolved);

-- ========================================
-- RESOURCE METRICS TABLE
-- ========================================
-- Real-time resource metrics
CREATE TABLE IF NOT EXISTS resource_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Current usage (JSON)
  current_usage JSONB NOT NULL DEFAULT '{}',
  
  -- Performance metrics (JSON)
  performance_metrics JSONB DEFAULT '{}',
  
  -- Cost metrics (JSON)
  cost_metrics JSONB DEFAULT '{}',
  
  -- Derived metrics for quick access
  utilization_score REAL DEFAULT 0,
  efficiency_score REAL DEFAULT 0,
  cost_score REAL DEFAULT 0
);

-- Indexes for metrics
CREATE INDEX IF NOT EXISTS idx_resource_metrics_agent_id ON resource_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_resource_metrics_timestamp ON resource_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_resource_metrics_utilization ON resource_metrics(utilization_score);
CREATE INDEX IF NOT EXISTS idx_resource_metrics_current_gin ON resource_metrics USING GIN(current_usage);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Trigger to update usage in resource_quotas when new usage is logged
CREATE OR REPLACE FUNCTION update_quota_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the usage_json in resource_quotas based on the new usage log
  UPDATE resource_quotas 
  SET 
    usage_json = (
      SELECT jsonb_object_agg(
        resource_type, 
        COALESCE(
          (SELECT SUM(amount) FROM usage_logs ul 
           WHERE ul.agent_id = NEW.agent_id 
             AND ul.resource_type = NEW.resource_type
             AND ul.timestamp >= (SELECT reset_at FROM resource_quotas rq 
                                      WHERE rq.agent_id = NEW.agent_id 
                                      ORDER BY reset_at DESC LIMIT 1)),
          0
        )
      )
      FROM (
        SELECT DISTINCT resource_type 
        FROM usage_logs 
        WHERE agent_id = NEW.agent_id
      ) rt
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE agent_id = NEW.agent_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_quota_usage ON usage_logs;
CREATE TRIGGER trigger_update_quota_usage
  AFTER INSERT ON usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_quota_usage();

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- View for current resource status across all agents
CREATE OR REPLACE VIEW v_agent_resource_status AS
SELECT 
  rq.agent_id,
  rq.tier_id,
  rq.period,
  rq.limits_json,
  rq.usage_json,
  rq.reset_at,
  rq.updated_at,
  
  -- Calculate utilization percentages
  (rq.usage_json->>'COMPUTE_MS')::REAL / NULLIF((rq.limits_json->>'COMPUTE_MS')::REAL, 0) * 100 as compute_utilization_percent,
  (rq.usage_json->>'AI_TOKENS')::REAL / NULLIF((rq.limits_json->>'AI_TOKENS')::REAL, 0) * 100 as ai_tokens_utilization_percent,
  (rq.usage_json->>'STORAGE_KB')::REAL / NULLIF((rq.limits_json->>'STORAGE_KB')::REAL, 0) * 100 as storage_utilization_percent,
  (rq.usage_json->>'NETWORK_REQS')::REAL / NULLIF((rq.limits_json->>'NETWORK_REQS')::REAL, 0) * 100 as network_utilization_percent,
  (rq.usage_json->>'SOLANA_LAMPORTS')::REAL / NULLIF((rq.limits_json->>'SOLANA_LAMPORTS')::REAL, 0) * 100 as solana_utilization_percent,
  
  -- Calculate time until reset
  EXTRACT(EPOCH FROM (rq.reset_at - CURRENT_TIMESTAMP)) as seconds_until_reset
  
FROM resource_quotas rq;

-- View for cost analysis
CREATE OR REPLACE VIEW v_agent_cost_analysis AS
SELECT 
  ul.agent_id,
  ul.resource_type,
  COUNT(*) as usage_count,
  SUM(ul.amount) as total_amount,
  SUM(ul.cost_usd) as total_cost_usd,
  AVG(ul.cost_usd) as avg_cost_per_usage,
  MIN(ul.timestamp) as first_usage,
  MAX(ul.timestamp) as last_usage,
  DATE_TRUNC('day', ul.timestamp) as usage_date
FROM usage_logs ul
GROUP BY ul.agent_id, ul.resource_type, DATE_TRUNC('day', ul.timestamp);

-- ========================================
-- SAMPLE DATA INSERTIONS (for development)
-- ========================================

-- Insert sample resource quotas for testing
INSERT INTO resource_quotas (agent_id, tier_id, period, limits_json, usage_json) VALUES
('aqar', 'FREE', 'DAILY', 
 '{"COMPUTE_MS": 3600000, "AI_TOKENS": 1000000, "STORAGE_KB": 10485760, "NETWORK_REQS": 10000, "SOLANA_LAMPORTS": 10000000}',
 '{"COMPUTE_MS": 1800000, "AI_TOKENS": 500000, "STORAGE_KB": 5242880, "NETWORK_REQS": 5000, "SOLANA_LAMPORTS": 5000000}'),

('mawid', 'PRO', 'DAILY', 
 '{"COMPUTE_MS": 7200000, "AI_TOKENS": 5000000, "STORAGE_KB": 52428800, "NETWORK_REQS": 50000, "SOLANA_LAMPORTS": 50000000}',
 '{"COMPUTE_MS": 3600000, "AI_TOKENS": 2500000, "STORAGE_KB": 26214400, "NETWORK_REQS": 25000, "SOLANA_LAMPORTS": 25000000}'),

('sofra', 'ENTERPRISE', 'DAILY', 
 '{"COMPUTE_MS": 14400000, "AI_TOKENS": 10000000, "STORAGE_KB": 104857600, "NETWORK_REQS": 100000, "SOLANA_LAMPORTS": 100000000}',
 '{"COMPUTE_MS": 7200000, "AI_TOKENS": 5000000, "STORAGE_KB": 52428800, "NETWORK_REQS": 50000, "SOLANA_LAMPORTS": 50000000}');

-- Insert sample optimization rules
INSERT INTO optimization_rules (agent_id, name, description, condition, threshold, action, auto_execute, priority, enabled) VALUES
('aqar', 'High Compute Usage Alert', 'Alert when compute usage exceeds 80%', 'HIGH_USAGE', 80, 'NOTIFY', false, 1, true),
('aqar', 'Low Efficiency Detection', 'Detect when resource efficiency drops below 60%', 'LOW_EFFICIENCY', 60, 'OPTIMIZE_QUERY', true, 2, true),
('aqar', 'Budget Risk Alert', 'Alert when budget utilization exceeds 90%', 'BUDGET_RISK', 90, 'THROTTLE', true, 1, true),

('mawid', 'High Compute Usage Alert', 'Alert when compute usage exceeds 75%', 'HIGH_USAGE', 75, 'NOTIFY', false, 1, true),
('mawid', 'Auto Scale Down', 'Automatically scale down when usage is low', 'LOW_EFFICIENCY', 30, 'SCALE_DOWN', true, 2, true),

('sofra', 'Performance Optimization', 'Continuous optimization for enterprise tier', 'LOW_EFFICIENCY', 70, 'OPTIMIZE_QUERY', true, 1, true),
('sofra', 'Cost Spike Detection', 'Detect sudden cost increases', 'COST_SPIKE', 200, 'NOTIFY', false, 1, true);

-- ========================================
-- MIGRATION COMPLETION
-- ========================================

-- Record migration completion
INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('0006_resource_grid', 'Axiom Energy Grid - Resource Management Schema', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO UPDATE SET 
  description = EXCLUDED.description, 
  applied_at = CURRENT_TIMESTAMP;

COMMIT;