/**
 * AIX Thought Unit - Individual thought node in reasoning graph
 * 
 * This module provides the atomic unit of agent cognition that can be
 * linked together to form complex reasoning chains. Each thought unit
 * represents a single cognitive step with provenance, confidence,
 * and relationships to other thoughts.
 * 
 * Designed for LangGraph integration and swarm coordination where
 * thoughts become nodes in distributed reasoning graphs.
 */

import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { z } from 'zod';
import { ThoughtUnit, ThoughtType, ConfidenceLevel } from './schema';

/**
 * Thought Relationship Types - How thoughts connect to each other
 */
export const ThoughtRelationTypeSchema = z.enum([
  'parent_child',     // Sequential reasoning (A leads to B)
  'peer',            // Parallel thoughts at same level
  'critique',        // One thought critiques another
  'synthesis',        // Multiple thoughts synthesize into new one
  'contradiction',    // Thoughts that contradict each other
  'support',          // Supporting evidence or reasoning
  'dependency',       // Prerequisite relationship
]);

export type ThoughtRelationType = z.infer<typeof ThoughtRelationTypeSchema>;

/**
 * Thought Relationship - Links between thought units
 */
export const ThoughtRelationshipSchema = z.object({
  id: z.string().uuid(),
  sourceThoughtId: z.string(),
  targetThoughtId: z.string(),
  relationshipType: ThoughtRelationTypeSchema,
  strength: z.number().min(0).max(1).describe('Strength of relationship 0-1'),
  metadata: z.record(z.any()).optional().describe('Additional relationship data'),
  timestamp: z.number(),
});

export type ThoughtRelationship = z.infer<typeof ThoughtRelationshipSchema>;

/**
 * Thought Graph Node - Enhanced thought unit for graph operations
 */
export const ThoughtGraphNodeSchema = z.object({
  // Core thought data
  thought: z.custom<ThoughtUnit>((data) => {
    try {
      return ThoughtUnitSchema.parse(data);
    } catch {
      return false;
    }
  }),
  
  // Graph properties
  inDegree: z.number().default(0).describe('Number of incoming relationships'),
  outDegree: z.number().default(0).describe('Number of outgoing relationships'),
  
  // Pathfinding and traversal
  depth: z.number().default(0).describe('Depth from root in reasoning graph'),
  path: z.array(z.string()).default([]).describe('Path from root to this node'),
  
  // Cluster analysis
  clusterId: z.string().optional().describe('Cluster/group this thought belongs to'),
  centrality: z.number().default(0).describe('Centrality score in graph'),
  
  // Temporal properties
  createdAt: z.number(),
  lastModified: z.number().optional(),
  
  // Performance metrics
  accessCount: z.number().default(0).describe('How often this thought is accessed'),
  reuseCount: z.number().default(0).describe('How often this thought is reused'),
});

export type ThoughtGraphNode = z.infer<typeof ThoughtGraphNodeSchema>;

/**
 * Thought Graph Manager - Manages reasoning graphs
 */
export class ThoughtGraphManager {
  private nodes: Map<string, ThoughtGraphNode> = new Map();
  private relationships: Map<string, ThoughtRelationship> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();

  /**
   * Add a thought unit to the graph
   */
  addThought(thought: ThoughtUnit): ThoughtGraphNode {
    const node: ThoughtGraphNode = {
      thought,
      inDegree: 0,
      outDegree: 0,
      depth: 0,
      path: [],
      createdAt: Date.now(),
      accessCount: 0,
      reuseCount: 0,
    };

    // Calculate depth and path from parent thoughts
    if (thought.parentThoughtIds && thought.parentThoughtIds.length > 0) {
      const parentPaths = thought.parentThoughtIds.map(parentId => {
        const parentNode = this.nodes.get(parentId);
        return parentNode ? parentNode.path : [];
      });

      const longestPath = parentPaths.reduce((longest, current) => 
        current.length > longest.length ? current : longest, []
      );

      node.path = [...longestPath, thought.id];
      node.depth = longestPath.length;
    }

    this.nodes.set(thought.id, node);
    this.updateAdjacencyList(thought.id, thought.parentThoughtIds || []);
    
    return node;
  }

  /**
   * Create relationship between thoughts
   */
  createRelationship(
    sourceId: string,
    targetId: string,
    relationshipType: ThoughtRelationType,
    strength: number = 0.5
  ): ThoughtRelationship {
    const relationship: ThoughtRelationship = {
      id: uuidv4(),
      sourceThoughtId: sourceId,
      targetThoughtId: targetId,
      relationshipType,
      strength: Math.max(0, Math.min(1, strength)),
      timestamp: Date.now(),
    };

    this.relationships.set(relationship.id, relationship);
    this.updateNodeDegrees(sourceId, targetId);
    
    return relationship;
  }

  /**
   * Get reasoning chain from root to leaf
   */
  getReasoningChain(thoughtId: string): ThoughtUnit[] {
    const chain: ThoughtUnit[] = [];
    const visited = new Set<string>();
    
    const traverse = (id: string): void => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const node = this.nodes.get(id);
      if (!node) return;
      
      chain.unshift(node.thought); // Add to beginning for correct order
      
      // Continue with parent thoughts
      if (node.thought.parentThoughtIds) {
        for (const parentId of node.thought.parentThoughtIds) {
          traverse(parentId);
        }
      }
    };

    traverse(thoughtId);
    return chain;
  }

  /**
   * Find thoughts by type and confidence
   */
  findThoughtsByCriteria(criteria: {
    type?: ThoughtType;
    minConfidence?: number;
    maxDepth?: number;
    tags?: string[];
    agentId?: string;
  }): ThoughtUnit[] {
    const results: ThoughtUnit[] = [];
    
    for (const node of this.nodes.values()) {
      const { thought } = node;
      
      // Type filter
      if (criteria.type && thought.type !== criteria.type) continue;
      
      // Confidence filter
      if (criteria.minConfidence && thought.confidence < criteria.minConfidence) continue;
      
      // Depth filter
      if (criteria.maxDepth !== undefined && node.depth > criteria.maxDepth) continue;
      
      // Tags filter
      if (criteria.tags && criteria.tags.length > 0) {
        const hasAllTags = criteria.tags.every(tag => thought.tags.includes(tag));
        if (!hasAllTags) continue;
      }
      
      // Agent filter
      if (criteria.agentId && thought.agentId !== criteria.agentId) continue;
      
      results.push(thought);
    }
    
    return results;
  }

  /**
   * Get related thoughts by relationship type
   */
  getRelatedThoughts(
    thoughtId: string,
    relationshipType?: ThoughtRelationType,
    maxDistance: number = 2
  ): ThoughtUnit[] {
    const related: ThoughtUnit[] = [];
    const visited = new Set<string>([thoughtId]);
    const queue: Array<{ id: string; distance: number }> = [{ id: thoughtId, distance: 0 }];

    while (queue.length > 0) {
      const { id: currentId, distance } = queue.shift()!;
      
      if (distance >= maxDistance) continue;
      
      // Get adjacent thoughts
      const adjacent = this.adjacencyList.get(currentId) || new Set();
      
      for (const adjacentId of adjacent) {
        if (visited.has(adjacentId)) continue;
        visited.add(adjacentId);
        
        // Check relationship type if specified
        if (relationshipType) {
          const relationship = Array.from(this.relationships.values()).find(
            r => (r.sourceThoughtId === currentId && r.targetThoughtId === adjacentId) ||
                 (r.sourceThoughtId === adjacentId && r.targetThoughtId === currentId)
          );
          
          if (relationship && relationship.relationshipType !== relationshipType) continue;
        }
        
        const node = this.nodes.get(adjacentId);
        if (node) {
          related.push(node.thought);
          queue.push({ id: adjacentId, distance: distance + 1 });
        }
      }
    }
    
    return related;
  }

  /**
   * Detect cycles in reasoning graph
   */
  detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (thoughtId: string, path: string[]): boolean => {
      if (recursionStack.has(thoughtId)) {
        // Found cycle
        const cycleStart = path.indexOf(thoughtId);
        cycles.push([...path.slice(cycleStart), thoughtId]);
        return true;
      }

      if (visited.has(thoughtId)) return false;

      visited.add(thoughtId);
      recursionStack.add(thoughtId);

      const adjacent = this.adjacencyList.get(thoughtId) || new Set();
      for (const adjacentId of adjacent) {
        if (detectCycle(adjacentId, [...path, thoughtId])) {
          return true;
        }
      }

      recursionStack.delete(thoughtId);
      return false;
    };

    for (const thoughtId of this.nodes.keys()) {
      if (!visited.has(thoughtId)) {
        detectCycle(thoughtId, []);
      }
    }

    return cycles;
  }

  /**
   * Calculate graph statistics
   */
  getGraphStats(): {
    totalThoughts: number;
    totalRelationships: number;
    averageDepth: number;
    maxDepth: number;
    connectedComponents: number;
    cycleCount: number;
  } {
    const thoughts = Array.from(this.nodes.values());
    const relationships = Array.from(this.relationships.values());
    
    // Depth statistics
    const depths = thoughts.map(n => n.depth);
    const averageDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
    const maxDepth = Math.max(...depths);

    // Connected components using DFS
    const components = this.findConnectedComponents();
    
    // Cycle detection
    const cycles = this.detectCycles();

    return {
      totalThoughts: thoughts.length,
      totalRelationships: relationships.length,
      averageDepth,
      maxDepth,
      connectedComponents: components.length,
      cycleCount: cycles.length,
    };
  }

  /**
   * Export graph for visualization or analysis
   */
  exportGraph(format: 'json' | 'graphviz' | 'cytoscape' = 'json'): any {
    switch (format) {
      case 'json':
        return {
          nodes: Array.from(this.nodes.values()).map(node => ({
            id: node.thought.id,
            type: node.thought.type,
            confidence: node.thought.confidence,
            depth: node.depth,
            agentId: node.thought.agentId,
            content: node.thought.content.substring(0, 100) + '...',
          })),
          edges: Array.from(this.relationships.values()).map(rel => ({
            id: rel.id,
            source: rel.sourceThoughtId,
            target: rel.targetThoughtId,
            type: rel.relationshipType,
            strength: rel.strength,
          })),
        };

      case 'graphviz':
        const nodes = Array.from(this.nodes.keys());
        const edges = Array.from(this.relationships.values()).map(rel => 
          `"${rel.sourceThoughtId}" -> "${rel.targetThoughtId}" [label="${rel.relationshipType}"];`
        ).join('\n');
        
        return `digraph ThoughtGraph {\n  ${nodes.join('; ')}\n  ${edges}\n}`;

      case 'cytoscape':
        return {
          elements: [
            ...Array.from(this.nodes.values()).map(node => ({
              data: {
                id: node.thought.id,
                type: node.thought.type,
                confidence: node.thought.confidence,
                depth: node.depth,
                agentId: node.thought.agentId,
                label: node.thought.content.substring(0, 50) + '...',
              },
            })),
            ...Array.from(this.relationships.values()).map(rel => ({
              data: {
                id: rel.id,
                source: rel.sourceThoughtId,
                target: rel.targetThoughtId,
                type: rel.relationshipType,
                strength: rel.strength,
              },
            })),
          ],
        };

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Update adjacency list for graph operations
   */
  private updateAdjacencyList(nodeId: string, parentIds: string[]): void {
    if (!this.adjacencyList.has(nodeId)) {
      this.adjacencyList.set(nodeId, new Set());
    }

    // Update parent nodes
    for (const parentId of parentIds) {
      if (!this.adjacencyList.has(parentId)) {
        this.adjacencyList.set(parentId, new Set());
      }
      this.adjacencyList.get(parentId)!.add(nodeId);
    }
  }

  /**
   * Update node degrees when relationships are added
   */
  private updateNodeDegrees(sourceId: string, targetId: string): void {
    const sourceNode = this.nodes.get(sourceId);
    const targetNode = this.nodes.get(targetId);

    if (sourceNode) {
      sourceNode.outDegree++;
    }
    if (targetNode) {
      targetNode.inDegree++;
    }
  }

  /**
   * Find connected components using DFS
   */
  private findConnectedComponents(): string[][] {
    const visited = new Set<string>();
    const components: string[][] = [];

    const dfs = (thoughtId: string, component: string[]): void => {
      visited.add(thoughtId);
      component.push(thoughtId);

      const adjacent = this.adjacencyList.get(thoughtId) || new Set();
      for (const adjacentId of adjacent) {
        if (!visited.has(adjacentId)) {
          dfs(adjacentId, component);
        }
      }
    };

    for (const thoughtId of this.nodes.keys()) {
      if (!visited.has(thoughtId)) {
        const component: string[] = [];
        dfs(thoughtId, component);
        components.push(component);
      }
    }

    return components;
  }
}

/**
 * Thought Unit Factory - Creates standardized thought units
 */
export class ThoughtUnitFactory {
  /**
   * Create observation thought from external data
   */
  static createObservation(
    agentId: string,
    content: string,
    sourceId: string,
    confidence: number = 0.8
  ): ThoughtUnit {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      agentId,
      content,
      type: 'observation',
      confidence,
      confidenceLevel: ThoughtUnitFactory.getConfidenceLevel(confidence),
      sessionId: '', // Will be set by session manager
      tags: ['observation', 'external-data'],
      hash: ThoughtUnitFactory.generateHash(content, agentId),
    };
  }

  /**
   * Create reasoning thought from logical processing
   */
  static createReasoning(
    agentId: string,
    content: string,
    parentThoughtIds: string[],
    confidence: number = 0.7
  ): ThoughtUnit {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      agentId,
      content,
      type: 'reasoning',
      confidence,
      confidenceLevel: ThoughtUnitFactory.getConfidenceLevel(confidence),
      parentThoughtIds,
      sessionId: '',
      tags: ['reasoning', 'logical-inference'],
      hash: ThoughtUnitFactory.generateHash(content, agentId),
    };
  }

  /**
   * Create critique thought for error correction
   */
  static createCritique(
    agentId: string,
    content: string,
    targetThoughtId: string,
    confidence: number = 0.6
  ): ThoughtUnit {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      agentId,
      content,
      type: 'critique',
      confidence,
      confidenceLevel: ThoughtUnitFactory.getConfidenceLevel(confidence),
      relatedThoughtIds: [targetThoughtId],
      sessionId: '',
      tags: ['critique', 'error-correction'],
      hash: ThoughtUnitFactory.generateHash(content, agentId),
    };
  }

  /**
   * Create synthesis thought combining multiple inputs
   */
  static createSynthesis(
    agentId: string,
    content: string,
    parentThoughtIds: string[],
    confidence: number = 0.75
  ): ThoughtUnit {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      agentId,
      content,
      type: 'synthesis',
      confidence,
      confidenceLevel: ThoughtUnitFactory.getConfidenceLevel(confidence),
      parentThoughtIds,
      sessionId: '',
      tags: ['synthesis', 'integration'],
      hash: ThoughtUnitFactory.generateHash(content, agentId),
    };
  }

  /**
   * Create planning thought for goal setting
   */
  static createPlan(
    agentId: string,
    content: string,
    confidence: number = 0.8
  ): ThoughtUnit {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      agentId,
      content,
      type: 'plan',
      confidence,
      confidenceLevel: ThoughtUnitFactory.getConfidenceLevel(confidence),
      sessionId: '',
      tags: ['planning', 'goal-setting'],
      hash: ThoughtUnitFactory.generateHash(content, agentId),
    };
  }

  /**
   * Convert numerical confidence to semantic level
   */
  private static getConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence < 0.2) return 'very_low';
    if (confidence < 0.4) return 'low';
    if (confidence < 0.6) return 'medium';
    if (confidence < 0.8) return 'high';
    if (confidence < 0.9) return 'very_high';
    return 'certain';
  }

  /**
   * Generate hash for thought content
   */
  private static generateHash(content: string, agentId: string): string {
    const data = `${content}|${agentId}|${Date.now()}`;
    return createHash('sha256').update(data).digest('hex');
  }
}

/**
 * Thought Unit Utilities
 */
export class ThoughtUnitUtils {
  /**
   * Calculate semantic similarity between thoughts
   */
  static calculateSimilarity(thought1: ThoughtUnit, thought2: ThoughtUnit): number {
    // Simple text similarity for now - could be enhanced with embeddings
    const words1 = new Set(thought1.content.toLowerCase().split(/\s+/));
    const words2 = new Set(thought2.content.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Find contradictions between thoughts
   */
  static findContradictions(thoughts: ThoughtUnit[]): Array<{
    thought1: ThoughtUnit;
    thought2: ThoughtUnit;
    contradictionType: string;
  }> {
    const contradictions: Array<{
      thought1: ThoughtUnit;
      thought2: ThoughtUnit;
      contradictionType: string;
    }> = [];

    // Simple contradiction detection based on keywords
    const contradictionPatterns = [
      { pattern: ['yes', 'no'], type: 'binary_opposition' },
      { pattern: ['true', 'false'], type: 'truth_opposition' },
      { pattern: ['increase', 'decrease'], type: 'direction_opposition' },
      { pattern: ['good', 'bad'], type: 'quality_opposition' },
    ];

    for (let i = 0; i < thoughts.length; i++) {
      for (let j = i + 1; j < thoughts.length; j++) {
        const thought1 = thoughts[i];
        const thought2 = thoughts[j];

        for (const { pattern, type } of contradictionPatterns) {
          const hasPattern1 = pattern.some(p => 
            thought1.content.toLowerCase().includes(p)
          );
          const hasPattern2 = pattern.some(p => 
            thought2.content.toLowerCase().includes(p)
          );

          if (hasPattern1 && hasPattern2) {
            contradictions.push({
              thought1,
              thought2,
              contradictionType: type,
            });
          }
        }
      }
    }

    return contradictions;
  }

  /**
   * Summarize thought chain
   */
  static summarizeChain(thoughts: ThoughtUnit[]): string {
    if (thoughts.length === 0) return '';
    if (thoughts.length === 1) return thoughts[0].content;

    // Extract key insights by type
    const observations = thoughts.filter(t => t.type === 'observation');
    const reasoning = thoughts.filter(t => t.type === 'reasoning');
    const conclusions = thoughts.filter(t => t.type === 'synthesis');

    const summary = [];
    
    if (observations.length > 0) {
      summary.push(`Based on ${observations.length} observations`);
    }
    
    if (reasoning.length > 0) {
      summary.push(`through ${reasoning.length} reasoning steps`);
    }
    
    if (conclusions.length > 0) {
      summary.push(`reached ${conclusions.length} conclusions`);
    }

    return summary.join(', ');
  }
}