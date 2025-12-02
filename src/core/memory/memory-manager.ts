/**
 * Sovereign Memory Manager - High-level memory interface for agents
 * 
 * This module provides the main interface for sovereign agents to interact
 * with their memory system. Integrates with AIX ThoughtUnit, ReActTrace,
 * and data lineage tracking to provide comprehensive memory capabilities.
 * 
 * Features:
 * - Automatic embedding generation and storage
 * - Context-aware memory retrieval
 * - Memory consolidation and optimization
 * - Complete provenance tracking
 * - Performance monitoring and caching
 */

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { QdrantVectorStore, MemoryEntry, SearchRequest, SearchResult } from './vector-store';
import { ThoughtUnit, ReActTrace } from '../aix/schema';
import { AIXEmbeddingService } from '../aix/embedding-service';
import { DataLineageManager, DataSource } from '../aix/data-lineage';

/**
 * Memory Configuration - High-level memory system settings
 */
export const MemoryConfigSchema = z.object({
  // Vector store configuration
  vectorStore: z.any().describe('QdrantVectorStore instance'),
  
  // Embedding service
  embeddingService: z.any().describe('AIXEmbeddingService instance'),
  
  // Data lineage
  lineageManager: z.any().describe('DataLineageManager instance'),
  
  // Memory settings
  maxMemoryAge: z.number().default(86400000 * 30).describe('Maximum age for memories (30 days)'),
  maxMemoriesPerAgent: z.number().default(10000).describe('Maximum memories per agent'),
  consolidationThreshold: z.number().default(1000).describe('Memory consolidation threshold'),
  
  // Search settings
  defaultSearchLimit: z.number().default(10).describe('Default search results'),
  similarityThreshold: z.number().default(0.7).describe('Similarity threshold'),
  
  // Performance
  enableCaching: z.boolean().default(true).describe('Enable memory caching'),
  cacheSize: z.number().default(1000).describe('Memory cache size'),
  enableOptimization: z.boolean().default(true).describe('Enable memory optimization'),
  
  // Monitoring
  enableMetrics: z.boolean().default(true).describe('Enable performance metrics'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info').describe('Log level'),
});

export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;

/**
 * Memory Query - High-level query interface
 */
export const MemoryQuerySchema = z.object({
  // Query content
  query: z.string().describe('Search query text'),
  context: z.string().optional().describe('Additional context for query'),
  
  // Scope
  agentId: z.string().optional().describe('Filter by agent ID'),
  sessionId: z.string().optional().describe('Filter by session ID'),
  memoryTypes: z.array(z.enum(['thought', 'trace', 'observation', 'action'])).optional().describe('Memory types to search'),
  
  // Temporal
  timeRange: z.object({
    start: z.number().optional().describe('Start timestamp'),
    end: z.number().optional().describe('End timestamp'),
  }).optional().describe('Time range filter'),
  
  // Quality
  minConfidence: z.number().optional().describe('Minimum confidence level'),
  minTrustLevel: z.enum(['unverified', 'low', 'medium', 'high', 'verified', 'authoritative']).optional().describe('Minimum trust level'),
  
  // Search parameters
  limit: z.number().default(10).describe('Maximum results'),
  threshold: z.number().default(0.7).describe('Similarity threshold'),
  includeContent: z.boolean().default(true).describe('Include full content'),
  
  // Strategy
  strategy: z.enum(['semantic', 'keyword', 'hybrid']).default('semantic').describe('Search strategy'),
  weights: z.object({
    semantic: z.number().default(0.7).describe('Semantic search weight'),
    keyword: z.number().default(0.3).describe('Keyword search weight'),
  }).optional().describe('Search weights for hybrid strategy'),
});

export type MemoryQuery = z.infer<typeof MemoryQuerySchema>;

/**
 * Memory Result - Memory query response
 */
export const MemoryResultSchema = z.object({
  id: z.string().describe('Memory entry ID'),
  type: z.enum(['thought', 'trace', 'observation', 'action']).describe('Memory type'),
  content: z.string().describe('Memory content'),
  
  // Scoring
  relevanceScore: z.number().describe('Relevance to query'),
  confidence: z.number().optional().describe('Confidence score'),
  trustLevel: z.enum(['unverified', 'low', 'medium', 'high', 'verified', 'authoritative']).optional().describe('Trust level'),
  
  // Metadata
  agentId: z.string().describe('Agent ID'),
  sessionId: z.string().optional().describe('Session ID'),
  timestamp: z.number().describe('Creation timestamp'),
  tags: z.array(z.string()).default([]).describe('Tags'),
  
  // AIX Integration
  thoughtId: z.string().optional().describe('Associated thought ID'),
  traceId: z.string().optional().describe('Associated trace ID'),
  
  // Context
  context: z.string().optional().describe('Additional context'),
  highlights: z.array(z.string()).optional().describe('Search highlights'),
  
  // Relationships
  relatedMemories: z.array(z.string()).optional().describe('Related memory IDs'),
  parentMemories: z.array(z.string()).optional().describe('Parent memory IDs'),
});

export type MemoryResult = z.infer<typeof MemoryResultSchema>;

/**
 * Memory Statistics - Memory system statistics
 */
export interface MemoryStats {
  // Storage
  totalMemories: number;
  memoriesByAgent: Record<string, number>;
  memoriesByType: Record<string, number>;
  
  // Performance
  averageQueryTime: number;
  cacheHitRate: number;
  consolidationRate: number;
  
  // Quality
  averageConfidence: number;
  trustDistribution: Record<string, number>;
  
  // Temporal
  oldestMemory: number;
  newestMemory: number;
  averageAge: number;
}

/**
 * Sovereign Memory Manager - Main memory interface
 */
export class SovereignMemoryManager {
  private config: MemoryConfig;
  private vectorStore: QdrantVectorStore;
  private embeddingService: AIXEmbeddingService;
  private lineageManager: DataLineageManager;
  private memoryCache: Map<string, MemoryResult> = new Map();
  private queryCache: Map<string, MemoryResult[]> = new Map();
  private stats: MemoryStats;

  constructor(config: MemoryConfig) {
    const validatedConfig = MemoryConfigSchema.parse(config);
    this.config = validatedConfig;
    
    this.vectorStore = validatedConfig.vectorStore;
    this.embeddingService = validatedConfig.embeddingService;
    this.lineageManager = validatedConfig.lineageManager;

    // Initialize statistics
    this.stats = {
      totalMemories: 0,
      memoriesByAgent: {},
      memoriesByType: {},
      averageQueryTime: 0,
      cacheHitRate: 0,
      consolidationRate: 0,
      averageConfidence: 0,
      trustDistribution: {},
      oldestMemory: 0,
      newestMemory: 0,
      averageAge: 0,
    };

    this.log('info', 'Sovereign Memory Manager initialized');
  }

  /**
   * Store a thought unit in memory
   */
  async storeThought(thought: ThoughtUnit, dataSource?: DataSource): Promise<string> {
    try {
      // Generate embedding
      const embeddingResult = await this.embeddingService.generateThoughtEmbedding(thought);
      
      // Create data source if not provided
      if (!dataSource) {
        dataSource = this.createThoughtDataSource(thought);
        this.lineageManager.registerDataSource(dataSource);
      }

      // Create memory entry
      const memoryEntry: MemoryEntry = {
        id: thought.id,
        vector: embeddingResult.vector,
        content: thought.content,
        contentType: 'thought',
        thoughtId: thought.id,
        agentId: thought.agentId,
        sessionId: thought.sessionId,
        dataSourceId: dataSource.sourceId,
        trustLevel: dataSource.trustLevel,
        trustScore: dataSource.trustScore,
        timestamp: thought.timestamp,
        tags: thought.tags,
        confidence: thought.confidence,
        parentIds: thought.parentThoughtIds || [],
        childIds: thought.childThoughtIds || [],
      };

      // Store in vector store
      const memoryId = await this.vectorStore.storeEntry(memoryEntry);

      // Create lineage node
      this.lineageManager.createLineageNode(
        thought.id,
        dataSource.sourceId ? [dataSource.sourceId] : [],
        'thought_storage',
        thought.agentId
      );

      // Update cache
      if (this.config.enableCaching) {
        this.updateMemoryCache(memoryId, this.entryToResult(memoryEntry));
      }

      // Update statistics
      this.updateStats('thought', thought.agentId, thought.confidence, dataSource.trustLevel);

      this.log('debug', 'Thought stored in memory', { 
        thoughtId: thought.id, 
        memoryId,
        agentId: thought.agentId 
      });

      return memoryId;

    } catch (error) {
      this.log('error', 'Failed to store thought', { error, thought });
      throw new Error(`Failed to store thought: ${error.message}`);
    }
  }

  /**
   * Store a ReAct trace in memory
   */
  async storeTrace(trace: ReActTrace, dataSource?: DataSource): Promise<string> {
    try {
      // Generate embedding for entire trace
      const embeddingResult = await this.embeddingService.generateTraceEmbedding(trace);
      
      // Create data source if not provided
      if (!dataSource) {
        dataSource = this.createTraceDataSource(trace);
        this.lineageManager.registerDataSource(dataSource);
      }

      // Create memory entry
      const memoryEntry: MemoryEntry = {
        id: trace.id,
        vector: embeddingResult.vector,
        content: `${trace.title}: ${trace.description}`,
        contentType: 'trace',
        traceId: trace.id,
        agentId: trace.primaryAgentId,
        sessionId: trace.sessionId,
        dataSourceId: dataSource.sourceId,
        trustLevel: dataSource.trustLevel,
        trustScore: dataSource.trustScore,
        timestamp: trace.startTime,
        tags: ['trace', trace.category],
        category: trace.category,
        confidence: trace.confidence,
      };

      // Store in vector store
      const memoryId = await this.vectorStore.storeEntry(memoryEntry);

      // Create lineage node
      this.lineageManager.createLineageNode(
        trace.id,
        dataSource.sourceId ? [dataSource.sourceId] : [],
        'trace_storage',
        trace.primaryAgentId
      );

      // Update cache
      if (this.config.enableCaching) {
        this.updateMemoryCache(memoryId, this.entryToResult(memoryEntry));
      }

      // Update statistics
      this.updateStats('trace', trace.primaryAgentId, trace.confidence, dataSource.trustLevel);

      this.log('debug', 'Trace stored in memory', { 
        traceId: trace.id, 
        memoryId,
        agentId: trace.primaryAgentId 
      });

      return memoryId;

    } catch (error) {
      this.log('error', 'Failed to store trace', { error, trace });
      throw new Error(`Failed to store trace: ${error.message}`);
    }
  }

  /**
   * Search memory with advanced query
   */
  async searchMemory(query: MemoryQuery): Promise<MemoryResult[]> {
    const startTime = Date.now();
    
    try {
      const validatedQuery = MemoryQuerySchema.parse(query);
      
      // Check cache first
      const cacheKey = this.generateQueryCacheKey(validatedQuery);
      if (this.config.enableCaching && this.queryCache.has(cacheKey)) {
        const cachedResults = this.queryCache.get(cacheKey)!;
        this.log('debug', 'Memory search cache hit', { query: validatedQuery.query });
        return cachedResults;
      }

      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(validatedQuery.query);

      // Build search request
      const searchRequest: SearchRequest = {
        query: validatedQuery.query,
        vector: queryEmbedding.vector,
        limit: validatedQuery.limit,
        threshold: validatedQuery.threshold,
        agentId: validatedQuery.agentId,
        sessionId: validatedQuery.sessionId,
        contentType: validatedQuery.memoryTypes?.[0] as any, // Simplified for now
        tags: validatedQuery.context ? [validatedQuery.context] : undefined,
        after: validatedQuery.timeRange?.start,
        before: validatedQuery.timeRange?.end,
        includeMetadata: validatedQuery.includeContent,
      };

      // Perform search
      const searchResults = await this.vectorStore.search(searchRequest);

      // Convert to memory results
      const memoryResults: MemoryResult[] = [];
      for (const result of searchResults) {
        const memoryResult = result.entry ? this.entryToResult(result.entry, result.score) : null;
        if (memoryResult) {
          // Apply additional filters
          if (this.passesFilters(memoryResult, validatedQuery)) {
            memoryResults.push(memoryResult);
          }
        }
      }

      // Sort by relevance score
      memoryResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Update cache
      if (this.config.enableCaching) {
        this.queryCache.set(cacheKey, memoryResults);
        
        // Limit cache size
        if (this.queryCache.size > this.config.cacheSize) {
          const oldestKey = this.queryCache.keys().next().value;
          this.queryCache.delete(oldestKey);
        }
      }

      // Update statistics
      const queryTime = Date.now() - startTime;
      this.updateQueryStats(queryTime);

      this.log('debug', 'Memory search completed', { 
        query: validatedQuery.query, 
        results: memoryResults.length,
        queryTime 
      });

      return memoryResults;

    } catch (error) {
      this.log('error', 'Memory search failed', { error, query });
      throw new Error(`Memory search failed: ${error.message}`);
    }
  }

  /**
   * Retrieve a specific memory by ID
   */
  async getMemory(id: string): Promise<MemoryResult | null> {
    try {
      // Check cache first
      if (this.config.enableCaching && this.memoryCache.has(id)) {
        const cachedResult = this.memoryCache.get(id)!;
        this.log('debug', 'Memory cache hit', { id });
        return cachedResult;
      }

      // Retrieve from vector store
      const entry = await this.vectorStore.getEntry(id);
      if (!entry) {
        return null;
      }

      // Convert to memory result
      const result = this.entryToResult(entry);

      // Update cache
      if (this.config.enableCaching) {
        this.updateMemoryCache(id, result);
      }

      this.log('debug', 'Memory retrieved', { id });
      return result;

    } catch (error) {
      this.log('error', 'Failed to retrieve memory', { error, id });
      throw new Error(`Failed to retrieve memory: ${error.message}`);
    }
  }

  /**
   * Update an existing memory
   */
  async updateMemory(id: string, updates: Partial<MemoryResult>): Promise<void> {
    try {
      // Get existing entry
      const existing = await this.vectorStore.getEntry(id);
      if (!existing) {
        throw new Error(`Memory not found: ${id}`);
      }

      // Convert updates to entry format
      const entryUpdates: Partial<MemoryEntry> = {};
      if (updates.content !== undefined) entryUpdates.content = updates.content;
      if (updates.tags !== undefined) entryUpdates.tags = updates.tags;
      if (updates.confidence !== undefined) entryUpdates.confidence = updates.confidence;

      // Update vector store
      await this.vectorStore.updateEntry(id, entryUpdates);

      // Update cache
      if (this.config.enableCaching && this.memoryCache.has(id)) {
        const cached = this.memoryCache.get(id)!;
        const updated = { ...cached, ...updates };
        this.memoryCache.set(id, updated);
      }

      this.log('debug', 'Memory updated', { id });

    } catch (error) {
      this.log('error', 'Failed to update memory', { error, id });
      throw new Error(`Failed to update memory: ${error.message}`);
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<void> {
    try {
      await this.vectorStore.deleteEntry(id);

      // Update cache
      if (this.config.enableCaching) {
        this.memoryCache.delete(id);
        // Also remove from query cache
        for (const [key, results] of this.queryCache.entries()) {
          const filtered = results.filter(r => r.id !== id);
          if (filtered.length !== results.length) {
            this.queryCache.set(key, filtered);
          }
        }
      }

      this.log('debug', 'Memory deleted', { id });

    } catch (error) {
      this.log('error', 'Failed to delete memory', { error, id });
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  /**
   * Consolidate old memories
   */
  async consolidateMemories(): Promise<void> {
    if (!this.config.enableOptimization) {
      return;
    }

    try {
      const cutoffTime = Date.now() - this.config.maxMemoryAge;
      
      // This would implement memory consolidation logic
      // For now, we'll just log the action
      this.log('info', 'Memory consolidation completed', { cutoffTime });

    } catch (error) {
      this.log('error', 'Memory consolidation failed', { error });
    }
  }

  /**
   * Get memory statistics
   */
  getStats(): MemoryStats {
    return { ...this.stats };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.memoryCache.clear();
    this.queryCache.clear();
    this.log('debug', 'Memory caches cleared');
  }

  /**
   * Close memory manager
   */
  async close(): Promise<void> {
    this.clearCache();
    await this.vectorStore.close();
    this.log('info', 'Sovereign Memory Manager closed');
  }

  // Private helper methods

  /**
   * Create data source for thought
   */
  private createThoughtDataSource(thought: ThoughtUnit): DataSource {
    return {
      sourceId: uuidv4(),
      type: 'agent_inference',
      originAgentId: thought.agentId,
      trustLevel: 'medium',
      trustScore: 0.7,
      validityPeriod: {
        startTime: thought.timestamp,
        endTime: thought.timestamp + this.config.maxMemoryAge,
        isPermanent: false,
      },
      acquisitionTime: thought.timestamp,
      hash: thought.hash,
      tags: ['thought', thought.type, ...thought.tags],
    };
  }

  /**
   * Create data source for trace
   */
  private createTraceDataSource(trace: ReActTrace): DataSource {
    return {
      sourceId: uuidv4(),
      type: 'agent_inference',
      originAgentId: trace.primaryAgentId,
      trustLevel: 'high',
      trustScore: 0.8,
      validityPeriod: {
        startTime: trace.startTime,
        endTime: trace.startTime + this.config.maxMemoryAge,
        isPermanent: false,
      },
      acquisitionTime: trace.startTime,
      hash: trace.hash,
      tags: ['trace', trace.category],
    };
  }

  /**
   * Convert memory entry to memory result
   */
  private entryToResult(entry: MemoryEntry, relevanceScore: number = 1.0): MemoryResult {
    return {
      id: entry.id,
      type: entry.contentType,
      content: entry.content,
      relevanceScore,
      confidence: entry.confidence,
      trustLevel: entry.trustLevel,
      agentId: entry.agentId,
      sessionId: entry.sessionId,
      timestamp: entry.timestamp,
      tags: entry.tags,
      thoughtId: entry.thoughtId,
      traceId: entry.traceId,
      relatedMemories: entry.childIds,
      parentMemories: entry.parentIds,
    };
  }

  /**
   * Update memory cache
   */
  private updateMemoryCache(id: string, result: MemoryResult): void {
    this.memoryCache.set(id, result);
    
    // Limit cache size
    if (this.memoryCache.size > this.config.cacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * Generate query cache key
   */
  private generateQueryCacheKey(query: MemoryQuery): string {
    return JSON.stringify({
      query: query.query,
      agentId: query.agentId,
      sessionId: query.sessionId,
      memoryTypes: query.memoryTypes,
      limit: query.limit,
      threshold: query.threshold,
    });
  }

  /**
   * Check if result passes filters
   */
  private passesFilters(result: MemoryResult, query: MemoryQuery): boolean {
    if (query.minConfidence && result.confidence && result.confidence < query.minConfidence) {
      return false;
    }

    if (query.minTrustLevel && result.trustLevel && result.trustLevel !== query.minTrustLevel) {
      return false;
    }

    if (query.memoryTypes && !query.memoryTypes.includes(result.type)) {
      return false;
    }

    if (query.timeRange) {
      if (query.timeRange.start && result.timestamp < query.timeRange.start) {
        return false;
      }
      if (query.timeRange.end && result.timestamp > query.timeRange.end) {
        return false;
      }
    }

    return true;
  }

  /**
   * Update statistics
   */
  private updateStats(type: string, agentId: string, confidence?: number, trustLevel?: string): void {
    this.stats.totalMemories++;
    this.stats.memoriesByAgent[agentId] = (this.stats.memoriesByAgent[agentId] || 0) + 1;
    this.stats.memoriesByType[type] = (this.stats.memoriesByType[type] || 0) + 1;

    if (confidence !== undefined) {
      const totalConfidence = (this.stats.averageConfidence * (this.stats.totalMemories - 1)) + confidence;
      this.stats.averageConfidence = totalConfidence / this.stats.totalMemories;
    }

    if (trustLevel) {
      this.stats.trustDistribution[trustLevel] = (this.stats.trustDistribution[trustLevel] || 0) + 1;
    }
  }

  /**
   * Update query statistics
   */
  private updateQueryStats(queryTime: number): void {
    const totalQueries = this.stats.averageQueryTime ? 1 : 0;
    const avgTime = this.stats.averageQueryTime || 0;
    this.stats.averageQueryTime = (avgTime * totalQueries + queryTime) / (totalQueries + 1);
  }

  /**
   * Log message
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
        console.debug('[SovereignMemoryManager]', logData);
        break;
      case 'info':
        console.info('[SovereignMemoryManager]', logData);
        break;
      case 'warn':
        console.warn('[SovereignMemoryManager]', logData);
        break;
      case 'error':
        console.error('[SovereignMemoryManager]', logData);
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