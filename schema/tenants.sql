-- Schema for Multi-Tenant Architecture
-- Phase 1: Foundation
CREATE TYPE tenant_tier AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE tenant_status AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tier tenant_tier NOT NULL DEFAULT 'FREE',
    status tenant_status NOT NULL DEFAULT 'ACTIVE',
    rate_limits JSONB DEFAULT '{"requests_per_minute": 60, "tokens_per_minute": 10000}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Index for faster lookups by name (optional, but good for admin)
CREATE INDEX idx_tenants_name ON tenants(name);
-- RLS Policy Placeholder (To be enabled in later steps)
-- ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;