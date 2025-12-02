# Error Handling Best Practices

## Overview

This document outlines comprehensive best practices for error handling in Axiom system. These practices ensure robust error management, excellent user experience, and maintainable code based on lessons learned from extensive testing and implementation.

## Table of Contents

- [Core Principles](#core-principles)
- [Error Classification Strategies](#error-classification-strategies)
- [Recovery Pattern Implementation](#recovery-pattern-implementation)
- [Performance Considerations](#performance-considerations)
- [User Experience Guidelines](#user-experience-guidelines)
- [Code Organization](#code-organization)
- [Testing Strategies](#testing-strategies)
- [Monitoring and Alerting](#monitoring-and-alerting)
- [Documentation Standards](#documentation-standards)
- [Security Considerations](#security-considerations)

## Core Principles

### 1. Fail Fast and Fail Safely

**Principle**: Detect errors early and handle them without compromising system stability.

```typescript
// ❌ Bad: Silent failures
async function createAgent(type: string) {
  try {
    return await service.createAgent(type);
  } catch (error) {
    // Error silently ignored
    return null;
  }
}

// ✅ Good: Fast failure with proper handling
async function createAgent(type: string): Promise<Agent> {
  // Early validation
  if (!isValidAgentType(type)) {
    throw new Error(`Invalid agent type: ${type}`);
  }
  
  try {
    return await service.createAgent(type);
  } catch (error) {
    // Proper error handling with context
    throw new AgentCreationError(`Failed to create ${type} agent`, {
      cause: error,
      agentType: type,
      timestamp: Date.now()
    });
  }
}
```

### 2. Provide Context and Actionability

**Principle**: Errors should include sufficient context for debugging and recovery.

```typescript
// ❌ Bad: Generic error messages
throw new Error('Operation failed');

// ✅ Good: Contextual error with actionable information
throw new Error('Agent creation failed: insufficient memory allocation', {
  code: 'AGENT_CREATION_MEMORY_ERROR',
  context: {
    agentType: 'dreamer',
    requestedMemory: 512,
    availableMemory: 256,
    suggestion: 'Try creating a simpler agent type or free up memory'
  },
  recoverable: true,
  retryAfter: 5000 // 5 seconds
});
```

### 3. Implement Graceful Degradation

**Principle**: System should degrade gracefully rather than fail completely.

```typescript
// ✅ Good: Graceful degradation with fallbacks
class FactoryService {
  async fetchMetrics(): Promise<FactoryMetrics> {
    try {
      return await this.fetchLiveMetrics();
    } catch (error) {
      console.warn('Live metrics unavailable, using cached data:', error);
      
      // Fallback to cached data
      const cachedMetrics = await this.getCachedMetrics();
      if (cachedMetrics) {
        return {
          ...cachedMetrics,
          isStale: true,
          lastUpdated: cachedMetrics.timestamp,
          source: 'cache'
        };
      }
      
      // Final fallback to defaults
      return this.getDefaultMetrics();
    }
  }
}
```

### 4. Maintain System Consistency

**Principle**: Ensure system remains in a consistent state during and after error handling.

```typescript
// ✅ Good: Atomic operations with rollback
class AgentManager {
  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<void> {
    const originalAgent = await this.getAgent(agentId);
    
    try {
      // Create backup for rollback
      const backup = { ...originalAgent };
      
      // Apply updates
      await this.applyUpdates(agentId, updates);
      
      // Validate consistency
      await this.validateAgentConsistency(agentId);
    } catch (error) {
      // Rollback on failure
      await this.restoreAgent(agentId, backup);
      throw error;
    }
  }
}
```

## Error Classification Strategies

### Error Type Hierarchy

```typescript
// Structured error classification
abstract class BaseError extends Error {
  abstract readonly type: ErrorType;
  abstract readonly severity: ErrorSeverity;
  abstract readonly recoverable: boolean;
  readonly context?: Record<string, any>;
  readonly timestamp: number;
  readonly code?: string;
  
  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.timestamp = Date.now();
    this.context = options.context;
    this.code = options.code;
  }
}

class NetworkError extends BaseError {
  readonly type = ErrorType.NETWORK;
  readonly severity = ErrorSeverity.HIGH;
  readonly recoverable = true;
}

class ValidationError extends BaseError {
  readonly type = ErrorType.VALIDATION;
  readonly severity = ErrorSeverity.MEDIUM;
  readonly recoverable = false;
}

class SystemError extends BaseError {
  readonly type = ErrorType.SYSTEM;
  readonly severity = ErrorSeverity.CRITICAL;
  readonly recoverable = false;
}
```

### Error Detection Patterns

```typescript
// Consistent error detection
class ErrorDetector {
  static detectErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    if (this.isNetworkError(message, stack)) {
      return ErrorType.NETWORK;
    }
    
    if (this.isValidationError(message, stack)) {
      return ErrorType.VALIDATION;
    }
    
    if (this.isSystemError(message, stack)) {
      return ErrorType.SYSTEM;
    }
    
    return ErrorType.UNKNOWN;
  }
  
  private static isNetworkError(message: string, stack: string): boolean {
    const networkPatterns = [
      /network/, /connection/, /timeout/, /fetch/,
      /502/, /503/, /504/
    ];
    
    return networkPatterns.some(pattern => 
      pattern.test(message) || pattern.test(stack)
    );
  }
}
```

## Recovery Pattern Implementation

### Retry with Exponential Backoff

```typescript
// Intelligent retry mechanism
class RetryManager {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2,
      jitter = true
    } = options;
    
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !this.isRetryableError(error)) {
          throw error;
        }
        
        const delay = this.calculateDelay(
          attempt, baseDelay, maxDelay, backoffFactor, jitter
        );
        
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }
  
  private calculateDelay(
    attempt: number,
    baseDelay: number,
    maxDelay: number,
    backoffFactor: number,
    jitter: boolean
  ): number {
    let delay = baseDelay * Math.pow(backoffFactor, attempt);
    
    if (jitter) {
      // Add ±25% random jitter
      const jitterAmount = delay * 0.25;
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }
    
    return Math.min(delay, maxDelay);
  }
}
```

### Circuit Breaker Pattern

```typescript
// Circuit breaker for fault tolerance
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private successThreshold = 3;
  private failureThreshold = 5;
  private timeout = 60000; // 1 minute
  
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
  
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('Circuit breaker transitioning to CLOSED');
    }
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('Circuit breaker transitioning to OPEN');
    }
  }
}
```

## Performance Considerations

### Memory Management

```typescript
// Efficient memory management for errors
class ErrorMemoryManager {
  private errorPool: Map<string, Error> = new Map();
  private maxPoolSize = 100;
  
  createError(type: string, message: string, context?: any): Error {
    const key = `${type}:${message}`;
    
    // Reuse error objects when possible
    if (this.errorPool.has(key)) {
      const error = this.errorPool.get(key)!;
      error.timestamp = Date.now();
      error.context = context;
      return error;
    }
    
    // Create new error if not in pool
    const error = new Error(message);
    (error as any).type = type;
    (error as any).context = context;
    (error as any).timestamp = Date.now();
    
    // Add to pool if space available
    if (this.errorPool.size < this.maxPoolSize) {
      this.errorPool.set(key, error);
    }
    
    return error;
  }
  
  // Cleanup old errors
  cleanup(): void {
    const cutoff = Date.now() - (5 * 60 * 1000); // 5 minutes ago
    
    for (const [key, error] of this.errorPool.entries()) {
      if (error.timestamp < cutoff) {
        this.errorPool.delete(key);
      }
    }
  }
}
```

### Async Error Handling

```typescript
// Efficient async error handling
class AsyncErrorHandler {
  private errorQueue: ErrorInfo[] = [];
  private processing = false;
  
  async handleError(error: Error, context?: any): Promise<void> {
    this.errorQueue.push({
      error,
      context,
      timestamp: Date.now(),
      id: this.generateErrorId()
    });
    
    if (!this.processing) {
      this.processing = true;
      await this.processErrorQueue();
      this.processing = false;
    }
  }
  
  private async processErrorQueue(): Promise<void> {
    while (this.errorQueue.length > 0) {
      const errorInfo = this.errorQueue.shift()!;
      await this.processError(errorInfo);
    }
  }
  
  private async processError(errorInfo: ErrorInfo): Promise<void> {
    // Batch process errors for efficiency
    await this.logError(errorInfo);
    await this.notifyError(errorInfo);
    await this.updateMetrics(errorInfo);
  }
}
```

## User Experience Guidelines

### Progressive Enhancement

```typescript
// Progressive enhancement for better UX
class ProgressiveErrorHandler {
  async handleOperation<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorType = this.classifyError(error);
      
      switch (errorType) {
        case ErrorType.NETWORK:
          return this.handleNetworkError(error);
          
        case ErrorType.VALIDATION:
          return this.handleValidationError(error);
          
        case ErrorType.SYSTEM:
          return this.handleSystemError(error);
          
        default:
          return this.handleUnknownError(error);
      }
    }
  }
  
  private async handleNetworkError(error: Error): Promise<never> {
    // Show offline indicator
    this.showOfflineIndicator();
    
    // Try cached data
    const cachedData = await this.getCachedData();
    if (cachedData) {
      this.showCachedDataWarning();
      return cachedData;
    }
    
    // Show retry option
    const shouldRetry = await this.showRetryDialog(error.message);
    if (shouldRetry) {
      return this.retryOperation();
    }
    
    throw error;
  }
}
```

### Clear Error Communication

```typescript
// User-friendly error communication
class ErrorCommunicationManager {
  formatErrorForUser(error: BaseError): UserErrorMessage {
    const baseMessage = {
      title: this.getErrorTitle(error.type),
      message: this.getErrorMessage(error),
      actions: this.getErrorActions(error),
      severity: error.severity
    };
    
    // Add contextual information
    if (error.context) {
      baseMessage.context = this.extractRelevantContext(error.context);
    }
    
    return baseMessage;
  }
  
  private getErrorActions(error: BaseError): ErrorAction[] {
    const actions: ErrorAction[] = [];
    
    if (error.recoverable) {
      actions.push({
        label: 'Retry',
        action: 'retry',
        primary: true
      });
    }
    
    actions.push({
      label: 'Learn More',
      action: 'learn',
      primary: false
    });
    
    if (error.severity === ErrorSeverity.CRITICAL) {
      actions.push({
        label: 'Contact Support',
        action: 'support',
        primary: false
      });
    }
    
    return actions;
  }
}
```

## Code Organization

### Error Handling Modules

```typescript
// Organized error handling structure
// src/errors/
├── base/
│   ├── BaseError.ts
│   ├── ErrorType.ts
│   └── ErrorSeverity.ts
├── handlers/
│   ├── NetworkErrorHandler.ts
│   ├── ValidationErrorHandler.ts
│   ├── SystemErrorHandler.ts
│   └── index.ts
├── recovery/
│   ├── RetryManager.ts
│   ├── CircuitBreaker.ts
│   ├── RecoveryManager.ts
│   └── index.ts
├── communication/
│   ├── ErrorCommunicationManager.ts
│   ├── UserMessageFormatter.ts
│   └── index.ts
└── index.ts
```

### Dependency Injection

```typescript
// Dependency injection for testability
interface ErrorHandler {
  handle(error: Error, context?: any): Promise<void>;
}

class ProductionErrorHandler implements ErrorHandler {
  async handle(error: Error, context?: any): Promise<void> {
    // Production error handling
    await this.logError(error, context);
    await this.notifyUser(error);
  }
}

class TestErrorHandler implements ErrorHandler {
  async handle(error: Error, context?: any): Promise<void> {
    // Test error handling
    console.log('Test error handler:', error, context);
  }
}

// Usage with dependency injection
class AgentService {
  constructor(private errorHandler: ErrorHandler) {}
  
  async createAgent(type: string): Promise<Agent> {
    try {
      return await this.doCreateAgent(type);
    } catch (error) {
      await this.errorHandler.handle(error, { agentType: type });
      throw error;
    }
  }
}
```

## Testing Strategies

### Comprehensive Error Testing

```typescript
// Comprehensive error testing strategy
describe('Error Handling', () => {
  describe('Error Classification', () => {
    it('should classify network errors correctly', () => {
      const error = new Error('Network connection failed');
      const type = ErrorDetector.detectErrorType(error);
      expect(type).toBe(ErrorType.NETWORK);
    });
    
    it('should classify validation errors correctly', () => {
      const error = new Error('Invalid input data');
      const type = ErrorDetector.detectErrorType(error);
      expect(type).toBe(ErrorType.VALIDATION);
    });
  });
  
  describe('Recovery Mechanisms', () => {
    it('should retry recoverable errors', async () => {
      let attempts = 0;
      const operation = () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Temporary failure');
        }
        return 'success';
      };
      
      const result = await retryManager.executeWithRetry(operation);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
    
    it('should not retry non-recoverable errors', async () => {
      const operation = () => {
        throw new ValidationError('Invalid data');
      };
      
      await expect(retryManager.executeWithRetry(operation))
        .rejects.toThrow('Invalid data');
    });
  });
  
  describe('Performance Impact', () => {
    it('should handle errors without significant performance impact', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        try {
          await errorManager.handleError(new Error('Test error'));
        } catch {
          // Expected
        }
      }
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(1000); // 1 second for 1000 errors
    });
  });
});
```

### Error Injection Testing

```typescript
// Error injection for testing
class ErrorInjector {
  private injectionScenarios: Map<string, InjectionScenario> = new Map();
  
  setupInjectionScenarios(): void {
    this.injectionScenarios.set('network-failure', {
      type: 'network',
      error: new Error('Simulated network failure'),
      probability: 0.3,
      duration: 5000
    });
    
    this.injectionScenarios.set('memory-pressure', {
      type: 'system',
      error: new Error('Simulated memory pressure'),
      probability: 0.1,
      duration: 10000
    });
  }
  
  async executeWithInjection<T>(
    operation: () => Promise<T>,
    scenarioName: string
  ): Promise<T> {
    const scenario = this.injectionScenarios.get(scenarioName);
    
    if (scenario && Math.random() < scenario.probability) {
      // Inject error
      throw scenario.error;
    }
    
    return await operation();
  }
}
```

## Monitoring and Alerting

### Structured Error Logging

```typescript
// Comprehensive error logging
class ErrorLogger {
  private logBuffer: ErrorLogEntry[] = [];
  private maxBufferSize = 100;
  
  async logError(error: BaseError, context?: any): Promise<void> {
    const entry: ErrorLogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      type: error.type,
      severity: error.severity,
      message: error.message,
      stack: error.stack,
      context: context || error.context,
      userAgent: this.getUserAgent(),
      url: this.getCurrentUrl(),
      sessionId: this.getSessionId()
    };
    
    // Add to buffer
    this.logBuffer.push(entry);
    
    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
    
    // Send to logging service
    await this.sendToLoggingService(entry);
  }
  
  private async sendToLoggingService(entry: ErrorLogEntry): Promise<void> {
    try {
      await fetch('/api/logs/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }
}
```

### Real-time Monitoring Dashboard

```typescript
// Real-time error monitoring
class ErrorMonitoringDashboard {
  private metrics: ErrorMetrics;
  private alertThresholds = {
    errorRate: 0.05, // 5%
    criticalErrors: 10, // per minute
    recoveryFailures: 0.1 // 10%
  };
  
  updateMetrics(errorInfo: ErrorInfo): void {
    this.metrics.addError(errorInfo);
    
    // Check thresholds
    this.checkThresholds();
    
    // Update dashboard
    this.updateDashboard();
  }
  
  private checkThresholds(): void {
    const errorRate = this.metrics.getErrorRate();
    const criticalCount = this.metrics.getCriticalErrorCount();
    const recoveryFailureRate = this.metrics.getRecoveryFailureRate();
    
    if (errorRate > this.alertThresholds.errorRate) {
      this.sendAlert({
        type: 'HIGH_ERROR_RATE',
        severity: 'HIGH',
        message: `Error rate exceeded: ${(errorRate * 100).toFixed(1)}%`,
        value: errorRate
      });
    }
    
    if (criticalCount > this.alertThresholds.criticalErrors) {
      this.sendAlert({
        type: 'HIGH_CRITICAL_ERRORS',
        severity: 'CRITICAL',
        message: `Critical errors exceeded: ${criticalCount}/minute`,
        value: criticalCount
      });
    }
  }
}
```

## Documentation Standards

### Error Documentation Template

```typescript
/**
 * Error: Agent Creation Failed
 * 
 * @description Occurs when agent creation process fails due to various reasons
 * @severity HIGH
 * @recoverable true
 * @retryAfter 5000ms
 * 
 * @example
 * ```typescript
 * try {
 *   await factoryService.createAgent('dreamer');
 * } catch (error) {
 *   if (error.code === 'AGENT_CREATION_FAILED') {
 *     // Handle agent creation failure
 *   }
 * }
 * ```
 */
class AgentCreationError extends BaseError {
  readonly type = ErrorType.SERVICE;
  readonly severity = ErrorSeverity.HIGH;
  readonly recoverable = true;
  readonly retryAfter = 5000;
  
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, options);
    this.code = 'AGENT_CREATION_FAILED';
  }
}
```

### Error Response Format

```typescript
// Standardized error response format
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    type: ErrorType;
    severity: ErrorSeverity;
    recoverable: boolean;
    retryAfter?: number;
    context?: Record<string, any>;
  };
  timestamp: string;
  requestId: string;
  documentation?: string;
}

// Usage
const createErrorResponse = (error: BaseError, requestId: string): ErrorResponse => ({
  error: {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message,
    type: error.type,
    severity: error.severity,
    recoverable: error.recoverable,
    retryAfter: (error as any).retryAfter,
    context: error.context
  },
  timestamp: new Date().toISOString(),
  requestId,
  documentation: `https://docs.axiom.com/errors/${error.code}`
});
```

## Security Considerations

### Secure Error Handling

```typescript
// Secure error information disclosure
class SecureErrorHandler {
  sanitizeError(error: Error): SecureError {
    return {
      message: error.message,
      type: this.classifyError(error),
      severity: this.determineSeverity(error),
      recoverable: this.isRecoverable(error),
      // Remove sensitive information
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
      // Note: Don't include stack traces in production
      // Don't include internal system details
      // Don't include user data
    };
  }
  
  private classifyError(error: Error): string {
    // Classify without exposing internal details
    if (error.message.includes('database')) {
      return 'DATA_ACCESS_ERROR';
    }
    
    if (error.message.includes('authentication')) {
      return 'AUTHENTICATION_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }
}
```

### Error Rate Limiting

```typescript
// Prevent error information leakage through rate limiting
class ErrorRateLimiter {
  private errorCounts: Map<string, number> = new Map();
  private maxErrorsPerMinute = 10;
  private timeWindows: Map<string, number[]> = new Map();
  
  shouldLogError(errorType: string): boolean {
    const now = Date.now();
    const windowKey = Math.floor(now / 60000).toString(); // 1-minute windows
    
    // Initialize window if needed
    if (!this.timeWindows.has(windowKey)) {
      this.timeWindows.set(windowKey, []);
    }
    
    const window = this.timeWindows.get(windowKey)!;
    
    // Clean old entries
    const cutoff = now - 60000;
    while (window.length > 0 && window[0] < cutoff) {
      window.shift();
    }
    
    // Add current error
    window.push(now);
    
    // Check rate limit
    return window.length < this.maxErrorsPerMinute;
  }
}
```

## Implementation Checklist

### Development Phase

- [ ] Define error classification hierarchy
- [ ] Implement structured error types
- [ ] Create error handling utilities
- [ ] Set up error logging infrastructure
- [ ] Implement retry mechanisms
- [ ] Add circuit breaker patterns
- [ ] Create recovery strategies
- [ ] Set up monitoring and alerting
- [ ] Implement user-friendly error communication
- [ ] Add comprehensive error testing

### Testing Phase

- [ ] Test all error scenarios
- [ ] Verify error classification accuracy
- [ ] Test recovery mechanisms
- [ ] Validate performance impact
- [ ] Test user experience
- [ ] Verify security measures
- [ ] Test monitoring and alerting
- [ ] Validate documentation completeness

### Production Phase

- [ ] Monitor error rates and patterns
- [ ] Validate recovery effectiveness
- [ ] Check performance impact
- [ ] Review user feedback
- [ ] Update error handling based on real-world usage
- [ ] Maintain error documentation
- [ ] Continuously improve error handling

## Related Documentation

- [Error Handling Guide](ERROR_HANDLING_GUIDE.md)
- [Error Recovery Mechanisms](ERROR_RECOVERY_MECHANISMS.md)
- [Error Handling Test Coverage](ERROR_HANDLING_TEST_COVERAGE.md)
- [Error Handling Performance Analysis](ERROR_HANDLING_PERFORMANCE_ANALYSIS.md)
- [Error Handling Troubleshooting](ERROR_HANDLING_TROUBLESHOOTING.md)
- [Error Handling Readiness Assessment](ERROR_HANDLING_READINESS_ASSESSMENT.md)