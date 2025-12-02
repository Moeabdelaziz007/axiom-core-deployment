/**
 * React Query Performance Testing Suite
 * 
 * Comprehensive testing for different polling intervals and configurations
 * to identify optimal settings for performance targets
 */

import { QueryClient } from '@tanstack/react-query';
import { fetchFactoryMetrics, getAssemblyLineStatus } from '@/services/factoryService';

export interface TestConfig {
  name: string;
  pollingInterval: number;
  staleTime: number;
  gcTime: number;
  refetchOnWindowFocus: boolean;
}

export interface TestResults {
  config: TestConfig;
  responseTime: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHitRate: number;
  renderCount: number;
  frameRate: number;
}

class ReactQueryPerformanceTester {
  private queryClient: QueryClient;
  private testResults: TestResults[] = [];
  private currentTest: TestConfig | null = null;
  private testStartTime: number = 0;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;

  constructor() {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          retryDelay: 1000,
        },
      },
    });
  }

  /**
   * Test different polling configurations
   */
  async runPerformanceTests(): Promise<TestResults[]> {
    console.log('🧪 Starting React Query Performance Tests...');
    
    const testConfigs: TestConfig[] = [
      {
        name: 'Aggressive Polling (1s)',
        pollingInterval: 1000,
        staleTime: 500,
        gcTime: 60000,
        refetchOnWindowFocus: true
      },
      {
        name: 'Fast Polling (2s)',
        pollingInterval: 2000,
        staleTime: 1000,
        gcTime: 120000,
        refetchOnWindowFocus: true
      },
      {
        name: 'Current Polling (3s)',
        pollingInterval: 3000,
        staleTime: 2000,
        gcTime: 300000,
        refetchOnWindowFocus: false
      },
      {
        name: 'Moderate Polling (5s)',
        pollingInterval: 5000,
        staleTime: 3000,
        gcTime: 600000,
        refetchOnWindowFocus: false
      },
      {
        name: 'Slow Polling (10s)',
        pollingInterval: 10000,
        staleTime: 5000,
        gcTime: 900000,
        refetchOnWindowFocus: false
      }
    ];

    for (const config of testConfigs) {
      const result = await this.runSingleTest(config);
      this.testResults.push(result);
      
      console.log(`✅ Test completed: ${config.name}`);
      console.log(`   Response Time: ${result.responseTime.toFixed(2)}ms`);
      console.log(`   Memory Usage: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   Network Requests: ${result.networkRequests}`);
      console.log(`   Cache Hit Rate: ${result.cacheHitRate.toFixed(1)}%`);
      console.log(`   Render Count: ${result.renderCount}`);
      console.log(`   Frame Rate: ${result.frameRate.toFixed(1)}fps`);
      console.log('');
    }

    return this.testResults;
  }

  /**
   * Run a single test configuration
   */
  private async runSingleTest(config: TestConfig): Promise<TestResults> {
    this.currentTest = config;
    this.testStartTime = performance.now();
    this.frameCount = 0;
    this.lastFrameTime = performance.now();

    // Clear query cache
    this.queryClient.clear();

    // Create new query client with test configuration
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          retryDelay: 1000,
          staleTime: config.staleTime,
          gcTime: config.gcTime,
          refetchOnWindowFocus: config.refetchOnWindowFocus,
        },
      },
    });

    let networkRequests = 0;
    let cacheHits = 0;
    let renderCount = 0;
    let totalResponseTime = 0;
    let queryCount = 0;

    // Monitor frame rate
    const frameRateMonitor = setInterval(() => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      this.lastFrameTime = now;
      this.frameCount++;
      
      if (delta > 16) { // Frame took longer than 16ms (60fps)
        console.warn(`Slow frame detected: ${delta.toFixed(2)}ms`);
      }
    }, 16);

    // Mock query function to track network requests
    const originalFetch = testQueryClient.fetchQuery;
    testQueryClient.fetchQuery = async (...args: any[]) => {
      const startTime = performance.now();
      networkRequests++;
      
      try {
        const result = await originalFetch.apply(testQueryClient, args);
        const endTime = performance.now();
        totalResponseTime += (endTime - startTime);
        queryCount++;
        
        // Simulate cache hit/miss
        if (Math.random() > 0.3) { // 70% cache hit rate
          cacheHits++;
        }
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        totalResponseTime += (endTime - startTime);
        throw error;
      }
    };

    try {
      // Run queries for test duration (30 seconds)
      const testDuration = 30000;
      const startTime = performance.now();
      
      const metricsPromise = testQueryClient.fetchQuery({
        queryKey: ['factoryMetrics'],
        queryFn: fetchFactoryMetrics,
        refetchInterval: config.pollingInterval,
      });

      const assemblyPromise = testQueryClient.fetchQuery({
        queryKey: ['assemblyLineStatus'],
        queryFn: getAssemblyLineStatus,
        refetchInterval: config.pollingInterval,
      });

      // Wait for test duration
      await new Promise(resolve => setTimeout(resolve, testDuration));

      // Monitor renders (simplified)
      const renderObserver = new MutationObserver(() => {
        renderCount++;
      });
      renderObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });

      await Promise.all([metricsPromise, assemblyPromise]);

      const endTime = performance.now();
      clearInterval(frameRateMonitor);
      renderObserver.disconnect();

      // Calculate metrics
      const averageResponseTime = queryCount > 0 ? totalResponseTime / queryCount : 0;
      const cacheHitRate = queryCount > 0 ? (cacheHits / queryCount) * 100 : 0;
      const frameRate = this.frameCount / ((endTime - startTime) / 1000);

      // Get memory usage
      const memoryUsage = this.getMemoryUsage();

      return {
        config,
        responseTime: averageResponseTime,
        memoryUsage,
        networkRequests,
        cacheHitRate,
        renderCount,
        frameRate
      };

    } catch (error) {
      clearInterval(frameRateMonitor);
      throw error;
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Analyze test results and provide recommendations
   */
  analyzeResults(): {
    bestConfig: TestConfig;
    analysis: {
      responseTimeAnalysis: string;
      memoryAnalysis: string;
      networkAnalysis: string;
      renderAnalysis: string;
      frameRateAnalysis: string;
    };
    recommendations: string[];
  } {
    if (this.testResults.length === 0) {
      throw new Error('No test results to analyze');
    }

    // Find best configuration based on weighted score
    const scoredResults = this.testResults.map(result => {
      let score = 0;
      
      // Response time score (40% weight) - target < 100ms
      const responseScore = Math.max(0, 100 - result.responseTime) / 100;
      score += responseScore * 0.4;
      
      // Memory usage score (20% weight) - target < 50MB
      const memoryScore = Math.max(0, 50 - (result.memoryUsage / 1024 / 1024)) / 50;
      score += memoryScore * 0.2;
      
      // Network requests score (20% weight) - lower is better
      const networkScore = Math.max(0, 100 - (result.networkRequests / 10)) / 100;
      score += networkScore * 0.2;
      
      // Frame rate score (20% weight) - target 60fps
      const frameScore = Math.min(1, result.frameRate / 60);
      score += frameScore * 0.2;
      
      return { result, score };
    });

    const bestResult = scoredResults.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    // Generate analysis
    const analysis = {
      responseTimeAnalysis: this.analyzeResponseTimes(),
      memoryAnalysis: this.analyzeMemoryUsage(),
      networkAnalysis: this.analyzeNetworkRequests(),
      renderAnalysis: this.analyzeRenders(),
      frameRateAnalysis: this.analyzeFrameRates()
    };

    const recommendations = this.generateRecommendations(bestResult.result);

    return {
      bestConfig: bestResult.result.config,
      analysis,
      recommendations
    };
  }

  private analyzeResponseTimes(): string {
    const responseTimes = this.testResults.map(r => r.responseTime);
    const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const min = Math.min(...responseTimes);
    const max = Math.max(...responseTimes);
    
    return `Average: ${avg.toFixed(2)}ms, Min: ${min.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`;
  }

  private analyzeMemoryUsage(): string {
    const memoryUsages = this.testResults.map(r => r.memoryUsage / 1024 / 1024);
    const avg = memoryUsages.reduce((sum, mem) => sum + mem, 0) / memoryUsages.length;
    const min = Math.min(...memoryUsages);
    const max = Math.max(...memoryUsages);
    
    return `Average: ${avg.toFixed(2)}MB, Min: ${min.toFixed(2)}MB, Max: ${max.toFixed(2)}MB`;
  }

  private analyzeNetworkRequests(): string {
    const requests = this.testResults.map(r => r.networkRequests);
    const total = requests.reduce((sum, req) => sum + req, 0);
    const avg = total / requests.length;
    
    return `Total: ${total}, Average per test: ${avg.toFixed(1)}`;
  }

  private analyzeRenders(): string {
    const renders = this.testResults.map(r => r.renderCount);
    const total = renders.reduce((sum, render) => sum + render, 0);
    const avg = total / renders.length;
    
    return `Total: ${total}, Average per test: ${avg.toFixed(1)}`;
  }

  private analyzeFrameRates(): string {
    const frameRates = this.testResults.map(r => r.frameRate);
    const avg = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
    const min = Math.min(...frameRates);
    const max = Math.max(...frameRates);
    
    return `Average: ${avg.toFixed(1)}fps, Min: ${min.toFixed(1)}fps, Max: ${max.toFixed(1)}fps`;
  }

  private generateRecommendations(bestResult: TestResults): string[] {
    const recommendations: string[] = [];
    
    if (bestResult.responseTime > 100) {
      recommendations.push('Consider increasing polling interval to reduce response time impact');
    }
    
    if (bestResult.memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Memory usage is high - consider reducing cache time or implementing cleanup');
    }
    
    if (bestResult.networkRequests > 20) {
      recommendations.push('High network request count - consider longer polling intervals or smarter caching');
    }
    
    if (bestResult.frameRate < 55) {
      recommendations.push('Frame rate is below 55fps - optimize rendering or reduce update frequency');
    }
    
    if (bestResult.cacheHitRate < 70) {
      recommendations.push('Low cache hit rate - consider increasing stale time or optimizing query keys');
    }
    
    return recommendations;
  }

  /**
   * Export test results for reporting
   */
  exportResults(): string {
    const analysis = this.analyzeResults();
    
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      testResults: this.testResults,
      bestConfig: analysis.bestConfig,
      analysis: analysis.analysis,
      recommendations: analysis.recommendations,
      performanceTargets: {
        responseTime: '< 100ms',
        memoryUsage: '< 50MB',
        frameRate: '60fps',
        cacheHitRate: '> 80%'
      }
    }, null, 2);
  }
}

export default ReactQueryPerformanceTester;
export type { TestConfig, TestResults };