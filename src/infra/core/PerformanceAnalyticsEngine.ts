/**
 * 🧠 PERFORMANCE ANALYTICS ENGINE
 * 
 * Advanced analytics engine for agent performance data with:
 * - Trend analysis using statistical methods
 * - Predictive insights using machine learning
 * - Anomaly detection with multiple algorithms
 * - Performance optimization recommendations
 * - Comparative analysis and benchmarking
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { 
  AgentPerformanceMetrics, 
  PerformanceTrend, 
  AnomalyDetection, 
  PerformanceScore,
  OptimizationRecommendation,
  PerformanceBenchmark,
  ResourceUtilizationReport,
  AgentComparison,
  DEFAULT_BENCHMARKS
} from './PerformanceMetricsTypes';

export class PerformanceAnalyticsEngine {
  private readonly MIN_DATA_POINTS = 10;
  private readonly PREDICTION_WINDOW = 20; // Data points for predictions
  private readonly ANOMALY_SENSITIVITY = 2.0; // Standard deviations
  
  /**
   * Analyze performance trends for an agent
   */
  analyzeTrends(
    agentId: string, 
    metrics: AgentPerformanceMetrics[], 
    timeWindow?: number
  ): Map<string, PerformanceTrend> {
    const trends = new Map<string, PerformanceTrend>();
    const window = timeWindow || metrics.length;
    const recentMetrics = metrics.slice(-window);
    
    if (recentMetrics.length < this.MIN_DATA_POINTS) {
      return trends;
    }
    
    // Analyze each metric
    const metricKeys = [
      'cpu', 'memory', 'networkLatency', 'successRate', 
      'errorRate', 'userSatisfaction', 'throughput', 'efficiency'
    ];
    
    for (const metric of metricKeys) {
      const values = recentMetrics.map(m => (m as any)[metric] || 0);
      const trend = this.calculateAdvancedTrend(values, metric);
      trends.set(metric, trend);
    }
    
    return trends;
  }
  
  /**
   * Generate predictive insights using multiple algorithms
   */
  generatePredictiveInsights(
    agentId: string,
    metrics: AgentPerformanceMetrics[],
    predictionHorizon: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): {
    predictions: Map<string, number>;
    confidence: number;
    insights: string[];
    recommendations: string[];
  } {
    if (metrics.length < this.PREDICTION_WINDOW) {
      return {
        predictions: new Map(),
        confidence: 0,
        insights: ['Insufficient data for reliable predictions'],
        recommendations: ['Collect more performance data']
      };
    }
    
    const predictions = new Map<string, number>();
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Time-based predictions
    const horizonMinutes = {
      hour: 60,
      day: 1440,
      week: 10080,
      month: 43200
    }[predictionHorizon];
    
    // Analyze patterns and make predictions
    const recentMetrics = metrics.slice(-this.PREDICTION_WINDOW);
    
    // CPU prediction
    const cpuTrend = this.calculateAdvancedTrend(
      recentMetrics.map(m => m.cpu), 
      'cpu'
    );
    predictions.set('cpu', cpuTrend.predict(horizonMinutes));
    
    // Memory prediction
    const memoryTrend = this.calculateAdvancedTrend(
      recentMetrics.map(m => m.memory), 
      'memory'
    );
    predictions.set('memory', memoryTrend.predict(horizonMinutes));
    
    // Success rate prediction
    const successTrend = this.calculateAdvancedTrend(
      recentMetrics.map(m => m.successRate), 
      'successRate'
    );
    predictions.set('successRate', successTrend.predict(horizonMinutes));
    
    // Throughput prediction
    const throughputTrend = this.calculateAdvancedTrend(
      recentMetrics.map(m => m.throughput), 
      'throughput'
    );
    predictions.set('throughput', throughputTrend.predict(horizonMinutes));
    
    // Generate insights based on pattern analysis
    insights.push(...this.analyzePatterns(recentMetrics));
    
    // Generate recommendations
    recommendations.push(...this.generateOptimizationRecommendations(
      agentId, 
      recentMetrics, 
      predictions
    ));
    
    // Calculate overall confidence based on trend stability
    const confidences = [cpuTrend.confidence, memoryTrend.confidence, successTrend.confidence];
    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    
    return {
      predictions,
      confidence: Math.round(avgConfidence),
      insights,
      recommendations
    };
  }
  
  /**
   * Detect anomalies using multiple algorithms
   */
  detectAnomalies(
    agentId: string,
    metrics: AgentPerformanceMetrics[],
    sensitivity: number = this.ANOMALY_SENSITIVITY
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    if (metrics.length < this.MIN_DATA_POINTS) {
      return anomalies;
    }
    
    const latest = metrics[metrics.length - 1];
    
    // Statistical anomaly detection (Z-score)
    const statisticalAnomalies = this.detectStatisticalAnomalies(metrics, sensitivity);
    
    // Pattern-based anomaly detection
    const patternAnomalies = this.detectPatternAnomalies(metrics);
    
    // Seasonal anomaly detection (if enough data)
    const seasonalAnomalies = metrics.length > 100 
      ? this.detectSeasonalAnomalies(metrics)
      : [];
    
    // Combine and deduplicate anomalies
    const allAnomalies = [...statisticalAnomalies, ...patternAnomalies, ...seasonalAnomalies];
    
    // Group by metric and severity
    const anomalyMap = new Map<string, AnomalyDetection>();
    
    for (const anomaly of allAnomalies) {
      const key = `${anomaly.metric}_${anomaly.timestamp.getTime()}`;
      
      if (!anomalyMap.has(key)) {
        anomalyMap.set(key, anomaly);
      } else {
        // Merge if same metric and time
        const existing = anomalyMap.get(key)!;
        existing.severity = this.getHigherSeverity(existing.severity, anomaly.severity);
        existing.anomalyScore = Math.max(existing.anomalyScore, anomaly.anomalyScore);
      }
    }
    
    return Array.from(anomalyMap.values());
  }
  
  /**
   * Generate performance score with detailed breakdown
   */
  generatePerformanceScore(
    agentId: string,
    metrics: AgentPerformanceMetrics[],
    benchmarks: PerformanceBenchmark[] = DEFAULT_BENCHMARKS
  ): PerformanceScore {
    if (metrics.length < 5) {
      throw new Error('Insufficient data for performance scoring');
    }
    
    const recentMetrics = metrics.slice(-50); // Last 50 metrics
    const latest = recentMetrics[recentMetrics.length - 1];
    
    // Calculate component scores
    const componentScores = this.calculateComponentScores(recentMetrics, benchmarks);
    
    // Calculate overall score with weighted components
    const weights = {
      efficiency: 0.25,
      reliability: 0.25,
      quality: 0.25,
      scalability: 0.15,
      costEffectiveness: 0.10
    };
    
    const overall = Object.entries(componentScores).reduce((sum, [component, score]) => 
      sum + (score * weights[component as keyof typeof weights]), 0
    );
    
    // Get historical ranking data
    const historicalRanking = this.calculateHistoricalRanking(agentId, metrics);
    
    return {
      overall: Math.round(Math.min(100, Math.max(0, overall))),
      efficiency: componentScores.efficiency,
      reliability: componentScores.reliability,
      quality: componentScores.quality,
      scalability: componentScores.scalability,
      costEffectiveness: componentScores.costEffectiveness,
      breakdown: {
        cpu: this.getMetricScore(recentMetrics, 'cpu', benchmarks),
        memory: this.getMetricScore(recentMetrics, 'memory', benchmarks),
        responseTime: this.getMetricScore(recentMetrics, 'averageResponseTime', benchmarks),
        successRate: this.getMetricScore(recentMetrics, 'successRate', benchmarks),
        userSatisfaction: this.getMetricScore(recentMetrics, 'userSatisfaction', benchmarks),
        errorRate: this.getMetricScore(recentMetrics, 'errorRate', benchmarks)
      },
      rank: historicalRanking
    };
  }
  
  /**
   * Compare agents and generate benchmarking insights
   */
  compareAgents(
    agents: Map<string, AgentPerformanceMetrics[]>,
    timeWindow: number = 24 * 60 * 60 * 1000 // 24 hours
  ): AgentComparison[] {
    const comparisons: AgentComparison[] = [];
    
    for (const [agentId, metrics] of agents.entries()) {
      const recentMetrics = metrics.filter(m => 
        Date.now() - m.timestamp.getTime() <= timeWindow
      );
      
      if (recentMetrics.length < 5) continue;
      
      const score = this.generatePerformanceScore(agentId, recentMetrics);
      const trends = this.analyzeTrends(agentId, recentMetrics);
      
      // Identify strengths and weaknesses
      const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(score, trends);
      
      // Generate recommendations
      const recommendations = this.generateAgentRecommendations(score, trends);
      
      comparisons.push({
        agentId,
        agentName: this.getAgentName(agentId),
        metrics: this.getAverageMetrics(recentMetrics),
        score,
        strengths,
        weaknesses,
        recommendations
      });
    }
    
    // Sort by overall score
    comparisons.sort((a, b) => b.score.overall - a.score.overall);
    
    return comparisons;
  }
  
  /**
   * Generate resource utilization report
   */
  generateResourceReport(
    agentId: string,
    metrics: AgentPerformanceMetrics[],
    period: { start: Date; end: Date }
  ): ResourceUtilizationReport {
    const periodMetrics = metrics.filter(m => 
      m.timestamp >= period.start && m.timestamp <= period.end
    );
    
    if (periodMetrics.length === 0) {
      throw new Error('No metrics found for the specified period');
    }
    
    // Calculate CPU statistics
    const cpuValues = periodMetrics.map(m => m.cpu);
    const cpuStats = {
      average: cpuValues.reduce((sum, val) => sum + val, 0) / cpuValues.length,
      peak: Math.max(...cpuValues),
      min: Math.min(...cpuValues),
      utilizationRate: cpuValues.reduce((sum, val) => sum + val, 0) / cpuValues.length
    };
    
    // Calculate memory statistics
    const memoryValues = periodMetrics.map(m => m.memory);
    const memoryStats = {
      average: memoryValues.reduce((sum, val) => sum + val, 0) / memoryValues.length,
      peak: Math.max(...memoryValues),
      min: Math.min(...memoryValues),
      utilizationRate: memoryValues.reduce((sum, val) => sum + val, 0) / memoryValues.length
    };
    
    // Calculate network statistics
    const latencyValues = periodMetrics.map(m => m.networkLatency);
    const networkStats = {
      latency: {
        average: latencyValues.reduce((sum, val) => sum + val, 0) / latencyValues.length,
        peak: Math.max(...latencyValues),
        min: Math.min(...latencyValues)
      },
      bandwidth: {
        total: periodMetrics.reduce((sum, m) => sum + (m.diskIO || 0), 0),
        average: periodMetrics.reduce((sum, m) => sum + (m.throughput || 0), 0) / periodMetrics.length
      }
    };
    
    // Calculate costs (estimated based on usage)
    const durationHours = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60);
    const costEstimates = this.estimateCosts(cpuStats.average, memoryStats.average, durationHours);
    
    return {
      agentId,
      period,
      cpu: cpuStats,
      memory: memoryStats,
      network: networkStats,
      cost: costEstimates
    };
  }
  
  // ============================================================================
  // PRIVATE ANALYTICS METHODS
  // ============================================================================
  
  /**
   * Calculate advanced trend with multiple indicators
   */
  private calculateAdvancedTrend(values: number[], metric: string): PerformanceTrend {
    if (values.length < this.MIN_DATA_POINTS) {
      return {
        metric,
        trend: 'stable',
        changeRate: 0,
        confidence: 0,
        prediction: (minutes: number) => values[values.length - 1] || 0
      };
    }
    
    // Linear regression for trend
    const trend = this.calculateLinearRegression(values);
    
    // Calculate volatility
    const volatility = this.calculateVolatility(values);
    
    // Determine trend direction with confidence
    let direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    
    if (volatility > this.getVolatilityThreshold(metric)) {
      direction = 'volatile';
    } else if (Math.abs(trend.slope) < 0.01) {
      direction = 'stable';
    } else if (trend.slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }
    
    return {
      metric,
      trend: direction,
      changeRate: Math.abs(trend.slope) * 100,
      confidence: Math.max(0, Math.min(100, trend.rSquared * 100)),
      prediction: (minutes: number) => {
        const futurePoints = minutes / 5; // Assuming 5-minute intervals
        return trend.slope * futurePoints + trend.intercept;
      }
    };
  }
  
  /**
   * Calculate linear regression for trend analysis
   */
  private calculateLinearRegression(values: number[]): {
    slope: number;
    intercept: number;
    rSquared: number;
  } {
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
    
    if (totalSumSquares === 0) {
      return { slope: 0, intercept: meanY, rSquared: 1 };
    }
    
    const residualSumSquares = values.reduce((sum, val, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    return { slope, intercept, rSquared };
  }
  
  /**
   * Calculate volatility of a metric
   */
  private calculateVolatility(values: number[]): number {
    if (values.length < 5) return 0;
    
    const recentValues = values.slice(-10);
    const mean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    
    const variance = recentValues.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / recentValues.length;
    
    return Math.sqrt(variance);
  }
  
  /**
   * Get volatility threshold for different metrics
   */
  private getVolatilityThreshold(metric: string): number {
    const thresholds = {
      cpu: 15,
      memory: 10,
      networkLatency: 25,
      successRate: 5,
      errorRate: 8,
      userSatisfaction: 12,
      throughput: 20,
      efficiency: 10
    };
    
    return thresholds[metric as keyof typeof thresholds] || 10;
  }
  
  /**
   * Detect statistical anomalies using Z-score method
   */
  private detectStatisticalAnomalies(
    metrics: AgentPerformanceMetrics[], 
    sensitivity: number
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const latest = metrics[metrics.length - 1];
    
    const metricsToCheck = [
      'cpu', 'memory', 'networkLatency', 'successRate', 'errorRate'
    ];
    
    for (const metric of metricsToCheck) {
      const values = metrics.map(m => (m as any)[metric] || 0);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      const currentValue = (latest as any)[metric] || 0;
      const zScore = Math.abs((currentValue - mean) / stdDev);
      
      if (zScore > sensitivity) {
        anomalies.push({
          metric,
          timestamp: latest.timestamp,
          severity: zScore > sensitivity * 2 ? 'critical' : 'high',
          anomalyScore: Math.min(100, zScore * 20),
          expectedValue: mean,
          actualValue: currentValue,
          deviation: Math.abs(currentValue - mean),
          description: `${metric} is ${zScore.toFixed(1)} standard deviations from normal`,
          recommendations: this.generateAnomalyRecommendations(metric, zScore)
        });
      }
    }
    
    return anomalies;
  }
  
  /**
   * Detect pattern-based anomalies
   */
  private detectPatternAnomalies(metrics: AgentPerformanceMetrics[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    if (metrics.length < 20) return anomalies;
    
    // Check for sudden spikes
    const recent = metrics.slice(-10);
    const before = metrics.slice(-20, -10);
    
    for (const metric of ['cpu', 'memory', 'networkLatency']) {
      const recentValues = recent.map(m => (m as any)[metric] || 0);
      const beforeValues = before.map(m => (m as any)[metric] || 0);
      
      const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
      const beforeAvg = beforeValues.reduce((sum, val) => sum + val, 0) / beforeValues.length;
      
      const spikeThreshold = Math.abs(recentAvg - beforeAvg) * 2;
      
      for (let i = 0; i < recentValues.length; i++) {
        const value = recentValues[i];
        if (Math.abs(value - beforeAvg) > spikeThreshold) {
          anomalies.push({
            metric,
            timestamp: recent[i].timestamp,
            severity: 'medium',
            anomalyScore: 75,
            expectedValue: beforeAvg,
            actualValue: value,
            deviation: Math.abs(value - beforeAvg),
            description: `Sudden spike in ${metric} detected`,
            recommendations: [`Investigate ${metric} spike at ${recent[i].timestamp}`]
          });
        }
      }
    }
    
    return anomalies;
  }
  
  /**
   * Detect seasonal anomalies (requires more data)
   */
  private detectSeasonalAnomalies(metrics: AgentPerformanceMetrics[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Group by hour of day
    const hourlyPatterns = new Map<number, number[]>();
    
    for (const metric of metrics) {
      const hour = metric.timestamp.getHours();
      
      if (!hourlyPatterns.has(hour)) {
        hourlyPatterns.set(hour, []);
      }
      
      hourlyPatterns.get(hour)!.push(metric.cpu);
    }
    
    // Calculate typical patterns for each hour
    const typicalPatterns = new Map<number, { mean: number; stdDev: number }>();
    
    for (const [hour, values] of hourlyPatterns.entries()) {
      if (values.length > 5) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        typicalPatterns.set(hour, { mean, stdDev });
      }
    }
    
    // Check current metrics against patterns
    const latest = metrics[metrics.length - 1];
    const currentHour = latest.timestamp.getHours();
    const typical = typicalPatterns.get(currentHour);
    
    if (typical) {
      const deviation = Math.abs(latest.cpu - typical.mean);
      const zScore = deviation / typical.stdDev;
      
      if (zScore > this.ANOMALY_SENSITIVITY) {
        anomalies.push({
          metric: 'cpu',
          timestamp: latest.timestamp,
          severity: 'medium',
          anomalyScore: 60,
          expectedValue: typical.mean,
          actualValue: latest.cpu,
          deviation,
          description: `CPU usage unusual for this time of day`,
          recommendations: ['Consider time-based resource scaling']
        });
      }
    }
    
    return anomalies;
  }
  
  /**
   * Analyze patterns in performance data
   */
  private analyzePatterns(metrics: AgentPerformanceMetrics[]): string[] {
    const insights: string[] = [];
    
    // Time of day patterns
    const hourlyPerformance = new Map<number, number[]>();
    
    for (const metric of metrics) {
      const hour = metric.timestamp.getHours();
      
      if (!hourlyPerformance.has(hour)) {
        hourlyPerformance.set(hour, []);
      }
      
      hourlyPerformance.get(hour)!.push(metric.successRate);
    }
    
    // Find best and worst performing hours
    let bestHour = 0;
    let worstHour = 0;
    let bestAvg = 0;
    let worstAvg = 100;
    
    for (const [hour, values] of hourlyPerformance.entries()) {
      if (values.length < 3) continue;
      
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      if (avg > bestAvg) {
        bestAvg = avg;
        bestHour = hour;
      }
      
      if (avg < worstAvg) {
        worstAvg = avg;
        worstHour = hour;
      }
    }
    
    insights.push(`Peak performance at ${bestHour}:00 (success rate: ${bestAvg.toFixed(1)}%)`);
    insights.push(`Lowest performance at ${worstHour}:00 (success rate: ${worstAvg.toFixed(1)}%)`);
    
    // Day of week patterns
    const dailyPerformance = new Map<number, number[]>();
    
    for (const metric of metrics) {
      const day = metric.timestamp.getDay();
      
      if (!dailyPerformance.has(day)) {
        dailyPerformance.set(day, []);
      }
      
      dailyPerformance.get(day)!.push(metric.throughput);
    }
    
    // Find best and worst performing days
    let bestDay = 0;
    let worstDay = 0;
    let bestDayAvg = 0;
    let worstDayAvg = 0;
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (const [day, values] of dailyPerformance.entries()) {
      if (values.length < 5) continue;
      
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      if (avg > bestDayAvg) {
        bestDayAvg = avg;
        bestDay = day;
      }
      
      if (avg < worstDayAvg) {
        worstDayAvg = avg;
        worstDay = day;
      }
    }
    
    if (bestDayAvg > 0) {
      insights.push(`Best performance on ${dayNames[bestDay]}s (avg throughput: ${bestDayAvg.toFixed(1)})`);
    }
    
    if (worstDayAvg > 0 && worstDayAvg < 100) {
      insights.push(`Lowest performance on ${dayNames[worstDay]}s (avg throughput: ${worstDayAvg.toFixed(1)})`);
    }
    
    return insights;
  }
  
  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(
    agentId: string,
    metrics: AgentPerformanceMetrics[],
    predictions: Map<string, number>
  ): string[] {
    const recommendations: string[] = [];
    const latest = metrics[metrics.length - 1];
    
    // CPU recommendations
    if (predictions.get('cpu') && predictions.get('cpu')! > 80) {
      recommendations.push('CPU usage predicted to exceed 80%. Consider scaling up resources.');
    }
    
    // Memory recommendations
    if (latest.memory > 85) {
      recommendations.push('Memory usage is high. Implement memory optimization techniques.');
    }
    
    // Response time recommendations
    if (predictions.get('averageResponseTime') && predictions.get('averageResponseTime')! > 500) {
      recommendations.push('Response time predicted to degrade. Review and optimize critical paths.');
    }
    
    // Success rate recommendations
    if (predictions.get('successRate') && predictions.get('successRate')! < 90) {
      recommendations.push('Success rate predicted to drop below 90%. Review error handling.');
    }
    
    // General recommendations based on trends
    const cpuTrend = this.calculateAdvancedTrend(
      metrics.slice(-10).map(m => m.cpu), 
      'cpu'
    );
    
    if (cpuTrend.trend === 'increasing' && cpuTrend.changeRate > 5) {
      recommendations.push('CPU usage trending upward. Investigate resource leaks.');
    }
    
    return recommendations;
  }
  
  /**
   * Calculate component scores for performance evaluation
   */
  private calculateComponentScores(
    metrics: AgentPerformanceMetrics[], 
    benchmarks: PerformanceBenchmark[]
  ): {
    efficiency: number;
    reliability: number;
    quality: number;
    scalability: number;
    costEffectiveness: number;
  } {
    const latest = metrics[metrics.length - 1];
    
    // Efficiency score (CPU, Memory, Response Time)
    const cpuScore = this.getMetricScore(metrics, 'cpu', benchmarks);
    const memoryScore = this.getMetricScore(metrics, 'memory', benchmarks);
    const responseScore = this.getMetricScore(metrics, 'averageResponseTime', benchmarks);
    const efficiency = (cpuScore + memoryScore + responseScore) / 3;
    
    // Reliability score (Success Rate, Error Rate)
    const successScore = this.getMetricScore(metrics, 'successRate', benchmarks);
    const errorScore = this.getMetricScore(metrics, 'errorRate', benchmarks);
    const reliability = (successScore + errorScore) / 2;
    
    // Quality score (User Satisfaction, Accuracy)
    const satisfactionScore = this.getMetricScore(metrics, 'userSatisfaction', benchmarks);
    const accuracyScore = this.getMetricScore(metrics, 'accuracy', benchmarks);
    const quality = (satisfactionScore + accuracyScore) / 2;
    
    // Scalability score (based on throughput trends)
    const throughputValues = metrics.map(m => m.throughput || 0);
    const avgThroughput = throughputValues.reduce((sum, val) => sum + val, 0) / throughputValues.length;
    const maxThroughput = Math.max(...throughputValues);
    const scalability = Math.min(100, (avgThroughput / maxThroughput) * 100);
    
    // Cost effectiveness (based on efficiency vs cost)
    const costEffectiveness = latest.efficiency > 0.8 ? 95 : 
                          latest.efficiency > 0.6 ? 80 : 
                          latest.efficiency > 0.4 ? 60 : 40;
    
    return {
      efficiency: Math.round(efficiency),
      reliability: Math.round(reliability),
      quality: Math.round(quality),
      scalability: Math.round(scalability),
      costEffectiveness: Math.round(costEffectiveness)
    };
  }
  
  /**
   * Get score for a specific metric based on benchmarks
   */
  private getMetricScore(
    metrics: AgentPerformanceMetrics[], 
    metric: string, 
    benchmarks: PerformanceBenchmark[]
  ): number {
    const benchmark = benchmarks.find(b => b.metric === metric);
    if (!benchmark) return 50; // Default score if no benchmark
    
    const values = metrics.map(m => (m as any)[metric] || 0);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Score based on how close to excellent benchmark
    if (avg <= benchmark.excellent) return 100;
    if (avg <= benchmark.target) return 85;
    if (avg <= benchmark.baseline) return 70;
    return Math.max(0, 50 - ((avg - benchmark.baseline) / benchmark.baseline) * 50);
  }
  
  /**
   * Calculate historical ranking information
   */
  private calculateHistoricalRanking(
    agentId: string, 
    metrics: AgentPerformanceMetrics[]
  ): { current: number; previous: number; change: number } {
    // This would typically query historical ranking data
    // For now, simulate ranking based on recent performance
    const latestScore = this.generatePerformanceScore(agentId, metrics);
    
    // Simulate some ranking variation
    const previousScore = latestScore.overall - (Math.random() * 10 - 5);
    const currentRank = Math.floor(Math.random() * 10) + 1;
    const previousRank = currentRank + Math.floor(Math.random() * 3) - 1;
    
    return {
      current: currentRank,
      previous: previousRank,
      change: previousRank - currentRank
    };
  }
  
  /**
   * Identify agent strengths and weaknesses
   */
  private identifyStrengthsWeaknesses(
    score: PerformanceScore, 
    trends: Map<string, PerformanceTrend>
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    // Analyze component scores
    if (score.efficiency > 80) {
      strengths.push('High resource efficiency');
    } else if (score.efficiency < 60) {
      weaknesses.push('Low resource efficiency');
    }
    
    if (score.reliability > 85) {
      strengths.push('Excellent reliability and consistency');
    } else if (score.reliability < 70) {
      weaknesses.push('Reliability issues detected');
    }
    
    if (score.quality > 85) {
      strengths.push('High quality of service');
    } else if (score.quality < 70) {
      weaknesses.push('Quality improvement needed');
    }
    
    // Analyze trends
    for (const [metric, trend] of trends.entries()) {
      if (trend.trend === 'increasing' && this.isNegativeMetric(metric)) {
        weaknesses.push(`${metric} trending upward`);
      } else if (trend.trend === 'increasing' && !this.isNegativeMetric(metric)) {
        strengths.push(`${metric} improving over time`);
      } else if (trend.trend === 'decreasing' && this.isNegativeMetric(metric)) {
        strengths.push(`${metric} trending downward`);
      } else if (trend.trend === 'decreasing' && !this.isNegativeMetric(metric)) {
        weaknesses.push(`${metric} declining`);
      }
    }
    
    return { strengths, weaknesses };
  }
  
  /**
   * Check if a metric is negative (higher is worse)
   */
  private isNegativeMetric(metric: string): boolean {
    const negativeMetrics = ['cpu', 'memory', 'networkLatency', 'errorRate'];
    return negativeMetrics.includes(metric);
  }
  
  /**
   * Generate agent-specific recommendations
   */
  private generateAgentRecommendations(
    score: PerformanceScore, 
    trends: Map<string, PerformanceTrend>
  ): string[] {
    const recommendations: string[] = [];
    
    // Overall performance recommendations
    if (score.overall < 70) {
      recommendations.push('Consider comprehensive performance optimization review');
    } else if (score.overall > 90) {
      recommendations.push('Maintain current excellent performance levels');
    }
    
    // Component-specific recommendations
    if (score.efficiency < 70) {
      recommendations.push('Optimize resource utilization and reduce waste');
    }
    
    if (score.reliability < 75) {
      recommendations.push('Improve error handling and implement better monitoring');
    }
    
    if (score.quality < 80) {
      recommendations.push('Focus on user experience and satisfaction improvements');
    }
    
    // Trend-based recommendations
    for (const [metric, trend] of trends.entries()) {
      if (trend.trend === 'degrading' || (trend.trend === 'decreasing' && !this.isNegativeMetric(metric))) {
        recommendations.push(`Address declining ${metric} trend immediately`);
      }
    }
    
    return recommendations;
  }
  
  /**
   * Get average metrics for comparison
   */
  private getAverageMetrics(metrics: AgentPerformanceMetrics[]): Record<string, number> {
    const avg = {
      cpu: 0,
      memory: 0,
      networkLatency: 0,
      successRate: 0,
      errorRate: 0,
      userSatisfaction: 0,
      throughput: 0,
      efficiency: 0
    };
    
    for (const metric of metrics) {
      avg.cpu += metric.cpu;
      avg.memory += metric.memory;
      avg.networkLatency += metric.networkLatency;
      avg.successRate += metric.successRate;
      avg.errorRate += metric.errorRate;
      avg.userSatisfaction += metric.userSatisfaction;
      avg.throughput += metric.throughput || 0;
      avg.efficiency += metric.efficiency;
    }
    
    const count = metrics.length;
    
    return {
      cpu: avg.cpu / count,
      memory: avg.memory / count,
      networkLatency: avg.networkLatency / count,
      successRate: avg.successRate / count,
      errorRate: avg.errorRate / count,
      userSatisfaction: avg.userSatisfaction / count,
      throughput: avg.throughput / count,
      efficiency: avg.efficiency / count
    };
  }
  
  /**
   * Estimate costs based on resource usage
   */
  private estimateCosts(avgCpu: number, avgMemory: number, durationHours: number): {
    compute: number;
    storage: number;
    network: number;
    total: number;
  } {
    // Simplified cost model (would use actual cloud pricing in production)
    const computeCost = (avgCpu / 100) * durationHours * 0.10; // $0.10 per CPU-hour
    const storageCost = (avgMemory / 100) * durationHours * 0.05; // $0.05 per GB-hour
    const networkCost = durationHours * 0.02; // $0.02 per hour baseline
    
    return {
      compute: Math.round(computeCost * 100) / 100,
      storage: Math.round(storageCost * 100) / 100,
      network: Math.round(networkCost * 100) / 100,
      total: Math.round((computeCost + storageCost + networkCost) * 100) / 100
    };
  }
  
  /**
   * Get agent name (would come from database in production)
   */
  private getAgentName(agentId: string): string {
    const names: Record<string, string> = {
      'sofra': 'Sofra',
      'aqar': 'Aqar',
      'mawid': 'Mawid',
      'tajer': 'Tajer'
    };
    
    return names[agentId] || agentId;
  }
  
  /**
   * Generate anomaly recommendations
   */
  private generateAnomalyRecommendations(metric: string, zScore: number): string[] {
    const recommendations: string[] = [];
    
    switch (metric) {
      case 'cpu':
        recommendations.push('Scale up resources or optimize CPU-intensive tasks');
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
   * Get higher severity between two severity levels
   */
  private getHigherSeverity(severity1: string, severity2: string): string {
    const severityLevels = {
      'info': 0,
      'warning': 1,
      'error': 2,
      'critical': 3
    };
    
    const level1 = severityLevels[severity1 as keyof typeof severityLevels] || 0;
    const level2 = severityLevels[severity2 as keyof typeof severityLevels] || 0;
    
    return level1 >= level2 ? severity1 : severity2;
  }
}