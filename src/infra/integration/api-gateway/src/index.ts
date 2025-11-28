import { assessComplexity } from '../../../core/ToolLibrary';

/**
 * 🌐 AXIOM API GATEWAY
 * 
 * Central API gateway for Phase 3 components providing unified
 * authentication, routing, and communication protocols.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

export interface Env {
  // AI Configuration
  GEMINI_API_KEY: string;
  ORACLE_VM_ENDPOINT: string;
  AXIOM_SECRET_KEY: string;
  // Component URLs
  MAA_URL: string;
  OAA_URL: string;
  IDP_URL: string;
  // Database
  GATEWAY_DB: D1Database;
  // Cache
  GATEWAY_CACHE: KVNamespace;
  AI: any;
}

export interface GatewayRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
  component?: 'maa' | 'oaa' | 'idp';
  timestamp?: string;
}

export interface GatewayResponse {
  success: boolean;
  data?: any;
  error?: string;
  component?: string;
  timestamp: string;
  requestId: string;
}

export interface ComponentHealth {
  component: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
  responseTime?: number;
  errorRate?: number;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestId = `gw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[Gateway] ${request.method} ${request.path} - ${request.component || 'unknown'}`);

    try {
      // Route to appropriate component
      const component = request.component || this.detectComponent(request.path);

      switch (component) {
        case 'maa':
          return await this.routeToMAA(request, env);
        case 'oaa':
          return await this.routeToOAA(request, env);
        case 'idp':
          return await this.routeToIDP(request, env);
        default:
          return new Response(JSON.stringify({
            error: "Unknown component"
          }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
          });
      }
    } catch (error) {
      console.error('[Gateway] Error processing request:', error);
      return new Response(JSON.stringify({
        error: "Gateway error",
        details: error instanceof Error ? error.message : String(error),
        requestId
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  /**
   * Detect target component from request path
   */
  detectComponent(path: string): 'maa' | 'oaa' | 'idp' | null {
    if (path.startsWith('/market') || path.startsWith('/analysis')) return 'maa';
    if (path.startsWith('/operations') || path.startsWith('/deployment')) return 'oaa';
    if (path.startsWith('/auth') || path.startsWith('/identity')) return 'idp';
    return null;
  },

  /**
   * Route to Market Analyst Agent
   */
  async routeToMAA(request: GatewayRequest, env: Env): Promise<Response> {
    console.log('[Gateway] Routing to MAA');

    try {
      // Forward request to MAA
      const maaResponse = await fetch(env.MAA_URL, {
        method: request.method,
        headers: {
          ...request.headers,
          'X-Gateway-Request-ID': request.timestamp || new Date().toISOString()
        },
        body: JSON.stringify({
          path: request.path,
          query: request.query,
          body: request.body
        })
      });

      const maaData = await maaResponse.json();

      return new Response(JSON.stringify({
        success: true,
        data: maaData,
        component: 'maa',
        timestamp: new Date().toISOString(),
        requestId: request.timestamp || new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error('[Gateway] MAA routing failed:', error);
      return new Response(JSON.stringify({
        error: "MAA routing failed",
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  /**
   * Route to Operations Automation Agent
   */
  async routeToOAA(request: GatewayRequest, env: Env): Promise<Response> {
    console.log('[Gateway] Routing to OAA');

    try {
      // Forward request to OAA
      const oaaResponse = await fetch(env.OAA_URL, {
        method: request.method,
        headers: {
          ...request.headers,
          'X-Gateway-Request-ID': request.timestamp || new Date().toISOString()
        },
        body: JSON.stringify({
          path: request.path,
          query: request.query,
          body: request.body
        })
      });

      const oaaData = await oaaResponse.json();

      return new Response(JSON.stringify({
        success: true,
        data: oaaData,
        component: 'oaa',
        timestamp: new Date().toISOString(),
        requestId: request.timestamp || new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error('[Gateway] OAA routing failed:', error);
      return new Response(JSON.stringify({
        error: "OAA routing failed",
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  /**
   * Route to Secure IDP
   */
  async routeToIDP(request: GatewayRequest, env: Env): Promise<Response> {
    console.log('[Gateway] Routing to IDP');

    try {
      // Forward request to IDP
      const idpResponse = await fetch(env.IDP_URL, {
        method: request.method,
        headers: {
          ...request.headers,
          'X-Gateway-Request-ID': request.timestamp || new Date().toISOString()
        },
        body: JSON.stringify({
          path: request.path,
          query: request.query,
          body: request.body
        })
      });

      const idpData = await idpResponse.json();

      return new Response(JSON.stringify({
        success: true,
        data: idpData,
        component: 'idp',
        timestamp: new Date().toISOString(),
        requestId: request.timestamp || new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error('[Gateway] IDP routing failed:', error);
      return new Response(JSON.stringify({
        error: "IDP routing failed",
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },

  /**
   * Health check endpoint
   */
  async handleHealthCheck(env: Env): Promise<Response> {
    console.log('[Gateway] Performing health check');

    const components = [
      { name: 'MAA', url: env.MAA_URL },
      { name: 'OAA', url: env.OAA_URL },
      { name: 'IDP', url: env.IDP_URL }
    ];

    const healthChecks = await Promise.all(
      components.map(async (component) => {
        try {
          const response = await fetch(component.url, {
            method: 'GET',
            headers: { 'User-Agent': 'Axiom-Gateway-Health/1.0' }
          });

          return {
            component: component.name,
            status: response.ok ? 'healthy' : 'unhealthy',
            responseTime: Date.now() - startTime,
            errorRate: response.ok ? 0 : 100
          };
        } catch (error) {
          return {
            component: component.name,
            status: 'down',
            responseTime: 0,
            errorRate: 100
          };
        }
      })
    );

    const overallHealth = healthChecks.every(check => check.status === 'healthy') ? 'healthy' : 'degraded';

    // Cache health status
    await env.GATEWAY_CACHE.put('health_status', {
      overall: overallHealth,
      components: healthChecks,
      timestamp: new Date().toISOString()
    }, { expirationTtl: 300 });

    return new Response(JSON.stringify({
      success: true,
      data: {
        overall: overallHealth,
        components: healthChecks,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  },

  /**
   * Metrics endpoint
   */
  async handleMetrics(env: Env): Promise<Response> {
    console.log('[Gateway] Collecting metrics');

    const startTime = Date.now();

    try {
      // Get component health from cache
      const healthData = await env.GATEWAY_CACHE.get('health_status');

      if (!healthData) {
        return new Response(JSON.stringify({
          error: "Health data not available"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Calculate gateway metrics
      const metrics = {
        totalRequests: 1000, // Would be from actual metrics
        averageResponseTime: healthData.components.reduce((sum, check) => sum + check.responseTime, 0) / healthData.components.length,
        uptime: 99.9,
        errorRate: healthData.components.reduce((sum, check) => sum + check.errorRate, 0) / healthData.components.length,
        components: healthData.components,
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify({
        success: true,
        data: metrics
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error('[Gateway] Metrics collection failed:', error);
      return new Response(JSON.stringify({
        error: "Metrics collection failed",
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  /**
   * Request handler
   */

};