/**
 * 🔍 RESEARCH SYSTEM TYPES
 * 
 * Type definitions for Opal-Powered Research & Analytics System
 * Supports multi-modal research, MENA-specific features, and workflow automation
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { AgentType } from '../lib/ai-engine';
import { OpalWorkflowTemplate, OpalExecutionResponse } from './opal-agents';

// ============================================================================
// CORE RESEARCH TYPES
// ============================================================================

/**
 * Research domain categories
 */
export enum ResearchDomain {
  BUSINESS_INTELLIGENCE = 'business_intelligence',
  TRAVEL_INTELLIGENCE = 'travel_intelligence',
  CULINARY_RESEARCH = 'culinary_research',
  LEGAL_RESEARCH = 'legal_research',
  MARKET_ANALYSIS = 'market_analysis',
  FINANCIAL_RESEARCH = 'financial_research',
  CULTURAL_RESEARCH = 'cultural_research',
  COMPETITIVE_INTELLIGENCE = 'competitive_intelligence'
}

/**
 * Research data sources
 */
export enum ResearchDataSource {
  GOOGLE_SEARCH = 'google_search',
  DOCUMENT_ANALYSIS = 'document_analysis',
  IMAGE_ANALYSIS = 'image_analysis',
  WEB_SCRAPING = 'web_scraping',
  DATABASE_QUERY = 'database_query',
  API_INTEGRATION = 'api_integration',
  SOCIAL_MEDIA = 'social_media',
  ACADEMIC_PAPERS = 'academic_papers'
}

/**
 * Research quality metrics
 */
export interface ResearchQualityMetrics {
  accuracy: number;           // 0-100
  completeness: number;        // 0-100
  relevance: number;          // 0-100
  freshness: number;          // 0-100 (based on data recency)
  source_credibility: number;  // 0-100
  cultural_context: number;    // 0-100 (MENA-specific relevance)
  overall_score: number;       // Weighted average
}

/**
 * Research session configuration
 */
export interface ResearchSessionConfig {
  id: string;
  title: string;
  description: string;
  domain: ResearchDomain;
  agentType: AgentType;
  language: 'en' | 'ar' | 'fr';
  region: 'GCC' | 'Levant' | 'North Africa' | 'MENA';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: {
    maxCost: number;
    currency: string;
  };
  timeline?: {
    startDate: Date;
    endDate: Date;
    milestones: string[];
  };
  qualityThreshold: number;   // Minimum quality score (0-100)
  culturalAdaptation: boolean;
  islamicCompliance: boolean;
}

/**
 * Multi-modal research request
 */
export interface ResearchRequest {
  sessionId: string;
  query: string;
  dataSources: ResearchDataSource[];
  analysisTypes: string[];
  parameters: {
    maxResults?: number;
    dateRange?: {
      start: Date;
      end: Date;
    };
    geographicScope?: string[];
    languages?: string[];
    includeArabicContent?: boolean;
    culturalContext?: boolean;
  };
  workflowTemplateId?: string;
  customWorkflow?: OpalWorkflowTemplate;
}

/**
 * Research result data structure
 */
export interface ResearchResult {
  id: string;
  sessionId: string;
  query: string;
  dataSource: ResearchDataSource;
  timestamp: Date;
  content: {
    summary: string;
    detailedFindings: any;
    keyInsights: string[];
    dataPoints: Array<{
      label: string;
      value: any;
      confidence: number;
      source: string;
    }>;
    visualizations?: Array<{
      type: 'chart' | 'graph' | 'map' | 'image';
      title: string;
      data: any;
      description: string;
    }>;
  };
  metadata: {
    sources: Array<{
      url: string;
      title: string;
      credibility: number;
      lastUpdated: Date;
      language: string;
    }>;
    methodology: string;
    limitations: string[];
    confidence: number;
    processingTime: number;
  };
  quality: ResearchQualityMetrics;
  culturalContext?: {
    regionalRelevance: string;
    localCustoms: string[];
    businessEtiquette: string[];
    religiousConsiderations: string[];
  };
}

// ============================================================================
// RESEARCH WORKFLOW TYPES
// ============================================================================

/**
 * Research workflow step definition
 */
export interface ResearchWorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'data_collection' | 'analysis' | 'synthesis' | 'validation' | 'reporting';
  agentType: AgentType;
  dataSources: ResearchDataSource[];
  parameters: Record<string, any>;
  dependencies: string[];
  estimatedDuration: number; // in minutes
  qualityChecks: Array<{
    type: string;
    threshold: number;
    action: 'warn' | 'retry' | 'fail';
  }>;
  outputs: string[];
}

/**
 * Research workflow template
 */
export interface ResearchWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  domain: ResearchDomain;
  agentType: AgentType;
  category: string;
  steps: ResearchWorkflowStep[];
  metadata: {
    version: string;
    author: string;
    tags: string[];
    estimatedCost: number;
    estimatedDuration: number;
    complexity: 'simple' | 'moderate' | 'complex';
    prerequisites: string[];
    deliverables: string[];
  };
  menaSpecific: {
    culturalAdaptation: boolean;
    languageSupport: string[];
    regionalFocus: string[];
    islamicCompliance: boolean;
  };
}

// ============================================================================
// ANALYTICS AND MONITORING TYPES
// ============================================================================

/**
 * Research performance metrics
 */
export interface ResearchPerformanceMetrics {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  cost: {
    total: number;
    currency: string;
    breakdown: {
      dataCollection: number;
      analysis: number;
      synthesis: number;
      validation: number;
      reporting: number;
    };
  };
  efficiency: {
    dataPointsCollected: number;
    insightsGenerated: number;
    qualityScore: number;
    userSatisfaction?: number;
  };
  resourceUsage: {
    apiCalls: number;
    processingTime: number;
    memoryUsage: number;
    storageUsed: number;
  };
}

/**
 * Research analytics data
 */
export interface ResearchAnalytics {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  averageSessionDuration: number;
  totalCost: number;
  costPerSession: number;
  averageQualityScore: number;
  domainDistribution: Record<ResearchDomain, number>;
  agentUtilization: Record<AgentType, number>;
  dataSourceUsage: Record<ResearchDataSource, number>;
  regionalFocus: Record<string, number>;
  languageDistribution: Record<string, number>;
  trends: {
    sessionGrowth: number[];
    qualityImprovement: number[];
    costOptimization: number[];
    userEngagement: number[];
  };
}

// ============================================================================
// MENA-SPECIFIC TYPES
// ============================================================================

/**
 * MENA market intelligence
 */
export interface MENAMarketIntelligence {
  region: string;
  country: string;
  market: {
    size: number;
    growth: number;
    currency: string;
    regulations: string[];
    opportunities: string[];
    challenges: string[];
  };
  cultural: {
    businessEtiquette: string[];
    communicationStyle: string;
    decisionMaking: string;
    relationshipBuilding: string[];
  };
  economic: {
    gdp: number;
    inflation: number;
    unemployment: number;
    tradeBalance: number;
    keySectors: string[];
  };
  islamicFinance?: {
    shariaCompliance: boolean;
    availableProducts: string[];
    regulatoryFramework: string;
    marketSize: number;
  };
}

/**
 * Arabic language processing
 */
export interface ArabicProcessingConfig {
  enableRTL: boolean;
  dialect: 'modern_standard' | 'egyptian' | 'levantine' | 'gulf' | 'maghrebi';
  transliteration: boolean;
  sentimentAnalysis: boolean;
  entityExtraction: boolean;
  topicModeling: boolean;
  culturalContext: boolean;
}

// ============================================================================
// REPORTING AND EXPORT TYPES
// ============================================================================

/**
 * Research report format
 */
export interface ResearchReport {
  id: string;
  sessionId: string;
  title: string;
  executiveSummary: string;
  methodology: string;
  findings: Array<{
    category: string;
    insights: string[];
    data: any;
    visualizations: any[];
    recommendations: string[];
  }>;
  conclusions: string;
  appendices: Array<{
    type: 'data' | 'methodology' | 'sources' | 'glossary';
    content: any;
  }>;
  metadata: {
    generatedAt: Date;
    version: string;
    language: string;
    format: 'pdf' | 'html' | 'json' | 'excel';
    pageCount?: number;
    wordCount?: number;
  };
}

/**
 * Export configuration
 */
export interface ResearchExportConfig {
  format: 'pdf' | 'html' | 'json' | 'excel' | 'csv' | 'powerpoint';
  language: 'en' | 'ar' | 'both';
  includeSections: string[];
  branding: {
    logo?: string;
    colors?: string[];
    fonts?: string[];
  };
  customization: {
    watermark?: string;
    confidentiality: 'public' | 'confidential' | 'restricted';
    pagination: boolean;
    tableOfContents: boolean;
    executiveSummary: boolean;
  };
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

/**
 * Opal research execution request
 */
export interface OpalResearchExecutionRequest {
  workflowTemplateId: string;
  researchRequest: ResearchRequest;
  agentId: string;
  agentType: AgentType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeout?: number;
  callbacks?: {
    onProgress?: (progress: number) => void;
    onComplete?: (result: ResearchResult[]) => void;
    onError?: (error: Error) => void;
  };
}

/**
 * Opal research execution response
 */
export interface OpalResearchExecutionResponse extends OpalExecutionResponse {
  sessionId: string;
  results: ResearchResult[];
  analytics: ResearchPerformanceMetrics;
  quality: ResearchQualityMetrics;
  culturalInsights?: any;
}

// ============================================================================
// VALIDATION AND COMPLIANCE TYPES
// ============================================================================

/**
 * Research validation rules
 */
export interface ResearchValidationRule {
  id: string;
  name: string;
  description: string;
  type: 'data_quality' | 'source_credibility' | 'cultural_context' | 'islamic_compliance';
  condition: string; // Expression to evaluate
  threshold: number;
  action: 'warn' | 'retry' | 'fail';
  category: 'mandatory' | 'recommended';
}

/**
 * Compliance check result
 */
export interface ComplianceCheckResult {
  compliant: boolean;
  category: 'data_privacy' | 'cultural_sensitivity' | 'islamic_compliance' | 'regulatory';
  violations: Array<{
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  score: number; // 0-100
  lastChecked: Date;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Research system configuration
 */
export interface ResearchSystemConfig {
  opalIntegration: {
    enabled: boolean;
    endpoint: string;
    timeout: number;
    retryAttempts: number;
  };
  aiEngine: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  quality: {
    minimumScore: number;
    enableValidation: boolean;
    autoRetry: boolean;
  };
  mena: {
    enableCulturalContext: boolean;
    enableArabicSupport: boolean;
    enableIslamicCompliance: boolean;
    defaultRegion: string;
  };
  analytics: {
    enabled: boolean;
    retentionDays: number;
    realTimeUpdates: boolean;
  };
  security: {
    encryptionEnabled: boolean;
    auditTrail: boolean;
    accessControl: boolean;
  };
}

/**
 * Research system status
 */
export interface ResearchSystemStatus {
  healthy: boolean;
  components: {
    opalClient: boolean;
    aiEngine: boolean;
    database: boolean;
    analytics: boolean;
  };
  activeSessions: number;
  queuedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  lastHealthCheck: Date;
  issues: string[];
}

// Export all types
export * from './opal-agents';