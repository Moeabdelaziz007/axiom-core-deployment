/**
 * Qdrant Vector Store - Sovereign Agent Memory Implementation
 * 
 * This module provides the foundation for sovereign agent memory using Qdrant
 * vector database. Enables semantic search, context-aware retrieval, and
 * scalable storage for thousands of agents with complete provenance tracking.
 * 
 * Key Features:
 * - Semantic memory search with vector embeddings
 * - Context-aware retrieval with metadata filtering
 * - Batch operations for high performance
 * - Complete data lineage tracking
 * - Graceful degradation and error handling
 * - Performance monitoring and optimization
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { ThoughtUnit, ReActTrace } from '../aix/schema';
import { DataSource, TrustLevel } from '../aix/data-lineage';

/**
 * Vector Store Configuration - Qdrant connection and operation settings
 */
export const VectorStoreConfigSchema = z.object({
  // Qdrant connection
  url: z.string().describe('Qdrant server URL'),
  apiKey: z.string().optional().describe('Qdrant API key (optional for local)'),
  timeout: z.number().default(30000).describe('Request timeout in ms'),
  
  // Collection settings
  defaultCollection: z.string().default('agent_memory').describe('Default collection name'),
  vectorSize: z.number().default(1536).describe('Vector dimension size'),
  distance: z.enum(['Cosine', 'Euclidean', 'Dot']).default('Cosine').describe('Distance metric'),
  
  // Performance settings
  batchSize: z.number().default(100).describe('Batch operation size'),
  maxRetries: z.number().default(3).describe('Maximum retry attempts'),
  retryDelay: z.number().default(1000).describe('Retry delay in ms'),
  
  // Search settings
  searchLimit: z.number().default(10).describe('Default search result limit'),
  searchThreshold: z.number().default(0.7).describe('Similarity threshold'),
  
  // Monitoring
  enableMetrics: z.boolean().default(true).describe('Enable performance metrics'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info').describe('Log level'),
});

export type VectorStoreConfig = z.infer<typeof VectorStoreConfigSchema>;

/**
 * Memory Entry - Vector store record with metadata
 */
export const MemoryEntrySchema = z.object({
  id: z.string().describe('Unique entry identifier'),
  vector: z.array(z.number()).describe('Embedding vector'),
  
  // Content
  content: z.string().describe('Original text content'),
  contentType: z.enum(['thought', 'trace', 'observation', 'action']).describe('Content type'),
  
  // AIX Integration
  thoughtId: z.string().optional().describe('Associated thought unit ID'),
  traceId: z.string().optional().describe('Associated ReAct trace ID'),
  agentId: z.string().describe('Agent ID that created this memory'),
  sessionId: z.string().optional().describe('Session context'),
  
  // Data Lineage
  dataSourceId: z.string().optional().describe('Data source provenance'),
  trustLevel: z.enum(['unverified', 'low', 'medium', 'high', 'verified', 'authoritative']).optional().describe('Trust level'),
  trustScore: z.number().min(0).max(1).optional().describe('Numerical trust score'),
  
  // Temporal
  timestamp: z.number().describe('Creation timestamp'),
  expiresAt: z.number().optional().describe('Expiration timestamp'),
  
  // Search and classification
  tags: z.array(z.string()).default([]).describe('Classification tags'),
  category: z.string().optional().describe('Content category'),
  confidence: z.number().min(0).max(1).optional().describe('Confidence score'),
  
  // Relationships
  parentIds: z.array(z.string()).default([]).describe('Related parent entries'),
  childIds: z.array(z.string()).default([]).describe('Related child entries'),
  
  // Performance
  accessCount: z.number().default(0).describe('Access frequency'),
  lastAccessed: z.number().optional().describe('Last access timestamp'),
});

export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

/**
 * Search Request - Vector search parameters
 */
export const SearchRequestSchema = z.object({
  query: z.string().describe('Search query text'),
  vector: z.array(z.number()).optional().describe('Pre-computed query vector'),
  limit: z.number().default(10).describe('Maximum results'),
  threshold: z.number().default(0.7).describe('Similarity threshold'),
  
  // Filters
  agentId: z.string().optional().describe('Filter by agent ID'),
  sessionId: z.string().optional().describe('Filter by session ID'),
  contentType: z.enum(['thought', 'trace', 'observation', 'action']).optional().describe('Filter by content type'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  category: z.string().optional().describe('Filter by category'),
  trustLevel: z.enum(['unverified', 'low', 'medium', 'high', 'verified', 'authoritative']).optional().describe('Filter by trust level'),
  
  // Temporal filters
  after: z.number().optional().describe('Filter entries after timestamp'),
  before: z.number().optional().describe('Filter entries before timestamp'),
  
  // Search strategy
  searchStrategy: z.enum(['semantic', 'hybrid', 'keyword']).default('semantic').describe('Search strategy'),
  includeMetadata: z.boolean().default(true).describe('Include full metadata'),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

/**
 * Search Result - Vector search response
 */
export const SearchResultSchema = z.object({
  id: z.string().describe('Memory entry ID'),
  score: z.number().describe('Similarity score'),
  entry: MemoryEntrySchema.optional().describe('Full memory entry (if requested)'),
  highlights: z.array(z.string()).optional().describe('Search highlights'),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

/**
 * Performance Metrics - Vector store performance tracking
 */
export interface VectorStoreMetrics {
  // Operation counts
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  
  // Performance
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  
  // Storage
  totalVectors: number;
  totalCollections: number;
  storageSize: number;
  
  // Cache
  cacheHitRate: number;
  cacheSize: number;
  
  // Errors
  errorRate: number;
  lastError: string;
  lastErrorTime: number;
}

/**
 * Qdrant Vector Store - Main implementation
 */
export class QdrantVectorStore {
  private client: QdrantClient;
  private config: VectorStoreConfig;
  private metrics: VectorStoreMetrics;
  private operationLatencies: number[] = [];
  private isHealthy: boolean = false;
  private lastHealthCheck: number = 0;

  constructor(config: VectorStoreConfig) {
    const validatedConfig = VectorStoreConfigSchema.parse(config);
    this.config = validatedConfig;
    
    // Initialize Qdrant client
    this.client = new QdrantClient({
      url: this.config.url,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
    });

    // Initialize metrics
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      totalVectors: 0,
      totalCollections: 0,
      storageSize: 0,
      cacheHitRate: 0,
      cacheSize: 0,
      errorRate: 0,
      lastError: '',
      lastErrorTime: 0,
    };

    this.log('info', 'Qdrant Vector Store initialized', { config: this.config });
  }

  /**
   * Initialize the vector store and ensure collections exist
   */
  async initialize(): Promise<void> {
    try {
      await this.healthCheck();
      
      // Create default collection if it doesn't exist
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        c => c.name === this.config.defaultCollection
      );

      if (!collectionExists) {
        await this.createCollection(this.config.defaultCollection);
        this.log('info', `Created default collection: ${this.config.defaultCollection}`);
      }

      this.isHealthy = true;
      this.log('info', 'Vector store initialized successfully');
    } catch (error) {
      this.isHealthy = false;
      this.log('error', 'Failed to initialize vector store', { error });
      throw error;
    }
  }

  /**
   * Store a memory entry with vector embedding
   */
  async storeEntry(entry: MemoryEntry): Promise<string> {
    const startTime = Date.now();
    this.metrics.totalOperations++;

    try {
      const validatedEntry = MemoryEntrySchema.parse(entry);
      
      // Ensure collection exists
      await this.ensureCollection(this.config.defaultCollection);

      // Store in Qdrant
      await this.client.upsert(this.config.defaultCollection, {
        wait: true,
        points: [{
          id: validatedEntry.id,
          vector: validatedEntry.vector,
          payload: this.entryToPayload(validatedEntry),
        }],
      });

      // Update metrics
      this.updateMetrics(startTime, true);
      this.metrics.totalVectors++;

      this.log('debug', 'Memory entry stored', { id: validatedEntry.id, type: validatedEntry.contentType });
      return validatedEntry.id;

    } catch (error) {
      this.updateMetrics(startTime, false);
      this.log('error', 'Failed to store memory entry', { error, entry });
      throw new Error(`Failed to store memory entry: ${error.message}`);
    }
  }

  /**
   * Store multiple entries in batch
   */
  async storeBatch(entries: MemoryEntry[]): Promise<string[]> {
    const startTime = Date.now();
    this.metrics.totalOperations++;

    try {
      const validatedEntries = entries.map(entry => MemoryEntrySchema.parse(entry));
      
      // Ensure collection exists
      await this.ensureCollection(this.config.defaultCollection);

      // Process in batches
      const ids: string[] = [];
      for (let i = 0; i < validatedEntries.length; i += this.config.batchSize) {
        const batch = validatedEntries.slice(i, i + this.config.batchSize);
        
        const points = batch.map(entry => ({
          id: entry.id,
          vector: entry.vector,
          payload: this.entryToPayload(entry),
        }));

        await this.client.upsert(this.config.defaultCollection, {
          wait: true,
          points,
        });

        ids.push(...batch.map(e => e.id));
      }

      // Update metrics
      this.updateMetrics(startTime, true);
      this.metrics.totalVectors += entries.length;

      this.log('info', `Stored ${entries.length} memory entries in batch`);
      return ids;

    } catch (error) {
      this.updateMetrics(startTime, false);
      this.log('error', 'Failed to store batch entries', { error, count: entries.length });
      throw new Error(`Failed to store batch entries: ${error.message}`);
    }
  }

  /**
   * Search for similar memories
   */
  async search(request: SearchRequest): Promise<SearchResult[]> {
    const startTime = Date.now();
    this.metrics.totalOperations++;

    try {
      const validatedRequest = SearchRequestSchema.parse(request);
      
      // Ensure collection exists
      await this.ensureCollection(this.config.defaultCollection);

      // Generate query vector if not provided
      let queryVector = validatedRequest.vector;
      if (!queryVector) {
        // This would integrate with embedding service
        throw new Error('Query vector not provided - integration with embedding service needed');
      }

      // Build filter
      const filter = this.buildFilter(validatedRequest);

      // Perform search
      const searchResult = await this.client.search(this.config.defaultCollection, {
        vector: queryVector,
        limit: validatedRequest.limit,
        score_threshold: validatedRequest.threshold,
        filter,
        with_payload: validatedRequest.includeMetadata,
      });

      // Convert to search results
      const results: SearchResult[] = searchResult.map(hit => ({
        id: hit.id as string,
        score: hit.score,
        entry: hit.payload ? this.payloadToEntry(hit.payload) : undefined,
      }));

      // Update metrics
      this.updateMetrics(startTime, true);

      this.log('debug', 'Search completed', { 
        query: validatedRequest.query, 
        results: results.length,
        maxScore: Math.max(...results.map(r => r.score))
      });

      return results;

    } catch (error) {
      this.updateMetrics(startTime, false);
      this.log('error', 'Search failed', { error, request });
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Retrieve a specific memory entry by ID
   */
  async getEntry(id: string): Promise<MemoryEntry | null> {
    const startTime = Date.now();
    this.metrics.totalOperations++;

    try {
      const result = await this.client.retrieve(this.config.defaultCollection, {
        ids: [id],
        with_payload: true,
        with_vector: true,
      });

      if (result.length === 0) {
        this.updateMetrics(startTime, true);
        return null;
      }

      const entry = this.payloadToEntry(result[0].payload!);
      entry.vector = result[0].vector as number[];

      // Update access metrics
      await this.updateAccessCount(id);

      this.updateMetrics(startTime, true);
      this.log('debug', 'Memory entry retrieved', { id });

      return entry;

    } catch (error) {
      this.updateMetrics(startTime, false);
      this.log('error', 'Failed to retrieve entry', { error, id });
      throw new Error(`Failed to retrieve entry: ${error.message}`);
    }
  }

  /**
   * Update an existing memory entry
   */
  async updateEntry(id: string, updates: Partial<MemoryEntry>): Promise<void> {
    const startTime = Date.now();
    this.metrics.totalOperations++;

    try {
      // Get existing entry
      const existing = await this.getEntry(id);
      if (!existing) {
        throw new Error(`Memory entry not found: ${id}`);
      }

      // Merge updates
      const updated = { ...existing, ...updates };

      // Update in Qdrant
      await this.client.upsert(this.config.defaultCollection, {
        wait: true,
        points: [{
          id,
          vector: updated.vector,
          payload: this.entryToPayload(updated),
        }],
      });

      this.updateMetrics(startTime, true);
      this.log('debug', 'Memory entry updated', { id });

    } catch (error) {
      this.updateMetrics(startTime, false);
      this.log('error', 'Failed to update entry', { error, id });
      throw new Error(`Failed to update entry: ${error.message}`);
    }
  }

  /**
   * Delete a memory entry
   */
  async deleteEntry(id: string): Promise<void> {
    const startTime = Date.now();
    this.metrics.totalOperations++;

    try {
      await this.client.delete(this.config.defaultCollection, {
        wait: true,
        points: [id],
      });

      this.metrics.totalVectors = Math.max(0, this.metrics.totalVectors - 1);
      this.updateMetrics(startTime, true);
      this.log('debug', 'Memory entry deleted', { id });

    } catch (error) {
      this.updateMetrics(startTime, false);
      this.log('error', 'Failed to delete entry', { error, id });
      throw new Error(`Failed to delete entry: ${error.message}`);
    }
  }

  /**
   * Create a new collection
   */
  async createCollection(name: string, vectorSize?: number): Promise<void> {
    try {
      await this.client.createCollection(name, {
        vectors: {
          size: vectorSize || this.config.vectorSize,
          distance: this.config.distance,
        },
      });

      this.metrics.totalCollections++;
      this.log('info', `Collection created: ${name}`);

    } catch (error) {
      this.log('error', 'Failed to create collection', { error, name });
      throw new Error(`Failed to create collection: ${error.message}`);
    }
  }

  /**
   * Delete a collection
   */
  async deleteCollection(name: string): Promise<void> {
    try {
      await this.client.deleteCollection(name);
      this.metrics.totalCollections = Math.max(0, this.metrics.totalCollections - 1);
      this.log('info', `Collection deleted: ${name}`);

    } catch (error) {
      this.log('error', 'Failed to delete collection', { error, name });
      throw new Error(`Failed to delete collection: ${error.message}`);
    }
  }

  /**
   * Get collection information
   */
  async getCollectionInfo(name: string): Promise<any> {
    try {
      return await this.client.getCollection(name);
    } catch (error) {
      this.log('error', 'Failed to get collection info', { error, name });
      throw new Error(`Failed to get collection info: ${error.message}`);
    }
  }

  /**
   * List all collections
   */
  async listCollections(): Promise<string[]> {
    try {
      const collections = await this.client.getCollections();
      return collections.collections.map(c => c.name);
    } catch (error) {
      this.log('error', 'Failed to list collections', { error });
      throw new Error(`Failed to list collections: ${error.message}`);
    }
  }

  /**
   * Perform health check on Qdrant connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.healthCheck();
      this.isHealthy = true;
      this.lastHealthCheck = Date.now();
      return true;
    } catch (error) {
      this.isHealthy = false;
      this.log('error', 'Health check failed', { error });
      return false;
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): VectorStoreMetrics {
    // Calculate percentiles
    const sortedLatencies = [...this.operationLatencies].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p99Index = Math.floor(sortedLatencies.length * 0.99);

    return {
      ...this.metrics,
      p95Latency: sortedLatencies[p95Index] || 0,
      p99Latency: sortedLatencies[p99Index] || 0,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      totalVectors: 0,
      totalCollections: 0,
      storageSize: 0,
      cacheHitRate: 0,
      cacheSize: 0,
      errorRate: 0,
      lastError: '',
      lastErrorTime: 0,
    };
    this.operationLatencies = [];
  }

  /**
   * Close the vector store connection
   */
  async close(): Promise<void> {
    this.log('info', 'Vector store connection closed');
  }

  // Private helper methods

  /**
   * Ensure collection exists
   */
  private async ensureCollection(name: string): Promise<void> {
    try {
      await this.client.getCollection(name);
    } catch (error) {
      // Collection doesn't exist, create it
      await this.createCollection(name);
    }
  }

  /**
   * Convert memory entry to Qdrant payload
   */
  private entryToPayload(entry: MemoryEntry): any {
    const { vector, ...payload } = entry;
    return payload;
  }

  /**
   * Convert Qdrant payload to memory entry
   */
  private payloadToEntry(payload: any): MemoryEntry {
    return MemoryEntrySchema.parse(payload);
  }

  /**
   * Build Qdrant filter from search request
   */
  private buildFilter(request: SearchRequest): any {
    const conditions: any[] = [];

    if (request.agentId) {
      conditions.push({ key: 'agentId', match: { value: request.agentId } });
    }

    if (request.sessionId) {
      conditions.push({ key: 'sessionId', match: { value: request.sessionId } });
    }

    if (request.contentType) {
      conditions.push({ key: 'contentType', match: { value: request.contentType } });
    }

    if (request.tags && request.tags.length > 0) {
      conditions.push({ key: 'tags', match: { any: request.tags } });
    }

    if (request.category) {
      conditions.push({ key: 'category', match: { value: request.category } });
    }

    if (request.trustLevel) {
      conditions.push({ key: 'trustLevel', match: { value: request.trustLevel } });
    }

    if (request.after) {
      conditions.push({ key: 'timestamp', range: { gte: request.after } });
    }

    if (request.before) {
      conditions.push({ key: 'timestamp', range: { lte: request.before } });
    }

    return conditions.length > 0 ? { must: conditions } : undefined;
  }

  /**
   * Update access count for an entry
   */
  private async updateAccessCount(id: string): Promise<void> {
    try {
      // This would require a more complex payload update in Qdrant
      // For now, we'll skip this to keep the implementation simple
    } catch (error) {
      // Ignore access count update failures
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(startTime: number, success: boolean): void {
    const latency = Date.now() - startTime;
    this.operationLatencies.push(latency);

    // Keep only last 1000 latencies for percentile calculation
    if (this.operationLatencies.length > 1000) {
      this.operationLatencies = this.operationLatencies.slice(-1000);
    }

    this.metrics.totalOperations++;
    
    if (success) {
      this.metrics.successfulOperations++;
    } else {
      this.metrics.failedOperations++;
    }

    // Update average latency
    const totalLatency = this.operationLatencies.reduce((sum, l) => sum + l, 0);
    this.metrics.averageLatency = totalLatency / this.operationLatencies.length;

    // Update error rate
    this.metrics.errorRate = this.metrics.failedOperations / this.metrics.totalOperations;
  }

  /**
   * Log message with configured level
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    switch (level) {
      case 'debug':
        console.debug('[QdrantVectorStore]', logData);
        break;
      case 'info':
        console.info('[QdrantVectorStore]', logData);
        break;
      case 'warn':
        console.warn('[QdrantVectorStore]', logData);
        break;
      case 'error':
        console.error('[QdrantVectorStore]', logData);
        this.metrics.lastError = message;
        this.metrics.lastErrorTime = Date.now();
        break;
    }
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.config.logLevel] || 1;
    const messageLevel = levels[level] || 1;
    return messageLevel >= currentLevel;
  }
}

/**
 * Vector Store Factory - Create configured vector store instances
 */
export class VectorStoreFactory {
  /**
   * Create vector store from environment variables
   */
  static fromEnvironment(): QdrantVectorStore {
    const config: VectorStoreConfig = {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
      defaultCollection: process.env.QDRANT_DEFAULT_COLLECTION || 'agent_memory',
      vectorSize: parseInt(process.env.QDRANT_VECTOR_SIZE || '1536'),
      distance: (process.env.QDRANT_DISTANCE as any) || 'Cosine',
      batchSize: parseInt(process.env.QDRANT_BATCH_SIZE || '100'),
      maxRetries: parseInt(process.env.QDRANT_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.QDRANT_RETRY_DELAY || '1000'),
      searchLimit: parseInt(process.env.QDRANT_SEARCH_LIMIT || '10'),
      searchThreshold: parseFloat(process.env.QDRANT_SEARCH_THRESHOLD || '0.7'),
      enableMetrics: process.env.QDRANT_ENABLE_METRICS !== 'false',
      logLevel: (process.env.QDRANT_LOG_LEVEL as any) || 'info',
    };

    return new QdrantVectorStore(config);
  }

  /**
   * Create local development vector store
   */
  static createLocal(): QdrantVectorStore {
    return new QdrantVectorStore({
      url: 'http://localhost:6333',
      defaultCollection: 'dev_agent_memory',
      vectorSize: 1536,
      distance: 'Cosine',
      batchSize: 50,
      enableMetrics: true,
      logLevel: 'debug',
    });
  }

  /**
   * Create production vector store
   */
  static createProduction(config: Partial<VectorStoreConfig>): QdrantVectorStore {
    return new QdrantVectorStore({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY,
      defaultCollection: 'prod_agent_memory',
      vectorSize: 1536,
      distance: 'Cosine',
      batchSize: 100,
      maxRetries: 5,
      retryDelay: 2000,
      searchLimit: 20,
      searchThreshold: 0.8,
      enableMetrics: true,
      logLevel: 'warn',
      ...config,
    });
  }
}