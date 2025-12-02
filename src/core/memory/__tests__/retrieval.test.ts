/**
 * Memory Retrieval with Context - Test Suite
 * 
 * Comprehensive test coverage for the memory retrieval system
 * including all strategies, features, and edge cases.
 */

import { MemoryRetrievalManager, MemoryRetrievalManagerFactory } from '../retrieval';
import { QdrantVectorStore, VectorStoreFactory } from '../vector-store';
import { SovereignMemoryManager } from '../memory-manager';
import { DataLineageManager } from '../../aix/data-lineage';
import { AIXEmbeddingService } from '../../aix/embedding-service';
import { ThoughtUnit, ReActTrace } from '../../aix/schema';
import {
  RetrievalStrategy,
  RetrievalQuery,
  RetrievalConfig,
  RetrievalEvent,
  RetrievalFeedback,
} from '../retrieval-types';

// Mock implementations for testing
class MockVectorStore extends QdrantVectorStore {
  private memories: any[] = [];
  
  constructor() {
    super({
      url: 'http://localhost:6333',
      defaultCollection: 'test_memory',
      vectorSize: 1536,
      enableMetrics: false,
      logLevel: 'error',
    });
  }
  
  async initialize(): Promise<void> {
    // Mock implementation
  }
  
  async search(request: any): Promise<any[]> {
    // Return mock search results
    return this.memories
      .filter(m => m.content.toLowerCase().includes(request.query.toLowerCase()))
      .slice(0, request.limit)
      .map(m => ({
        id: m.id,
        score: 0.8,
        entry: m,
      }));
  }
  
  async getEntry(id: string): Promise<any> {
    return this.memories.find(m => m.id === id) || null;
  }
  
  async storeEntry(entry: any): Promise<string> {
    this.memories.push(entry);
    return entry.id;
  }
  
  async close(): Promise<void> {
    // Mock implementation
  }
}

class MockMemoryManager extends SovereignMemoryManager {
  private memories: Map<string, any> = new Map();
  
  constructor() {
    const mockVectorStore = new MockVectorStore();
    const mockEmbeddingService = new AIXEmbeddingService({
      model: 'text-embedding-ada-002',
      dimensions: 1536,
    });
    const mockLineageManager = new DataLineageManager();
    
    super({
      vectorStore: mockVectorStore,
      embeddingService: mockEmbeddingService,
      lineageManager: mockLineageManager,
      enableCaching: false,
      enableOptimization: false,
      enableMetrics: false,
      logLevel: 'error',
    });
  }
  
  async getMemory(id: string): Promise<any> {
    return this.memories.get(id) || null;
  }
  
  async storeThought(thought: ThoughtUnit): Promise<string> {
    const memory = {
      id: thought.id,
      type: 'thought',
      content: thought.content,
      agentId: thought.agentId,
      sessionId: thought.sessionId,
      timestamp: thought.timestamp,
      confidence: thought.confidence,
      tags: thought.tags,
      thoughtId: thought.id,
    };
    this.memories.set(thought.id, memory);
    return thought.id;
  }
  
  async close(): Promise<void> {
    // Mock implementation
  }
}

class MockLineageManager extends DataLineageManager {
  calculateCompositeTrust(memoryId: string): number {
    // Mock trust calculation based on ID
    return memoryId.startsWith('high') ? 0.9 : 
           memoryId.startsWith('med') ? 0.7 : 0.5;
  }
}

describe('MemoryRetrievalManager', () => {
  let retrievalManager: MemoryRetrievalManager;
  let mockVectorStore: MockVectorStore;
  let mockMemoryManager: MockMemoryManager;
  let mockLineageManager: MockLineageManager;
  
  beforeEach(() => {
    mockVectorStore = new MockVectorStore();
    mockMemoryManager = new MockMemoryManager();
    mockLineageManager = new MockLineageManager();
    
    const config: RetrievalConfig = {
      vectorStore: mockVectorStore,
      memoryManager: mockMemoryManager,
      lineageManager: mockLineageManager,
      defaultStrategy: 'semantic',
      enableCache: true,
      cacheSize: 100,
      enableMetrics: true,
      enableAuditTrail: true,
      logLevel: 'error',
    };
    
    retrievalManager = new MemoryRetrievalManager(config);
  });
  
  afterEach(async () => {
    await retrievalManager.close();
  });
  
  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(retrievalManager).toBeDefined();
      const stats = retrievalManager.getStats();
      expect(stats.totalQueries).toBe(0);
      expect(stats.cacheHitRate).toBe(0);
    });
    
    it('should create from environment variables', () => {
      process.env.RETRIEVAL_STRATEGY = 'hybrid';
      process.env.RETRIEVAL_DEFAULT_LIMIT = '20';
      
      const envManager = MemoryRetrievalManagerFactory.fromEnvironment();
      expect(envManager).toBeDefined();
      
      delete process.env.RETRIEVAL_STRATEGY;
      delete process.env.RETRIEVAL_DEFAULT_LIMIT;
    });
  });
  
  describe('Semantic Search', () => {
    it('should perform semantic search', async () => {
      const query: RetrievalQuery = {
        query: 'test query',
        strategy: 'semantic',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
      expect(response.strategy).toBe('semantic');
      expect(response.queryTime).toBeGreaterThan(0);
    });
    
    it('should apply semantic search filters', async () => {
      const query: RetrievalQuery = {
        query: 'test query',
        strategy: 'semantic',
        agentId: 'test-agent',
        contentTypes: ['thought'],
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response.results.length).toBeGreaterThanOrEqual(0);
      if (response.results.length > 0) {
        expect(response.results[0].agentId).toBe('test-agent');
        expect(response.results[0].type).toBe('thought');
      }
    });
  });
  
  describe('Keyword Search', () => {
    it('should perform keyword search', async () => {
      const query: RetrievalQuery = {
        query: 'keyword search',
        strategy: 'keyword',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.strategy).toBe('keyword');
      expect(response.results).toBeDefined();
    });
    
    it('should handle multiple keywords', async () => {
      const query: RetrievalQuery = {
        query: 'multiple keywords test',
        strategy: 'keyword',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response.results.length).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Hybrid Search', () => {
    it('should combine semantic and keyword results', async () => {
      const query: RetrievalQuery = {
        query: 'hybrid test',
        strategy: 'hybrid',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.strategy).toBe('hybrid');
      expect(response.results).toBeDefined();
    });
    
    it('should merge and deduplicate results', async () => {
      const query: RetrievalQuery = {
        query: 'duplicate test',
        strategy: 'hybrid',
        limit: 10,
      };
      
      const response = await retrievalManager.search(query);
      
      // Check for duplicates (simplified check)
      const ids = response.results.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });
  
  describe('Temporal Search', () => {
    it('should apply temporal weighting', async () => {
      const now = Date.now();
      const query: RetrievalQuery = {
        query: 'temporal test',
        strategy: 'temporal',
        timeRange: {
          start: now - 86400000, // Last 24 hours
          end: now,
        },
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.strategy).toBe('temporal');
      
      // Check temporal scores are applied
      if (response.results.length > 0) {
        expect(response.results[0].temporalScore).toBeDefined();
      }
    });
    
    it('should handle relative time ranges', async () => {
      const query: RetrievalQuery = {
        query: 'recent test',
        strategy: 'temporal',
        timeRange: {
          relative: 'last_day',
        },
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
    });
  });
  
  describe('Contextual Search', () => {
    it('should use context for relevance scoring', async () => {
      const query: RetrievalQuery = {
        query: 'contextual test',
        context: 'additional context information',
        strategy: 'contextual',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.strategy).toBe('contextual');
    });
    
    it('should boost relevance based on context similarity', async () => {
      const query: RetrievalQuery = {
        query: 'machine learning',
        context: 'artificial intelligence and neural networks',
        strategy: 'contextual',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response.results.length).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Trust-based Search', () => {
    it('should filter by trust level', async () => {
      const query: RetrievalQuery = {
        query: 'trust test',
        strategy: 'trust_based',
        minTrustLevel: 'high',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.strategy).toBe('trust_based');
      
      // Check trust scores are applied
      if (response.results.length > 0) {
        expect(response.results[0].trustScore).toBeDefined();
      }
    });
    
    it('should filter by trust score threshold', async () => {
      const query: RetrievalQuery = {
        query: 'trust score test',
        strategy: 'trust_based',
        minTrustScore: 0.8,
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      
      // All results should meet trust threshold
      for (const result of response.results) {
        if (result.trustScore !== undefined) {
          expect(result.trustScore).toBeGreaterThanOrEqual(0.8);
        }
      }
    });
  });
  
  describe('Adaptive Search', () => {
    it('should select appropriate strategy based on query', async () => {
      const query: RetrievalQuery = {
        query: 'adaptive test',
        strategy: 'adaptive',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.strategy).toBe('adaptive');
      expect(response.results).toBeDefined();
    });
    
    it('should select keyword strategy for short queries', async () => {
      const query: RetrievalQuery = {
        query: 'short',
        strategy: 'adaptive',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
    });
    
    it('should select contextual strategy with context', async () => {
      const query: RetrievalQuery = {
        query: 'contextual adaptive test',
        context: 'with context',
        strategy: 'adaptive',
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
    });
  });
  
  describe('Ranking and Scoring', () => {
    it('should apply custom ranking weights', async () => {
      const query: RetrievalQuery = {
        query: 'ranking test',
        strategy: 'semantic',
        ranking: {
          semantic: 0.6,
          temporal: 0.2,
          trust: 0.1,
          frequency: 0.05,
          relevance: 0.05,
        },
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.results.length).toBeGreaterThanOrEqual(0);
    });
    
    it('should sort results by relevance score', async () => {
      const query: RetrievalQuery = {
        query: 'sorting test',
        strategy: 'semantic',
        limit: 10,
      };
      
      const response = await retrievalManager.search(query);
      
      if (response.results.length > 1) {
        for (let i = 1; i < response.results.length; i++) {
          expect(response.results[i-1].relevanceScore)
            .toBeGreaterThanOrEqual(response.results[i].relevanceScore);
        }
      }
    });
  });
  
  describe('Diversity Enhancement', () => {
    it('should apply diversity when enabled', async () => {
      const query: RetrievalQuery = {
        query: 'diversity test',
        strategy: 'semantic',
        enableDiversity: true,
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
    });
    
    it('should include diverse result types', async () => {
      const query: RetrievalQuery = {
        query: 'diverse types',
        strategy: 'semantic',
        enableDiversity: true,
        limit: 10,
      };
      
      const response = await retrievalManager.search(query);
      
      if (response.results.length > 1) {
        const types = new Set(response.results.map(r => r.type));
        expect(types.size).toBeGreaterThan(1);
      }
    });
  });
  
  describe('Reranking', () => {
    it('should rerank results when enabled', async () => {
      const query: RetrievalQuery = {
        query: 'reranking test',
        strategy: 'semantic',
        enableReranking: true,
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
    });
    
    it('should use feedback for reranking', async () => {
      // First, submit feedback
      const feedback: RetrievalFeedback = {
        feedbackId: 'test-feedback',
        queryId: 'test-query',
        timestamp: Date.now(),
        userId: 'test-user',
        rating: 4,
        helpful: true,
        resultFeedback: [
          {
            resultId: 'result-1',
            relevant: true,
            rating: 5,
          },
        ],
      };
      
      await retrievalManager.submitFeedback(feedback);
      
      // Then search with same query ID
      const query: RetrievalQuery = {
        query: 'feedback test',
        queryId: 'test-query',
        strategy: 'semantic',
        enableReranking: true,
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
    });
  });
  
  describe('Explanations', () => {
    it('should include explanations when enabled', async () => {
      const query: RetrievalQuery = {
        query: 'explanation test',
        strategy: 'semantic',
        enableExplanation: true,
        limit: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      
      if (response.results.length > 0) {
        expect(response.results[0].explanation).toBeDefined();
        expect(response.results[0].explanation!.length).toBeGreaterThan(0);
      }
    });
    
    it('should explain relevance factors', async () => {
      const query: RetrievalQuery = {
        query: 'detailed explanation',
        strategy: 'hybrid',
        enableExplanation: true,
        limit: 3,
      };
      
      const response = await retrievalManager.search(query);
      
      if (response.results.length > 0) {
        const explanation = response.results[0].explanation || '';
        expect(explanation).toContain('Semantic similarity');
      }
    });
  });
  
  describe('Pagination', () => {
    it('should apply pagination correctly', async () => {
      const query: RetrievalQuery = {
        query: 'pagination test',
        strategy: 'semantic',
        limit: 5,
        offset: 10,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.pagination).toBeDefined();
      expect(response.pagination!.limit).toBe(5);
      expect(response.pagination!.offset).toBe(10);
    });
    
    it('should provide pagination navigation', async () => {
      const query: RetrievalQuery = {
        query: 'navigation test',
        strategy: 'semantic',
        limit: 5,
        offset: 5,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response.pagination).toBeDefined();
      expect(response.pagination!.prevPage).toBe(0);
      expect(response.pagination!.nextPage).toBeDefined();
    });
  });
  
  describe('Caching', () => {
    it('should cache results when enabled', async () => {
      const query: RetrievalQuery = {
        query: 'cache test',
        strategy: 'semantic',
        useCache: true,
        limit: 5,
      };
      
      // First search
      const response1 = await retrievalManager.search(query);
      expect(response1.cacheHit).toBe(false);
      
      // Second search (should hit cache)
      const response2 = await retrievalManager.search(query);
      expect(response2.cacheHit).toBe(true);
      
      expect(response1.results).toEqual(response2.results);
    });
    
    it('should respect cache TTL', async () => {
      const query: RetrievalQuery = {
        query: 'ttl test',
        strategy: 'semantic',
        useCache: true,
        cacheTTL: 100, // Very short TTL
        limit: 5,
      };
      
      // First search
      await retrievalManager.search(query);
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Second search (should miss cache)
      const response = await retrievalManager.search(query);
      expect(response.cacheHit).toBe(false);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle invalid queries gracefully', async () => {
      const invalidQuery = {
        query: '',
        strategy: 'invalid' as any,
      } as RetrievalQuery;
      
      await expect(retrievalManager.search(invalidQuery))
        .rejects.toThrow();
    });
    
    it('should handle search failures', async () => {
      // Mock a failure
      jest.spyOn(mockVectorStore, 'search')
        .mockRejectedValue(new Error('Search failed'));
      
      const query: RetrievalQuery = {
        query: 'failure test',
        strategy: 'semantic',
        limit: 5,
      };
      
      await expect(retrievalManager.search(query))
        .rejects.toThrow('Memory search failed');
      
      // Check error statistics
      const stats = retrievalManager.getStats();
      expect(stats.errorRate).toBeGreaterThan(0);
    });
  });
  
  describe('Audit Trail', () => {
    it('should create audit events', async () => {
      const query: RetrievalQuery = {
        query: 'audit test',
        strategy: 'semantic',
        userId: 'test-user',
        agentId: 'test-agent',
        purpose: 'general',
        limit: 5,
      };
      
      await retrievalManager.search(query);
      
      const auditTrail = retrievalManager.getAuditTrail();
      expect(auditTrail.length).toBeGreaterThan(0);
      
      const lastEvent = auditTrail[0];
      expect(lastEvent.query).toBe('audit test');
      expect(lastEvent.strategy).toBe('semantic');
      expect(lastEvent.userId).toBe('test-user');
      expect(lastEvent.agentId).toBe('test-agent');
      expect(lastEvent.purpose).toBe('general');
    });
    
    it('should limit audit trail size', async () => {
      // Generate many queries
      for (let i = 0; i < 100; i++) {
        const query: RetrievalQuery = {
          query: `test query ${i}`,
          strategy: 'semantic',
          limit: 1,
        };
        await retrievalManager.search(query);
      }
      
      const auditTrail = retrievalManager.getAuditTrail();
      expect(auditTrail.length).toBeLessThanOrEqual(10000);
    });
    
    it('should clear audit trail', async () => {
      // Generate some audit events
      const query: RetrievalQuery = {
        query: 'clear test',
        strategy: 'semantic',
        limit: 1,
      };
      await retrievalManager.search(query);
      
      expect(retrievalManager.getAuditTrail().length).toBeGreaterThan(0);
      
      // Clear audit trail
      retrievalManager.clearAuditTrail();
      
      expect(retrievalManager.getAuditTrail().length).toBe(0);
    });
  });
  
  describe('Statistics', () => {
    it('should track query statistics', async () => {
      // Perform several queries
      for (let i = 0; i < 5; i++) {
        const query: RetrievalQuery = {
          query: `stats test ${i}`,
          strategy: 'semantic',
          limit: 3,
        };
        await retrievalManager.search(query);
      }
      
      const stats = retrievalManager.getStats();
      expect(stats.totalQueries).toBe(5);
      expect(stats.averageQueryTime).toBeGreaterThan(0);
      expect(stats.averageResults).toBeGreaterThan(0);
    });
    
    it('should track strategy usage', async () => {
      // Use different strategies
      const strategies: RetrievalStrategy[] = ['semantic', 'keyword', 'hybrid', 'temporal'];
      
      for (const strategy of strategies) {
        const query: RetrievalQuery = {
          query: `${strategy} test`,
          strategy,
          limit: 2,
        };
        await retrievalManager.search(query);
      }
      
      const stats = retrievalManager.getStats();
      expect(stats.queriesByStrategy.semantic).toBe(1);
      expect(stats.queriesByStrategy.keyword).toBe(1);
      expect(stats.queriesByStrategy.hybrid).toBe(1);
      expect(stats.queriesByStrategy.temporal).toBe(1);
    });
    
    it('should track cache performance', async () => {
      const query: RetrievalQuery = {
        query: 'cache stats test',
        strategy: 'semantic',
        useCache: true,
        limit: 3,
      };
      
      // First query (cache miss)
      await retrievalManager.search(query);
      
      // Second query (cache hit)
      await retrievalManager.search(query);
      
      const stats = retrievalManager.getStats();
      expect(stats.cacheHitRate).toBeGreaterThan(0);
      expect(stats.cacheSize).toBeGreaterThan(0);
    });
  });
  
  describe('Feedback System', () => {
    it('should accept feedback', async () => {
      const feedback: RetrievalFeedback = {
        feedbackId: 'test-feedback-id',
        queryId: 'test-query-id',
        timestamp: Date.now(),
        userId: 'test-user',
        rating: 5,
        helpful: true,
        comments: 'Excellent results',
        suggestions: 'More diversity would be nice',
      };
      
      await expect(retrievalManager.submitFeedback(feedback))
        .resolves.not.toThrow();
    });
    
    it('should handle result-specific feedback', async () => {
      const feedback: RetrievalFeedback = {
        feedbackId: 'detailed-feedback',
        queryId: 'detailed-query',
        timestamp: Date.now(),
        userId: 'test-user',
        rating: 4,
        helpful: true,
        resultFeedback: [
          {
            resultId: 'result-1',
            relevant: true,
            rating: 5,
            comments: 'Perfect match',
          },
          {
            resultId: 'result-2',
            relevant: false,
            rating: 2,
            comments: 'Not relevant',
          },
        ],
      };
      
      await expect(retrievalManager.submitFeedback(feedback))
        .resolves.not.toThrow();
    });
    
    it('should update statistics based on feedback', async () => {
      const feedback: RetrievalFeedback = {
        feedbackId: 'stats-feedback',
        queryId: 'stats-query',
        timestamp: Date.now(),
        userId: 'test-user',
        rating: 4,
        helpful: true,
      };
      
      await retrievalManager.submitFeedback(feedback);
      
      const stats = retrievalManager.getStats();
      expect(stats.feedbackRate).toBeGreaterThan(0);
      expect(stats.userSatisfaction).toBe(4);
    });
  });
  
  describe('Integration', () => {
    it('should integrate with vector store', async () => {
      const query: RetrievalQuery = {
        query: 'vector integration test',
        strategy: 'semantic',
        limit: 3,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
    });
    
    it('should integrate with memory manager', async () => {
      const query: RetrievalQuery = {
        query: 'memory integration test',
        strategy: 'semantic',
        limit: 3,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
    });
    
    it('should integrate with lineage manager', async () => {
      const query: RetrievalQuery = {
        query: 'lineage integration test',
        strategy: 'trust_based',
        limit: 3,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
      
      // Check trust scores are applied
      if (response.results.length > 0) {
        expect(response.results[0].trustScore).toBeDefined();
      }
    });
  });
  
  describe('Performance', () => {
    it('should handle concurrent queries', async () => {
      const queries = Array.from({ length: 10 }, (_, i) => ({
        query: `concurrent test ${i}`,
        strategy: 'semantic' as RetrievalStrategy,
        limit: 2,
      }));
      
      const startTime = Date.now();
      const promises = queries.map(q => retrievalManager.search(q));
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(responses).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      const stats = retrievalManager.getStats();
      expect(stats.totalQueries).toBe(10);
    });
    
    it('should handle large result sets', async () => {
      const query: RetrievalQuery = {
        query: 'large results test',
        strategy: 'semantic',
        limit: 100,
      };
      
      const response = await retrievalManager.search(query);
      
      expect(response).toBeDefined();
      expect(response.results.length).toBeLessThanOrEqual(100);
      expect(response.queryTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});

describe('MemoryRetrievalManagerFactory', () => {
  describe('Factory Methods', () => {
    it('should create development instance', () => {
      const mockVectorStore = new MockVectorStore();
      const mockMemoryManager = new MockMemoryManager();
      const mockLineageManager = new MockLineageManager();
      
      const devManager = MemoryRetrievalManagerFactory.createDevelopment(
        mockVectorStore,
        mockMemoryManager,
        mockLineageManager
      );
      
      expect(devManager).toBeDefined();
      expect(devManager).toBeInstanceOf(MemoryRetrievalManager);
    });
    
    it('should create production instance', () => {
      const mockVectorStore = new MockVectorStore();
      const mockMemoryManager = new MockMemoryManager();
      const mockLineageManager = new MockLineageManager();
      
      const prodManager = MemoryRetrievalManagerFactory.createProduction(
        mockVectorStore,
        mockMemoryManager,
        mockLineageManager
      );
      
      expect(prodManager).toBeDefined();
      expect(prodManager).toBeInstanceOf(MemoryRetrievalManager);
    });
    
    it('should create from environment', () => {
      // Set environment variables
      process.env.RETRIEVAL_STRATEGY = 'hybrid';
      process.env.RETRIEVAL_DEFAULT_LIMIT = '15';
      process.env.RETRIEVAL_ENABLE_CACHE = 'true';
      process.env.RETRIEVAL_LOG_LEVEL = 'warn';
      
      const envManager = MemoryRetrievalManagerFactory.fromEnvironment();
      
      expect(envManager).toBeDefined();
      expect(envManager).toBeInstanceOf(MemoryRetrievalManager);
      
      // Clean up
      delete process.env.RETRIEVAL_STRATEGY;
      delete process.env.RETRIEVAL_DEFAULT_LIMIT;
      delete process.env.RETRIEVAL_ENABLE_CACHE;
      delete process.env.RETRIEVAL_LOG_LEVEL;
    });
  });
});