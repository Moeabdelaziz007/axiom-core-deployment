import { extractTenantId } from "./utils";
import { traceOperation, initializeTelemetry } from "../monitoring/telemetry";

// Initialize Telemetry (Global)
initializeTelemetry();

export interface Env {
    // Define bindings here
    ORCHESTRATOR_URL: string;
}

export interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // 1. Extract Tenant ID
        const tenantId = extractTenantId(request);
        console.log(`[Gateway] Request for Tenant: ${tenantId}`);

        // 2. Wrap execution in a Trace Span
        return traceOperation("gateway_handle_request", tenantId, async (span) => {

            // 3. Clone request to add the header (if it wasn't there)
            const newRequest = new Request(request);
            if (!newRequest.headers.has("X-Tenant-ID")) {
                newRequest.headers.set("X-Tenant-ID", tenantId);
            }

            // 4. Forward to Orchestrator (Mocking the forward logic)
            // In a real scenario, this would fetch the Orchestrator Worker
            // const response = await fetch(env.ORCHESTRATOR_URL, newRequest);

            // For now, return a response echoing the tenant ID
            return new Response(JSON.stringify({
                message: "Request processed by Gateway",
                tenant_id: tenantId,
                status: "forwarded",
                trace_id: span.spanContext().traceId
            }), {
                headers: { "Content-Type": "application/json" }
            });
        });
    },
};
