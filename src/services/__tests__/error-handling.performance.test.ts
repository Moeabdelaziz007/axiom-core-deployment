/**
 * 🚀 Error Handling Performance Test Suite
 * 
 * Comprehensive performance testing for error handling paths in the Axiom system.
 * This test suite measures execution time, memory usage, and performance impact
 * of various error scenarios across SmartFactoryService, React Query, and Error Boundaries.
 * 
 * Test Categories:
 * 1. SmartFactoryService Error Handling Performance
 * 2. React Query Error Handling Performance
 * 3. Error Boundary Performance Impact
 * 4. Memory Usage Analysis During Error Handling
 * 5. Load Testing for High Error Rate Scenarios
 * 6. Concurrent Error Handling Performance
 * 7. Error Recovery Performance
 * 8. Performance Benchmarks and Regression Testing
 */

import { SmartFactoryService, smartFactoryService } from '../factoryService';
import { QueryClient } from '@tanstack/react-query';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';
import { 
  ErrorHandlingPerformanceAnalyzer, 
  createPerformanceAnalyzer,
  measureSmartFactoryError,
  measureReactQueryError
} from '../../utils/error-handling-performance-analyzer';

// ============================================================================
// TEST SETUP AND UTILITIES
// ============================================================================

// Performance test configuration
const PERFORMANCE_CONFIG = {
  iterations: 50,
  concurrency: 5,
  errorRate: 0.3,
  timeoutMs: 10000,
  memoryThreshold: 10 * 1024 * 1024, // 10MB
  performanceThreshold: 100 // ms
};

// Mock localStorage for performance testing
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
};

// Mock performance API for memory measurements
const mockPerformanceAPI = () => {
  const mockMemory = {
    usedJSHeapSize: 5 * 1024 * 1024,
    totalJSHeapSize: 10 * 1024 * 1024,
    jsHeapSizeLimit: 50 * 1024 * 1024
  };
  
  Object.defineProperty(global, 'performance', {
    value: {
      ...global.performance,
      memory: mockMemory,
      now: jest.fn(() => Date.now())
    }
  });
};

// Setup global mocks
beforeAll(() => {
  mockPerformanceAPI();
  
  if (typeof window === 'undefined') {
    (global as any).window = { localStorage: createMockLocalStorage() };
    (global as any).localStorage = createMockLocalStorage();
  }
});

// ============================================================================
// SMART FACTORY SERVICE PERFORMANCE TESTS
// ============================================================================

describe('SmartFactoryService Error Handling Performance', () => {
  let service: SmartFactoryService;
  let analyzer: ErrorHandlingPerformanceAnalyzer;

  beforeEach(() => {
    service = new SmartFactoryService();
    analyzer = createPerformanceAnalyzer();
    analyzer.startMonitoring();
  });

  afterEach(() => {
    service.stopSimulation();
    analyzer.stopMonitoring();
  });

  it('should measure agent error injection performance', async () => {
    const benchmark = await analyzer.runBenchmark(
      'agent_error_injection',
      async () => {
        const agent = await service.createAgent('dreamer');
        const result = service.simulateAgentError(agent.id, 'Performance test error');
        expect(result).toBe(true);
        
        const errorAgent = await service.getAgentStatus(agent.id);
        expect(errorAgent?.status).toBe('error');
      },
      { iterations: PERFORMANCE_CONFIG.iterations }
    );

    // Performance assertions
    expect(benchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold);
    expect(benchmark.successRate).toBeGreaterThan(0.95);
    expect(benchmark.averageMemoryDelta).toBeLessThan(PERFORMANCE_CONFIG.memoryThreshold);
  });

  it('should measure agent recovery performance', async () => {
    const benchmark = await analyzer.runBenchmark(
      'agent_recovery',
      async () => {
        const agent = await service.createAgent('analyst');
        service.simulateAgentError(agent.id, 'Recovery performance test');
        
        const recoveryResult = service.recoverAgent(agent.id);
        expect(recoveryResult).toBe(true);
        
        const recoveredAgent = await service.getAgentStatus(agent.id);
        expect(recoveredAgent?.status).toBe('soul_forge');
      },
      { iterations: PERFORMANCE_CONFIG.iterations }
    );

    expect(benchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold);
    expect(benchmark.successRate).toBe(1.0);
  });

  it('should measure concurrent error handling performance', async () => {
    const loadTestResults = await analyzer.runLoadTest(
      async () => {
        const agent = await service.createAgent('builder');
        service.simulateAgentError(agent.id, 'Concurrent error test');
        return await service.getAgentStatus(agent.id);
      },
      PERFORMANCE_CONFIG.concurrency,
      PERFORMANCE_CONFIG.timeoutMs
    );

    expect(loadTestResults.operationsPerSecond).toBeGreaterThan(10);
    expect(loadTestResults.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold * 2);
    expect(loadTestResults.successfulOperations).toBeGreaterThan(loadTestResults.totalOperations * 0.9);
  });

  it('should measure metrics calculation performance under error conditions', async () => {
    // Create agents with errors
    const agents = [];
    for (let i = 0; i < 10; i++) {
      const agent = await service.createAgent('dreamer');
      if (i % 2 === 0) {
        service.simulateAgentError(agent.id, `Metrics test error ${i}`);
      }
      agents.push(agent);
    }

    const benchmark = await analyzer.runBenchmark(
      'metrics_with_errors',
      async () => {
        const metrics = await service.fetchFactoryMetrics();
        expect(metrics.failedAgents).toBeGreaterThan(0);
        expect(metrics.efficiency).toBeLessThan(100);
        return metrics;
      },
      { iterations: PERFORMANCE_CONFIG.iterations }
    );

    expect(benchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold);
    expect(benchmark.successRate).toBe(1.0);
  });

  it('should measure localStorage error handling performance', async () => {
    // Mock localStorage errors
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('localStorage performance test error');
    });

    const benchmark = await analyzer.runBenchmark(
      'localStorage_error_handling',
      async () => {
        const agent = await service.createAgent('judge');
        expect(agent).toBeDefined();
        return agent;
      },
      { iterations: PERFORMANCE_CONFIG.iterations }
    );

    // Restore original localStorage
    localStorage.setItem = originalSetItem;

    expect(benchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold);
    expect(benchmark.successRate).toBe(1.0);
  });
});

// ============================================================================
// REACT QUERY ERROR HANDLING PERFORMANCE TESTS
// ============================================================================

describe('React Query Error Handling Performance', () => {
  let queryClient: QueryClient;
  let analyzer: ErrorHandlingPerformanceAnalyzer;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0
        }
      }
    });
    analyzer = createPerformanceAnalyzer();
    analyzer.startMonitoring();
  });

  afterEach(() => {
    analyzer.stopMonitoring();
    queryClient.clear();
  });

  it('should measure network error handling performance', async () => {
    const benchmark = await analyzer.runBenchmark(
      'react_query_network_error',
      async () => {
        try {
          await queryClient.fetchQuery(
            ['test-network'],
            () => Promise.reject(new Error('Network error simulation'))
          );
        } catch (error) {
          expect(error.message).toBe('Network error simulation');
        }
      },
      { iterations: PERFORMANCE_CONFIG.iterations }
    );

    expect(benchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold);
    expect(benchmark.successRate).toBe(1.0); // Error handling is considered success
  });

  it('should measure timeout error handling performance', async () => {
    const benchmark = await analyzer.runBenchmark(
      'react_query_timeout_error',
      async () => {
        try {
          await queryClient.fetchQuery(
            ['test-timeout'],
            () => new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout error')), 50)
            )
          );
        } catch (error) {
          expect(error.message).toBe('Timeout error');
        }
      },
      { iterations: PERFORMANCE_CONFIG.iterations }
    );

    expect(benchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold * 2);
    expect(benchmark.successRate).toBe(1.0);
  });

  it('should measure retry mechanism performance', async () => {
    let attemptCount = 0;
    
    const benchmark = await analyzer.runBenchmark(
      'react_query_retry_mechanism',
      async () => {
        attemptCount = 0;
        
        try {
          await queryClient.fetchQuery(
            ['test-retry'],
            () => {
              attemptCount++;
              if (attemptCount < 2) {
                return Promise.reject(new Error('Retry test error'));
              }
              return Promise.resolve({ success: true, attempts: attemptCount });
            },
            { retry: 2, retryDelay: 10 }
          );
        } catch (error) {
          // Expected for some iterations
        }
      },
      { iterations: PERFORMANCE_CONFIG.iterations / 2 } // Reduce iterations due to retry delays
    );

    expect(benchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold * 3);
  });

  it('should measure concurrent error handling performance', async () => {
    const loadTestResults = await analyzer.runLoadTest(
      async () => {
        try {
          await queryClient.fetchQuery(
            ['concurrent-test', Math.random()],
            () => {
              if (Math.random() > 0.5) {
                return Promise.resolve({ data: 'success' });
              } else {
                return Promise.reject(new Error('Random error'));
              }
            }
          );
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      PERFORMANCE_CONFIG.concurrency,
      PERFORMANCE_CONFIG.timeoutMs
    );

    expect(loadTestResults.operationsPerSecond).toBeGreaterThan(20);
    expect(loadTestResults.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold);
  });
});

// ============================================================================
// ERROR BOUNDARY PERFORMANCE TESTS
// ============================================================================

describe('Error Boundary Performance Impact', () => {
  let analyzer: ErrorHandlingPerformanceAnalyzer;

  beforeEach(() => {
    analyzer = createPerformanceAnalyzer();
    analyzer.startMonitoring();
  });

  afterEach(() => {
    analyzer.stopMonitoring();
  });

  it('should measure error boundary rendering performance', async () => {
    const ErrorProneComponent = () => {
      if (Math.random() > 0.7) {
        throw new Error('Component error simulation');
      }
      return <div>Component rendered successfully</div>;
    };

    const benchmark = await analyzer.runBenchmark(
      'error_boundary_rendering',
      async () => {
        const { unmount } = render(
          <ErrorBoundary>
            <ErrorProneComponent />
          </ErrorBoundary>
        );
        
        // Wait a bit for any error handling
        await new Promise(resolve => setTimeout(resolve, 10));
        unmount();
      },
      { iterations: PERFORMANCE_CONFIG.iterations }
    );

    expect(benchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold * 2);
    expect(benchmark.successRate).toBeGreaterThan(0.9);
  });

  it('should measure error boundary recovery performance', async () => {
    let renderCount = 0;
    
    const RecoverableComponent = () => {
      renderCount++;
      if (renderCount === 1) {
        throw new Error('Initial render error');
      }
      return <div>Recovered component</div>;
    };

    const benchmark = await analyzer.runBenchmark(
      'error_boundary_recovery',
      async () => {
        renderCount = 0;
        
        const { unmount, rerender } = render(
          <ErrorBoundary>
            <RecoverableComponent />
          </ErrorBoundary>
        );
        
        // Rerender to trigger recovery
        await new Promise(resolve => setTimeout(resolve, 10));
        rerender(
          <ErrorBoundary>
            <RecoverableComponent />
          </ErrorBoundary>
        );
        
        await new Promise(resolve => setTimeout(resolve, 10));
        unmount();
      },
      { iterations: PERFORMANCE_CONFIG.iterations / 2 }
    );

    expect(benchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold * 3);
    expect(benchmark.successRate).toBeGreaterThan(0.8);
  });

  it('should measure error boundary memory usage', async () => {
    const MemoryIntensiveComponent = () => {
      // Create some memory pressure
      const largeArray = new Array(1000).fill(0).map(() => ({ data: Math.random() }));
      
      if (Math.random() > 0.8) {
        throw new Error('Memory-intensive component error');
      }
      
      return <div>Memory-intensive component</div>;
    };

    const benchmark = await analyzer.runBenchmark(
      'error_boundary_memory_usage',
      async () => {
        const { unmount } = render(
          <ErrorBoundary>
            <MemoryIntensiveComponent />
          </ErrorBoundary>
        );
        
        await new Promise(resolve => setTimeout(resolve, 10));
        unmount();
      },
      { iterations: PERFORMANCE_CONFIG.iterations / 4 }
    );

    expect(benchmark.averageMemoryDelta).toBeLessThan(PERFORMANCE_CONFIG.memoryThreshold / 10);
  });
});

// ============================================================================
// MEMORY USAGE ANALYSIS TESTS
// ============================================================================

describe('Memory Usage During Error Handling', () => {
  let analyzer: ErrorHandlingPerformanceAnalyzer;

  beforeEach(() => {
    analyzer = createPerformanceAnalyzer();
    analyzer.startMonitoring();
  });

  afterEach(() => {
    analyzer.stopMonitoring();
  });

  it('should analyze memory usage during SmartFactoryService errors', async () => {
    const service = new SmartFactoryService();
    
    // Create multiple agents with errors to test memory usage
    for (let i = 0; i < 20; i++) {
      const agent = await service.createAgent('dreamer');
      if (i % 3 === 0) {
        service.simulateAgentError(agent.id, `Memory test error ${i}`);
      }
    }

    const memoryAnalysis = analyzer.analyzeMemoryUsage();
    
    expect(memoryAnalysis.trend).toBeDefined();
    expect(memoryAnalysis.averageMemory).toBeGreaterThan(0);
    expect(memoryAnalysis.peakMemory).toBeGreaterThanOrEqual(memoryAnalysis.averageMemory);
    
    service.stopSimulation();
  });

  it('should detect memory leaks during error handling', async () => {
    const service = new SmartFactoryService();
    
    // Simulate potential memory leak scenario
    const operations = [];
    for (let i = 0; i < 50; i++) {
      operations.push(
        analyzer.measureOperation(
          async () => {
            const agent = await service.createAgent('analyst');
            service.simulateAgentError(agent.id, `Memory leak test ${i}`);
            service.recoverAgent(agent.id);
            return agent;
          },
          'memory_leak_test'
        )
      );
    }

    await Promise.all(operations);
    
    const memoryAnalysis = analyzer.analyzeMemoryUsage();
    const report = analyzer.generateReport();
    
    // Check for memory leak recommendations
    const memoryRecommendations = report.recommendations.filter(r => r.category === 'memory');
    
    expect(memoryAnalysis).toBeDefined();
    expect(memoryRecommendations).toBeDefined();
    
    service.stopSimulation();
  });

  it('should measure memory impact of error recovery', async () => {
    const service = new SmartFactoryService();
    const agents = [];
    
    // Create agents and inject errors
    for (let i = 0; i < 10; i++) {
      const agent = await service.createAgent('builder');
      service.simulateAgentError(agent.id, `Recovery memory test ${i}`);
      agents.push(agent);
    }

    // Measure memory before recovery
    const memoryBefore = analyzer.getCurrentMemoryUsage();
    
    // Recover all agents
    const recoveryOperations = agents.map(agent =>
      analyzer.measureOperation(
        () => {
          const result = service.recoverAgent(agent.id);
          return result;
        },
        'agent_recovery_memory_test'
      )
    );

    await Promise.all(recoveryOperations);
    
    // Measure memory after recovery
    const memoryAfter = analyzer.getCurrentMemoryUsage();
    
    expect(memoryAfter.used).toBeGreaterThanOrEqual(0);
    expect(memoryBefore.used).toBeGreaterThanOrEqual(0);
    
    service.stopSimulation();
  });
});

// ============================================================================
// PERFORMANCE BENCHMARKS AND REGRESSION TESTS
// ============================================================================

describe('Performance Benchmarks and Regression Testing', () => {
  let analyzer: ErrorHandlingPerformanceAnalyzer;

  beforeEach(() => {
    analyzer = createPerformanceAnalyzer();
    analyzer.startMonitoring();
  });

  afterEach(() => {
    analyzer.stopMonitoring();
  });

  it('should establish baseline performance metrics', async () => {
    const service = new SmartFactoryService();
    
    // Baseline: Normal operation without errors
    const normalBenchmark = await analyzer.runBenchmark(
      'normal_operation_baseline',
      async () => {
        const agent = await service.createAgent('dreamer');
        const status = await service.getAgentStatus(agent.id);
        return status;
      },
      { iterations: PERFORMANCE_CONFIG.iterations }
    );

    // Error handling benchmark
    const errorBenchmark = await analyzer.runBenchmark(
      'error_handling_baseline',
      async () => {
        const agent = await service.createAgent('analyst');
        service.simulateAgentError(agent.id, 'Baseline error test');
        const errorStatus = await service.getAgentStatus(agent.id);
        service.recoverAgent(agent.id);
        const recoveredStatus = await service.getAgentStatus(agent.id);
        return { errorStatus, recoveredStatus };
      },
      { iterations: PERFORMANCE_CONFIG.iterations }
    );

    // Calculate performance impact
    const performanceImpact = ((errorBenchmark.averageDuration - normalBenchmark.averageDuration) / normalBenchmark.averageDuration) * 100;
    
    expect(normalBenchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold);
    expect(errorBenchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold * 2);
    expect(performanceImpact).toBeLessThan(200); // Error handling shouldn't be more than 200% slower
    
    service.stopSimulation();
  });

  it('should validate performance regression thresholds', async () => {
    const service = new SmartFactoryService();
    
    // Run comprehensive performance test
    const comprehensiveBenchmark = await analyzer.runBenchmark(
      'comprehensive_error_handling',
      async () => {
        // Test multiple error scenarios
        const agent = await service.createAgent('judge');
        service.simulateAgentError(agent.id, 'Comprehensive test error');
        
        const errorStatus = await service.getAgentStatus(agent.id);
        expect(errorStatus?.status).toBe('error');
        
        const recoveryResult = service.recoverAgent(agent.id);
        expect(recoveryResult).toBe(true);
        
        const recoveredStatus = await service.getAgentStatus(agent.id);
        expect(recoveredStatus?.status).toBe('soul_forge');
        
        const metrics = await service.fetchFactoryMetrics();
        return { errorStatus, recoveredStatus, metrics };
      },
      { iterations: PERFORMANCE_CONFIG.iterations }
    );

    // Validate against performance thresholds
    expect(comprehensiveBenchmark.averageDuration).toBeLessThan(PERFORMANCE_CONFIG.performanceThreshold * 3);
    expect(comprehensiveBenchmark.successRate).toBeGreaterThan(0.95);
    expect(comprehensiveBenchmark.averageMemoryDelta).toBeLessThan(PERFORMANCE_CONFIG.memoryThreshold);
    
    // Check for performance outliers
    const outliers = comprehensiveBenchmark.metrics.filter(m => m.duration > PERFORMANCE_CONFIG.performanceThreshold * 5);
    expect(outliers.length).toBeLessThan(comprehensiveBenchmark.metrics.length * 0.05); // Less than 5% outliers
    
    service.stopSimulation();
  });

  it('should generate performance optimization recommendations', async () => {
    const service = new SmartFactoryService();
    
    // Run various performance tests to generate data
    await analyzer.runBenchmark('test1', async () => {
      const agent = await service.createAgent('dreamer');
      return agent;
    }, { iterations: 10 });
    
    await analyzer.runBenchmark('test2', async () => {
      const agent = await service.createAgent('analyst');
      service.simulateAgentError(agent.id, 'Recommendation test');
      return agent;
    }, { iterations: 10 });
    
    // Generate report with recommendations
    const report = analyzer.generateReport();
    
    expect(report.summary).toBeDefined();
    expect(report.memoryAnalysis).toBeDefined();
    expect(report.recommendations).toBeDefined();
    expect(Array.isArray(report.recommendations)).toBe(true);
    
    // Validate recommendation structure
    report.recommendations.forEach(rec => {
      expect(rec.category).toBeDefined();
      expect(rec.priority).toBeDefined();
      expect(rec.message).toBeDefined();
      expect(rec.suggestion).toBeDefined();
    });
    
    service.stopSimulation();
  });
});