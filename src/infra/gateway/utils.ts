import { jwtDecode } from "jwt-decode";

/**
 * Extracts the tenant_id from the request headers or JWT token.
 * 
 * Priority:
 * 1. X-Tenant-ID header
 * 2. Authorization header (Bearer token) -> tenant_id claim
 * 3. Default: "ANONYMOUS-TRIAL"
 * 
 * @param request The incoming HTTP request
 * @returns The extracted tenant_id
 */
export function extractTenantId(request: Request): string {
    try {
        // 1. Check X-Tenant-ID header
        const headerTenantId = request.headers.get("X-Tenant-ID");
        if (headerTenantId) {
            return headerTenantId;
        }

        // 2. Check Authorization header (JWT)
        const authHeader = request.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            try {
                const decoded: any = jwtDecode(token);
                if (decoded && decoded.tenant_id) {
                    return decoded.tenant_id;
                }
            } catch (e) {
                console.warn("Failed to decode JWT:", e);
                // Continue to default
            }
        }

        // 3. Default
        return "ANONYMOUS-TRIAL";

    } catch (error) {
        console.error("Error extracting tenant ID:", error);
        return "ANONYMOUS-TRIAL";
    }
}
