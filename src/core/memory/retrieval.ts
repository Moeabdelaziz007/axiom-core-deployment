/**
 * Memory Retrieval with Context - Main Implementation
 * 
 * This module provides sophisticated memory retrieval capabilities for sovereign agents,
 * including semantic search, context-aware ranking, trust-based filtering,
 * and performance optimization with intelligent caching.
 * 
 * Features:
 * - Multiple retrieval strategies (semantic, keyword, hybrid, temporal)
 * - Context-aware ranking and scoring algorithms
 * - Trust-based filtering using data lineage
 * - Temporal awareness and recency weighting
 * - Performance optimization with intelligent caching
 * - Comprehensive error handling and recovery
 * - Audit trail for all retrieval operations
 */

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import {
  RetrievalStrategy,
  RetrievalQuery,
  RetrievalResult,
  RetrievalResponse,
  RetrievalConfig,
  RetrievalStats,
  RetrievalEvent,
  RetrievalFeedback,
  RetrievalQuerySchema,
  RetrievalResponseSchema,
  RetrievalEventSchema,
  RetrievalFeedbackSchema,
} from './retrieval-types';
import { QdrantVectorStore, MemoryEntry, SearchRequest, SearchResult } from './vector-store';
import { SovereignMemoryManager, MemoryResult } from './memory-manager';
import { MemoryCache } from './memory-cache';
import { DataLineageManager, DataSource, TrustLevel } from '../aix/data-lineage';
import { AIXEmbeddingService } from '../aix/embedding-service';
import { ThoughtUnit, ReActTrace } from '../aix/schema';

/**
 * Memory Retrieval Manager - Main class for advanced memory retrieval
 */
export class MemoryRetrievalManager {
  private config: RetrievalConfig;
  private vectorStore: QdrantVectorStore;
  private memoryManager: SovereignMemoryManager;
  private lineageManager?: DataLineageManager;
  private embeddingService: AIXEmbeddingService;
  private resultCache: MemoryCache<RetrievalResponse>;
  private queryCache: MemoryCache<RetrievalResult[]>;
  private auditTrail: RetrievalEvent[] = [];
  private stats: RetrievalStats;
  private feedbackMap: Map<string, RetrievalFeedback> = new Map();

  constructor(config: RetrievalConfig) {
    const validatedConfig = RetrievalConfigSchema.parse(config);
    this.config = validatedConfig;
    
    this.vectorStore = validatedConfig.vectorStore;
    this.memoryManager = validatedConfig.memoryManager;
    this.lineageManager = validatedConfig.lineageManager;
    
    // Initialize embedding service
    this.embeddingService = new AIXEmbeddingService({
      model: 'text-embedding-ada-002',
      dimensions: 1536,
    });
    
    // Initialize caches
    this.resultCache = new MemoryCache<RetrievalResponse>({
      maxSize: this.config.cacheSize,
      ttl: this.config.cacheTTL,
      enableStats: this.config.enableMetrics,
    });
    
    this.queryCache = new MemoryCache<RetrievalResult[]>({
      maxSize: this.config.cacheSize * 2,
      ttl: this.config.cacheTTL / 2,
      enableStats: this.config.enableMetrics,
    });
    
    // Initialize statistics
    this.stats = {
      totalQueries: 0,
      queriesByStrategy: {},
      queriesByPurpose: {},
      averageQueryTime: 0,
      p95QueryTime: 0,
      p99QueryTime: 0,
      cacheHitRate: 0,
      cacheSize: 0,
      cacheEvictions: 0,
      averageResults: 0,
      averageRelevance: 0,
      zeroResultQueries: 0,
      errorRate: 0,
      lastError: '',
      lastErrorTime: 0,
      queriesLastHour: 0,
      queriesLastDay: 0,
      queriesLastWeek: 0,
      memoryUsage: 0,
      rerankingUsage: 0,
      diversityUsage: 0,
      explanationUsage: 0,
    };
    
    this.log('info', 'Memory Retrieval Manager initialized', { config: validatedConfig });
  }

  /**
   * Search memory with advanced query capabilities
   */
  async search(query: RetrievalQuery): Promise<RetrievalResponse> {
    const startTime = Date.now();
    const queryId = query.queryId || uuidv4();
    
    try {
      const validatedQuery = RetrievalQuerySchema.parse(query);
      
      // Check cache first
      if (validatedQuery.useCache && this.config.enableCache) {
        const cacheKey = this.generateCacheKey(validatedQuery);
        const cached = this.resultCache.get(cacheKey);
        if (cached) {
          this.updateStats('cache_hit', startTime, cached.results.length, validatedQuery.strategy);
          this.log('debug', 'Result cache hit', { queryId, query: validatedQuery.query });
          return { ...cached, queryId };
        }
      }
      
      // Determine strategy
      const strategy = validatedQuery.strategy || this.config.defaultStrategy;
      
      // Execute search based on strategy
      let results: RetrievalResult[];
      switch (strategy) {
        case 'semantic':
          results = await this.semanticSearch(validatedQuery);
          break;
        case 'keyword':
          results = await this.keywordSearch(validatedQuery);
          break;
        case 'hybrid':
          results = await this.hybridSearch(validatedQuery);
          break;
        case 'temporal':
          results = await this.temporalSearch(validatedQuery);
          break;
        case 'contextual':
          results = await this.contextualSearch(validatedQuery);
          break;
        case 'trust_based':
          results = await this.trustBasedSearch(validatedQuery);
          break;
        case 'adaptive':
          results = await this.adaptiveSearch(validatedQuery);
          break;
        default:
          throw new Error(`Unknown retrieval strategy: ${strategy}`);
      }
      
      // Apply filters
      results = this.applyFilters(results, validatedQuery);
      
      // Apply ranking
      results = this.rankResults(results, validatedQuery);
      
      // Apply diversity if enabled
      if (validatedQuery.enableDiversity || this.config.enableDiversity) {
        results = this.applyDiversity(results, validatedQuery);
      }
      
      // Apply reranking if enabled
      if (validatedQuery.enableReranking || this.config.enableReranking) {
        results = await this.rerankResults(results, validatedQuery);
      }
      
      // Add explanations if enabled
      if (validatedQuery.enableExplanation || this.config.enableExplanation) {
        results = this.addExplanations(results, validatedQuery);
      }
      
      // Include related memories if requested
      if (validatedQuery.includeRelated) {
        results = await this.includeRelatedMemories(results, validatedQuery);
      }
      
      // Apply pagination
      const paginatedResults = this.applyPagination(results, validatedQuery);
      
      // Create response
      const response: RetrievalResponse = {
        results: paginatedResults,
        totalCount: results.length,
        hasMore: validatedQuery.offset + validatedQuery.limit < results.length,
        query: validatedQuery.query,
        strategy,
        queryId,
        queryTime: Date.now() - startTime,
        cacheHit: false,
        resultsProcessed: results.length,
        averageRelevance: this.calculateAverageRelevance(paginatedResults),
        relevanceDistribution: this.calculateRelevanceDistribution(paginatedResults),
        pagination: {
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
          nextPage: validatedQuery.offset + validatedQuery.limit < results.length 
            ? validatedQuery.offset + validatedQuery.limit 
            : undefined,
          prevPage: validatedQuery.offset > 0 ? validatedQuery.offset - validatedQuery.limit : undefined,
        },
        debug: {
          searchPath: [strategy],
          optimizations: this.getAppliedOptimizations(validatedQuery),
        },
      };
      
      // Cache result
      if (validatedQuery.useCache && this.config.enableCache) {
        const cacheKey = this.generateCacheKey(validatedQuery);
        this.resultCache.set(cacheKey, response);
      }
      
      // Update statistics
      this.updateStats('query', startTime, results.length, strategy);
      
      // Create audit event
      if (this.config.enableAuditTrail) {
        await this.createAuditEvent(validatedQuery, response, startTime);
      }
      
      this.log('debug', 'Search completed', {
        queryId,
        query: validatedQuery.query,
        strategy,
        results: paginatedResults.length,
        queryTime: response.queryTime,
      });
      
      return response;
      
    } catch (error) {
      const queryTime = Date.now() - startTime;
      this.updateStats('error', startTime, 0, query.strategy);
      
      this.log('error', 'Search failed', {
        queryId,
        query: query.query,
        error: error.message,
        queryTime,
      });
      
      throw new Error(`Memory search failed: ${error.message}`);
    }
  }

  /**
   * Get specific memory by ID
   */
  async getMemory(id: string, options: {
    includeContent?: boolean;
    includeRelated?: boolean;
    useCache?: boolean;
  } = {}): Promise<RetrievalResult | null> {
    try {
      const { includeContent = true, includeRelated = false, useCache = true } = options;
      
      // Check cache first
      if (useCache && this.config.enableCache) {
        const cached = this.queryCache.get(id);
        if (cached && cached.length > 0) {
          return cached[0];
        }
      }
      
      // Get from memory manager
      const memoryResult = await this.memoryManager.getMemory(id);
      if (!memoryResult) {
        return null;
      }
      
      // Convert to retrieval result
      const retrievalResult: RetrievalResult = {
        id: memoryResult.id,
        type: memoryResult.type,
        content: memoryResult.content,
        relevanceScore: 1.0,
        confidence: memoryResult.confidence,
        trustLevel: memoryResult.trustLevel,
        agentId: memoryResult.agentId,
        sessionId: memoryResult.sessionId,
        timestamp: memoryResult.timestamp,
        tags: memoryResult.tags,
        thoughtId: memoryResult.thoughtId,
        traceId: memoryResult.traceId,
        relatedMemories: memoryResult.relatedMemories,
        parentMemories: memoryResult.parentMemories,
      };
      
      // Include related memories if requested
      if (includeRelated && retrievalResult.relatedMemories) {
        retrievalResult.childMemories = await this.getRelatedMemories(retrievalResult.relatedMemories);
      }
      
      // Cache result
      if (useCache && this.config.enableCache) {
        this.queryCache.set(id, [retrievalResult]);
      }
      
      return retrievalResult;
      
    } catch (error) {
      this.log('error', 'Failed to get memory', { id, error: error.message });
      throw new Error(`Failed to get memory: ${error.message}`);
    }
  }

  /**
   * Submit feedback on retrieval results
   */
  async submitFeedback(feedback: RetrievalFeedback): Promise<void> {
    try {
      const validatedFeedback = RetrievalFeedbackSchema.parse(feedback);
      this.feedbackMap.set(validatedFeedback.queryId, validatedFeedback);
      
      // Update statistics based on feedback
      if (validatedFeedback.rating) {
        this.updateFeedbackStats(validatedFeedback);
      }
      
      this.log('debug', 'Feedback submitted', { 
        feedbackId: validatedFeedback.feedbackId,
        queryId: validatedFeedback.queryId,
        rating: validatedFeedback.rating,
      });
      
    } catch (error) {
      this.log('error', 'Failed to submit feedback', { feedback, error: error.message });
      throw new Error(`Failed to submit feedback: ${error.message}`);
    }
  }

  /**
   * Get retrieval statistics
   */
  getStats(): RetrievalStats {
    // Update time-based statistics
    this.updateTimeBasedStats();
    
    // Update cache statistics
    const resultCacheStats = this.resultCache.getStats();
    const queryCacheStats = this.queryCache.getStats();
    
    return {
      ...this.stats,
      cacheSize: resultCacheStats.currentSize + queryCacheStats.currentSize,
      cacheHitRate: (resultCacheStats.hitRate + queryCacheStats.hitRate) / 2,
      cacheEvictions: resultCacheStats.evictions + queryCacheStats.evictions,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Get audit trail
   */
  getAuditTrail(limit?: number): RetrievalEvent[] {
    const trail = [...this.auditTrail].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? trail.slice(0, limit) : trail;
  }

  /**
   * Clear audit trail
   */
  clearAuditTrail(): void {
    this.auditTrail = [];
    this.log('info', 'Audit trail cleared');
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.resultCache.clear();
    this.queryCache.clear();
    this.log('debug', 'All caches cleared');
  }

  /**
   * Close retrieval manager
   */
  async close(): Promise<void> {
    this.clearCache();
    this.resultCache.close();
    this.queryCache.close();
    this.log('info', 'Memory Retrieval Manager closed');
  }

  // Private methods

  /**
   * Semantic search using vector embeddings
   */
  private async semanticSearch(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const startTime = Date.now();
    
    try {
      // Generate query embedding
      const embeddingResult = await this.embeddingService.generateEmbedding(query.query);
      
      // Build search request
      const searchRequest: SearchRequest = {
        query: query.query,
        vector: embeddingResult.vector,
        limit: query.limit * 3, // Get more results for better ranking
        threshold: query.threshold || this.config.defaultThreshold,
        agentId: query.agentId,
        sessionId: query.sessionId,
        contentType: query.contentTypes?.[0] as any,
        tags: query.tags,
        after: query.timeRange?.start,
        before: query.timeRange?.end,
        includeMetadata: true,
      };
      
      // Perform vector search
      const searchResults = await this.vectorStore.search(searchRequest);
      
      // Convert to retrieval results
      const results: RetrievalResult[] = [];
      for (const searchResult of searchResults) {
        if (searchResult.entry) {
          const retrievalResult = await this.convertToRetrievalResult(
            searchResult.entry, 
            searchResult.score,
            'semantic'
          );
          results.push(retrievalResult);
        }
      }
      
      this.log('debug', 'Semantic search completed', {
        query: query.query,
        results: results.length,
        time: Date.now() - startTime,
      });
      
      return results;
      
    } catch (error) {
      this.log('error', 'Semantic search failed', { query: query.query, error: error.message });
      throw error;
    }
  }

  /**
   * Keyword search using text matching
   */
  private async keywordSearch(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const startTime = Date.now();
    
    try {
      // For keyword search, we'll use a simplified approach
      // In a real implementation, you'd use a full-text search engine
      
      // Get recent memories as base set
      const baseResults = await this.getRecentMemories(query);
      
      // Filter by keyword matching
      const keywords = query.query.toLowerCase().split(/\s+/);
      const results: RetrievalResult[] = [];
      
      for (const memory of baseResults) {
        const content = memory.content.toLowerCase();
        let matchScore = 0;
        
        // Calculate keyword match score
        for (const keyword of keywords) {
          if (content.includes(keyword)) {
            matchScore += 1;
          }
        }
        
        if (matchScore > 0) {
          const retrievalResult = await this.convertToRetrievalResult(
            memory,
            matchScore / keywords.length,
            'keyword'
          );
          results.push(retrievalResult);
        }
      }
      
      this.log('debug', 'Keyword search completed', {
        query: query.query,
        results: results.length,
        time: Date.now() - startTime,
      });
      
      return results;
      
    } catch (error) {
      this.log('error', 'Keyword search failed', { query: query.query, error: error.message });
      throw error;
    }
  }

  /**
   * Hybrid search combining semantic and keyword
   */
  private async hybridSearch(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const startTime = Date.now();
    
    try {
      // Perform both semantic and keyword searches
      const [semanticResults, keywordResults] = await Promise.all([
        this.semanticSearch(query),
        this.keywordSearch(query),
      ]);
      
      // Merge and deduplicate results
      const mergedResults = this.mergeResults(semanticResults, keywordResults, query);
      
      this.log('debug', 'Hybrid search completed', {
        query: query.query,
        semanticResults: semanticResults.length,
        keywordResults: keywordResults.length,
        mergedResults: mergedResults.length,
        time: Date.now() - startTime,
      });
      
      return mergedResults;
      
    } catch (error) {
      this.log('error', 'Hybrid search failed', { query: query.query, error: error.message });
      throw error;
    }
  }

  /**
   * Temporal search with recency weighting
   */
  private async temporalSearch(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const startTime = Date.now();
    
    try {
      // Get base results using semantic search
      const baseResults = await this.semanticSearch(query);
      
      // Apply temporal weighting
      const now = Date.now();
      const timeWindows = this.config.timeWindows;
      
      for (const result of baseResults) {
        let temporalScore = 0;
        const age = now - result.timestamp;
        
        for (const window of timeWindows) {
          const windowMs = window.hours * 60 * 60 * 1000;
          if (age <= windowMs) {
            temporalScore = Math.max(temporalScore, window.weight);
          }
        }
        
        result.temporalScore = temporalScore;
        result.relevanceScore = (result.relevanceScore + temporalScore) / 2;
      }
      
      // Sort by temporal relevance
      baseResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      this.log('debug', 'Temporal search completed', {
        query: query.query,
        results: baseResults.length,
        time: Date.now() - startTime,
      });
      
      return baseResults;
      
    } catch (error) {
      this.log('error', 'Temporal search failed', { query: query.query, error: error.message });
      throw error;
    }
  }

  /**
   * Contextual search with relevance scoring
   */
  private async contextualSearch(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const startTime = Date.now();
    
    try {
      // Get base results
      const baseResults = await this.semanticSearch(query);
      
      // Apply context-aware scoring if context is provided
      if (query.context) {
        const contextEmbedding = await this.embeddingService.generateEmbedding(query.context);
        
        for (const result of baseResults) {
          // Calculate context similarity
          const contextSimilarity = this.calculateCosineSimilarity(
            contextEmbedding.vector,
            result.rawData?.vector || []
          );
          
          // Boost relevance based on context
          const contextBoost = contextSimilarity * this.config.contextBoost;
          result.relevanceScore += contextBoost;
        }
      }
      
      this.log('debug', 'Contextual search completed', {
        query: query.query,
        context: query.context,
        results: baseResults.length,
        time: Date.now() - startTime,
      });
      
      return baseResults;
      
    } catch (error) {
      this.log('error', 'Contextual search failed', { query: query.query, error: error.message });
      throw error;
    }
  }

  /**
   * Trust-based search with filtering
   */
  private async trustBasedSearch(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const startTime = Date.now();
    
    try {
      // Get base results
      const baseResults = await this.semanticSearch(query);
      
      // Apply trust-based filtering and scoring
      const filteredResults: RetrievalResult[] = [];
      
      for (const result of baseResults) {
        // Get trust score from lineage manager
        let trustScore = 0.5; // Default trust score
        
        if (this.lineageManager) {
          trustScore = this.lineageManager.calculateCompositeTrust(result.id);
        }
        
        // Apply trust threshold
        if (trustScore >= (query.minTrustScore || this.config.trustThreshold)) {
          result.trustScore = trustScore;
          
          // Apply trust boost
          const trustBoost = trustScore * this.config.trustBoost;
          result.relevanceScore += trustBoost;
          
          filteredResults.push(result);
        }
      }
      
      this.log('debug', 'Trust-based search completed', {
        query: query.query,
        baseResults: baseResults.length,
        filteredResults: filteredResults.length,
        time: Date.now() - startTime,
      });
      
      return filteredResults;
      
    } catch (error) {
      this.log('error', 'Trust-based search failed', { query: query.query, error: error.message });
      throw error;
    }
  }

  /**
   * Adaptive search that selects best strategy
   */
  private async adaptiveSearch(query: RetrievalQuery): Promise<RetrievalResult[]> {
    const startTime = Date.now();
    
    try {
      // Analyze query characteristics
      const queryLength = query.query.length;
      const hasContext = !!query.context;
      const hasTemporalFilter = !!query.timeRange;
      const hasTrustFilter = !!query.minTrustScore;
      
      // Select best strategy based on query characteristics
      let selectedStrategy: RetrievalStrategy;
      
      if (hasTrustFilter) {
        selectedStrategy = 'trust_based';
      } else if (hasTemporalFilter) {
        selectedStrategy = 'temporal';
      } else if (hasContext) {
        selectedStrategy = 'contextual';
      } else if (queryLength < 10) {
        selectedStrategy = 'keyword';
      } else {
        selectedStrategy = 'hybrid';
      }
      
      this.log('debug', 'Adaptive strategy selected', {
        query: query.query,
        selectedStrategy,
        characteristics: {
          queryLength,
          hasContext,
          hasTemporalFilter,
          hasTrustFilter,
        },
      });
      
      // Execute selected strategy
      switch (selectedStrategy) {
        case 'semantic':
          return this.semanticSearch(query);
        case 'keyword':
          return this.keywordSearch(query);
        case 'hybrid':
          return this.hybridSearch(query);
        case 'temporal':
          return this.temporalSearch(query);
        case 'contextual':
          return this.contextualSearch(query);
        case 'trust_based':
          return this.trustBasedSearch(query);
        default:
          return this.semanticSearch(query);
      }
      
    } catch (error) {
      this.log('error', 'Adaptive search failed', { query: query.query, error: error.message });
      throw error;
    }
  }

  /**
   * Convert memory entry to retrieval result
   */
  private async convertToRetrievalResult(
    entry: any,
    score: number,
    strategy: RetrievalStrategy
  ): Promise<RetrievalResult> {
    const result: RetrievalResult = {
      id: entry.id,
      type: entry.contentType || entry.type,
      content: entry.content,
      relevanceScore: score,
      semanticScore: strategy === 'semantic' ? score : undefined,
      keywordScore: strategy === 'keyword' ? score : undefined,
      confidence: entry.confidence,
      trustLevel: entry.trustLevel,
      agentId: entry.agentId,
      sessionId: entry.sessionId,
      timestamp: entry.timestamp,
      tags: entry.tags || [],
      category: entry.category,
      thoughtId: entry.thoughtId,
      traceId: entry.traceId,
      relatedMemories: entry.childIds,
      parentMemories: entry.parentIds,
      accessCount: entry.accessCount,
      lastAccessed: entry.lastAccessed,
      rawData: entry,
    };
    
    // Get additional trust information
    if (this.lineageManager) {
      result.trustScore = this.lineageManager.calculateCompositeTrust(entry.id);
    }
    
    return result;
  }

  /**
   * Apply filters to results
   */
  private applyFilters(results: RetrievalResult[], query: RetrievalQuery): RetrievalResult[] {
    let filtered = [...results];
    
    // Content type filter
    if (query.contentTypes && query.contentTypes.length > 0) {
      filtered = filtered.filter(r => query.contentTypes!.includes(r.type));
    }
    
    // Agent filter
    if (query.agentId) {
      filtered = filtered.filter(r => r.agentId === query.agentId);
    }
    
    if (query.agentIds && query.agentIds.length > 0) {
      filtered = filtered.filter(r => query.agentIds!.includes(r.agentId));
    }
    
    // Session filter
    if (query.sessionId) {
      filtered = filtered.filter(r => r.sessionId === query.sessionId);
    }
    
    // Confidence filter
    if (query.minConfidence !== undefined) {
      filtered = filtered.filter(r => 
        r.confidence !== undefined && r.confidence >= query.minConfidence!
      );
    }
    
    // Trust level filter
    if (query.minTrustLevel) {
      filtered = filtered.filter(r => 
        r.trustLevel && this.compareTrustLevels(r.trustLevel, query.minTrustLevel!) >= 0
      );
    }
    
    // Trust score filter
    if (query.minTrustScore !== undefined) {
      filtered = filtered.filter(r => 
        r.trustScore !== undefined && r.trustScore >= query.minTrustScore!
      );
    }
    
    // Tags filter
    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter(r => 
        query.tags!.some(tag => r.tags.includes(tag))
      );
    }
    
    // Categories filter
    if (query.categories && query.categories.length > 0) {
      filtered = filtered.filter(r => 
        r.category && query.categories!.includes(r.category)
      );
    }
    
    // Time range filter
    if (query.timeRange) {
      if (query.timeRange.start) {
        filtered = filtered.filter(r => r.timestamp >= query.timeRange!.start);
      }
      if (query.timeRange.end) {
        filtered = filtered.filter(r => r.timestamp <= query.timeRange!.end);
      }
    }
    
    return filtered;
  }

  /**
   * Rank results using configured weights
   */
  private rankResults(results: RetrievalResult[], query: RetrievalQuery): RetrievalResult[] {
    const weights = query.ranking || this.config.ranking;
    
    for (const result of results) {
      let finalScore = 0;
      
      // Semantic score
      if (result.semanticScore !== undefined) {
        finalScore += result.semanticScore * weights.semantic;
      }
      
      // Temporal score
      if (this.config.enableTemporalWeighting) {
        const temporalScore = this.calculateTemporalScore(result);
        result.temporalScore = temporalScore;
        finalScore += temporalScore * weights.temporal;
      }
      
      // Trust score
      if (result.trustScore !== undefined) {
        finalScore += result.trustScore * weights.trust;
      }
      
      // Frequency score
      if (result.accessCount !== undefined) {
        const frequencyScore = this.calculateFrequencyScore(result);
        result.frequencyScore = frequencyScore;
        finalScore += frequencyScore * weights.frequency;
      }
      
      // Relevance score (base)
      finalScore += result.relevanceScore * weights.relevance;
      
      result.relevanceScore = finalScore;
    }
    
    // Sort by final relevance score
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Apply diversity to results
   */
  private applyDiversity(results: RetrievalResult[], query: RetrievalQuery): RetrievalResult[] {
    const diverseResults: RetrievalResult[] = [];
    const usedTypes = new Set<string>();
    const usedAgents = new Set<string>();
    const usedCategories = new Set<string>();
    
    for (const result of results) {
      // Check if this adds diversity
      const typeDiversity = !usedTypes.has(result.type);
      const agentDiversity = !usedAgents.has(result.agentId);
      const categoryDiversity = result.category && !usedCategories.has(result.category);
      
      if (typeDiversity || agentDiversity || categoryDiversity) {
        diverseResults.push(result);
        usedTypes.add(result.type);
        usedAgents.add(result.agentId);
        if (result.category) {
          usedCategories.add(result.category);
        }
      }
      
      if (diverseResults.length >= query.limit) {
        break;
      }
    }
    
    return diverseResults;
  }

  /**
   * Rerank results using more sophisticated algorithms
   */
  private async rerankResults(results: RetrievalResult[], query: RetrievalQuery): Promise<RetrievalResult[]> {
    // For now, we'll use a simple reranking based on feedback
    // In a real implementation, you'd use ML models or more sophisticated algorithms
    
    const queryFeedback = this.feedbackMap.get(query.queryId || '');
    
    if (queryFeedback && queryFeedback.resultFeedback) {
      // Adjust scores based on feedback
      for (const result of results) {
        const resultFeedback = queryFeedback.resultFeedback.find(rf => rf.resultId === result.id);
        if (resultFeedback && resultFeedback.relevant) {
          result.relevanceScore *= 1.2; // Boost relevant results
        }
      }
    }
    
    // Re-sort after reranking
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Add explanations to results
   */
  private addExplanations(results: RetrievalResult[], query: RetrievalQuery): RetrievalResult[] {
    for (const result of results) {
      const explanations: string[] = [];
      
      if (result.semanticScore !== undefined) {
        explanations.push(`Semantic similarity: ${result.semanticScore.toFixed(3)}`);
      }
      
      if (result.temporalScore !== undefined) {
        explanations.push(`Temporal relevance: ${result.temporalScore.toFixed(3)}`);
      }
      
      if (result.trustScore !== undefined) {
        explanations.push(`Trust score: ${result.trustScore.toFixed(3)}`);
      }
      
      if (result.frequencyScore !== undefined) {
        explanations.push(`Access frequency: ${result.frequencyScore.toFixed(3)}`);
      }
      
      result.explanation = explanations.join('; ');
    }
    
    return results;
  }

  /**
   * Include related memories
   */
  private async includeRelatedMemories(results: RetrievalResult[], query: RetrievalQuery): Promise<RetrievalResult[]> {
    for (const result of results) {
      if (result.relatedMemories && result.relatedMemories.length > 0) {
        const related = await this.getRelatedMemories(result.relatedMemories.slice(0, query.maxRelated));
        result.childMemories = related;
      }
    }
    
    return results;
  }

  /**
   * Apply pagination to results
   */
  private applyPagination(results: RetrievalResult[], query: RetrievalQuery): RetrievalResult[] {
    const start = query.offset;
    const end = start + query.limit;
    return results.slice(start, end);
  }

  /**
   * Merge results from multiple strategies
   */
  private mergeResults(
    semanticResults: RetrievalResult[],
    keywordResults: RetrievalResult[],
    query: RetrievalQuery
  ): RetrievalResult[] {
    const merged = new Map<string, RetrievalResult>();
    
    // Add semantic results
    for (const result of semanticResults) {
      merged.set(result.id, result);
    }
    
    // Add or merge keyword results
    for (const result of keywordResults) {
      const existing = merged.get(result.id);
      if (existing) {
        // Merge scores
        const weights = query.ranking || this.config.ranking;
        existing.relevanceScore = (
          existing.relevanceScore * weights.semantic +
          result.keywordScore! * weights.keyword
        );
      } else {
        merged.set(result.id, result);
      }
    }
    
    return Array.from(merged.values());
  }

  /**
   * Get recent memories as base for keyword search
   */
  private async getRecentMemories(query: RetrievalQuery): Promise<any[]> {
    // This is a simplified implementation
    // In a real implementation, you'd query the vector store with time constraints
    
    const searchRequest: SearchRequest = {
      query: query.query,
      limit: query.limit * 10, // Get more for filtering
      agentId: query.agentId,
      sessionId: query.sessionId,
      after: query.timeRange?.start,
      before: query.timeRange?.end,
      includeMetadata: true,
    };
    
    const searchResults = await this.vectorStore.search(searchRequest);
    return searchResults.map(sr => sr.entry).filter(Boolean);
  }

  /**
   * Get related memories
   */
  private async getRelatedMemories(memoryIds: string[]): Promise<RetrievalResult[]> {
    const related: RetrievalResult[] = [];
    
    for (const id of memoryIds) {
      const memory = await this.getMemory(id, { includeContent: false, useCache: true });
      if (memory) {
        related.push(memory);
      }
    }
    
    return related;
  }

  /**
   * Calculate temporal score
   */
  private calculateTemporalScore(result: RetrievalResult): number {
    if (!this.config.enableTemporalWeighting) {
      return 0;
    }
    
    const now = Date.now();
    const age = now - result.timestamp;
    const timeWindows = this.config.timeWindows;
    
    for (const window of timeWindows) {
      const windowMs = window.hours * 60 * 60 * 1000;
      if (age <= windowMs) {
        return window.weight;
      }
    }
    
    return 0;
  }

  /**
   * Calculate frequency score
   */
  private calculateFrequencyScore(result: RetrievalResult): number {
    if (result.accessCount === undefined) {
      return 0;
    }
    
    // Normalize frequency score (0-1)
    const maxFrequency = 100; // Assumed maximum frequency
    return Math.min(result.accessCount / maxFrequency, 1);
  }

  /**
   * Calculate cosine similarity
   */
  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length === 0 || vecB.length === 0) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }

  /**
   * Compare trust levels
   */
  private compareTrustLevels(level1: TrustLevel, level2: TrustLevel): number {
    const levels = {
      'unverified': 0,
      'low': 1,
      'medium': 2,
      'high': 3,
      'verified': 4,
      'authoritative': 5,
    };
    
    return levels[level1] - levels[level2];
  }

  /**
   * Calculate average relevance
   */
  private calculateAverageRelevance(results: RetrievalResult[]): number {
    if (results.length === 0) {
      return 0;
    }
    
    const total = results.reduce((sum, result) => sum + result.relevanceScore, 0);
    return total / results.length;
  }

  /**
   * Calculate relevance distribution
   */
  private calculateRelevanceDistribution(results: RetrievalResult[]): {
    high: number;
    medium: number;
    low: number;
  } {
    const distribution = { high: 0, medium: 0, low: 0 };
    
    for (const result of results) {
      if (result.relevanceScore >= 0.8) {
        distribution.high++;
      } else if (result.relevanceScore >= 0.5) {
        distribution.medium++;
      } else {
        distribution.low++;
      }
    }
    
    return distribution;
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(query: RetrievalQuery): string {
    const keyData = {
      query: query.query,
      strategy: query.strategy,
      agentId: query.agentId,
      sessionId: query.sessionId,
      contentTypes: query.contentTypes,
      timeRange: query.timeRange,
      limit: query.limit,
      threshold: query.threshold,
    };
    
    return JSON.stringify(keyData);
  }

  /**
   * Get applied optimizations
   */
  private getAppliedOptimizations(query: RetrievalQuery): string[] {
    const optimizations: string[] = [];
    
    if (query.useCache && this.config.enableCache) {
      optimizations.push('cache_enabled');
    }
    
    if (this.config.enableTemporalWeighting) {
      optimizations.push('temporal_weighting');
    }
    
    if (this.config.enableTrustFiltering) {
      optimizations.push('trust_filtering');
    }
    
    if (query.enableDiversity || this.config.enableDiversity) {
      optimizations.push('diversity_enhancement');
    }
    
    if (query.enableReranking || this.config.enableReranking) {
      optimizations.push('result_reranking');
    }
    
    return optimizations;
  }

  /**
   * Create audit event
   */
  private async createAuditEvent(
    query: RetrievalQuery,
    response: RetrievalResponse,
    startTime: number
  ): Promise<void> {
    const event: RetrievalEvent = {
      eventId: uuidv4(),
      timestamp: Date.now(),
      queryId: response.queryId,
      query: query.query,
      strategy: response.strategy,
      userId: query.userId,
      agentId: query.agentId,
      sessionId: query.sessionId,
      purpose: query.purpose,
      resultCount: response.results.length,
      averageRelevance: response.averageRelevance,
      topResultId: response.results[0]?.id,
      topResultScore: response.results[0]?.relevanceScore,
      queryTime: response.queryTime,
      cacheHit: response.cacheHit,
      filters: this.getAppliedFilters(query),
      options: {
        limit: query.limit,
        threshold: query.threshold,
        enableReranking: query.enableReranking,
        enableDiversity: query.enableDiversity,
      },
      metadata: query.metadata,
      tags: query.tags,
    };
    
    const validatedEvent = RetrievalEventSchema.parse(event);
    this.auditTrail.push(validatedEvent);
    
    // Limit audit trail size
    if (this.auditTrail.length > 10000) {
      this.auditTrail = this.auditTrail.slice(-5000);
    }
  }

  /**
   * Get applied filters
   */
  private getAppliedFilters(query: RetrievalQuery): string[] {
    const filters: string[] = [];
    
    if (query.agentId) filters.push('agent_id');
    if (query.agentIds) filters.push('agent_ids');
    if (query.sessionId) filters.push('session_id');
    if (query.contentTypes) filters.push('content_types');
    if (query.tags) filters.push('tags');
    if (query.categories) filters.push('categories');
    if (query.timeRange) filters.push('time_range');
    if (query.minConfidence !== undefined) filters.push('min_confidence');
    if (query.minTrustLevel) filters.push('min_trust_level');
    if (query.minTrustScore !== undefined) filters.push('min_trust_score');
    
    return filters;
  }

  /**
   * Update statistics
   */
  private updateStats(
    type: 'query' | 'cache_hit' | 'error',
    startTime: number,
    resultCount: number,
    strategy?: RetrievalStrategy
  ): void {
    const queryTime = Date.now() - startTime;
    
    this.stats.totalQueries++;
    
    if (strategy) {
      this.stats.queriesByStrategy[strategy] = (this.stats.queriesByStrategy[strategy] || 0) + 1;
    }
    
    if (type === 'cache_hit') {
      // Cache hit - don't update query time stats
    } else if (type === 'error') {
      this.stats.errorRate = (this.stats.errorRate * (this.stats.totalQueries - 1) + 1) / this.stats.totalQueries;
      this.stats.lastError = 'Query failed';
      this.stats.lastErrorTime = Date.now();
    } else {
      // Normal query
      const totalQueries = this.stats.totalQueries;
      const currentAvg = this.stats.averageQueryTime || 0;
      this.stats.averageQueryTime = (currentAvg * (totalQueries - 1) + queryTime) / totalQueries;
      
      this.stats.averageResults = (this.stats.averageResults * (totalQueries - 1) + resultCount) / totalQueries;
      
      if (resultCount === 0) {
        this.stats.zeroResultQueries++;
      }
    }
  }

  /**
   * Update feedback statistics
   */
  private updateFeedbackStats(feedback: RetrievalFeedback): void {
    if (this.config.enableFeedback) {
      // Update user satisfaction (simplified)
      const currentSatisfaction = this.stats.userSatisfaction || 0;
      const newSatisfaction = (currentSatisfaction + feedback.rating) / 2;
      this.stats.userSatisfaction = newSatisfaction;
      
      this.stats.feedbackRate = (this.stats.feedbackRate || 0) + 1;
    }
  }

  /**
   * Update time-based statistics
   */
  private updateTimeBasedStats(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;
    const oneWeekAgo = now - 604800000;
    
    this.stats.queriesLastHour = this.auditTrail.filter(e => e.timestamp >= oneHourAgo).length;
    this.stats.queriesLastDay = this.auditTrail.filter(e => e.timestamp >= oneDayAgo).length;
    this.stats.queriesLastWeek = this.auditTrail.filter(e => e.timestamp >= oneWeekAgo).length;
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let usage = 0;
    
    // Cache usage
    const resultCacheStats = this.resultCache.getStats();
    const queryCacheStats = this.queryCache.getStats();
    usage += resultCacheStats.memoryUsage + queryCacheStats.memoryUsage;
    
    // Audit trail usage
    usage += this.auditTrail.length * 1024; // Rough estimate
    
    // Feedback map usage
    usage += this.feedbackMap.size * 512; // Rough estimate
    
    return usage;
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
        console.debug('[MemoryRetrievalManager]', logData);
        break;
      case 'info':
        console.info('[MemoryRetrievalManager]', logData);
        break;
      case 'warn':
        console.warn('[MemoryRetrievalManager]', logData);
        break;
      case 'error':
        console.error('[MemoryRetrievalManager]', logData);
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
 * Memory Retrieval Manager Factory - Create configured instances
 */
export class MemoryRetrievalManagerFactory {
  /**
   * Create retrieval manager from environment variables
   */
  static fromEnvironment(): MemoryRetrievalManager {
    const config: RetrievalConfig = {
      vectorStore: undefined as any, // Must be provided
      memoryManager: undefined as any, // Must be provided
      lineageManager: undefined as any, // Optional
      defaultStrategy: (process.env.RETRIEVAL_STRATEGY as any) || 'semantic',
      defaultLimit: parseInt(process.env.RETRIEVAL_DEFAULT_LIMIT || '10'),
      defaultThreshold: parseFloat(process.env.RETRIEVAL_DEFAULT_THRESHOLD || '0.7'),
      ranking: {
        semantic: parseFloat(process.env.RETRIEVAL_SEMANTIC_WEIGHT || '0.4'),
        temporal: parseFloat(process.env.RETRIEVAL_TEMPORAL_WEIGHT || '0.2'),
        trust: parseFloat(process.env.RETRIEVAL_TRUST_WEIGHT || '0.2'),
        frequency: parseFloat(process.env.RETRIEVAL_FREQUENCY_WEIGHT || '0.1'),
        relevance: parseFloat(process.env.RETRIEVAL_RELEVANCE_WEIGHT || '0.1'),
      },
      enableCache: process.env.RETRIEVAL_ENABLE_CACHE !== 'false',
      cacheSize: parseInt(process.env.RETRIEVAL_CACHE_SIZE || '1000'),
      cacheTTL: parseInt(process.env.RETRIEVAL_CACHE_TTL || '3600000'),
      enableQueryCache: process.env.RETRIEVAL_ENABLE_QUERY_CACHE !== 'false',
      enableReranking: process.env.RETRIEVAL_ENABLE_RERANKING === 'true',
      enableDiversity: process.env.RETRIEVAL_ENABLE_DIVERSITY === 'true',
      enableParallelSearch: process.env.RETRIEVAL_ENABLE_PARALLEL !== 'false',
      maxParallelQueries: parseInt(process.env.RETRIEVAL_MAX_PARALLEL || '5'),
      enableTemporalWeighting: process.env.RETRIEVAL_ENABLE_TEMPORAL !== 'false',
      recencyDecay: parseFloat(process.env.RETRIEVAL_RECENCY_DECAY || '0.1'),
      enableTrustFiltering: process.env.RETRIEVAL_ENABLE_TRUST !== 'false',
      trustThreshold: parseFloat(process.env.RETRIEVAL_TRUST_THRESHOLD || '0.5'),
      trustBoost: parseFloat(process.env.RETRIEVAL_TRUST_BOOST || '0.2'),
      enableContextAwareness: process.env.RETRIEVAL_ENABLE_CONTEXT !== 'false',
      contextWindowSize: parseInt(process.env.RETRIEVAL_CONTEXT_WINDOW || '5'),
      contextBoost: parseFloat(process.env.RETRIEVAL_CONTEXT_BOOST || '0.15'),
      enableMetrics: process.env.RETRIEVAL_ENABLE_METRICS !== 'false',
      enableAuditTrail: process.env.RETRIEVAL_ENABLE_AUDIT !== 'false',
      logLevel: (process.env.RETRIEVAL_LOG_LEVEL as any) || 'info',
      enableExplanation: process.env.RETRIEVAL_ENABLE_EXPLANATION === 'true',
      enableFeedback: process.env.RETRIEVAL_ENABLE_FEEDBACK === 'true',
      enableLearning: process.env.RETRIEVAL_ENABLE_LEARNING === 'true',
      environment: (process.env.RETRIEVAL_ENVIRONMENT as any) || 'development',
    };
    
    return new MemoryRetrievalManager(config);
  }

  /**
   * Create development retrieval manager
   */
  static createDevelopment(
    vectorStore: QdrantVectorStore,
    memoryManager: SovereignMemoryManager,
    lineageManager?: DataLineageManager
  ): MemoryRetrievalManager {
    return new MemoryRetrievalManager({
      vectorStore,
      memoryManager,
      lineageManager,
      defaultStrategy: 'semantic',
      defaultLimit: 10,
      defaultThreshold: 0.7,
      enableCache: true,
      cacheSize: 100,
      cacheTTL: 1800000, // 30 minutes
      enableMetrics: true,
      enableAuditTrail: true,
      logLevel: 'debug',
      enableReranking: true,
      enableDiversity: true,
      enableTemporalWeighting: true,
      enableTrustFiltering: true,
      enableContextAwareness: true,
      enableExplanation: true,
      enableFeedback: true,
      environment: 'development',
    });
  }

  /**
   * Create production retrieval manager
   */
  static createProduction(
    vectorStore: QdrantVectorStore,
    memoryManager: SovereignMemoryManager,
    lineageManager?: DataLineageManager,
    config?: Partial<RetrievalConfig>
  ): MemoryRetrievalManager {
    return new MemoryRetrievalManager({
      vectorStore,
      memoryManager,
      lineageManager,
      defaultStrategy: 'hybrid',
      defaultLimit: 20,
      defaultThreshold: 0.8,
      enableCache: true,
      cacheSize: 5000,
      cacheTTL: 7200000, // 2 hours
      enableMetrics: true,
      enableAuditTrail: true,
      logLevel: 'warn',
      enableReranking: true,
      enableDiversity: true,
      enableParallelSearch: true,
      maxParallelQueries: 10,
      enableTemporalWeighting: true,
      enableTrustFiltering: true,
      trustThreshold: 0.7,
      enableContextAwareness: true,
      enableExplanation: false,
      enableFeedback: true,
      environment: 'production',
      ...config,
    });
  }
}