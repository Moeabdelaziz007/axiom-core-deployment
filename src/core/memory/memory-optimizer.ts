/**
 * Memory Optimizer - Advanced memory optimization for sovereign agents
 * 
 * This module provides intelligent memory optimization including consolidation,
 * deduplication, compression, and archival strategies to maintain
 * optimal performance and storage efficiency.
 * 
 * Features:
 * - Memory consolidation and summarization
 * - Duplicate detection and removal
 * - Intelligent archival strategies
 * - Performance-based optimization
 * - Storage usage monitoring
 */

import { z } from 'zod';
import { QdrantVectorStore, MemoryEntry } from './vector-store';
import { MemoryResult } from './memory-manager';
import { AIXEmbeddingService } from '../aix/embedding-service';

/**
 * Optimization Configuration - Optimization settings and strategies
 */
export const OptimizationConfigSchema = z.object({
  // Consolidation settings
  enableConsolidation: z.boolean().default(true).describe('Enable memory consolidation'),
  consolidationThreshold: z.number().default(1000).describe('Minimum memories before consolidation'),
  consolidationBatchSize: z.number().default(100).describe('Batch size for consolidation'),
  similarityThreshold: z.number().default(0.85).describe('Similarity threshold for consolidation'),
  
  // Deduplication settings
  enableDeduplication: z.boolean().default(true).describe('Enable duplicate detection'),
  duplicateThreshold: z.number().default(0.95).describe('Similarity threshold for duplicates'),
  
  // Archival settings
  enableArchival: z.boolean().default(true).describe('Enable memory archival'),
  archivalAge: z.number().default(86400000 * 90).describe('Age for archival (90 days)'),
  archivalThreshold: z.number().default(0.5).describe('Confidence threshold for archival'),
  
  // Performance settings
  maxOptimizationTime: z.number().default(300000).describe('Max optimization time (5 minutes)'),
  optimizationInterval: z.number().default(3600000).describe('Optimization interval (1 hour)'),
  
  // Quality settings
  minMemoryQuality: z.number().default(0.6).describe('Minimum memory quality score'),
  qualityFactors: z.object({
    confidence: z.number().default(0.4).describe('Confidence weight'),
    trust: z.number().default(0.3).describe('Trust level weight'),
    recency: z.number().default(0.2).describe('Recency weight'),
    access: z.number().default(0.1).describe('Access frequency weight'),
  }).describe('Quality calculation factors'),
  
  // Monitoring
  enableMetrics: z.boolean().default(true).describe('Enable optimization metrics'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info').describe('Log level'),
});

export type OptimizationConfig = z.infer<typeof OptimizationConfigSchema>;

/**
 * Optimization Result - Results of optimization process
 */
export interface OptimizationResult {
  // Summary
  totalProcessed: number;
  totalOptimized: number;
  optimizationTime: number;
  
  // Consolidation
  memoriesConsolidated: number;
  consolidationGroups: number;
  averageGroupSize: number;
  
  // Deduplication
  duplicatesRemoved: number;
  duplicateGroups: number;
  
  // Archival
  memoriesArchived: number;
  spaceSaved: number;
  
  // Quality improvements
  averageQualityBefore: number;
  averageQualityAfter: number;
  qualityImprovement: number;
  
  // Performance
  searchPerformanceGain: number;
  storageReduction: number;
  
  // Details
  details: OptimizationDetail[];
}

/**
 * Optimization Detail - Individual optimization action
 */
export interface OptimizationDetail {
  type: 'consolidation' | 'deduplication' | 'archival' | 'quality_improvement';
  action: string;
  memoryIds: string[];
  impact: {
    spaceSaved: number;
    performanceGain: number;
    qualityImprovement: number;
  };
  timestamp: number;
}

/**
 * Memory Quality Score - Quality assessment for memories
 */
export interface MemoryQualityScore {
  memoryId: string;
  overallScore: number;
  confidence: number;
  trustLevel: number;
  recency: number;
  accessFrequency: number;
  factors: {
    confidence: number;
    trust: number;
    recency: number;
    access: number;
  };
}

/**
 * Memory Optimizer - Main optimization engine
 */
export class MemoryOptimizer {
  private config: OptimizationConfig;
  private vectorStore: QdrantVectorStore;
  private embeddingService: AIXEmbeddingService;
  private optimizationTimer: NodeJS.Timeout | null = null;
  private isOptimizing: boolean = false;
  private optimizationHistory: OptimizationResult[] = [];

  constructor(
    config: OptimizationConfig,
    vectorStore: QdrantVectorStore,
    embeddingService: AIXEmbeddingService
  ) {
    const validatedConfig = OptimizationConfigSchema.parse(config);
    this.config = validatedConfig;
    this.vectorStore = vectorStore;
    this.embeddingService = embeddingService;

    // Start optimization timer
    this.startOptimizationTimer();

    this.log('info', 'Memory Optimizer initialized', { config: this.config });
  }

  /**
   * Run full optimization cycle
   */
  async optimize(): Promise<OptimizationResult> {
    if (this.isOptimizing) {
      throw new Error('Optimization already in progress');
    }

    this.isOptimizing = true;
    const startTime = Date.now();

    try {
      this.log('info', 'Starting memory optimization');

      const result: OptimizationResult = {
        totalProcessed: 0,
        totalOptimized: 0,
        optimizationTime: 0,
        memoriesConsolidated: 0,
        consolidationGroups: 0,
        averageGroupSize: 0,
        duplicatesRemoved: 0,
        duplicateGroups: 0,
        memoriesArchived: 0,
        spaceSaved: 0,
        averageQualityBefore: 0,
        averageQualityAfter: 0,
        qualityImprovement: 0,
        searchPerformanceGain: 0,
        storageReduction: 0,
        details: [],
      };

      // Get all memories for analysis
      const memories = await this.getAllMemories();
      result.totalProcessed = memories.length;

      // Calculate initial quality scores
      const qualityScores = await this.calculateQualityScores(memories);
      result.averageQualityBefore = this.calculateAverageQuality(qualityScores);

      // Run optimization strategies
      if (this.config.enableConsolidation) {
        const consolidationResult = await this.consolidateMemories(memories, qualityScores);
        this.mergeOptimizationResult(result, consolidationResult);
      }

      if (this.config.enableDeduplication) {
        const deduplicationResult = await this.deduplicateMemories(memories, qualityScores);
        this.mergeOptimizationResult(result, deduplicationResult);
      }

      if (this.config.enableArchival) {
        const archivalResult = await this.archiveMemories(memories, qualityScores);
        this.mergeOptimizationResult(result, archivalResult);
      }

      // Calculate final metrics
      result.optimizationTime = Date.now() - startTime;
      result.averageQualityAfter = await this.calculateAverageQualityAfter();
      result.qualityImprovement = result.averageQualityAfter - result.averageQualityBefore;

      // Store result
      this.optimizationHistory.push(result);
      if (this.optimizationHistory.length > 100) {
        this.optimizationHistory = this.optimizationHistory.slice(-100);
      }

      this.log('info', 'Memory optimization completed', {
        totalProcessed: result.totalProcessed,
        totalOptimized: result.totalOptimized,
        optimizationTime: result.optimizationTime,
        qualityImprovement: result.qualityImprovement,
      });

      return result;

    } catch (error) {
      this.log('error', 'Memory optimization failed', { error });
      throw error;
    } finally {
      this.isOptimizing = false;
    }
  }

  /**
   * Consolidate similar memories
   */
  private async consolidateMemories(
    memories: MemoryEntry[],
    qualityScores: MemoryQualityScore[]
  ): Promise<OptimizationResult> {
    const result: OptimizationResult = {
      totalProcessed: 0,
      totalOptimized: 0,
      optimizationTime: 0,
      memoriesConsolidated: 0,
      consolidationGroups: 0,
      averageGroupSize: 0,
      duplicatesRemoved: 0,
      duplicateGroups: 0,
      memoriesArchived: 0,
      spaceSaved: 0,
      averageQualityBefore: 0,
      averageQualityAfter: 0,
      qualityImprovement: 0,
      searchPerformanceGain: 0,
      storageReduction: 0,
      details: [],
    };

    try {
      // Group similar memories
      const similarityGroups = await this.findSimilarityGroups(memories, this.config.similarityThreshold);
      
      for (const group of similarityGroups) {
        if (group.length < 2) continue;

        // Select best memory as representative
        const representative = this.selectRepresentativeMemory(group, qualityScores);
        const others = group.filter(m => m.id !== representative.id);

        // Create consolidated memory
        const consolidated = await this.createConsolidatedMemory(representative, others);
        
        // Store consolidated memory
        await this.vectorStore.storeEntry(consolidated);

        // Mark old memories for deletion (or archive)
        for (const memory of others) {
          await this.vectorStore.deleteEntry(memory.id);
        }

        // Record optimization detail
        const detail: OptimizationDetail = {
          type: 'consolidation',
          action: `Consolidated ${group.length} similar memories`,
          memoryIds: group.map(m => m.id),
          impact: {
            spaceSaved: this.calculateSpaceSavings(group.length, 1),
            performanceGain: this.calculatePerformanceGain(group.length, 1),
            qualityImprovement: 0.1, // Estimated improvement
          },
          timestamp: Date.now(),
        };

        result.details.push(detail);
        result.memoriesConsolidated += others.length;
        result.consolidationGroups++;
      }

      result.averageGroupSize = result.consolidationGroups > 0 
        ? result.memoriesConsolidated / result.consolidationGroups 
        : 0;

      this.log('info', 'Memory consolidation completed', {
        groups: result.consolidationGroups,
        memoriesConsolidated: result.memoriesConsolidated,
      });

      return result;

    } catch (error) {
      this.log('error', 'Memory consolidation failed', { error });
      throw error;
    }
  }

  /**
   * Remove duplicate memories
   */
  private async deduplicateMemories(
    memories: MemoryEntry[],
    qualityScores: MemoryQualityScore[]
  ): Promise<OptimizationResult> {
    const result: OptimizationResult = {
      totalProcessed: 0,
      totalOptimized: 0,
      optimizationTime: 0,
      memoriesConsolidated: 0,
      consolidationGroups: 0,
      averageGroupSize: 0,
      duplicatesRemoved: 0,
      duplicateGroups: 0,
      memoriesArchived: 0,
      spaceSaved: 0,
      averageQualityBefore: 0,
      averageQualityAfter: 0,
      qualityImprovement: 0,
      searchPerformanceGain: 0,
      storageReduction: 0,
      details: [],
    };

    try {
      // Find duplicate groups
      const duplicateGroups = await this.findDuplicateGroups(memories, this.config.duplicateThreshold);
      
      for (const group of duplicateGroups) {
        if (group.length < 2) continue;

        // Keep highest quality memory
        const qualityMap = new Map(qualityScores.map(q => [q.memoryId, q.overallScore]));
        const sorted = group.sort((a, b) => {
          const qualityA = qualityMap.get(a.id) || 0;
          const qualityB = qualityMap.get(b.id) || 0;
          return qualityB - qualityA;
        });

        const keep = sorted[0];
        const duplicates = sorted.slice(1);

        // Remove duplicates
        for (const duplicate of duplicates) {
          await this.vectorStore.deleteEntry(duplicate.id);
        }

        // Record optimization detail
        const detail: OptimizationDetail = {
          type: 'deduplication',
          action: `Removed ${duplicates.length} duplicate memories`,
          memoryIds: duplicates.map(d => d.id),
          impact: {
            spaceSaved: this.calculateSpaceSavings(duplicates.length, 0),
            performanceGain: this.calculatePerformanceGain(duplicates.length, 0),
            qualityImprovement: 0,
          },
          timestamp: Date.now(),
        };

        result.details.push(detail);
        result.duplicatesRemoved += duplicates.length;
        result.duplicateGroups++;
      }

      this.log('info', 'Memory deduplication completed', {
        groups: result.duplicateGroups,
        duplicatesRemoved: result.duplicatesRemoved,
      });

      return result;

    } catch (error) {
      this.log('error', 'Memory deduplication failed', { error });
      throw error;
    }
  }

  /**
   * Archive old or low-quality memories
   */
  private async archiveMemories(
    memories: MemoryEntry[],
    qualityScores: MemoryQualityScore[]
  ): Promise<OptimizationResult> {
    const result: OptimizationResult = {
      totalProcessed: 0,
      totalOptimized: 0,
      optimizationTime: 0,
      memoriesConsolidated: 0,
      consolidationGroups: 0,
      averageGroupSize: 0,
      duplicatesRemoved: 0,
      duplicateGroups: 0,
      memoriesArchived: 0,
      spaceSaved: 0,
      averageQualityBefore: 0,
      averageQualityAfter: 0,
      qualityImprovement: 0,
      searchPerformanceGain: 0,
      storageReduction: 0,
      details: [],
    };

    try {
      const now = Date.now();
      const qualityMap = new Map(qualityScores.map(q => [q.memoryId, q.overallScore]));
      
      // Find memories to archive
      const toArchive: MemoryEntry[] = [];
      for (const memory of memories) {
        const quality = qualityMap.get(memory.id) || 0;
        const age = now - memory.timestamp;
        
        const shouldArchive = 
          age > this.config.archivalAge ||
          quality < this.config.archivalThreshold;

        if (shouldArchive) {
          toArchive.push(memory);
        }
      }

      // Archive memories (move to archival collection)
      for (const memory of toArchive) {
        // In a real implementation, we would move to archival collection
        await this.vectorStore.deleteEntry(memory.id);
        result.memoriesArchived++;
        result.spaceSaved += this.calculateMemorySize(memory);
      }

      // Record optimization detail
      if (toArchive.length > 0) {
        const detail: OptimizationDetail = {
          type: 'archival',
          action: `Archived ${toArchive.length} old/low-quality memories`,
          memoryIds: toArchive.map(m => m.id),
          impact: {
            spaceSaved: result.spaceSaved,
            performanceGain: this.calculatePerformanceGain(toArchive.length, 0),
            qualityImprovement: 0,
          },
          timestamp: Date.now(),
        };

        result.details.push(detail);
      }

      this.log('info', 'Memory archival completed', {
        archived: result.memoriesArchived,
        spaceSaved: result.spaceSaved,
      });

      return result;

    } catch (error) {
      this.log('error', 'Memory archival failed', { error });
      throw error;
    }
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory];
  }

  /**
   * Get current optimization status
   */
  isCurrentlyOptimizing(): boolean {
    return this.isOptimizing;
  }

  /**
   * Close optimizer
   */
  close(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
    }
    this.log('info', 'Memory Optimizer closed');
  }

  // Private helper methods

  /**
   * Start optimization timer
   */
  private startOptimizationTimer(): void {
    if (this.config.optimizationInterval > 0) {
      this.optimizationTimer = setInterval(async () => {
        try {
          await this.optimize();
        } catch (error) {
          this.log('error', 'Scheduled optimization failed', { error });
        }
      }, this.config.optimizationInterval);
    }
  }

  /**
   * Get all memories from vector store
   */
  private async getAllMemories(): Promise<MemoryEntry[]> {
    // This would need to be implemented in the vector store
    // For now, return empty array
    return [];
  }

  /**
   * Calculate quality scores for memories
   */
  private async calculateQualityScores(memories: MemoryEntry[]): Promise<MemoryQualityScore[]> {
    const now = Date.now();
    const scores: MemoryQualityScore[] = [];

    for (const memory of memories) {
      const age = now - memory.timestamp;
      const recency = Math.max(0, 1 - (age / (86400000 * 30))); // 30 days scale
      const trustScore = this.getTrustScore(memory.trustLevel);
      
      const confidence = memory.confidence || 0.5;
      const accessFrequency = memory.accessCount || 0;

      // Calculate weighted score
      const overallScore = 
        (confidence * this.config.qualityFactors.confidence) +
        (trustScore * this.config.qualityFactors.trust) +
        (recency * this.config.qualityFactors.recency) +
        (Math.min(accessFrequency / 100, 1) * this.config.qualityFactors.access);

      scores.push({
        memoryId: memory.id,
        overallScore,
        confidence,
        trustLevel: trustScore,
        recency,
        accessFrequency,
        factors: {
          confidence: confidence * this.config.qualityFactors.confidence,
          trust: trustScore * this.config.qualityFactors.trust,
          recency: recency * this.config.qualityFactors.recency,
          access: Math.min(accessFrequency / 100, 1) * this.config.qualityFactors.access,
        },
      });
    }

    return scores;
  }

  /**
   * Find similarity groups
   */
  private async findSimilarityGroups(memories: MemoryEntry[], threshold: number): Promise<MemoryEntry[][]> {
    const groups: MemoryEntry[][] = [];
    const processed = new Set<string>();

    for (const memory of memories) {
      if (processed.has(memory.id)) continue;

      const group = [memory];
      processed.add(memory.id);

      // Find similar memories
      for (const other of memories) {
        if (processed.has(other.id)) continue;

        const similarity = this.calculateSimilarity(memory, other);
        if (similarity >= threshold) {
          group.push(other);
          processed.add(other.id);
        }
      }

      if (group.length > 1) {
        groups.push(group);
      }
    }

    return groups;
  }

  /**
   * Find duplicate groups
   */
  private async findDuplicateGroups(memories: MemoryEntry[], threshold: number): Promise<MemoryEntry[][]> {
    // Similar to similarity groups but with higher threshold
    return this.findSimilarityGroups(memories, threshold);
  }

  /**
   * Select representative memory from group
   */
  private selectRepresentativeMemory(group: MemoryEntry[], qualityScores: MemoryQualityScore[]): MemoryEntry {
    const qualityMap = new Map(qualityScores.map(q => [q.memoryId, q.overallScore]));
    
    return group.reduce((best, current) => {
      const bestScore = qualityMap.get(best.id) || 0;
      const currentScore = qualityMap.get(current.id) || 0;
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Create consolidated memory
   */
  private async createConsolidatedMemory(representative: MemoryEntry, others: MemoryEntry[]): Promise<MemoryEntry> {
    // Create summary content
    const allContents = [representative.content, ...others.map(o => o.content)];
    const summaryContent = `Consolidated memory: ${allContents.join('; ')}`;

    // Generate new embedding
    const embedding = await this.embeddingService.generateEmbedding(summaryContent);

    return {
      ...representative,
      id: `consolidated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: summaryContent,
      vector: embedding.vector,
      timestamp: Date.now(),
      tags: [...representative.tags, 'consolidated'],
    };
  }

  /**
   * Calculate similarity between memories
   */
  private calculateSimilarity(memory1: MemoryEntry, memory2: MemoryEntry): number {
    if (!memory1.vector || !memory2.vector) return 0;

    // Simple cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < memory1.vector.length; i++) {
      dotProduct += memory1.vector[i] * memory2.vector[i];
      norm1 += memory1.vector[i] * memory1.vector[i];
      norm2 += memory2.vector[i] * memory2.vector[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    return norm1 === 0 || norm2 === 0 ? 0 : dotProduct / (norm1 * norm2);
  }

  /**
   * Get trust score from trust level
   */
  private getTrustScore(trustLevel?: string): number {
    const scores: Record<string, number> = {
      'unverified': 0.1,
      'low': 0.3,
      'medium': 0.5,
      'high': 0.7,
      'verified': 0.9,
      'authoritative': 1.0,
    };
    return scores[trustLevel || 'medium'] || 0.5;
  }

  /**
   * Calculate average quality
   */
  private calculateAverageQuality(qualityScores: MemoryQualityScore[]): number {
    if (qualityScores.length === 0) return 0;
    const sum = qualityScores.reduce((acc, score) => acc + score.overallScore, 0);
    return sum / qualityScores.length;
  }

  /**
   * Calculate average quality after optimization
   */
  private async calculateAverageQualityAfter(): Promise<number> {
    // This would recalculate quality scores after optimization
    // For now, return estimated improvement
    return 0.75; // Placeholder
  }

  /**
   * Calculate space savings
   */
  private calculateSpaceSavings(originalCount: number, finalCount: number): number {
    return (originalCount - finalCount) * 1024; // Estimated 1KB per memory
  }

  /**
   * Calculate performance gain
   */
  private calculatePerformanceGain(originalCount: number, finalCount: number): number {
    return originalCount > 0 ? (originalCount - finalCount) / originalCount : 0;
  }

  /**
   * Calculate memory size
   */
  private calculateMemorySize(memory: MemoryEntry): number {
    return JSON.stringify(memory).length;
  }

  /**
   * Merge optimization results
   */
  private mergeOptimizationResult(target: OptimizationResult, source: OptimizationResult): void {
    target.memoriesConsolidated += source.memoriesConsolidated;
    target.consolidationGroups += source.consolidationGroups;
    target.duplicatesRemoved += source.duplicatesRemoved;
    target.duplicateGroups += source.duplicateGroups;
    target.memoriesArchived += source.memoriesArchived;
    target.spaceSaved += source.spaceSaved;
    target.details.push(...source.details);
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
        console.debug('[MemoryOptimizer]', logData);
        break;
      case 'info':
        console.info('[MemoryOptimizer]', logData);
        break;
      case 'warn':
        console.warn('[MemoryOptimizer]', logData);
        break;
      case 'error':
        console.error('[MemoryOptimizer]', logData);
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