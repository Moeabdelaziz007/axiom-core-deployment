import { paymentsDb } from '@/lib/db';
import { getOutboxProcessor, OutboxMetrics } from './outbox-processor';

// Monitoring interfaces
export interface OutboxMonitoringMetrics {
  timestamp: number;
  outboxMetrics: OutboxMetrics;
  databaseMetrics: DatabaseMetrics;
  performanceMetrics: PerformanceMetrics;
  eventMetrics: EventMetrics;
  subscriptionMetrics: SubscriptionMetrics;
  deadLetterMetrics: DeadLetterMetrics;
}

export interface DatabaseMetrics {
  connectionPoolSize: number;
  activeConnections: number;
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    failedQueries: number;
  };
  storageMetrics: {
    totalSize: number;
    outboxTableSize: number;
    deadLetterTableSize: number;
    indexEfficiency: number;
  };
}

export interface PerformanceMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  eventProcessingRate: number;
  averageLatency: number;
  errorRate: number;
  throughput: number;
}

export interface EventMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByStatus: Record<string, number>;
  eventsByAggregate: Record<string, number>;
  processingTimeDistribution: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  retryMetrics: {
    totalRetries: number;
    averageRetries: number;
    maxRetries: number;
    retrySuccessRate: number;
  };
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  subscriptionsByConsumer: Record<string, number>;
  deliverySuccessRate: number;
  averageDeliveryTime: number;
  failedDeliveries: number;
}

export interface DeadLetterMetrics {
  totalDeadLetters: number;
  deadLettersByReason: Record<string, number>;
  deadLettersByEventType: Record<string, number>;
  resolutionRate: number;
  averageResolutionTime: number;
  oldestDeadLetterAge: number;
}

export interface HealthCheckResult {
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    outboxProcessor: boolean;
    eventProcessing: boolean;
    subscriptionDelivery: boolean;
  };
  issues: string[];
  recommendations: string[];
}

// Main monitoring class
export class OutboxMonitor {
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private metricsHistory: OutboxMonitoringMetrics[] = [];
  private maxHistorySize = 1000; // Keep last 1000 data points
  private alertThresholds = {
    errorRate: 0.05, // 5% error rate
    latency: 5000, // 5 seconds
    deadLetterRate: 0.02, // 2% dead letter rate
    memoryUsage: 0.8 // 80% memory usage
  };

  constructor(private monitoringIntervalMs: number = 30000) { // 30 seconds default
  }

  // Start monitoring
  public async start(): Promise<void> {
    if (this.isMonitoring) {
      console.warn('Outbox monitoring is already running');
      return;
    }

    console.log('🔍 Starting outbox monitoring');
    this.isMonitoring = true;

    // Initial metrics collection
    await this.collectMetrics();

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(
      () => this.collectMetrics(),
      this.monitoringIntervalMs
    );
  }

  // Stop monitoring
  public async stop(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    console.log('🛑 Stopping outbox monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // Collect comprehensive metrics
  public async collectMetrics(): Promise<OutboxMonitoringMetrics> {
    const timestamp = Date.now();

    try {
      // Collect metrics from different sources
      const [
        outboxMetrics,
        databaseMetrics,
        performanceMetrics,
        eventMetrics,
        subscriptionMetrics,
        deadLetterMetrics
      ] = await Promise.all([
        this.collectOutboxMetrics(),
        this.collectDatabaseMetrics(),
        this.collectPerformanceMetrics(),
        this.collectEventMetrics(),
        this.collectSubscriptionMetrics(),
        this.collectDeadLetterMetrics()
      ]);

      const metrics: OutboxMonitoringMetrics = {
        timestamp,
        outboxMetrics,
        databaseMetrics,
        performanceMetrics,
        eventMetrics,
        subscriptionMetrics,
        deadLetterMetrics
      };

      // Store in history
      this.metricsHistory.push(metrics);
      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
      }

      // Check for alerts
      await this.checkAlerts(metrics);

      return metrics;

    } catch (error) {
      console.error('Failed to collect metrics:', error);
      throw error;
    }
  }

  // Collect outbox processor metrics
  private async collectOutboxMetrics(): Promise<OutboxMetrics> {
    try {
      const processor = getOutboxProcessor();
      return await processor.healthCheck();
    } catch (error) {
      console.error('Failed to collect outbox metrics:', error);
      return {
        healthy: false,
        isRunning: false,
        activeBatches: 0,
        metrics: {
          processedEvents: 0,
          failedEvents: 0,
          deadLetterEvents: 0,
          averageProcessingTime: 0,
          eventsByType: {},
          retryCount: 0,
          lastProcessedAt: 0
        },
        lastCheck: Date.now()
      };
    }
  }

  // Collect database metrics
  private async collectDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      // Test database connection
      const connectionTest = await paymentsDb.execute('SELECT 1');
      const connectionHealthy = connectionTest.success;

      // Get table sizes
      const [outboxSize, deadLetterSize] = await Promise.all([
        paymentsDb.execute('SELECT COUNT(*) as count FROM transactional_outbox'),
        paymentsDb.execute('SELECT COUNT(*) as count FROM dead_letter_queue')
      ]);

      // Get query performance (simplified - in production you'd use more sophisticated monitoring)
      const queryPerformance = await this.getQueryPerformanceMetrics();

      return {
        connectionPoolSize: 1, // Simplified - would get from connection pool
        activeConnections: connectionHealthy ? 1 : 0,
        queryPerformance,
        storageMetrics: {
          totalSize: outboxSize.rows[0].count + deadLetterSize.rows[0].count,
          outboxTableSize: outboxSize.rows[0].count,
          deadLetterTableSize: deadLetterSize.rows[0].count,
          indexEfficiency: 0.95 // Simplified - would calculate from actual usage
        }
      };
    } catch (error) {
      console.error('Failed to collect database metrics:', error);
      return {
        connectionPoolSize: 0,
        activeConnections: 0,
        queryPerformance: {
          averageQueryTime: 0,
          slowQueries: 0,
          failedQueries: 1
        },
        storageMetrics: {
          totalSize: 0,
          outboxTableSize: 0,
          deadLetterTableSize: 0,
          indexEfficiency: 0
        }
      };
    }
  }

  // Collect performance metrics
  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Get event processing metrics from outbox
    const outboxMetrics = await this.collectOutboxMetrics();
    
    return {
      memoryUsage: memUsage,
      cpuUsage,
      eventProcessingRate: outboxMetrics.metrics.processedEvents / 60, // events per minute
      averageLatency: outboxMetrics.metrics.averageProcessingTime,
      errorRate: outboxMetrics.metrics.failedEvents / Math.max(outboxMetrics.metrics.processedEvents, 1),
      throughput: outboxMetrics.metrics.processedEvents // total events processed
    };
  }

  // Collect event metrics
  private async collectEventMetrics(): Promise<EventMetrics> {
    try {
      // Get event statistics
      const [eventStats, retryStats] = await Promise.all([
        paymentsDb.execute(`
          SELECT 
            event_type,
            status,
            COUNT(*) as count,
            AVG(CASE WHEN published_at IS NOT NULL THEN 
              (published_at - created_at) 
            ELSE NULL END) as avg_processing_time
          FROM transactional_outbox 
          WHERE created_at > strftime('%s', 'now', '-24 hours')
          GROUP BY event_type, status
        `),
        paymentsDb.execute(`
          SELECT 
            retry_count,
            COUNT(*) as count
          FROM transactional_outbox 
          WHERE status = 'published' AND retry_count > 0
          AND created_at > strftime('%s', 'now', '-24 hours')
          GROUP BY retry_count
        `)
      ]);

      // Process event statistics
      const eventsByType: Record<string, number> = {};
      const eventsByStatus: Record<string, number> = {};
      let totalEvents = 0;
      const processingTimes: number[] = [];

      eventStats.rows.forEach((row: any) => {
        eventsByType[row.event_type] = (eventsByType[row.event_type] || 0) + row.count;
        eventsByStatus[row.status] = (eventsByStatus[row.status] || 0) + row.count;
        totalEvents += row.count;
        
        if (row.avg_processing_time) {
          processingTimes.push(row.avg_processing_time);
        }
      });

      // Calculate processing time distribution
      const sortedTimes = processingTimes.sort((a, b) => a - b);
      const processingTimeDistribution = {
        p50: sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0,
        p90: sortedTimes[Math.floor(sortedTimes.length * 0.9)] || 0,
        p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0,
        p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0
      };

      // Calculate retry metrics
      const retryMetrics = this.calculateRetryMetrics(retryStats.rows);

      return {
        totalEvents,
        eventsByType,
        eventsByStatus,
        processingTimeDistribution,
        retryMetrics
      };
    } catch (error) {
      console.error('Failed to collect event metrics:', error);
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsByStatus: {},
        processingTimeDistribution: {
          p50: 0,
          p90: 0,
          p95: 0,
          p99: 0
        },
        retryMetrics: {
          totalRetries: 0,
          averageRetries: 0,
          maxRetries: 0,
          retrySuccessRate: 0
        }
      };
    }
  }

  // Collect subscription metrics
  private async collectSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    try {
      const [subscriptionStats, deliveryStats] = await Promise.all([
        paymentsDb.execute(`
          SELECT 
            consumer_name,
            status,
            COUNT(*) as count
          FROM event_subscriptions 
          GROUP BY consumer_name, status
        `),
        paymentsDb.execute(`
          SELECT 
            status,
            COUNT(*) as count,
            AVG(CASE WHEN delivered_at IS NOT NULL THEN 
              (delivered_at - created_at) 
            ELSE NULL END) as avg_delivery_time
          FROM event_delivery_log 
          WHERE created_at > strftime('%s', 'now', '-24 hours')
          GROUP BY status
        `)
      ]);

      // Process subscription statistics
      const subscriptionsByConsumer: Record<string, number> = {};
      let totalSubscriptions = 0;
      let activeSubscriptions = 0;

      subscriptionStats.rows.forEach((row: any) => {
        subscriptionsByConsumer[row.consumer_name] = 
          (subscriptionsByConsumer[row.consumer_name] || 0) + row.count;
        totalSubscriptions += row.count;
        if (row.status === 'active') {
          activeSubscriptions += row.count;
        }
      });

      // Calculate delivery metrics
      const deliveryStatsProcessed = deliveryStats.rows.reduce((acc: any, row: any) => {
        acc[row.status] = row;
        return acc;
      }, {});

      const successfulDeliveries = deliveryStatsProcessed.delivered?.count || 0;
      const failedDeliveries = deliveryStatsProcessed.failed?.count || 0;
      const totalDeliveries = successfulDeliveries + failedDeliveries;
      const deliverySuccessRate = totalDeliveries > 0 ? successfulDeliveries / totalDeliveries : 1;
      const averageDeliveryTime = deliveryStatsProcessed.delivered?.avg_delivery_time || 0;

      return {
        totalSubscriptions,
        activeSubscriptions,
        subscriptionsByConsumer,
        deliverySuccessRate,
        averageDeliveryTime,
        failedDeliveries
      };
    } catch (error) {
      console.error('Failed to collect subscription metrics:', error);
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        subscriptionsByConsumer: {},
        deliverySuccessRate: 0,
        averageDeliveryTime: 0,
        failedDeliveries: 0
      };
    }
  }

  // Collect dead letter metrics
  private async collectDeadLetterMetrics(): Promise<DeadLetterMetrics> {
    try {
      const [deadLetterStats, resolutionStats] = await Promise.all([
        paymentsDb.execute(`
          SELECT 
            failure_reason,
            event_type,
            COUNT(*) as count,
            AVG(failed_at - created_at) as avg_age
          FROM dead_letter_queue 
          WHERE created_at > strftime('%s', 'now', '-24 hours')
          GROUP BY failure_reason, event_type
        `),
        paymentsDb.execute(`
          SELECT 
            COUNT(*) as count,
            AVG(resolved_at - failed_at) as avg_resolution_time
          FROM dead_letter_queue 
          WHERE resolved = TRUE
          AND resolved_at > strftime('%s', 'now', '-24 hours')
        `)
      ]);

      // Process dead letter statistics
      const deadLettersByReason: Record<string, number> = {};
      const deadLettersByEventType: Record<string, number> = {};
      let totalDeadLetters = 0;
      let oldestDeadLetterAge = 0;

      deadLetterStats.rows.forEach((row: any) => {
        deadLettersByReason[row.failure_reason] = 
          (deadLettersByReason[row.failure_reason] || 0) + row.count;
        deadLettersByEventType[row.event_type] = 
          (deadLettersByEventType[row.event_type] || 0) + row.count;
        totalDeadLetters += row.count;
        oldestDeadLetterAge = Math.max(oldestDeadLetterAge, row.avg_age || 0);
      });

      // Calculate resolution metrics
      const resolvedCount = resolutionStats.rows[0]?.count || 0;
      const resolutionRate = totalDeadLetters > 0 ? resolvedCount / totalDeadLetters : 0;
      const averageResolutionTime = resolutionStats.rows[0]?.avg_resolution_time || 0;

      return {
        totalDeadLetters,
        deadLettersByReason,
        deadLettersByEventType,
        resolutionRate,
        averageResolutionTime,
        oldestDeadLetterAge
      };
    } catch (error) {
      console.error('Failed to collect dead letter metrics:', error);
      return {
        totalDeadLetters: 0,
        deadLettersByReason: {},
        deadLettersByEventType: {},
        resolutionRate: 0,
        averageResolutionTime: 0,
        oldestDeadLetterAge: 0
      };
    }
  }

  // Calculate retry metrics
  private calculateRetryMetrics(retryStats: any[]): {
    totalRetries: number;
    averageRetries: number;
    maxRetries: number;
    retrySuccessRate: number;
  } {
    let totalRetries = 0;
    let totalEvents = 0;
    let maxRetries = 0;

    retryStats.forEach((row: any) => {
      totalRetries += row.retry_count * row.count;
      totalEvents += row.count;
      maxRetries = Math.max(maxRetries, row.retry_count);
    });

    const averageRetries = totalEvents > 0 ? totalRetries / totalEvents : 0;
    const retrySuccessRate = totalEvents > 0 ? (totalEvents - totalRetries) / totalEvents : 1;

    return {
      totalRetries,
      averageRetries,
      maxRetries,
      retrySuccessRate
    };
  }

  // Get query performance metrics
  private async getQueryPerformanceMetrics(): Promise<{
    averageQueryTime: number;
    slowQueries: number;
    failedQueries: number;
  }> {
    // This is a simplified implementation
    // In production, you'd use query logging and performance monitoring
    try {
      const testQuery = await paymentsDb.execute('SELECT 1');
      const queryTime = Math.random() * 100; // Simulated query time
      
      return {
        averageQueryTime: queryTime,
        slowQueries: queryTime > 1000 ? 1 : 0,
        failedQueries: testQuery.success ? 0 : 1
      };
    } catch (error) {
      return {
        averageQueryTime: 0,
        slowQueries: 0,
        failedQueries: 1
      };
    }
  }

  // Check for alerts and recommendations
  private async checkAlerts(metrics: OutboxMonitoringMetrics): Promise<void> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check error rate
    if (metrics.performanceMetrics.errorRate > this.alertThresholds.errorRate) {
      issues.push(`High error rate: ${(metrics.performanceMetrics.errorRate * 100).toFixed(2)}%`);
      recommendations.push('Investigate failing events and check system health');
    }

    // Check latency
    if (metrics.performanceMetrics.averageLatency > this.alertThresholds.latency) {
      issues.push(`High latency: ${metrics.performanceMetrics.averageLatency}ms`);
      recommendations.push('Optimize event processing and check database performance');
    }

    // Check dead letter rate
    const deadLetterRate = metrics.deadLetterMetrics.totalDeadLetters / Math.max(metrics.eventMetrics.totalEvents, 1);
    if (deadLetterRate > this.alertThresholds.deadLetterRate) {
      issues.push(`High dead letter rate: ${(deadLetterRate * 100).toFixed(2)}%`);
      recommendations.push('Review event validation and consumer configurations');
    }

    // Check memory usage
    const memoryUsageRatio = metrics.performanceMetrics.memoryUsage.heapUsed / metrics.performanceMetrics.memoryUsage.heapTotal;
    if (memoryUsageRatio > this.alertThresholds.memoryUsage) {
      issues.push(`High memory usage: ${(memoryUsageRatio * 100).toFixed(2)}%`);
      recommendations.push('Monitor memory leaks and consider scaling resources');
    }

    // Check database health
    if (!metrics.databaseMetrics.activeConnections) {
      issues.push('Database connection issues detected');
      recommendations.push('Check database connectivity and configuration');
    }

    // Check outbox processor health
    if (!metrics.outboxMetrics.healthy) {
      issues.push('Outbox processor health issues');
      recommendations.push('Restart outbox processor and check logs');
    }

    // Log alerts if any
    if (issues.length > 0) {
      console.warn('🚨 Monitoring Alerts:', issues);
      console.warn('💡 Recommendations:', recommendations);
      
      // In a real implementation, you might send alerts to monitoring systems
      // await this.sendAlerts(issues, recommendations);
    }
  }

  // Get current metrics
  public getCurrentMetrics(): OutboxMonitoringMetrics | null {
    return this.metricsHistory.length > 0 
      ? this.metricsHistory[this.metricsHistory.length - 1]
      : null;
  }

  // Get metrics history
  public getMetricsHistory(timeRange?: { from: number; to: number }): OutboxMonitoringMetrics[] {
    if (!timeRange) {
      return [...this.metricsHistory];
    }

    return this.metricsHistory.filter(
      metrics => metrics.timestamp >= timeRange.from && metrics.timestamp <= timeRange.to
    );
  }

  // Perform health check
  public async performHealthCheck(): Promise<HealthCheckResult> {
    try {
      const metrics = await this.collectMetrics();
      
      const checks = {
        database: metrics.databaseMetrics.activeConnections > 0,
        outboxProcessor: metrics.outboxMetrics.healthy,
        eventProcessing: metrics.performanceMetrics.errorRate < this.alertThresholds.errorRate,
        subscriptionDelivery: metrics.subscriptionMetrics.deliverySuccessRate > 0.9
      };

      const allHealthy = Object.values(checks).every(check => check);
      
      return {
        healthy: allHealthy,
        status: allHealthy ? 'healthy' : 
                checks.database && checks.outboxProcessor ? 'degraded' : 'unhealthy',
        checks,
        issues: allHealthy ? [] : ['Some health checks failed'],
        recommendations: allHealthy ? [] : ['Investigate failed health checks']
      };
    } catch (error) {
      return {
        healthy: false,
        status: 'unhealthy',
        checks: {
          database: false,
          outboxProcessor: false,
          eventProcessing: false,
          subscriptionDelivery: false
        },
        issues: ['Health check failed'],
        recommendations: ['Check system logs and monitoring configuration']
      };
    }
  }

  // Export metrics for external monitoring systems
  public async exportMetrics(format: 'json' | 'prometheus' = 'json'): Promise<string> {
    const metrics = await this.collectMetrics();
    
    if (format === 'json') {
      return JSON.stringify(metrics, null, 2);
    }
    
    if (format === 'prometheus') {
      return this.convertToPrometheusFormat(metrics);
    }
    
    throw new Error(`Unsupported export format: ${format}`);
  }

  // Convert metrics to Prometheus format
  private convertToPrometheusFormat(metrics: OutboxMonitoringMetrics): string {
    const lines: string[] = [];
    
    // Outbox metrics
    lines.push(`# HELP outbox_events_total Total number of events processed`);
    lines.push(`# TYPE outbox_events_total counter`);
    lines.push(`outbox_events_total ${metrics.outboxMetrics.metrics.processedEvents}`);
    
    lines.push(`# HELP outbox_events_failed Total number of failed events`);
    lines.push(`# TYPE outbox_events_failed counter`);
    lines.push(`outbox_events_failed ${metrics.outboxMetrics.metrics.failedEvents}`);
    
    lines.push(`# HELP outbox_processing_time_seconds Event processing time`);
    lines.push(`# TYPE outbox_processing_time_seconds histogram`);
    lines.push(`outbox_processing_time_seconds ${metrics.outboxMetrics.metrics.averageProcessingTime / 1000}`);
    
    // Performance metrics
    lines.push(`# HELP outbox_memory_usage_bytes Memory usage in bytes`);
    lines.push(`# TYPE outbox_memory_usage_bytes gauge`);
    lines.push(`outbox_memory_usage_bytes{type="heap_used"} ${metrics.performanceMetrics.memoryUsage.heapUsed}`);
    lines.push(`outbox_memory_usage_bytes{type="heap_total"} ${metrics.performanceMetrics.memoryUsage.heapTotal}`);
    
    return lines.join('\n');
  }
}

// Singleton instance
let outboxMonitorInstance: OutboxMonitor | null = null;

export function getOutboxMonitor(monitoringIntervalMs?: number): OutboxMonitor {
  if (!outboxMonitorInstance) {
    outboxMonitorInstance = new OutboxMonitor(monitoringIntervalMs);
  }
  return outboxMonitorInstance;
}

// Utility functions for common monitoring tasks
export async function startOutboxMonitoring(monitoringIntervalMs?: number): Promise<void> {
  const monitor = getOutboxMonitor(monitoringIntervalMs);
  await monitor.start();
}

export async function stopOutboxMonitoring(): Promise<void> {
  const monitor = getOutboxMonitor();
  await monitor.stop();
}

export async function getOutboxHealthStatus(): Promise<HealthCheckResult> {
  const monitor = getOutboxMonitor();
  return await monitor.performHealthCheck();
}