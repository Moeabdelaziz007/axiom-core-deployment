/**
 * Vector Store Tests - Comprehensive testing for QdrantVectorStore
 * 
 * This test suite provides comprehensive coverage for vector store operations
 * including CRUD operations, search functionality, error handling,
 * and performance monitoring.
 */

import { QdrantVectorStore, VectorStoreFactory, MemoryEntry, SearchRequest } from '../vector-store';
import { ThoughtUnit } from '../../aix/schema';

// Mock Qdrant client for testing
const mockQdrantClient = {
  getCollections: jest.fn(),
  createCollection: jest.fn(),
  deleteCollection: jest.fn(),
  getCollection: jest.fn(),
  upsert: jest.fn(),
  search: jest.fn(),
  retrieve: jest.fn(),
  delete: jest.fn(),
  healthCheck: jest.fn(),
};

// Mock QdrantClient constructor
jest.mock('@qdrant/js-client-rest', () => {
  return {
    QdrantClient: jest.fn().mockImplementation(() => mockQdrantClient),
  };
});

describe('QdrantVectorStore', () => {
  let vectorStore: QdrantVectorStore;
  let testConfig: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    testConfig = {
      url: 'http://localhost:6333',
      apiKey: 'test-key',
      defaultCollection: 'test_collection',
      vectorSize: 1536,
      distance: 'Cosine',
      batchSize: 10,
      maxRetries: 3,
      retryDelay: 100,
      searchLimit: 5,
      searchThreshold: 0.7,
      enableMetrics: true,
      logLevel: 'error', // Reduce log noise in tests
    };

    vectorStore = new QdrantVectorStore(testConfig);
  });

  afterEach(async () => {
    await vectorStore.close();
  });

  describe('Initialization', () => {
    it('should initialize with valid config', () => {
      expect(vectorStore).toBeInstanceOf(QdrantVectorStore);
    });

    it('should fail initialization with invalid config', () => {
      expect(() => {
        new QdrantVectorStore({ url: null });
      }).toThrow();
    });

    it('should initialize successfully when health check passes', async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [{ name: 'test_collection' }],
      });

      await expect(vectorStore.initialize()).resolves.not.toThrow();
    });

    it('should fail initialization when health check fails', async () => {
      mockQdrantClient.healthCheck.mockRejectedValue(new Error('Connection failed'));

      await expect(vectorStore.initialize()).rejects.toThrow();
    });

    it('should create default collection if not exists', async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [], // No collections exist
      });
      mockQdrantClient.createCollection.mockResolvedValue(undefined);

      await vectorStore.initialize();

      expect(mockQdrantClient.createCollection).toHaveBeenCalledWith(
        'test_collection',
        expect.objectContaining({
          vectors: expect.objectContaining({
            size: 1536,
            distance: 'Cosine',
          }),
        })
      );
    });
  });

  describe('Memory Entry Storage', () => {
    const testEntry: MemoryEntry = {
      id: 'test-memory-1',
      vector: Array.from({ length: 1536 }, () => Math.random()),
      content: 'Test memory content',
      contentType: 'thought',
      agentId: 'agent-123',
      timestamp: Date.now(),
      tags: ['test', 'memory'],
      confidence: 0.8,
    };

    beforeEach(async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [{ name: 'test_collection' }],
      });
      await vectorStore.initialize();
    });

    it('should store a single memory entry', async () => {
      mockQdrantClient.upsert.mockResolvedValue(undefined);

      const result = await vectorStore.storeEntry(testEntry);

      expect(result).toBe(testEntry.id);
      expect(mockQdrantClient.upsert).toHaveBeenCalledWith(
        'test_collection',
        expect.objectContaining({
          wait: true,
          points: expect.arrayContaining([
            expect.objectContaining({
              id: testEntry.id,
              vector: testEntry.vector,
              payload: expect.objectContaining({
                content: testEntry.content,
                contentType: testEntry.contentType,
                agentId: testEntry.agentId,
              }),
            }),
          ]),
        })
      );
    });

    it('should validate memory entry before storage', async () => {
      const invalidEntry = { ...testEntry, vector: null };

      await expect(vectorStore.storeEntry(invalidEntry as any)).rejects.toThrow();
    });

    it('should handle storage errors gracefully', async () => {
      mockQdrantClient.upsert.mockRejectedValue(new Error('Storage failed'));

      await expect(vectorStore.storeEntry(testEntry)).rejects.toThrow('Failed to store memory entry');
    });

    it('should update metrics after successful storage', async () => {
      mockQdrantClient.upsert.mockResolvedValue(undefined);

      await vectorStore.storeEntry(testEntry);

      const metrics = vectorStore.getMetrics();
      expect(metrics.totalOperations).toBeGreaterThan(0);
      expect(metrics.successfulOperations).toBeGreaterThan(0);
      expect(metrics.totalVectors).toBeGreaterThan(0);
    });
  });

  describe('Batch Storage', () => {
    const testEntries: MemoryEntry[] = Array.from({ length: 25 }, (_, i) => ({
      id: `test-memory-${i}`,
      vector: Array.from({ length: 1536 }, () => Math.random()),
      content: `Test memory content ${i}`,
      contentType: 'thought',
      agentId: 'agent-123',
      timestamp: Date.now(),
      tags: ['test', 'batch'],
      confidence: 0.8,
    }));

    beforeEach(async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [{ name: 'test_collection' }],
      });
      await vectorStore.initialize();
    });

    it('should store multiple entries in batches', async () => {
      mockQdrantClient.upsert.mockResolvedValue(undefined);

      const results = await vectorStore.storeBatch(testEntries);

      expect(results).toHaveLength(25);
      expect(results).toEqual(testEntries.map(e => e.id));
      
      // Should be called 3 times (10, 10, 5)
      expect(mockQdrantClient.upsert).toHaveBeenCalledTimes(3);
    });

    it('should handle empty batch', async () => {
      const results = await vectorStore.storeBatch([]);

      expect(results).toHaveLength(0);
      expect(mockQdrantClient.upsert).not.toHaveBeenCalled();
    });

    it('should update metrics correctly for batch operations', async () => {
      mockQdrantClient.upsert.mockResolvedValue(undefined);

      await vectorStore.storeBatch(testEntries);

      const metrics = vectorStore.getMetrics();
      expect(metrics.totalOperations).toBeGreaterThan(0);
      expect(metrics.totalVectors).toBe(25);
    });
  });

  describe('Memory Search', () => {
    const testQuery: SearchRequest = {
      query: 'test search query',
      limit: 5,
      threshold: 0.7,
      agentId: 'agent-123',
      includeMetadata: true,
    };

    const mockSearchResults = [
      {
        id: 'result-1',
        score: 0.9,
        payload: {
          content: 'Relevant content 1',
          contentType: 'thought',
          agentId: 'agent-123',
        },
      },
      {
        id: 'result-2',
        score: 0.8,
        payload: {
          content: 'Relevant content 2',
          contentType: 'thought',
          agentId: 'agent-123',
        },
      },
    ];

    beforeEach(async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [{ name: 'test_collection' }],
      });
      await vectorStore.initialize();
    });

    it('should search memories with query vector', async () => {
      const queryVector = Array.from({ length: 1536 }, () => Math.random());
      mockQdrantClient.search.mockResolvedValue(mockSearchResults);

      const results = await vectorStore.search({
        ...testQuery,
        vector: queryVector,
      });

      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({
        id: 'result-1',
        score: 0.9,
      });
      expect(mockQdrantClient.search).toHaveBeenCalledWith(
        'test_collection',
        expect.objectContaining({
          vector: queryVector,
          limit: 5,
          score_threshold: 0.7,
          filter: expect.any(Object),
          with_payload: true,
        })
      );
    });

    it('should build correct filters from search request', async () => {
      const complexQuery: SearchRequest = {
        ...testQuery,
        sessionId: 'session-456',
        contentType: 'trace',
        tags: ['important'],
        category: 'planning',
        trustLevel: 'high',
        after: 1000000,
        before: 2000000,
      };

      mockQdrantClient.search.mockResolvedValue([]);

      await vectorStore.search(complexQuery);

      expect(mockQdrantClient.search).toHaveBeenCalledWith(
        'test_collection',
        expect.objectContaining({
          filter: expect.objectContaining({
            must: expect.arrayContaining([
              expect.objectContaining({ key: 'agentId', match: { value: 'agent-123' } }),
              expect.objectContaining({ key: 'sessionId', match: { value: 'session-456' } }),
              expect.objectContaining({ key: 'contentType', match: { value: 'trace' } }),
              expect.objectContaining({ key: 'tags', match: { any: ['important'] } }),
              expect.objectContaining({ key: 'category', match: { value: 'planning' } }),
              expect.objectContaining({ key: 'trustLevel', match: { value: 'high' } }),
              expect.objectContaining({ key: 'timestamp', range: { gte: 1000000 } }),
              expect.objectContaining({ key: 'timestamp', range: { lte: 2000000 } }),
            ]),
          }),
        })
      );
    });

    it('should handle search errors gracefully', async () => {
      mockQdrantClient.search.mockRejectedValue(new Error('Search failed'));

      await expect(vectorStore.search(testQuery)).rejects.toThrow('Search failed');
    });

    it('should require query vector when not provided', async () => {
      await expect(vectorStore.search({ query: 'test' })).rejects.toThrow('Query vector not provided');
    });
  });

  describe('Memory Retrieval', () => {
    const mockRetrievedEntry = {
      id: 'memory-123',
      vector: Array.from({ length: 1536 }, () => Math.random()),
      payload: {
        content: 'Retrieved memory content',
        contentType: 'thought',
        agentId: 'agent-123',
        timestamp: Date.now(),
      },
    };

    beforeEach(async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [{ name: 'test_collection' }],
      });
      await vectorStore.initialize();
    });

    it('should retrieve memory by ID', async () => {
      mockQdrantClient.retrieve.mockResolvedValue([mockRetrievedEntry]);

      const result = await vectorStore.getEntry('memory-123');

      expect(result).toMatchObject({
        id: 'memory-123',
        content: 'Retrieved memory content',
        contentType: 'thought',
        agentId: 'agent-123',
      });
      expect(mockQdrantClient.retrieve).toHaveBeenCalledWith(
        'test_collection',
        expect.objectContaining({
          ids: ['memory-123'],
          with_payload: true,
          with_vector: true,
        })
      );
    });

    it('should return null for non-existent memory', async () => {
      mockQdrantClient.retrieve.mockResolvedValue([]);

      const result = await vectorStore.getEntry('non-existent');

      expect(result).toBeNull();
    });

    it('should handle retrieval errors gracefully', async () => {
      mockQdrantClient.retrieve.mockRejectedValue(new Error('Retrieval failed'));

      await expect(vectorStore.getEntry('memory-123')).rejects.toThrow('Failed to retrieve entry');
    });
  });

  describe('Memory Updates', () => {
    const existingEntry: MemoryEntry = {
      id: 'memory-123',
      vector: Array.from({ length: 1536 }, () => Math.random()),
      content: 'Original content',
      contentType: 'thought',
      agentId: 'agent-123',
      timestamp: Date.now(),
      tags: ['original'],
      confidence: 0.8,
    };

    beforeEach(async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [{ name: 'test_collection' }],
      });
      await vectorStore.initialize();
    });

    it('should update existing memory', async () => {
      mockQdrantClient.retrieve.mockResolvedValue([{
        id: 'memory-123',
        vector: existingEntry.vector,
        payload: existingEntry,
      }]);
      mockQdrantClient.upsert.mockResolvedValue(undefined);

      const updates = {
        content: 'Updated content',
        tags: ['updated'],
        confidence: 0.9,
      };

      await expect(vectorStore.updateEntry('memory-123', updates)).resolves.not.toThrow();

      expect(mockQdrantClient.upsert).toHaveBeenCalledWith(
        'test_collection',
        expect.objectContaining({
          wait: true,
          points: expect.arrayContaining([
            expect.objectContaining({
              id: 'memory-123',
              vector: existingEntry.vector,
              payload: expect.objectContaining({
                content: 'Updated content',
                tags: ['updated'],
                confidence: 0.9,
              }),
            }),
          ]),
        })
      );
    });

    it('should fail update for non-existent memory', async () => {
      mockQdrantClient.retrieve.mockResolvedValue([]);

      await expect(vectorStore.updateEntry('non-existent', { content: 'Updated' }))
        .rejects.toThrow('Memory entry not found');
    });
  });

  describe('Memory Deletion', () => {
    beforeEach(async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [{ name: 'test_collection' }],
      });
      await vectorStore.initialize();
    });

    it('should delete memory by ID', async () => {
      mockQdrantClient.delete.mockResolvedValue(undefined);

      await expect(vectorStore.deleteEntry('memory-123')).resolves.not.toThrow();

      expect(mockQdrantClient.delete).toHaveBeenCalledWith(
        'test_collection',
        expect.objectContaining({
          wait: true,
          points: ['memory-123'],
        })
      );
    });

    it('should handle deletion errors gracefully', async () => {
      mockQdrantClient.delete.mockRejectedValue(new Error('Deletion failed'));

      await expect(vectorStore.deleteEntry('memory-123')).rejects.toThrow('Failed to delete entry');
    });

    it('should update metrics after deletion', async () => {
      const initialMetrics = vectorStore.getMetrics();
      mockQdrantClient.delete.mockResolvedValue(undefined);

      await vectorStore.deleteEntry('memory-123');

      const finalMetrics = vectorStore.getMetrics();
      expect(finalMetrics.totalOperations).toBeGreaterThan(initialMetrics.totalOperations);
    });
  });

  describe('Collection Management', () => {
    beforeEach(async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      await vectorStore.initialize();
    });

    it('should create new collection', async () => {
      mockQdrantClient.createCollection.mockResolvedValue(undefined);

      await expect(vectorStore.createCollection('new_collection', 768)).resolves.not.toThrow();

      expect(mockQdrantClient.createCollection).toHaveBeenCalledWith(
        'new_collection',
        expect.objectContaining({
          vectors: expect.objectContaining({
            size: 768,
            distance: 'Cosine',
          }),
        })
      );
    });

    it('should delete collection', async () => {
      mockQdrantClient.deleteCollection.mockResolvedValue(undefined);

      await expect(vectorStore.deleteCollection('old_collection')).resolves.not.toThrow();

      expect(mockQdrantClient.deleteCollection).toHaveBeenCalledWith('old_collection');
    });

    it('should list all collections', async () => {
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [
          { name: 'collection1' },
          { name: 'collection2' },
          { name: 'collection3' },
        ],
      });

      const collections = await vectorStore.listCollections();

      expect(collections).toEqual(['collection1', 'collection2', 'collection3']);
    });

    it('should get collection information', async () => {
      const mockCollectionInfo = {
        name: 'test_collection',
        vectors_count: 1000,
        segments_count: 2,
      };
      mockQdrantClient.getCollection.mockResolvedValue(mockCollectionInfo);

      const info = await vectorStore.getCollectionInfo('test_collection');

      expect(info).toEqual(mockCollectionInfo);
    });
  });

  describe('Health Checks', () => {
    it('should pass health check when Qdrant is healthy', async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);

      const isHealthy = await vectorStore.healthCheck();

      expect(isHealthy).toBe(true);
    });

    it('should fail health check when Qdrant is unhealthy', async () => {
      mockQdrantClient.healthCheck.mockRejectedValue(new Error('Unhealthy'));

      const isHealthy = await vectorStore.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('Performance Metrics', () => {
    beforeEach(async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [{ name: 'test_collection' }],
      });
      await vectorStore.initialize();
    });

    it('should track operation metrics', async () => {
      mockQdrantClient.upsert.mockResolvedValue(undefined);

      // Perform several operations
      await vectorStore.storeEntry({
        id: 'test-1',
        vector: Array.from({ length: 1536 }, () => Math.random()),
        content: 'Test 1',
        contentType: 'thought',
        agentId: 'agent-1',
        timestamp: Date.now(),
      });

      await vectorStore.storeEntry({
        id: 'test-2',
        vector: Array.from({ length: 1536 }, () => Math.random()),
        content: 'Test 2',
        contentType: 'thought',
        agentId: 'agent-2',
        timestamp: Date.now(),
      });

      const metrics = vectorStore.getMetrics();

      expect(metrics.totalOperations).toBe(2);
      expect(metrics.successfulOperations).toBe(2);
      expect(metrics.failedOperations).toBe(0);
      expect(metrics.errorRate).toBe(0);
    });

    it('should calculate latency percentiles', async () => {
      // Simulate operations with different latencies
      const originalUpsert = mockQdrantClient.upsert;
      mockQdrantClient.upsert.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      });

      await vectorStore.storeEntry({
        id: 'test-1',
        vector: Array.from({ length: 1536 }, () => Math.random()),
        content: 'Test 1',
        contentType: 'thought',
        agentId: 'agent-1',
        timestamp: Date.now(),
      });

      const metrics = vectorStore.getMetrics();

      expect(metrics.averageLatency).toBeGreaterThan(90); // Should be around 100ms
      expect(metrics.p95Latency).toBeGreaterThan(0);
      expect(metrics.p99Latency).toBeGreaterThan(0);

      // Restore original mock
      mockQdrantClient.upsert = originalUpsert;
    });

    it('should reset metrics', () => {
      vectorStore.resetMetrics();

      const metrics = vectorStore.getMetrics();

      expect(metrics.totalOperations).toBe(0);
      expect(metrics.successfulOperations).toBe(0);
      expect(metrics.failedOperations).toBe(0);
      expect(metrics.averageLatency).toBe(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      mockQdrantClient.healthCheck.mockResolvedValue(true);
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [{ name: 'test_collection' }],
      });
      await vectorStore.initialize();
    });

    it('should handle network timeouts', async () => {
      mockQdrantClient.upsert.mockRejectedValue(new Error('Timeout'));

      await expect(vectorStore.storeEntry({
        id: 'test-timeout',
        vector: Array.from({ length: 1536 }, () => Math.random()),
        content: 'Timeout test',
        contentType: 'thought',
        agentId: 'agent-1',
        timestamp: Date.now(),
      })).rejects.toThrow();
    });

    it('should handle malformed responses', async () => {
      mockQdrantClient.retrieve.mockResolvedValue([null]); // Malformed response

      const result = await vectorStore.getEntry('malformed-test');

      expect(result).toBeNull(); // Should handle gracefully
    });

    it('should handle validation errors', async () => {
      const invalidEntry = {
        id: 'invalid',
        vector: 'not-an-array', // Invalid vector
        content: 'Test',
        contentType: 'thought',
        agentId: 'agent-1',
        timestamp: Date.now(),
      };

      await expect(vectorStore.storeEntry(invalidEntry as any)).rejects.toThrow();
    });
  });
});

describe('VectorStoreFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create vector store from environment', () => {
    process.env.QDRANT_URL = 'http://localhost:6333';
    process.env.QDRANT_API_KEY = 'env-key';
    process.env.QDRANT_DEFAULT_COLLECTION = 'env_collection';

    const store = VectorStoreFactory.fromEnvironment();

    expect(store).toBeInstanceOf(QdrantVectorStore);
  });

  it('should create local development store', () => {
    const store = VectorStoreFactory.createLocal();

    expect(store).toBeInstanceOf(QdrantVectorStore);
  });

  it('should create production store', () => {
    process.env.QDRANT_URL = 'http://prod-qdrant:6333';
    process.env.QDRANT_API_KEY = 'prod-key';

    const store = VectorStoreFactory.createProduction({
      searchLimit: 20,
    });

    expect(store).toBeInstanceOf(QdrantVectorStore);
  });
});