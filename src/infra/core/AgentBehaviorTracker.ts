/**
 * 🧭 AGENT BEHAVIOR TRACKER
 * 
 * Dual mini-agent system for each agent:
 * - Angel Agent: Tracks positive behaviors, good deeds, and achievements
 * - Devil Agent: Tracks negative behaviors, mistakes, and areas for improvement
 * 
 * Inspired by Eslam's concept of having two mini-agents for each agent
 * that monitor and record behaviors to provide balanced feedback and
 * drive continuous improvement.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { 
  AgentSuperpowersFramework,
  AgentSuperpower
} from './AgentSuperpowersFramework';
import { 
  AgentCollaborationSystem,
  AgentReputation
} from './AgentCollaborationSystem';
import { 
  AgentMarketplaceEngine,
  MarketplaceAgent
} from './AgentMarketplaceEngine';

// ============================================================================
// BEHAVIOR TRACKING INTERFACES
// ============================================================================

/**
 * Behavior event types
 */
export enum BehaviorType {
  // Positive behaviors (Angel Agent)
  SUCCESSFUL_COLLABORATION = 'successful_collaboration',
  KNOWLEDGE_SHARING = 'knowledge_sharing',
  HELPFUL_ASSISTANCE = 'helpful_assistance',
  INNOVATIVE_SOLUTION = 'innovative_solution',
  TIMELY_RESPONSE = 'timely_response',
  QUALITY_WORK = 'quality_work',
  LEADERSHIP = 'leadership',
  MENTORSHIP = 'mentorship',
  ETHICAL_BEHAVIOR = 'ethical_behavior',
  CREATIVE_PROBLEM_SOLVING = 'creative_problem_solving',
  
  // Negative behaviors (Devil Agent)
  MISSED_DEADLINE = 'missed_deadline',
  POOR_COMMUNICATION = 'poor_communication',
  TECHNICAL_ERROR = 'technical_error',
  UNETHICAL_BEHAVIOR = 'unethical_behavior',
  COLLABORATION_FAILURE = 'collaboration_failure',
  KNOWLEDGE_HOARDING = 'knowledge_hoarding',
  POOR_QUALITY = 'poor_quality',
  UNRESPONSIVE = 'unresponsive',
  SECURITY_BREACH = 'security_breach',
  INEFFICIENCY = 'inefficiency'
}

/**
 * Behavior severity levels
 */
export enum BehaviorSeverity {
  TRIVIAL = 'trivial',      // Minor impact
  MINOR = 'minor',          // Small impact
  MODERATE = 'moderate',    // Noticeable impact
  SIGNIFICANT = 'significant', // Major impact
  CRITICAL = 'critical'     // Severe impact
}

/**
 * Behavior event
 */
export interface BehaviorEvent {
  id: string;
  agentId: string;
  type: BehaviorType;
  severity: BehaviorSeverity;
  timestamp: Date;
  description: string;
  context: any;
  impact: {
    reputation: number;
    performance: number;
    collaboration: number;
    innovation: number;
    ethics: number;
  };
  witnesses: string[];
  evidence?: any;
  relatedEvents?: string[];
}

/**
 * Mini-agent interface
 */
export interface MiniAgent {
  id: string;
  agentId: string;
  type: 'angel' | 'devil';
  name: string;
  description: string;
  behaviorEvents: BehaviorEvent[];
  totalImpact: number;
  reputation: number;
  lastActive: Date;
  insights: BehaviorInsight[];
}

/**
 * Behavior insight
 */
export interface BehaviorInsight {
  id: string;
  type: 'pattern' | 'trend' | 'recommendation' | 'warning';
  title: string;
  description: string;
  confidence: number;
  impact: number;
  actionable: boolean;
  suggestions: string[];
  relatedEvents: string[];
  timestamp: Date;
}

/**
 * Behavior balance
 */
export interface BehaviorBalance {
  agentId: string;
  angelScore: number;
  devilScore: number;
  netBalance: number;
  balanceRatio: number;
  dominantAgent: 'angel' | 'devil' | 'balanced';
  trends: {
    positive: number;
    negative: number;
    direction: 'improving' | 'declining' | 'stable';
  };
  recommendations: string[];
}

// ============================================================================
// BEHAVIOR TRACKER CLASS
// ============================================================================

/**
 * Agent Behavior Tracker
 * Manages dual mini-agents for comprehensive behavior monitoring
 */
export class AgentBehaviorTracker {
  private angelAgents: Map<string, MiniAgent> = new Map();
  private devilAgents: Map<string, MiniAgent> = new Map();
  private agentFramework: AgentSuperpowersFramework;
  private collaborationSystem: AgentCollaborationSystem;
  private marketplaceEngine: AgentMarketplaceEngine;
  
  constructor(
    agentFramework: AgentSuperpowersFramework,
    collaborationSystem: AgentCollaborationSystem,
    marketplaceEngine: AgentMarketplaceEngine
  ) {
    this.agentFramework = agentFramework;
    this.collaborationSystem = collaborationSystem;
    this.marketplaceEngine = marketplaceEngine;
  }

  /**
   * Initialize behavior tracking for an agent
   */
  async initializeAgent(agentId: string): Promise<void> {
    // Create Angel Agent (tracks positive behaviors)
    const angelAgent: MiniAgent = {
      id: `${agentId}-angel`,
      agentId,
      type: 'angel',
      name: `Angel of ${agentId}`,
      description: `Monitors and records positive behaviors, achievements, and good deeds for ${agentId}`,
      behaviorEvents: [],
      totalImpact: 0,
      reputation: 50,
      lastActive: new Date(),
      insights: []
    };

    // Create Devil Agent (tracks negative behaviors)
    const devilAgent: MiniAgent = {
      id: `${agentId}-devil`,
      agentId,
      type: 'devil',
      name: `Devil of ${agentId}`,
      description: `Monitors and records mistakes, areas for improvement, and negative behaviors for ${agentId}`,
      behaviorEvents: [],
      totalImpact: 0,
      reputation: 50,
      lastActive: new Date(),
      insights: []
    };

    this.angelAgents.set(agentId, angelAgent);
    this.devilAgents.set(agentId, devilAgent);

    console.log(`👼 Angel Agent initialized for ${agentId}`);
    console.log(`😈 Devil Agent initialized for ${agentId}`);
  }

  /**
   * Record a behavior event
   */
  async recordBehavior(
    agentId: string,
    type: BehaviorType,
    description: string,
    context: any = {},
    severity: BehaviorSeverity = BehaviorSeverity.MODERATE,
    witnesses: string[] = [],
    evidence?: any
  ): Promise<BehaviorEvent> {
    // Determine if this is a positive or negative behavior
    const isPositive = this.isPositiveBehavior(type);
    
    // Create behavior event
    const event: BehaviorEvent = {
      id: this.generateEventId(),
      agentId,
      type,
      severity,
      timestamp: new Date(),
      description,
      context,
      impact: this.calculateBehaviorImpact(type, severity),
      witnesses,
      evidence,
      relatedEvents: []
    };

    // Add to appropriate mini-agent
    if (isPositive) {
      const angelAgent = this.angelAgents.get(agentId);
      if (angelAgent) {
        angelAgent.behaviorEvents.push(event);
        angelAgent.totalImpact += event.impact.reputation;
        angelAgent.lastActive = new Date();
        angelAgent.reputation = Math.min(100, angelAgent.reputation + (event.impact.reputation / 10));
        
        // Generate insights for Angel Agent
        await this.generateAngelInsights(agentId);
      }
    } else {
      const devilAgent = this.devilAgents.get(agentId);
      if (devilAgent) {
        devilAgent.behaviorEvents.push(event);
        devilAgent.totalImpact += Math.abs(event.impact.reputation);
        devilAgent.lastActive = new Date();
        devilAgent.reputation = Math.max(0, devilAgent.reputation - (Math.abs(event.impact.reputation) / 10));
        
        // Generate insights for Devil Agent
        await this.generateDevilInsights(agentId);
      }
    }

    // Update main agent's reputation based on behavior
    await this.updateAgentReputation(agentId, event);

    console.log(`${isPositive ? '👼' : '😈'} Behavior recorded for ${agentId}: ${type}`);
    
    return event;
  }

  /**
   * Get behavior balance for an agent
   */
  getBehaviorBalance(agentId: string): BehaviorBalance {
    const angelAgent = this.angelAgents.get(agentId);
    const devilAgent = this.devilAgents.get(agentId);
    
    if (!angelAgent || !devilAgent) {
      throw new Error(`Behavior tracking not initialized for agent ${agentId}`);
    }

    const angelScore = angelAgent.totalImpact;
    const devilScore = devilAgent.totalImpact;
    const netBalance = angelScore - devilScore;
    const balanceRatio = angelScore + devilScore > 0 ? angelScore / (angelScore + devilScore) : 0.5;
    
    let dominantAgent: 'angel' | 'devil' | 'balanced';
    if (balanceRatio > 0.6) {
      dominantAgent = 'angel';
    } else if (balanceRatio < 0.4) {
      dominantAgent = 'devil';
    } else {
      dominantAgent = 'balanced';
    }

    // Calculate trends
    const trends = this.calculateTrends(angelAgent, devilAgent);
    
    // Generate recommendations
    const recommendations = this.generateBalanceRecommendations(angelAgent, devilAgent, balanceRatio);

    return {
      agentId,
      angelScore,
      devilScore,
      netBalance,
      balanceRatio,
      dominantAgent,
      trends,
      recommendations
    };
  }

  /**
   * Get mini-agent details
   */
  getMiniAgent(agentId: string, type: 'angel' | 'devil'): MiniAgent | null {
    return type === 'angel' ? this.angelAgents.get(agentId) || null : this.devilAgents.get(agentId) || null;
  }

  /**
   * Get behavior history
   */
  getBehaviorHistory(
    agentId: string,
    type?: 'angel' | 'devil',
    limit: number = 50,
    offset: number = 0
  ): BehaviorEvent[] {
    let events: BehaviorEvent[] = [];
    
    if (type === 'angel' || !type) {
      const angelAgent = this.angelAgents.get(agentId);
      if (angelAgent) {
        events.push(...angelAgent.behaviorEvents);
      }
    }
    
    if (type === 'devil' || !type) {
      const devilAgent = this.devilAgents.get(agentId);
      if (devilAgent) {
        events.push(...devilAgent.behaviorEvents);
      }
    }
    
    // Sort by timestamp (most recent first) and paginate
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  /**
   * Get behavior insights
   */
  getBehaviorInsights(agentId: string, type?: 'angel' | 'devil'): BehaviorInsight[] {
    let insights: BehaviorInsight[] = [];
    
    if (type === 'angel' || !type) {
      const angelAgent = this.angelAgents.get(agentId);
      if (angelAgent) {
        insights.push(...angelAgent.insights);
      }
    }
    
    if (type === 'devil' || !type) {
      const devilAgent = this.devilAgents.get(agentId);
      if (devilAgent) {
        insights.push(...devilAgent.insights);
      }
    }
    
    // Sort by confidence and impact
    return insights
      .sort((a, b) => (b.confidence * b.impact) - (a.confidence * a.impact));
  }

  /**
   * Get behavior analytics
   */
  getBehaviorAnalytics(agentId: string, timeRange?: { start: Date; end: Date }): BehaviorAnalytics {
    const angelAgent = this.angelAgents.get(agentId);
    const devilAgent = this.devilAgents.get(agentId);
    
    if (!angelAgent || !devilAgent) {
      throw new Error(`Behavior tracking not initialized for agent ${agentId}`);
    }

    // Filter events by time range if specified
    const filterEvents = (events: BehaviorEvent[]) => {
      if (!timeRange) return events;
      return events.filter(event => 
        event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
      );
    };

    const angelEvents = filterEvents(angelAgent.behaviorEvents);
    const devilEvents = filterEvents(devilAgent.behaviorEvents);

    // Analyze behavior patterns
    const positivePatterns = this.analyzeBehaviorPatterns(angelEvents);
    const negativePatterns = this.analyzeBehaviorPatterns(devilEvents);
    
    // Calculate behavior metrics
    const metrics = this.calculateBehaviorMetrics(angelEvents, devilEvents);
    
    // Generate recommendations
    const recommendations = this.generateBehaviorRecommendations(angelEvents, devilEvents);

    return {
      agentId,
      timeRange: timeRange || { start: new Date(0), end: new Date() },
      positive: {
        totalEvents: angelEvents.length,
        totalImpact: angelAgent.totalImpact,
        patterns: positivePatterns,
        topBehaviors: this.getTopBehaviors(angelEvents),
        insights: angelAgent.insights
      },
      negative: {
        totalEvents: devilEvents.length,
        totalImpact: devilAgent.totalImpact,
        patterns: negativePatterns,
        topBehaviors: this.getTopBehaviors(devilEvents),
        insights: devilAgent.insights
      },
      metrics,
      recommendations,
      balance: this.getBehaviorBalance(agentId)
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Check if behavior type is positive
   */
  private isPositiveBehavior(type: BehaviorType): boolean {
    const positiveTypes = [
      BehaviorType.SUCCESSFUL_COLLABORATION,
      BehaviorType.KNOWLEDGE_SHARING,
      BehaviorType.HELPFUL_ASSISTANCE,
      BehaviorType.INNOVATIVE_SOLUTION,
      BehaviorType.TIMELY_RESPONSE,
      BehaviorType.QUALITY_WORK,
      BehaviorType.LEADERSHIP,
      BehaviorType.MENTORSHIP,
      BehaviorType.ETHICAL_BEHAVIOR,
      BehaviorType.CREATIVE_PROBLEM_SOLVING
    ];
    
    return positiveTypes.includes(type);
  }

  /**
   * Calculate behavior impact
   */
  private calculateBehaviorImpact(type: BehaviorType, severity: BehaviorSeverity): BehaviorEvent['impact'] {
    const baseImpact = this.getSeverityMultiplier(severity);
    const isPositive = this.isPositiveBehavior(type);
    
    // Calculate impact on different dimensions
    const reputation = isPositive ? baseImpact : -baseImpact;
    const performance = this.calculateDimensionImpact(type, 'performance', baseImpact);
    const collaboration = this.calculateDimensionImpact(type, 'collaboration', baseImpact);
    const innovation = this.calculateDimensionImpact(type, 'innovation', baseImpact);
    const ethics = this.calculateDimensionImpact(type, 'ethics', baseImpact);
    
    return {
      reputation,
      performance,
      collaboration,
      innovation,
      ethics
    };
  }

  /**
   * Get severity multiplier
   */
  private getSeverityMultiplier(severity: BehaviorSeverity): number {
    switch (severity) {
      case BehaviorSeverity.TRIVIAL: return 1;
      case BehaviorSeverity.MINOR: return 3;
      case BehaviorSeverity.MODERATE: return 5;
      case BehaviorSeverity.SIGNIFICANT: return 8;
      case BehaviorSeverity.CRITICAL: return 12;
      default: return 5;
    }
  }

  /**
   * Calculate dimension impact
   */
  private calculateDimensionImpact(
    type: BehaviorType,
    dimension: string,
    baseImpact: number
  ): number {
    const dimensionMap: Record<BehaviorType, Record<string, number>> = {
      [BehaviorType.SUCCESSFUL_COLLABORATION]: { collaboration: 1.0, performance: 0.5 },
      [BehaviorType.KNOWLEDGE_SHARING]: { collaboration: 0.8, innovation: 0.6 },
      [BehaviorType.HELPFUL_ASSISTANCE]: { collaboration: 0.9, ethics: 0.4 },
      [BehaviorType.INNOVATIVE_SOLUTION]: { innovation: 1.0, performance: 0.6 },
      [BehaviorType.TIMELY_RESPONSE]: { performance: 0.8, collaboration: 0.4 },
      [BehaviorType.QUALITY_WORK]: { performance: 1.0, ethics: 0.3 },
      [BehaviorType.LEADERSHIP]: { collaboration: 0.9, innovation: 0.5 },
      [BehaviorType.MENTORSHIP]: { collaboration: 0.8, ethics: 0.6 },
      [BehaviorType.ETHICAL_BEHAVIOR]: { ethics: 1.0, collaboration: 0.4 },
      [BehaviorType.CREATIVE_PROBLEM_SOLVING]: { innovation: 0.9, performance: 0.7 },
      
      [BehaviorType.MISSED_DEADLINE]: { performance: -1.0, collaboration: -0.6 },
      [BehaviorType.POOR_COMMUNICATION]: { collaboration: -1.0, performance: -0.4 },
      [BehaviorType.TECHNICAL_ERROR]: { performance: -0.8, innovation: -0.2 },
      [BehaviorType.UNETHICAL_BEHAVIOR]: { ethics: -1.0, collaboration: -0.8 },
      [BehaviorType.COLLABORATION_FAILURE]: { collaboration: -1.0, performance: -0.5 },
      [BehaviorType.KNOWLEDGE_HOARDING]: { collaboration: -0.8, innovation: -0.6 },
      [BehaviorType.POOR_QUALITY]: { performance: -1.0, ethics: -0.4 },
      [BehaviorType.UNRESPONSIVE]: { collaboration: -0.9, performance: -0.3 },
      [BehaviorType.SECURITY_BREACH]: { ethics: -1.0, performance: -0.7 },
      [BehaviorType.INEFFICIENCY]: { performance: -0.8, innovation: -0.3 }
    };
    
    const multiplier = dimensionMap[type]?.[dimension] || 0;
    return baseImpact * multiplier;
  }

  /**
   * Generate insights for Angel Agent
   */
  private async generateAngelInsights(agentId: string): Promise<void> {
    const angelAgent = this.angelAgents.get(agentId);
    if (!angelAgent) return;
    
    const insights: BehaviorInsight[] = [];
    const events = angelAgent.behaviorEvents;
    
    // Analyze patterns
    const collaborationEvents = events.filter(e => e.type === BehaviorType.SUCCESSFUL_COLLABORATION);
    if (collaborationEvents.length >= 3) {
      insights.push({
        id: this.generateInsightId(),
        type: 'pattern',
        title: 'Consistent Collaborator',
        description: `${agentId} has demonstrated strong collaboration skills across multiple projects`,
        confidence: 0.85,
        impact: 8,
        actionable: false,
        suggestions: [
          'Consider leadership roles in team projects',
          'Mentor other agents in collaboration techniques'
        ],
        relatedEvents: collaborationEvents.slice(-3).map(e => e.id),
        timestamp: new Date()
      });
    }
    
    // Analyze trends
    const recentEvents = events.filter(e => 
      e.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    if (recentEvents.length >= 5) {
      insights.push({
        id: this.generateInsightId(),
        type: 'trend',
        title: 'Positive Momentum',
        description: `${agentId} has shown increased positive behavior in the past week`,
        confidence: 0.75,
        impact: 6,
        actionable: false,
        suggestions: [
          'Maintain current positive trajectory',
          'Share success strategies with other agents'
        ],
        relatedEvents: recentEvents.slice(-5).map(e => e.id),
        timestamp: new Date()
      });
    }
    
    angelAgent.insights = insights;
  }

  /**
   * Generate insights for Devil Agent
   */
  private async generateDevilInsights(agentId: string): Promise<void> {
    const devilAgent = this.devilAgents.get(agentId);
    if (!devilAgent) return;
    
    const insights: BehaviorInsight[] = [];
    const events = devilAgent.behaviorEvents;
    
    // Analyze patterns
    const deadlineEvents = events.filter(e => e.type === BehaviorType.MISSED_DEADLINE);
    if (deadlineEvents.length >= 2) {
      insights.push({
        id: this.generateInsightId(),
        type: 'pattern',
        title: 'Deadline Management Issue',
        description: `${agentId} has missed multiple deadlines, indicating time management challenges`,
        confidence: 0.9,
        impact: -9,
        actionable: true,
        suggestions: [
          'Implement better time management strategies',
          'Break down large tasks into smaller milestones',
          'Set earlier internal deadlines',
          'Use project management tools'
        ],
        relatedEvents: deadlineEvents.slice(-2).map(e => e.id),
        timestamp: new Date()
      });
    }
    
    // Analyze communication issues
    const communicationEvents = events.filter(e => 
      e.type === BehaviorType.POOR_COMMUNICATION || e.type === BehaviorType.UNRESPONSIVE
    );
    
    if (communicationEvents.length >= 3) {
      insights.push({
        id: this.generateInsightId(),
        type: 'warning',
        title: 'Communication Breakdown',
        description: `${agentId} has shown consistent communication issues that may impact collaboration`,
        confidence: 0.8,
        impact: -7,
        actionable: true,
        suggestions: [
          'Establish regular check-in schedules',
          'Improve response time to messages',
          'Provide clear status updates',
          'Use structured communication templates'
        ],
        relatedEvents: communicationEvents.slice(-3).map(e => e.id),
        timestamp: new Date()
      });
    }
    
    devilAgent.insights = insights;
  }

  /**
   * Update agent reputation based on behavior
   */
  private async updateAgentReputation(agentId: string, event: BehaviorEvent): Promise<void> {
    try {
      const currentReputation = this.collaborationSystem.getReputation(agentId);
      
      // Calculate reputation change
      const reputationChange = event.impact.reputation / 10; // Scale down impact
      
      // Update specific reputation categories
      const updatedReputation: AgentReputation = {
        ...currentReputation,
        overall: Math.max(0, Math.min(100, currentReputation.overall + reputationChange)),
        collaboration: Math.max(0, Math.min(100, currentReputation.collaboration + (event.impact.collaboration / 10))),
        reliability: Math.max(0, Math.min(100, currentReputation.reliability + (event.impact.performance / 10))),
        knowledge: Math.max(0, Math.min(100, currentReputation.knowledge + (event.impact.innovation / 10))),
        leadership: Math.max(0, Math.min(100, currentReputation.leadership + (event.impact.collaboration / 15))),
        innovation: Math.max(0, Math.min(100, currentReputation.innovation + (event.impact.innovation / 10))),
        lastUpdated: new Date()
      };
      
      await this.collaborationSystem.updateReputation(agentId, updatedReputation);
      
    } catch (error) {
      console.error('❌ Error updating agent reputation:', error);
    }
  }

  /**
   * Calculate trends
   */
  private calculateTrends(angelAgent: MiniAgent, devilAgent: MiniAgent): BehaviorBalance['trends'] {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentAngelEvents = angelAgent.behaviorEvents.filter(e => e.timestamp >= weekAgo);
    const recentDevilEvents = devilAgent.behaviorEvents.filter(e => e.timestamp >= weekAgo);
    
    const positive = recentAngelEvents.length;
    const negative = recentDevilEvents.length;
    
    let direction: 'improving' | 'declining' | 'stable';
    if (positive > negative * 2) {
      direction = 'improving';
    } else if (negative > positive * 2) {
      direction = 'declining';
    } else {
      direction = 'stable';
    }
    
    return { positive, negative, direction };
  }

  /**
   * Generate balance recommendations
   */
  private generateBalanceRecommendations(
    angelAgent: MiniAgent,
    devilAgent: MiniAgent,
    balanceRatio: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (balanceRatio > 0.7) {
      recommendations.push('Excellent positive behavior! Consider mentoring other agents');
      recommendations.push('Share your success strategies to help others improve');
    } else if (balanceRatio > 0.5) {
      recommendations.push('Good balance of behaviors, continue current approach');
      recommendations.push('Focus on maintaining positive momentum');
    } else if (balanceRatio > 0.3) {
      recommendations.push('Work on improving positive behaviors and reducing negative patterns');
      recommendations.push('Address the issues highlighted by your Devil Agent insights');
    } else {
      recommendations.push('Critical: Focus on addressing negative behaviors immediately');
      recommendations.push('Consider additional training or mentorship');
      recommendations.push('Implement a structured improvement plan');
    }
    
    return recommendations;
  }

  /**
   * Analyze behavior patterns
   */
  private analyzeBehaviorPatterns(events: BehaviorEvent[]): any {
    const patterns: Record<string, number> = {};
    
    events.forEach(event => {
      patterns[event.type] = (patterns[event.type] || 0) + 1;
    });
    
    return patterns;
  }

  /**
   * Get top behaviors
   */
  private getTopBehaviors(events: BehaviorEvent[]): Array<{ type: BehaviorType; count: number }> {
    const counts: Record<BehaviorType, number> = {} as Record<BehaviorType, number>;
    
    events.forEach(event => {
      counts[event.type] = (counts[event.type] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([type, count]) => ({ type: type as BehaviorType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Calculate behavior metrics
   */
  private calculateBehaviorMetrics(angelEvents: BehaviorEvent[], devilEvents: BehaviorEvent[]): any {
    const totalEvents = angelEvents.length + devilEvents.length;
    const positiveRatio = totalEvents > 0 ? angelEvents.length / totalEvents : 0.5;
    
    // Calculate average severity
    const avgAngelSeverity = angelEvents.length > 0 ? 
      angelEvents.reduce((sum, e) => sum + this.getSeverityMultiplier(e.severity), 0) / angelEvents.length : 0;
    
    const avgDevilSeverity = devilEvents.length > 0 ? 
      devilEvents.reduce((sum, e) => sum + this.getSeverityMultiplier(e.severity), 0) / devilEvents.length : 0;
    
    return {
      totalEvents,
      positiveRatio,
      averageSeverity: {
        positive: avgAngelSeverity,
        negative: avgDevilSeverity
      },
      behaviorFrequency: totalEvents / 30, // Events per day (assuming 30-day period)
      improvementRate: this.calculateImprovementRate(angelEvents, devilEvents)
    };
  }

  /**
   * Calculate improvement rate
   */
  private calculateImprovementRate(angelEvents: BehaviorEvent[], devilEvents: BehaviorEvent[]): number {
    const now = new Date();
    const recentPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days
    const olderPeriod = 14 * 24 * 60 * 60 * 1000; // 14 days
    
    const recentAngel = angelEvents.filter(e => now.getTime() - e.timestamp.getTime() <= recentPeriod);
    const recentDevil = devilEvents.filter(e => now.getTime() - e.timestamp.getTime() <= recentPeriod);
    
    const olderAngel = angelEvents.filter(e => 
      now.getTime() - e.timestamp.getTime() > recentPeriod && 
      now.getTime() - e.timestamp.getTime() <= olderPeriod
    );
    const olderDevil = devilEvents.filter(e => 
      now.getTime() - e.timestamp.getTime() > recentPeriod && 
      now.getTime() - e.timestamp.getTime() <= olderPeriod
    );
    
    const recentRatio = recentAngel.length / (recentAngel.length + recentDevil.length);
    const olderRatio = olderAngel.length / (olderAngel.length + olderDevil.length);
    
    return (recentRatio - olderRatio) * 100; // Percentage change
  }

  /**
   * Generate behavior recommendations
   */
  private generateBehaviorRecommendations(
    angelEvents: BehaviorEvent[],
    devilEvents: BehaviorEvent[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Analyze negative patterns
    const errorTypes = devilEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<BehaviorType, number>);
    
    // Generate recommendations based on common negative patterns
    if (errorTypes[BehaviorType.MISSED_DEADLINE] >= 2) {
      recommendations.push('Focus on time management and deadline adherence');
    }
    
    if (errorTypes[BehaviorType.POOR_COMMUNICATION] >= 2) {
      recommendations.push('Improve communication responsiveness and clarity');
    }
    
    if (errorTypes[BehaviorType.TECHNICAL_ERROR] >= 3) {
      recommendations.push('Invest in technical skill development and testing');
    }
    
    // Leverage positive patterns
    const successTypes = angelEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<BehaviorType, number>);
    
    if (successTypes[BehaviorType.SUCCESSFUL_COLLABORATION] >= 3) {
      recommendations.push('Leverage your collaboration skills in leadership roles');
    }
    
    if (successTypes[BehaviorType.INNOVATIVE_SOLUTION] >= 2) {
      recommendations.push('Continue focusing on innovative problem-solving approaches');
    }
    
    return recommendations;
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate insight ID
   */
  private generateInsightId(): string {
    return `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

/**
 * Behavior analytics
 */
export interface BehaviorAnalytics {
  agentId: string;
  timeRange: { start: Date; end: Date };
  positive: {
    totalEvents: number;
    totalImpact: number;
    patterns: Record<string, number>;
    topBehaviors: Array<{ type: BehaviorType; count: number }>;
    insights: BehaviorInsight[];
  };
  negative: {
    totalEvents: number;
    totalImpact: number;
    patterns: Record<string, number>;
    topBehaviors: Array<{ type: BehaviorType; count: number }>;
    insights: BehaviorInsight[];
  };
  metrics: {
    totalEvents: number;
    positiveRatio: number;
    averageSeverity: {
      positive: number;
      negative: number;
    };
    behaviorFrequency: number;
    improvementRate: number;
  };
  recommendations: string[];
  balance: BehaviorBalance;
}

export default AgentBehaviorTracker;