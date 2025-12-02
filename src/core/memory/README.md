# Sovereign Memory Architecture

The Sovereign Memory Architecture provides the foundation for agent memory systems, enabling semantic search, context-aware retrieval, and scalable storage for thousands of agents with complete provenance tracking.

## Overview

This memory system is built on Qdrant vector database and provides:

- **Semantic Memory Search**: Agents can find related thoughts and experiences using vector similarity
- **Context-Aware Retrieval**: Memory retrieval with relevant context and metadata filtering
- **Scalable Storage**: High-performance vector operations for thousands of agents
- **Memory Lineage**: Complete provenance tracking for all stored information
- **Performance Optimization**: Intelligent caching, consolidation, and archival strategies

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AIX System   │    │  Memory Manager  │    │  Vector Store   │
│                 │    │                  │    │                 │
│ • ThoughtUnit   │───▶│ • High-level     │───▶│ • QdrantClient  │
│ • ReActTrace   │    │   interface     │    │ • Collections   │
│ • DataLineage   │    │ • Caching       │    │ • CRUD Ops     │
│ • Embeddings    │    │ • Optimization  │    │ • Search        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Core Components

### 1. QdrantVectorStore

Low-level vector database operations with full CRUD functionality.

```typescript
import { QdrantVectorStore, VectorStoreFactory } from './vector-store';

// Create from environment
const vectorStore = VectorStoreFactory.fromEnvironment();

// Or create with custom config
const vectorStore = new QdrantVectorStore({
  url: 'http://localhost:6333',
  apiKey: 'your-api-key',
  defaultCollection: 'agent_memory',
  vectorSize: 1536,
  batchSize: 100,
});

// Initialize
await vectorStore.initialize();

// Store memory entry
const memoryId = await vectorStore.storeEntry({
  id: 'memory-123',
  vector: [0.1, 0.2, 0.3, ...], // 1536 dimensions
  content: 'Agent learned about user preferences',
  contentType: 'thought',
  agentId: 'agent-456',
  timestamp: Date.now(),
  tags: ['learning', 'preferences'],
  confidence: 0.8,
});

// Search memories
const results = await vectorStore.search({
  query: 'user preferences',
  vector: queryVector,
  limit: 10,
  threshold: 0.7,
  agentId: 'agent-456',
});
```

### 2. SovereignMemoryManager

High-level interface that integrates with AIX system components.

```typescript
import { SovereignMemoryManager } from './memory-manager';
import { AIXEmbeddingService } from '../aix/embedding-service';
import { DataLineageManager } from '../aix/data-lineage';

// Create memory manager
const memoryManager = new SovereignMemoryManager({
  vectorStore,
  embeddingService,
  lineageManager,
  maxMemoryAge: 86400000 * 30, // 30 days
  enableCaching: true,
  enableOptimization: true,
});

// Store thought from AIX system
const thought: ThoughtUnit = {
  id: 'thought-123',
  content: 'User prefers dark mode',
  type: 'observation',
  confidence: 0.9,
  agentId: 'agent-456',
  sessionId: 'session-789',
  // ... other thought properties
};

const memoryId = await memoryManager.storeThought(thought);

// Search with advanced query
const searchResults = await memoryManager.searchMemory({
  query: 'user interface preferences',
  agentId: 'agent-456',
  memoryTypes: ['thought', 'observation'],
  timeRange: {
    start: Date.now() - 86400000 * 7, // Last 7 days
    end: Date.now(),
  },
  minConfidence: 0.7,
  strategy: 'semantic',
  limit: 5,
});
```

### 3. Memory Cache

High-performance LRU caching with TTL and compression support.

```typescript
import { MemoryCache, MemoryCacheFactory } from './memory-cache';

// Create memory result cache
const cache = MemoryCacheFactory.createMemoryResultCache({
  maxSize: 1000,
  ttl: 3600000, // 1 hour
  enableStats: true,
});

// Use cache
const cached = cache.get('memory-123');
if (!cached) {
  const result = await fetchMemory('memory-123');
  cache.set('memory-123', result);
}

// Get statistics
const stats = cache.getStats();
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
```

### 4. Memory Optimizer

Intelligent memory optimization including consolidation, deduplication, and archival.

```typescript
import { MemoryOptimizer } from './memory-optimizer';

// Create optimizer
const optimizer = new MemoryOptimizer({
  enableConsolidation: true,
  enableDeduplication: true,
  enableArchival: true,
  consolidationThreshold: 1000,
  duplicateThreshold: 0.95,
  archivalAge: 86400000 * 90, // 90 days
}, vectorStore, embeddingService);

// Run optimization
const result = await optimizer.optimize();
console.log(`Optimized ${result.totalOptimized} memories`);
console.log(`Saved ${result.spaceSaved} bytes of storage`);
console.log(`Performance gain: ${(result.searchPerformanceGain * 100).toFixed(1)}%`);
```

## Configuration

### Environment Variables

```bash
# Qdrant Configuration
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-api-key
QDRANT_DEFAULT_COLLECTION=agent_memory
QDRANT_VECTOR_SIZE=1536
QDRANT_DISTANCE=Cosine
QDRANT_BATCH_SIZE=100
QDRANT_MAX_RETRIES=3
QDRANT_RETRY_DELAY=1000

# Search Configuration
QDRANT_SEARCH_LIMIT=10
QDRANT_SEARCH_THRESHOLD=0.7

# Performance Configuration
QDRANT_ENABLE_METRICS=true
QDRANT_LOG_LEVEL=info
```

### Configuration Schema

All components use Zod schemas for validation:

```typescript
const config = {
  url: 'http://localhost:6333',
  vectorSize: 1536,
  batchSize: 100,
  enableMetrics: true,
  logLevel: 'info',
};

// Automatically validated
const vectorStore = new QdrantVectorStore(config);
```

## Integration with AIX System

### Thought Unit Integration

```typescript
import { ThoughtUnitFactory } from '../aix/thought-unit';

// Create observation thought
const thought = ThoughtUnitFactory.createObservation(
  'agent-456',
  'User clicked dark mode toggle',
  'ui-interaction-123',
  0.9
);

// Store in memory with automatic embedding
const memoryId = await memoryManager.storeThought(thought);
```

### ReAct Trace Integration

```typescript
import { ReActTraceSchema } from '../aix/schema';

// Create complete reasoning trace
const trace = {
  id: 'trace-123',
  sessionId: 'session-789',
  title: 'User Preference Analysis',
  description: 'Analyzed user interface preferences',
  thoughts: [thought1, thought2, thought3],
  actions: [action1, action2],
  primaryAgentId: 'agent-456',
  startTime: Date.now() - 60000,
  endTime: Date.now(),
  conclusion: 'User prefers dark theme',
  success: true,
  confidence: 0.85,
};

// Store entire trace in memory
const traceMemoryId = await memoryManager.storeTrace(trace);
```

### Data Lineage Integration

```typescript
import { DataLineageUtils } from '../aix/data-lineage';

// Create data source for tool output
const dataSource = DataLineageUtils.createToolDataSource(
  'user-preference-analyzer',
  { preference: 'dark-mode', confidence: 0.9 },
  'agent-456',
  'high'
);

// Store with provenance tracking
const memoryId = await memoryManager.storeThought(thought, dataSource);
```

## Performance Optimization

### Caching Strategy

```typescript
// Multi-level caching
const memoryCache = MemoryCacheFactory.createMemoryResultCache({
  maxSize: 1000,
  ttl: 3600000, // 1 hour
});

const searchCache = MemoryCacheFactory.createSearchResultCache({
  maxSize: 500,
  ttl: 1800000, // 30 minutes
});

const embeddingCache = MemoryCacheFactory.createEmbeddingCache({
  maxSize: 2000,
  ttl: 7200000, // 2 hours
});
```

### Batch Operations

```typescript
// Store multiple thoughts efficiently
const thoughts = [thought1, thought2, thought3, ...];
const memoryIds = await Promise.all(
  thoughts.map(thought => memoryManager.storeThought(thought))
);

// Or use batch operations in vector store
const entries = thoughts.map(thought => ({
  id: thought.id,
  vector: thought.embedding,
  content: thought.content,
  contentType: 'thought',
  agentId: thought.agentId,
  timestamp: thought.timestamp,
}));

const batchIds = await vectorStore.storeBatch(entries);
```

### Memory Consolidation

```typescript
// Automatic consolidation runs every hour
const optimizer = new MemoryOptimizer({
  consolidationThreshold: 1000,
  similarityThreshold: 0.85,
  optimizationInterval: 3600000, // 1 hour
}, vectorStore, embeddingService);

// Manual consolidation
const result = await optimizer.optimize();
console.log(`Consolidated ${result.memoriesConsolidated} memories`);
console.log(`Removed ${result.duplicatesRemoved} duplicates`);
console.log(`Archived ${result.memoriesArchived} old memories`);
```

## Monitoring and Metrics

### Vector Store Metrics

```typescript
// Get comprehensive metrics
const metrics = vectorStore.getMetrics();

console.log(`Total operations: ${metrics.totalOperations}`);
console.log(`Success rate: ${((metrics.successfulOperations / metrics.totalOperations) * 100).toFixed(1)}%`);
console.log(`Average latency: ${metrics.averageLatency}ms`);
console.log(`P95 latency: ${metrics.p95Latency}ms`);
console.log(`Total vectors: ${metrics.totalVectors}`);
console.log(`Error rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
```

### Memory Manager Statistics

```typescript
// Get memory system statistics
const stats = memoryManager.getStats();

console.log(`Total memories: ${stats.totalMemories}`);
console.log(`Memories by agent:`, stats.memoriesByAgent);
console.log(`Memories by type:`, stats.memoriesByType);
console.log(`Average query time: ${stats.averageQueryTime}ms`);
console.log(`Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
console.log(`Average confidence: ${stats.averageConfidence}`);
```

### Optimization History

```typescript
// Get optimization results
const history = optimizer.getOptimizationHistory();

for (const result of history) {
  console.log(`Optimization at ${new Date(result.timestamp)}`);
  console.log(`  Processed: ${result.totalProcessed} memories`);
  console.log(`  Optimized: ${result.totalOptimized} memories`);
  console.log(`  Time: ${result.optimizationTime}ms`);
  console.log(`  Space saved: ${result.spaceSaved} bytes`);
  console.log(`  Quality improvement: ${result.qualityImprovement}`);
}
```

## Error Handling and Resilience

### Graceful Degradation

```typescript
// Handle Qdrant unavailability
try {
  await vectorStore.initialize();
} catch (error) {
  console.warn('Vector store unavailable, using fallback');
  // Implement fallback strategy
  return useFallbackMemory();
}

// Retry with exponential backoff
const maxRetries = 3;
const baseDelay = 1000;

for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    await vectorStore.storeEntry(entry);
    break; // Success
  } catch (error) {
    if (attempt === maxRetries - 1) throw error;
    
    const delay = baseDelay * Math.pow(2, attempt);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

### Health Monitoring

```typescript
// Continuous health monitoring
setInterval(async () => {
  const isHealthy = await vectorStore.healthCheck();
  if (!isHealthy) {
    console.error('Vector store unhealthy!');
    // Alert administrators
    await alertAdmins('Vector store health check failed');
  }
}, 60000); // Check every minute
```

## Best Practices

### 1. Memory Organization

```typescript
// Use consistent tagging
const memory = {
  content: 'User prefers dark mode',
  tags: ['preference', 'ui', 'theme', 'dark-mode'],
  category: 'user-preferences',
  agentId: 'agent-456',
  sessionId: 'session-789',
};

// Use hierarchical categories
const categories = [
  'user-preferences',
  'user-preferences.ui',
  'user-preferences.theme',
  'user-preferences.theme.colors',
];
```

### 2. Performance Optimization

```typescript
// Batch similar operations
const operations = [];
for (const thought of thoughts) {
  operations.push(() => memoryManager.storeThought(thought));
}
await Promise.all(operations);

// Use appropriate batch sizes
const batchSize = 100; // Optimal for most systems
for (let i = 0; i < entries.length; i += batchSize) {
  const batch = entries.slice(i, i + batchSize);
  await vectorStore.storeBatch(batch);
}
```

### 3. Memory Quality

```typescript
// Set appropriate confidence levels
const confidenceLevels = {
  'user-stated': 1.0,      // Direct user input
  'tool-verified': 0.9,     // Tool output
  'agent-inferred': 0.7,   // Agent reasoning
  'agent-hypothesis': 0.5,  // Agent speculation
};

// Use trust levels appropriately
const trustLevels = {
  'user-input': 'verified',
  'blockchain': 'authoritative',
  'tool-output': 'high',
  'agent-inference': 'medium',
  'external-api': 'low',
};
```

### 4. Memory Lifecycle

```typescript
// Implement memory lifecycle management
const memoryLifecycle = {
  // Short-term: hours to days
  'conversation-context': 86400000,     // 1 day
  'session-state': 3600000,           // 1 hour
  
  // Medium-term: weeks to months
  'user-preferences': 86400000 * 30,  // 30 days
  'learned-patterns': 86400000 * 90,  // 90 days
  
  // Long-term: permanent
  'core-knowledge': -1,              // Permanent
  'identity-information': -1,           // Permanent
};
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check QDRANT_URL environment variable
   - Verify Qdrant server is running
   - Check network connectivity

2. **Memory Not Found**
   - Verify collection exists
   - Check memory ID format
   - Ensure memory wasn't archived

3. **Poor Search Results**
   - Check query vector generation
   - Verify similarity threshold
   - Review embedding quality

4. **Performance Issues**
   - Monitor cache hit rates
   - Check batch sizes
   - Review optimization settings

### Debug Mode

```typescript
// Enable debug logging
const vectorStore = new QdrantVectorStore({
  url: 'http://localhost:6333',
  logLevel: 'debug',
  enableMetrics: true,
});

// Monitor detailed operations
vectorStore.on('operation', (event) => {
  console.debug('Vector store operation:', event);
});
```

## Migration Guide

### From Simple Storage

```typescript
// Old approach
const memories = [];
memories.push({ id: '1', content: 'Memory 1' });

// New approach
const memoryId = await memoryManager.storeThought({
  id: '1',
  content: 'Memory 1',
  type: 'observation',
  agentId: 'agent-1',
  confidence: 0.8,
  timestamp: Date.now(),
});
```

### From Basic Vector Search

```typescript
// Old approach
const similar = memories.filter(m => 
  m.content.toLowerCase().includes(query.toLowerCase())
);

// New approach
const results = await memoryManager.searchMemory({
  query,
  strategy: 'semantic',
  threshold: 0.7,
  limit: 10,
});
```

## API Reference

Detailed API documentation is available in the source files:

- [`vector-store.ts`](./vector-store.ts) - Low-level vector operations
- [`memory-manager.ts`](./memory-manager.ts) - High-level memory interface
- [`memory-cache.ts`](./memory-cache.ts) - Caching implementation
- [`memory-optimizer.ts`](./memory-optimizer.ts) - Optimization strategies

## Contributing

When contributing to the memory system:

1. Follow existing code patterns and TypeScript conventions
2. Add comprehensive tests for new functionality
3. Update documentation for API changes
4. Ensure backward compatibility
5. Test performance impact of changes

## License

This memory system is part of the Axiom Core project and follows the same licensing terms.