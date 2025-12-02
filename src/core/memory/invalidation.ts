/**
 * Derived Data Invalidation System - Main Implementation
 * 
 * This module provides the core invalidation system that ensures data consistency
 * and integrity across the sovereign memory architecture. It tracks dependencies
 * between memory items and automatically invalidates derived data when source data changes.
 * 
 * Features:
 * - Graph-based dependency tracking
 * - Multiple invalidation strategies
 * - Cascade propagation with cycle detection
 * - Performance optimization
 * - Comprehensive audit trail
 * - Integration with existing memory systems
 */

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import {
  InvalidationStrategy,
  InvalidationTrigger,
  InvalidationEvent,
  DependencyNode,
  InvalidationRule,
  InvalidationConfig,
  InvalidationStats,
  InvalidationRequest,
  InvalidationResult,
  ValidationResult,
  InvalidationStrategySchema,
  InvalidationTriggerSchema,
  InvalidationEventSchema,
  DependencyNodeSchema,
  InvalidationRuleSchema,
  InvalidationConfigSchema,
  InvalidationRequestSchema,
  InvalidationResultSchema,
  ValidationResultSchema,
} from './invalidation-types';
import { QdrantVectorStore, MemoryEntry } from './vector-store';
import { SovereignMemoryManager } from './memory-manager';
import { DataLineageManager, DataSource } from '../aix/data-lineage';
import { ThoughtUnit, ReActTrace } from '../aix/schema';

/**
 * Dependency Graph - Manages relationships between memory items
 */
class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();
  private reverseAdjacencyList: Map<string, Set<string>> = new Map();
  private cycleDetectionCache: Map<string, boolean> = new Map();

  /**
   * Add a dependency node to the graph
   */
  addNode(node: DependencyNode): void {
    const validatedNode = DependencyNodeSchema.parse(node);
    this.nodes.set(validatedNode.dataId, validatedNode);
    
    // Initialize adjacency lists
    if (!this.adjacencyList.has(validatedNode.dataId)) {
      this.adjacencyList.set(validatedNode.dataId, new Set());
    }
    if (!this.reverseAdjacencyList.has(validatedNode.dataId)) {
      this.reverseAdjacencyList.set(validatedNode.dataId, new Set());
    }
    
    // Add dependencies
    for (const depId of validatedNode.dependsOn) {
      this.addDependency(validatedNode.dataId, depId);
    }
    
    // Clear cycle detection cache
    this.cycleDetectionCache.clear();
  }

  /**
   * Add a dependency relationship
   */
  addDependency(fromId: string, toId: string): void {
    if (!this.adjacencyList.has(fromId)) {
      this.adjacencyList.set(fromId, new Set());
    }
    if (!this.reverseAdjacencyList.has(toId)) {
      this.reverseAdjacencyList.set(toId, new Set());
    }
    
    this.adjacencyList.get(fromId)!.add(toId);
    this.reverseAdjacencyList.get(toId)!.add(fromId);
    
    // Update node dependencies
    const fromNode = this.nodes.get(fromId);
    if (fromNode && !fromNode.dependsOn.includes(toId)) {
      fromNode.dependsOn.push(toId);
    }
    
    const toNode = this.nodes.get(toId);
    if (toNode && !toNode.dependents.includes(fromId)) {
      toNode.dependents.push(fromId);
    }
  }

  /**
   * Remove a dependency relationship
   */
  removeDependency(fromId: string, toId: string): void {
    this.adjacencyList.get(fromId)?.delete(toId);
    this.reverseAdjacencyList.get(toId)?.delete(fromId);
    
    // Update node dependencies
    const fromNode = this.nodes.get(fromId);
    if (fromNode) {
      fromNode.dependsOn = fromNode.dependsOn.filter(id => id !== toId);
    }
    
    const toNode = this.nodes.get(toId);
    if (toNode) {
      toNode.dependents = toNode.dependents.filter(id => id !== fromId);
    }
  }

  /**
   * Get all dependents of a node (cascade targets)
   */
  getDependents(nodeId: string): string[] {
    const dependents = new Set<string>();
    const visited = new Set<string>();
    
    const traverse = (id: string): void => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const directDependents = this.reverseAdjacencyList.get(id);
      if (directDependents) {
        for (const dependent of directDependents) {
          dependents.add(dependent);
          traverse(dependent);
        }
      }
    };
    
    traverse(nodeId);
    return Array.from(dependents);
  }

  /**
   * Check for cycles in the dependency graph
   */
  hasCycle(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    for (const nodeId of this.nodes.keys()) {
      if (this.hasCycleUtil(nodeId, visited, recursionStack)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Utility function for cycle detection
   */
  private hasCycleUtil(nodeId: string, visited: Set<string>, recursionStack: Set<string>): boolean {
    if (recursionStack.has(nodeId)) {
      return true; // Cycle detected
    }
    
    if (visited.has(nodeId)) {
      return false;
    }
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const dependencies = this.adjacencyList.get(nodeId);
    if (dependencies) {
      for (const depId of dependencies) {
        if (this.hasCycleUtil(depId, visited, recursionStack)) {
          return true;
        }
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  }

  /**
   * Find the shortest path between two nodes
   */
  findPath(fromId: string, toId: string): string[] | null {
    if (fromId === toId) return [fromId];
    
    const queue: string[] = [fromId];
    const visited = new Set<string>([fromId]);
    const parent = new Map<string, string>();
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current === toId) {
        // Reconstruct path
        const path: string[] = [];
        let node = toId;
        while (node !== fromId) {
          path.unshift(node);
          node = parent.get(node)!;
        }
        path.unshift(fromId);
        return path;
      }
      
      const dependencies = this.adjacencyList.get(current);
      if (dependencies) {
        for (const depId of dependencies) {
          if (!visited.has(depId)) {
            visited.add(depId);
            parent.set(depId, current);
            queue.push(depId);
          }
        }
      }
    }
    
    return null; // No path found
  }

  /**
   * Get statistics about the dependency graph
   */
  getStats(): {
    totalNodes: number;
    totalDependencies: number;
    averageDependencies: number;
    maxDepth: number;
    nodesWithCycles: string[];
  } {
    const totalNodes = this.nodes.size;
    let totalDependencies = 0;
    let maxDepth = 0;
    
    for (const node of this.nodes.values()) {
      totalDependencies += node.dependsOn.length;
      
      // Calculate depth for this node
      const depth = this.calculateDepth(node.dataId);
      maxDepth = Math.max(maxDepth, depth);
    }
    
    const averageDependencies = totalNodes > 0 ? totalDependencies / totalNodes : 0;
    const nodesWithCycles = this.findNodesInCycles();
    
    return {
      totalNodes,
      totalDependencies,
      averageDependencies,
      maxDepth,
      nodesWithCycles,
    };
  }

  /**
   * Calculate the maximum depth from a node to any leaf
   */
  private calculateDepth(nodeId: string, visited: Set<string> = new Set()): number {
    if (visited.has(nodeId)) return 0; // Cycle protection
    visited.add(nodeId);
    
    const dependencies = this.adjacencyList.get(nodeId);
    if (!dependencies || dependencies.size === 0) {
      return 0;
    }
    
    let maxDepth = 0;
    for (const depId of dependencies) {
      maxDepth = Math.max(maxDepth, this.calculateDepth(depId, new Set(visited)));
    }
    
    return maxDepth + 1;
  }

  /**
   * Find all nodes that are part of cycles
   */
  private findNodesInCycles(): string[] {
    const nodesInCycles: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const detectCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true; // Found a cycle
      }
      
      if (visited.has(nodeId)) {
        return false;
      }
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const dependencies = this.adjacencyList.get(nodeId);
      if (dependencies) {
        for (const depId of dependencies) {
          if (detectCycle(depId)) {
            nodesInCycles.push(nodeId);
            return true;
          }
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        detectCycle(nodeId);
      }
    }
    
    return [...new Set(nodesInCycles)]; // Remove duplicates
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: string): DependencyNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): DependencyNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Remove a node from the graph
   */
  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    // Remove all dependencies
    for (const depId of node.dependsOn) {
      this.removeDependency(nodeId, depId);
    }
    
    // Remove all dependents
    for (const dependentId of node.dependents) {
      this.removeDependency(dependentId, nodeId);
    }
    
    // Remove the node
    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    this.reverseAdjacencyList.delete(nodeId);
  }

  /**
   * Clear the entire graph
   */
  clear(): void {
    this.nodes.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();
    this.cycleDetectionCache.clear();
  }
}

/**
 * Invalidation Manager - Main class for managing data invalidation
 */
export class InvalidationManager {
  private config: InvalidationConfig;
  private dependencyGraph: DependencyGraph;
  private invalidationRules: Map<string, InvalidationRule> = new Map();
  private auditTrail: InvalidationEvent[] = [];
  private stats: InvalidationStats;
  private vectorStore?: QdrantVectorStore;
  private memoryManager?: SovereignMemoryManager;
  private lineageManager?: DataLineageManager;
  
  // Performance optimization
  private batchQueue: InvalidationRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private validationCache: Map<string, ValidationResult> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: InvalidationConfig) {
    const validatedConfig = InvalidationConfigSchema.parse(config);
    this.config = validatedConfig;
    
    this.dependencyGraph = new DependencyGraph();
    
    // Initialize statistics
    this.stats = {
      totalEvents: 0,
      eventsByTrigger: {},
      eventsByStrategy: {},
      averageProcessingTime: 0,
      p95ProcessingTime: 0,
      p99ProcessingTime: 0,
      averageCascadeDepth: 0,
      maxCascadeDepth: 0,
      averageItemsInvalidated: 0,
      memoryFreed: 0,
      cacheHitRate: 0,
      recoveryAttempts: 0,
      recoverySuccessRate: 0,
      totalNodes: 0,
      averageDependencies: 0,
      graphDepth: 0,
      errorRate: 0,
      eventsLastHour: 0,
      eventsLastDay: 0,
      eventsLastWeek: 0,
    };

    // Start cleanup timer
    this.startCleanupTimer();
    
    this.log('info', 'Invalidation Manager initialized', { config: validatedConfig });
  }

  /**
   * Set integration components
   */
  setIntegrations({
    vectorStore,
    memoryManager,
    lineageManager,
  }: {
    vectorStore?: QdrantVectorStore;
    memoryManager?: SovereignMemoryManager;
    lineageManager?: DataLineageManager;
  }): void {
    this.vectorStore = vectorStore;
    this.memoryManager = memoryManager;
    this.lineageManager = lineageManager;
    
    this.log('info', 'Integrations set', {
      hasVectorStore: !!vectorStore,
      hasMemoryManager: !!memoryManager,
      hasLineageManager: !!lineageManager,
    });
  }

  /**
   * Register a dependency relationship
   */
  registerDependency(
    dataId: string,
    dependsOn: string[],
    dataType: 'thought' | 'trace' | 'observation' | 'action',
    options: Partial<DependencyNode> = {}
  ): void {
    const node: DependencyNode = {
      nodeId: uuidv4(),
      dataId,
      dataType,
      dependsOn,
      dependents: [],
      dependencyType: 'direct',
      dependencyStrength: options.dependencyStrength || 1.0,
      lastValidated: Date.now(),
      invalidationRules: [],
      accessFrequency: 0,
      lastAccessed: Date.now(),
      accessCost: options.accessCost || 1,
      isValid: true,
      invalidationCount: 0,
      metadata: options.metadata,
      tags: options.tags || [],
      ...options,
    };

    this.dependencyGraph.addNode(node);
    
    // Update statistics
    this.updateGraphStats();
    
    this.log('debug', 'Dependency registered', { dataId, dependsOn, dataType });
  }

  /**
   * Process an invalidation request
   */
  async invalidate(request: InvalidationRequest): Promise<InvalidationResult> {
    const startTime = Date.now();
    
    try {
      const validatedRequest = InvalidationRequestSchema.parse(request);
      
      // Check if this is a dry run
      if (validatedRequest.dryRun) {
        return this.performDryRun(validatedRequest);
      }

      // Determine strategy
      const strategy = validatedRequest.strategy || this.config.defaultStrategy;
      
      // Process based on strategy
      let result: InvalidationResult;
      switch (strategy) {
        case 'immediate':
          result = await this.processImmediateInvalidation(validatedRequest);
          break;
        case 'delayed':
          result = await this.processDelayedInvalidation(validatedRequest);
          break;
        case 'batched':
          result = await this.processBatchedInvalidation(validatedRequest);
          break;
        case 'lazy':
          result = await this.processLazyInvalidation(validatedRequest);
          break;
        case 'conditional':
          result = await this.processConditionalInvalidation(validatedRequest);
          break;
        case 'cascade_limited':
          result = await this.processCascadeLimitedInvalidation(validatedRequest);
          break;
        case 'selective':
          result = await this.processSelectiveInvalidation(validatedRequest);
          break;
        default:
          throw new Error(`Unknown invalidation strategy: ${strategy}`);
      }

      // Update statistics
      const processingTime = Date.now() - startTime;
      this.updateStats(validatedRequest.trigger, strategy, processingTime, result);
      
      // Create audit event
      if (this.config.enableAuditTrail) {
        await this.createAuditEvent(validatedRequest, result, processingTime);
      }
      
      this.log('info', 'Invalidation completed', {
        requestId: validatedRequest.requestId,
        strategy,
        itemsInvalidated: result.itemsInvalidated.length,
        processingTime,
      });
      
      return result;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Update error statistics
      this.updateErrorStats(error);
      
      this.log('error', 'Invalidation failed', {
        requestId: request.requestId,
        error: error.message,
        processingTime,
      });
      
      return {
        requestId: request.requestId,
        eventId: uuidv4(),
        success: false,
        itemsInvalidated: [],
        itemsSkipped: [],
        cascadeDepth: 0,
        processingTime,
        errors: [{
          itemId: request.sourceId,
          error: error.message,
          recoverable: this.config.enableRecovery,
        }],
        recoveryAttempted: false,
        warnings: [],
      };
    }
  }

  /**
   * Validate a dependency node
   */
  async validateDependency(nodeId: string): Promise<ValidationResult> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = `validate_${nodeId}`;
    if (this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey)!;
      this.log('debug', 'Validation cache hit', { nodeId });
      return cached;
    }
    
    try {
      const node = this.dependencyGraph.getNode(nodeId);
      if (!node) {
        throw new Error(`Dependency node not found: ${nodeId}`);
      }
      
      const checkedDependencies: string[] = [];
      const invalidDependencies: string[] = [];
      
      // Check all dependencies
      for (const depId of node.dependsOn) {
        checkedDependencies.push(depId);
        
        const depNode = this.dependencyGraph.getNode(depId);
        if (!depNode || !depNode.isValid) {
          invalidDependencies.push(depId);
        }
      }
      
      // Determine validity
      const isValid = invalidDependencies.length === 0;
      
      // Get trust information from lineage manager if available
      let trustLevel: string | undefined;
      let trustScore: number | undefined;
      if (this.lineageManager) {
        trustScore = this.lineageManager.calculateCompositeTrust(nodeId);
        trustLevel = this.getTrustLevelFromScore(trustScore);
      }
      
      // Determine recommended action
      let recommendedAction: 'none' | 'invalidate' | 'revalidate' | 'refresh' = 'none';
      let reason: string | undefined;
      
      if (!isValid) {
        recommendedAction = 'invalidate';
        reason = `Dependencies are invalid: ${invalidDependencies.join(', ')}`;
      } else if (trustScore && trustScore < this.config.trustThreshold) {
        recommendedAction = 'revalidate';
        reason = `Trust score ${trustScore} below threshold ${this.config.trustThreshold}`;
      } else if (node.lastValidated < Date.now() - 3600000) { // 1 hour
        recommendedAction = 'refresh';
        reason = 'Validation expired';
      }
      
      const result: ValidationResult = {
        nodeId,
        isValid,
        validationTime: Date.now() - startTime,
        checkedDependencies,
        invalidDependencies,
        trustLevel: trustLevel as any,
        trustScore,
        recommendedAction,
        reason,
        metadata: node.metadata,
      };
      
      // Cache the result
      this.validationCache.set(cacheKey, result);
      
      // Update node
      node.lastValidated = Date.now();
      node.isValid = isValid;
      
      return result;
      
    } catch (error) {
      const result: ValidationResult = {
        nodeId,
        isValid: false,
        validationTime: Date.now() - startTime,
        checkedDependencies: [],
        invalidDependencies: [],
        recommendedAction: 'invalidate',
        reason: `Validation error: ${error.message}`,
      };
      
      return result;
    }
  }

  /**
   * Add an invalidation rule
   */
  addInvalidationRule(rule: InvalidationRule): void {
    const validatedRule = InvalidationRuleSchema.parse(rule);
    this.invalidationRules.set(validatedRule.ruleId, validatedRule);
    
    this.log('info', 'Invalidation rule added', { ruleId: validatedRule.ruleId, name: validatedRule.name });
  }

  /**
   * Remove an invalidation rule
   */
  removeInvalidationRule(ruleId: string): boolean {
    const removed = this.invalidationRules.delete(ruleId);
    if (removed) {
      this.log('info', 'Invalidation rule removed', { ruleId });
    }
    return removed;
  }

  /**
   * Get current statistics
   */
  getStats(): InvalidationStats {
    // Update time-based statistics
    this.updateTimeBasedStats();
    
    // Update graph statistics
    const graphStats = this.dependencyGraph.getStats();
    this.stats.totalNodes = graphStats.totalNodes;
    this.stats.averageDependencies = graphStats.averageDependencies;
    this.stats.graphDepth = graphStats.maxDepth;
    
    return { ...this.stats };
  }

  /**
   * Get audit trail
   */
  getAuditTrail(limit?: number): InvalidationEvent[] {
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
   * Close the invalidation manager
   */
  async close(): Promise<void> {
    // Stop timers
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    // Process any remaining batch
    if (this.batchQueue.length > 0) {
      await this.processBatch();
    }
    
    this.log('info', 'Invalidation Manager closed');
  }

  // Private methods

  /**
   * Process immediate invalidation
   */
  private async processImmediateInvalidation(request: InvalidationRequest): Promise<InvalidationResult> {
    const affectedItems = this.dependencyGraph.getDependents(request.sourceId);
    const itemsToInvalidate = [request.sourceId, ...affectedItems];
    
    // Apply cascade depth limit if specified
    const limitedItems = this.applyCascadeDepthLimit(itemsToInvalidate, request.cascadeDepth);
    
    const result = await this.performInvalidation(limitedItems, request);
    result.cascadeDepth = this.calculateCascadeDepth(request.sourceId);
    
    return result;
  }

  /**
   * Process delayed invalidation
   */
  private async processDelayedInvalidation(request: InvalidationRequest): Promise<InvalidationResult> {
    const delayUntil = request.delayUntil || (Date.now() + this.config.delayThreshold);
    const delay = Math.max(0, delayUntil - Date.now());
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return this.processImmediateInvalidation(request);
  }

  /**
   * Process batched invalidation
   */
  private async processBatchedInvalidation(request: InvalidationRequest): Promise<InvalidationResult> {
    this.batchQueue.push(request);
    
    if (this.batchQueue.length >= this.config.batchSize) {
      return this.processBatch();
    }
    
    // Set timer to process batch if not already set
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
        this.batchTimer = null;
      }, 5000); // 5 seconds
    }
    
    // Return a placeholder result for now
    return {
      requestId: request.requestId,
      eventId: uuidv4(),
      success: true,
      itemsInvalidated: [],
      itemsSkipped: [],
      cascadeDepth: 0,
      processingTime: 0,
      errors: [],
      recoveryAttempted: false,
      warnings: ['Request queued for batch processing'],
    };
  }

  /**
   * Process lazy invalidation
   */
  private async processLazyInvalidation(request: InvalidationRequest): Promise<InvalidationResult> {
    // Mark items as invalid but don't actually invalidate yet
    const affectedItems = this.dependencyGraph.getDependents(request.sourceId);
    const itemsToInvalidate = [request.sourceId, ...affectedItems];
    
    for (const itemId of itemsToInvalidate) {
      const node = this.dependencyGraph.getNode(itemId);
      if (node) {
        node.isValid = false;
        node.lastInvalidated = Date.now();
      }
    }
    
    return {
      requestId: request.requestId,
      eventId: uuidv4(),
      success: true,
      itemsInvalidated: itemsToInvalidate,
      itemsSkipped: [],
      cascadeDepth: this.calculateCascadeDepth(request.sourceId),
      processingTime: 0,
      errors: [],
      recoveryAttempted: false,
      warnings: ['Lazy invalidation - items marked as invalid, will be processed on next access'],
    };
  }

  /**
   * Process conditional invalidation
   */
  private async processConditionalInvalidation(request: InvalidationRequest): Promise<InvalidationResult> {
    // Apply conditions and filters
    const affectedItems = this.dependencyGraph.getDependents(request.sourceId);
    let itemsToInvalidate = [request.sourceId, ...affectedItems];
    
    // Apply filters if specified
    if (request.filters) {
      itemsToInvalidate = this.applyFilters(itemsToInvalidate, request.filters);
    }
    
    // Apply invalidation rules
    itemsToInvalidate = this.applyInvalidationRules(itemsToInvalidate, request);
    
    const result = await this.performInvalidation(itemsToInvalidate, request);
    result.cascadeDepth = this.calculateCascadeDepth(request.sourceId);
    
    return result;
  }

  /**
   * Process cascade-limited invalidation
   */
  private async processCascadeLimitedInvalidation(request: InvalidationRequest): Promise<InvalidationResult> {
    const maxDepth = request.cascadeDepth || this.config.cascadeDepthLimit;
    const affectedItems = this.dependencyGraph.getDependents(request.sourceId);
    const itemsToInvalidate = this.applyCascadeDepthLimit([request.sourceId, ...affectedItems], maxDepth);
    
    const result = await this.performInvalidation(itemsToInvalidate, request);
    result.cascadeDepth = Math.min(maxDepth, this.calculateCascadeDepth(request.sourceId));
    
    return result;
  }

  /**
   * Process selective invalidation
   */
  private async processSelectiveInvalidation(request: InvalidationRequest): Promise<InvalidationResult> {
    const affectedItems = this.dependencyGraph.getDependents(request.sourceId);
    let itemsToInvalidate = [request.sourceId, ...affectedItems];
    
    // Select items based on criteria (access frequency, trust level, etc.)
    itemsToInvalidate = this.selectItemsForInvalidation(itemsToInvalidate);
    
    const result = await this.performInvalidation(itemsToInvalidate, request);
    result.cascadeDepth = this.calculateCascadeDepth(request.sourceId);
    
    return result;
  }

  /**
   * Perform the actual invalidation
   */
  private async performInvalidation(itemsToInvalidate: string[], request: InvalidationRequest): Promise<InvalidationResult> {
    const itemsInvalidated: string[] = [];
    const itemsSkipped: string[] = [];
    const errors: any[] = [];
    let memoryFreed = 0;
    
    for (const itemId of itemsToInvalidate) {
      try {
        // Invalidate in vector store
        if (this.vectorStore && this.config.integrateWithVectorStore) {
          await this.vectorStore.deleteEntry(itemId);
        }
        
        // Invalidate in memory manager
        if (this.memoryManager && this.config.integrateWithCache) {
          await this.memoryManager.deleteMemory(itemId);
        }
        
        // Update dependency node
        const node = this.dependencyGraph.getNode(itemId);
        if (node) {
          node.isValid = false;
          node.lastInvalidated = Date.now();
          node.invalidationCount++;
          memoryFreed += this.estimateMemoryUsage(node);
        }
        
        itemsInvalidated.push(itemId);
        
      } catch (error) {
        errors.push({
          itemId,
          error: error.message,
          recoverable: this.config.enableRecovery,
        });
        itemsSkipped.push(itemId);
      }
    }
    
    // Attempt recovery if enabled
    let recoveryAttempted = false;
    let recoverySuccessful = false;
    
    if (this.config.enableRecovery && errors.length > 0) {
      recoveryAttempted = true;
      recoverySuccessful = await this.attemptRecovery(errors, request);
    }
    
    return {
      requestId: request.requestId,
      eventId: uuidv4(),
      success: errors.length === 0,
      itemsInvalidated,
      itemsSkipped,
      cascadeDepth: 0, // Will be set by caller
      processingTime: 0, // Will be set by caller
      memoryFreed,
      errors,
      recoveryAttempted,
      recoverySuccessful,
      warnings: [],
    };
  }

  /**
   * Perform a dry run invalidation
   */
  private performDryRun(request: InvalidationRequest): InvalidationResult {
    const affectedItems = this.dependencyGraph.getDependents(request.sourceId);
    const itemsToInvalidate = [request.sourceId, ...affectedItems];
    
    return {
      requestId: request.requestId,
      eventId: uuidv4(),
      success: true,
      itemsInvalidated: itemsToInvalidate,
      itemsSkipped: [],
      cascadeDepth: this.calculateCascadeDepth(request.sourceId),
      processingTime: 0,
      errors: [],
      recoveryAttempted: false,
      warnings: ['Dry run - no actual invalidation performed'],
    };
  }

  /**
   * Process batch of invalidation requests
   */
  private async processBatch(): Promise<InvalidationResult> {
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    
    const allItemsToInvalidate = new Set<string>();
    const allErrors: any[] = [];
    const allItemsInvalidated: string[] = [];
    const allItemsSkipped: string[] = [];
    
    for (const request of batch) {
      const affectedItems = this.dependencyGraph.getDependents(request.sourceId);
      const itemsToInvalidate = [request.sourceId, ...affectedItems];
      
      for (const item of itemsToInvalidate) {
        allItemsToInvalidate.add(item);
      }
    }
    
    // Perform batch invalidation
    for (const itemId of allItemsToInvalidate) {
      try {
        if (this.vectorStore) {
          await this.vectorStore.deleteEntry(itemId);
        }
        
        if (this.memoryManager) {
          await this.memoryManager.deleteMemory(itemId);
        }
        
        allItemsInvalidated.push(itemId);
      } catch (error) {
        allErrors.push({
          itemId,
          error: error.message,
          recoverable: this.config.enableRecovery,
        });
      }
    }
    
    // Return results for all requests in the batch
    for (const request of batch) {
      // This is simplified - in practice, you'd want to return individual results
      // for each request in the batch
    }
    
    return {
      requestId: batch[0]?.requestId || uuidv4(),
      eventId: uuidv4(),
      success: allErrors.length === 0,
      itemsInvalidated: allItemsInvalidated,
      itemsSkipped: allItemsSkipped,
      cascadeDepth: 0,
      processingTime: 0,
      errors: allErrors,
      recoveryAttempted: false,
      warnings: [`Processed batch of ${batch.length} requests`],
    };
  }

  /**
   * Apply cascade depth limit
   */
  private applyCascadeDepthLimit(items: string[], maxDepth?: number): string[] {
    if (!maxDepth) return items;
    
    const limitedItems: string[] = [];
    const sourceId = items[0]; // Assume first item is the source
    
    for (const itemId of items) {
      const path = this.dependencyGraph.findPath(sourceId, itemId);
      if (path && path.length - 1 <= maxDepth) {
        limitedItems.push(itemId);
      }
    }
    
    return limitedItems;
  }

  /**
   * Apply filters to items
   */
  private applyFilters(items: string[], filters: any[]): string[] {
    // This is a simplified implementation
    // In practice, you'd want to apply the filters more sophisticatedly
    return items.filter(item => {
      // Apply filter logic here
      return true;
    });
  }

  /**
   * Apply invalidation rules
   */
  private applyInvalidationRules(items: string[], request: InvalidationRequest): string[] {
    let filteredItems = [...items];
    
    for (const rule of this.invalidationRules.values()) {
      if (!rule.enabled) continue;
      
      // Check if rule conditions are met
      if (this.evaluateRuleConditions(rule.conditions, request)) {
        // Apply rule actions
        filteredItems = this.applyRuleActions(rule.actions, filteredItems, request);
      }
    }
    
    return filteredItems;
  }

  /**
   * Select items for invalidation based on criteria
   */
  private selectItemsForInvalidation(items: string[]): string[] {
    const selectedItems: string[] = [];
    
    for (const itemId of items) {
      const node = this.dependencyGraph.getNode(itemId);
      if (!node) continue;
      
      // Select based on access frequency, trust level, etc.
      const shouldInvalidate = 
        node.accessFrequency < 10 || // Low access frequency
        node.dependencyStrength < 0.5 || // Weak dependency
        node.invalidationCount > 5; // Frequently invalidated
      
      if (shouldInvalidate) {
        selectedItems.push(itemId);
      }
    }
    
    return selectedItems;
  }

  /**
   * Calculate cascade depth
   */
  private calculateCascadeDepth(sourceId: string): number {
    const dependents = this.dependencyGraph.getDependents(sourceId);
    let maxDepth = 0;
    
    for (const dependent of dependents) {
      const depth = this.calculateCascadeDepth(dependent) + 1;
      maxDepth = Math.max(maxDepth, depth);
    }
    
    return maxDepth;
  }

  /**
   * Attempt recovery from errors
   */
  private async attemptRecovery(errors: any[], request: InvalidationRequest): Promise<boolean> {
    let successfulRecoveries = 0;
    
    for (const error of errors) {
      if (!error.recoverable) continue;
      
      for (let attempt = 0; attempt < this.config.maxRecoveryAttempts; attempt++) {
        try {
          // Wait before retry
          if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, this.config.recoveryDelay));
          }
          
          // Retry the invalidation
          if (this.vectorStore) {
            await this.vectorStore.deleteEntry(error.itemId);
          }
          
          if (this.memoryManager) {
            await this.memoryManager.deleteMemory(error.itemId);
          }
          
          successfulRecoveries++;
          break;
          
        } catch (retryError) {
          this.log('warn', 'Recovery attempt failed', {
            itemId: error.itemId,
            attempt: attempt + 1,
            error: retryError.message,
          });
        }
      }
    }
    
    return successfulRecoveries === errors.length;
  }

  /**
   * Create audit event
   */
  private async createAuditEvent(request: InvalidationRequest, result: InvalidationResult, processingTime: number): Promise<void> {
    const event: InvalidationEvent = {
      eventId: result.eventId,
      timestamp: Date.now(),
      sourceId: request.sourceId,
      sourceType: request.sourceType,
      trigger: request.trigger,
      strategy: request.strategy || this.config.defaultStrategy,
      reason: request.reason,
      affectedItems: result.itemsInvalidated,
      cascadeDepth: result.cascadeDepth,
      totalInvalidated: result.itemsInvalidated.length,
      processingTime,
      memoryFreed: result.memoryFreed,
      agentId: request.agentId,
      sessionId: request.sessionId,
      recoveryAttempted: result.recoveryAttempted,
      recoverySuccessful: result.recoverySuccessful,
      recoveryAction: result.recoverySuccessful ? 'automatic_retry' : undefined,
      metadata: request.metadata,
      tags: request.tags,
    };
    
    const validatedEvent = InvalidationEventSchema.parse(event);
    this.auditTrail.push(validatedEvent);
    
    // Limit audit trail size
    if (this.auditTrail.length > 10000) {
      this.auditTrail = this.auditTrail.slice(-5000);
    }
  }

  /**
   * Update statistics
   */
  private updateStats(trigger: InvalidationTrigger, strategy: InvalidationStrategy, processingTime: number, result: InvalidationResult): void {
    this.stats.totalEvents++;
    
    // Update trigger statistics
    this.stats.eventsByTrigger[trigger] = (this.stats.eventsByTrigger[trigger] || 0) + 1;
    
    // Update strategy statistics
    this.stats.eventsByStrategy[strategy] = (this.stats.eventsByStrategy[strategy] || 0) + 1;
    
    // Update processing time statistics
    const totalEvents = this.stats.totalEvents;
    const currentAvg = this.stats.averageProcessingTime;
    this.stats.averageProcessingTime = (currentAvg * (totalEvents - 1) + processingTime) / totalEvents;
    
    // Update cascade depth statistics
    const currentAvgDepth = this.stats.averageCascadeDepth;
    this.stats.averageCascadeDepth = (currentAvgDepth * (totalEvents - 1) + result.cascadeDepth) / totalEvents;
    this.stats.maxCascadeDepth = Math.max(this.stats.maxCascadeDepth, result.cascadeDepth);
    
    // Update items invalidated statistics
    const currentAvgItems = this.stats.averageItemsInvalidated;
    this.stats.averageItemsInvalidated = (currentAvgItems * (totalEvents - 1) + result.itemsInvalidated.length) / totalEvents;
    
    // Update memory freed
    if (result.memoryFreed) {
      this.stats.memoryFreed += result.memoryFreed;
    }
    
    // Update recovery statistics
    if (result.recoveryAttempted) {
      this.stats.recoveryAttempts++;
      if (result.recoverySuccessful) {
        const successful = this.stats.recoverySuccessRate * (this.stats.recoveryAttempts - 1) + 1;
        this.stats.recoverySuccessRate = successful / this.stats.recoveryAttempts;
      }
    }
  }

  /**
   * Update error statistics
   */
  private updateErrorStats(error: any): void {
    this.stats.errorRate = (this.stats.errorRate * this.stats.totalEvents + 1) / (this.stats.totalEvents + 1);
    this.stats.lastError = error.message;
    this.stats.lastErrorTime = Date.now();
  }

  /**
   * Update time-based statistics
   */
  private updateTimeBasedStats(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;
    const oneWeekAgo = now - 604800000;
    
    this.stats.eventsLastHour = this.auditTrail.filter(e => e.timestamp >= oneHourAgo).length;
    this.stats.eventsLastDay = this.auditTrail.filter(e => e.timestamp >= oneDayAgo).length;
    this.stats.eventsLastWeek = this.auditTrail.filter(e => e.timestamp >= oneWeekAgo).length;
  }

  /**
   * Update graph statistics
   */
  private updateGraphStats(): void {
    const graphStats = this.dependencyGraph.getStats();
    this.stats.totalNodes = graphStats.totalNodes;
    this.stats.averageDependencies = graphStats.averageDependencies;
    this.stats.graphDepth = graphStats.maxDepth;
  }

  /**
   * Estimate memory usage for a node
   */
  private estimateMemoryUsage(node: DependencyNode): number {
    // This is a rough estimate
    const baseSize = 1024; // Base size for any node
    const dependencySize = node.dependsOn.length * 64; // 64 bytes per dependency
    const metadataSize = node.metadata ? JSON.stringify(node.metadata).length : 0;
    
    return baseSize + dependencySize + metadataSize;
  }

  /**
   * Get trust level from score
   */
  private getTrustLevelFromScore(score: number): string {
    if (score >= 0.9) return 'authoritative';
    if (score >= 0.8) return 'verified';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    if (score >= 0.2) return 'low';
    return 'unverified';
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateRuleConditions(conditions: any[], request: InvalidationRequest): boolean {
    // This is a simplified implementation
    // In practice, you'd want to evaluate each condition properly
    return true;
  }

  /**
   * Apply rule actions
   */
  private applyRuleActions(actions: any[], items: string[], request: InvalidationRequest): string[] {
    let filteredItems = [...items];
    
    for (const action of actions) {
      switch (action.type) {
        case 'invalidate':
          // Keep items for invalidation
          break;
        case 'revalidate':
          // Mark for revalidation instead of invalidation
          break;
        case 'notify':
          // Just notify, don't invalidate
          filteredItems = [];
          break;
        case 'cascade_limit':
          // Apply cascade limit
          filteredItems = this.applyCascadeDepthLimit(filteredItems, action.parameters?.limit);
          break;
      }
    }
    
    return filteredItems;
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.performCleanup();
      }, this.config.cleanupInterval);
    }
  }

  /**
   * Perform cleanup operations
   */
  private performCleanup(): void {
    try {
      // Clear validation cache
      const now = Date.now();
      for (const [key, result] of this.validationCache.entries()) {
        if (now - result.validationTime > 300000) { // 5 minutes
          this.validationCache.delete(key);
        }
      }
      
      // Remove old audit trail entries
      const cutoffTime = now - 604800000; // 1 week
      this.auditTrail = this.auditTrail.filter(event => event.timestamp >= cutoffTime);
      
      this.log('debug', 'Cleanup completed');
      
    } catch (error) {
      this.log('error', 'Cleanup failed', { error: error.message });
    }
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
        console.debug('[InvalidationManager]', logData);
        break;
      case 'info':
        console.info('[InvalidationManager]', logData);
        break;
      case 'warn':
        console.warn('[InvalidationManager]', logData);
        break;
      case 'error':
        console.error('[InvalidationManager]', logData);
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
 * Invalidation Manager Factory - Create configured instances
 */
export class InvalidationManagerFactory {
  /**
   * Create invalidation manager from environment variables
   */
  static fromEnvironment(): InvalidationManager {
    const config: InvalidationConfig = {
      defaultStrategy: (process.env.INVALIDATION_STRATEGY as any) || 'immediate',
      cascadeDepthLimit: parseInt(process.env.INVALIDATION_CASCADE_DEPTH_LIMIT || '10'),
      cascadeTimeLimit: parseInt(process.env.INVALIDATION_CASCADE_TIME_LIMIT || '30000'),
      batchSize: parseInt(process.env.INVALIDATION_BATCH_SIZE || '100'),
      delayThreshold: parseInt(process.env.INVALIDATION_DELAY_THRESHOLD || '5000'),
      cleanupInterval: parseInt(process.env.INVALIDATION_CLEANUP_INTERVAL || '300000'),
      trustThreshold: parseFloat(process.env.INVALIDATION_TRUST_THRESHOLD || '0.5'),
      autoRevalidate: process.env.INVALIDATION_AUTO_REVALIDATE !== 'false',
      enableMetrics: process.env.INVALIDATION_ENABLE_METRICS !== 'false',
      enableAuditTrail: process.env.INVALIDATION_ENABLE_AUDIT_TRAIL !== 'false',
      logLevel: (process.env.INVALIDATION_LOG_LEVEL as any) || 'info',
      enableRecovery: process.env.INVALIDATION_ENABLE_RECOVERY !== 'false',
      maxRecoveryAttempts: parseInt(process.env.INVALIDATION_MAX_RECOVERY_ATTEMPTS || '3'),
      recoveryDelay: parseInt(process.env.INVALIDATION_RECOVERY_DELAY || '1000'),
      enableSelectiveInvalidation: process.env.INVALIDATION_ENABLE_SELECTIVE !== 'false',
      enableLazyInvalidation: process.env.INVALIDATION_ENABLE_LAZY === 'true',
      enableCompression: process.env.INVALIDATION_ENABLE_COMPRESSION === 'true',
      integrateWithDataLineage: process.env.INVALIDATION_INTEGRATE_LINEAGE !== 'false',
      integrateWithCache: process.env.INVALIDATION_INTEGRATE_CACHE !== 'false',
      integrateWithVectorStore: process.env.INVALIDATION_INTEGRATE_VECTOR_STORE !== 'false',
    };
    
    return new InvalidationManager(config);
  }

  /**
   * Create development invalidation manager
   */
  static createDevelopment(): InvalidationManager {
    return new InvalidationManager({
      defaultStrategy: 'immediate',
      cascadeDepthLimit: 5,
      cascadeTimeLimit: 10000,
      batchSize: 10,
      delayThreshold: 1000,
      cleanupInterval: 60000,
      trustThreshold: 0.3,
      autoRevalidate: true,
      enableMetrics: true,
      enableAuditTrail: true,
      logLevel: 'debug',
      enableRecovery: true,
      maxRecoveryAttempts: 2,
      recoveryDelay: 500,
      enableSelectiveInvalidation: true,
      enableLazyInvalidation: false,
      enableCompression: false,
      integrateWithDataLineage: true,
      integrateWithCache: true,
      integrateWithVectorStore: true,
    });
  }

  /**
   * Create production invalidation manager
   */
  static createProduction(config?: Partial<InvalidationConfig>): InvalidationManager {
    return new InvalidationManager({
      defaultStrategy: 'conditional',
      cascadeDepthLimit: 15,
      cascadeTimeLimit: 60000,
      batchSize: 200,
      delayThreshold: 10000,
      cleanupInterval: 600000,
      trustThreshold: 0.7,
      autoRevalidate: true,
      enableMetrics: true,
      enableAuditTrail: true,
      logLevel: 'warn',
      enableRecovery: true,
      maxRecoveryAttempts: 5,
      recoveryDelay: 2000,
      enableSelectiveInvalidation: true,
      enableLazyInvalidation: false,
      enableCompression: true,
      integrateWithDataLineage: true,
      integrateWithCache: true,
      integrateWithVectorStore: true,
      ...config,
    });
  }
}