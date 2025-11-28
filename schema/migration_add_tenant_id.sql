-- Migration: Add tenant_id to existing tables
-- Phase 1: Foundation
-- 1. Users Table
ALTER TABLE IF EXISTS users
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
-- 2. Flights Table (Example)
ALTER TABLE IF EXISTS flights
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_flights_tenant_id ON flights(tenant_id);
-- 3. Bookings Table (Example)
ALTER TABLE IF EXISTS bookings
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id);
-- 4. Audit Logs (if exists)
ALTER TABLE IF EXISTS audit_logs
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
-- Repeat for other tables as needed