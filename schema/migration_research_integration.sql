-- Migration Script for Research and AIX Integration
-- This script safely updates existing databases with new integration schema
-- Compatible with existing Digital Soul Protocol schema

-- Start transaction for atomic operation
BEGIN;

-- Create migration tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    migration_name VARCHAR(255) PRIMARY KEY,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

-- Check if this migration has already been executed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE migration_name = 'research_integration_schema') THEN
        RAISE EXCEPTION 'Migration research_integration_schema has already been executed';
    END IF;
END $$;

-- Record migration start time
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := CURRENT_TIMESTAMP;
    migration_name VARCHAR(255) := 'research_integration_schema';
    error_message TEXT;
BEGIN
    -- Create Enums for Integration Schema
    -- Agent Research Activity Type Enum
    CREATE TYPE agent_activity_type AS ENUM ('QUERY_INITIATED', 'RESULT_RECEIVED', 'SYNTHESIS_GENERATED', 'DECISION_MADE', 'KNOWLEDGE_UPDATED');

    -- Research Decision Impact Level Enum
    CREATE TYPE decision_impact_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

    -- AIX Integration Status Enum
    CREATE TYPE aix_integration_status AS ENUM ('PENDING', 'ACTIVE', 'SYNCED', 'ERROR', 'DEPRECATED');

    -- Create Agent Research History Table
    -- Tracks agent's research activities and learning outcomes
    CREATE TABLE IF NOT EXISTS agent_research_history (
        history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
        agent_id UUID NOT NULL,
        activity_type agent_activity_type NOT NULL,
        query_id UUID REFERENCES research_queries(query_id),
        research_data JSONB DEFAULT '{}'::jsonb,
        learning_outcome TEXT,
        confidence_impact DECIMAL(3,2) CHECK (confidence_impact >= 0.0 AND confidence_impact <= 1.0),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Research Driven Decisions Table
    -- Stores decisions made with research backing and evidence
    CREATE TABLE IF NOT EXISTS research_driven_decisions (
        decision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
        agent_id UUID NOT NULL,
        query_id UUID NOT NULL REFERENCES research_queries(query_id),
        decision_title VARCHAR(500) NOT NULL,
        decision_description TEXT NOT NULL,
        research_evidence JSONB NOT NULL,
        impact_level decision_impact_level NOT NULL,
        confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
        outcome_status VARCHAR(50) DEFAULT 'PENDING',
        implementation_details JSONB DEFAULT '{}'::jsonb,
        created_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create AIX Agent Integration Table
    -- Tracks AIX format integration with agents
    CREATE TABLE IF NOT EXISTS aix_agent_integration (
        integration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
        agent_id UUID NOT NULL,
        document_id UUID NOT NULL REFERENCES aix_documents(document_id),
        integration_status aix_integration_status NOT NULL DEFAULT 'PENDING',
        sync_timestamp TIMESTAMP WITH TIME ZONE,
        error_details JSONB DEFAULT '{}'::jsonb,
        configuration_mapping JSONB DEFAULT '{}'::jsonb,
        last_validated_at TIMESTAMP WITH TIME ZONE,
        compliance_score DECIMAL(3,2) CHECK (compliance_score >= 0.0 AND compliance_score <= 1.0),
        created_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Indexes for Agent Research History
    CREATE INDEX IF NOT EXISTS idx_agent_research_history_tenant_id ON agent_research_history(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_agent_research_history_agent_id ON agent_research_history(agent_id);
    CREATE INDEX IF NOT EXISTS idx_agent_research_history_activity_type ON agent_research_history(activity_type);
    CREATE INDEX IF NOT EXISTS idx_agent_research_history_query_id ON agent_research_history(query_id);
    CREATE INDEX IF NOT EXISTS idx_agent_research_history_confidence_impact ON agent_research_history(confidence_impact);
    CREATE INDEX IF NOT EXISTS idx_agent_research_history_created_at ON agent_research_history(created_at);

    -- Create Indexes for Research Driven Decisions
    CREATE INDEX IF NOT EXISTS idx_research_driven_decisions_tenant_id ON research_driven_decisions(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_research_driven_decisions_agent_id ON research_driven_decisions(agent_id);
    CREATE INDEX IF NOT EXISTS idx_research_driven_decisions_query_id ON research_driven_decisions(query_id);
    CREATE INDEX IF NOT EXISTS idx_research_driven_decisions_impact_level ON research_driven_decisions(impact_level);
    CREATE INDEX IF NOT EXISTS idx_research_driven_decisions_confidence_score ON research_driven_decisions(confidence_score);
    CREATE INDEX IF NOT EXISTS idx_research_driven_decisions_outcome_status ON research_driven_decisions(outcome_status);
    CREATE INDEX IF NOT EXISTS idx_research_driven_decisions_created_at ON research_driven_decisions(created_at);

    -- Create Indexes for AIX Agent Integration
    CREATE INDEX IF NOT EXISTS idx_aix_agent_integration_tenant_id ON aix_agent_integration(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_aix_agent_integration_agent_id ON aix_agent_integration(agent_id);
    CREATE INDEX IF NOT EXISTS idx_aix_agent_integration_document_id ON aix_agent_integration(document_id);
    CREATE INDEX IF NOT EXISTS idx_aix_agent_integration_status ON aix_agent_integration(integration_status);
    CREATE INDEX IF NOT EXISTS idx_aix_agent_integration_sync_timestamp ON aix_agent_integration(sync_timestamp);
    CREATE INDEX IF NOT EXISTS idx_aix_agent_integration_compliance_score ON aix_agent_integration(compliance_score);
    CREATE INDEX IF NOT EXISTS idx_aix_agent_integration_last_validated_at ON aix_agent_integration(last_validated_at);
    CREATE INDEX IF NOT EXISTS idx_aix_agent_integration_created_at ON aix_agent_integration(created_at);

    -- Enable Row Level Security Policies
    ALTER TABLE agent_research_history ENABLE ROW LEVEL SECURITY;
    ALTER TABLE research_driven_decisions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE aix_agent_integration ENABLE ROW LEVEL SECURITY;

    -- Create RLS Policies for Agent Research History
    CREATE POLICY IF NOT EXISTS agent_research_history_tenant_isolation ON agent_research_history USING (
        tenant_id = current_setting('app.current_tenant_id')::uuid
    );

    -- Create RLS Policies for Research Driven Decisions
    CREATE POLICY IF NOT EXISTS research_driven_decisions_tenant_isolation ON research_driven_decisions USING (
        tenant_id = current_setting('app.current_tenant_id')::uuid
    );

    -- Create RLS Policies for AIX Agent Integration
    CREATE POLICY IF NOT EXISTS aix_agent_integration_tenant_isolation ON aix_agent_integration USING (
        tenant_id = current_setting('app.current_tenant_id')::uuid
    );

    -- Create Triggers for updated_at timestamps
    CREATE TRIGGER IF NOT EXISTS set_agent_research_history_timestamp
    BEFORE UPDATE ON agent_research_history
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

    CREATE TRIGGER IF NOT EXISTS set_research_driven_decisions_timestamp
    BEFORE UPDATE ON research_driven_decisions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

    CREATE TRIGGER IF NOT EXISTS set_aix_agent_integration_timestamp
    BEFORE UPDATE ON aix_agent_integration
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

    -- Create Function to calculate agent research engagement metrics
    CREATE OR REPLACE FUNCTION calculate_agent_research_engagement(agent_uuid UUID, date_range_start TIMESTAMP WITH TIME ZONE, date_range_end TIMESTAMP WITH TIME ZONE)
    RETURNS JSONB AS $$
    DECLARE
        result JSONB;
        query_count INTEGER;
        synthesis_count INTEGER;
        decision_count INTEGER;
        avg_confidence DECIMAL;
    BEGIN
        -- Count different activity types in the date range
        SELECT COUNT(*) INTO query_count
        FROM agent_research_history 
        WHERE agent_id = agent_uuid 
          AND activity_type = 'QUERY_INITIATED'
          AND created_at >= date_range_start 
          AND created_at <= date_range_end;
        
        SELECT COUNT(*) INTO synthesis_count
        FROM agent_research_history 
        WHERE agent_id = agent_uuid 
          AND activity_type = 'SYNTHESIS_GENERATED'
          AND created_at >= date_range_start 
          AND created_at <= date_range_end;
        
        SELECT COUNT(*) INTO decision_count
        FROM research_driven_decisions 
        WHERE agent_id = agent_uuid 
          AND created_at >= date_range_start 
          AND created_at <= date_range_end;
        
        -- Calculate average confidence impact
        SELECT COALESCE(AVG(confidence_impact), 0) INTO avg_confidence
        FROM agent_research_history 
        WHERE agent_id = agent_uuid 
          AND created_at >= date_range_start 
          AND created_at <= date_range_end;
        
        -- Build result JSON
        result := jsonb_build_object(
            'agent_id', agent_uuid,
            'date_range_start', date_range_start,
            'date_range_end', date_range_end,
            'queries_initiated', query_count,
            'syntheses_generated', synthesis_count,
            'decisions_made', decision_count,
            'average_confidence_impact', ROUND(avg_confidence, 2),
            'engagement_score', LEAST(100, (query_count * 10) + (synthesis_count * 15) + (decision_count * 20))
        );
        
        RETURN result;
    END;
    $$ LANGUAGE plpgsql;

    -- Create Function to update AIX integration compliance score
    CREATE OR REPLACE FUNCTION update_aix_integration_compliance(integration_uuid UUID)
    RETURNS DECIMAL AS $$
    DECLARE
        new_compliance_score DECIMAL;
        agent_record agents%ROWTYPE;
        document_record aix_documents%ROWTYPE;
        integration_record aix_agent_integration%ROWTYPE;
    BEGIN
        -- Get integration record with related data
        SELECT aai.*, a.*, d.compliance_score as document_compliance
        INTO integration_record, agent_record, document_record
        FROM aix_agent_integration aai
        JOIN agents a ON aai.agent_id = a.agent_id
        JOIN aix_documents d ON aai.document_id = d.document_id
        WHERE aai.integration_id = integration_uuid;
        
        IF NOT FOUND THEN
            RETURN 0.0;
        END IF;
        
        -- Calculate compliance score based on document compliance and integration status
        IF integration_record.integration_status = 'ACTIVE' OR integration_record.integration_status = 'SYNCED' THEN
            new_compliance_score := document_record.compliance_score;
        ELSIF integration_record.integration_status = 'PENDING' THEN
            new_compliance_score := document_record.compliance_score * 0.5;
        ELSIF integration_record.integration_status = 'ERROR' THEN
            new_compliance_score := document_record.compliance_score * 0.25;
        ELSE -- DEPRECATED
            new_compliance_score := document_record.compliance_score * 0.1;
        END IF;
        
        -- Update the compliance score
        UPDATE aix_agent_integration 
        SET compliance_score = new_compliance_score,
            last_validated_at = CURRENT_TIMESTAMP
        WHERE integration_id = integration_uuid;
        
        RETURN new_compliance_score;
    END;
    $$ LANGUAGE plpgsql;

    -- Add comments to tables for documentation
    COMMENT ON TABLE agent_research_history IS 'Tracks agent research activities and learning outcomes';
    COMMENT ON TABLE research_driven_decisions IS 'Stores decisions made with research backing and evidence';
    COMMENT ON TABLE aix_agent_integration IS 'Tracks AIX format integration with agents';

    -- Record successful migration
    INSERT INTO schema_migrations (migration_name, executed_at, execution_time_ms, success)
    VALUES (migration_name, CURRENT_TIMESTAMP, EXTRACT(MILLISECOND FROM (CURRENT_TIMESTAMP - start_time))::INTEGER, TRUE);

EXCEPTION
    WHEN OTHERS THEN
        -- Rollback on error and record failure
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        INSERT INTO schema_migrations (migration_name, executed_at, execution_time_ms, success, error_message)
        VALUES (migration_name, CURRENT_TIMESTAMP, EXTRACT(MILLISECOND FROM (CURRENT_TIMESTAMP - start_time))::INTEGER, FALSE, error_message);
        RAISE;
END;

-- Commit transaction
COMMIT;

-- Validation checks to ensure migration was successful
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Check that all tables were created
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('agent_research_history', 'research_driven_decisions', 'aix_agent_integration');
    
    IF table_count != 3 THEN
        RAISE EXCEPTION 'Not all integration tables were created. Expected 3, found %', table_count;
    END IF;
    
    -- Check that indexes were created
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND (
          tablename LIKE 'agent_research_history%' OR
          tablename LIKE 'research_driven_decisions%' OR
          tablename LIKE 'aix_agent_integration%'
      );
    
    IF index_count < 15 THEN -- Minimum expected indexes
        RAISE EXCEPTION 'Not all integration indexes were created. Expected at least 15, found %', index_count;
    END IF;
    
    -- Check that RLS policies were created
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND (
          tablename = 'agent_research_history' OR
          tablename = 'research_driven_decisions' OR
          tablename = 'aix_agent_integration'
      );
    
    IF policy_count < 3 THEN -- Minimum expected policies
        RAISE EXCEPTION 'Not all RLS policies were created. Expected at least 3, found %', policy_count;
    END IF;
    
    RAISE NOTICE 'Migration validation completed successfully. All integration tables, indexes, and policies are in place.';
END $$;