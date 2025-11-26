-- 🗄️ THE HIVE MEMORY - Collaboration Database Schema
-- 
-- Database schema for agent collaboration system with D1
-- Enables persistent storage for sessions, tasks, reputation, and knowledge
-- 
-- @author Axiom Core Team
-- @version 1.0.0

-- 1. جلسات التعاون (Collaboration Sessions)
CREATE TABLE IF NOT EXISTS collab_sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK(type IN ('realtime', 'asynchronous', 'hybrid')) DEFAULT 'hybrid',
  status TEXT CHECK(status IN ('active', 'paused', 'completed', 'failed')) DEFAULT 'active',
  leader_id TEXT NOT NULL,
  participants TEXT NOT NULL, -- JSON array of agent IDs
  objectives TEXT, -- JSON array of objectives
  settings TEXT, -- JSON object with session settings
  resources TEXT, -- JSON object with resource allocation
  shared_memory TEXT, -- JSON object for shared memory
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME
);

-- 2. المهام الموكلة (Collaboration Tasks)
CREATE TABLE IF NOT EXISTS collab_tasks (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT NOT NULL, -- JSON array of agent IDs
  assigned_by TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  priority TEXT CHECK(priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
  progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
  dependencies TEXT, -- JSON array of task IDs
  requirements TEXT, -- JSON array of task requirements
  deadline DATETIME,
  results TEXT, -- JSON array of task results
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (session_id) REFERENCES collab_sessions(id) ON DELETE CASCADE
);

-- 3. سجل السمعة (Agent Reputation - مهم جداً للثقة)
CREATE TABLE IF NOT EXISTS agent_reputation (
  agent_id TEXT PRIMARY KEY,
  overall_score REAL DEFAULT 50.0 CHECK(overall_score >= 0 AND overall_score <= 100),
  collaboration_score REAL DEFAULT 50.0 CHECK(collaboration_score >= 0 AND collaboration_score <= 100),
  reliability_score REAL DEFAULT 50.0 CHECK(reliability_score >= 0 AND reliability_score <= 100),
  knowledge_score REAL DEFAULT 50.0 CHECK(knowledge_score >= 0 AND knowledge_score <= 100),
  leadership_score REAL DEFAULT 50.0 CHECK(leadership_score >= 0 AND leadership_score <= 100),
  innovation_score REAL DEFAULT 50.0 CHECK(innovation_score >= 0 AND innovation_score <= 100),
  contributions INTEGER DEFAULT 0,
  disputes INTEGER DEFAULT 0,
  resolved_disputes INTEGER DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. قاعدة المعرفة المشتركة (Swarm Knowledge Base)
CREATE TABLE IF NOT EXISTS swarm_knowledge (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  contributor_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('skill', 'experience', 'data', 'pattern', 'solution')) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- JSON content
  tags TEXT, -- JSON array of tags
  quality_score INTEGER DEFAULT 75 CHECK(quality_score >= 0 AND quality_score <= 100),
  usefulness_score INTEGER DEFAULT 75 CHECK(usefulness_score >= 0 AND usefulness_score <= 100),
  verification_status TEXT CHECK(verification_status IN ('verified', 'pending', 'disputed')) DEFAULT 'pending',
  access_count INTEGER DEFAULT 0,
  shared_with TEXT, -- JSON array of agent IDs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES collab_sessions(id) ON DELETE SET NULL
);

-- 5. رسائل التعاون (Collaboration Messages)
CREATE TABLE IF NOT EXISTS collab_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  sender_id TEXT NOT NULL,
  target_id TEXT NOT NULL, -- 'BROADCAST' or specific agent ID
  type TEXT CHECK(type IN ('CONSULTATION', 'TASK_DELEGATION', 'DATA_REQUEST', 'VOTE')) NOT NULL,
  content TEXT NOT NULL, -- JSON content
  priority TEXT CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
  encrypted BOOLEAN DEFAULT FALSE,
  metadata TEXT, -- JSON metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME,
  read_at DATETIME,
  FOREIGN KEY (session_id) REFERENCES collab_sessions(id) ON DELETE CASCADE
);

-- 6. فرق العمل (Agent Teams)
CREATE TABLE IF NOT EXISTS agent_teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK(type IN ('permanent', 'temporary', 'project')) DEFAULT 'permanent',
  status TEXT CHECK(status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
  leader_id TEXT NOT NULL,
  members TEXT NOT NULL, -- JSON array of team members
  roles TEXT, -- JSON array of team roles
  hierarchy TEXT, -- JSON object defining team hierarchy
  resources TEXT, -- JSON object with team resources
  performance TEXT, -- JSON object with team performance metrics
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. أعضاء الفريق (Team Members)
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  role TEXT NOT NULL,
  permissions TEXT, -- JSON array of permissions
  status TEXT CHECK(status IN ('active', 'inactive', 'busy', 'away')) DEFAULT 'active',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  contributions INTEGER DEFAULT 0,
  reputation_score REAL DEFAULT 50.0,
  FOREIGN KEY (team_id) REFERENCES agent_teams(id) ON DELETE CASCADE
);

-- 8. حل النزاعات (Conflict Resolution)
CREATE TABLE IF NOT EXISTS conflict_resolutions (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  team_id TEXT,
  type TEXT CHECK(type IN ('resource', 'task', 'decision', 'communication')) NOT NULL,
  description TEXT NOT NULL,
  parties TEXT NOT NULL, -- JSON array of agent IDs involved
  resolution TEXT,
  resolved_by TEXT,
  method TEXT CHECK(method IN ('leader', 'consensus', 'voting', 'automated')) NOT NULL,
  outcome TEXT CHECK(outcome IN ('resolved', 'escalated', 'pending')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (session_id) REFERENCES collab_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES agent_teams(id) ON DELETE CASCADE
);

-- 9. سجل التدقيق (Audit Trail)
CREATE TABLE IF NOT EXISTS audit_trail (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  team_id TEXT,
  agent_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  details TEXT, -- JSON object with action details
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT CHECK(severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES collab_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES agent_teams(id) ON DELETE CASCADE
);

-- 10. نظام الحوافز (Incentive System)
CREATE TABLE IF NOT EXISTS incentive_systems (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('points', 'tokens', 'reputation', 'privileges')) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT, -- JSON array of incentive rules
  rewards TEXT, -- JSON array of available rewards
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. مؤشرات الأداء (Performance Metrics)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  session_id TEXT,
  team_id TEXT,
  cpu_usage REAL,
  memory_usage REAL,
  network_latency INTEGER,
  tasks_completed INTEGER,
  success_rate REAL,
  response_time INTEGER,
  energy_level REAL,
  active_superpowers TEXT, -- JSON array
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES collab_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES agent_teams(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collab_sessions_leader ON collab_sessions(leader_id);
CREATE INDEX IF NOT EXISTS idx_collab_sessions_status ON collab_sessions(status);
CREATE INDEX IF NOT EXISTS idx_collab_sessions_created_at ON collab_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_collab_tasks_session ON collab_tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_collab_tasks_assigned_to ON collab_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_collab_tasks_status ON collab_tasks(status);
CREATE INDEX IF NOT EXISTS idx_collab_tasks_priority ON collab_tasks(priority);

CREATE INDEX IF NOT EXISTS idx_agent_reputation_agent_id ON agent_reputation(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_reputation_overall_score ON agent_reputation(overall_score);

CREATE INDEX IF NOT EXISTS idx_swarm_knowledge_session ON swarm_knowledge(session_id);
CREATE INDEX IF NOT EXISTS idx_swarm_knowledge_contributor ON swarm_knowledge(contributor_id);
CREATE INDEX IF NOT EXISTS idx_swarm_knowledge_type ON swarm_knowledge(type);
CREATE INDEX IF NOT EXISTS idx_swarm_knowledge_quality ON swarm_knowledge(quality_score);

CREATE INDEX IF NOT EXISTS idx_collab_messages_session ON collab_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_collab_messages_sender ON collab_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_collab_messages_target ON collab_messages(target_id);
CREATE INDEX IF NOT EXISTS idx_collab_messages_created_at ON collab_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_agent ON team_members(agent_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

CREATE INDEX IF NOT EXISTS idx_audit_trail_agent ON audit_trail(agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_session ON audit_trail(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_agent ON performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);