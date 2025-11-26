/**
 * 🔗 AGENT COMMUNICATION INTEGRATION
 * 
 * Integration layer that connects all communication systems with:
 * - AgentSuperpowersFramework for skill sharing during communication
 * - AgentCollaborationSystem for team-based communication
 * - AgentMarketplaceEngine for agent discovery and communication
 * - Performance metrics system for communication analytics
 * - Communication reputation scoring
 * - Unified API interface for all communication features
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { 
  AgentSuperpowersFramework, 
  AGENT_SUPERPOWERS,
  AgentSuperpower
} from './AgentSuperpowersFramework';
import { 
  AgentCollaborationSystem, 
  CollaborationSession,
  CollaborationTask,
  AgentCollaboration,
  AgentReputation
} from './AgentCollaborationSystem';
import { 
  AgentMarketplaceEngine, 
  MarketplaceAgent,
  MarketplaceTransaction,
  AgentPerformanceMetrics
} from './AgentMarketplaceEngine';
import { 
  AgentCommunicationSystem,
  AgentMessage,
  MessageResult,
  BroadcastResult,
  SessionResult,
  JoinResult,
  LeaveResult
} from './AgentCommunicationSystem';
import { 
  RealtimeCommunicationSystem,
  RealtimeSession,
  SessionCreationResult,
  JoinSessionResult,
  TypingResult,
  ReadReceiptResult,
  FileShareResult,
  MediaStreamResult
} from './RealtimeCommunicationSystem';
import { 
  CommunicationMonitoringSystem,
  CommunicationMetricsReport,
  MonitoringReport,
  UsageAnalytics,
  SecurityMetrics,
  QualityMetrics
} from './CommunicationMonitoringSystem';

// ============================================================================
// MAIN INTEGRATION CLASS
// ============================================================================

/**
 * Agent Communication Integration System
 * Provides unified interface for all communication features
 */
export class AgentCommunicationIntegration {
  private agentFramework: AgentSuperpowersFramework;
  private collaborationSystem: AgentCollaborationSystem;
  private marketplaceEngine: AgentMarketplaceEngine;
  private communicationSystem: AgentCommunicationSystem;
  private realtimeSystem: RealtimeCommunicationSystem;
  private monitoringSystem: CommunicationMonitoringSystem;
  
  constructor(
    agentId: string,
    config: CommunicationIntegrationConfig = {}
  ) {
    // Initialize all subsystems
    this.agentFramework = new AgentSuperpowersFramework(agentId);
    this.collaborationSystem = new AgentCollaborationSystem(this.agentFramework);
    this.marketplaceEngine = new AgentMarketplaceEngine(this.agentFramework, this.collaborationSystem);
    this.communicationSystem = new AgentCommunicationSystem(
      this.agentFramework,
      this.collaborationSystem,
      this.marketplaceEngine,
      config.communication
    );
    this.realtimeSystem = new RealtimeCommunicationSystem(config.realtime);
    this.monitoringSystem = new CommunicationMonitoringSystem(config.monitoring);
    
    // Set up cross-system event handlers
    this.setupCrossSystemEvents();
  }

  // ============================================================================
  // UNIFIED COMMUNICATION INTERFACE
  // ============================================================================

  /**
   * Send message with skill sharing
   */
  async sendMessageWithSkills(
    senderId: string,
    recipientId: string | string[],
    type: string,
    content: any,
    options: MessageOptions = {}
  ): Promise<EnhancedMessageResult> {
    try {
      // Get sender's available superpowers
      const senderSuperpowers = this.agentFramework.getAgentSuperpowers(senderId);
      
      // Check if sender has communication-related superpowers
      const hasCommunicationSkills = this.hasCommunicationSkills(senderSuperpowers);
      
      // Enhance message with skill information
      const enhancedContent = hasCommunicationSkills ? {
        ...content,
        senderSkills: senderSuperpowers.map(skill => ({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          level: skill.level,
          capabilities: skill.capabilities
        })),
        collaborationContext: await this.getCollaborationContext(senderId, recipientId)
      } : content;

      // Send message through communication system
      const result = await this.communicationSystem.sendMessage(
        senderId,
        recipientId,
        type as any,
        enhancedContent,
        {
          ...options,
          includeSkills: hasCommunicationSkills,
          priorityBoost: hasCommunicationSkills ? 'high' : 'normal'
        }
      );

      // Update reputation based on successful communication
      if (result.success && hasCommunicationSkills) {
        await this.updateCommunicationReputation(senderId, 'message_sent', true);
      }

      return {
        ...result,
        senderSkills: senderSuperpowers,
        collaborationContext: result.success ? enhancedContent.collaborationContext : null,
        skillSharing: hasCommunicationSkills
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        messageId: 'unknown',
        timestamp: new Date()
      };
    }
  }

  /**
   * Create collaborative session with marketplace integration
   */
  async createCollaborativeSession(
    initiatorId: string,
    participants: string[],
    sessionType: string,
    marketplaceAgents?: string[],
    sessionConfig: any = {}
  ): Promise<EnhancedSessionResult> {
    try {
      // Get participants from marketplace if specified
      let enhancedParticipants = participants;
      if (marketplaceAgents && marketplaceAgents.length > 0) {
        const marketplaceData = await Promise.all(
          marketplaceAgents.map(agentId => 
            this.marketplaceEngine.getAgent(agentId)
          )
        );
        
        enhancedParticipants = participants.map(participantId => {
          const marketplaceAgent = marketplaceData.find(agent => agent.id === participantId);
          return {
            id: participantId,
            marketplaceData: marketplaceAgent || null,
            reputation: marketplaceAgent ? marketplaceAgent.reputation : null,
            capabilities: marketplaceAgent ? marketplaceAgent.capabilities : []
          };
        });
      }

      // Create collaboration session
      const result = await this.collaborationSystem.createSession(
        'Collaborative Session',
        `Session for ${participants.length} agents`,
        'hybrid',
        [initiatorId, ...participants],
        sessionConfig
      );

      // Enhance with marketplace information
      const enhancedResult: EnhancedSessionResult = {
        ...result,
        participants: enhancedParticipants,
        marketplaceIntegration: marketplaceAgents ? true : false,
        sessionAnalytics: {
          totalValue: this.calculateSessionValue(enhancedParticipants),
          skillDistribution: this.analyzeSkillDistribution(enhancedParticipants),
          collaborationPotential: this.assessCollaborationPotential(enhancedParticipants)
        }
      };

      // Update marketplace agent statistics
      if (result.success && marketplaceAgents) {
        await this.updateMarketplaceStats(marketplaceAgents, 'session_created');
      }

      return enhancedResult;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: 'unknown',
        timestamp: new Date()
      };
    }
  }

  /**
   * Find optimal communication partners
   */
  async findOptimalPartners(
    taskId: string,
    requiredSkills: string[],
    maxPartners: number = 5
  ): Promise<PartnerRecommendation[]> {
    try {
      // Get all available agents from marketplace
      const allAgents = await this.marketplaceEngine.searchAgents({
        category: 'business', // Filter by business category
        availability: 'online',
        limit: 50,
        sortBy: 'relevance'
      });

      // Score agents based on skill match and performance
      const scoredAgents = allAgents.map(agent => {
        const skillMatch = this.calculateSkillMatch(agent.capabilities, requiredSkills);
        const performanceScore = agent.performance ? agent.performance.successRate : 50;
        const reputationScore = agent.reputation ? agent.reputation.overall : 50;
        
        const overallScore = (skillMatch * 0.4) + (performanceScore * 0.3) + (reputationScore * 0.3);
        
        return {
          agent,
          score: overallScore,
          skillMatch,
          performanceScore,
          reputationScore,
          recommendation: this.generateRecommendation(agent, skillMatch, performanceScore, reputationScore)
        };
      });

      // Sort by score and return top recommendations
      return scoredAgents
        .sort((a, b) => b.score - a.score)
        .slice(0, maxPartners)
        .map(rec => rec.recommendation);

    } catch (error) {
      console.error('❌ Error finding optimal partners:', error);
      return [];
    }
  }

  /**
   * Get comprehensive communication analytics
   */
  async getCommunicationAnalytics(
    agentId: string,
    timeRange?: { start: Date; end: Date },
    filters?: AnalyticsFilters
  ): Promise<ComprehensiveAnalytics> {
    try {
      // Get data from all systems
      const communicationMetrics = this.communicationSystem.getMetrics();
      const collaborationStats = this.collaborationSystem.getSystemStats();
      const marketplaceStats = this.marketplaceEngine.getAnalytics();
      const monitoringReport = this.monitoringSystem.getMonitoringReport(timeRange, filters);
      const agentSuperpowers = this.agentFramework.getAgentSuperpowers(agentId);

      // Combine and analyze data
      const analytics: ComprehensiveAnalytics = {
        agentId,
        timeRange: timeRange || { start: new Date(Date.now() - 30 * 24 * 60 * 1000), end: new Date() },
        communication: {
          overview: communicationMetrics.overview,
          performance: communicationMetrics.performance,
          security: communicationMetrics.security,
          quality: communicationMetrics.quality,
          trends: this.analyzeCommunicationTrends(communicationMetrics)
        },
        collaboration: {
          overview: {
            totalSessions: collaborationStats.activeSessions,
            totalTasks: collaborationStats.totalTasks || 0,
            activeAgents: collaborationStats.activeAgents || 0,
            efficiency: collaborationStats.averageEfficiency || 85
          },
          skillSharing: this.analyzeSkillSharing(collaborationStats),
          reputation: this.analyzeReputationTrends(collaborationStats)
        },
        marketplace: {
          overview: marketplaceStats.overview,
          performance: marketplaceStats.performance,
          economic: marketplaceStats.economic,
          trends: this.analyzeMarketplaceTrends(marketplaceStats)
        },
        superpowers: {
          active: agentSuperpowers.acquiredSkills.length,
          mastery: agentSuperpowers.mastery,
          usage: this.analyzeSuperpowerUsage(agentSuperpowers),
          evolution: this.analyzeEvolutionProgress(agentSuperpowers)
        },
        monitoring: monitoringReport,
        recommendations: this.generateAnalyticsRecommendations(communicationMetrics, collaborationStats, marketplaceStats, agentSuperpowers),
        timestamp: new Date()
      };

      return analytics;

    } catch (error) {
      console.error('❌ Error getting communication analytics:', error);
      return {
        agentId,
        timeRange: timeRange || { start: new Date(), end: new Date() },
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  // ============================================================================
  // REAL-TIME COMMUNICATION WITH MARKETPLACE
  // ============================================================================

  /**
   * Create real-time session with marketplace agents
   */
  async createMarketplaceSession(
    initiatorId: string,
    marketplaceAgentIds: string[],
    sessionType: string,
    sessionConfig: any = {}
  ): Promise<MarketplaceSessionResult> {
    try {
      // Get marketplace agents
      const marketplaceAgents = await Promise.all(
        marketplaceAgentIds.map(id => this.marketplaceEngine.getAgent(id))
      );

      // Validate agents have required capabilities
      const validatedAgents = marketplaceAgents.filter(agent => 
        this.validateAgentForSession(agent, sessionType)
      );

      if (validatedAgents.length === 0) {
        return {
          success: false,
          error: 'No valid marketplace agents available for session',
          sessionId: 'unknown',
          timestamp: new Date()
        };
      }

      // Create enhanced participant list with marketplace data
      const enhancedParticipants = [
        initiatorId,
        ...validatedAgents.map(agent => agent.id)
      ];

      // Create real-time session
      const result = await this.realtimeSystem.createSession(
        initiatorId,
        enhancedParticipants,
        sessionType as any,
        {
          ...sessionConfig,
          marketplaceIntegration: true,
          agentCapabilities: validatedAgents.reduce((acc, agent) => {
            acc[agent.id] = agent.capabilities;
            return acc;
          }, {} as Record<string, any>)
        }
      );

      // Set up marketplace-specific features
      if (result.success) {
        await this.setupMarketplaceSessionFeatures(result.sessionId, validatedAgents);
      }

      return {
        ...result,
        marketplaceAgents: validatedAgents,
        sessionFeatures: {
          skillSharing: true,
          reputationTracking: true,
          performanceMonitoring: true,
          marketplaceIntegration: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: 'unknown',
        timestamp: new Date()
      };
    }
  }

  // ============================================================================
  // REPUTATION AND ANALYTICS
  // ============================================================================

  /**
   * Update communication reputation
   */
  private async updateCommunicationReputation(
    agentId: string,
    action: string,
    success: boolean
  ): Promise<void> {
    try {
      // Get current reputation
      const currentReputation = this.collaborationSystem.getReputation(agentId);
      
      // Calculate reputation change
      const change = success ? 2 : -1; // +2 for success, -1 for failure
      
      // Update specific reputation categories
      const updatedReputation: AgentReputation = {
        ...currentReputation,
        overall: Math.max(0, Math.min(100, currentReputation.overall + change)),
        collaboration: Math.max(0, Math.min(100, currentReputation.collaboration + change)),
        reliability: Math.max(0, Math.min(100, currentReputation.reliability + (action === 'message_sent' ? 1 : 0))),
        knowledge: Math.max(0, Math.min(100, currentReputation.knowledge + (action.includes('knowledge') ? 1 : 0))),
        leadership: Math.max(0, Math.min(100, currentReputation.leadership + (action.includes('leadership') ? 1 : 0))),
        innovation: Math.max(0, Math.min(100, currentReputation.innovation + (action.includes('innovation') ? 1 : 0))),
        lastUpdated: new Date()
      };

      // Update reputation in collaboration system
      await this.collaborationSystem.updateReputation(agentId, updatedReputation);

    } catch (error) {
      console.error('❌ Error updating communication reputation:', error);
    }
  }

  /**
   * Update marketplace statistics
   */
  private async updateMarketplaceStats(
    agentIds: string[],
    action: string
  ): Promise<void> {
    try {
      // Update marketplace agent statistics
      for (const agentId of agentIds) {
        const agent = await this.marketplaceEngine.getAgent(agentId);
        if (agent) {
          // Update based on action type
          switch (action) {
            case 'session_created':
              agent.marketplaceStats.collaborations++;
              break;
            case 'message_sent':
              agent.marketplaceStats.messages++;
              break;
            case 'skill_shared':
              agent.marketplaceStats.skillShares++;
              break;
            default:
              // Generic activity increment
              agent.marketplaceStats.activities++;
              break;
          }
          
          await this.marketplaceEngine.updateAgent(agent.id, agent);
        }
      }

    } catch (error) {
      console.error('❌ Error updating marketplace stats:', error);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if agent has communication-related superpowers
   */
  private hasCommunicationSkills(superpowers: string[]): boolean {
    const communicationSkills = [
      'viral_amplifier',
      'influence_network',
      'sentiment_oracle',
      'quantum_shield',
      'privacy_guardian'
    ];
    
    return superpowers.some(skill => communicationSkills.includes(skill));
  }

  /**
   * Get collaboration context
   */
  private async getCollaborationContext(
    senderId: string,
    recipientId: string | string[]
  ): Promise<any> {
    // Get active collaboration sessions
    const activeSessions = this.collaborationSystem.getActiveSessions();
    
    // Find shared sessions between sender and recipients
    const sharedSessions = activeSessions.filter(session => 
      session.participants.includes(senderId) && 
      (Array.isArray(recipientId) ? 
        recipientId.some(id => session.participants.includes(id)) : 
        session.participants.includes(recipientId))
    );

    return {
      sharedSessions: sharedSessions.map(s => s.id),
      collaborationHistory: await this.getCollaborationHistory(senderId, recipientId),
      sharedKnowledge: await this.getSharedKnowledge(senderId, recipientId),
      activeTasks: await this.getActiveTasks(senderId, recipientId)
    };
  }

  /**
   * Calculate skill match score
   */
  private calculateSkillMatch(
    agentCapabilities: any[],
    requiredSkills: string[]
  ): number {
    if (!requiredSkills || requiredSkills.length === 0) return 0;
    
    const agentSkills = agentCapabilities.map(cap => cap.id || cap.name);
    const matchCount = requiredSkills.filter(skill => 
      agentSkills.includes(skill)
    ).length;
    
    return (matchCount / requiredSkills.length) * 100;
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    agent: MarketplaceAgent,
    skillMatch: number,
    performanceScore: number,
    reputationScore: number
  ): string {
    if (skillMatch > 80 && performanceScore > 80 && reputationScore > 80) {
      return `Excellent match: ${agent.name} has strong skills and high performance`;
    } else if (skillMatch > 60) {
      return `Good match: ${agent.name} has relevant skills`;
    } else if (performanceScore > 70) {
      return `Consider ${agent.name}: high performer with moderate skill match`;
    } else {
      return `${agent.name}: available for collaboration`;
    }
  }

  /**
   * Calculate session value
   */
  private calculateSessionValue(participants: any[]): number {
    return participants.reduce((total, participant) => {
      const marketplaceData = participant.marketplaceData;
      if (marketplaceData) {
        return total + (marketplaceData.reputation.overall * 10) + (marketplaceData.performance.successRate * 5);
      }
      return total + 50; // Base value for non-marketplace agents
    }, 0);
  }

  /**
   * Analyze skill distribution
   */
  private analyzeSkillDistribution(participants: any[]): any {
    const skillCounts: Record<string, number> = {};
    
    participants.forEach(participant => {
      if (participant.marketplaceData && participant.marketplaceData.capabilities) {
        participant.marketplaceData.capabilities.forEach((cap: any) => {
          const skillId = cap.id || cap.name;
          skillCounts[skillId] = (skillCounts[skillId] || 0) + 1;
        });
      }
    });
    
    return skillCounts;
  }

  /**
   * Assess collaboration potential
   */
  private assessCollaborationPotential(participants: any[]): number {
    const totalValue = this.calculateSessionValue(participants);
    const averageValue = totalValue / participants.length;
    
    // Calculate potential based on skill diversity and reputation
    const skillTypes = new Set(Object.keys(this.analyzeSkillDistribution(participants)));
    const skillDiversity = skillTypes.size / Math.max(participants.length, 1);
    
    return Math.min(100, (averageValue * 0.3) + (skillDiversity * 50));
  }

  /**
   * Analyze communication trends
   */
  private analyzeCommunicationTrends(metrics: any): any {
    // In production, implement actual trend analysis
    return {
      messageVolume: 'stable',
      responseTime: 'improving',
      errorRate: 'decreasing',
      quality: 'stable'
    };
  }

  /**
   * Analyze skill sharing
   */
  private analyzeSkillSharing(stats: any): any {
    // In production, implement actual skill sharing analysis
    return {
      frequency: 'high',
      effectiveness: 85,
      popularSkills: ['communication', 'collaboration', 'analysis'],
      knowledgeGrowth: 'steady'
    };
  }

  /**
   * Analyze reputation trends
   */
  private analyzeReputationTrends(stats: any): any {
    // In production, implement actual reputation trend analysis
    return {
      averageReputation: 75,
      trend: 'improving',
      topPerformers: ['agent1', 'agent2'],
      reputationDistribution: {
        excellent: 10,
        good: 25,
        average: 40,
        poor: 15,
        needsImprovement: 10
      }
    };
  }

  /**
   * Analyze marketplace trends
   */
  private analyzeMarketplaceTrends(stats: any): any {
    // In production, implement actual marketplace trend analysis
    return {
      agentGrowth: 'steady',
      transactionVolume: 'increasing',
      popularCategories: ['business', 'technical', 'creative'],
      averageReputation: 78,
      economicActivity: 'high'
    };
  }

  /**
   * Analyze superpower usage
   */
  private analyzeSuperpowerUsage(superpowers: any): any {
    const usage = Object.values(superpowers.mastery).map((mastery, skillId) => ({
      skillId,
      usage: mastery > 50 ? 'high' : mastery > 20 ? 'medium' : 'low',
      effectiveness: mastery
    }));
    
    return {
      totalSkills: Object.keys(superpowers.mastery).length,
      usage,
      recommendations: usage.filter(u => u.effectiveness < 50).map(u => 
        `Improve mastery of ${u.skillId} through practice`
      )
    };
  }

  /**
   * Analyze evolution progress
   */
  private analyzeEvolutionProgress(superpowers: any): any {
    const totalLevel = superpowers.totalLevel;
    const acquiredSkills = superpowers.acquiredSkills.length;
    const availableSkills = superpowers.availableSkills.length;
    
    return {
      currentLevel: totalLevel,
      progress: (acquiredSkills / availableSkills) * 100,
      nextMilestone: totalLevel < 10 ? 'Level 10' : 'Master Level',
      recommendations: totalLevel < 5 ? 
        'Focus on acquiring foundational skills' : 
        'Develop specialized skills for advanced capabilities'
    };
  }

  /**
   * Generate analytics recommendations
   */
  private generateAnalyticsRecommendations(
    communicationMetrics: any,
    collaborationStats: any,
    marketplaceStats: any,
    agentSuperpowers: any
  ): string[] {
    const recommendations: string[] = [];
    
    // Communication recommendations
    if (communicationMetrics.quality && communicationMetrics.quality.overall.value < 80) {
      recommendations.push('Improve network configuration and reduce latency');
    }
    
    // Collaboration recommendations
    if (collaborationStats.efficiency && collaborationStats.efficiency < 70) {
      recommendations.push('Implement skill-based task assignment and improve coordination');
    }
    
    // Marketplace recommendations
    if (marketplaceStats.economic && marketplaceStats.economic.activity === 'low') {
      recommendations.push('Enhance agent capabilities and improve marketplace visibility');
    }
    
    // Superpower recommendations
    if (agentSuperpowers && agentSuperpowers.mastery) {
      const underutilizedSkills = Object.entries(agentSuperpowers.mastery)
        .filter(([_, mastery]) => mastery < 30)
        .map(([skillId, _]) => skillId);
      
      if (underutilizedSkills.length > 0) {
        recommendations.push(`Focus on developing: ${underutilizedSkills.join(', ')}`);
      }
    }
    
    return recommendations;
  }

  /**
   * Validate agent for session
   */
  private validateAgentForSession(
    agent: MarketplaceAgent,
    sessionType: string
  ): boolean {
    // Check if agent has required capabilities for session type
    switch (sessionType) {
      case 'voice-call':
        return agent.capabilities.some((cap: any) => 
          cap.id === 'audio' || cap.name === 'voice'
        );
      case 'video-call':
        return agent.capabilities.some((cap: any) => 
          cap.id === 'video' || cap.name === 'camera'
        );
      case 'conference':
        return agent.capabilities.some((cap: any) => 
          cap.id === 'audio' || cap.id === 'video' || cap.name === 'screen'
        );
      default:
        return true; // Basic communication capability
    }
  }

  /**
   * Setup marketplace session features
   */
  private async setupMarketplaceSessionFeatures(
    sessionId: string,
    agents: MarketplaceAgent[]
  ): Promise<void> {
    // Enable skill sharing between marketplace agents
    for (const agent of agents) {
      // In production, implement actual skill sharing setup
      console.log(`🔗 Setting up skill sharing for agent ${agent.id} in session ${sessionId}`);
    }
  }

  /**
   * Get collaboration history
   */
  private async getCollaborationHistory(
    senderId: string,
    recipientId: string | string[]
  ): Promise<any[]> {
    // In production, query actual collaboration history
    return [];
  }

  /**
   * Get shared knowledge
   */
  private async getSharedKnowledge(
    senderId: string,
    recipientId: string | string[]
  ): Promise<any[]> {
    // In production, query actual shared knowledge
    return [];
  }

  /**
   * Get active tasks
   */
  private async getActiveTasks(
    senderId: string,
    recipientId: string | string[]
  ): Promise<any[]> {
    // In production, query actual active tasks
    return [];
  }

  /**
   * Set up cross-system events
   */
  private setupCrossSystemEvents(): void {
    // Set up event handlers for cross-system communication
    // In production, implement actual event handling
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

/**
 * Communication integration configuration
 */
export interface CommunicationIntegrationConfig {
  communication?: any;
  realtime?: any;
  monitoring?: any;
}

/**
 * Enhanced message result
 */
export interface EnhancedMessageResult extends MessageResult {
  senderSkills?: string[];
  collaborationContext?: any;
  skillSharing?: boolean;
}

/**
 * Enhanced session result
 */
export interface EnhancedSessionResult extends SessionResult {
  participants?: any[];
  marketplaceIntegration?: boolean;
  sessionAnalytics?: any;
}

/**
 * Partner recommendation
 */
export interface PartnerRecommendation {
  agent: MarketplaceAgent;
  score: number;
  skillMatch: number;
  performanceScore: number;
  reputationScore: number;
  recommendation: string;
}

/**
 * Comprehensive analytics
 */
export interface ComprehensiveAnalytics {
  agentId: string;
  timeRange: { start: Date; end: Date };
  communication: {
    overview: any;
    performance: any;
    security: any;
    quality: any;
    trends: any;
  };
  collaboration: {
    overview: any;
    skillSharing: any;
    reputation: any;
  };
  marketplace: {
    overview: any;
    performance: any;
    economic: any;
    trends: any;
  };
  superpowers: {
    active: number;
    mastery: any;
    usage: any;
    evolution: any;
  };
  monitoring: MonitoringReport;
  recommendations: string[];
  timestamp: Date;
  error?: string;
}

/**
 * Analytics filters
 */
export interface AnalyticsFilters {
  agentIds?: string[];
  sessionTypes?: string[];
  messageTypes?: string[];
  dateRange?: { start: Date; end: Date };
  severity?: string[];
}

/**
 * Marketplace session result
 */
export interface MarketplaceSessionResult {
  success: boolean;
  sessionId?: string;
  participants?: string[];
  marketplaceAgents?: MarketplaceAgent[];
  sessionFeatures?: {
    skillSharing: boolean;
    reputationTracking: boolean;
    performanceMonitoring: boolean;
    marketplaceIntegration: boolean;
  };
  error?: string;
  timestamp?: Date;
}

/**
 * Message options
 */
export interface MessageOptions {
  format?: string;
  compression?: any;
  routingStrategy?: string;
  messageTTL?: number;
  encrypted?: boolean;
  includeSkills?: boolean;
  priorityBoost?: string;
}

export default AgentCommunicationIntegration;