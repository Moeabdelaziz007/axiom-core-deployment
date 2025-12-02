/**
 * AIX Data Lineage Tracker
 * 
 * This module provides the "Truth Layer" for sovereign agents,
 * tracking the origin, validity, and provenance of all data
 * used in reasoning and decision-making. Critical for market-based
 * systems where data freshness and authenticity determine value.
 * 
 * Enables agents to answer: "Where did this information come from?"
 * "How long is it valid?" and "Can I trust this source?"
 */

import { z } from 'zod';
import { createHash, createHmac } from 'crypto';

/**
 * Data Source Types - Enumerates all possible data origins
 * 
 * Critical for determining trustworthiness and applying appropriate
 * validation rules based on source characteristics.
 */
export const DataSourceTypeSchema = z.enum([
  'user_input',        // Direct input from human user
  'tool_output',       // Result from tool/API execution
  'memory_recall',      // Retrieved from agent's memory
  'swarm_consensus',   // Result from swarm coordination
  'blockchain',        // Data from blockchain transactions
  'external_api',       // Data from external services
  'agent_inference',    // Agent's own reasoning/inference
  'market_data',       // Real-time market information
  'peer_agent',        // Information from other agents
  'derived_computed',   // Computed from other sources
]);

export type DataSourceType = z.infer<typeof DataSourceTypeSchema>;

/**
 * Validity Period - Defines temporal validity of data
 * 
 * Essential for time-sensitive information like market prices,
 * security threats, and opportunity windows. Enables automatic
 * data expiration and refresh cycles.
 */
export const ValidityPeriodSchema = z.object({
  startTime: z.number().describe('Unix timestamp when data becomes valid'),
  endTime: z.number().describe('Unix timestamp when data expires'),
  isPermanent: z.boolean().default(false).describe('Whether data never expires'),
  refreshInterval: z.number().optional().describe('How often to refresh (ms)'),
  timezone: z.string().default('UTC').describe('Timezone for temporal calculations'),
});

export type ValidityPeriod = z.infer<typeof ValidityPeriodSchema>;

/**
 * Trust Level - Standardized trust scoring for data sources
 * 
 * Provides quantitative trust assessment that can be combined
 * with confidence scores for weighted decision-making.
 */
export const TrustLevelSchema = z.enum([
  'unverified',    // 0.0-0.2 - Source not verified
  'low',           // 0.2-0.4 - Some verification
  'medium',        // 0.4-0.6 - Moderately trusted
  'high',          // 0.6-0.8 - Well-vetted source
  'verified',       // 0.8-0.9 - Officially verified
  'authoritative'   // 0.9-1.0 - Definitive source
]);

export type TrustLevel = z.infer<typeof TrustLevelSchema>;

/**
 * Data Source - Complete provenance information
 * 
 * Tracks where data came from, how it was processed,
 * and its trustworthiness characteristics.
 */
export const DataSourceSchema = z.object({
  // Core identification
  sourceId: z.string().uuid().describe('Unique identifier for this data source'),
  type: DataSourceTypeSchema.describe('Type of data source'),
  
  // Source details
  originAgentId: z.string().optional().describe('Agent that created/provided this data'),
  originTool: z.string().optional().describe('Tool that generated this data'),
  originUrl: z.string().optional().describe('URL for external API sources'),
  originTransaction: z.string().optional().describe('Blockchain transaction hash'),
  
  // Processing chain
  processingSteps: z.array(z.object({
    step: z.string(),
    timestamp: z.number(),
    agentId: z.string(),
    description: z.string(),
  })).optional().describe('Chain of processing steps applied'),
  
  // Trust and validation
  trustLevel: TrustLevelSchema.describe('Trust level of this source'),
  trustScore: z.number().min(0).max(1).describe('Numerical trust score 0-1'),
  verificationMethod: z.string().optional().describe('How this source was verified'),
  lastVerified: z.number().optional().describe('Last verification timestamp'),
  
  // Temporal information
  validityPeriod: ValidityPeriodSchema.describe('When this data is valid'),
  acquisitionTime: z.number().describe('When this data was acquired'),
  
  // Quality metrics
  accuracy: z.number().min(0).max(1).optional().describe('Historical accuracy 0-1'),
  completeness: z.number().min(0).max(1).optional().describe('Data completeness 0-1'),
  freshness: z.number().min(0).max(1).optional().describe('Data freshness 0-1'),
  
  // Security and integrity
  hash: z.string().describe('Hash of original data content'),
  signature: z.string().optional().describe('Digital signature for authenticity'),
  encryptionMethod: z.string().optional().describe('Encryption used if any'),
  
  // Cost and economics
  acquisitionCost: z.number().optional().describe('Cost to acquire this data'),
  license: z.string().optional().describe('Usage license or restrictions'),
  
  // Metadata
  tags: z.array(z.string()).default([]).describe('Categorization tags'),
  version: z.string().optional().describe('Version of this data'),
  dependencies: z.array(z.string()).default([]).describe('Other data this depends on'),
});

export type DataSource = z.infer<typeof DataSourceSchema>;

/**
 * Lineage Node - Links data point to its sources
 * 
 * Represents the relationship between derived data and its
 * constituent sources, enabling traceability and impact analysis.
 */
export const LineageNodeSchema = z.object({
  // Core identification
  nodeId: z.string().uuid().describe('Unique identifier for this lineage node'),
  dataId: z.string().describe('ID of the data item this node describes'),
  
  // Lineage relationships
  parentSources: z.array(z.string()).describe('Source data IDs this was derived from'),
  childData: z.array(z.string()).describe('Data items derived from this'),
  siblingData: z.array(z.string()).optional().describe('Related data at same level'),
  
  // Derivation method
  derivationMethod: z.string().describe('How this data was derived'),
  derivationAlgorithm: z.string().optional().describe('Algorithm used for derivation'),
  derivationParameters: z.record(z.any()).optional().describe('Parameters for derivation'),
  
  // Transformation tracking
  transformations: z.array(z.object({
    type: z.string(),           // 'filter', 'aggregate', 'compute', etc.
    description: z.string(),
    timestamp: z.number(),
    agentId: z.string(),
    inputSources: z.array(z.string()),
    outputData: z.string(),
  })).optional().describe('Transformations applied to derive this data'),
  
  // Impact analysis
  confidenceImpact: z.number().min(-1).max(1).optional().describe('Impact on confidence'),
  trustImpact: z.number().min(-1).max(1).optional().describe('Impact on trust'),
  validityImpact: z.number().optional().describe('Impact on validity period (ms)'),
  
  // Quality metrics
  informationLoss: z.number().min(0).max(1).optional().describe('Information loss in derivation'),
  complexity: z.number().optional().describe('Computational complexity of derivation'),
  
  // Temporal tracking
  creationTime: z.number().describe('When this lineage node was created'),
  lastModified: z.number().optional().describe('Last modification timestamp'),
  
  // Verification
  hash: z.string().describe('Hash of lineage structure'),
  signature: z.string().optional().describe('Signature for authenticity'),
});

export type LineageNode = z.infer<typeof LineageNodeSchema>;

/**
 * Data Lineage Manager - Core service for tracking data provenance
 */
export class DataLineageManager {
  private lineageGraph: Map<string, LineageNode> = new Map();
  private dataSourceRegistry: Map<string, DataSource> = new Map();
  private trustWeights: Map<TrustLevel, number> = new Map([
    ['unverified', 0.1],
    ['low', 0.3],
    ['medium', 0.5],
    ['high', 0.7],
    ['verified', 0.9],
    ['authoritative', 1.0],
  ]);

  /**
   * Register a new data source with provenance
   */
  registerDataSource(source: DataSource): void {
    // Validate source structure
    const validation = this.validateDataSource(source);
    if (!validation.valid) {
      throw new Error(`Invalid data source: ${validation.errors.join(', ')}`);
    }

    // Generate hash if not provided
    if (!source.hash) {
      source.hash = this.generateDataHash(source);
    }

    this.dataSourceRegistry.set(source.sourceId, source);
  }

  /**
   * Create lineage node linking derived data to sources
   */
  createLineageNode(
    dataId: string,
    parentSources: string[],
    derivationMethod: string,
    agentId: string
  ): LineageNode {
    const node: LineageNode = {
      nodeId: crypto.randomUUID(),
      dataId,
      parentSources,
      derivationMethod,
      creationTime: Date.now(),
      hash: this.generateLineageHash(dataId, parentSources, derivationMethod),
    };

    this.lineageGraph.set(node.nodeId, node);

    // Update parent nodes to reference this child
    for (const sourceId of parentSources) {
      const parentNodes = Array.from(this.lineageGraph.values())
        .filter(n => n.dataId === sourceId);
      
      for (const parent of parentNodes) {
        parent.childData = [...(parent.childData || []), dataId];
      }
    }

    return node;
  }

  /**
   * Trace complete lineage for a data item
   */
  traceLineage(dataId: string, maxDepth: number = 10): LineageNode[] {
    const lineage: LineageNode[] = [];
    const visited = new Set<string>();

    const trace = (currentDataId: string, depth: number): void => {
      if (depth >= maxDepth || visited.has(currentDataId)) {
        return;
      }

      visited.add(currentDataId);
      const node = Array.from(this.lineageGraph.values())
        .find(n => n.dataId === currentDataId);
      
      if (node) {
        lineage.push(node);
        // Trace parent sources
        for (const sourceId of node.parentSources) {
          trace(sourceId, depth + 1);
        }
      }
    };

    trace(dataId, 0);
    return lineage.reverse(); // Return from root to current
  }

  /**
   * Calculate composite trust score for derived data
   */
  calculateCompositeTrust(dataId: string): number {
    const lineage = this.traceLineage(dataId);
    if (lineage.length === 0) return 0.5; // Default trust

    let compositeTrust = 1.0;
    let trustWeight = 1.0;

    for (const node of lineage) {
      // Get trust from source data
      let sourceTrust = 0.5; // Default
      for (const sourceId of node.parentSources) {
        const source = this.dataSourceRegistry.get(sourceId);
        if (source) {
          const sourceWeight = this.trustWeights.get(source.trustLevel) || 0.5;
          sourceTrust = Math.max(sourceTrust, sourceWeight);
        }
      }

      // Apply derivation impact
      const trustImpact = node.trustImpact || 0;
      const adjustedTrust = Math.max(0, Math.min(1, sourceTrust + trustImpact));

      // Weight by derivation method reliability
      const methodWeight = this.getDerivationMethodWeight(node.derivationMethod);
      
      compositeTrust *= (adjustedTrust * methodWeight);
      trustWeight *= 0.9; // Decay trust with each derivation step
    }

    return Math.max(0, Math.min(1, compositeTrust * trustWeight));
  }

  /**
   * Check if data is still valid
   */
  isDataValid(dataId: string): boolean {
    const source = Array.from(this.dataSourceRegistry.values())
      .find(s => s.sourceId === dataId);
    
    if (!source) return false;

    const now = Date.now();
    const { validityPeriod } = source;

    if (validityPeriod.isPermanent) return true;
    
    return now >= validityPeriod.startTime && now <= validityPeriod.endTime;
  }

  /**
   * Get data that needs refresh
   */
  getStaleData(thresholdMs: number = 300000): Array<{ dataId: string; source: DataSource }> {
    const now = Date.now();
    const stale: Array<{ dataId: string; source: DataSource }> = [];

    for (const [dataId, source] of this.dataSourceRegistry) {
      if (source.validityPeriod.isPermanent) continue;

      const timeUntilExpiry = source.validityPeriod.endTime - now;
      const refreshInterval = source.validityPeriod.refreshInterval || thresholdMs;

      if (timeUntilExpiry <= refreshInterval) {
        stale.push({ dataId, source });
      }
    }

    return stale;
  }

  /**
   * Generate hash for data content
   */
  private generateDataHash(source: DataSource): string {
    const content = JSON.stringify({
      type: source.type,
      originAgentId: source.originAgentId,
      originTool: source.originTool,
      acquisitionTime: source.acquisitionTime,
    });
    
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Generate hash for lineage node
   */
  private generateLineageHash(
    dataId: string,
    parentSources: string[],
    derivationMethod: string
  ): string {
    const content = JSON.stringify({ dataId, parentSources, derivationMethod });
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get reliability weight for derivation method
   */
  private getDerivationMethodWeight(method: string): number {
    const weights: Record<string, number> = {
      'direct_copy': 1.0,
      'filter': 0.95,
      'aggregate': 0.9,
      'compute': 0.85,
      'interpolate': 0.8,
      'extrapolate': 0.7,
      'ml_inference': 0.75,
      'consensus': 0.95,
    };

    return weights[method] || 0.8;
  }

  /**
   * Validate data source structure
   */
  private validateDataSource(source: DataSource): { valid: boolean; errors: string[] } {
    const result = DataSourceSchema.safeParse(source);
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.issues.map(i => i.message),
    };
  }

  /**
   * Get lineage statistics
   */
  getLineageStats(): {
    totalNodes: number;
    totalSources: number;
    averageDepth: number;
    trustDistribution: Record<TrustLevel, number>;
  } {
    const nodes = Array.from(this.lineageGraph.values());
    const sources = Array.from(this.dataSourceRegistry.values());

    // Calculate average depth
    const depths = nodes.map(node => this.traceLineage(node.dataId).length);
    const averageDepth = depths.reduce((a, b) => a + b, 0) / depths.length;

    // Trust distribution
    const trustDistribution: Record<TrustLevel, number> = {
      unverified: 0,
      low: 0,
      medium: 0,
      high: 0,
      verified: 0,
      authoritative: 0,
    };

    for (const source of sources) {
      trustDistribution[source.trustLevel]++;
    }

    return {
      totalNodes: nodes.length,
      totalSources: sources.length,
      averageDepth,
      trustDistribution,
    };
  }
}

/**
 * Data Lineage Utilities
 */
export class DataLineageUtils {
  /**
   * Create data source from tool execution
   */
  static createToolDataSource(
    toolName: string,
    result: any,
    agentId: string,
    trustLevel: TrustLevel = 'medium'
  ): DataSource {
    return {
      sourceId: crypto.randomUUID(),
      type: 'tool_output',
      originAgentId: agentId,
      originTool: toolName,
      trustLevel,
      trustScore: DataLineageManager.prototype['trustWeights'].get(trustLevel) || 0.5,
      validityPeriod: {
        startTime: Date.now(),
        endTime: Date.now() + 300000, // 5 minutes default
        isPermanent: false,
      },
      acquisitionTime: Date.now(),
      hash: createHash('sha256').update(JSON.stringify(result)).digest('hex'),
      tags: ['tool-output', toolName],
    };
  }

  /**
   * Create data source from user input
   */
  static createUserInputDataSource(
    content: string,
    userId: string,
    trustLevel: TrustLevel = 'verified'
  ): DataSource {
    return {
      sourceId: crypto.randomUUID(),
      type: 'user_input',
      originAgentId: userId,
      trustLevel,
      trustScore: 1.0, // User input is fully trusted
      validityPeriod: {
        startTime: Date.now(),
        endTime: Date.now() + 3600000, // 1 hour
        isPermanent: false,
      },
      acquisitionTime: Date.now(),
      hash: createHash('sha256').update(content).digest('hex'),
      tags: ['user-input'],
    };
  }

  /**
   * Create data source from blockchain data
   */
  static createBlockchainDataSource(
    transactionHash: string,
    network: string,
    data: any
  ): DataSource {
    return {
      sourceId: crypto.randomUUID(),
      type: 'blockchain',
      originTransaction: transactionHash,
      trustLevel: 'authoritative', // Blockchain data is authoritative
      trustScore: 1.0,
      validityPeriod: {
        startTime: Date.now(),
        isPermanent: true, // Blockchain data is permanent
      },
      acquisitionTime: Date.now(),
      hash: createHash('sha256').update(JSON.stringify(data)).digest('hex'),
      tags: ['blockchain', network],
    };
  }

  /**
   * Merge multiple data sources with conflict resolution
   */
  static mergeDataSources(
    sources: DataSource[],
    mergeStrategy: 'highest_trust' | 'most_recent' | 'consensus' = 'highest_trust'
  ): DataSource {
    if (sources.length === 0) {
      throw new Error('Cannot merge empty data sources array');
    }

    if (sources.length === 1) {
      return sources[0];
    }

    let selectedSource: DataSource;

    switch (mergeStrategy) {
      case 'highest_trust':
        selectedSource = sources.reduce((prev, curr) => 
          curr.trustScore > prev.trustScore ? curr : prev
        );
        break;

      case 'most_recent':
        selectedSource = sources.reduce((prev, curr) => 
          curr.acquisitionTime > prev.acquisitionTime ? curr : prev
        );
        break;

      case 'consensus':
        // For consensus, we'd need more sophisticated logic
        // For now, use the one with highest trust
        selectedSource = sources.reduce((prev, curr) => 
          curr.trustScore > prev.trustScore ? curr : prev
        );
        break;

      default:
        selectedSource = sources[0];
    }

    // Create derived data source
    return {
      sourceId: crypto.randomUUID(),
      type: 'derived_computed',
      originAgentId: 'system',
      trustLevel: 'medium',
      trustScore: selectedSource.trustScore * 0.9, // Slight reduction for merging
      validityPeriod: selectedSource.validityPeriod,
      acquisitionTime: Date.now(),
      hash: createHash('sha256').update(
        sources.map(s => s.hash).join('|')
      ).digest('hex'),
      tags: ['merged', ...new Set(sources.flatMap(s => s.tags))],
      dependencies: sources.map(s => s.sourceId),
    };
  }
}