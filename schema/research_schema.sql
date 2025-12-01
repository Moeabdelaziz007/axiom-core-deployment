-- Research Data Schema for Digital Soul Protocol
-- This schema defines tables for storing research queries, results, synthesis, and cache
-- Compatible with existing multi-tenant architecture

-- Research Query Status Enum
CREATE TYPE research_query_status AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Research Result Confidence Enum
CREATE TYPE research_confidence AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- Research Synthesis Type Enum
CREATE TYPE synthesis_type AS ENUM ('SUMMARY', 'ANALYSIS', 'INSIGHT', 'RECOMMENDATION');

-- Research Queries Table
-- Stores research queries and their metadata
CREATE TABLE IF NOT EXISTS research_queries (
    query_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    agent_id UUID NOT NULL, -- Reference to agent executing the query
    query_text TEXT NOT NULL,
    query_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    parameters JSONB DEFAULT '{}'::jsonb,
    status research_query_status NOT NULL DEFAULT 'PENDING',
    priority INTEGER NOT NULL DEFAULT 5, -- 1-10 priority scale
    estimated_duration_minutes INTEGER,
    max_results INTEGER DEFAULT 50,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Research Results Table
-- Stores research results with full data and analysis
CREATE TABLE IF NOT EXISTS research_results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    query_id UUID NOT NULL REFERENCES research_queries(query_id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL, -- Source of research data (e.g., "google_deep_research")
    source_url TEXT,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    confidence research_confidence NOT NULL DEFAULT 'MEDIUM',
    relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0),
    metadata JSONB DEFAULT '{}'::jsonb,
    raw_data JSONB, -- Store original response from source
    processing_time_ms INTEGER,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Research Synthesis Table
-- Stores synthesized research outcomes
CREATE TABLE IF NOT EXISTS research_synthesis (
    synthesis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    query_id UUID NOT NULL REFERENCES research_queries(query_id) ON DELETE CASCADE,
    synthesis_type synthesis_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    key_insights TEXT[],
    recommendations TEXT[],
    confidence research_confidence NOT NULL DEFAULT 'MEDIUM',
    supporting_result_ids UUID[] DEFAULT '{}', -- Array of result IDs that support this synthesis
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Research Cache Table
-- Cache frequently accessed research data
CREATE TABLE IF NOT EXISTS research_cache (
    cache_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    cache_data JSONB NOT NULL,
    cache_type VARCHAR(50) NOT NULL, -- 'query_result', 'synthesis', 'aggregated_data'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Research Queries
CREATE INDEX idx_research_queries_tenant_id ON research_queries(tenant_id);
CREATE INDEX idx_research_queries_agent_id ON research_queries(agent_id);
CREATE INDEX idx_research_queries_status ON research_queries(status);
CREATE INDEX idx_research_queries_created_at ON research_queries(created_at);
CREATE INDEX idx_research_queries_priority ON research_queries(priority);

-- Indexes for Research Results
CREATE INDEX idx_research_results_tenant_id ON research_results(tenant_id);
CREATE INDEX idx_research_results_query_id ON research_results(query_id);
CREATE INDEX idx_research_results_source ON research_results(source);
CREATE INDEX idx_research_results_confidence ON research_results(confidence);
CREATE INDEX idx_research_results_relevance ON research_results(relevance_score);
CREATE INDEX idx_research_results_created_at ON research_results(created_at);

-- Indexes for Research Synthesis
CREATE INDEX idx_research_synthesis_tenant_id ON research_synthesis(tenant_id);
CREATE INDEX idx_research_synthesis_query_id ON research_synthesis(query_id);
CREATE INDEX idx_research_synthesis_type ON research_synthesis(synthesis_type);
CREATE INDEX idx_research_synthesis_confidence ON research_synthesis(confidence);
CREATE INDEX idx_research_synthesis_created_at ON research_synthesis(created_at);

-- Indexes for Research Cache
CREATE INDEX idx_research_cache_tenant_id ON research_cache(tenant_id);
CREATE INDEX idx_research_cache_key ON research_cache(cache_key);
CREATE INDEX idx_research_cache_type ON research_cache(cache_type);
CREATE INDEX idx_research_cache_expires_at ON research_cache(expires_at);

-- Row Level Security Policies
ALTER TABLE research_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_synthesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Research Queries
CREATE POLICY research_queries_tenant_isolation ON research_queries USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for Research Results
CREATE POLICY research_results_tenant_isolation ON research_results USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for Research Synthesis
CREATE POLICY research_synthesis_tenant_isolation ON research_synthesis USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for Research Cache
CREATE POLICY research_cache_tenant_isolation ON research_cache USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_research_queries_timestamp
BEFORE UPDATE ON research_queries
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_research_results_timestamp
BEFORE UPDATE ON research_results
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_research_synthesis_timestamp
BEFORE UPDATE ON research_synthesis
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_research_cache_timestamp
BEFORE UPDATE ON research_cache
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_research_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM research_cache 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comment on tables for documentation
COMMENT ON TABLE research_queries IS 'Stores research queries and their execution metadata';
COMMENT ON TABLE research_results IS 'Stores detailed results from research queries with analysis';
COMMENT ON TABLE research_synthesis IS 'Stores synthesized research outcomes and insights';
COMMENT ON TABLE research_cache IS 'Caches frequently accessed research data for performance';