/**
 * 🌐 NETWORK PERFORMANCE OPTIMIZER
 * 
 * Advanced network optimization for research operations
 * Provides request batching, retry strategies, bandwidth optimization, and connection management
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { ResearchQuery, ResearchResult } from './GoogleDeepResearch';

// ============================================================================
// NETWORK OPTIMIZER TYPES
// ============================================================================

/**
 * Network Configuration
 */
export interface NetworkConfiguration {
  max_concurrent_requests: number;
  request_timeout_ms: number;
  retry_attempts: number;
  retry_backoff_strategy: 'linear' | 'exponential' | 'adaptive';
  batch_size: number;
  batch_timeout_ms: number;
  connection_pool_size: number;
  connection_keepalive_ms: number;
  compression_enabled: boolean;
  compression_algorithm: 'gzip' | 'br' | 'deflate';
  cdn_enabled: boolean;
  cache_headers_enabled: boolean;
  bandwidth_throttling_enabled: boolean;
  max_bandwidth_mbps: number;
}

/**
 * Request Batch
 */
export interface RequestBatch {
  id: string;
  requests: Array<{
    id: string;
    query: ResearchQuery;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
  }>;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  results: Map<string, ResearchResult>;
  errors: Map<string, string>;
}

/**
 * Connection Pool Entry
 */
export interface ConnectionPoolEntry {
  id: string;
  url: string;
  created_at: string;
  last_used: string;
  usage_count: number;
  is_active: boolean;
  response_time_avg: number;
  error_rate: number;
  bandwidth_usage_mbps: number;
}

/**
 * Retry Strategy
 */
export interface RetryStrategy {
  max_attempts: number;
  base_delay_ms: number;
  max_delay_ms: number;
  backoff_multiplier: number;
  jitter_enabled: boolean;
  retry_condition: (error: any, attempt: number) => boolean;
  retry_callback?: (attempt: number, error: any) => void;
}

/**
 * Network Performance Metrics
 */
export interface NetworkPerformanceMetrics {
  requests_per_second: number;
  average_response_time: number;
  p95_response_time: number;
  p99_response_time: number;
  error_rate: number;
  retry_rate: number;
  bandwidth_utilization: number;
  connection_pool_efficiency: number;
  cache_hit_rate: number;
  compression_ratio: number;
  cdn_hit_rate: number;
}

/**
 * Network Optimization Result
 */
export interface NetworkOptimizationResult {
  operation_id: string;
  optimization_type: 'batching' | 'compression' | 'caching' | 'connection_reuse' | 'cdn';
  original_requests: number;
  optimized_requests: number;
  time_saved_ms: number;
  bandwidth_saved_mb: number;
  success_rate: number;
  performance_improvement: number;
}

// ============================================================================
// NETWORK OPTIMIZER CLASS
// ============================================================================

/**
 * Network Optimizer - Advanced network performance optimization
 */
export class NetworkOptimizer {
  private id: string;
  private optimizationLevel: any;
  private config: NetworkConfiguration;

  // Connection management
  private connectionPool: Map<string, ConnectionPoolEntry> = new Map();
  private activeConnections: Set<string> = new Set();
  private connectionMetrics: Map<string, { response_times: number[]; errors: number }> = new Map();

  // Request batching
  private requestQueue: Array<{
    id: string;
    query: ResearchQuery;
    priority: 'low' | 'medium' | 'high' | 'critical';
    resolve: (result: ResearchResult) => void;
    reject: (error: any) => void;
    timestamp: number;
  }> = [];
  private activeBatches: Map<string, RequestBatch> = new Map();
  private batchProcessorInterval: NodeJS.Timeout | null = null;

  // Performance tracking
  private metrics: NetworkPerformanceMetrics = {
    requests_per_second: 0,
    average_response_time: 0,
    p95_response_time: 0,
    p99_response_time: 0,
    error_rate: 0,
    retry_rate: 0,
    bandwidth_utilization: 0,
    connection_pool_efficiency: 0,
    cache_hit_rate: 0,
    compression_ratio: 0,
    cdn_hit_rate: 0
  };

  // Retry management
  private retryStrategies: Map<string, RetryStrategy> = new Map();
  private activeRetries: Map<string, { attempts: number; next_attempt: number }> = new Map();

  // Bandwidth monitoring
  private bandwidthUsage: Array<{
    timestamp: number;
    bytes_transferred: number;
    duration_ms: number;
  }> = [];
  private bandwidthMonitorInterval: NodeJS.Timeout | null = null;

  constructor(optimizationLevel: any) {
    this.id = `network_optimizer_${Date.now()}`;
    this.optimizationLevel = optimizationLevel;
    this.config = this.createNetworkConfiguration(optimizationLevel);
  }

  /**
   * Initialize network optimizer
   */
  async initialize(): Promise<void> {
    console.log(`🌐 Initializing Network Optimizer: ${this.id}`);
    console.log(`📊 Configuration: ${this.config.max_concurrent_requests} max concurrent, ${this.config.batch_size} batch size`);

    // Initialize connection pool
    await this.initializeConnectionPool();

    // Start batch processor
    this.startBatchProcessor();

    // Start bandwidth monitoring
    this.startBandwidthMonitoring();

    // Set up default retry strategies
    this.setupDefaultRetryStrategies();

    console.log('✅ Network Optimizer initialized successfully');
  }

  /**
   * Optimize research queries
   */
  async optimizeQueries(queries: ResearchQuery[]): Promise<ResearchQuery[]> {
    console.log(`🔧 Optimizing ${queries.length} research queries`);
    const startTime = Date.now();

    try {
      let optimizedQueries = [...queries];

      // 1. Deduplicate similar queries
      optimizedQueries = this.deduplicateQueries(optimizedQueries);

      // 2. Prioritize by importance
      optimizedQueries = this.prioritizeQueries(optimizedQueries);

      // 3. Group for batching
      if (this.config.batch_size > 1) {
        optimizedQueries = this.groupQueriesForBatching(optimizedQueries);
      }

      // 4. Add optimization headers
      optimizedQueries = this.addOptimizationHeaders(optimizedQueries);

      const optimizationTime = Date.now() - startTime;
      console.log(`✅ Query optimization completed in ${optimizationTime}ms`);

      return optimizedQueries;

    } catch (error) {
      console.error('❌ Query optimization failed:', error);
      throw new Error(`Query optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute optimized request
   */
  async executeRequest(
    query: ResearchQuery,
    options?: {
      priority?: 'low' | 'medium' | 'high' | 'critical';
      timeout?: number;
      retry_strategy?: string;
      use_batch?: boolean;
    }
  ): Promise<ResearchResult> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const priority = options?.priority || 'medium';
    const useBatch = options?.use_batch !== false && this.config.batch_size > 1;

    console.log(`📤 Executing request ${requestId} (priority: ${priority}, batch: ${useBatch})`);

    return new Promise((resolve, reject) => {
      if (useBatch) {
        // Add to batch queue
        this.requestQueue.push({
          id: requestId,
          query,
          priority,
          resolve,
          reject,
          timestamp: Date.now()
        });
      } else {
        // Execute immediately
        this.executeImmediateRequest(requestId, query, options)
          .then(resolve)
          .catch(reject);
      }
    });
  }

  /**
   * Execute batch of requests
   */
  async executeBatch(requests: Array<{
    id: string;
    query: ResearchQuery;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>): Promise<{
    results: Map<string, ResearchResult>;
    errors: Map<string, string>;
    performance_summary: {
      total_time: number;
      average_time: number;
      success_rate: number;
      bandwidth_saved: number;
    };
  }> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`📦 Executing batch ${batchId} with ${requests.length} requests`);

    const batch: RequestBatch = {
      id: batchId,
      requests,
      created_at: new Date().toISOString(),
      status: 'pending',
      results: new Map(),
      errors: new Map()
    };

    this.activeBatches.set(batchId, batch);

    try {
      batch.status = 'processing';
      batch.started_at = new Date().toISOString();

      // Execute requests in parallel with concurrency limits
      const semaphore = new Semaphore(this.config.max_concurrent_requests);
      const startTime = Date.now();

      const promises = requests.map(async (request) => {
        await semaphore.acquire();

        try {
          const result = await this.executeImmediateRequest(
            request.id,
            request.query,
            { priority: request.priority, timeout: this.config.batch_timeout_ms }
          );

          batch.results.set(request.id, result);
          return result;

        } catch (error) {
          batch.errors.set(request.id, error instanceof Error ? error.message : 'Unknown error');
          throw error;

        } finally {
          semaphore.release();
        }
      });

      await Promise.allSettled(promises);

      batch.status = 'completed';
      batch.completed_at = new Date().toISOString();

      const totalTime = Date.now() - startTime;
      const successCount = batch.results.size;
      const successRate = successCount / requests.length;

      const performanceSummary = {
        total_time: totalTime,
        average_time: totalTime / requests.length,
        success_rate: successRate,
        bandwidth_saved: this.calculateBandwidthSavings(requests.length, 1)
      };

      console.log(`✅ Batch ${batchId} completed: ${successRate * 100}% success rate`);

      return {
        results: batch.results,
        errors: batch.errors,
        performance_summary: performanceSummary
      };

    } catch (error) {
      batch.status = 'failed';
      batch.completed_at = new Date().toISOString();

      console.error(`❌ Batch ${batchId} failed:`, error);
      throw error;

    } finally {
      this.activeBatches.delete(batchId);
    }
  }

  /**
   * Get connection from pool
   */
  async getConnection(url: string): Promise<ConnectionPoolEntry> {
    // Check for existing connection
    const existingConnection = this.connectionPool.get(url);

    if (existingConnection && existingConnection.is_active &&
      !this.activeConnections.has(existingConnection.id)) {

      // Reuse existing connection
      existingConnection.last_used = new Date().toISOString();
      existingConnection.usage_count++;
      this.activeConnections.add(existingConnection.id);

      return existingConnection;
    }

    // Create new connection
    const connection: ConnectionPoolEntry = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
      usage_count: 1,
      is_active: true,
      response_time_avg: 0,
      error_rate: 0,
      bandwidth_usage_mbps: 0
    };

    this.connectionPool.set(url, connection);
    this.activeConnections.add(connection.id);
    this.connectionMetrics.set(connection.id, { response_times: [], errors: 0 });

    console.log(`🔗 Created new connection: ${connection.id} to ${url}`);
    return connection;
  }

  /**
   * Release connection back to pool
   */
  releaseConnection(connectionId: string): void {
    const connection = Array.from(this.connectionPool.values())
      .find(conn => conn.id === connectionId);

    if (connection) {
      this.activeConnections.delete(connectionId);
      connection.last_used = new Date().toISOString();

      // Update connection metrics
      const metrics = this.connectionMetrics.get(connectionId);
      if (metrics) {
        const responseTimes = metrics.response_times;
        connection.response_time_avg = responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          : 0;
        connection.error_rate = metrics.errors / Math.max(1, metrics.errors + responseTimes.length);
      }

      console.log(`🔓 Released connection: ${connectionId}`);
    }
  }

  /**
   * Get network performance metrics
   */
  getPerformanceMetrics(): NetworkPerformanceMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get connection pool status
   */
  getConnectionPoolStatus(): {
    total_connections: number;
    active_connections: number;
    pool_efficiency: number;
    average_response_time: number;
    error_rate: number;
  } {
    const totalConnections = this.connectionPool.size;
    const activeConnections = this.activeConnections.size;

    let totalResponseTime = 0;
    let totalErrors = 0;
    let connectionCount = 0;

    for (const connection of this.connectionPool.values()) {
      totalResponseTime += connection.response_time_avg;
      totalErrors += connection.error_rate;
      connectionCount++;
    }

    const averageResponseTime = connectionCount > 0 ? totalResponseTime / connectionCount : 0;
    const averageErrorRate = connectionCount > 0 ? totalErrors / connectionCount : 0;
    const poolEfficiency = totalConnections > 0 ? activeConnections / totalConnections : 0;

    return {
      total_connections: totalConnections,
      active_connections: activeConnections,
      pool_efficiency: poolEfficiency,
      average_response_time: averageResponseTime,
      error_rate: averageErrorRate
    };
  }

  /**
   * Update configuration
   */
  async updateConfiguration(optimizationLevel: any): Promise<void> {
    console.log('🔄 Updating network optimizer configuration');

    this.optimizationLevel = optimizationLevel;
    this.config = this.createNetworkConfiguration(optimizationLevel);

    // Restart batch processor with new configuration
    this.stopBatchProcessor();
    this.startBatchProcessor();

    console.log('✅ Network optimizer configuration updated');
  }

  /**
   * Shutdown network optimizer
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Network Optimizer');

    // Stop monitoring intervals
    this.stopBatchProcessor();
    this.stopBandwidthMonitoring();

    // Close all active connections
    for (const connectionId of this.activeConnections) {
      this.releaseConnection(connectionId);
    }

    // Clear connection pool
    this.connectionPool.clear();
    this.connectionMetrics.clear();

    // Clear queues
    this.requestQueue = [];
    this.activeBatches.clear();
    this.activeRetries.clear();

    console.log('✅ Network Optimizer shutdown complete');
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Create network configuration from optimization level
   */
  private createNetworkConfiguration(optimizationLevel: any): NetworkConfiguration {
    const configs: Record<string, NetworkConfiguration> = {
      minimal: {
        max_concurrent_requests: 3,
        request_timeout_ms: 10000,
        retry_attempts: 2,
        retry_backoff_strategy: 'linear',
        batch_size: 1,
        batch_timeout_ms: 15000,
        connection_pool_size: 5,
        connection_keepalive_ms: 30000,
        compression_enabled: false,
        compression_algorithm: 'gzip',
        cdn_enabled: false,
        cache_headers_enabled: true,
        bandwidth_throttling_enabled: false,
        max_bandwidth_mbps: 10
      },
      balanced: {
        max_concurrent_requests: 6,
        request_timeout_ms: 8000,
        retry_attempts: 3,
        retry_backoff_strategy: 'exponential',
        batch_size: 5,
        batch_timeout_ms: 12000,
        connection_pool_size: 10,
        connection_keepalive_ms: 60000,
        compression_enabled: true,
        compression_algorithm: 'gzip',
        cdn_enabled: true,
        cache_headers_enabled: true,
        bandwidth_throttling_enabled: false,
        max_bandwidth_mbps: 50
      },
      aggressive: {
        max_concurrent_requests: 12,
        request_timeout_ms: 6000,
        retry_attempts: 4,
        retry_backoff_strategy: 'adaptive',
        batch_size: 10,
        batch_timeout_ms: 10000,
        connection_pool_size: 20,
        connection_keepalive_ms: 120000,
        compression_enabled: true,
        compression_algorithm: 'br',
        cdn_enabled: true,
        cache_headers_enabled: true,
        bandwidth_throttling_enabled: true,
        max_bandwidth_mbps: 100
      },
      maximum: {
        max_concurrent_requests: 20,
        request_timeout_ms: 5000,
        retry_attempts: 5,
        retry_backoff_strategy: 'adaptive',
        batch_size: 20,
        batch_timeout_ms: 8000,
        connection_pool_size: 40,
        connection_keepalive_ms: 300000,
        compression_enabled: true,
        compression_algorithm: 'br',
        cdn_enabled: true,
        cache_headers_enabled: true,
        bandwidth_throttling_enabled: true,
        max_bandwidth_mbps: 1000
      }
    };

    return configs[optimizationLevel.name] || configs.balanced;
  }

  /**
   * Initialize connection pool
   */
  private async initializeConnectionPool(): Promise<void> {
    console.log(`🔗 Initializing connection pool with ${this.config.connection_pool_size} connections`);

    // Pre-warm connection pool with common endpoints
    const commonEndpoints = [
      'https://api.google.com',
      'https://generativelanguage.googleapis.com',
      'https://cdn.research.axiom.ai'
    ];

    for (const endpoint of commonEndpoints.slice(0, this.config.connection_pool_size)) {
      await this.getConnection(endpoint);
    }

    console.log('✅ Connection pool initialized');
  }

  /**
   * Setup default retry strategies
   */
  private setupDefaultRetryStrategies(): void {
    // Default retry strategy
    this.retryStrategies.set('default', {
      max_attempts: this.config.retry_attempts,
      base_delay_ms: 1000,
      max_delay_ms: 30000,
      backoff_multiplier: 2,
      jitter_enabled: true,
      retry_condition: (error, attempt) => {
        // Retry on network errors and 5xx status codes
        return error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT' ||
          (error.status >= 500 && error.status < 600) ||
          attempt < this.config.retry_attempts;
      }
    });

    // Aggressive retry strategy for critical requests
    this.retryStrategies.set('critical', {
      max_attempts: this.config.retry_attempts + 2,
      base_delay_ms: 500,
      max_delay_ms: 10000,
      backoff_multiplier: 1.5,
      jitter_enabled: false,
      retry_condition: (error, attempt) => attempt < this.config.retry_attempts + 2
    });
  }

  /**
   * Execute immediate request with retry logic
   */
  private async executeImmediateRequest(
    requestId: string,
    query: ResearchQuery,
    options?: any
  ): Promise<ResearchResult> {
    const retryStrategy = this.retryStrategies.get(options?.retry_strategy || 'default')!;
    let lastError: any;

    for (let attempt = 1; attempt <= retryStrategy.max_attempts; attempt++) {
      try {
        const startTime = Date.now();

        // Get connection
        const connection = await this.getConnection('https://generativelanguage.googleapis.com');

        // Execute request
        const result = await this.makeHttpRequest(connection, query, options);

        // Update connection metrics
        this.updateConnectionMetrics(connection.id, Date.now() - startTime, false);

        // Release connection
        this.releaseConnection(connection.id);

        // Update metrics
        this.metrics.requests_per_second++;
        this.updateResponseTimeMetrics(Date.now() - startTime);

        return result;

      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (!retryStrategy.retry_condition(error, attempt)) {
          throw error;
        }

        // Update retry metrics
        this.metrics.retry_rate++;

        // Call retry callback if provided
        if (retryStrategy.retry_callback) {
          retryStrategy.retry_callback(attempt, error);
        }

        // Calculate delay for next attempt
        const delay = this.calculateRetryDelay(retryStrategy, attempt);

        console.warn(`⚠️ Request ${requestId} failed (attempt ${attempt}), retrying in ${delay}ms:`, error);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Make HTTP request
   */
  private async makeHttpRequest(
    connection: ConnectionPoolEntry,
    query: ResearchQuery,
    options?: any
  ): Promise<ResearchResult> {
    // Simulate HTTP request - in production, use fetch/axios
    const requestSize = JSON.stringify(query).length;
    const startTime = Date.now();

    // Simulate network delay
    const baseDelay = 500 + Math.random() * 1500;
    const delay = this.config.bandwidth_throttling_enabled
      ? baseDelay * (1 + (requestSize / 10000))
      : baseDelay;

    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate response
    const responseSize = 5000 + Math.random() * 10000;
    const responseTime = Date.now() - startTime;

    // Update bandwidth usage
    this.updateBandwidthUsage(requestSize + responseSize, responseTime);

    // Simulate occasional errors
    if (Math.random() < 0.05) { // 5% error rate
      throw new Error('Network request failed');
    }

    return {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query_id: query.id,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: responseTime,
      data: {
        summary: `Research results for: ${query.query}`,
        key_findings: [`Finding 1 for ${query.query}`, `Finding 2 for ${query.query}`],
        detailed_analysis: `Detailed analysis for ${query.query}`,
        sources: [],
        confidence_score: 0.8 + Math.random() * 0.2,
        relevance_score: 0.7 + Math.random() * 0.3,
        quality_score: 0.8 + Math.random() * 0.2,
        metadata: {
          total_sources_analyzed: 5 + Math.floor(Math.random() * 10),
          content_types: ['academic', 'news'],
          languages: ['en'],
          temporal_coverage: new Date().toISOString().split('T')[0]
        }
      },
      processing: {
        tokens_used: 1000 + Math.floor(Math.random() * 2000),
        api_calls_made: 1,
        cache_hits: Math.random() > 0.7 ? 1 : 0,
        errors: []
      }
    };
  }

  /**
   * Calculate retry delay
   */
  private calculateRetryDelay(strategy: RetryStrategy, attempt: number): number {
    let delay: number;

    switch (strategy.backoff_strategy) {
      case 'linear':
        delay = strategy.base_delay_ms * attempt;
        break;
      case 'exponential':
        delay = strategy.base_delay_ms * Math.pow(strategy.backoff_multiplier, attempt - 1);
        break;
      case 'adaptive': {
        // Adaptive based on error rate
        const errorRate = this.metrics.error_rate;
        const adaptiveMultiplier = 1 + errorRate;
        delay = strategy.base_delay_ms * Math.pow(strategy.backoff_multiplier, attempt - 1) * adaptiveMultiplier;
        break;
      }
      default:
        delay = strategy.base_delay_ms * attempt;
    }

    // Apply jitter if enabled
    if (strategy.jitter_enabled) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.min(delay, strategy.max_delay_ms);
  }

  /**
   * Update connection metrics
   */
  private updateConnectionMetrics(connectionId: string, responseTime: number, isError: boolean): void {
    const metrics = this.connectionMetrics.get(connectionId);
    if (metrics) {
      metrics.response_times.push(responseTime);
      if (isError) {
        metrics.errors++;
      }

      // Keep only last 100 response times
      if (metrics.response_times.length > 100) {
        metrics.response_times.splice(0, metrics.response_times.length - 100);
      }
    }
  }

  /**
   * Update bandwidth usage
   */
  private updateBandwidthUsage(bytesTransferred: number, durationMs: number): void {
    const now = Date.now();

    this.bandwidthUsage.push({
      timestamp: now,
      bytes_transferred: bytesTransferred,
      duration_ms: durationMs
    });

    // Keep only last 1000 entries
    if (this.bandwidthUsage.length > 1000) {
      this.bandwidthUsage.splice(0, this.bandwidthUsage.length - 1000);
    }

    // Update bandwidth utilization
    this.updateBandwidthUtilization();
  }

  /**
   * Update bandwidth utilization
   */
  private updateBandwidthUtilization(): void {
    if (this.bandwidthUsage.length === 0) {
      this.metrics.bandwidth_utilization = 0;
      return;
    }

    const recentUsage = this.bandwidthUsage.slice(-100); // Last 100 entries
    const totalBytes = recentUsage.reduce((sum, entry) => sum + entry.bytes_transferred, 0);
    const totalTimeMs = recentUsage.reduce((sum, entry) => sum + entry.duration_ms, 0);

    if (totalTimeMs > 0) {
      const bytesPerSecond = (totalBytes / totalTimeMs) * 1000;
      const mbps = (bytesPerSecond * 8) / (1024 * 1024);

      this.metrics.bandwidth_utilization = this.config.max_bandwidth_mbps > 0
        ? (mbps / this.config.max_bandwidth_mbps) * 100
        : 0;
    }
  }

  /**
   * Update response time metrics
   */
  private updateResponseTimeMetrics(responseTime: number): void {
    // Simple moving average
    this.metrics.average_response_time =
      (this.metrics.average_response_time + responseTime) / 2;

    // P95 and P99 would require more sophisticated tracking
    this.metrics.p95_response_time = this.metrics.average_response_time * 1.5;
    this.metrics.p99_response_time = this.metrics.average_response_time * 2;
  }

  /**
   * Deduplicate queries
   */
  private deduplicateQueries(queries: ResearchQuery[]): ResearchQuery[] {
    const seen = new Set<string>();
    const deduplicated: ResearchQuery[] = [];

    for (const query of queries) {
      const queryKey = JSON.stringify({
        query: query.query,
        domain: query.domain,
        depth: query.depth,
        language: query.language
      });

      if (!seen.has(queryKey)) {
        seen.add(queryKey);
        deduplicated.push(query);
      }
    }

    console.log(`🔄 Deduplicated ${queries.length} queries to ${deduplicated.length} unique queries`);
    return deduplicated;
  }

  /**
   * Prioritize queries
   */
  private prioritizeQueries(queries: ResearchQuery[]): ResearchQuery[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    return queries.sort((a, b) => {
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
      return priorityB - priorityA;
    });
  }

  /**
   * Group queries for batching
   */
  private groupQueriesForBatching(queries: ResearchQuery[]): ResearchQuery[] {
    // For now, return as-is - in production, would group by similarity
    return queries;
  }

  /**
   * Add optimization headers
   */
  private addOptimizationHeaders(queries: ResearchQuery[]): ResearchQuery[] {
    return queries.map(query => ({
      ...query,
      metadata: {
        ...query.metadata,
        optimization_headers: {
          compression: this.config.compression_enabled,
          cdn: this.config.cdn_enabled,
          cache: this.config.cache_headers_enabled
        }
      }
    }));
  }

  /**
   * Calculate bandwidth savings
   */
  private calculateBandwidthSavings(requestCount: number, batchCount: number): number {
    // Simplified calculation - in production, would be more accurate
    const individualRequestOverhead = 500; // bytes per request overhead
    const batchOverhead = 1000; // bytes per batch overhead

    const individualTotal = requestCount * individualRequestOverhead;
    const batchTotal = batchCount * batchOverhead;

    return Math.max(0, individualTotal - batchTotal) / (1024 * 1024); // Convert to MB
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    // Calculate connection pool efficiency
    const totalConnections = this.connectionPool.size;
    const activeConnections = this.activeConnections.size;
    this.metrics.connection_pool_efficiency = totalConnections > 0 ? activeConnections / totalConnections : 0;

    // Update other metrics based on recent activity
    const recentBandwidth = this.bandwidthUsage.slice(-50);
    if (recentBandwidth.length > 0) {
      const totalBytes = recentBandwidth.reduce((sum, entry) => sum + entry.bytes_transferred, 0);
      const totalTime = recentBandwidth.reduce((sum, entry) => sum + entry.duration_ms, 0);

      if (totalTime > 0) {
        const bytesPerSecond = (totalBytes / totalTime) * 1000;
        this.metrics.requests_per_second = bytesPerSecond / 10000; // Assume 10KB per request
      }
    }
  }

  /**
   * Start batch processor
   */
  private startBatchProcessor(): void {
    this.batchProcessorInterval = setInterval(() => {
      this.processBatchQueue();
    }, 1000); // Process every second
  }

  /**
   * Stop batch processor
   */
  private stopBatchProcessor(): void {
    if (this.batchProcessorInterval) {
      clearInterval(this.batchProcessorInterval);
      this.batchProcessorInterval = null;
    }
  }

  /**
   * Process batch queue
   */
  private async processBatchQueue(): Promise<void> {
    if (this.requestQueue.length === 0) {
      return;
    }

    // Take batch size requests
    const batch = this.requestQueue.splice(0, this.config.batch_size);

    if (batch.length === 0) {
      return;
    }

    console.log(`📦 Processing batch with ${batch.length} requests`);

    // Execute batch
    this.executeBatch(batch.map(req => ({
      id: req.id,
      query: req.query,
      priority: req.priority
    })))
      .then(results => {
        // Resolve promises
        for (const request of batch) {
          const result = results.results.get(request.id);
          if (result) {
            request.resolve(result);
          } else {
            const error = results.errors.get(request.id);
            request.reject(error || new Error('Request failed in batch'));
          }
        }
      })
      .catch(error => {
        // Reject all promises
        for (const request of batch) {
          request.reject(error);
        }
      });
  }

  /**
   * Start bandwidth monitoring
   */
  private startBandwidthMonitoring(): void {
    this.bandwidthMonitorInterval = setInterval(() => {
      this.updateBandwidthUtilization();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Stop bandwidth monitoring
   */
  private stopBandwidthMonitoring(): void {
    if (this.bandwidthMonitorInterval) {
      clearInterval(this.bandwidthMonitorInterval);
      this.bandwidthMonitorInterval = null;
    }
  }
}

// ============================================================================
// SEMAPHORE HELPER CLASS
// ============================================================================

/**
 * Simple semaphore for concurrency control
 */
class Semaphore {
  private permits: number;
  private waitQueue: Array<{ resolve: () => void }> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.waitQueue.push({ resolve });
    });
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift()!;
      waiter.resolve();
    } else {
      this.permits++;
    }
  }
}

export default NetworkOptimizer;