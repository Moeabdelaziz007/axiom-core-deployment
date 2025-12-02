/**
 * AIX Memory Protocol - Storage Protocol for Sovereign Agents
 * 
 * This module defines how thoughts and reasoning traces are stored
 * in vector database (Qdrant) with proper metadata and
 * access control. Critical for persistent memory, semantic search,
 * and knowledge persistence across agent lifecycles.
 * 
 * Designed to work with Qdrant vector database for efficient
 * semantic search and retrieval of agent memories.
 */

import { z } from 'zod';
import { ThoughtUnit, ReActTrace } from './schema';

/**
 * Memory Content Types - Different types of stored content
 */
export const MemoryContentTypeSchema = z.enum([
  'thought',         // Single thought unit
  'trace',           // Complete reasoning trace
  'action_result',   // Result from tool execution
  'session_context', // Session state information
  'learned_fact',   // Facts learned during reasoning
  'external_data',   // Data from external sources
]);

export type MemoryContentType = z.infer<typeof MemoryContentTypeSchema>;

/**
 * Memory Access Policy - Access control rules for memories
 * 
 * Defines who can access memories and under what conditions.
 * Critical for multi-agent systems and data privacy.
 */
export const MemoryAccessPolicySchema = z.object({
  // Core identification
  id: z.string().uuid().describe('Unique policy identifier'),
  name: z.string().describe('Human-readable policy name'),
  description: z.string().describe('Policy description'),
  
  // Access rules
  ownerAgentId: z.string().describe('Agent who owns this memory'),
  allowedAgents: z.array(z.string()).default([]).describe('Agents allowed to access'),
  allowedUsers: z.array(z.string()).default([]).describe('Users allowed to access'),
  publicAccess: z.boolean().default(false).describe('Whether memory is publicly accessible'),
  
  // Temporal restrictions
  validFrom: z.number().optional().describe('Unix timestamp when access becomes valid'),
  validUntil: z.number().optional().describe('Unix timestamp when access expires'),
  
  // Context requirements
  requiredContext: z.array(z.string()).default([]).describe('Required context for access'),
  minTrustLevel: z.enum(['low', 'medium', 'high']).default('medium').describe('Minimum trust level'),
  
  // Security and privacy
  encryptionRequired: z.boolean().default(false).describe('Whether encryption is required'),
  auditAccess: z.boolean().default(true).describe('Whether to log all access attempts'),
  
  // Metadata
  tags: z.array(z.string()).default([]).describe('Policy categorization tags'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium').describe('Access priority'),
});

export type MemoryAccessPolicy = z.infer<typeof MemoryAccessPolicySchema>;

/**
 * Memory Record - Core storage unit for agent memories
 * 
 * Represents how a thought or trace is stored in vector
 * database with all necessary metadata for retrieval and access control.
 */
export const MemoryRecordSchema = z.object({
  // Core identification
  id: z.string().uuid().describe('Unique memory record identifier'),
  thoughtId: z.string().describe('ID of thought unit stored'),
  traceId: z.string().optional().describe('ID of trace if applicable'),
  agentId: z.string().describe('DID of the agent who owns this memory'),
  
  // Vector and embedding data
  embeddingVector: z.array(z.number()).describe('Vector embedding for semantic search'),
  vectorId: z.string().describe('Qdrant vector ID for this record'),
  embeddingModel: z.string().describe('Model used to generate embedding'),
  embeddingDimension: z.number().describe('Dimension of the embedding vector'),
  
  // Content and metadata
  content: z.string().describe('Original thought/trace content'),
  contentType: MemoryContentTypeSchema.describe('Type of content stored'),
  summary: z.string().optional().describe('Summary of the content for quick preview'),
  
  // Temporal information
  timestamp: z.number().describe('Unix timestamp when memory was created'),
  lastAccessed: z.number().optional().describe('Last time this memory was accessed'),
  accessFrequency: z.number().default(0).describe('How often this memory is accessed'),
  
  // Access control and security
  accessPolicyId: z.string().describe('Security policy governing access to this memory'),
  encryptionKeyId: z.string().optional().describe('Key identifier if content is encrypted'),
  isEncrypted: z.boolean().default(false).describe('Whether the content is encrypted'),
  isPublic: z.boolean().default(false).describe('Whether this memory is publicly accessible'),
  
  // Search and retrieval optimization
  searchTags: z.array(z.string()).default([]).describe('Tags for semantic search optimization'),
  searchKeywords: z.array(z.string()).default([]).describe('Keywords for keyword search'),
  category: z.string().optional().describe('Category for classification'),
  importance: z.number().min(0).max(1).optional().describe('Importance score 0-1'),
  
  // Relationship and lineage
  parentMemoryIds: z.array(z.string()).optional().describe('Parent memory records this derives from'),
  childMemoryIds: z.array(z.string()).optional().describe('Child memories derived from this'),
  relatedMemoryIds: z.array(z.string()).optional().describe('Related memories for context'),
  
  // Performance and optimization
  size: z.number().describe('Size of stored content in bytes'),
  compressionLevel: z.enum(['none', 'lossless', 'lossy']).default('none').describe('Compression level applied'),
  isArchived: z.boolean().default(false).describe('Whether this memory is archived'),
  
  // Validation and integrity
  hash: z.string().describe('Hash of the content for integrity verification'),
  signature: z.string().optional().describe('Digital signature for authenticity verification'),
  checksum: z.string().optional().describe('Checksum for data validation'),
  
  // Versioning and migration
  version: z.string().default('1.0').describe('Memory record version'),
  migrationHistory: z.array(z.object({
    fromVersion: z.string(),
    toVersion: z.string(),
    timestamp: z.number(),
    reason: z.string(),
  })).optional().describe('Migration history for this memory record'),
});

export type MemoryRecord = z.infer<typeof MemoryRecordSchema>;

/**
 * Memory Search Query - Query parameters for memory retrieval
 * 
 * Defines how agents can search and retrieve memories from
 * the vector database with various filtering and ranking options.
 */
export const MemorySearchQuerySchema = z.object({
  // Core query parameters
  query: z.string().describe('Search query text or vector'),
  queryType: z.enum(['text', 'vector', 'hybrid']).default('text').describe('Type of search query'),
  agentId: z.string().optional().describe('Filter by specific agent'),
  sessionId: z.string().optional().describe('Filter by session context'),
  
  // Filtering and constraints
  contentType: MemoryContentTypeSchema.optional().describe('Filter by content type'),
  category: z.string().optional().describe('Filter by category'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  minImportance: z.number().min(0).max(1).optional().describe('Minimum importance score'),
  maxImportance: z.number().min(0).max(1).optional().describe('Maximum importance score'),
  
  // Temporal filtering
  fromTimestamp: z.number().optional().describe('Filter memories from this timestamp'),
  toTimestamp: z.number().optional().describe('Filter memories until this timestamp'),
  
  // Access control
  accessPolicyId: z.string().optional().describe('Filter by access policy'),
  isPublic: z.boolean().optional().describe('Filter by public accessibility'),
  hasEncryption: z.boolean().optional().describe('Filter by encryption status'),
  
  // Search parameters
  limit: z.number().min(1).max(1000).default(10).describe('Maximum number of results'),
  offset: z.number().min(0).default(0).describe('Offset for pagination'),
  sortBy: z.enum(['relevance', 'timestamp', 'importance', 'access_frequency']).default('relevance').describe('Sort order'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Sort direction'),
  
  // Advanced options
  includeVector: z.boolean().default(false).describe('Include embedding vectors in results'),
  includeContent: z.boolean().default(true).describe('Include full content in results'),
  includeMetadata: z.boolean().default(true).describe('Include metadata in results'),
  threshold: z.number().min(0).max(1).default(0.7).describe('Similarity threshold for vector search'),
});

export type MemorySearchQuery = z.infer<typeof MemorySearchQuerySchema>;

/**
 * Memory Search Result - Result from memory search operation
 * 
 * Represents the results of a memory search with ranking,
 * scoring, and pagination information.
 */
export const MemorySearchResultSchema = z.object({
  // Search metadata
  query: MemorySearchQuerySchema.describe('Original search query'),
  totalResults: z.number().describe('Total number of matching memories'),
  hasMore: z.boolean().describe('Whether more results are available'),
  
  // Results array
  results: z.array(z.object({
    // Core memory data
    memoryRecord: MemoryRecordSchema.describe('The matching memory record'),
    
    // Scoring and ranking
    relevanceScore: z.number().describe('Relevance score 0-1'),
    importanceScore: z.number().describe('Importance score 0-1'),
    combinedScore: z.number().describe('Combined ranking score'),
    
    // Search context
    matchType: z.enum(['exact', 'semantic', 'keyword', 'hybrid']).describe('How this result matched'),
    matchReason: z.string().optional().describe('Why this result matched'),
    
    // Performance metrics
    processingTime: z.number().describe('Time taken to find this result (ms)'),
  })).describe('Array of search results'),
  
  // Pagination
  nextOffset: z.number().optional().describe('Offset for next page'),
  pageSize: z.number().describe('Page size used'),
});

export type MemorySearchResult = z.infer<typeof MemorySearchResultSchema>;

/**
 * Memory Manager - Core memory management interface
 * 
 * Provides high-level interface for storing, retrieving, and managing
 * agent memories with proper access control and optimization.
 */
export class AIXMemoryManager {
  private records: Map<string, MemoryRecord> = new Map();
  private policies: Map<string, MemoryAccessPolicy> = new Map();
  private searchCache: Map<string, MemorySearchResult> = new Map();

  /**
   * Store a thought unit in memory
   */
  async storeThought(
     thought: ThoughtUnit,
     accessPolicyId?: string,
     encryptionKeyId?: string
   ): Promise<string> {
     const recordId = crypto.randomUUID();
     
     // Generate embedding vector (would use embedding service)
     const embeddingVector = await this.generateEmbedding(thought.content);
     
     const record: MemoryRecord = {
       id: recordId,
       thoughtId: thought.id,
       agentId: thought.agentId,
       embeddingVector,
       vectorId: `vector_${recordId}`,
       embeddingModel: 'default',
       embeddingDimension: embeddingVector.length,
       content: thought.content,
       contentType: 'thought',
       timestamp: Date.now(),
       accessPolicyId: accessPolicyId || 'default',
       encryptionKeyId,
       isEncrypted: !!encryptionKeyId,
       isPublic: false,
       searchTags: thought.tags,
       importance: this.calculateImportance(thought),
       hash: this.generateContentHash(thought.content),
       version: '1.0',
     };

     this.records.set(recordId, record);
     return recordId;
   }

   /**
   * Store a reasoning trace in memory
   */
   async storeTrace(
     trace: ReActTrace,
     accessPolicyId?: string,
     encryptionKeyId?: string
   ): Promise<string> {
     const recordId = crypto.randomUUID();
     
     // Generate embedding vector for trace summary
     const traceContent = this.generateTraceSummary(trace);
     const embeddingVector = await this.generateEmbedding(traceContent);
     
     const record: MemoryRecord = {
       id: recordId,
       traceId: trace.id,
       agentId: trace.primaryAgentId,
       embeddingVector,
       vectorId: `vector_${recordId}`,
       embeddingModel: 'default',
       embeddingDimension: embeddingVector.length,
       content: traceContent,
       contentType: 'trace',
       timestamp: Date.now(),
       accessPolicyId: accessPolicyId || 'default',
       encryptionKeyId,
       isEncrypted: !!encryptionKeyId,
       isPublic: false,
       searchTags: ['trace', 'reasoning'],
       importance: this.calculateTraceImportance(trace),
       hash: this.generateContentHash(traceContent),
       version: '1.0',
     };

     this.records.set(recordId, record);
     return recordId;
   }

   /**
   * Search memories by query
   */
   async searchMemories(query: MemorySearchQuery): Promise<MemorySearchResult> {
     const startTime = Date.now();
     
     // Check cache first
     const cacheKey = this.generateCacheKey(query);
     const cached = this.searchCache.get(cacheKey);
     if (cached) {
       return cached;
     }

     // Perform search
     const results = await this.performSearch(query);
     
     // Cache results
     const searchResult: MemorySearchResult = {
       query,
       totalResults: results.length,
       hasMore: results.length > query.limit,
       results: results.map(record => ({
         memoryRecord: record,
         relevanceScore: this.calculateRelevance(record, query),
         importanceScore: record.importance || 0.5,
         combinedScore: this.calculateCombinedScore(record, query),
         matchType: 'semantic',
         matchReason: 'Semantic similarity match',
         processingTime: Date.now() - startTime,
       })),
       nextOffset: query.offset + query.limit,
       pageSize: query.limit,
     };

     this.searchCache.set(cacheKey, searchResult);
     return searchResult;
   }

   /**
   * Get memory record by ID
   */
   getMemoryRecord(recordId: string): MemoryRecord | undefined {
     return this.records.get(recordId);
   }

   /**
   * Update memory record
   */
   updateMemoryRecord(
     recordId: string,
     updates: Partial<MemoryRecord>
   ): boolean {
     const existing = this.records.get(recordId);
     if (!existing) return false;

     const updated = { ...existing, ...updates };
     this.records.set(recordId, updated);
     return true;
   }

   /**
   * Delete memory record
   */
   deleteMemoryRecord(recordId: string): boolean {
     const deleted = this.records.delete(recordId);
     
     // Clear from cache
     for (const [key, cached] of this.searchCache) {
       if (cached.results.some(r => r.memoryRecord.id === recordId)) {
         this.searchCache.delete(key);
       }
     }
     
     return deleted;
   }

   /**
   * Generate embedding vector (mock implementation)
   */
   private async generateEmbedding(content: string): Promise<number[]> {
     // Mock embedding generation - in production, use actual embedding service
     const words = content.toLowerCase().split(/\s+/);
     const embedding = new Array(1536).fill(0);
     
     // Simple word-based embedding
     for (let i = 0; i < Math.min(words.length, 1536); i++) {
       const word = words[i % words.length];
       const charCodes = word.split('').map(char => char.charCodeAt(0));
       embedding[i] = charCodes.reduce((sum, code) => sum + code, 0) / charCodes.length;
     }
     
     return embedding;
   }

   /**
   * Calculate importance score for thought
   */
   private calculateImportance(thought: ThoughtUnit): number {
     let score = 0.5; // Base score
     
     // Boost based on confidence
     score += thought.confidence * 0.3;
     
     // Boost based on type
     const typeBoosts: Record<string, number> = {
       'observation': 0.1,
       'reasoning': 0.2,
       'plan': 0.3,
       'critique': 0.15,
       'synthesis': 0.25,
     };
     
     score += typeBoosts[thought.type] || 0;
     
     return Math.max(0, Math.min(1, score));
   }

   /**
   * Calculate importance score for trace
   */
   private calculateTraceImportance(trace: ReActTrace): number {
     let score = 0.7; // Base score for traces
     
     // Boost based on success
     if (trace.success !== undefined && trace.success) {
       score += 0.2;
     }
     
     // Boost based on complexity
     const complexity = (trace.thoughts.length + trace.actions.length) / 10;
     score += Math.min(0.1, complexity);
     
     return Math.max(0, Math.min(1, score));
   }

   /**
   * Generate trace summary for embedding
   */
   private generateTraceSummary(trace: ReActTrace): string {
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
   * Calculate relevance score
   */
   private calculateRelevance(record: MemoryRecord, query: MemorySearchQuery): number {
     // Simple relevance calculation based on content matching
     const queryWords = query.query.toLowerCase().split(/\s+/);
     const contentWords = record.content.toLowerCase().split(/\s+/);
     
     const intersection = new Set([...queryWords].filter(word => contentWords.includes(word)));
     const union = new Set([...queryWords, ...contentWords]);
     
     return intersection.size / union.size; // Jaccard similarity
   }

   /**
   * Calculate combined ranking score
   */
   private calculateCombinedScore(record: MemoryRecord, query: MemorySearchQuery): number {
     const relevance = this.calculateRelevance(record, query);
     const importance = record.importance || 0.5;
     const recency = this.calculateRecency(record.timestamp);
     
     // Weighted combination
     return (relevance * 0.4) + (importance * 0.4) + (recency * 0.2);
   }

   /**
   * Calculate recency score
   */
   private calculateRecency(timestamp: number): number {
     const now = Date.now();
     const age = now - timestamp;
     const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
     
     return Math.max(0, 1 - (age / maxAge));
   }

   /**
   * Generate cache key for search query
   */
   private generateCacheKey(query: MemorySearchQuery): string {
     return `${query.queryType}:${query.query}:${query.limit}:${query.offset}:${query.threshold}`;
   }

   /**
   * Perform actual search implementation
   */
   private async performSearch(query: MemorySearchQuery): Promise<MemoryRecord[]> {
     // This would integrate with Qdrant vector database
     // For now, simple text-based search
     const allRecords = Array.from(this.records.values());
     
     let filtered = allRecords;
     
     // Apply filters
     if (query.contentType) {
       filtered = filtered.filter(r => r.contentType === query.contentType);
     }
     
     if (query.agentId) {
       filtered = filtered.filter(r => r.agentId === query.agentId);
     }
     
     if (query.category) {
       filtered = filtered.filter(r => r.category === query.category);
     }
     
     if (query.tags && query.tags.length > 0) {
       filtered = filtered.filter(r => 
         query.tags.every(tag => r.searchTags.includes(tag))
       );
     }
     
     if (query.minImportance !== undefined) {
       filtered = filtered.filter(r => (r.importance || 0) >= query.minImportance);
     }
     
     if (query.maxImportance !== undefined) {
       filtered = filtered.filter(r => (r.importance || 0) <= query.maxImportance);
     }
     
     // Simple text matching for demo
     if (query.queryType === 'text') {
       const queryLower = query.query.toLowerCase();
       filtered = filtered.filter(r => 
         r.content.toLowerCase().includes(queryLower) ||
         r.searchTags.some(tag => tag.toLowerCase().includes(queryLower))
       );
     }
     
     // Sort results
     filtered.sort((a, b) => {
       const scoreA = this.calculateCombinedScore(a, query);
       const scoreB = this.calculateCombinedScore(b, query);
       
       if (query.sortOrder === 'desc') {
         return scoreB - scoreA;
       } else {
         return scoreA - scoreB;
       }
     });
     
     // Apply pagination
     const start = query.offset;
     const end = Math.min(start + query.limit, filtered.length);
     
     return filtered.slice(start, end);
   }

   /**
   * Generate content hash
   */
   private generateContentHash(content: string): string {
     return crypto.createHash('sha256').update(content).digest('hex');
   }
}

/**
 * Memory Utils - Utility functions for memory operations
 */
export class MemoryUtils {
   /**
    * Create memory access policy
    */
   static createAccessPolicy(
     ownerAgentId: string,
     options: Partial<MemoryAccessPolicy> = {}
   ): MemoryAccessPolicy {
     return {
       id: crypto.randomUUID(),
       name: options.name || 'Default Policy',
       description: options.description || 'Default access policy',
       ownerAgentId,
       allowedAgents: options.allowedAgents || [],
       allowedUsers: options.allowedUsers || [],
       publicAccess: options.publicAccess || false,
       validFrom: options.validFrom,
       validUntil: options.validUntil,
       requiredContext: options.requiredContext || [],
       minTrustLevel: options.minTrustLevel || 'medium',
       encryptionRequired: options.encryptionRequired || false,
       auditAccess: options.auditAccess !== false,
       tags: options.tags || [],
       priority: options.priority || 'medium',
     };
   }

   /**
    * Validate memory record
    */
   static validateMemoryRecord(record: any): { valid: boolean; errors: string[] } {
     const result = MemoryRecordSchema.safeParse(record);
     return {
       valid: result.success,
       errors: result.success ? [] : result.error.issues.map(i => i.message),
     };
   }

   /**
    * Calculate memory statistics
    */
   static getMemoryStats(records: MemoryRecord[]): {
     totalRecords: number;
     recordsByType: Record<string, number>;
     recordsByAgent: Record<string, number>;
     averageImportance: number;
     totalSize: number;
   } {
     const recordsByType: Record<string, number> = {};
     const recordsByAgent: Record<string, number> = {};
     let totalImportance = 0;
     let totalSize = 0;
     
     for (const record of records) {
       recordsByType[record.contentType] = (recordsByType[record.contentType] || 0) + 1;
       recordsByAgent[record.agentId] = (recordsByAgent[record.agentId] || 0) + 1;
       totalImportance += record.importance || 0;
       totalSize += record.size || 0;
     }
     
     return {
       totalRecords: records.length,
       recordsByType,
       recordsByAgent,
       averageImportance: records.length > 0 ? totalImportance / records.length : 0,
       totalSize,
     };
   }
}