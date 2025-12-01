-- AIX Format Schema for Digital Soul Protocol
-- This schema defines tables for storing AIX documents, capabilities, skills, knowledge bases, behaviors, and ethical guidelines
-- Compatible with existing multi-tenant architecture

-- AIX Document Status Enum
CREATE TYPE aix_document_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DEPRECATED');

-- AIX Capability Type Enum
CREATE TYPE aix_capability_type AS ENUM ('COGNITIVE', 'PERCEPTUAL', 'MOTOR', 'COMMUNICATION', 'REASONING');

-- AIX Skill Level Enum
CREATE TYPE aix_skill_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'MASTER');

-- AIX Knowledge Base Type Enum
CREATE TYPE aix_kb_type AS ENUM ('FACTUAL', 'PROCEDURAL', 'CONCEPTUAL', 'META_COGNITIVE');

-- AIX Behavior Type Enum
CREATE TYPE aix_behavior_type AS ENUM ('REACTIVE', 'PROACTIVE', 'ADAPTIVE', 'LEARNING');

-- AIX Ethical Framework Enum
CREATE TYPE aix_ethical_framework AS ENUM ('UTILITARIAN', 'DEONTOLOGICAL', 'VIRTUE_ETHICS', 'CARE_ETHICS', 'CUSTOM');

-- AIX Documents Table
-- Stores complete AIX documents with full structure and metadata
CREATE TABLE IF NOT EXISTS aix_documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    agent_id UUID NOT NULL, -- Reference to the agent this document belongs to
    document_name VARCHAR(255) NOT NULL,
    document_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    status aix_document_status NOT NULL DEFAULT 'DRAFT',
    document_structure JSONB NOT NULL, -- Complete AIX document structure
    capabilities UUID[] DEFAULT '{}', -- Array of capability IDs
    skills UUID[] DEFAULT '{}', -- Array of skill IDs
    knowledge_bases UUID[] DEFAULT '{}', -- Array of knowledge base IDs
    behaviors UUID[] DEFAULT '{}', -- Array of behavior IDs
    ethical_guidelines UUID[] DEFAULT '{}', -- Array of ethical guideline IDs
    metadata JSONB DEFAULT '{}'::jsonb,
    validation_status VARCHAR(50) DEFAULT 'PENDING',
    compliance_score DECIMAL(3,2) CHECK (compliance_score >= 0.0 AND compliance_score <= 1.0),
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- AIX Capabilities Table
-- Stores AIX capability definitions with detailed specifications
CREATE TABLE IF NOT EXISTS aix_capabilities (
    capability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    capability_name VARCHAR(255) NOT NULL,
    capability_type aix_capability_type NOT NULL,
    description TEXT NOT NULL,
    specification JSONB NOT NULL, -- Detailed capability specification
    input_parameters JSONB DEFAULT '{}'::jsonb,
    output_parameters JSONB DEFAULT '{}'::jsonb,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    dependencies UUID[] DEFAULT '{}', -- Array of dependent capability IDs
    is_composite BOOLEAN DEFAULT FALSE,
    parent_capability_id UUID REFERENCES aix_capabilities(capability_id),
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIX Skills Table
-- Stores AIX skill implementations with training data and performance metrics
CREATE TABLE IF NOT EXISTS aix_skills (
    skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    skill_name VARCHAR(255) NOT NULL,
    capability_id UUID NOT NULL REFERENCES aix_capabilities(capability_id),
    skill_level aix_skill_level NOT NULL,
    description TEXT NOT NULL,
    implementation JSONB NOT NULL, -- Skill implementation details
    training_data JSONB DEFAULT '{}'::jsonb,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    proficiency_score DECIMAL(3,2) CHECK (proficiency_score >= 0.0 AND proficiency_score <= 1.0),
    training_hours INTEGER DEFAULT 0,
    last_trained_at TIMESTAMP WITH TIME ZONE,
    certification_status VARCHAR(50) DEFAULT 'UNCERTIFIED',
    prerequisites UUID[] DEFAULT '{}', -- Array of prerequisite skill IDs
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIX Knowledge Bases Table
-- Stores AIX knowledge base entries with structured information
CREATE TABLE IF NOT EXISTS aix_knowledge_bases (
    kb_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    kb_name VARCHAR(255) NOT NULL,
    kb_type aix_kb_type NOT NULL,
    domain VARCHAR(255) NOT NULL,
    content JSONB NOT NULL, -- Structured knowledge content
    source_references TEXT[],
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
    last_verified_at TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    access_level VARCHAR(50) DEFAULT 'PUBLIC',
    tags TEXT[] DEFAULT '{}',
    related_kb_ids UUID[] DEFAULT '{}', -- Array of related knowledge base IDs
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIX Behaviors Table
-- Stores AIX behavioral patterns and response models
CREATE TABLE IF NOT EXISTS aix_behaviors (
    behavior_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    behavior_name VARCHAR(255) NOT NULL,
    behavior_type aix_behavior_type NOT NULL,
    description TEXT NOT NULL,
    trigger_conditions JSONB NOT NULL, -- Conditions that trigger this behavior
    response_model JSONB NOT NULL, -- Behavioral response model
    learning_algorithm JSONB DEFAULT '{}'::jsonb,
    adaptation_rules JSONB DEFAULT '{}'::jsonb,
    ethical_constraints UUID[] DEFAULT '{}', -- Array of ethical guideline IDs
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    activation_frequency INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2) CHECK (success_rate >= 0.0 AND success_rate <= 1.0),
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIX Ethical Guidelines Table
-- Stores AIX ethical frameworks and guidelines
CREATE TABLE IF NOT EXISTS aix_ethical_guidelines (
    guideline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    guideline_name VARCHAR(255) NOT NULL,
    ethical_framework aix_ethical_framework NOT NULL,
    description TEXT NOT NULL,
    principles JSONB NOT NULL, -- Ethical principles and rules
    constraints JSONB DEFAULT '{}'::jsonb, -- Ethical constraints
    enforcement_mechanisms JSONB DEFAULT '{}'::jsonb,
    violation_consequences JSONB DEFAULT '{}'::jsonb,
    priority_level INTEGER NOT NULL DEFAULT 5, -- 1-10 priority scale
    scope VARCHAR(255) NOT NULL DEFAULT 'GLOBAL',
    is_mandatory BOOLEAN DEFAULT FALSE,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for AIX Documents
CREATE INDEX idx_aix_documents_tenant_id ON aix_documents(tenant_id);
CREATE INDEX idx_aix_documents_agent_id ON aix_documents(agent_id);
CREATE INDEX idx_aix_documents_status ON aix_documents(status);
CREATE INDEX idx_aix_documents_version ON aix_documents(document_version);
CREATE INDEX idx_aix_documents_compliance ON aix_documents(compliance_score);
CREATE INDEX idx_aix_documents_created_at ON aix_documents(created_at);

-- Indexes for AIX Capabilities
CREATE INDEX idx_aix_capabilities_tenant_id ON aix_capabilities(tenant_id);
CREATE INDEX idx_aix_capabilities_type ON aix_capabilities(capability_type);
CREATE INDEX idx_aix_capabilities_status ON aix_capabilities(status);
CREATE INDEX idx_aix_capabilities_parent ON aix_capabilities(parent_capability_id);
CREATE INDEX idx_aix_capabilities_name ON aix_capabilities(capability_name);
CREATE INDEX idx_aix_capabilities_created_at ON aix_capabilities(created_at);

-- Indexes for AIX Skills
CREATE INDEX idx_aix_skills_tenant_id ON aix_skills(tenant_id);
CREATE INDEX idx_aix_skills_capability_id ON aix_skills(capability_id);
CREATE INDEX idx_aix_skills_level ON aix_skills(skill_level);
CREATE INDEX idx_aix_skills_proficiency ON aix_skills(proficiency_score);
CREATE INDEX idx_aix_skills_certification ON aix_skills(certification_status);
CREATE INDEX idx_aix_skills_created_at ON aix_skills(created_at);

-- Indexes for AIX Knowledge Bases
CREATE INDEX idx_aix_knowledge_bases_tenant_id ON aix_knowledge_bases(tenant_id);
CREATE INDEX idx_aix_knowledge_bases_type ON aix_knowledge_bases(kb_type);
CREATE INDEX idx_aix_knowledge_bases_domain ON aix_knowledge_bases(domain);
CREATE INDEX idx_aix_knowledge_bases_confidence ON aix_knowledge_bases(confidence_score);
CREATE INDEX idx_aix_knowledge_bases_verification ON aix_knowledge_bases(verification_status);
CREATE INDEX idx_aix_knowledge_bases_tags ON aix_knowledge_bases USING GIN(tags);
CREATE INDEX idx_aix_knowledge_bases_created_at ON aix_knowledge_bases(created_at);

-- Indexes for AIX Behaviors
CREATE INDEX idx_aix_behaviors_tenant_id ON aix_behaviors(tenant_id);
CREATE INDEX idx_aix_behaviors_type ON aix_behaviors(behavior_type);
CREATE INDEX idx_aix_behaviors_active ON aix_behaviors(is_active);
CREATE INDEX idx_aix_behaviors_success_rate ON aix_behaviors(success_rate);
CREATE INDEX idx_aix_behaviors_frequency ON aix_behaviors(activation_frequency);
CREATE INDEX idx_aix_behaviors_created_at ON aix_behaviors(created_at);

-- Indexes for AIX Ethical Guidelines
CREATE INDEX idx_aix_ethical_guidelines_tenant_id ON aix_ethical_guidelines(tenant_id);
CREATE INDEX idx_aix_ethical_guidelines_framework ON aix_ethical_guidelines(ethical_framework);
CREATE INDEX idx_aix_ethical_guidelines_priority ON aix_ethical_guidelines(priority_level);
CREATE INDEX idx_aix_ethical_guidelines_mandatory ON aix_ethical_guidelines(is_mandatory);
CREATE INDEX idx_aix_ethical_guidelines_scope ON aix_ethical_guidelines(scope);
CREATE INDEX idx_aix_ethical_guidelines_created_at ON aix_ethical_guidelines(created_at);

-- Row Level Security Policies
ALTER TABLE aix_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE aix_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE aix_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE aix_knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE aix_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE aix_ethical_guidelines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AIX Documents
CREATE POLICY aix_documents_tenant_isolation ON aix_documents USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for AIX Capabilities
CREATE POLICY aix_capabilities_tenant_isolation ON aix_capabilities USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for AIX Skills
CREATE POLICY aix_skills_tenant_isolation ON aix_skills USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for AIX Knowledge Bases
CREATE POLICY aix_knowledge_bases_tenant_isolation ON aix_knowledge_bases USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for AIX Behaviors
CREATE POLICY aix_behaviors_tenant_isolation ON aix_behaviors USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- RLS Policies for AIX Ethical Guidelines
CREATE POLICY aix_ethical_guidelines_tenant_isolation ON aix_ethical_guidelines USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);

-- Triggers for updated_at timestamps
CREATE TRIGGER set_aix_documents_timestamp
BEFORE UPDATE ON aix_documents
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_aix_capabilities_timestamp
BEFORE UPDATE ON aix_capabilities
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_aix_skills_timestamp
BEFORE UPDATE ON aix_skills
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_aix_knowledge_bases_timestamp
BEFORE UPDATE ON aix_knowledge_bases
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_aix_behaviors_timestamp
BEFORE UPDATE ON aix_behaviors
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_aix_ethical_guidelines_timestamp
BEFORE UPDATE ON aix_ethical_guidelines
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Function to validate AIX document structure
CREATE OR REPLACE FUNCTION validate_aix_document_structure(document_structure JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic validation - check for required fields
    IF document_structure IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check for required top-level fields
    IF NOT (document_structure ? 'metadata' AND 
            document_structure ? 'capabilities' AND 
            document_structure ? 'skills' AND 
            document_structure ? 'knowledge_bases' AND 
            document_structure ? 'behaviors' AND 
            document_structure ? 'ethical_guidelines') THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Comment on tables for documentation
COMMENT ON TABLE aix_documents IS 'Stores complete AIX documents with full structure and metadata';
COMMENT ON TABLE aix_capabilities IS 'Stores AIX capability definitions with detailed specifications';
COMMENT ON TABLE aix_skills IS 'Stores AIX skill implementations with training data and performance metrics';
COMMENT ON TABLE aix_knowledge_bases IS 'Stores AIX knowledge base entries with structured information';
COMMENT ON TABLE aix_behaviors IS 'Stores AIX behavioral patterns and response models';
COMMENT ON TABLE aix_ethical_guidelines IS 'Stores AIX ethical frameworks and guidelines';