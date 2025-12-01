-- Research Workers Schema for Digital Soul Protocol
-- This schema defines tables for tracking research workers, tasks, and performance metrics
-- Compatible with existing multi-tenant architecture

-- Research Worker Status Enum
CREATE TYPE research_worker_status AS ENUM ('IDLE', 'BUSY', 'MAINTENANCE', 'OFFLINE', 'ERROR');

-- Research Task Status Enum
CREATE TYPE research_task_status AS ENUM ('QUEUED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Research Task Priority Enum
CREATE TYPE research_task_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL');

-- Research Worker Type Enum
CREATE TYPE research_worker_type AS ENUM ('GOOGLE_DEEP_RESEARCH', 'Nafs_WORKER', 'CUSTOM_API', 'LOCAL_PROCESSOR');

-- Research Workers Table
-- Track worker status, configuration, and performance
CREATE TABLE IF NOT EXISTS research_workers (
    worker_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    worker_name VARCHAR(255) NOT NULL,
    worker_type research_worker_type NOT NULL,
    status research_worker_status NOT NULL DEFAULT 'IDLE',
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb, -- Worker-specific configuration
    capabilities TEXT[] DEFAULT '{}', -- Array of worker capabilities
    max_concurrent_tasks INTEGER NOT NULL DEFAULT 1,
    current_tasks INTEGER NOT NULL DEFAULT 0,
    endpoint_url VARCHAR(500), -- API endpoint for remote workers
    authentication JSONB DEFAULT '{}'::jsonb, -- Authentication credentials
    health_check_url VARCHAR(500),
    health_check_interval_seconds INTEGER DEFAULT 60,
    last_health_check_at TIMESTAMP WITH TIME ZONE,
    last_heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_tasks_completed INTEGER DEFAULT 0,
    total_tasks_failed INTEGER DEFAULT 0,
    average_task_duration_seconds DECIMAL(10,2),
    success_rate DECIMAL(3,2) DEFAULT 1.0 CHECK (success_rate >= 0.0 AND success_rate <= 1.0),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Research Tasks Table
-- Queue and track research tasks assigned to workers
CREATE TABLE IF NOT EXISTS research_tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    query_id UUID NOT NULL REFERENCES research_queries(query_id),
    worker_id UUID REFERENCES research_workers(worker_id), -- NULL when unassigned
    task_name VARCHAR(255) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    description TEXT,
    status research_task_status NOT NULL DEFAULT 'QUEUED',
    priority research_task_priority NOT NULL DEFAULT 'NORMAL',
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    parameters JSONB DEFAULT '{}'::jsonb,
    estimated_duration_seconds INTEGER,
    actual_duration_seconds INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    error_details JSONB DEFAULT '{}'::jsonb,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    assigned_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    deadline_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Worker Performance Metrics Table
-- Store detailed performance data for workers
CREATE TABLE IF NOT EXISTS worker_performance_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    worker_id UUID NOT NULL REFERENCES research_workers(worker_id),
    task_id UUID REFERENCES research_tasks(task_id),
    metric_type VARCHAR(100) NOT NULL, -- 'task_completion', 'response_time', 'accuracy', etc.
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    metric_unit VARCHAR(50), -- 'seconds', 'percentage', 'count', etc.
    baseline_value DECIMAL(15,6), -- For comparison
    threshold_value DECIMAL(15,6), -- Alert threshold
    is_within_threshold BOOLEAN DEFAULT TRUE,
    measurement_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    context JSONB DEFAULT '{}'::jsonb, -- Additional context for the metric
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Worker Task History Table
-- Historical record of all tasks assigned to workers
CREATE TABLE IF NOT EXISTS worker_task_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    worker_id UUID NOT NULL REFERENCES research_workers(worker_id),
    task_id UUID NOT NULL REFERENCES research_tasks(task_id),
    action VARCHAR(100) NOT NULL, -- 'assigned', 'started', 'completed', 'failed', 'cancelled'
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    previous_status research_task_status,
    new_status research_task_status,
    duration_seconds INTEGER,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Research Workers
CREATE INDEX idx_research_workers_tenant_id ON research_workers(tenant_id);
CREATE INDEX idx_research_workers_type ON research_workers(worker_type);
CREATE INDEX idx_research_workers_status ON research_workers(status);
CREATE INDEX idx_research_workers_active ON research_workers(is_active);
CREATE INDEX idx_research_workers_heartbeat ON research_workers(last_heartbeat_at);
CREATE INDEX idx_research_workers_success_rate ON research_workers(success_rate);
CREATE INDEX idx_research_workers_created_at ON research_workers(created_at);

-- Indexes for Research Tasks
CREATE INDEX idx_research_tasks_tenant_id ON research_tasks(tenant_id);
CREATE INDEX idx_research_tasks_query_id ON research_tasks(query_id);
CREATE INDEX idx_research_tasks_worker_id ON research_tasks(worker_id);
CREATE INDEX idx_research_tasks_status ON research_tasks(status);
CREATE INDEX idx_research_tasks_priority ON research_tasks(priority);
CREATE INDEX idx_research_tasks_created_at ON research_tasks(created_at);
CREATE INDEX idx_research_tasks_deadline ON research_tasks(deadline_at);
CREATE INDEX idx_research_tasks_assigned_at ON research_tasks(assigned_at);

-- Indexes for Worker Performance Metrics
CREATE INDEX idx_worker_performance_metrics_tenant_id ON worker_performance_metrics(tenant_id);
CREATE INDEX idx_worker_performance_metrics_worker_id ON worker_performance_metrics(worker_id);
CREATE INDEX idx_worker_performance_metrics_task_id ON worker_performance_metrics(task_id);
CREATE INDEX idx_worker_performance_metrics_type ON worker_performance_metrics(metric_type);
CREATE INDEX idx_worker_performance_metrics_timestamp ON worker_performance_metrics(measurement_timestamp);
CREATE INDEX idx_worker_performance_metrics_threshold ON worker_performance_metrics(is_within_threshold);

-- Indexes for Worker Task History
CREATE INDEX idx_worker_task_history_tenant_id ON worker_task_history(tenant_id);
CREATE INDEX idx_worker_task_history_worker_id ON worker_task_history(worker_id);
CREATE INDEX idx_worker_task_history_task_id ON worker_task_history(task_id);
CREATE INDEX idx_worker_task_history_action ON worker_task_history(action);
CREATE INDEX idx_worker_task_history_timestamp ON worker_task_history(action_timestamp);

-- Row Level Security Policies
ALTER TABLE research_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_task_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Research Workers
CREATE POLICY research_workers_tenant_isolation ON research_workers USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for Research Tasks
CREATE POLICY research_tasks_tenant_isolation ON research_tasks USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for Worker Performance Metrics
CREATE POLICY worker_performance_metrics_tenant_isolation ON worker_performance_metrics USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for Worker Task History
CREATE POLICY worker_task_history_tenant_isolation ON worker_task_history USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- Triggers for updated_at timestamps
CREATE TRIGGER set_research_workers_timestamp
BEFORE UPDATE ON research_workers
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_research_tasks_timestamp
BEFORE UPDATE ON research_tasks
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Function to update worker task counts
CREATE OR REPLACE FUNCTION update_worker_task_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment current_tasks when a task is assigned to a worker
        IF NEW.worker_id IS NOT NULL AND NEW.status = 'ASSIGNED' THEN
            UPDATE research_workers 
            SET current_tasks = current_tasks + 1 
            WHERE worker_id = NEW.worker_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle task status changes
        IF OLD.worker_id IS NOT NULL AND NEW.worker_id IS NOT NULL THEN
            -- Task completed or failed - decrement current_tasks
            IF OLD.status IN ('ASSIGNED', 'IN_PROGRESS') AND NEW.status IN ('COMPLETED', 'FAILED', 'CANCELLED') THEN
                UPDATE research_workers 
                SET current_tasks = current_tasks - 1,
                    total_tasks_completed = CASE WHEN NEW.status = 'COMPLETED' THEN total_tasks_completed + 1 ELSE total_tasks_completed END,
                    total_tasks_failed = CASE WHEN NEW.status = 'FAILED' THEN total_tasks_failed + 1 ELSE total_tasks_failed END
                WHERE worker_id = OLD.worker_id;
            -- Task reassigned to different worker
            ELSIF OLD.worker_id != NEW.worker_id AND NEW.status = 'ASSIGNED' THEN
                UPDATE research_workers 
                SET current_tasks = current_tasks - 1 
                WHERE worker_id = OLD.worker_id;
                
                UPDATE research_workers 
                SET current_tasks = current_tasks + 1 
                WHERE worker_id = NEW.worker_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement current_tasks when a task is deleted
        IF OLD.worker_id IS NOT NULL AND OLD.status IN ('ASSIGNED', 'IN_PROGRESS') THEN
            UPDATE research_workers 
            SET current_tasks = current_tasks - 1 
            WHERE worker_id = OLD.worker_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for worker task count updates
CREATE TRIGGER update_worker_task_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON research_tasks
FOR EACH ROW EXECUTE FUNCTION update_worker_task_counts();

-- Function to check worker availability
CREATE OR REPLACE FUNCTION is_worker_available(worker_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    worker_record research_workers%ROWTYPE;
BEGIN
    SELECT * INTO worker_record 
    FROM research_workers 
    WHERE worker_id = worker_uuid AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if worker is idle and has capacity
    IF worker_record.status = 'IDLE' AND 
       worker_record.current_tasks < worker_record.max_concurrent_tasks THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get best available worker for task type
CREATE OR REPLACE FUNCTION get_best_available_worker(task_type_param VARCHAR)
RETURNS UUID AS $$
DECLARE
    best_worker_id UUID;
BEGIN
    SELECT worker_id INTO best_worker_id
    FROM research_workers 
    WHERE is_active = TRUE 
      AND status = 'IDLE' 
      AND current_tasks < max_concurrent_tasks
      AND task_type_param = ANY(capabilities)
    ORDER BY success_rate DESC, total_tasks_completed DESC, current_tasks ASC
    LIMIT 1;
    
    RETURN best_worker_id;
END;
$$ LANGUAGE plpgsql;

-- Comment on tables for documentation
COMMENT ON TABLE research_workers IS 'Tracks research worker status, configuration, and performance';
COMMENT ON TABLE research_tasks IS 'Queues and tracks research tasks assigned to workers';
COMMENT ON TABLE worker_performance_metrics IS 'Stores detailed performance data for workers';
COMMENT ON TABLE worker_task_history IS 'Historical record of all tasks assigned to workers';