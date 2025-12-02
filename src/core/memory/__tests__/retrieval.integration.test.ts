/**
 * Memory Retrieval with Context - Integration Tests
 * 
 * Integration tests to verify the retrieval system works correctly
 * with existing memory components (vector store, memory manager, etc.).
 */

import { MemoryRetrievalManager, MemoryRetrievalManagerFactory } from '../retrieval';
import { QdrantVectorStore, VectorStoreFactory } from '../vector-store';
import { SovereignMemoryManager } from '../memory-manager';
import { DataLineageManager } from '../../aix/data-lineage';
import { AIXEmbeddingService } from '../../aix/embedding-service';
import { ThoughtUnit, ReActTrace } from '../../aix/schema';
import { InvalidationManager } from '../invalidation';
import {
  RetrievalQuery,
  RetrievalStrategy,
  RetrievalConfig,
  RetrievalFeedback,
} from '../retrieval-types';

describe('Memory Retrieval Integration Tests', () => {
  let retrievalManager: MemoryRetrievalManager;
  let vectorStore: QdrantVectorStore;
  let memoryManager: SovereignMemoryManager;
  let lineageManager: DataLineageManager;
  let embeddingService: AIXEmbeddingService;
  let invalidationManager: InvalidationManager;
  
  beforeAll(async () => {
    // Initialize all components for integration testing
    
    // Initialize vector store
    vectorStore = VectorStoreFactory.createLocal();
    await vectorStore.initialize();
    
    // Initialize embedding service
    embeddingService = new AIXEmbeddingService({
      model: 'text-embedding-ada-002',
      dimensions: 1536,
    });
    
    // Initialize lineage manager
    lineageManager = new DataLineageManager();
    
    // Initialize invalidation manager
    invalidationManager = InvalidationManagerFactory.createDevelopment();
    invalidationManager.setIntegrations({
      vectorStore,
      lineageManager,
    });
    
    // Initialize memory manager
    memoryManager = new SovereignMemoryManager({
      vectorStore,
      embeddingService,
      lineageManager,
      enableCaching: true,
      enableOptimization: true,
      enableMetrics: true,
      logLevel: 'warn',
    });
    
    // Initialize retrieval manager
    const config: RetrievalConfig = {
      vectorStore,
      memoryManager,
      lineageManager,
      defaultStrategy: 'hybrid',
      enableCache: true,
      cacheSize: 100,
      enableMetrics: true,
      enableAuditTrail: true,
      enableReranking: true,
      enableDiversity: true,
      enableTemporalWeighting: true,
      enableTrustFiltering: true,
      enableContextAwareness: true,
      logLevel: 'warn',
    };
    
    retrievalManager = new MemoryRetrievalManager(config);
    
    // Set up integration between components
    invalidationManager.setIntegrations({
      vectorStore,
      memoryManager,
      lineageManager,
    });
  });
  
  afterAll(async () => {
    // Clean up all components
    await retrievalManager.close();
    await memoryManager.close();
    await vectorStore.close();
  });
  
  describe('End-to-End Memory Flow', () => {
    it('should store and retrieve thoughts', async () => {
      // Create a thought
      const thought: ThoughtUnit = {
        id: 'test-thought-1',
        timestamp: Date.now(),
        agentId: 'test-agent-1',
        content: 'This is a test thought about machine learning algorithms',
        type: 'reasoning',
        confidence: 0.8,
        confidenceLevel: 'high',
        sessionId: 'test-session-1',
        tags: ['ml', 'algorithms', 'test'],
        hash: 'test-hash-1',
      };
      
      // Store the thought
      const memoryId = await memoryManager.storeThought(thought);
      expect(memoryId).toBe('test-thought-1');
      
      // Retrieve using semantic search
      const query: RetrievalQuery = {
        query: 'machine learning',
        strategy: 'semantic',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response.results.length).toBeGreaterThan(0);
      const retrieved = response.results.find(r => r.id === 'test-thought-1');
      expect(retrieved).toBeDefined();
      expect(retrieved!.content).toContain('machine learning');
      expect(retrieved!.agentId).toBe('test-agent-1');
      expect(retrieved!.type).toBe('thought');
    });
    
    it('should store and retrieve traces', async () => {
      // Create a trace
      const trace: ReActTrace = {
        id: 'test-trace-1',
        sessionId: 'test-session-2',
        taskId: 'test-task-1',
        title: 'Problem Analysis Trace',
        description: 'Analyzing a complex problem using reasoning',
        category: 'analysis',
        startTime: Date.now() - 5000,
        endTime: Date.now(),
        duration: 5000,
        primaryAgentId: 'test-agent-2',
        thoughts: [
          {
            id: 'trace-thought-1',
            timestamp: Date.now() - 4000,
            agentId: 'test-agent-2',
            content: 'Initial problem understanding',
            type: 'observation',
            confidence: 0.9,
            confidenceLevel: 'very_high',
            sessionId: 'test-session-2',
            tags: ['analysis'],
            hash: 'trace-hash-1',
          },
          {
            id: 'trace-thought-2',
            timestamp: Date.now() - 2000,
            agentId: 'test-agent-2',
            content: 'Step-by-step reasoning process',
            type: 'reasoning',
            confidence: 0.8,
            confidenceLevel: 'high',
            sessionId: 'test-session-2',
            tags: ['reasoning'],
            hash: 'trace-hash-2',
          },
        ],
        actions: [],
        conclusion: 'Problem analyzed successfully',
        success: true,
        confidence: 0.85,
        hash: 'trace-hash-main',
      };
      
      // Store the trace
      const memoryId = await memoryManager.storeTrace(trace);
      expect(memoryId).toBe('test-trace-1');
      
      // Retrieve using contextual search
      const query: RetrievalQuery = {
        query: 'problem analysis',
        context: 'reasoning process',
        strategy: 'contextual',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response.results.length).toBeGreaterThan(0);
      const retrieved = response.results.find(r => r.id === 'test-trace-1');
      expect(retrieved).toBeDefined();
      expect(retrieved!.type).toBe('trace');
      expect(retrieved!.agentId).toBe('test-agent-2');
    });
  });
  
  describe('Vector Store Integration', () => {
    it('should use vector store for semantic search', async () => {
      // Store test data
      const thought: ThoughtUnit = {
        id: 'vector-test-1',
        timestamp: Date.now(),
        agentId: 'vector-agent',
        content: 'Vector embeddings enable semantic search capabilities',
        type: 'reasoning',
        confidence: 0.9,
        confidenceLevel: 'very_high',
        sessionId: 'vector-session',
        tags: ['vectors', 'semantic', 'search'],
        hash: 'vector-test-hash',
      };
      
      await memoryManager.storeThought(thought);
      
      // Perform semantic search
      const query: RetrievalQuery = {
        query: 'semantic search',
        strategy: 'semantic',
        limit: 3,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response.strategy).toBe('semantic');
      expect(response.results.length).toBeGreaterThan(0);
      
      // Check that vector store was used
      const vectorStats = vectorStore.getMetrics();
      expect(vectorStats.totalOperations).toBeGreaterThan(0);
    });
    
    it('should handle vector store failures gracefully', async () => {
      // Mock vector store failure
      const originalSearch = vectorStore.search;
      vectorStore.search = jest.fn().mockRejectedValue(new Error('Vector store unavailable'));
      
      const query: RetrievalQuery = {
        query: 'failure test',
        strategy: 'semantic',
        limit: 3,
      };
      
      await expect(retrievalManager.search(query))
        .rejects.toThrow('Memory search failed');
      
      // Restore original method
      vectorStore.search = originalSearch;
    });
  });
  
  describe('Memory Manager Integration', () => {
    it('should use memory manager for caching', async () => {
      // Store test data
      const thought: ThoughtUnit = {
        id: 'cache-test-1',
        timestamp: Date.now(),
        agentId: 'cache-agent',
        content: 'Cached memory retrieval test',
        type: 'observation',
        confidence: 0.7,
        confidenceLevel: 'medium',
        sessionId: 'cache-session',
        tags: ['cache', 'memory'],
        hash: 'cache-test-hash',
      };
      
      await memoryManager.storeThought(thought);
      
      // First search (cache miss)
      const query1: RetrievalQuery = {
        query: 'cached memory',
        strategy: 'semantic',
        limit: 3,
      };
      
      const response1 = await retrievalManager.search(query1);
      expect(response1.cacheHit).toBe(false);
      
      // Second search (should use memory manager cache)
      const response2 = await retrievalManager.search(query1);
      expect(response2.cacheHit).toBe(true);
      
      // Verify memory manager stats
      const memoryStats = memoryManager.getStats();
      expect(memoryStats.cacheHitRate).toBeGreaterThan(0);
    });
    
    it('should retrieve specific memories via memory manager', async () => {
      const thought: ThoughtUnit = {
        id: 'specific-test-1',
        timestamp: Date.now(),
        agentId: 'specific-agent',
        content: 'Specific memory retrieval test',
        type: 'synthesis',
        confidence: 0.85,
        confidenceLevel: 'high',
        sessionId: 'specific-session',
        tags: ['specific', 'retrieval'],
        hash: 'specific-test-hash',
      };
      
      await memoryManager.storeThought(thought);
      
      // Retrieve specific memory
      const memory = await retrievalManager.getMemory('specific-test-1', {
        includeContent: true,
        includeRelated: true,
        useCache: true,
      });
      
      expect(memory).toBeDefined();
      expect(memory!.id).toBe('specific-test-1');
      expect(memory!.content).toContain('Specific memory retrieval');
      expect(memory!.agentId).toBe('specific-agent');
    });
  });
  
  describe('Lineage Manager Integration', () => {
    it('should use lineage for trust-based filtering', async () => {
      // Store test data with different trust levels
      const highTrustThought: ThoughtUnit = {
        id: 'high-trust-1',
        timestamp: Date.now(),
        agentId: 'trusted-agent',
        content: 'High trust level memory',
        type: 'reasoning',
        confidence: 0.95,
        confidenceLevel: 'certain',
        sessionId: 'trust-session',
        tags: ['trust', 'high'],
        hash: 'high-trust-hash',
      };
      
      const lowTrustThought: ThoughtUnit = {
        id: 'low-trust-1',
        timestamp: Date.now(),
        agentId: 'untrusted-agent',
        content: 'Low trust level memory',
        type: 'observation',
        confidence: 0.3,
        confidenceLevel: 'low',
        sessionId: 'trust-session',
        tags: ['trust', 'low'],
        hash: 'low-trust-hash',
      };
      
      await memoryManager.storeThought(highTrustThought);
      await memoryManager.storeThought(lowTrustThought);
      
      // Perform trust-based search
      const query: RetrievalQuery = {
        query: 'trust level test',
        strategy: 'trust_based',
        minTrustLevel: 'high',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response.strategy).toBe('trust_based');
      expect(response.results.length).toBeGreaterThan(0);
      
      // Should only return high trust results
      const lowTrustResult = response.results.find(r => r.id === 'low-trust-1');
      expect(lowTrustResult).toBeUndefined();
      
      const highTrustResult = response.results.find(r => r.id === 'high-trust-1');
      expect(highTrustResult).toBeDefined();
    });
    
    it('should calculate composite trust scores', async () => {
      const thought: ThoughtUnit = {
        id: 'composite-trust-1',
        timestamp: Date.now(),
        agentId: 'composite-agent',
        content: 'Composite trust score calculation',
        type: 'synthesis',
        confidence: 0.8,
        confidenceLevel: 'high',
        sessionId: 'composite-session',
        tags: ['trust', 'composite'],
        hash: 'composite-trust-hash',
      };
      
      await memoryManager.storeThought(thought);
      
      // Perform search with trust scoring
      const query: RetrievalQuery = {
        query: 'composite trust',
        strategy: 'trust_based',
        limit: 3,
      };
      
      const response = await retrievalManager.search(query);
      
      if (response.results.length > 0) {
        const result = response.results[0];
        expect(result.trustScore).toBeDefined();
        expect(result.trustScore!).toBeGreaterThan(0);
        expect(result.trustScore!).toBeLessThanOrEqual(1);
      }
    });
  });
  
  describe('Invalidation System Integration', () => {
    it('should respect invalidation in retrieval results', async () => {
      // Store test data
      const thought: ThoughtUnit = {
        id: 'invalidation-test-1',
        timestamp: Date.now(),
        agentId: 'invalidation-agent',
        content: 'Memory to be invalidated',
        type: 'reasoning',
        confidence: 0.7,
        confidenceLevel: 'medium',
        sessionId: 'invalidation-session',
        tags: ['invalidation', 'test'],
        hash: 'invalidation-test-hash',
      };
      
      await memoryManager.storeThought(thought);
      
      // Register dependency for invalidation
      invalidationManager.registerDependency(
        'invalidation-test-1',
        [],
        'thought'
      );
      
      // Verify memory exists
      const beforeInvalidation = await retrievalManager.getMemory('invalidation-test-1');
      expect(beforeInvalidation).toBeDefined();
      
      // Invalidate the memory
      const invalidationRequest = {
        requestId: 'test-invalidation-1',
        sourceId: 'invalidation-test-1',
        sourceType: 'thought' as const,
        trigger: 'manual' as const,
        strategy: 'immediate' as const,
        reason: 'Test invalidation',
        agentId: 'test-agent',
      };
      
      const invalidationResult = await invalidationManager.invalidate(invalidationRequest);
      expect(invalidationResult.success).toBe(true);
      expect(invalidationResult.itemsInvalidated).toContain('invalidation-test-1');
      
      // Verify memory is no longer retrievable
      const afterInvalidation = await retrievalManager.getMemory('invalidation-test-1');
      expect(afterInvalidation).toBeNull();
    });
  });
  
  describe('Complex Query Scenarios', () => {
    it('should handle complex multi-filter queries', async () => {
      // Store diverse test data
      const thoughts = [
        {
          id: 'complex-1',
          timestamp: Date.now() - 86400000, // 1 day ago
          agentId: 'agent-A',
          content: 'Machine learning algorithms and neural networks',
          type: 'reasoning' as const,
          confidence: 0.9,
          confidenceLevel: 'very_high' as const,
          sessionId: 'session-1',
          tags: ['ml', 'neural', 'algorithms'],
          hash: 'complex-hash-1',
        },
        {
          id: 'complex-2',
          timestamp: Date.now() - 3600000, // 1 hour ago
          agentId: 'agent-B',
          content: 'Deep learning model optimization',
          type: 'observation' as const,
          confidence: 0.8,
          confidenceLevel: 'high' as const,
          sessionId: 'session-2',
          tags: ['dl', 'optimization'],
          hash: 'complex-hash-2',
        },
        {
          id: 'complex-3',
          timestamp: Date.now() - 60000, // 1 minute ago
          agentId: 'agent-C',
          content: 'Traditional algorithm analysis',
          type: 'synthesis' as const,
          confidence: 0.6,
          confidenceLevel: 'medium' as const,
          sessionId: 'session-3',
          tags: ['traditional', 'analysis'],
          hash: 'complex-hash-3',
        },
      ];
      
      for (const thought of thoughts) {
        await memoryManager.storeThought(thought);
      }
      
      // Complex query with multiple filters
      const query: RetrievalQuery = {
        query: 'learning algorithms',
        strategy: 'hybrid',
        agentIds: ['agent-A', 'agent-B'],
        contentTypes: ['reasoning', 'observation'],
        timeRange: {
          start: Date.now() - 86400000 * 2, // Last 2 days
          end: Date.now(),
        },
        minConfidence: 0.7,
        tags: ['ml', 'algorithms'],
        limit: 10,
        enableReranking: true,
        enableDiversity: true,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response.strategy).toBe('hybrid');
      expect(response.results.length).toBeGreaterThan(0);
      
      // Verify filters were applied
      for (const result of response.results) {
        expect(['agent-A', 'agent-B']).toContain(result.agentId);
        expect(['reasoning', 'observation']).toContain(result.type);
        expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      }
    });
    
    it('should handle temporal and contextual search', async () => {
      // Store time-series data
      const baseTime = Date.now();
      const thoughts = [
        {
          id: 'temporal-1',
          timestamp: baseTime - 3600000, // 1 hour ago
          agentId: 'temporal-agent',
          content: 'Recent machine learning research',
          type: 'observation' as const,
          confidence: 0.9,
          confidenceLevel: 'very_high' as const,
          sessionId: 'temporal-session',
          tags: ['recent', 'ml'],
          hash: 'temporal-hash-1',
        },
        {
          id: 'temporal-2',
          timestamp: baseTime - 86400000, // 1 day ago
          agentId: 'temporal-agent',
          content: 'Yesterday\'s neural network experiments',
          type: 'reasoning' as const,
          confidence: 0.8,
          confidenceLevel: 'high' as const,
          sessionId: 'temporal-session',
          tags: ['neural', 'experiments'],
          hash: 'temporal-hash-2',
        },
      ];
      
      for (const thought of thoughts) {
        await memoryManager.storeThought(thought);
      }
      
      // Temporal search with context
      const query: RetrievalQuery = {
        query: 'neural networks',
        context: 'deep learning and machine learning',
        strategy: 'temporal',
        timeRange: {
          relative: 'last_day',
        },
        limit: 5,
        enableExplanation: true,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response.strategy).toBe('temporal');
      expect(response.results.length).toBeGreaterThan(0);
      
      // Check temporal weighting was applied
      for (const result of response.results) {
        expect(result.temporalScore).toBeDefined();
        expect(result.temporalScore!).toBeGreaterThan(0);
      }
      
      // Check explanations are included
      if (response.results.length > 0) {
        expect(response.results[0].explanation).toBeDefined();
        expect(response.results[0].explanation!).toContain('Temporal relevance');
      }
    });
  });
  
  describe('Performance and Scalability', () => {
    it('should handle high query volume', async () => {
      // Store test data
      const thoughts = Array.from({ length: 50 }, (_, i) => ({
        id: `perf-test-${i}`,
        timestamp: Date.now() - (i * 1000),
        agentId: `perf-agent-${i % 5}`,
        content: `Performance test content ${i} with various keywords`,
        type: ['reasoning', 'observation', 'synthesis'][i % 3] as any,
        confidence: 0.5 + (i % 5) * 0.1,
        confidenceLevel: ['low', 'medium', 'high', 'very_high'][i % 4] as any,
        sessionId: `perf-session-${i % 10}`,
        tags: [`tag-${i % 10}`, `category-${i % 5}`],
        hash: `perf-hash-${i}`,
      }));
      
      for (const thought of thoughts) {
        await memoryManager.storeThought(thought);
      }
      
      // Execute many concurrent queries
      const queries = Array.from({ length: 20 }, (_, i) => ({
        query: `performance query ${i}`,
        strategy: ['semantic', 'keyword', 'hybrid'][i % 3] as RetrievalStrategy,
        limit: 5,
      }));
      
      const startTime = Date.now();
      const promises = queries.map(q => retrievalManager.search(q));
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(responses).toHaveLength(20);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      // Check statistics
      const stats = retrievalManager.getStats();
      expect(stats.totalQueries).toBe(20);
      expect(stats.averageQueryTime).toBeGreaterThan(0);
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
    });
    
    it('should maintain performance with large result sets', async () => {
      // Store large dataset
      const largeThoughts = Array.from({ length: 100 }, (_, i) => ({
        id: `large-test-${i}`,
        timestamp: Date.now() - (i * 100),
        agentId: `large-agent-${i % 10}`,
        content: `Large dataset test content ${i} with searchable terms`,
        type: 'reasoning',
        confidence: 0.7,
        confidenceLevel: 'high',
        sessionId: `large-session-${i % 20}`,
        tags: [`large-tag-${i % 15}`],
        hash: `large-hash-${i}`,
      }));
      
      for (const thought of largeThoughts) {
        await memoryManager.storeThought(thought);
      }
      
      // Query with large limit
      const query: RetrievalQuery = {
        query: 'large dataset',
        strategy: 'semantic',
        limit: 50,
        enableDiversity: true,
      };
      
      const startTime = Date.now();
      const response = await retrievalManager.search(query);
      const endTime = Date.now();
      
      expect(response.results.length).toBeLessThanOrEqual(50);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
      
      // Check diversity was applied
      const agents = new Set(response.results.map(r => r.agentId));
      expect(agents.size).toBeGreaterThan(1);
    });
  });
  
  describe('Feedback Loop Integration', () => {
    it('should incorporate feedback into future searches', async () => {
      // Store test data
      const thought: ThoughtUnit = {
        id: 'feedback-test-1',
        timestamp: Date.now(),
        agentId: 'feedback-agent',
        content: 'Feedback integration test content',
        type: 'reasoning',
        confidence: 0.8,
        confidenceLevel: 'high',
        sessionId: 'feedback-session',
        tags: ['feedback', 'integration'],
        hash: 'feedback-hash-1',
      };
      
      await memoryManager.storeThought(thought);
      
      // Initial search
      const initialQuery: RetrievalQuery = {
        query: 'feedback integration',
        queryId: 'feedback-query-1',
        strategy: 'semantic',
        limit: 5,
      };
      
      const initialResponse = await retrievalManager.search(initialQuery);
      expect(initialResponse.results.length).toBeGreaterThan(0);
      
      // Submit feedback
      const feedback: RetrievalFeedback = {
        feedbackId: 'feedback-1',
        queryId: 'feedback-query-1',
        timestamp: Date.now(),
        userId: 'feedback-user',
        rating: 5,
        helpful: true,
        resultFeedback: [
          {
            resultId: 'feedback-test-1',
            relevant: true,
            rating: 5,
            comments: 'Perfectly relevant',
          },
        ],
      };
      
      await retrievalManager.submitFeedback(feedback);
      
      // Second search with reranking enabled
      const rerankQuery: RetrievalQuery = {
        query: 'feedback integration',
        queryId: 'feedback-query-1',
        strategy: 'semantic',
        enableReranking: true,
        limit: 5,
      };
      
      const rerankResponse = await retrievalManager.search(rerankQuery);
      
      expect(rerankResponse.results.length).toBeGreaterThan(0);
      
      // The result should be boosted due to positive feedback
      const feedbackResult = rerankResponse.results.find(r => r.id === 'feedback-test-1');
      if (feedbackResult) {
        expect(feedbackResult.relevanceScore).toBeGreaterThanOrEqual(
          initialResponse.results.find(r => r.id === 'feedback-test-1')?.relevanceScore || 0
        );
      }
    });
  });
});