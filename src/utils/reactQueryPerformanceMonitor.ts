/**
 * React Query Performance Monitor
 * 
 * Comprehensive monitoring system for React Query performance metrics
 * including response times, memory usage, and polling behavior analysis
 */

import { QueryClient, QueryObserver, QueryObserverResult } from '@tanstack/react-query';

interface PerformanceMetrics {
  queryKey: string[];
  responseTime: number;
  timestamp: number;
  dataSize: number;
  cacheHit: boolean;
  stale: boolean;
}

interface MemoryMetrics {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

interface PollingMetrics {
  queryKey: string[];
  interval: number;
  actualInterval: number;
  missedIntervals: number;
  totalPolls: number;
}

interface RenderMetrics {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  renderDuration: number;
}

class ReactQueryPerformanceMonitor {
  private queryClient: QueryClient;
  private metrics: {
    queries: PerformanceMetrics[];
    memory: MemoryMetrics[];
    polling: Map<string, PollingMetrics>;
    renders: Map<string, RenderMetrics>;
  };
  private observers: Map<string, QueryObserver>;
  private intervals: Map<string, NodeJS.Timeout>;
  private lastPollTime: Map<string, number>;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.metrics = {
      queries: [],
      memory: [],
      polling: new Map(),
      renders: new Map()
    };
    this.observers = new Map();
    this.intervals = new Map();
    this.lastPollTime = new Map();
    
    this.startMonitoring();
  }

  /**
   * Start comprehensive performance monitoring
   */
  private startMonitoring(): void {
    // Monitor memory usage every 5 seconds
    setInterval(() => {
      this.recordMemoryMetrics();
    }, 5000);

    // Monitor query cache changes
    this.queryClient.getQueryCache().subscribe((event) => {
      this.handleQueryCacheEvent(event);
    });

    // Override query client methods to monitor performance
    this.wrapQueryClientMethods();
  }

  /**
   * Record current memory metrics
   */
  private recordMemoryMetrics(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const metrics: MemoryMetrics = {
        timestamp: Date.now(),
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        external: memory.usedJSHeapSize - memory.jsHeapSizeLimit,
        rss: 0 // Not available in browser
      };
      
      this.metrics.memory.push(metrics);
      
      // Keep only last 100 entries
      if (this.metrics.memory.length > 100) {
        this.metrics.memory = this.metrics.memory.slice(-100);
      }
    }
  }

  /**
   * Handle query cache events for performance tracking
   */
  private handleQueryCacheEvent(event: any): void {
    if (event.type === 'updated' || event.type === 'added') {
      const query = event.query;
      const queryKey = JSON.stringify(query.queryKey);
      
      // Record query performance metrics
      const metrics: PerformanceMetrics = {
        queryKey: query.queryKey,
        responseTime: Date.now() - query.state.dataUpdatedAt,
        timestamp: Date.now(),
        dataSize: this.estimateDataSize(query.state.data),
        cacheHit: query.state.dataUpdatedAt > 0,
        stale: query.isStale()
      };
      
      this.metrics.queries.push(metrics);
      
      // Keep only last 500 query metrics
      if (this.metrics.queries.length > 500) {
        this.metrics.queries = this.metrics.queries.slice(-500);
      }
    }
  }

  /**
   * Wrap query client methods to add performance monitoring
   */
  private wrapQueryClientMethods(): void {
    const originalFetchQuery = this.queryClient.fetchQuery.bind(this.queryClient);
    
    this.queryClient.fetchQuery = async (...args: any[]) => {
      const startTime = performance.now();
      const queryKey = args[0];
      const queryKeyStr = JSON.stringify(queryKey);
      
      try {
        const result = await originalFetchQuery(...args);
        const endTime = performance.now();
        
        console.log(`[React Query Monitor] Query ${queryKeyStr} completed in ${(endTime - startTime).toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        console.error(`[React Query Monitor] Query ${queryKeyStr} failed in ${(endTime - startTime).toFixed(2)}ms:`, error);
        throw error;
      }
    };
  }

  /**
   * Monitor polling behavior for specific queries
   */
  monitorPolling(queryKey: string[], interval: number): void {
    const queryKeyStr = JSON.stringify(queryKey);
    
    // Initialize polling metrics
    this.metrics.polling.set(queryKeyStr, {
      queryKey,
      interval,
      actualInterval: 0,
      missedIntervals: 0,
      totalPolls: 0
    });
    
    this.lastPollTime.set(queryKeyStr, Date.now());
    
    // Monitor actual polling intervals
    const monitorInterval = setInterval(() => {
      const now = Date.now();
      const lastPoll = this.lastPollTime.get(queryKeyStr) || now;
      const actualInterval = now - lastPoll;
      
      const metrics = this.metrics.polling.get(queryKeyStr);
      if (metrics) {
        metrics.actualInterval = actualInterval;
        metrics.totalPolls++;
        
        if (actualInterval > interval * 1.5) {
          metrics.missedIntervals++;
          console.warn(`[React Query Monitor] Polling delay detected for ${queryKeyStr}: expected ${interval}ms, got ${actualInterval}ms`);
        }
      }
      
      this.lastPollTime.set(queryKeyStr, now);
    }, interval);
    
    this.intervals.set(queryKeyStr, monitorInterval);
  }

  /**
   * Track component render performance
   */
  trackRender(componentName: string): void {
    const startTime = performance.now();
    
    // Update render metrics
    const existing = this.metrics.renders.get(componentName);
    if (existing) {
      existing.renderCount++;
      existing.lastRenderTime = startTime;
    } else {
      this.metrics.renders.set(componentName, {
        componentName,
        renderCount: 1,
        lastRenderTime: startTime,
        renderDuration: 0
      });
    }
    
    // Return a function to record render completion
    return () => {
      const endTime = performance.now();
      const metrics = this.metrics.renders.get(componentName);
      if (metrics) {
        metrics.renderDuration = endTime - startTime;
      }
    };
  }

  /**
   * Estimate data size for network usage tracking
   */
  private estimateDataSize(data: any): number {
    if (!data) return 0;
    return JSON.stringify(data).length;
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport(): {
    summary: {
      totalQueries: number;
      averageResponseTime: number;
      slowQueries: number;
      memoryTrend: 'increasing' | 'decreasing' | 'stable';
      pollingEfficiency: number;
    };
    queries: PerformanceMetrics[];
    memory: MemoryMetrics[];
    polling: PollingMetrics[];
    renders: RenderMetrics[];
    recommendations: string[];
  } {
    const queries = this.metrics.queries;
    const memory = this.metrics.memory;
    const polling = Array.from(this.metrics.polling.values());
    const renders = Array.from(this.metrics.renders.values());
    
    // Calculate summary metrics
    const totalQueries = queries.length;
    const averageResponseTime = queries.length > 0 
      ? queries.reduce((sum, q) => sum + q.responseTime, 0) / queries.length 
      : 0;
    const slowQueries = queries.filter(q => q.responseTime > 100).length;
    
    // Analyze memory trend
    let memoryTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (memory.length > 10) {
      const recent = memory.slice(-10);
      const older = memory.slice(-20, -10);
      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, m) => sum + m.heapUsed, 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + m.heapUsed, 0) / older.length;
        const change = (recentAvg - olderAvg) / olderAvg;
        
        if (change > 0.1) memoryTrend = 'increasing';
        else if (change < -0.1) memoryTrend = 'decreasing';
      }
    }
    
    // Calculate polling efficiency
    const pollingEfficiency = polling.length > 0
      ? polling.reduce((sum, p) => {
          const efficiency = p.totalPolls > 0 
            ? ((p.totalPolls - p.missedIntervals) / p.totalPolls) * 100 
            : 100;
          return sum + efficiency;
        }, 0) / polling.length
      : 100;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations({
      totalQueries,
      averageResponseTime,
      slowQueries,
      memoryTrend,
      pollingEfficiency,
      queries,
      polling,
      renders
    });
    
    return {
      summary: {
        totalQueries,
        averageResponseTime,
        slowQueries,
        memoryTrend,
        pollingEfficiency
      },
      queries,
      memory,
      polling,
      renders,
      recommendations
    };
  }

  /**
   * Generate performance recommendations based on metrics
   */
  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];
    
    if (metrics.averageResponseTime > 100) {
      recommendations.push('Average response time exceeds 100ms - consider optimizing query functions or adding caching');
    }
    
    if (metrics.slowQueries > metrics.totalQueries * 0.1) {
      recommendations.push('More than 10% of queries are slow - review query performance and data size');
    }
    
    if (metrics.memoryTrend === 'increasing') {
      recommendations.push('Memory usage is trending upward - check for memory leaks in query callbacks');
    }
    
    if (metrics.pollingEfficiency < 90) {
      recommendations.push('Polling efficiency is below 90% - consider adjusting intervals or implementing smart polling');
    }
    
    // Check for excessive re-renders
    const highRenderCount = metrics.renders.filter((r: RenderMetrics) => r.renderCount > 100);
    if (highRenderCount.length > 0) {
      recommendations.push(`Components with high render counts detected: ${highRenderCount.map((r: RenderMetrics) => r.componentName).join(', ')}`);
    }
    
    // Check polling intervals
    const frequentPolling = metrics.polling.filter((p: PollingMetrics) => p.interval < 2000);
    if (frequentPolling.length > 0) {
      recommendations.push('Very frequent polling detected (< 2s) - consider increasing intervals or implementing on-demand refetching');
    }
    
    return recommendations;
  }

  /**
   * Stop monitoring and clean up resources
   */
  stopMonitoring(): void {
    // Clear all monitoring intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    console.log('[React Query Monitor] Performance monitoring stopped');
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify(this.getPerformanceReport(), null, 2);
  }
}

export default ReactQueryPerformanceMonitor;
export type {
  PerformanceMetrics,
  MemoryMetrics,
  PollingMetrics,
  RenderMetrics
};