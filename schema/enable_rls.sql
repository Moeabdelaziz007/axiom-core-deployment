-- Enable Row Level Security (RLS)
-- Phase 1: Foundation
-- Enable RLS on tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- Create Policy for Tenants Table
-- Tenants can only see their own record
CREATE POLICY tenant_isolation_policy ON tenants USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);
-- Create Policy for Users Table
CREATE POLICY user_tenant_isolation_policy ON users USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);
-- Create Policy for Flights Table
CREATE POLICY flight_tenant_isolation_policy ON flights USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);
-- Create Policy for Bookings Table
CREATE POLICY booking_tenant_isolation_policy ON bookings USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);
-- Note: The application must set 'app.current_tenant_id' at the start of each transaction.
-- Example: SET app.current_tenant_id = 'uuid-of-tenant';