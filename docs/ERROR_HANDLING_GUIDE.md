# Error Handling Guide

## Overview

This comprehensive guide documents the error handling architecture and implementation across the Axiom system. It covers error detection, handling mechanisms, recovery strategies, and monitoring capabilities that ensure system resilience and user experience continuity.

## Table of Contents

- [Error Handling Architecture](#error-handling-architecture)
- [Error Types and Classification](#error-types-and-classification)
- [Error Detection Mechanisms](#error-detection-mechanisms)
- [Error Handling Strategies](#error-handling-strategies)
- [Error Recovery Processes](#error-recovery-processes)
- [Error Monitoring and Logging](#error-monitoring-and-logging)
- [User Experience Considerations](#user-experience-considerations)
- [Implementation Examples](#implementation-examples)

## Error Handling Architecture

The Axiom system implements a multi-layered error handling architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer                              │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ Error Boundary │  │ React Query Error Handling     │ │
│  │   Component    │  │ (Network, Timeout, Retry)      │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer                           │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │SmartFactory    │  │ Error Recovery &              │ │
│  │Service Errors   │  │ Monitoring System             │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │localStorage     │  │ Network Failure Simulation      │ │
│  │Error Handling   │  │ & Recovery                    │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

1. **Error Boundary Component** ([`ErrorBoundary.tsx`](src/components/ErrorBoundary.tsx:1))
   - Catches React component errors
   - Provides type-specific fallback UI
   - Implements retry mechanisms
   - Logs errors for monitoring

2. **SmartFactoryService Error Handling** ([`factoryService.ts`](src/services/factoryService.ts:1))
   - Agent error injection and recovery
   - Metrics calculation with error states
   - Concurrent operation failure handling
   - Memory and resource management

3. **React Query Error Handling** ([`react-query.error-handling.test.ts`](src/services/__tests__/react-query.error-handling.test.ts:1))
   - Network failure simulation
   - Exponential backoff retry logic
   - Graceful degradation patterns
   - Service unavailability handling

4. **Performance Monitoring** ([`error-handling-performance-analyzer.js`](src/utils/error-handling-performance-analyzer.js:1))
   - Error handling performance metrics
   - Memory usage analysis
   - Benchmarking and optimization recommendations

## Error Types and Classification

### Network Errors
- **Connection Failures**: Unable to reach the service
- **Timeout Errors**: Requests exceeding time limits
- **HTTP Error Responses**: 4xx and 5xx status codes
- **Intermittent Failures**: Partial or temporary network issues

### Service Errors
- **Factory Service Errors**: SmartFactoryService failures
- **Agent Creation Errors**: Agent assembly failures
- **Validation Errors**: Invalid data or parameters
- **Resource Exhaustion**: Memory or processing limits

### Application Errors
- **Component Errors**: React component rendering failures
- **State Management Errors**: Inconsistent application state
- **Data Corruption**: Invalid or corrupted data structures
- **Concurrency Errors**: Race conditions and conflicts

### System Errors
- **localStorage Failures**: Storage quota exceeded or corruption
- **Memory Leaks**: Unreleased resources
- **Performance Degradation**: Slow response times
- **Resource Conflicts**: Competing resource access

## Error Detection Mechanisms

### Automatic Error Detection

1. **React Error Boundaries**
   ```typescript
   // Automatic detection of component rendering errors
   static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
     return {
       hasError: true,
       error,
       errorType: detectErrorType(error),
       errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
     };
   }
   ```

2. **Service Health Monitoring**
   ```typescript
   // Continuous monitoring of service health
   async fetchFactoryMetrics(): Promise<FactoryMetrics> {
     try {
       // Service operation with error detection
     } catch (error) {
       this.handleServiceError(error);
       throw error;
     }
   }
   ```

3. **Network Failure Detection**
   ```typescript
   // Network failure simulation and detection
   class NetworkFailureSimulator {
     private async mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
       // Detect and simulate network failures
       const shouldFail = scenario.failureRate === 1 || Math.random() < (scenario.failureRate || 0);
       if (shouldFail) {
         // Handle different failure types
       }
     }
   }
   ```

### Manual Error Injection

For testing and resilience verification:

```typescript
// Agent error injection for testing
simulateAgentError(agentId: string, errorMessage: string): boolean {
  const agent = this.agents.get(agentId);
  if (!agent) return false;
  
  agent.status = 'error';
  agent.error = errorMessage;
  agent.completedAt = Date.now();
  
  return true;
}
```

## Error Handling Strategies

### 1. Graceful Degradation

When errors occur, the system degrades gracefully rather than failing completely:

```typescript
// Fallback data structure for failed queries
const fallbackMetrics: FactoryMetrics = {
  totalAgentsCreated: 0,
  activeAgents: 0,
  completedAgents: 0,
  failedAgents: 0,
  averageProductionTime: 0,
  currentProductionRate: 0,
  uptime: 0,
  efficiency: 0,
  lastProductionTime: 0,
  activeWallets: 0,
  totalToolsLoaded: 0
};
```

### 2. Retry Mechanisms

Implementing intelligent retry logic with exponential backoff:

```typescript
// React Query retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 0,
      gcTime: 0
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
    }
  }
});
```

### 3. Error Isolation

Preventing error propagation through system boundaries:

```typescript
// Error boundary isolation
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  // Isolate errors to prevent cascade failures
  if (hasError) {
    return fallback || <DefaultErrorFallback />;
  }
  return children;
};
```

### 4. Circuit Breaker Pattern

Preventing system overload during repeated failures:

```typescript
// Circuit breaker implementation for service calls
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

## Error Recovery Processes

### Agent Recovery

```typescript
// Agent recovery from error state
recoverAgent(agentId: string): boolean {
  const agent = this.agents.get(agentId);
  if (!agent || agent.status !== 'error') {
    return false;
  }
  
  // Reset agent to initial state
  agent.status = 'soul_forge';
  agent.error = undefined;
  agent.progress = 0;
  agent.stageProgress = 0;
  agent.completedAt = undefined;
  
  return true;
}
```

### Service Recovery

```typescript
// Service recovery after failures
async recoverService(): Promise<void> {
  try {
    // Clear error states
    this.agents.forEach(agent => {
      if (agent.status === 'error') {
        this.recoverAgent(agent.id);
      }
    });
    
    // Reset metrics
    await this.resetMetrics();
    
    // Restart simulation if needed
    if (!this.isRunning) {
      this.startSimulation();
    }
  } catch (error) {
    console.error('Service recovery failed:', error);
    throw error;
  }
}
```

### Data Recovery

```typescript
// localStorage corruption recovery
private recoverFromCorruption(): void {
  try {
    const corruptedData = localStorage.getItem('axiom_factory_metrics');
    if (corruptedData && !this.isValidJSON(corruptedData)) {
      // Clear corrupted data
      localStorage.removeItem('axiom_factory_metrics');
      
      // Initialize with default values
      this.initializeDefaultMetrics();
    }
  } catch (error) {
    console.warn('Failed to recover from localStorage corruption:', error);
    this.initializeDefaultMetrics();
  }
}
```

## Error Monitoring and Logging

### Structured Error Logging

```typescript
// Comprehensive error logging
const logError = (error: Error, errorInfo: ErrorInfo, errorType: string, errorId: string): void => {
  const errorData = {
    errorId,
    timestamp: new Date().toISOString(),
    type: errorType,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
    url: typeof window !== 'undefined' ? window.location.href : 'N/A'
  };
  
  // Console logging with structured format
  console.group(`🚨 Error Boundary - ${errorType.toUpperCase()} [${errorId}]`);
  console.error('Error:', error);
  console.error('Error Info:', errorInfo);
  console.error('Error Data:', errorData);
  console.groupEnd();
  
  // Send to error reporting service in production
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    this.reportError(errorData);
  }
};
```

### Performance Monitoring

```typescript
// Error handling performance analysis
class ErrorHandlingPerformanceAnalyzer {
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
}
```

## User Experience Considerations

### Error Type Detection and UI Response

The system automatically detects error types and provides appropriate user feedback:

```typescript
// Error type detection for UI responses
const detectErrorType = (error: Error): 'network' | 'service' | 'validation' | 'unknown' => {
  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || '';
  
  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  ) {
    return 'network';
  }
  
  // Service errors
  if (
    errorMessage.includes('service') ||
    errorMessage.includes('factory') ||
    errorMessage.includes('agent')
  ) {
    return 'service';
  }
  
  // Validation errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required')
  ) {
    return 'validation';
  }
  
  return 'unknown';
};
```

### Accessible Error UI

All error fallback UI components are designed with accessibility in mind:

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast visual design

### Progressive Enhancement

The system implements progressive enhancement to maintain functionality during errors:

1. **Offline Support**: Cached data availability during network failures
2. **Graceful Degradation**: Reduced functionality instead of complete failure
3. **Retry Mechanisms**: Automatic and manual retry options
4. **Clear Communication**: User-friendly error messages and recovery guidance

## Implementation Examples

### Error Boundary Usage

```typescript
// Wrapping components with error boundaries
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error('Custom error handler:', error, errorInfo);
  }}
  maxRetries={3}
  retryDelay={1000}
>
  <AxiomGigafactory />
</ErrorBoundary>
```

### React Query Error Handling

```typescript
// Custom hook with error handling
const useFactoryMetricsQuery = (options?: any): UseQueryResult<FactoryMetrics, Error> => {
  return useQuery({
    queryKey: ['factory-metrics'],
    queryFn: async () => {
      try {
        return await smartFactoryService.fetchFactoryMetrics();
      } catch (error) {
        // Handle specific error types
        if (error.message.includes('network')) {
          throw new Error('Network connection failed');
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Custom retry logic based on error type
      if (error.message.includes('validation')) {
        return false; // Don't retry validation errors
      }
      return failureCount < 3;
    },
    ...options
  });
};
```

### Service Error Handling

```typescript
// Service method with comprehensive error handling
async createAgent(agentType: AgentType): Promise<Agent> {
  try {
    // Validate input
    if (!this.isValidAgentType(agentType)) {
      throw new Error(`Invalid agent type: ${agentType}`);
    }
    
    // Create agent
    const agent = this.initializeAgent(agentType);
    
    // Start processing
    this.startAgentProcessing(agent);
    
    return agent;
  } catch (error) {
    // Log error
    console.error('Agent creation failed:', error);
    
    // Update metrics
    this.updateErrorMetrics(error);
    
    // Attempt recovery if possible
    if (this.isRecoverableError(error)) {
      return this.recoverFromCreationError(agentType, error);
    }
    
    throw error;
  }
}
```

## Testing Error Handling

The system includes comprehensive error handling tests:

1. **Unit Tests**: Individual error scenarios
2. **Integration Tests**: End-to-end error workflows
3. **Performance Tests**: Error handling performance impact
4. **Load Tests**: High error rate scenarios
5. **Accessibility Tests**: Error UI accessibility

### Error Simulation

```typescript
// Network failure simulation for testing
const networkSimulator = new NetworkFailureSimulator();
networkSimulator.setFailureScenario('/api/metrics', {
  statusCode: 503,
  failureRate: 0.3,
  delay: 1000
});
```

### Test Coverage

- ✅ SmartFactoryService error handling: 25/25 tests passing
- ✅ React Query error handling: Comprehensive network failure simulation
- ✅ Component error boundaries: 28 tests passing with fallback UI
- ✅ Network failure simulation: Various scenarios completed
- ✅ localStorage corruption recovery: Completed and tested
- ✅ Concurrent operation failures: Completed and tested
- ✅ Timeout and recovery scenarios: Completed and tested
- ✅ Performance analysis: Completed with benchmarks and metrics

## Best Practices

1. **Fail Fast**: Detect errors early and fail gracefully
2. **Provide Context**: Include relevant information in error messages
3. **Enable Recovery**: Provide clear recovery paths for users
4. **Monitor Continuously**: Track error rates and patterns
5. **Test Thoroughly**: Simulate various error scenarios
6. **Document Everything**: Maintain clear error handling documentation
7. **Iterate and Improve**: Continuously refine error handling based on feedback

## Related Documentation

- [Error Recovery Mechanisms](ERROR_RECOVERY_MECHANISMS.md)
- [Error Handling Test Coverage](ERROR_HANDLING_TEST_COVERAGE.md)
- [Error Handling Performance Analysis](ERROR_HANDLING_PERFORMANCE_ANALYSIS.md)
- [Error Handling Best Practices](ERROR_HANDLING_BEST_PRACTICES.md)
- [Error Handling Troubleshooting](ERROR_HANDLING_TROUBLESHOOTING.md)
- [Error Handling Readiness Assessment](ERROR_HANDLING_READINESS_ASSESSMENT.md)