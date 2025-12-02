/**
 * Memory Cache - High-performance caching for memory system
 * 
 * This module provides intelligent caching for memory entries and search results
 * to improve performance and reduce load on the vector database.
 * 
 * Features:
 * - LRU eviction policy
 * - TTL-based expiration
 * - Memory usage monitoring
 * - Cache statistics
 * - Configurable sizing
 */

import { z } from 'zod';
import { MemoryResult } from './memory-manager';

/**
 * Cache Configuration - Cache settings and behavior
 */
export const CacheConfigSchema = z.object({
  maxSize: z.number().default(1000).describe('Maximum cache entries'),
  ttl: z.number().default(3600000).describe('Time-to-live in ms (1 hour)'),
  cleanupInterval: z.number().default(300000).describe('Cleanup interval in ms (5 minutes)'),
  enableStats: z.boolean().default(true).describe('Enable cache statistics'),
  enableCompression: z.boolean().default(false).describe('Enable compression for large entries'),
  compressionThreshold: z.number().default(1024).describe('Compression threshold in bytes'),
});

export type CacheConfig = z.infer<typeof CacheConfigSchema>;

/**
 * Cache Entry - Individual cache item
 */
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  compressed?: boolean;
}

/**
 * Cache Statistics - Performance metrics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  currentSize: number;
  maxSize: number;
  memoryUsage: number;
  averageAccessTime: number;
}

/**
 * Memory Cache - Generic LRU cache with TTL
 */
export class MemoryCache<T> {
  private config: CacheConfig;
  private cache: Map<string, CacheEntry<T>> = new Map();
  private accessOrder: string[] = [];
  private stats: CacheStats;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: CacheConfig) {
    const validatedConfig = CacheConfigSchema.parse(config);
    this.config = validatedConfig;

    // Initialize statistics
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0,
      currentSize: 0,
      maxSize: this.config.maxSize,
      memoryUsage: 0,
      averageAccessTime: 0,
    };

    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const startTime = Date.now();
    
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check TTL
    if (this.isExpired(entry)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateAccessOrder(key);

    // Update statistics
    this.stats.hits++;
    this.updateHitRate();
    this.updateAccessTime(Date.now() - startTime);

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T): void {
    // Check if we need to evict
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    // Calculate size
    const size = this.calculateSize(value);
    
    // Create entry
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      size,
    };

    // Compress if needed
    if (this.config.enableCompression && size > this.config.compressionThreshold) {
      entry.compressed = true;
      // In a real implementation, we would compress here
    }

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
    this.updateStats();
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
      this.updateStats();
    }
    return deleted;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.updateStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys()).filter(key => {
      const entry = this.cache.get(key);
      return entry && !this.isExpired(entry);
    });
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Close cache and cleanup
   */
  close(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  // Private helper methods

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.ttl;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    const lruKey = this.accessOrder[0];
    this.cache.delete(lruKey);
    this.accessOrder.shift();
    this.stats.evictions++;
  }

  /**
   * Update access order
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove from access order
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Calculate size of value
   */
  private calculateSize(value: T): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    this.stats.currentSize = this.cache.size;
    this.stats.memoryUsage = this.calculateMemoryUsage();
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Update average access time
   */
  private updateAccessTime(accessTime: number): void {
    const totalAccess = this.stats.hits + this.stats.misses;
    const currentAvg = this.stats.averageAccessTime || 0;
    this.stats.averageAccessTime = (currentAvg * (totalAccess - 1) + accessTime) / totalAccess;
  }

  /**
   * Calculate memory usage
   */
  private calculateMemoryUsage(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key);
    }

    if (expiredKeys.length > 0) {
      console.debug(`[MemoryCache] Cleaned up ${expiredKeys.length} expired entries`);
    }
  }
}

/**
 * Memory Cache Factory - Create specialized caches
 */
export class MemoryCacheFactory {
  /**
   * Create memory result cache
   */
  static createMemoryResultCache(config?: Partial<CacheConfig>): MemoryCache<MemoryResult> {
    return new MemoryCache<MemoryResult>({
      maxSize: 1000,
      ttl: 3600000, // 1 hour
      cleanupInterval: 300000, // 5 minutes
      enableStats: true,
      enableCompression: false,
      ...config,
    });
  }

  /**
   * Create search result cache
   */
  static createSearchResultCache(config?: Partial<CacheConfig>): MemoryCache<MemoryResult[]> {
    return new MemoryCache<MemoryResult[]>({
      maxSize: 500,
      ttl: 1800000, // 30 minutes
      cleanupInterval: 300000, // 5 minutes
      enableStats: true,
      enableCompression: true,
      compressionThreshold: 2048,
      ...config,
    });
  }

  /**
   * Create embedding cache
   */
  static createEmbeddingCache(config?: Partial<CacheConfig>): MemoryCache<number[]> {
    return new MemoryCache<number[]>({
      maxSize: 2000,
      ttl: 7200000, // 2 hours
      cleanupInterval: 600000, // 10 minutes
      enableStats: true,
      enableCompression: false,
      ...config,
    });
  }
}