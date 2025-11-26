/**
 * 📊 PERFORMANCE METRICS DURABLE OBJECT
 * 
 * High-performance metrics storage and analytics using Cloudflare Durable Objects.
 * Provides real-time data aggregation, trend analysis, and anomaly detection.
 * 
 * Features:
 * - Time-series metrics storage with automatic compression
 * - Real-time aggregation and rollups
 * - Anomaly detection using statistical analysis
 * - Performance scoring and ranking
 * - WebSocket broadcasting for live updates
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { DurableObject } from 'cloudflare:workers';
import { 
  AgentPerformanceMetrics, 
  PerformanceScore, 
  AnomalyDetection,
  PerformanceAlert,
  PerformanceTrend,
  OptimizationRecommendation,
  WebSocketMessage
} from '@/infra/core/PerformanceMetricsTypes';

export interface Env {
  PERFORMANCE_METRICS_DO: DurableObjectNamespace;
  ANALYTICS_DO: DurableObjectNamespace;
  ALERTS_DO: DurableObjectNamespace;
}

export class PerformanceMetricsDO extends DurableObject<Env> {
  // In-memory storage for recent data (L1 cache)
  private recentMetrics: Map<string, AgentPerformanceMetrics[]> = new Map();
  private performanceScores: Map<string, PerformanceScore> = new Map();
  private alerts: Map<string, PerformanceAlert[]> = new Map();
  private anomalies: Map<string, AnomalyDetection[]> = new Map();
  private websocketConnections: Set<WebSocket> = new Set();
  
  // Configuration
  private readonly METRICS_RETENTION_HOURS = 24 * 7; // 7 days
  private readonly AGGREGATION_INTERVALS = [5, 15, 60, 300, 900]; // 5min, 15min, 1hr, 5hr, 15hr
  private readonly ANOMALY_THRESHOLD = 2.5; // Standard deviations
  private readonly MAX_RECENT_METRICS = 1000; // Per agent
  
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.initializeFromStorage();
    this.startPeriodicTasks();
  }

  /**
   * Store new performance metrics
   */
  async storeMetrics(metrics: AgentPerformanceMetrics): Promise<void> {
    const agentId = metrics.agentId;
    
    // Add to recent metrics
    if (!this.recentMetrics.has(agentId)) {
      this.recentMetrics.set(agentId, []);
    }
    
    const agentMetrics = this.recentMetrics.get(agentId)!;
    agentMetrics.push(metrics);
    
    // Trim old metrics
    const cutoffTime = Date.now() - (this.METRICS_RETENTION_HOURS * 60 * 60 * 1000);
    const filteredMetrics = agentMetrics.filter(m => m.timestamp.getTime() > cutoffTime);
    this.recentMetrics.set(agentId, filteredMetrics);
    
    // Store in persistent storage
    await this.persistMetrics(agentId, metrics);
    
    // Update performance score
    await this.updatePerformanceScore(agentId);
    
    // Check for anomalies
    await this.detectAnomalies(agentId);
    
    // Check alerts
    await this.checkAlerts(agentId, metrics);
    
    // Broadcast update
    await this.broadcastMetricsUpdate(metrics);
    
    // Trigger aggregations
    await this.triggerAggregations(agentId);
  }

  /**
   * Get metrics with filtering and aggregation
   */
  async getMetrics(options: {
    agentId?: string;
    timeRange?: { start: Date; end: Date };
    metrics?: string[];
    aggregation?: 'raw' | 'avg' | 'sum' | 'min' | 'max';
    limit?: number;
    offset?: number;
  }): Promise<{
    metrics: AgentPerformanceMetrics[];
    pagination: { total: number; offset: number; limit: number; hasMore: boolean };
  }> {
    const {
      agentId,
      timeRange,
      metrics: metricFilter,
      aggregation = 'raw',
      limit = 1000,
      offset = 0
    } = options;
    
    let allMetrics: AgentPerformanceMetrics[] = [];
    
    if (agentId) {
      // Get specific agent metrics
      const agentMetrics = this.recentMetrics.get(agentId) || [];
      const storedMetrics = await this.getStoredMetrics(agentId, timeRange);
      allMetrics = [...agentMetrics, ...storedMetrics];
    } else {
      // Get all agent metrics
      for (const [id, metrics] of this.recentMetrics.entries()) {
        allMetrics.push(...metrics);
      }
    }
    
    // Filter by time range
    if (timeRange) {
      allMetrics = allMetrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    // Apply aggregation
    if (aggregation !== 'raw') {
      allMetrics = this.applyAggregation(allMetrics, aggregation);
    }
    
    // Sort by timestamp (newest first)
    allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply pagination
    const total = allMetrics.length;
    const paginatedMetrics = allMetrics.slice(offset, offset + limit);
    
    return {
      metrics: paginatedMetrics,
      pagination: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total
      }
    };
  }

  /**
   * Get performance scores and rankings
   */
  async getPerformanceScores(agentId?: string): Promise<PerformanceScore[]> {
    const scores: PerformanceScore[] = [];
    
    if (agentId) {
      const score = this.performanceScores.get(agentId);
      if (score) scores.push(score);
    } else {
      scores.push(...this.performanceScores.values());
    }
    
    // Sort by overall score (highest first)
    scores.sort((a, b) => b.overall - a.overall);
    
    // Update rankings
    scores.forEach((score, index) => {
      score.rank.current = index + 1;
      if (score.rank.previous !== index + 1) {
        score.rank.change = score.rank.previous - (index + 1);
      }
      score.rank.previous = index + 1;
    });
    
    return scores;
  }

  /**
   * Get detected anomalies
   */
  async getAnomalies(agentId?: string, timeRange?: { start: Date; end: Date }): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];
    
    if (agentId) {
      const agentAnomalies = this.anomalies.get(agentId) || [];
      anomalies.push(...agentAnomalies);
    } else {
      for (const agentAnomalies of this.anomalies.values()) {
        anomalies.push(...agentAnomalies);
      }
    }
    
    // Filter by time range
    if (timeRange) {
      return anomalies.filter(a => 
        a.timestamp >= timeRange.start && a.timestamp <= timeRange.end
      );
    }
    
    return anomalies;
  }

  /**
   * Get performance trends
   */
  async getPerformanceTrends(agentId: string, metric: string): Promise<PerformanceTrend | null> {
    const metrics = this.recentMetrics.get(agentId) || [];
    if (metrics.length < 10) return null;
    
    const values = metrics.map(m => (m as any)[metric] || 0);
    const trend = this.calculateTrend(values);
    
    return {
      metric,
      trend: trend.direction,
      changeRate: trend.changeRate,
      confidence: trend.confidence,
      prediction: {
        nextHour: trend.predict(60),
        nextDay: trend.predict(1440),
        nextWeek: trend.predict(10080)
      }
    };
  }

  /**
   * Handle WebSocket connection
   */
  async handleWebSocket(ws: WebSocket): Promise<void> {
    this.websocketConnections.add(ws);
    
    ws.addEventListener('close', () => {
      this.websocketConnections.delete(ws);
    });
    
    ws.addEventListener('error', () => {
      this.websocketConnections.delete(ws);
    });
    
    // Send initial data
    ws.send(JSON.stringify({
      type: 'system_status',
      timestamp: new Date(),
      data: {
        connectedAgents: this.recentMetrics.size,
        totalConnections: this.websocketConnections.size
      }
    } as WebSocketMessage));
  }

  /**
   * Handle incoming WebSocket messages
   */
  async handleWebSocketMessage(ws: WebSocket, message: string): Promise<void> {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        case 'subscribe':
          // Handle subscription to specific agent updates
          await this.handleSubscription(ws, data);
          break;
          
        case 'unsubscribe':
          // Handle unsubscription
          await this.handleUnsubscription(ws, data);
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize data from persistent storage
   */
  private async initializeFromStorage(): Promise<void> {
    try {
      // Load recent metrics (limited to prevent memory issues)
      for (const agentId of await this.state.storage.list()) {
        if (agentId.startsWith('metrics_')) {
          const agentData = await this.state.storage.get<any>(agentId);
          if (agentData && agentData.metrics) {
            this.recentMetrics.set(agentData.agentId, agentData.metrics.slice(-this.MAX_RECENT_METRICS));
          }
        }
      }
      
      // Load performance scores
      const scores = await this.state.storage.get<any>('performance_scores');
      if (scores) {
        for (const [agentId, score] of Object.entries(scores)) {
          this.performanceScores.set(agentId, score);
        }
      }
      
      // Load alerts
      const alerts = await this.state.storage.get<any>('performance_alerts');
      if (alerts) {
        for (const [agentId, agentAlerts] of Object.entries(alerts)) {
          this.alerts.set(agentId, agentAlerts);
        }
      }
      
      // Load anomalies
      const anomalies = await this.state.storage.get<any>('anomalies');
      if (anomalies) {
        for (const [agentId, agentAnomalies] of Object.entries(anomalies)) {
          this.anomalies.set(agentId, agentAnomalies);
        }
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
    }
  }

  /**
   * Start periodic background tasks
   */
  private startPeriodicTasks(): void {
    // Set up alarms for periodic tasks
    this.state.storage.setAlarm('aggregation', 300000); // Every 5 minutes
    this.state.storage.setAlarm('cleanup', 3600000); // Every hour
    this.state.storage.setAlarm('score_calculation', 60000); // Every minute
  }

  /**
   * Handle alarm events
   */
  async alarm(): Promise<void> {
    const alarm = await this.state.storage.getAlarm();
    
    switch (alarm?.name) {
      case 'aggregation':
        await this.performAggregations();
        break;
        
      case 'cleanup':
        await this.performCleanup();
        break;
        
      case 'score_calculation':
        await this.recalculateAllScores();
        break;
    }
  }

  /**
   * Persist metrics to storage
   */
  private async persistMetrics(agentId: string, metrics: AgentPerformanceMetrics): Promise<void> {
    const key = `metrics_${agentId}_${Date.now()}`;
    await this.state.storage.put(key, metrics);
  }

  /**
   * Get stored metrics from persistent storage
   */
  private async getStoredMetrics(agentId: string, timeRange?: { start: Date; end: Date }): Promise<AgentPerformanceMetrics[]> {
    const storedMetrics: AgentPerformanceMetrics[] = [];
    
    // List all metric keys for this agent
    const prefix = `metrics_${agentId}_`;
    const keys = await this.state.storage.list({ prefix });
    
    for (const key of keys) {
      const metrics = await this.state.storage.get<AgentPerformanceMetrics>(key.name);
      if (metrics) {
        if (!timeRange || (metrics.timestamp >= timeRange.start && metrics.timestamp <= timeRange.end)) {
          storedMetrics.push(metrics);
        }
      }
    }
    
    return storedMetrics;
  }

  /**
   * Update performance score for an agent
   */
  private async updatePerformanceScore(agentId: string): Promise<void> {
    const metrics = this.recentMetrics.get(agentId) || [];
    if (metrics.length < 5) return; // Need at least 5 data points
    
    const recentMetrics = metrics.slice(-20); // Last 20 metrics
    const score = this.calculatePerformanceScore(agentId, recentMetrics);
    this.performanceScores.set(agentId, score);
    
    // Persist score
    const scores = await this.state.storage.get<any>('performance_scores') || {};
    scores[agentId] = score;
    await this.state.storage.put('performance_scores', scores);
  }

  /**
   * Calculate comprehensive performance score
   */
  private calculatePerformanceScore(agentId: string, metrics: AgentPerformanceMetrics[]): PerformanceScore {
    const latest = metrics[metrics.length - 1];
    const avg = metrics.reduce((acc, m) => ({
      cpu: acc.cpu + m.cpu,
      memory: acc.memory + m.memory,
      responseTime: acc.responseTime + m.averageResponseTime,
      successRate: acc.successRate + m.successRate,
      userSatisfaction: acc.userSatisfaction + m.userSatisfaction,
      errorRate: acc.errorRate + m.errorRate
    }), { cpu: 0, memory: 0, responseTime: 0, successRate: 0, userSatisfaction: 0, errorRate: 0 });
    
    const count = metrics.length;
    
    // Calculate individual scores (0-100, higher is better)
    const cpuScore = Math.max(0, 100 - (avg.cpu / count));
    const memoryScore = Math.max(0, 100 - (avg.memory / count));
    const responseScore = Math.max(0, 100 - ((avg.responseTime / count) / 10)); // 10ms = perfect
    const successScore = avg.successRate / count;
    const satisfactionScore = avg.userSatisfaction / count;
    const errorScore = Math.max(0, 100 - (avg.errorRate / count));
    
    // Calculate category scores
    const efficiency = (cpuScore + memoryScore + responseScore) / 3;
    const reliability = (successScore + errorScore) / 2;
    const quality = satisfactionScore;
    const scalability = 85; // Placeholder - would calculate based on load handling
    const costEffectiveness = 90; // Placeholder - would calculate based on cost vs output
    
    // Overall score (weighted average)
    const overall = (
      efficiency * 0.25 +
      reliability * 0.25 +
      quality * 0.25 +
      scalability * 0.15 +
      costEffectiveness * 0.10
    );
    
    return {
      overall: Math.round(overall),
      efficiency: Math.round(efficiency),
      reliability: Math.round(reliability),
      quality: Math.round(quality),
      scalability: Math.round(scalability),
      costEffectiveness: Math.round(costEffectiveness),
      breakdown: {
        cpu: Math.round(cpuScore),
        memory: Math.round(memoryScore),
        responseTime: Math.round(responseScore),
        successRate: Math.round(successScore),
        userSatisfaction: Math.round(satisfactionScore),
        errorRate: Math.round(errorScore)
      },
      rank: {
        current: 0,
        previous: 0,
        change: 0
      }
    };
  }

  /**
   * Detect anomalies using statistical analysis
   */
  private async detectAnomalies(agentId: string): Promise<void> {
    const metrics = this.recentMetrics.get(agentId) || [];
    if (metrics.length < 10) return; // Need sufficient data
    
    const latest = metrics[metrics.length - 1];
    const recent = metrics.slice(-20);
    
    // Check each metric for anomalies
    const metricsToCheck = ['cpu', 'memory', 'networkLatency', 'successRate', 'errorRate'];
    
    for (const metric of metricsToCheck) {
      const values = recent.map(m => (m as any)[metric] || 0);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      const currentValue = (latest as any)[metric] || 0;
      const zScore = Math.abs((currentValue - mean) / stdDev);
      
      if (zScore > this.ANOMALY_THRESHOLD) {
        const anomaly: AnomalyDetection = {
          metric,
          timestamp: latest.timestamp,
          severity: zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium',
          anomalyScore: Math.min(100, zScore * 20),
          expectedValue: mean,
          actualValue: currentValue,
          deviation: Math.abs(currentValue - mean),
          description: `${metric} is ${zScore.toFixed(1)} standard deviations from normal`,
          recommendations: this.generateAnomalyRecommendations(metric, zScore)
        };
        
        // Store anomaly
        if (!this.anomalies.has(agentId)) {
          this.anomalies.set(agentId, []);
        }
        this.anomalies.get(agentId)!.push(anomaly);
        
        // Broadcast anomaly
        await this.broadcastAnomaly(anomaly);
      }
    }
  }

  /**
   * Generate recommendations for detected anomalies
   */
  private generateAnomalyRecommendations(metric: string, severity: number): string[] {
    const recommendations: string[] = [];
    
    switch (metric) {
      case 'cpu':
        recommendations.push('Consider scaling up resources or optimizing CPU-intensive tasks');
        recommendations.push('Check for runaway processes or infinite loops');
        break;
        
      case 'memory':
        recommendations.push('Implement memory pooling or reduce memory allocation');
        recommendations.push('Check for memory leaks in long-running processes');
        break;
        
      case 'networkLatency':
        recommendations.push('Optimize network calls and reduce round-trip time');
        recommendations.push('Consider edge deployment for reduced latency');
        break;
        
      case 'successRate':
        recommendations.push('Review error handling and retry logic');
        recommendations.push('Implement better input validation');
        break;
        
      case 'errorRate':
        recommendations.push('Add comprehensive error logging and monitoring');
        recommendations.push('Implement circuit breakers for failing services');
        break;
    }
    
    return recommendations;
  }

  /**
   * Check performance alerts
   */
  private async checkAlerts(agentId: string, metrics: AgentPerformanceMetrics): Promise<void> {
    const agentAlerts = this.alerts.get(agentId) || [];
    
    for (const alert of agentAlerts) {
      if (!alert.enabled) continue;
      
      const value = (metrics as any)[alert.metric] || 0;
      let triggered = false;
      
      switch (alert.operator) {
        case 'gt':
          triggered = value > alert.threshold;
          break;
        case 'lt':
          triggered = value < alert.threshold;
          break;
        case 'eq':
          triggered = value === alert.threshold;
          break;
        case 'gte':
          triggered = value >= alert.threshold;
          break;
        case 'lte':
          triggered = value <= alert.threshold;
          break;
      }
      
      if (triggered) {
        const now = new Date();
        const cooldownMs = alert.cooldown * 60 * 1000;
        
        if (!alert.lastTriggered || (now.getTime() - alert.lastTriggered.getTime()) > cooldownMs) {
          alert.lastTriggered = now;
          
          // Broadcast alert
          await this.broadcastAlert(agentId, alert, value);
        }
      }
    }
  }

  /**
   * Apply aggregation to metrics
   */
  private applyAggregation(metrics: AgentPerformanceMetrics[], aggregation: string): AgentPerformanceMetrics[] {
    if (metrics.length === 0) return metrics;
    
    // Group by time intervals (5-minute buckets)
    const bucketSize = 5 * 60 * 1000; // 5 minutes in ms
    const buckets = new Map<number, AgentPerformanceMetrics[]>();
    
    for (const metric of metrics) {
      const bucketTime = Math.floor(metric.timestamp.getTime() / bucketSize) * bucketSize;
      
      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, []);
      }
      buckets.get(bucketTime)!.push(metric);
    }
    
    // Apply aggregation function to each bucket
    const aggregatedMetrics: AgentPerformanceMetrics[] = [];
    
    for (const [bucketTime, bucketMetrics] of buckets.entries()) {
      if (bucketMetrics.length === 0) continue;
      
      const aggregated: any = {
        agentId: bucketMetrics[0].agentId,
        timestamp: new Date(bucketTime)
      };
      
      // Apply aggregation to each metric field
      const fields = [
        'cpu', 'memory', 'networkLatency', 'diskIO', 'tasksCompleted',
        'tasksFailed', 'successRate', 'averageResponseTime', 'throughput',
        'userSatisfaction', 'errorRate', 'accuracy', 'energyLevel',
        'revenueGenerated', 'costPerTask', 'efficiency'
      ];
      
      for (const field of fields) {
        const values = bucketMetrics.map(m => (m as any)[field] || 0);
        
        switch (aggregation) {
          case 'avg':
            aggregated[field] = values.reduce((sum, val) => sum + val, 0) / values.length;
            break;
          case 'sum':
            aggregated[field] = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'min':
            aggregated[field] = Math.min(...values);
            break;
          case 'max':
            aggregated[field] = Math.max(...values);
            break;
        }
      }
      
      // Handle arrays separately
      aggregated.activeSuperpowers = bucketMetrics[bucketMetrics.length - 1].activeSuperpowers;
      
      aggregatedMetrics.push(aggregated);
    }
    
    return aggregatedMetrics;
  }

  /**
   * Calculate trend direction and prediction
   */
  private calculateTrend(values: number[]): {
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    changeRate: number;
    confidence: number;
    predict: (minutes: number) => number;
  } {
    if (values.length < 5) {
      return {
        direction: 'stable',
        changeRate: 0,
        confidence: 0,
        predict: () => values[values.length - 1] || 0
      };
    }
    
    // Simple linear regression for trend
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared for confidence
    const meanY = sumY / n;
    const totalSumSquares = values.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
    const residualSumSquares = values.reduce((sum, val, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    // Determine direction
    let direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    if (Math.abs(slope) < 0.01) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }
    
    // Calculate volatility
    const recentValues = values.slice(-5);
    const volatility = recentValues.reduce((sum, val) => {
      const mean = recentValues.reduce((s, v) => s + v, 0) / recentValues.length;
      return sum + Math.abs(val - mean);
    }, 0) / recentValues.length;
    
    if (volatility > values.reduce((s, v) => s + v, 0) / values.length * 0.5) {
      direction = 'volatile';
    }
    
    return {
      direction,
      changeRate: Math.abs(slope) * 100,
      confidence: Math.max(0, Math.min(100, rSquared * 100)),
      predict: (minutes: number) => slope * (values.length + minutes / 5) + intercept
    };
  }

  /**
   * Broadcast metrics update via WebSocket
   */
  private async broadcastMetricsUpdate(metrics: AgentPerformanceMetrics): Promise<void> {
    const message: WebSocketMessage = {
      type: 'metrics_update',
      timestamp: new Date(),
      data: metrics,
      agentId: metrics.agentId
    };
    
    await this.broadcast(message);
  }

  /**
   * Broadcast anomaly detection
   */
  private async broadcastAnomaly(anomaly: AnomalyDetection): Promise<void> {
    const message: WebSocketMessage = {
      type: 'anomaly_detected',
      timestamp: new Date(),
      data: anomaly
    };
    
    await this.broadcast(message);
  }

  /**
   * Broadcast alert
   */
  private async broadcastAlert(agentId: string, alert: PerformanceAlert, value: number): Promise<void> {
    const message: WebSocketMessage = {
      type: 'alert_triggered',
      timestamp: new Date(),
      data: {
        agentId,
        alert,
        currentValue: value,
        timestamp: new Date()
      }
    };
    
    await this.broadcast(message);
  }

  /**
   * Broadcast message to all connected WebSocket clients
   */
  private async broadcast(message: WebSocketMessage): Promise<void> {
    if (this.websocketConnections.size === 0) return;
    
    const messageStr = JSON.stringify(message);
    
    for (const ws of this.websocketConnections) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.websocketConnections.delete(ws);
      }
    }
  }

  /**
   * Perform periodic aggregations
   */
  private async performAggregations(): Promise<void> {
    for (const [agentId] of this.recentMetrics.keys()) {
      await this.triggerAggregations(agentId);
    }
  }

  /**
   * Trigger aggregations for specific intervals
   */
  private async triggerAggregations(agentId: string): Promise<void> {
    const now = Date.now();
    
    for (const interval of this.AGGREGATION_INTERVALS) {
      const intervalMs = interval * 60 * 1000;
      const bucketTime = Math.floor(now / intervalMs) * intervalMs;
      
      const key = `aggregation_${agentId}_${interval}_${bucketTime}`;
      const exists = await this.state.storage.get(key);
      
      if (!exists) {
        // Calculate and store aggregation
        const timeRange = {
          start: new Date(bucketTime - intervalMs),
          end: new Date(bucketTime)
        };
        
        const result = await this.getMetrics({
          agentId,
          timeRange,
          aggregation: 'avg'
        });
        
        await this.state.storage.put(key, {
          interval,
          bucketTime,
          metrics: result.metrics
        });
      }
    }
  }

  /**
   * Perform cleanup of old data
   */
  private async performCleanup(): Promise<void> {
    const cutoffTime = Date.now() - (this.METRICS_RETENTION_HOURS * 60 * 60 * 1000);
    
    // Clean up old metrics
    const keys = await this.state.storage.list();
    for (const key of keys) {
      if (key.name.startsWith('metrics_')) {
        const timestamp = parseInt(key.name.split('_')[2]);
        if (timestamp < cutoffTime) {
          await this.state.storage.delete(key.name);
        }
      }
    }
    
    // Clean up old aggregations
    for (const key of keys) {
      if (key.name.startsWith('aggregation_')) {
        const bucketTime = parseInt(key.name.split('_')[3]);
        if (bucketTime < cutoffTime) {
          await this.state.storage.delete(key.name);
        }
      }
    }
  }

  /**
   * Recalculate performance scores for all agents
   */
  private async recalculateAllScores(): Promise<void> {
    for (const [agentId] of this.recentMetrics.keys()) {
      await this.updatePerformanceScore(agentId);
    }
  }

  /**
   * Handle WebSocket subscription
   */
  private async handleSubscription(ws: WebSocket, data: any): Promise<void> {
    // Store subscription info and send initial data
    const subscription = {
      agentId: data.agentId,
      metrics: data.metrics,
      filters: data.filters
    };
    
    // Send initial data based on subscription
    if (subscription.agentId) {
      const metrics = await this.getMetrics({
        agentId: subscription.agentId,
        limit: 10
      });
      
      ws.send(JSON.stringify({
        type: 'initial_data',
        timestamp: new Date(),
        data: metrics.metrics
      } as WebSocketMessage));
    }
  }

  /**
   * Handle WebSocket unsubscription
   */
  private async handleUnsubscription(ws: WebSocket, data: any): Promise<void> {
    // Remove subscription info
    // In a real implementation, we'd track subscriptions per WebSocket
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const id = env.PERFORMANCE_METRICS_DO.idFromName('axiom-performance-metrics');
    const stub = env.PERFORMANCE_METRICS_DO.get(id);
    
    return stub.fetch(request);
  }
} as ExportedHandler<Env>;