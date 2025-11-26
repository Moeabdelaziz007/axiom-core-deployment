-- ============================================================================
-- AXIOM AGENT PERFORMANCE DATABASE SCHEMA
-- 
-- This schema defines the database structure for storing agent statistics,
-- skills, experience, and performance data in Cloudflare D1.
-- 
-- @author Axiom Core Team
-- @version 1.0.0
-- ============================================================================

-- Agent statistics and basic information
CREATE TABLE IF NOT EXISTS agent_stats (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    skill_points INTEGER DEFAULT 0,
    energy INTEGER DEFAULT 100,
    reputation INTEGER DEFAULT 50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Agent skills and mastery levels
CREATE TABLE IF NOT EXISTS agent_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'cognitive', 'social', 'technical', 'creative', 'security'
    level INTEGER DEFAULT 0,
    mastery INTEGER DEFAULT 0, -- 0-100%
    unlocked BOOLEAN DEFAULT FALSE,
    acquired_at DATETIME,
    last_used DATETIME,
    FOREIGN KEY (agent_id) REFERENCES agent_stats(id) ON DELETE CASCADE,
    UNIQUE(agent_id, skill_id)
);

-- Skill requirements and prerequisites
CREATE TABLE IF NOT EXISTS skill_requirements (
    skill_id TEXT PRIMARY KEY,
    required_level INTEGER NOT NULL,
    required_skill_points INTEGER NOT NULL,
    prerequisites TEXT, -- JSON array of skill IDs
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics history
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    cpu REAL NOT NULL, -- 0-100%
    memory REAL NOT NULL, -- 0-100%
    network_latency REAL NOT NULL, -- milliseconds
    disk_io REAL DEFAULT 0, -- MB/s
    tasks_completed INTEGER DEFAULT 0,
    tasks_failed INTEGER DEFAULT 0,
    success_rate REAL NOT NULL, -- 0-100%
    average_response_time REAL NOT NULL, -- milliseconds
    throughput REAL DEFAULT 0, -- tasks/minute
    user_satisfaction REAL NOT NULL, -- 0-100%
    error_rate REAL DEFAULT 0, -- 0-100%
    accuracy REAL NOT NULL, -- 0-100%
    energy_level REAL NOT NULL, -- 0-100%
    active_superpowers TEXT, -- JSON array
    skill_mastery_level REAL DEFAULT 0, -- 0-100%
    revenue_generated REAL DEFAULT 0,
    cost_per_task REAL DEFAULT 0,
    efficiency REAL DEFAULT 0, -- output/input ratio
    FOREIGN KEY (agent_id) REFERENCES agent_stats(id) ON DELETE CASCADE
);

-- Performance alerts and notifications
CREATE TABLE IF NOT EXISTS performance_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT,
    alert_type TEXT NOT NULL, -- 'performance', 'security', 'resource'
    metric TEXT NOT NULL, -- 'cpu', 'memory', 'response_time', etc.
    threshold REAL NOT NULL,
    operator TEXT NOT NULL, -- 'gt', 'lt', 'eq', 'gte', 'lte'
    severity TEXT NOT NULL, -- 'info', 'warning', 'error', 'critical'
    enabled BOOLEAN DEFAULT TRUE,
    cooldown_minutes INTEGER DEFAULT 5,
    notification_channels TEXT, -- JSON array of channels
    last_triggered DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agent_stats(id) ON DELETE CASCADE
);

-- Agent transactions and financial records
CREATE TABLE IF NOT EXISTS agent_transactions (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'task_completion', 'skill_purchase', 'reward', 'penalty'
    amount REAL NOT NULL, -- Can be positive (rewards) or negative (costs)
    status TEXT NOT NULL, -- 'pending', 'confirmed', 'failed'
    description TEXT,
    metadata TEXT, -- JSON object for additional data
    timestamp DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agent_stats(id) ON DELETE CASCADE
);

-- Performance scores and rankings
CREATE TABLE IF NOT EXISTS performance_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    calculated_at DATETIME NOT NULL,
    overall_score REAL NOT NULL, -- 0-100
    efficiency_score REAL NOT NULL, -- 0-100
    reliability_score REAL NOT NULL, -- 0-100
    quality_score REAL NOT NULL, -- 0-100
    scalability_score REAL NOT NULL, -- 0-100
    cost_effectiveness_score REAL NOT NULL, -- 0-100
    rank_current INTEGER,
    rank_previous INTEGER,
    rank_change INTEGER,
    FOREIGN KEY (agent_id) REFERENCES agent_stats(id) ON DELETE CASCADE
);

-- Optimization recommendations
CREATE TABLE IF NOT EXISTS optimization_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT,
    category TEXT NOT NULL, -- 'performance', 'cost', 'reliability', 'security'
    priority TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_performance_impact REAL, -- percentage improvement
    expected_cost_reduction REAL, -- percentage reduction
    expected_reliability_improvement REAL, -- percentage improvement
    implementation_difficulty TEXT NOT NULL, -- 'easy', 'medium', 'hard'
    estimated_time TEXT NOT NULL,
    steps TEXT, -- JSON array of implementation steps
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'implemented', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    implemented_at DATETIME,
    FOREIGN KEY (agent_id) REFERENCES agent_stats(id) ON DELETE CASCADE
);

-- Resource utilization reports
CREATE TABLE IF NOT EXISTS resource_utilization (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    report_period_start DATETIME NOT NULL,
    report_period_end DATETIME NOT NULL,
    cpu_average REAL NOT NULL,
    cpu_peak REAL NOT NULL,
    cpu_min REAL NOT NULL,
    cpu_utilization_rate REAL NOT NULL,
    memory_average REAL NOT NULL,
    memory_peak REAL NOT NULL,
    memory_min REAL NOT NULL,
    memory_utilization_rate REAL NOT NULL,
    network_latency_average REAL NOT NULL,
    network_latency_peak REAL NOT NULL,
    network_latency_min REAL NOT NULL,
    network_bandwidth_total REAL DEFAULT 0, -- MB
    network_bandwidth_average REAL DEFAULT 0, -- MB/s
    compute_cost REAL DEFAULT 0,
    storage_cost REAL DEFAULT 0,
    network_cost REAL DEFAULT 0,
    total_cost REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agent_stats(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Indexes for agent_stats
CREATE INDEX IF NOT EXISTS idx_agent_stats_type ON agent_stats(type);
CREATE INDEX IF NOT EXISTS idx_agent_stats_level ON agent_stats(level);
CREATE INDEX IF NOT EXISTS idx_agent_stats_updated ON agent_stats(updated_at);

-- Indexes for agent_skills
CREATE INDEX IF NOT EXISTS idx_agent_skills_agent_id ON agent_skills(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_skills_category ON agent_skills(category);
CREATE INDEX IF NOT EXISTS idx_agent_skills_unlocked ON agent_skills(unlocked);

-- Indexes for performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_agent_id ON performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_agent_timestamp ON performance_metrics(agent_id, timestamp);

-- Indexes for performance_alerts
CREATE INDEX IF NOT EXISTS idx_performance_alerts_agent_id ON performance_alerts(agent_id);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_enabled ON performance_alerts(enabled);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON performance_alerts(severity);

-- Indexes for agent_transactions
CREATE INDEX IF NOT EXISTS idx_agent_transactions_agent_id ON agent_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_type ON agent_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_timestamp ON agent_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_transactions_status ON agent_transactions(status);

-- Indexes for performance_scores
CREATE INDEX IF NOT EXISTS idx_performance_scores_agent_id ON performance_scores(agent_id);
CREATE INDEX IF NOT EXISTS idx_performance_scores_calculated ON performance_scores(calculated_at);
CREATE INDEX IF NOT EXISTS idx_performance_scores_overall ON performance_scores(overall_score);

-- ============================================================================
-- SAMPLE DATA (for development/testing)
-- ============================================================================

-- Insert sample agents
INSERT OR IGNORE INTO agent_stats (id, name, type, level, experience, skill_points, energy, reputation) VALUES
('sofra', 'Sofra', 'CX-Auditor', 3, 1500, 12, 88),
('aqar', 'Aqar', 'UnitManager', 5, 3200, 18, 92),
('mawid', 'Mawid', 'FlowOptimizer', 2, 800, 8, 65),
('tajer', 'Tajer', 'Negotiator', 4, 2100, 15, 85);

-- Insert sample skills
INSERT OR IGNORE INTO skill_requirements (skill_id, required_level, required_skill_points, prerequisites, description) VALUES
('neural_learning', 3, 20, '[]', 'Learn from user interactions to improve performance over time'),
('api_connector', 2, 10, '[]', 'Instantly connect and integrate with any external API or service'),
('quantum_analysis', 8, 50, '["neural_learning","memory_palace"]', 'Analyze complex data patterns using quantum-inspired algorithms'),
('memory_palace', 4, 25, '[]', 'Store and retrieve vast amounts of structured information'),
('system_optimizer', 3, 15, '[]', 'Optimize system performance and resource allocation'),
('code_generator', 7, 60, '["system_optimizer","api_connector"]', 'Generate production-ready code in any language'),
('viral_amplifier', 9, 80, '["influence_network","content_creator"]', 'Amplify content reach across social platforms'),
('sentiment_oracle', 6, 35, '["neural_learning"]', 'Predict and analyze market sentiment with high accuracy'),
('blockchain_master', 10, 100, '["code_generator","system_optimizer"]', 'Execute complex blockchain operations and DeFi strategies');

-- Insert sample agent skills
INSERT OR IGNORE INTO agent_skills (agent_id, skill_id, skill_name, category, level, mastery, unlocked, acquired_at) VALUES
('sofra', 'neural_learning', 'Neural Learning', 'cognitive', 3, 75, TRUE, datetime('now', '-1 day')),
('sofra', 'api_connector', 'API Connector', 'technical', 2, 60, TRUE, datetime('now', '-2 days')),
('aqar', 'neural_learning', 'Neural Learning', 'cognitive', 4, 85, TRUE, datetime('now', '-3 days')),
('aqar', 'memory_palace', 'Memory Palace', 'cognitive', 2, 45, TRUE, datetime('now', '-1 day')),
('aqar', 'quantum_analysis', 'Quantum Analysis', 'cognitive', 0, 0, FALSE, NULL),
('mawid', 'system_optimizer', 'System Optimizer', 'technical', 3, 70, TRUE, datetime('now', '-2 days')),
('tajer', 'viral_amplifier', 'Viral Amplifier', 'social', 2, 55, TRUE, datetime('now', '-4 days')),
('tajer', 'sentiment_oracle', 'Sentiment Oracle', 'social', 1, 30, TRUE, datetime('now', '-1 day'));

-- Insert sample performance metrics
INSERT OR IGNORE INTO performance_metrics (agent_id, timestamp, cpu, memory, network_latency, tasks_completed, tasks_failed, success_rate, average_response_time, throughput, user_satisfaction, error_rate, accuracy, energy_level, active_superpowers, skill_mastery_level, revenue_generated, cost_per_task, efficiency) VALUES
('sofra', datetime('now', '-1 hour'), 45, 60, 89, 12, 1, 92.3, 156, 0.8, 95, 2.5, 98, '["neural_learning","api_connector"]', 67.5, 0.05, 0.02, 2.5),
('sofra', datetime('now', '-30 minutes'), 42, 58, 92, 8, 0, 93.1, 145, 0.7, 96, 2.1, 97, '["neural_learning","api_connector"]', 67.5, 0.04, 0.02, 2.0),
('aqar', datetime('now', '-1 hour'), 12, 35, 156, 15, 0, 100.0, 234, 1.2, 98, 1.0, 99, '["neural_learning","memory_palace"]', 65.0, 0.08, 0.01, 8.0),
('aqar', datetime('now', '-30 minutes'), 15, 33, 148, 10, 0, 100.0, 220, 1.0, 99, 0.8, 98, '["neural_learning","memory_palace"]', 65.0, 0.06, 0.01, 6.0),
('mawid', datetime('now', '-1 hour'), 89, 75, 234, 5, 2, 71.4, 567, 0.3, 85, 5.0, 75, '["system_optimizer"]', 70.0, 0.03, 0.03, 1.0),
('mawid', datetime('now', '-30 minutes'), 85, 72, 228, 3, 1, 75.0, 545, 0.4, 87, 4.2, 77, '["system_optimizer"]', 70.0, 0.02, 0.02, 1.5),
('tajer', datetime('now', '-1 hour'), 60, 50, 78, 20, 1, 95.2, 89, 1.5, 92, 1.8, 85, '["viral_amplifier","sentiment_oracle"]', 42.5, 0.12, 0.04, 3.0),
('tajer', datetime('now', '-30 minutes'), 58, 48, 75, 15, 1, 93.8, 82, 1.3, 94, 1.5, 87, '["viral_amplifier","sentiment_oracle"]', 42.5, 0.09, 0.04, 2.2);