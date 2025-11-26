/**
 * 📊 PERFORMANCE METRICS COLLECTION API
 * 
 * RESTful API endpoints for collecting, storing, and retrieving agent performance metrics.
 * Integrates with Cloudflare Durable Objects for scalable metrics storage.
 * 
 * Endpoints:
 * - POST /api/performance/metrics - Submit metrics for an agent
 * - GET /api/performance/metrics - Retrieve metrics with filtering
 * - GET /api/performance/metrics/[agentId] - Get specific agent metrics
 * - DELETE /api/performance/metrics/[agentId] - Clear agent metrics
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  AgentPerformanceMetrics, 
  PerformanceAlert,
  TimeRange,
  DEFAULT_PERFORMANCE_THRESHOLDS 
} from '@/infra/core/PerformanceMetricsTypes';

// Validation schemas
const MetricsSubmissionSchema = z.object({
  agentId: z.string().min(1),
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  networkLatency: z.number().min(0),
  diskIO: z.number().min(0),
  tasksCompleted: z.number().min(0),
  tasksFailed: z.number().min(0),
  successRate: z.number().min(0).max(100),
  averageResponseTime: z.number().min(0),
  throughput: z.number().min(0),
  userSatisfaction: z.number().min(0).max(100),
  errorRate: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100),
  energyLevel: z.number().min(0).max(100),
  activeSuperpowers: z.array(z.string()),
  skillMasteryLevel: z.number().min(0).max(100),
  revenueGenerated: z.number().min(0),
  costPerTask: z.number().min(0),
  efficiency: z.number().min(0)
});

const MetricsQuerySchema = z.object({
  agentId: z.string().optional(),
  timeRange: z.enum(['1h', '6h', '24h', '7d', '30d', '90d']).optional(),
  metrics: z.string().optional(), // comma-separated list
  aggregation: z.enum(['raw', 'avg', 'sum', 'min', 'max']).optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  offset: z.string().optional().transform(val => val ? parseInt(val) : undefined)
});

/**
 * POST - Submit performance metrics for an agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = MetricsSubmissionSchema.parse(body);
    
    // Create metrics object
    const metrics: AgentPerformanceMetrics = {
      ...validatedData,
      timestamp: new Date()
    };
    
    // Store in Durable Object
    const metricsDO = getMetricsDurableObject();
    await metricsDO.storeMetrics(metrics);
    
    // Check for alerts
    await checkPerformanceAlerts(metrics);
    
    // Broadcast real-time updates
    await broadcastMetricsUpdate(metrics);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Metrics recorded successfully',
      timestamp: metrics.timestamp 
    });
    
  } catch (error) {
    console.error('Error recording metrics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * GET - Retrieve performance metrics with filtering options
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = MetricsQuerySchema.parse(query);
    
    // Parse metrics list if provided
    const metricsFilter = validatedQuery.metrics 
      ? validatedQuery.metrics.split(',').map(m => m.trim())
      : undefined;
    
    // Convert time range to dates
    const timeRange = validatedQuery.timeRange 
      ? convertTimeRange(validatedQuery.timeRange)
      : undefined;
    
    // Get metrics from Durable Object
    const metricsDO = getMetricsDurableObject();
    const result = await metricsDO.getMetrics({
      agentId: validatedQuery.agentId,
      timeRange,
      metrics: metricsFilter,
      aggregation: validatedQuery.aggregation || 'raw',
      limit: validatedQuery.limit || 1000,
      offset: validatedQuery.offset || 0
    });
    
    return NextResponse.json({
      success: true,
      data: result.metrics,
      pagination: result.pagination,
      filters: {
        agentId: validatedQuery.agentId,
        timeRange: validatedQuery.timeRange,
        metrics: metricsFilter,
        aggregation: validatedQuery.aggregation
      }
    });
    
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * DELETE - Clear metrics for an agent
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    
    if (!agentId) {
      return NextResponse.json({ 
        error: 'Agent ID is required' 
      }, { status: 400 });
    }
    
    // Clear metrics from Durable Object
    const metricsDO = getMetricsDurableObject();
    await metricsDO.clearAgentMetrics(agentId);
    
    return NextResponse.json({ 
      success: true, 
      message: `Metrics cleared for agent ${agentId}` 
    });
    
  } catch (error) {
    console.error('Error clearing metrics:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get metrics Durable Object instance
 */
function getMetricsDurableObject() {
  // This would be injected from environment in production
  // For now, we'll use a mock implementation
  return new MetricsDurableObject();
}

/**
 * Convert time range string to date range
 */
function convertTimeRange(range: string): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  
  switch (range) {
    case '1h':
      start = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '6h':
      start = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      break;
    case '24h':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return { start, end: now };
}

/**
 * Check for performance alerts based on thresholds
 */
async function checkPerformanceAlerts(metrics: AgentPerformanceMetrics): Promise<void> {
  const alerts: PerformanceAlert[] = [];
  
  // Check CPU threshold
  if (metrics.cpu >= DEFAULT_PERFORMANCE_THRESHOLDS.cpu.critical) {
    alerts.push({
      id: `cpu_critical_${metrics.agentId}_${Date.now()}`,
      agentId: metrics.agentId,
      metric: 'cpu',
      threshold: DEFAULT_PERFORMANCE_THRESHOLDS.cpu.critical,
      operator: 'gte',
      severity: 'critical',
      enabled: true,
      cooldown: 5,
      notificationChannels: ['webhook', 'email'],
      lastTriggered: new Date()
    });
  } else if (metrics.cpu >= DEFAULT_PERFORMANCE_THRESHOLDS.cpu.warning) {
    alerts.push({
      id: `cpu_warning_${metrics.agentId}_${Date.now()}`,
      agentId: metrics.agentId,
      metric: 'cpu',
      threshold: DEFAULT_PERFORMANCE_THRESHOLDS.cpu.warning,
      operator: 'gte',
      severity: 'warning',
      enabled: true,
      cooldown: 10,
      notificationChannels: ['webhook'],
      lastTriggered: new Date()
    });
  }
  
  // Check memory threshold
  if (metrics.memory >= DEFAULT_PERFORMANCE_THRESHOLDS.memory.critical) {
    alerts.push({
      id: `memory_critical_${metrics.agentId}_${Date.now()}`,
      agentId: metrics.agentId,
      metric: 'memory',
      threshold: DEFAULT_PERFORMANCE_THRESHOLDS.memory.critical,
      operator: 'gte',
      severity: 'critical',
      enabled: true,
      cooldown: 5,
      notificationChannels: ['webhook', 'email'],
      lastTriggered: new Date()
    });
  }
  
  // Check success rate threshold
  if (metrics.successRate <= DEFAULT_PERFORMANCE_THRESHOLDS.successRate.critical) {
    alerts.push({
      id: `success_rate_critical_${metrics.agentId}_${Date.now()}`,
      agentId: metrics.agentId,
      metric: 'successRate',
      threshold: DEFAULT_PERFORMANCE_THRESHOLDS.successRate.critical,
      operator: 'lte',
      severity: 'critical',
      enabled: true,
      cooldown: 5,
      notificationChannels: ['webhook', 'email'],
      lastTriggered: new Date()
    });
  }
  
  // Store and process alerts
  if (alerts.length > 0) {
    const alertsDO = getAlertsDurableObject();
    await alertsDO.processAlerts(alerts);
  }
}

/**
 * Broadcast metrics updates via WebSocket
 */
async function broadcastMetricsUpdate(metrics: AgentPerformanceMetrics): Promise<void> {
  const wsDO = getWebSocketDurableObject();
  await wsDO.broadcast({
    type: 'metrics_update',
    timestamp: new Date(),
    data: metrics,
    agentId: metrics.agentId
  });
}

// ============================================================================
// MOCK DURABLE OBJECT IMPLEMENTATIONS
// ============================================================================

class MetricsDurableObject {
  private metrics: Map<string, AgentPerformanceMetrics[]> = new Map();
  
  async storeMetrics(metrics: AgentPerformanceMetrics): Promise<void> {
    const agentMetrics = this.metrics.get(metrics.agentId) || [];
    agentMetrics.push(metrics);
    
    // Keep only last 10,000 metrics per agent to prevent memory issues
    if (agentMetrics.length > 10000) {
      agentMetrics.splice(0, agentMetrics.length - 10000);
    }
    
    this.metrics.set(metrics.agentId, agentMetrics);
  }
  
  async getMetrics(options: {
    agentId?: string;
    timeRange?: { start: Date; end: Date };
    metrics?: string[];
    aggregation: string;
    limit: number;
    offset: number;
  }): Promise<{ metrics: AgentPerformanceMetrics[]; pagination: any }> {
    let allMetrics: AgentPerformanceMetrics[] = [];
    
    if (options.agentId) {
      allMetrics = this.metrics.get(options.agentId) || [];
    } else {
      // Get all agent metrics
      for (const agentMetrics of this.metrics.values()) {
        allMetrics.push(...agentMetrics);
      }
    }
    
    // Filter by time range
    if (options.timeRange) {
      allMetrics = allMetrics.filter(m => 
        m.timestamp >= options.timeRange!.start && 
        m.timestamp <= options.timeRange!.end
      );
    }
    
    // Sort by timestamp (newest first)
    allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply pagination
    const startIndex = options.offset;
    const endIndex = startIndex + options.limit;
    const paginatedMetrics = allMetrics.slice(startIndex, endIndex);
    
    return {
      metrics: paginatedMetrics,
      pagination: {
        total: allMetrics.length,
        offset: options.offset,
        limit: options.limit,
        hasMore: endIndex < allMetrics.length
      }
    };
  }
  
  async clearAgentMetrics(agentId: string): Promise<void> {
    this.metrics.delete(agentId);
  }
}

class AlertsDurableObject {
  async processAlerts(alerts: PerformanceAlert[]): Promise<void> {
    // In a real implementation, this would:
    // - Check cooldown periods
    // - Send notifications via configured channels
    // - Store alert history
    console.log('Processing alerts:', alerts);
  }
}

class WebSocketDurableObject {
  async broadcast(message: any): Promise<void> {
    // In a real implementation, this would broadcast to connected WebSocket clients
    console.log('Broadcasting message:', message);
  }
}

function getAlertsDurableObject() {
  return new AlertsDurableObject();
}

function getWebSocketDurableObject() {
  return new WebSocketDurableObject();
}