/**
 * 🚀 PERFORMANCE BENCHMARKING AND LOAD TESTING
 * 
 * Comprehensive performance testing framework including:
 * - Load testing with concurrent users
 * - Stress testing and breaking points
 * - Performance benchmarking and metrics
 * - Resource utilization monitoring
 * - Response time and throughput analysis
 * - Scalability testing and capacity planning
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { TestResult, TestContext } from '../framework/TestFramework';

// ============================================================================
// PERFORMANCE TESTING TYPES
// ============================================================================

/**
 * Load test configuration
 */
export interface LoadTestConfig {
  name: string;
  description: string;
  target: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
  };
  load: {
    users: number;
    duration: number; // seconds
    rampUp?: number; // seconds
    rampDown?: number; // seconds
  };
  thresholds: PerformanceThresholds;
  monitoring: MonitoringConfig;
  scenarios?: LoadTestScenario[];
}

/**
 * Performance thresholds for validation
 */
export interface PerformanceThresholds {
  responseTime: {
    avg: number; // milliseconds
    p95: number; // 95th percentile
    p99: number; // 99th percentile
    max: number; // maximum acceptable
  };
  throughput: {
    min: number; // requests per second
    target: number; // target rps
  };
  errorRate: {
    max: number; // maximum error rate percentage
    critical: number; // critical error rate
  };
  resourceUtilization: {
    cpu: number; // maximum CPU percentage
    memory: number; // maximum memory percentage
    network: number; // maximum network bandwidth
  };
}

/**
 * Monitoring configuration during tests
 */
export interface MonitoringConfig {
  metrics: string[];
  interval: number; // milliseconds
  alerts: AlertConfig[];
  sampling: {
    rate: number; // samples per second
    window: number; // time window in seconds
  };
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  metric: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'alert' | 'stop';
}

/**
 * Load test scenario
 */
export interface LoadTestScenario {
  name: string;
  weight: number; // percentage of total traffic
  config: Partial<LoadTestConfig>;
}

/**
 * Performance metrics collected during test
 */
export interface PerformanceMetrics {
  timestamp: Date;
  activeUsers: number;
  requestsPerSecond: number;
  responseTime: {
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requests: number;
    bytes: number;
    errors: number;
  };
  resourceUtilization: {
    cpu: number;
    memory: number;
    network: {
      inbound: number;
      outbound: number;
    };
  };
  errors: {
    count: number;
    rate: number;
    types: Record<string, number>;
  };
}

/**
 * Load test results
 */
export interface LoadTestResult {
  config: LoadTestConfig;
  startTime: Date;
  endTime: Date;
  duration: number;
  metrics: PerformanceMetrics[];
  summary: PerformanceSummary;
  alerts: AlertEvent[];
  status: 'passed' | 'failed' | 'warning';
  recommendations: string[];
}

/**
 * Performance summary
 */
export interface PerformanceSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  peakResponseTime: number;
  throughput: number;
  peakThroughput: number;
  errorRate: number;
  resourcePeaks: {
    cpu: number;
    memory: number;
    network: number;
  };
  scalability: {
    maxUsers: number;
    breakingPoint?: number;
    optimalUsers?: number;
  };
}

/**
 * Alert event
 */
export interface AlertEvent {
  timestamp: Date;
  metric: string;
  value: number;
  threshold: number;
  severity: AlertConfig['severity'];
  message: string;
  resolved: boolean;
}

// ============================================================================
// LOAD TESTING ENGINE
// ============================================================================

/**
 * Main load testing engine
 */
export class LoadTestingEngine extends EventEmitter {
  private activeTests: Map<string, LoadTestRunner> = new Map();
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private alerts: AlertEvent[] = [];

  constructor(private config: LoadTestingEngineConfig = {}) {
    super();
    this.setupDefaultConfig();
  }

  /**
   * Execute load test
   */
  async executeLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    console.log(`🚀 Starting load test: ${config.name}`);
    
    const runner = new LoadTestRunner(config);
    this.activeTests.set(config.name, runner);
    
    const startTime = new Date();
    let metrics: PerformanceMetrics[] = [];
    let alerts: AlertEvent[] = [];

    try {
      // Start monitoring
      const monitor = new PerformanceMonitor(config.monitoring);
      monitor.on('metrics', (data) => {
        metrics.push(data);
        this.emit('metrics', config.name, data);
      });
      
      monitor.on('alert', (alert) => {
        alerts.push(alert);
        this.emit('alert', config.name, alert);
        
        // Stop test if critical alert
        if (alert.severity === 'critical' && config.monitoring.alerts
          .find(a => a.metric === alert.metric)?.action === 'stop') {
          runner.stop('Critical threshold exceeded');
        }
      });

      // Execute test
      await runner.execute();
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Generate summary
      const summary = this.generateSummary(metrics, config);
      
      // Determine status
      const status = this.evaluateTestResult(summary, config.thresholds);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(summary, alerts, config);

      const result: LoadTestResult = {
        config,
        startTime,
        endTime,
        duration,
        metrics,
        summary,
        alerts,
        status,
        recommendations
      };

      console.log(`✅ Load test completed: ${config.name} (${status})`);
      return result;

    } catch (error) {
      console.error(`❌ Load test failed: ${config.name}`, error);
      
      return {
        config,
        startTime,
        endTime: new Date(),
        duration: new Date().getTime() - startTime.getTime(),
        metrics,
        summary: this.generateSummary(metrics, config),
        alerts,
        status: 'failed',
        recommendations: [`Test failed due to error: ${error}`]
      };
    } finally {
      this.activeTests.delete(config.name);
      this.metrics.set(config.name, metrics);
    }
  }

  /**
   * Stop active load test
   */
  async stopLoadTest(testName: string): Promise<boolean> {
    const runner = this.activeTests.get(testName);
    if (!runner) return false;

    await runner.stop('Manually stopped');
    return true;
  }

  /**
   * Get test results
   */
  getTestResults(testName: string): LoadTestResult | null {
    const metrics = this.metrics.get(testName);
    if (!metrics || metrics.length === 0) return null;

    // Reconstruct result from stored metrics
    const config = this.activeTests.get(testName)?.config;
    if (!config) return null;

    const summary = this.generateSummary(metrics, config);
    const status = this.evaluateTestResult(summary, config.thresholds);
    const recommendations = this.generateRecommendations(summary, [], config);

    return {
      config,
      startTime: metrics[0]?.timestamp || new Date(),
      endTime: metrics[metrics.length - 1]?.timestamp || new Date(),
      duration: metrics.length > 0 ? 
        metrics[metrics.length - 1].timestamp.getTime() - metrics[0].timestamp.getTime() : 0,
      metrics,
      summary,
      alerts: [],
      status,
      recommendations
    };
  }

  /**
   * Generate performance summary
   */
  private generateSummary(metrics: PerformanceMetrics[], config: LoadTestConfig): PerformanceSummary {
    if (metrics.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        peakResponseTime: 0,
        throughput: 0,
        peakThroughput: 0,
        errorRate: 0,
        resourcePeaks: { cpu: 0, memory: 0, network: 0 },
        scalability: { maxUsers: config.load.users }
      };
    }

    const totalRequests = metrics.reduce((sum, m) => sum + m.throughput.requests, 0);
    const successfulRequests = totalRequests - metrics.reduce((sum, m) => sum + m.throughput.errors, 0);
    const failedRequests = metrics.reduce((sum, m) => sum + m.throughput.errors, 0);

    const responseTimes = metrics.map(m => m.responseTime.avg);
    const averageResponseTime = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
    const peakResponseTime = Math.max(...responseTimes);

    const throughputs = metrics.map(m => m.throughput.requests);
    const throughput = throughputs.reduce((sum, t) => sum + t, 0) / throughputs.length;
    const peakThroughput = Math.max(...throughputs);

    const errorRate = (failedRequests / totalRequests) * 100;

    const cpuUsages = metrics.map(m => m.resourceUtilization.cpu);
    const memoryUsages = metrics.map(m => m.resourceUtilization.memory);
    const networkUsages = metrics.map(m => 
      Math.max(m.resourceUtilization.network.inbound, m.resourceUtilization.network.outbound)
    );

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      peakResponseTime,
      throughput,
      peakThroughput,
      errorRate,
      resourcePeaks: {
        cpu: Math.max(...cpuUsages),
        memory: Math.max(...memoryUsages),
        network: Math.max(...networkUsages)
      },
      scalability: {
        maxUsers: config.load.users,
        optimalUsers: this.findOptimalUserCount(metrics, config.thresholds)
      }
    };
  }

  /**
   * Evaluate test result against thresholds
   */
  private evaluateTestResult(
    summary: PerformanceSummary, 
    thresholds: PerformanceThresholds
  ): 'passed' | 'failed' | 'warning' {
    let failed = 0;
    let warnings = 0;

    // Check response time thresholds
    if (summary.averageResponseTime > thresholds.responseTime.avg) failed++;
    if (summary.peakResponseTime > thresholds.responseTime.max) failed++;

    // Check throughput thresholds
    if (summary.throughput < thresholds.throughput.min) failed++;
    if (summary.throughput < thresholds.throughput.target * 0.8) warnings++;

    // Check error rate thresholds
    if (summary.errorRate > thresholds.errorRate.max) failed++;
    if (summary.errorRate > thresholds.errorRate.critical) failed++;

    // Check resource utilization
    if (summary.resourcePeaks.cpu > thresholds.resourceUtilization.cpu) failed++;
    if (summary.resourcePeaks.memory > thresholds.resourceUtilization.memory) failed++;
    if (summary.resourcePeaks.network > thresholds.resourceUtilization.network) failed++;

    if (failed > 0) return 'failed';
    if (warnings > 0) return 'warning';
    return 'passed';
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    summary: PerformanceSummary,
    alerts: AlertEvent[],
    config: LoadTestConfig
  ): string[] {
    const recommendations: string[] = [];

    // Response time recommendations
    if (summary.averageResponseTime > config.thresholds.responseTime.avg) {
      recommendations.push(
        `Average response time (${summary.averageResponseTime}ms) exceeds threshold (${config.thresholds.responseTime.avg}ms). Consider optimizing database queries, implementing caching, or scaling resources.`
      );
    }

    // Throughput recommendations
    if (summary.throughput < config.thresholds.throughput.target) {
      recommendations.push(
        `Throughput (${summary.throughput} RPS) below target (${config.thresholds.throughput.target} RPS). Consider horizontal scaling or performance optimization.`
      );
    }

    // Error rate recommendations
    if (summary.errorRate > config.thresholds.errorRate.max) {
      recommendations.push(
        `Error rate (${summary.errorRate.toFixed(2)}%) exceeds threshold. Review error logs and fix critical issues.`
      );
    }

    // Resource utilization recommendations
    if (summary.resourcePeaks.cpu > config.thresholds.resourceUtilization.cpu) {
      recommendations.push(
        `CPU usage peaked at ${summary.resourcePeaks.cpu}%. Consider CPU optimization or scaling.`
      );
    }

    if (summary.resourcePeaks.memory > config.thresholds.resourceUtilization.memory) {
      recommendations.push(
        `Memory usage peaked at ${summary.resourcePeaks.memory}%. Consider memory optimization or increasing available memory.`
      );
    }

    // Scalability recommendations
    if (summary.scalability.optimalUsers && summary.scalability.optimalUsers < config.load.users) {
      recommendations.push(
        `Optimal user count appears to be ${summary.scalability.optimalUsers}. Consider this for capacity planning.`
      );
    }

    // Alert-based recommendations
    alerts.forEach(alert => {
      if (!alert.resolved) {
        recommendations.push(
          `Unresolved alert: ${alert.message}. Address this issue for better performance.`
        );
      }
    });

    return recommendations;
  }

  /**
   * Find optimal user count from metrics
   */
  private findOptimalUserCount(
    metrics: PerformanceMetrics[],
    thresholds: PerformanceThresholds
  ): number | undefined {
    let optimalUsers: number | undefined;

    for (const metric of metrics) {
      const responseTimeOk = metric.responseTime.avg <= thresholds.responseTime.avg;
      const errorRateOk = (metric.errors.rate / 100) <= thresholds.errorRate.max;
      const throughputOk = metric.requestsPerSecond >= thresholds.throughput.min;

      if (responseTimeOk && errorRateOk && throughputOk) {
        if (!optimalUsers || metric.activeUsers > optimalUsers) {
          optimalUsers = metric.activeUsers;
        }
      }
    }

    return optimalUsers;
  }

  /**
   * Setup default configuration
   */
  private setupDefaultConfig(): void {
    // Default configuration would be loaded from config files
  }
}

// ============================================================================
// LOAD TEST RUNNER
// ============================================================================

/**
 * Individual load test runner
 */
export class LoadTestRunner {
  private workers: LoadTestWorker[] = [];
  private isRunning = false;
  private stopReason?: string;

  constructor(private config: LoadTestConfig) {}

  /**
   * Execute the load test
   */
  async execute(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Test is already running');
    }

    this.isRunning = true;
    console.log(`🔄 Executing load test: ${this.config.name}`);

    try {
      // Ramp up phase
      if (this.config.load.rampUp) {
        await this.rampUp();
      }

      // Main test phase
      await this.runMainPhase();

      // Ramp down phase
      if (this.config.load.rampDown) {
        await this.rampDown();
      }

    } finally {
      this.isRunning = false;
      await this.cleanup();
    }
  }

  /**
   * Stop the load test
   */
  async stop(reason: string): Promise<void> {
    this.stopReason = reason;
    this.isRunning = false;

    // Stop all workers
    await Promise.all(this.workers.map(worker => worker.stop()));
  }

  /**
   * Ramp up phase
   */
  private async rampUp(): Promise<void> {
    const rampUpTime = this.config.load.rampUp!;
    const targetUsers = this.config.load.users;
    const rampSteps = 10;
    const stepDuration = rampUpTime / rampSteps;
    const usersPerStep = targetUsers / rampSteps;

    for (let i = 1; i <= rampSteps; i++) {
      if (!this.isRunning) break;

      const currentUsers = Math.floor(usersPerStep * i);
      await this.adjustWorkerCount(currentUsers);
      await new Promise(resolve => setTimeout(resolve, stepDuration * 1000));
    }
  }

  /**
   * Main test phase
   */
  private async runMainPhase(): Promise<void> {
    const duration = this.config.load.duration * 1000; // Convert to milliseconds
    const startTime = Date.now();

    // Start workers
    await this.adjustWorkerCount(this.config.load.users);

    // Run for specified duration
    while (this.isRunning && (Date.now() - startTime) < duration) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Check every second
    }
  }

  /**
   * Ramp down phase
   */
  private async rampDown(): Promise<void> {
    const rampDownTime = this.config.load.rampDown!;
    const rampSteps = 10;
    const stepDuration = rampDownTime / rampSteps;
    const usersPerStep = this.config.load.users / rampSteps;

    for (let i = rampSteps; i >= 1; i--) {
      if (!this.isRunning) break;

      const currentUsers = Math.floor(usersPerStep * i);
      await this.adjustWorkerCount(currentUsers);
      await new Promise(resolve => setTimeout(resolve, stepDuration * 1000));
    }
  }

  /**
   * Adjust number of active workers
   */
  private async adjustWorkerCount(targetUsers: number): Promise<void> {
    const currentWorkers = this.workers.length;

    if (targetUsers > currentWorkers) {
      // Add workers
      const workersToAdd = targetUsers - currentWorkers;
      for (let i = 0; i < workersToAdd; i++) {
        const worker = new LoadTestWorker(this.config.target);
        this.workers.push(worker);
        await worker.start();
      }
    } else if (targetUsers < currentWorkers) {
      // Remove workers
      const workersToRemove = currentWorkers - targetUsers;
      for (let i = 0; i < workersToRemove; i++) {
        const worker = this.workers.pop();
        if (worker) {
          await worker.stop();
        }
      }
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    await Promise.all(this.workers.map(worker => worker.stop()));
    this.workers = [];
  }
}

// ============================================================================
// LOAD TEST WORKER
// ============================================================================

/**
 * Individual load test worker
 */
export class LoadTestWorker {
  private isRunning = false;
  private interval?: NodeJS.Timeout;
  private metrics = {
    requests: 0,
    errors: 0,
    responseTime: [] as number[],
    bytes: 0
  };

  constructor(private target: LoadTestConfig['target']) {}

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.resetMetrics();

    // Start making requests
    this.interval = setInterval(() => {
      if (this.isRunning) {
        this.makeRequest();
      }
    }, 100); // Make request every 100ms
  }

  /**
   * Stop the worker
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  /**
   * Make HTTP request
   */
  private async makeRequest(): Promise<void> {
    const startTime = Date.now();

    try {
      const response = await fetch(this.target.url, {
        method: this.target.method,
        headers: this.target.headers,
        body: this.target.body ? JSON.stringify(this.target.body) : undefined
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.metrics.requests++;
      this.metrics.responseTime.push(responseTime);
      
      if (response.ok) {
        this.metrics.bytes += parseInt(response.headers.get('content-length') || '0');
      } else {
        this.metrics.errors++;
      }

    } catch (error) {
      this.metrics.requests++;
      this.metrics.errors++;
    }
  }

  /**
   * Reset metrics
   */
  private resetMetrics(): void {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      bytes: 0
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): any {
    const responseTimes = this.metrics.responseTime;
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length 
      : 0;

    return {
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: this.metrics.requests > 0 ? (this.metrics.errors / this.metrics.requests) * 100 : 0,
      avgResponseTime,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      bytes: this.metrics.bytes
    };
  }
}

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

/**
 * Performance monitoring during tests
 */
export class PerformanceMonitor extends EventEmitter {
  private interval?: NodeJS.Timeout;
  private metrics: PerformanceMetrics[] = [];

  constructor(private config: MonitoringConfig) {
    super();
  }

  /**
   * Start monitoring
   */
  start(): void {
    this.interval = setInterval(() => {
      this.collectMetrics();
    }, this.config.interval);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  /**
   * Collect performance metrics
   */
  private async collectMetrics(): Promise<void> {
    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      activeUsers: this.getActiveUserCount(),
      requestsPerSecond: this.calculateRequestsPerSecond(),
      responseTime: this.calculateResponseTimeMetrics(),
      throughput: this.calculateThroughput(),
      resourceUtilization: await this.getResourceUtilization(),
      errors: this.calculateErrorMetrics()
    };

    this.metrics.push(metrics);
    this.emit('metrics', metrics);

    // Check alerts
    this.checkAlerts(metrics);
  }

  /**
   * Get active user count
   */
  private getActiveUserCount(): number {
    // This would integrate with actual user tracking
    return Math.floor(Math.random() * 100) + 50; // Mock data
  }

  /**
   * Calculate requests per second
   */
  private calculateRequestsPerSecond(): number {
    // This would integrate with actual request tracking
    return Math.floor(Math.random() * 500) + 100; // Mock data
  }

  /**
   * Calculate response time metrics
   */
  private calculateResponseTimeMetrics(): PerformanceMetrics['responseTime'] {
    // This would integrate with actual response time tracking
    const base = 150;
    const variance = 50;
    
    return {
      avg: base + (Math.random() - 0.5) * variance,
      min: base - variance,
      max: base + variance,
      p50: base + (Math.random() - 0.5) * variance * 0.5,
      p95: base + variance * 0.95,
      p99: base + variance * 0.99
    };
  }

  /**
   * Calculate throughput metrics
   */
  private calculateThroughput(): PerformanceMetrics['throughput'] {
    // This would integrate with actual throughput tracking
    return {
      requests: Math.floor(Math.random() * 1000) + 500,
      bytes: Math.floor(Math.random() * 1000000) + 500000,
      errors: Math.floor(Math.random() * 10)
    };
  }

  /**
   * Get resource utilization
   */
  private async getResourceUtilization(): Promise<PerformanceMetrics['resourceUtilization']> {
    // This would integrate with actual resource monitoring
    return {
      cpu: Math.random() * 80 + 10,
      memory: Math.random() * 70 + 20,
      network: {
        inbound: Math.random() * 1000000 + 500000,
        outbound: Math.random() * 1000000 + 500000
      }
    };
  }

  /**
   * Calculate error metrics
   */
  private calculateErrorMetrics(): PerformanceMetrics['errors'] {
    // This would integrate with actual error tracking
    const errorCount = Math.floor(Math.random() * 5);
    return {
      count: errorCount,
      rate: (errorCount / 1000) * 100, // Assuming 1000 requests sampled
      types: {
        'timeout': Math.floor(errorCount * 0.3),
        'connection_error': Math.floor(errorCount * 0.2),
        'server_error': Math.floor(errorCount * 0.4),
        'client_error': Math.floor(errorCount * 0.1)
      }
    };
  }

  /**
   * Check for alerts based on thresholds
   */
  private checkAlerts(metrics: PerformanceMetrics): void {
    for (const alertConfig of this.config.alerts) {
      const value = this.getMetricValue(metrics, alertConfig.metric);
      
      if (this.evaluateCondition(value, alertConfig.condition, alertConfig.threshold)) {
        const alert: AlertEvent = {
          timestamp: new Date(),
          metric: alertConfig.metric,
          value,
          threshold: alertConfig.threshold,
          severity: alertConfig.severity,
          message: `${alertConfig.metric} ${alertConfig.condition} ${alertConfig.threshold} (current: ${value})`,
          resolved: false
        };

        this.emit('alert', alert);
      }
    }
  }

  /**
   * Get metric value from metrics object
   */
  private getMetricValue(metrics: PerformanceMetrics, metricPath: string): number {
    const pathParts = metricPath.split('.');
    let value: any = metrics;

    for (const part of pathParts) {
      value = value[part];
    }

    return typeof value === 'number' ? value : 0;
  }

  /**
   * Evaluate condition against threshold
   */
  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value === threshold;
      case '!=':
        return value !== threshold;
      default:
        return false;
    }
  }
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Load testing engine configuration
 */
export interface LoadTestingEngineConfig {
  maxConcurrentTests?: number;
  defaultTimeout?: number;
  metricsRetention?: number;
  alerting?: {
    enabled: boolean;
    channels: string[];
  };
  reporting?: {
    format: 'json' | 'html' | 'csv';
    destination: string;
  };
}

export default LoadTestingEngine;