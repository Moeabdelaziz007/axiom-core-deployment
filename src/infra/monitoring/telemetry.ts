import {
    trace,
    context,
    propagation,
    ROOT_CONTEXT,
    SpanStatusCode,
} from '@opentelemetry/api';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

// 1. Configuration Constants
const SERVICE_NAME = 'quantum-command-center';
const ENVIRONMENT = 'production';
const COLLECTOR_ENDPOINT = 'https://otel-collector.axiom.com/v1/traces'; // Mock Collector URL

// 2. Resource and Provider Initialization
const provider = new WebTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: ENVIRONMENT,
        // Add multi-tenancy flag to the resource globally
        'custom.multitenancy.enabled': true,
    }),
});

// 3. Exporter Setup (Simulated for Worker environment)
// In a real Worker, you'd use a dedicated OTLP exporter for Cloudflare or a proxy.
// We use ConsoleExporter for testing the output structure.
const exporter = new ConsoleSpanExporter();
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// 4. Get the Tracer instance
const tracer = trace.getTracer(SERVICE_NAME, '1.0.0');

/**
 * Executes a function within a new OpenTelemetry span, automatically 
 * injecting the Tenant ID as a semantic attribute.
 * * @param operationName - Name of the operation (e.g., 'handle_optimization_request')
 * @param tenantId - The extracted tenant ID (required for multi-tenancy)
 * @param callback - The function containing the logic to be tracked
 * @returns The result of the callback function
 */
export async function traceOperation<T>(
    operationName: string,
    tenantId: string,
    callback: (span: any) => Promise<T>
): Promise<T> {
    // Use ROOT_CONTEXT or current context if propagation is handled by a separate middleware
    const span = tracer.startSpan(operationName, undefined, ROOT_CONTEXT);

    // CRITICAL: Inject the tenant ID into the Span Attributes
    span.setAttribute('tenant.id', tenantId);
    span.setAttribute('operation.source', 'api-gateway');

    try {
        const result = await context.with(trace.setSpan(context.active(), span), () => callback(span));
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
    } catch (error) {
        span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
        });
        // Record the error for detailed inspection
        span.recordException(error as Error);
        throw error;
    } finally {
        span.end();
    }
}

// Optional: Function to initialize the global provider (can be called once at Worker startup)
export function initializeTelemetry() {
    // Provider needs to be registered once
    provider.register();
    console.log('OpenTelemetry Provider Registered.');
}
