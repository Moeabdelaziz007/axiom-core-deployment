/**
 * AIX Vector Embedding Service
 * 
 * This module provides semantic embedding capabilities for sovereign agents,
 * enabling them to understand, compare, and retrieve information
 * based on meaning rather than exact matches. Critical for:
 * - Thought similarity and clustering
 * - Memory retrieval and context understanding
 * - Swarm coordination and knowledge sharing
 * - Tool selection and capability matching
 */

import { createHash } from 'crypto';
import { z } from 'zod';
import { ThoughtUnit, ReActTrace } from './schema';

/**
 * Embedding Provider Types - Different embedding services
 */
export const EmbeddingProviderSchema = z.enum([
  'openai',          // OpenAI text-embedding-ada-002
  'huggingface',     // Hugging Face sentence transformers
  'local',           // Local embedding models
  'cohere',          // Cohere embedding API
  'sentence_transformers', // Sentence-transformers library
  'custom',          // Custom embedding function
]);

export type EmbeddingProvider = z.infer<typeof EmbeddingProviderSchema>;

/**
 * Embedding Configuration - Service configuration
 */
export const EmbeddingConfigSchema = z.object({
  provider: EmbeddingProviderSchema.describe('Embedding service provider'),
  model: z.string().describe('Model name for embeddings'),
  dimension: z.number().describe('Embedding vector dimension'),
  batchSize: z.number().default(100).describe('Batch processing size'),
  maxTokens: z.number().default(8191).describe('Maximum tokens per text'),
  apiKey: z.string().optional().describe('API key for external services'),
  endpoint: z.string().optional().describe('Custom endpoint URL'),
  timeout: z.number().default(30000).describe('Request timeout in ms'),
  retryAttempts: z.number().default(3).describe('Maximum retry attempts'),
});

export type EmbeddingConfig = z.infer<typeof EmbeddingConfigSchema>;

/**
 * Embedding Result - Result from embedding service
 */
export const EmbeddingResultSchema = z.object({
  vector: z.array(z.number()).describe('Embedding vector'),
  dimensions: z.number().describe('Vector dimensions'),
  tokensUsed: z.number().describe('Tokens consumed for embedding'),
  processingTime: z.number().describe('Processing time in ms'),
  model: z.string().describe('Model used for embedding'),
  provider: EmbeddingProviderSchema.describe('Provider used'),
  hash: z.string().describe('Hash of original text'),
  timestamp: z.number().describe('When embedding was generated'),
});

export type EmbeddingResult = z.infer<typeof EmbeddingResultSchema>;

/**
 * Similarity Result - Result of vector comparison
 */
export const SimilarityResultSchema = z.object({
  similarity: z.number().describe('Similarity score 0-1'),
  distance: z.number().describe('Euclidean distance'),
  cosine: z.number().describe('Cosine similarity'),
  thoughtId: z.string().optional().describe('Related thought ID'),
  traceId: z.string().optional().describe('Related trace ID'),
  metadata: z.record(z.any()).optional().describe('Additional metadata'),
});

export type SimilarityResult = z.infer<typeof SimilarityResultSchema>;

/**
 * Embedding Cache Entry - Cached embedding result
 */
export const EmbeddingCacheEntrySchema = z.object({
  text: z.string().describe('Original text'),
  embedding: z.array(z.number()).describe('Cached embedding vector'),
  hash: z.string().describe('Hash of original text'),
  timestamp: z.number().describe('When cached'),
  accessCount: z.number().default(0).describe('Access frequency'),
  lastAccessed: z.number().describe('Last access time'),
  ttl: z.number().describe('Time to live in ms'),
});

export type EmbeddingCacheEntry = z.infer<typeof EmbeddingCacheEntrySchema>;

/**
 * AIX Embedding Service - Core embedding functionality
 */
export class AIXEmbeddingService {
  private config: EmbeddingConfig;
  private cache: Map<string, EmbeddingCacheEntry> = new Map();
  private cacheMaxSize: number = 10000;
  private defaultTTL: number = 3600000; // 1 hour

  constructor(config: EmbeddingConfig) {
    this.config = config;
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const startTime = Date.now();
    const textHash = this.generateTextHash(text);

    // Check cache first
    const cached = this.getCachedEmbedding(textHash);
    if (cached) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();

      return {
        vector: cached.embedding,
        dimensions: this.config.dimension,
        tokensUsed: 0, // Cached, no new tokens
        processingTime: Date.now() - startTime,
        model: this.config.model,
        provider: this.config.provider,
        hash: textHash,
        timestamp: cached.timestamp,
      };
    }

    try {
      let embedding: number[];

      switch (this.config.provider) {
        case 'openai':
          embedding = await this.generateOpenAIEmbedding(text);
          break;

        case 'huggingface':
          embedding = await this.generateHuggingFaceEmbedding(text);
          break;

        case 'local':
          embedding = await this.generateLocalEmbedding(text);
          break;

        case 'cohere':
          embedding = await this.generateCohereEmbedding(text);
          break;

        case 'sentence_transformers':
          embedding = await this.generateSentenceTransformersEmbedding(text);
          break;

        case 'custom':
          throw new Error('Custom provider requires custom implementation');
          
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }

      const processingTime = Date.now() - startTime;

      // Cache the result
      this.cacheEmbedding(textHash, embedding);

      return {
        vector: embedding,
        dimensions: this.config.dimension,
        tokensUsed: this.estimateTokenCount(text),
        processingTime,
        model: this.config.model,
        provider: this.config.provider,
        hash: textHash,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error(`Embedding generation failed:`, error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for batch of texts
   */
  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    
    // Process in batches
    for (let i = 0; i < texts.length; i += this.config.batchSize) {
      const batch = texts.slice(i, i + this.config.batchSize);
      const batchResults = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Calculate similarity between two embeddings
   */
  calculateSimilarity(
    embedding1: number[],
    embedding2: number[]
  ): SimilarityResult {
    if (!embedding1 || !embedding2 || 
        embedding1.length !== embedding2.length) {
      return {
        similarity: 0,
        distance: Infinity,
        cosine: 0,
      };
    }

    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    const cosine = norm1 === 0 || norm2 === 0 ? 0 : dotProduct / (norm1 * norm2);
    const euclideanDistance = Math.sqrt(
      embedding1.reduce((sum, val, i) => {
        const diff = val - embedding2[i];
        return sum + diff * diff;
      }, 0)
    );

    return {
      similarity: cosine,
      distance: euclideanDistance,
      cosine,
    };
  }

  /**
   * Find most similar embeddings
   */
  findMostSimilar(
    queryEmbedding: number[],
    candidateEmbeddings: Array<{ id: string; embedding: number[]; metadata?: any }>,
    topK: number = 5,
    threshold: number = 0.7
  ): SimilarityResult[] {
    const similarities: SimilarityResult[] = candidateEmbeddings.map(candidate => {
      const similarity = this.calculateSimilarity(queryEmbedding, candidate.embedding);
      return {
        ...similarity,
        thoughtId: candidate.id,
        metadata: candidate.metadata,
      };
    });

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Filter by threshold and return top K
    return similarities
      .filter(result => result.similarity >= threshold)
      .slice(0, topK);
  }

  /**
   * Generate embedding for thought unit
   */
  async generateThoughtEmbedding(thought: ThoughtUnit): Promise<EmbeddingResult> {
    const text = this.prepareThoughtText(thought);
    const embedding = await this.generateEmbedding(text);
    
    // Store embedding reference in thought
    thought.embedding = embedding.vector;
    thought.vectorId = embedding.hash;
    
    return embedding;
  }

  /**
   * Generate embedding for ReAct trace
   */
  async generateTraceEmbedding(trace: ReActTrace): Promise<EmbeddingResult> {
    const text = this.prepareTraceText(trace);
    const embedding = await this.generateEmbedding(text);
    
    // Store embedding reference in trace
    trace.vectorId = embedding.hash;
    
    return embedding;
  }

  /**
   * Search thoughts by semantic similarity
   */
  async searchSimilarThoughts(
    queryText: string,
    thoughts: ThoughtUnit[],
    topK: number = 10
  ): Promise<Array<{ thought: ThoughtUnit; similarity: number }>> {
    const queryEmbedding = await this.generateEmbedding(queryText);
    
    const candidates = thoughts
      .filter(thought => thought.embedding && thought.embedding.length > 0)
      .map(thought => ({
        id: thought.id,
        embedding: thought.embedding!,
        metadata: {
          type: thought.type,
          confidence: thought.confidence,
          agentId: thought.agentId,
          tags: thought.tags,
        },
      }));

    const similarities = this.findMostSimilar(
      queryEmbedding.vector,
      candidates,
      topK
    );

    return similarities.map(similarity => {
      const thought = thoughts.find(t => t.id === similarity.thoughtId);
      return {
        thought: thought!,
        similarity: similarity.similarity,
      };
    }).filter(result => result.thought);
  }

  /**
   * Cluster thoughts by semantic similarity
   */
  async clusterThoughts(
    thoughts: ThoughtUnit[],
    threshold: number = 0.8
  ): Promise<Array<{ cluster: ThoughtUnit[]; centroid: number[] }>> {
    const embeddings = thoughts
      .filter(thought => thought.embedding && thought.embedding.length > 0)
      .map(thought => thought.embedding!);

    if (embeddings.length === 0) return [];

    const clusters: Array<{ cluster: ThoughtUnit[]; centroid: number[] }> = [];
    const visited = new Set<number>();

    for (let i = 0; i < embeddings.length; i++) {
      if (visited.has(i)) continue;

      const currentEmbedding = embeddings[i];
      const cluster: ThoughtUnit[] = [thoughts[i]];
      const clusterEmbeddings = [currentEmbedding];

      // Find similar embeddings
      for (let j = 0; j < embeddings.length; j++) {
        if (i === j || visited.has(j)) continue;

        const similarity = this.calculateSimilarity(currentEmbedding, embeddings[j]);
        if (similarity.similarity >= threshold) {
          cluster.push(thoughts[j]);
          clusterEmbeddings.push(embeddings[j]);
          visited.add(j);
        }
      }

      // Calculate centroid
      const centroid = this.calculateCentroid(clusterEmbeddings);
      clusters.push({ cluster, centroid });
    }

    return clusters;
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalRequests: number;
  } {
    const totalAccess = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);

    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? (totalAccess - this.cache.size) / totalAccess : 0,
      totalRequests: totalAccess + this.cache.size,
    };
  }

  /**
   * Generate OpenAI embedding
   */
  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key required');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: this.config.model || 'text-embedding-ada-002',
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Generate Hugging Face embedding
   */
  private async generateHuggingFaceEmbedding(text: string): Promise<number[]> {
    if (!this.config.apiKey) {
      throw new Error('Hugging Face API key required');
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${this.config.model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  }

  /**
   * Generate local embedding (mock implementation)
   */
  private async generateLocalEmbedding(text: string): Promise<number[]> {
    // Simple mock embedding - in production, use actual local model
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.config.dimension).fill(0);

    // Create simple word-based embedding
    const wordHash = (word: string) => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i);
        hash = hash & hash;
      }
      return hash;
    };

    for (let i = 0; i < Math.min(words.length, this.config.dimension); i++) {
      const word = words[i % words.length];
      embedding[i] = (wordHash(word) % 1000) / 1000;
    }

    return embedding;
  }

  /**
   * Generate Cohere embedding
   */
  private async generateCohereEmbedding(text: string): Promise<number[]> {
    if (!this.config.apiKey) {
      throw new Error('Cohere API key required');
    }

    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [text],
        model: this.config.model || 'small',
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embeddings[0];
  }

  /**
   * Generate Sentence Transformers embedding
   */
  private async generateSentenceTransformersEmbedding(text: string): Promise<number[]> {
    // Mock implementation - would use actual sentence-transformers library
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.config.dimension).fill(0);

    for (let i = 0; i < Math.min(words.length, this.config.dimension); i++) {
      const word = words[i % words.length];
      const charCodes = word.split('').map(char => char.charCodeAt(0));
      embedding[i] = charCodes.reduce((sum, code) => sum + code, 0) / charCodes.length;
    }

    return embedding;
  }

  /**
   * Get cached embedding
   */
  private getCachedEmbedding(textHash: string): EmbeddingCacheEntry | null {
    const cached = this.cache.get(textHash);
    
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(textHash);
      return null;
    }

    return cached;
  }

  /**
   * Cache embedding result
   */
  private cacheEmbedding(textHash: string, embedding: number[]): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.cacheMaxSize) {
      const oldestKey = Array.from(this.cache.keys())
        .reduce((oldest, key) => {
          const entry = this.cache.get(key)!;
          return entry.timestamp < this.cache.get(oldest)!.timestamp ? oldest : key;
        });

      this.cache.delete(oldestKey);
    }

    this.cache.set(textHash, {
      text: '', // Not storing original text for privacy
      embedding,
      hash: textHash,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      ttl: this.defaultTTL,
    });
  }

  /**
   * Generate hash for text
   */
  private generateTextHash(text: string): string {
    return createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
  }

  /**
   * Estimate token count
   */
  private estimateTokenCount(text: string): number {
    // Simple estimation - in production, use actual tokenizer
    return Math.ceil(text.length / 4);
  }

  /**
   * Prepare thought text for embedding
   */
  private prepareThoughtText(thought: ThoughtUnit): string {
    return `${thought.type}: ${thought.content} ` +
           `(confidence: ${thought.confidence}, ` +
           `agent: ${thought.agentId}, ` +
           `tags: ${thought.tags.join(', ')})`;
  }

  /**
   * Prepare trace text for embedding
   */
  private prepareTraceText(trace: ReActTrace): string {
    const thoughtsText = trace.thoughts
      .map(t => `${t.type}: ${t.content}`)
      .join(' -> ');

    const actionsText = trace.actions
      .map(a => `${a.toolName}(${JSON.stringify(a.params)})`)
      .join(' -> ');

    return `Trace: ${thoughtsText} -> Actions: ${actionsText} ` +
           `(conclusion: ${trace.conclusion || 'none'})`;
  }

  /**
   * Calculate centroid of embeddings
   */
  private calculateCentroid(embeddings: number[][]): number[] {
    if (embeddings.length === 0) return [];

    const dimensions = embeddings[0].length;
    const centroid = new Array(dimensions).fill(0);

    for (const embedding of embeddings) {
      for (let i = 0; i < dimensions; i++) {
        centroid[i] += embedding[i];
      }
    }

    return centroid.map(val => val / embeddings.length);
  }
}

/**
 * Embedding Service Factory - Creates configured embedding services
 */
export class EmbeddingServiceFactory {
  /**
   * Create OpenAI embedding service
   */
  static createOpenAIService(apiKey: string, model?: string): AIXEmbeddingService {
    return new AIXEmbeddingService({
      provider: 'openai',
      model: model || 'text-embedding-ada-002',
      dimension: 1536,
      apiKey,
      timeout: 30000,
    });
  }

  /**
   * Create Hugging Face embedding service
   */
  static createHuggingFaceService(apiKey: string, model: string): AIXEmbeddingService {
    return new AIXEmbeddingService({
      provider: 'huggingface',
      model,
      dimension: 768, // Typical for sentence transformers
      apiKey,
      timeout: 30000,
    });
  }

  /**
   * Create local embedding service
   */
  static createLocalService(model: string, dimension: number): AIXEmbeddingService {
    return new AIXEmbeddingService({
      provider: 'local',
      model,
      dimension,
      timeout: 10000,
    });
  }

  /**
   * Create Cohere embedding service
   */
  static createCohereService(apiKey: string, model?: string): AIXEmbeddingService {
    return new AIXEmbeddingService({
      provider: 'cohere',
      model: model || 'small',
      dimension: 4096,
      apiKey,
      timeout: 30000,
    });
  }
}