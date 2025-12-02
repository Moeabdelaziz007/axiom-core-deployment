/**
 * 📊 Error Handling Performance Analyzer
 * 
 * Comprehensive performance analysis utilities for error handling paths in the Axiom system.
 * This tool measures execution time, memory usage, and performance impact of error scenarios.
 * 
 * Features:
 * - Execution time measurement for error handling paths
 * - Memory usage analysis during error scenarios
 * - Performance benchmarking for error recovery
 * - Load testing for high error rate scenarios
 * - Real-time performance monitoring
 * - Performance optimization recommendations
 */

// ============================================================================
// PERFORMANCE METRICS INTERFACES
// ============================================================================

/**
 * Performance metrics for a single error handling operation
 */
export class ErrorHandlingMetrics {
  constructor() {
    this.operationType = '';
    this.startTime = 0;
    this.endTime = 0;
    this.duration = 0;
    this.memoryBefore = 0;
    this.memoryAfter = 0;
    this.memoryDelta = 0;
    this.errorType = '';
    this.recoveryTime = 0;
    this.retryCount = 0;
    this.success = false;
    this.timestamp = Date.now();
  }

  /**
   * Start timing an operation
   */
  start(operationType, errorType = '') {
    this.operationType = operationType;
    this.errorType = errorType;
    this.startTime = performance.now();
    this.memoryBefore = this.getMemoryUsage();
  }

  /**
   * End timing and calculate metrics
   */
  end(success = true, retryCount = 0) {
    this.endTime = performance.now();
    this.duration = this.endTime - this.startTime;
    this.memoryAfter = this.getMemoryUsage();
    this.memoryDelta = this.memoryAfter - this.memoryBefore;
    this.success = success;
    this.retryCount = retryCount;
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance.memory).usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Convert metrics to JSON
   */
  toJSON() {
    return {
      operationType: this.operationType,
      duration: this.duration,
      memoryDelta: this.memoryDelta,
      errorType: this.errorType,
      retryCount: this.retryCount,
      success: this.success,
      timestamp: this.timestamp
    };
  }
}

/**
 * Performance benchmark configuration
 */
export class BenchmarkConfig {
  constructor() {
    this.iterations = 100;
    this.concurrentOperations = 10;
    this.errorRate = 0.1;
    this.errorTypes = ['network', 'service', 'validation', 'timeout'];
    this.memorySamplingInterval = 100;
    this.maxDuration = 30000; // 30 seconds
  }
}

// ============================================================================
// MAIN PERFORMANCE ANALYZER CLASS
// ============================================================================

export class ErrorHandlingPerformanceAnalyzer {
  constructor() {
    this.metrics = [];
    this.benchmarks = new Map();
    this.memorySnapshots = [];
    this.activeOperations = new Set();
    this.config = new BenchmarkConfig();
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.metrics = [];
    this.memorySnapshots = [];
    
    // Start memory monitoring
    this.monitoringInterval = setInterval(() => {
      this.recordMemorySnapshot();
    }, this.config.memorySamplingInterval);
    
    console.log('[Performance Analyzer] Started monitoring');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('[Performance Analyzer] Stopped monitoring');
  }

  /**
   * Record current memory snapshot
   */
  recordMemorySnapshot() {
    const snapshot = {
      timestamp: Date.now(),
      memory: this.getCurrentMemoryUsage(),
      activeOperations: this.activeOperations.size
    };
    
    this.memorySnapshots.push(snapshot);
    
    // Keep only last 1000 snapshots
    if (this.memorySnapshots.length > 1000) {
      this.memorySnapshots = this.memorySnapshots.slice(-1000);
    }
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = performance.memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }

  /**
   * Measure performance of an error handling operation
   */
  async measureOperation(operation, operationType, errorType = '') {
    const metrics = new ErrorHandlingMetrics();
    this.activeOperations.add(metrics);
    
    try {
      metrics.start(operationType, errorType);
      
      const result = await operation();
      
      metrics.end(true, result?.retryCount || 0);
      this.metrics.push(metrics);
      
      return result;
    } catch (error) {
      metrics.end(false, error?.retryCount || 0);
      this.metrics.push(metrics);
      
      throw error;
    } finally {
      this.activeOperations.delete(metrics);
    }
  }

  /**
   * Benchmark error handling performance
   */
  async runBenchmark(benchmarkName, operation, config = {}) {
    const benchmarkConfig = { ...this.config, ...config };
    const benchmarkMetrics = [];
    
    console.log(`[Performance Analyzer] Starting benchmark: ${benchmarkName}`);
    
    const startTime = performance.now();
    
    for (let i = 0; i < benchmarkConfig.iterations; i++) {
      try {
        const metrics = new ErrorHandlingMetrics();
        metrics.start(benchmarkName);
        
        await operation();
        
        metrics.end(true);
        benchmarkMetrics.push(metrics);
        
        // Check if we've exceeded max duration
        if (performance.now() - startTime > benchmarkConfig.maxDuration) {
          console.warn(`[Performance Analyzer] Benchmark ${benchmarkName} exceeded max duration`);
          break;
        }
      } catch (error) {
        const metrics = new ErrorHandlingMetrics();
        metrics.start(benchmarkName);
        metrics.end(false);
        benchmarkMetrics.push(metrics);
      }
    }
    
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    
    const benchmark = {
      name: benchmarkName,
      iterations: benchmarkMetrics.length,
      totalDuration,
      averageDuration: totalDuration / benchmarkMetrics.length,
      successRate: benchmarkMetrics.filter(m => m.success).length / benchmarkMetrics.length,
      averageMemoryDelta: benchmarkMetrics.reduce((sum, m) => sum + m.memoryDelta, 0) / benchmarkMetrics.length,
      metrics: benchmarkMetrics,
      timestamp: Date.now()
    };
    
    this.benchmarks.set(benchmarkName, benchmark);
    
    console.log(`[Performance Analyzer] Completed benchmark: ${benchmarkName}`);
    console.log(`  - Iterations: ${benchmark.iterations}`);
    console.log(`  - Average duration: ${benchmark.averageDuration.toFixed(2)}ms`);
    console.log(`  - Success rate: ${(benchmark.successRate * 100).toFixed(1)}%`);
    console.log(`  - Average memory delta: ${(benchmark.averageMemoryDelta / 1024).toFixed(2)}KB`);
    
    return benchmark;
  }

  /**
   * Run concurrent load test for error handling
   */
  async runLoadTest(operation, concurrency = 10, duration = 10000) {
    console.log(`[Performance Analyzer] Starting load test: ${concurrency} concurrent operations for ${duration}ms`);
    
    const startTime = Date.now();
    const loadTestMetrics = [];
    const activeOperations = [];
    
    // Start concurrent operations
    for (let i = 0; i < concurrency; i++) {
      const operationPromise = this.measureOperation(
        operation,
        'load_test',
        'concurrent'
      ).then(metrics => {
        loadTestMetrics.push(metrics.toJSON());
        return metrics;
      }).catch(error => {
        console.error('[Performance Analyzer] Load test operation failed:', error);
        return null;
      });
      
      activeOperations.push(operationPromise);
    }
    
    // Continue spawning operations until duration is reached
    const loadInterval = setInterval(() => {
      if (Date.now() - startTime > duration) {
        clearInterval(loadInterval);
        return;
      }
      
      // Replace completed operations
      for (let i = 0; i < activeOperations.length; i++) {
        if (activeOperations[i] === null || activeOperations[i].then(() => {}).catch(() => {})) {
          activeOperations[i] = this.measureOperation(
            operation,
            'load_test',
            'concurrent'
          ).then(metrics => {
            loadTestMetrics.push(metrics.toJSON());
            return metrics;
          }).catch(error => {
            console.error('[Performance Analyzer] Load test operation failed:', error);
            return null;
          });
        }
      }
    }, 100);
    
    // Wait for all operations to complete
    await Promise.allSettled(activeOperations);
    
    const endTime = Date.now();
    const actualDuration = endTime - startTime;
    
    const loadTestResults = {
      concurrency,
      duration: actualDuration,
      totalOperations: loadTestMetrics.length,
      successfulOperations: loadTestMetrics.filter(m => m.success).length,
      failedOperations: loadTestMetrics.filter(m => !m.success).length,
      averageDuration: loadTestMetrics.reduce((sum, m) => sum + m.duration, 0) / loadTestMetrics.length,
      maxDuration: Math.max(...loadTestMetrics.map(m => m.duration)),
      minDuration: Math.min(...loadTestMetrics.map(m => m.duration)),
      averageMemoryDelta: loadTestMetrics.reduce((sum, m) => sum + m.memoryDelta, 0) / loadTestMetrics.length,
      operationsPerSecond: (loadTestMetrics.length / actualDuration) * 1000,
      metrics: loadTestMetrics
    };
    
    console.log(`[Performance Analyzer] Load test completed:`);
    console.log(`  - Total operations: ${loadTestResults.totalOperations}`);
    console.log(`  - Success rate: ${((loadTestResults.successfulOperations / loadTestResults.totalOperations) * 100).toFixed(1)}%`);
    console.log(`  - Average duration: ${loadTestResults.averageDuration.toFixed(2)}ms`);
    console.log(`  - Operations per second: ${loadTestResults.operationsPerSecond.toFixed(1)}`);
    
    return loadTestResults;
  }

  /**
   * Analyze memory usage patterns during error handling
   */
  analyzeMemoryUsage() {
    if (this.memorySnapshots.length < 2) {
      return {
        trend: 'insufficient_data',
        averageMemory: 0,
        peakMemory: 0,
        memoryGrowthRate: 0
      };
    }
    
    const memoryValues = this.memorySnapshots.map(s => s.memory.used);
    const averageMemory = memoryValues.reduce((sum, val) => sum + val, 0) / memoryValues.length;
    const peakMemory = Math.max(...memoryValues);
    
    // Calculate memory growth rate
    const firstHalf = memoryValues.slice(0, Math.floor(memoryValues.length / 2));
    const secondHalf = memoryValues.slice(Math.floor(memoryValues.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const growthRate = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    let trend = 'stable';
    if (growthRate > 10) trend = 'increasing';
    else if (growthRate < -10) trend = 'decreasing';
    
    return {
      trend,
      averageMemory,
      peakMemory,
      memoryGrowthRate: growthRate,
      snapshots: this.memorySnapshots
    };
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const memoryAnalysis = this.analyzeMemoryUsage();
    const benchmarks = Array.from(this.benchmarks.values());
    
    // Analyze error handling performance
    const errorMetrics = this.metrics.filter(m => !m.success);
    const successMetrics = this.metrics.filter(m => m.success);
    
    const averageErrorHandlingTime = errorMetrics.length > 0
      ? errorMetrics.reduce((sum, m) => sum + m.duration, 0) / errorMetrics.length
      : 0;
    
    const averageSuccessTime = successMetrics.length > 0
      ? successMetrics.reduce((sum, m) => sum + m.duration, 0) / successMetrics.length
      : 0;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations({
      memoryAnalysis,
      benchmarks,
      errorMetrics,
      successMetrics,
      averageErrorHandlingTime,
      averageSuccessTime
    });
    
    return {
      summary: {
        totalOperations: this.metrics.length,
        successfulOperations: successMetrics.length,
        failedOperations: errorMetrics.length,
        successRate: this.metrics.length > 0 ? (successMetrics.length / this.metrics.length) * 100 : 0,
        averageErrorHandlingTime,
        averageSuccessTime,
        performanceImpact: averageErrorHandlingTime > 0 ? ((averageErrorHandlingTime - averageSuccessTime) / averageSuccessTime) * 100 : 0
      },
      memoryAnalysis,
      benchmarks,
      recommendations,
      timestamp: Date.now()
    };
  }

  /**
   * Generate performance optimization recommendations
   */
  generateRecommendations(data) {
    const recommendations = [];
    
    // Error handling performance recommendations
    if (data.averageErrorHandlingTime > 100) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        message: `Error handling takes ${data.averageErrorHandlingTime.toFixed(2)}ms on average. Consider optimizing error recovery logic.`,
        suggestion: 'Review error handling paths for bottlenecks and implement more efficient recovery mechanisms.'
      });
    }
    
    // Memory usage recommendations
    if (data.memoryAnalysis.trend === 'increasing' && data.memoryAnalysis.memoryGrowthRate > 20) {
      recommendations.push({
        category: 'memory',
        priority: 'high',
        message: `Memory usage is increasing by ${data.memoryAnalysis.memoryGrowthRate.toFixed(1)}%. Potential memory leak detected.`,
        suggestion: 'Check for unclosed resources, event listeners, or circular references in error handling code.'
      });
    }
    
    // Benchmark recommendations
    data.benchmarks.forEach(benchmark => {
      if (benchmark.successRate < 95) {
        recommendations.push({
          category: 'reliability',
          priority: 'medium',
          message: `Benchmark ${benchmark.name} has a success rate of ${(benchmark.successRate * 100).toFixed(1)}%`,
          suggestion: 'Investigate failure patterns and improve error handling robustness.'
        });
      }
      
      if (benchmark.averageDuration > 200) {
        recommendations.push({
          category: 'performance',
          priority: 'medium',
          message: `Benchmark ${benchmark.name} takes ${benchmark.averageDuration.toFixed(2)}ms on average`,
          suggestion: 'Consider optimizing the operation or implementing caching mechanisms.'
        });
      }
    });
    
    // Performance impact recommendations
    if (data.summary.performanceImpact > 50) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        message: `Error handling adds ${data.summary.performanceImpact.toFixed(1)}% overhead to normal operations`,
        suggestion: 'Optimize error handling to minimize performance impact on successful operations.'
      });
    }
    
    return recommendations;
  }

  /**
   * Export performance data for analysis
   */
  exportData() {
    return {
      metrics: this.metrics.map(m => m.toJSON()),
      benchmarks: Array.from(this.benchmarks.entries()),
      memorySnapshots: this.memorySnapshots,
      report: this.generateReport()
    };
  }

  /**
   * Clear all collected data
   */
  clearData() {
    this.metrics = [];
    this.benchmarks.clear();
    this.memorySnapshots = [];
    this.activeOperations.clear();
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a performance analyzer instance
 */
export function createPerformanceAnalyzer() {
  return new ErrorHandlingPerformanceAnalyzer();
}

/**
 * Measure performance of a SmartFactoryService error scenario
 */
export async function measureSmartFactoryError(service, errorType, operation) {
  const analyzer = createPerformanceAnalyzer();
  
  return await analyzer.measureOperation(
    async () => {
      switch (errorType) {
        case 'agent_error':
          const agent = await service.createAgent('dreamer');
          service.simulateAgentError(agent.id, 'Performance test error');
          return await service.getAgentStatus(agent.id);
          
        case 'recovery':
          const recoveryAgent = await service.createAgent('analyst');
          service.simulateAgentError(recoveryAgent.id, 'Recovery test error');
          service.recoverAgent(recoveryAgent.id);
          return await service.getAgentStatus(recoveryAgent.id);
          
        case 'metrics':
          return await service.fetchFactoryMetrics();
          
        default:
          return await operation();
      }
    },
    `smart_factory_${errorType}`,
    errorType
  );
}

/**
 * Measure React Query error handling performance
 */
export async function measureReactQueryError(queryClient, queryKey, errorType) {
  const analyzer = createPerformanceAnalyzer();
  
  return await analyzer.measureOperation(
    async () => {
      try {
        // Simulate different error types
        switch (errorType) {
          case 'network':
            return await queryClient.fetchQuery(queryKey, () => 
              Promise.reject(new Error('Network error simulation'))
            );
            
          case 'timeout':
            return await queryClient.fetchQuery(queryKey, () => 
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout error')), 100)
              )
            );
            
          case 'validation':
            return await queryClient.fetchQuery(queryKey, () => 
              Promise.reject(new Error('Validation error simulation'))
            );
            
          default:
            throw new Error('Unknown error type');
        }
      } catch (error) {
        // Error is expected for performance measurement
        return { error: error.message, type: errorType };
      }
    },
    `react_query_${errorType}`,
    errorType
  );
}

export default ErrorHandlingPerformanceAnalyzer;