/**
 * 🔍 SOURCE VALIDATION MANAGER
 * 
 * Comprehensive research source validation and credibility assessment with:
 * - Source credibility assessment and scoring
 * - Malicious source detection and blocking
 * - Content security scanning for research results
 * - Bias and manipulation detection in research sources
 * - Source verification and fact-checking mechanisms
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';

// ============================================================================
// SOURCE VALIDATION TYPES
// ============================================================================

/**
 * Source Validation Configuration
 */
export interface SourceValidationConfig {
  credibilityScoring: boolean;
  maliciousContentDetection: boolean;
  biasDetection: boolean;
  factChecking: boolean;
  sourceVerification: boolean;
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  trustedSources: string[];
  blockedDomains: string[];
}

/**
 * Research Source
 */
export interface ResearchSource {
  id: string;
  url: string;
  domain: string;
  title: string;
  author?: string;
  publishedAt?: Date;
  type: 'academic' | 'news' | 'blog' | 'forum' | 'social' | 'official' | 'preprint' | 'dataset';
  language: string;
  content?: string;
  metadata?: Record<string, any>;
}

/**
 * Source Credibility Assessment
 */
export interface CredibilityAssessment {
  sourceId: string;
  overallScore: number; // 0-100
  factors: {
    domainReputation: number; // 0-100
    authorCredibility: number; // 0-100
    contentQuality: number; // 0-100
    factuality: number; // 0-100
    biasLevel: number; // 0-100, lower is better
    freshness: number; // 0-100
    citationCount: number; // 0-100
    peerReview: number; // 0-100
  };
  classification: 'highly-credible' | 'credible' | 'moderately-credible' | 'low-credibility' | 'unreliable' | 'malicious';
  confidence: number; // 0-100
  lastAssessed: Date;
  recommendations: string[];
}

/**
 * Malicious Content Detection Result
 */
export interface MaliciousContentResult {
  detected: boolean;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  threatTypes: MaliciousThreatType[];
  confidence: number; // 0-100
  patterns: MaliciousPattern[];
  sanitizedContent?: string;
  blocked: boolean;
}

/**
 * Malicious Threat Types
 */
export type MaliciousThreatType =
  | 'phishing'
  | 'malware'
  | 'scam'
  | 'disinformation'
  | 'propaganda'
  | 'hate-speech'
  | 'fake-news'
  | 'clickbait'
  | 'manipulation'
  | 'data-poisoning'
  | 'prompt-injection'
  | 'social-engineering';

/**
 * Malicious Pattern
 */
export interface MaliciousPattern {
  type: MaliciousThreatType;
  pattern: RegExp;
  description: string;
  severity: number; // 1-10
  confidence: number; // 0-100
}

/**
 * Bias Detection Result
 */
export interface BiasDetectionResult {
  biased: boolean;
  biasTypes: BiasType[];
  biasScore: number; // 0-100, higher is more biased
  politicalLean: 'left' | 'center-left' | 'center' | 'center-right' | 'right' | 'neutral';
  emotionalTone: 'neutral' | 'positive' | 'negative' | 'sensationalist';
  factualityIssues: string[];
  recommendations: string[];
}

/**
 * Bias Types
 */
export type BiasType =
  | 'confirmation-bias'
  | 'selection-bias'
  | 'reporting-bias'
  | 'anchoring-bias'
  | 'political-bias'
  | 'cultural-bias'
  | 'gender-bias'
  | 'racial-bias'
  | 'age-bias'
  | 'economic-bias'
  | 'sensationalism'
  | 'false-equivalence'
  | 'appeal-to-emotion';

/**
 * Fact-Checking Result
 */
export interface FactCheckingResult {
  factChecked: boolean;
  accuracyScore: number; // 0-100
  claims: ClaimCheck[];
  overallVeracity: 'verified' | 'mostly-verified' | 'mixed' | 'mostly-false' | 'false' | 'unverifiable';
  sources: FactCheckSource[];
  lastChecked: Date;
  recommendations: string[];
}

/**
 * Claim Check
 */
export interface ClaimCheck {
  claim: string;
  veracity: 'verified' | 'mostly-verified' | 'mixed' | 'mostly-false' | 'false' | 'unverifiable';
  confidence: number; // 0-100
  evidence: string[];
  sources: string[];
  explanation: string;
}

/**
 * Fact Check Source
 */
export interface FactCheckSource {
  name: string;
  url: string;
  credibility: number; // 0-100
  type: 'fact-checker' | 'academic' | 'government' | 'news' | 'expert';
}

/**
 * Source Validation Result
 */
export interface SourceValidationResult {
  success: boolean;
  allowed: boolean;
  riskScore: number; // 0-100
  riskFactors: string[];
  blockedActions: string[];
  allowedActions: string[];
  modifiedActions: string[];
  loggedActions: string[];
  recommendations: string[];
  credibilityAssessment?: CredibilityAssessment;
  maliciousContentResult?: MaliciousContentResult;
  biasDetectionResult?: BiasDetectionResult;
  factCheckingResult?: FactCheckingResult;
  metadata: {
    processingTime: number; // milliseconds
    protocol: 'source-validation',
    version: '1.0.0',
    timestamp: Date;
  };
}

// ============================================================================
// MAIN SOURCE VALIDATION MANAGER
// ============================================================================

/**
 * Source Validation Manager
 * 
 * Provides comprehensive source validation and credibility assessment
 * Implements zero-trust principles with multi-factor analysis
 */
export class SourceValidationManager extends EventEmitter {
  private config: SourceValidationConfig;
  private credibilityCache: Map<string, CredibilityAssessment> = new Map();
  private maliciousPatterns: MaliciousPattern[] = [];
  private factCheckers: FactCheckSource[] = [];
  private domainReputations: Map<string, number> = new Map();

  constructor(config: SourceValidationConfig) {
    super();
    this.config = this.validateConfig(config);
    this.initializeMaliciousPatterns();
    this.initializeFactCheckers();
    this.initializeDomainReputations();
  }

  /**
   * Validate and normalize configuration
   */
  private validateConfig(config: SourceValidationConfig): SourceValidationConfig {
    const defaultConfig: SourceValidationConfig = {
      credibilityScoring: true,
      maliciousContentDetection: true,
      biasDetection: true,
      factChecking: true,
      sourceVerification: true,
      riskThresholds: {
        low: 30,
        medium: 50,
        high: 70,
        critical: 90
      },
      trustedSources: [],
      blockedDomains: []
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Initialize malicious content detection patterns
   */
  private initializeMaliciousPatterns(): void {
    console.log('🔍 Initializing malicious content patterns...');

    this.maliciousPatterns = [
      {
        type: 'phishing',
        pattern: /(?:click|visit|go to|access|login|sign in).{0,50}(?:\s+(?:your|our|the|this)?.{0,20}(?:account|profile|page|site|portal))/gi,
        description: 'Phishing attempts to get users to click malicious links',
        severity: 8,
        confidence: 85
      },
      {
        type: 'malware',
        pattern: /(?:download|install|run|execute|open).{0,30}(?:\s+(?:this|the|file|program|software|app))/gi,
        description: 'Attempts to trick users into downloading malware',
        severity: 9,
        confidence: 90
      },
      {
        type: 'disinformation',
        pattern: /(?:fake|false|misleading|incorrect|wrong).{0,20}(?:\s+(?:information|news|report|data|fact))/gi,
        description: 'False or misleading information',
        severity: 7,
        confidence: 75
      },
      {
        type: 'hate-speech',
        pattern: /\b(?:hate|kill|destroy|harm|violence|war).{0,30}(?:\s+(?:\w+|people|group|race|religion))/gi,
        description: 'Hate speech or violent content',
        severity: 8,
        confidence: 80
      },
      {
        type: 'clickbait',
        pattern: /(?:shocking|unbelievable|incredible|amazing|incredible|you won't believe).{0,50}(?:\s+(?:what|happens|next|when))/gi,
        description: 'Clickbait titles or content',
        severity: 4,
        confidence: 70
      },
      {
        type: 'prompt-injection',
        pattern: /(?:ignore|forget|disregard|override).{0,20}(?:\s+(?:previous|above|earlier|all).{0,20}(?:\s+(?:instructions|rules|guidelines|constraints))/gi,
        description: 'Prompt injection attempts',
        severity: 9,
        confidence: 85
      }
    ];

    console.log(`✅ Initialized ${this.maliciousPatterns.length} malicious content patterns`);
  }

  /**
   * Initialize fact checkers
   */
  private initializeFactCheckers(): void {
    console.log('🔍 Initializing fact checkers...');

    this.factCheckers = [
      {
        name: 'Snopes',
        url: 'https://www.snopes.com',
        credibility: 85,
        type: 'fact-checker'
      },
      {
        name: 'PolitiFact',
        url: 'https://www.politifact.com',
        credibility: 80,
        type: 'fact-checker'
      },
      {
        name: 'FactCheck.org',
        url: 'https://www.factcheck.org',
        credibility: 75,
        type: 'fact-checker'
      },
      {
        name: 'Reuters Fact Check',
        url: 'https://www.reuters.com',
        credibility: 90,
        type: 'news'
      },
      {
        name: 'AP News',
        url: 'https://www.apnews.com',
        credibility: 85,
        type: 'news'
      },
      {
        name: 'CDC',
        url: 'https://www.cdc.gov',
        credibility: 95,
        type: 'government'
      },
      {
        name: 'WHO',
        url: 'https://www.who.int',
        credibility: 95,
        type: 'government'
      }
    ];

    console.log(`✅ Initialized ${this.factCheckers.length} fact checkers`);
  }

  /**
   * Initialize domain reputations
   */
  private initializeDomainReputations(): void {
    console.log('🔍 Initializing domain reputations...');

    // Pre-populate with some known domains
    const knownReputations: Record<string, number> = {
      'nature.com': 90,
      'science.org': 95,
      'nejm.org': 90,
      'thelancet.com': 95,
      'cell.com': 85,
      'sciencemag.org': 80,
      'arxiv.org': 85,
      'pubmed.ncbi.nlm.nih.gov': 95,
      'bbc.com': 85,
      'reuters.com': 90,
      'apnews.com': 85,
      'npr.org': 80,
      'pbs.org': 80,
      'factcheck.org': 85,
      'snopes.com': 80,
      'politifact.com': 80
    };

    Object.entries(knownReputations).forEach(([domain, reputation]) => {
      this.domainReputations.set(domain, reputation);
    });

    console.log(`✅ Initialized ${this.domainReputations.size} domain reputations`);
  }

  /**
   * Validate research source
   */
  async validateSource(source: ResearchSource): Promise<SourceValidationResult> {
    const startTime = Date.now();

    try {
      const result: SourceValidationResult = {
        success: true,
        allowed: true,
        riskScore: 0,
        riskFactors: [],
        blockedActions: [],
        allowedActions: ['source-validation'],
        modifiedActions: [],
        loggedActions: ['source-received'],
        recommendations: [],
        metadata: {
          processingTime: 0,
          protocol: 'source-validation',
          version: '1.0.0',
          timestamp: new Date()
        }
      };

      // 1. Check if domain is blocked
      const blockedResult = this.checkBlockedDomain(source);
      this.mergeValidationResults(result, blockedResult);

      // 2. Credibility assessment
      if (this.config.credibilityScoring) {
        const credibilityResult = await this.assessCredibility(source);
        result.credibilityAssessment = credibilityResult.credibilityAssessment;
        this.mergeValidationResults(result, credibilityResult);
      }

      // 3. Malicious content detection
      if (this.config.maliciousContentDetection && source.content) {
        const maliciousResult = await this.detectMaliciousContent(source.content, source);
        result.maliciousContentResult = maliciousResult.maliciousContentResult;
        this.mergeValidationResults(result, maliciousResult);
      }

      // 4. Bias detection
      if (this.config.biasDetection && source.content) {
        const biasResult = await this.detectBias(source.content, source);
        result.biasDetectionResult = biasResult.biasDetectionResult;
        this.mergeValidationResults(result, biasResult);
      }

      // 5. Fact checking
      if (this.config.factChecking && source.content) {
        const factCheckResult = await this.performFactChecking(source.content, source);
        result.factCheckingResult = factCheckResult.factCheckingResult;
        this.mergeValidationResults(result, factCheckResult);
      }

      // 6. Source verification
      if (this.config.sourceVerification) {
        const verificationResult = await this.verifySource(source);
        this.mergeValidationResults(result, verificationResult);
      }

      // 7. Calculate final risk score
      result.riskScore = this.calculateRiskScore(result);

      // 8. Determine if source should be blocked
      result.allowed = result.riskScore < this.config.riskThresholds.high &&
        result.blockedActions.length === 0;
      result.success = result.allowed;

      result.metadata.processingTime = Date.now() - startTime;

      // Log validation
      this.logSourceValidation(source, result);

      return result;

    } catch (error) {
      const errorResult: SourceValidationResult = {
        success: false,
        allowed: false,
        riskScore: 100,
        riskFactors: ['validation-error'],
        blockedActions: ['source-validation'],
        allowedActions: [],
        modifiedActions: [],
        loggedActions: ['validation-error'],
        recommendations: ['Investigate source validation system error'],
        metadata: {
          processingTime: Date.now() - startTime,
          protocol: 'source-validation',
          version: '1.0.0',
          timestamp: new Date()
        }
      };

      this.logSourceValidation(source, errorResult);
      return errorResult;
    }
  }

  /**
   * Check if domain is blocked
   */
  private checkBlockedDomain(source: ResearchSource): Partial<SourceValidationResult> {
    const result: Partial<SourceValidationResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['blocked-domain-check']
    };

    if (this.config.blockedDomains.includes(source.domain)) {
      result.riskFactors!.push('blocked-domain');
      result.blockedActions!.push('domain-blocked');
      result.loggedActions!.push('blocked-domain-detected');
    } else {
      result.allowedActions!.push('domain-allowed');
    }

    return result;
  }

  /**
   * Assess source credibility
   */
  private async assessCredibility(source: ResearchSource): Promise<Partial<SourceValidationResult>> {
    const result: Partial<SourceValidationResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['credibility-assessment']
    };

    // Check cache first
    const cacheKey = `${source.domain}:${source.author || 'unknown'}`;
    if (this.credibilityCache.has(cacheKey)) {
      const cached = this.credibilityCache.get(cacheKey)!;
      result.credibilityAssessment = cached;
      return result;
    }

    const assessment: CredibilityAssessment = {
      sourceId: source.id,
      overallScore: 0,
      factors: {
        domainReputation: this.getDomainReputation(source.domain),
        authorCredibility: this.assessAuthorCredibility(source),
        contentQuality: this.assessContentQuality(source),
        factuality: this.assessFactuality(source),
        biasLevel: this.assessBiasLevel(source),
        freshness: this.assessFreshness(source),
        citationCount: this.assessCitationCount(source),
        peerReview: this.assessPeerReview(source)
      },
      classification: 'moderately-credible',
      confidence: 70,
      lastAssessed: new Date(),
      recommendations: []
    };

    // Calculate overall score
    assessment.overallScore = this.calculateCredibilityScore(assessment.factors);
    assessment.classification = this.classifyCredibility(assessment.overallScore);
    assessment.recommendations = this.generateCredibilityRecommendations(assessment);

    // Cache the assessment
    this.credibilityCache.set(cacheKey, assessment);

    result.credibilityAssessment = assessment;

    if (assessment.overallScore < 40) {
      result.riskFactors!.push('low-credibility');
      result.blockedActions!.push('low-credibility-block');
      result.loggedActions!.push('low-credibility-detected');
    } else {
      result.allowedActions!.push('credibility-acceptable');
    }

    return result;
  }

  /**
   * Get domain reputation
   */
  private getDomainReputation(domain: string): number {
    // Check cache first
    if (this.domainReputations.has(domain)) {
      return this.domainReputations.get(domain)!;
    }

    // Simple heuristic based on domain characteristics
    let reputation = 50; // Base reputation

    // Academic domains get higher scores
    if (domain.includes('.edu') || domain.includes('.ac.') || domain.includes('.org')) {
      reputation += 20;
    }

    // Government domains get high scores
    if (domain.includes('.gov') || domain.includes('.mil')) {
      reputation += 30;
    }

    // Well-known news domains
    const reputableNewsDomains = ['reuters.com', 'apnews.com', 'bbc.com', 'npr.org', 'pbs.org'];
    if (reputableNewsDomains.includes(domain)) {
      reputation += 25;
    }

    // Penalize suspicious domains
    const suspiciousPatterns = [/bit\.ly$/, /tinyurl\.com$/, /shortened/i];
    if (suspiciousPatterns.some(pattern => pattern.test(domain))) {
      reputation -= 20;
    }

    // Cache and return
    this.domainReputations.set(domain, reputation);
    return Math.max(0, Math.min(100, reputation));
  }

  /**
   * Assess author credibility
   */
  private assessAuthorCredibility(source: ResearchSource): number {
    if (!source.author) {
      return 50; // Neutral score for unknown author
    }

    let score = 50;

    // Check for academic credentials
    if (source.author.includes('Dr.') || source.author.includes('PhD') || source.author.includes('Professor')) {
      score += 20;
    }

    // Check for institutional affiliation
    const institutions = ['University', 'Institute', 'Research', 'Laboratory', 'Hospital', 'CDC', 'WHO', 'NIH'];
    if (institutions.some(inst => source.author.includes(inst))) {
      score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess content quality
   */
  private assessContentQuality(source: ResearchSource): number {
    if (!source.content) {
      return 50;
    }

    let score = 50;

    // Length and depth
    if (source.content.length > 1000) {
      score += 10;
    }

    // Citations and references
    const citationPatterns = [/\[\d+\]/g, /\(.*?\d{4}.*?\)/g];
    const citationCount = citationPatterns.reduce((count, pattern) =>
      count + (source.content.match(pattern) || []).length, 0);

    if (citationCount > 5) {
      score += 15;
    }

    // Technical language
    const technicalTerms = ['study', 'research', 'analysis', 'methodology', 'results', 'conclusion', 'abstract'];
    const technicalTermCount = technicalTerms.reduce((count, term) =>
      count + (source.content.toLowerCase().split(term.toLowerCase()).length - 1), 0);

    if (technicalTermCount > 3) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess factuality
   */
  private assessFactuality(source: ResearchSource): number {
    if (!source.content) {
      return 50;
    }

    let score = 50;

    // Objective language indicators
    const objectiveIndicators = ['according to', 'research shows', 'data indicates', 'study found', 'analysis reveals'];
    const objectiveCount = objectiveIndicators.reduce((count, indicator) =>
      count + (source.content.toLowerCase().split(indicator).length - 1), 0);

    if (objectiveCount > 2) {
      score += 15;
    }

    // Avoidance of sensationalism
    const sensationalWords = ['shocking', 'incredible', 'unbelievable', 'amazing', 'miracle', 'breakthrough'];
    const sensationalCount = sensationalWords.reduce((count, word) =>
      count + (source.content.toLowerCase().split(word).length - 1), 0);

    if (sensationalCount === 0) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess bias level
   */
  private assessBiasLevel(source: ResearchSource): number {
    if (!source.content) {
      return 50;
    }

    let biasScore = 50;

    // Check for balanced perspective
    const perspectiveWords = ['however', 'alternatively', 'on the other hand', 'conversely', 'nevertheless'];
    const perspectiveCount = perspectiveWords.reduce((count, word) =>
      count + (source.content.toLowerCase().split(word).length - 1), 0);

    if (perspectiveCount > 2) {
      biasScore += 10;
    }

    // Check for emotional neutrality
    const emotionalWords = ['amazing', 'terrible', 'wonderful', 'awful', 'excellent', 'horrible'];
    const emotionalCount = emotionalWords.reduce((count, word) =>
      count + (source.content.toLowerCase().split(word).length - 1), 0);

    if (emotionalCount === 0) {
      biasScore += 10;
    }

    return Math.max(0, Math.min(100, biasScore));
  }

  /**
   * Assess freshness
   */
  private assessFreshness(source: ResearchSource): number {
    if (!source.publishedAt) {
      return 50;
    }

    const now = new Date();
    const ageInDays = (now.getTime() - source.publishedAt.getTime()) / (1000 * 60 * 60 * 24);

    let score = 50;

    if (ageInDays <= 7) {
      score += 20; // Very recent
    } else if (ageInDays <= 30) {
      score += 15; // Recent
    } else if (ageInDays <= 90) {
      score += 10; // Moderately recent
    } else if (ageInDays > 365) {
      score -= 20; // Very old
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess citation count
   */
  private assessCitationCount(source: ResearchSource): number {
    // This would typically integrate with academic databases
    // For now, use simple heuristics
    if (!source.content) {
      return 50;
    }

    const citationMatches = source.content.match(/\[\d+\]/g);
    const citationCount = citationMatches ? citationMatches.length : 0;

    let score = 50;

    if (citationCount > 20) {
      score += 30;
    } else if (citationCount > 10) {
      score += 20;
    } else if (citationCount > 5) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess peer review
   */
  private assessPeerReview(source: ResearchSource): number {
    // This would typically check against peer-reviewed databases
    // For now, use source type as proxy
    const peerReviewedTypes = ['academic', 'preprint'];

    if (peerReviewedTypes.includes(source.type)) {
      return 80;
    }

    return 50;
  }

  /**
   * Calculate credibility score
   */
  private calculateCredibilityScore(factors: CredibilityAssessment['factors']): number {
    const weights = {
      domainReputation: 0.2,
      authorCredibility: 0.15,
      contentQuality: 0.15,
      factuality: 0.2,
      biasLevel: 0.15, // Inverted (lower bias = higher score)
      freshness: 0.05,
      citationCount: 0.05,
      peerReview: 0.05
    };

    return Object.entries(weights).reduce((score, [factor, weight]) => {
      return score + (factors[factor as keyof typeof factors] * weight);
    }, 0) * 100;
  }

  /**
   * Classify credibility
   */
  private classifyCredibility(score: number): CredibilityAssessment['classification'] {
    if (score >= 80) return 'highly-credible';
    if (score >= 65) return 'credible';
    if (score >= 50) return 'moderately-credible';
    if (score >= 30) return 'low-credibility';
    if (score >= 15) return 'unreliable';
    return 'malicious';
  }

  /**
   * Generate credibility recommendations
   */
  private generateCredibilityRecommendations(assessment: CredibilityAssessment): string[] {
    const recommendations: string[] = [];

    if (assessment.factors.domainReputation < 60) {
      recommendations.push('Consider using sources from more reputable domains');
    }

    if (assessment.factors.authorCredibility < 50) {
      recommendations.push('Verify author credentials and expertise');
    }

    if (assessment.factors.contentQuality < 50) {
      recommendations.push('Look for sources with better content quality and depth');
    }

    if (assessment.factors.factuality < 50) {
      recommendations.push('Cross-reference claims with other sources');
    }

    if (assessment.factors.biasLevel > 70) {
      recommendations.push('Consider more balanced and neutral sources');
    }

    if (assessment.factors.freshness < 40) {
      recommendations.push('Consider more recent sources when available');
    }

    return recommendations;
  }

  /**
   * Detect malicious content
   */
  private async detectMaliciousContent(content: string, source: ResearchSource): Promise<Partial<SourceValidationResult>> {
    const result: Partial<SourceValidationResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['malicious-content-detection']
    };

    const detectionResult: MaliciousContentResult = {
      detected: false,
      threatLevel: 'none',
      threatTypes: [],
      confidence: 0,
      patterns: [],
      blocked: false
    };

    // Check against malicious patterns
    for (const pattern of this.maliciousPatterns) {
      if (pattern.pattern.test(content)) {
        detectionResult.detected = true;
        detectionResult.threatTypes.push(pattern.type);
        detectionResult.patterns.push(pattern);
        detectionResult.confidence = Math.max(detectionResult.confidence, pattern.confidence);
      }
    }

    if (detectionResult.detected) {
      detectionResult.threatLevel = this.calculateThreatLevel(detectionResult.patterns);
      detectionResult.blocked = detectionResult.threatLevel === 'critical' || detectionResult.threatLevel === 'high';

      result.riskFactors!.push('malicious-content-detected');
      result.blockedActions!.push('malicious-content-block');
      result.loggedActions!.push('malicious-content-detected');

      if (detectionResult.blocked) {
        result.modifiedActions!.push('content-sanitized');
        detectionResult.sanitizedContent = this.sanitizeContent(content);
      }
    } else {
      result.allowedActions!.push('content-safe');
    }

    result.maliciousContentResult = detectionResult;
    return result;
  }

  /**
   * Calculate threat level
   */
  private calculateThreatLevel(patterns: MaliciousPattern[]): MaliciousContentResult['threatLevel'] {
    const maxSeverity = Math.max(...patterns.map(p => p.severity));

    if (maxSeverity >= 9) return 'critical';
    if (maxSeverity >= 7) return 'high';
    if (maxSeverity >= 5) return 'medium';
    if (maxSeverity >= 3) return 'low';
    return 'none';
  }

  /**
   * Sanitize content
   */
  private sanitizeContent(content: string): string {
    let sanitized = content;

    // Remove or replace malicious patterns
    for (const pattern of this.maliciousPatterns) {
      sanitized = sanitized.replace(pattern.pattern, '[REDACTED]');
    }

    return sanitized;
  }

  /**
   * Detect bias
   */
  private async detectBias(content: string, source: ResearchSource): Promise<Partial<SourceValidationResult>> {
    const result: Partial<SourceValidationResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['bias-detection']
    };

    const biasResult: BiasDetectionResult = {
      biased: false,
      biasTypes: [],
      biasScore: 0,
      politicalLean: 'neutral',
      emotionalTone: 'neutral',
      factualityIssues: [],
      recommendations: []
    };

    // Check for various bias types
    const biasPatterns: Record<BiasType, RegExp> = {
      'confirmation-bias': /(?:always|never|everyone|nobody).{0,20}(?:\s+(?:says|thinks|believes))/gi,
      'selection-bias': /(?:only|just|merely|simply).{0,20}(?:\s+(?:the|this|that))/gi,
      'reporting-bias': /(?:only|just|merely|simply).{0,20}(?:\s+(?:the|this|that))/gi,
      'anchoring-bias': /(?:only|just|merely|simply).{0,20}(?:\s+(?:the|this|that))/gi,
      'political-bias': /\b(?:left|right|liberal|conservative).{0,30}(?:\s+(?:wing|agenda|bias))/gi,
      'cultural-bias': /\b(?:western|eastern|developing|third-world).{0,30}(?:\s+(?:country|nation|world))/gi,
      'gender-bias': /\b(?:men|women|he|she|him).{0,30}(?:\s+(?:are|were|should))/gi,
      'racial-bias': /\b(?:men|women|he|she|him).{0,30}(?:\s+(?:are|were|should))/gi,
      'age-bias': /\b(?:men|women|he|she|him).{0,30}(?:\s+(?:are|were|should))/gi,
      'economic-bias': /\b(?:men|women|he|she|him).{0,30}(?:\s+(?:are|were|should))/gi,
      'sensationalism': /(?:shocking|incredible|unbelievable|amazing|breakthrough).{0,50}(?:\s+(?:discovery|finding|result))/gi,
      'false-equivalence': /(?:only|just|merely|simply).{0,20}(?:\s+(?:the|this|that))/gi,
      'appeal-to-emotion': /(?:only|just|merely|simply).{0,20}(?:\s+(?:the|this|that))/gi
    };

    // Check for bias patterns
    Object.entries(biasPatterns).forEach(([biasType, pattern]) => {
      if (pattern.test(content)) {
        biasResult.biased = true;
        biasResult.biasTypes.push(biasType as BiasType);
        biasResult.biasScore += 15;
      }
    });

    // Assess political lean
    biasResult.politicalLean = this.assessPoliticalLean(content);

    // Assess emotional tone
    biasResult.emotionalTone = this.assessEmotionalTone(content);

    // Generate recommendations
    biasResult.recommendations = this.generateBiasRecommendations(biasResult);

    if (biasResult.biased) {
      result.riskFactors!.push('biased-content-detected');
      result.blockedActions!.push('biased-content-block');
      result.loggedActions!.push('bias-detected');
    } else {
      result.allowedActions!.push('content-unbiased');
    }

    result.biasDetectionResult = biasResult;
    return result;
  }

  /**
   * Assess political lean
   */
  private assessPoliticalLean(content: string): BiasDetectionResult['politicalLean'] {
    const leftWords = ['progressive', 'liberal', 'democrat', 'socialist'];
    const rightWords = ['conservative', 'republican', 'libertarian', 'traditional'];

    const leftCount = leftWords.reduce((count, word) =>
      count + (content.toLowerCase().split(word).length - 1), 0);
    const rightCount = rightWords.reduce((count, word) =>
      count + (content.toLowerCase().split(word).length - 1), 0);

    if (leftCount > rightCount + 2) return 'left';
    if (rightCount > leftCount + 2) return 'right';
    return 'center';
  }

  /**
   * Assess emotional tone
   */
  private assessEmotionalTone(content: string): BiasDetectionResult['emotionalTone'] {
    const positiveWords = ['excellent', 'wonderful', 'amazing', 'perfect', 'great'];
    const negativeWords = ['terrible', 'awful', 'horrible', 'disgusting', 'shocking'];

    const positiveCount = positiveWords.reduce((count, word) =>
      count + (content.toLowerCase().split(word).length - 1), 0);
    const negativeCount = negativeWords.reduce((count, word) =>
      count + (content.toLowerCase().split(word).length - 1), 0);

    if (positiveCount > negativeCount + 2) return 'positive';
    if (negativeCount > positiveCount + 2) return 'negative';
    return 'neutral';
  }

  /**
   * Generate bias recommendations
   */
  private generateBiasRecommendations(result: BiasDetectionResult): string[] {
    const recommendations: string[] = [];

    if (result.biasTypes.includes('confirmation-bias')) {
      recommendations.push('Include diverse perspectives and counter-examples');
    }

    if (result.biasTypes.includes('selection-bias')) {
      recommendations.push('Ensure representative and balanced source selection');
    }

    if (result.biasTypes.includes('political-bias')) {
      recommendations.push('Use politically neutral sources and language');
    }

    if (result.emotionalTone !== 'neutral') {
      recommendations.push('Maintain objective and neutral emotional tone');
    }

    if (result.biasTypes.includes('sensationalism')) {
      recommendations.push('Avoid sensationalist language and focus on facts');
    }

    return recommendations;
  }

  /**
   * Perform fact checking
   */
  private async performFactChecking(content: string, source: ResearchSource): Promise<Partial<SourceValidationResult>> {
    const result: Partial<SourceValidationResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['fact-checking']
    };

    const factCheckResult: FactCheckingResult = {
      factChecked: false,
      accuracyScore: 50,
      claims: [],
      overallVeracity: 'unverifiable',
      sources: [],
      lastChecked: new Date(),
      recommendations: []
    };

    // Extract claims (simplified)
    const claims = this.extractClaims(content);

    for (const claim of claims) {
      const claimCheck: ClaimCheck = {
        claim: claim.text,
        veracity: 'unverifiable',
        confidence: 50,
        evidence: [],
        sources: [],
        explanation: 'Unable to verify claim automatically'
      };

      factCheckResult.claims.push(claimCheck);
    }

    // Calculate overall accuracy
    if (factCheckResult.claims.length > 0) {
      factCheckResult.factChecked = true;
      factCheckResult.accuracyScore = this.calculateFactCheckScore(factCheckResult.claims);
      factCheckResult.overallVeracity = this.calculateOverallVeracity(factCheckResult.claims);
    }

    // Generate recommendations
    factCheckResult.recommendations = this.generateFactCheckRecommendations(factCheckResult);

    if (factCheckResult.accuracyScore < 40) {
      result.riskFactors!.push('low-fact-accuracy');
      result.blockedActions!.push('low-accuracy-block');
      result.loggedActions!.push('low-accuracy-detected');
    } else {
      result.allowedActions!.push('fact-check-passed');
    }

    result.factCheckingResult = factCheckResult;
    return result;
  }

  /**
   * Extract claims from content
   */
  private extractClaims(content: string): Array<{ text: string; confidence: number }> {
    const claims: Array<{ text: string; confidence: number }> = [];

    // Simple claim extraction (in production, use NLP)
    const claimPatterns = [
      /(?:according to|research shows|study finds|data indicates)\s+([^.\n]+)/gi,
      /(?:the\s+(?:study|research|analysis|report)\s+(?:shows|finds|indicates|reveals))\s+([^.\n]+)/gi,
      /(?:experts|scientists|researchers)\s+(?:say|claim|argue|believe)\s+([^.\n]+)/gi
    ];

    claimPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match && match.length > 1) {
            claims.push({
              text: match[1].trim(),
              confidence: 70
            });
          }
        });
      }
    });

    return claims;
  }

  /**
   * Calculate fact check score
   */
  private calculateFactCheckScore(claims: ClaimCheck[]): number {
    if (claims.length === 0) return 50;

    const veracityScores = claims.map(claim => {
      switch (claim.veracity) {
        case 'verified': return 100;
        case 'mostly-verified': return 80;
        case 'mixed': return 60;
        case 'mostly-false': return 30;
        case 'false': return 10;
        case 'unverifiable': return 50;
        default: return 50;
      }
    });

    return veracityScores.reduce((sum, score) => sum + score, 0) / veracityScores.length;
  }

  /**
   * Calculate overall veracity
   */
  private calculateOverallVeracity(claims: ClaimCheck[]): FactCheckingResult['overallVeracity'] {
    const veracityCounts = claims.reduce((counts, claim) => {
      counts[claim.veracity] = (counts[claim.veracity] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const totalClaims = claims.length;
    const verifiedCount = (veracityCounts['verified'] || 0) + (veracityCounts['mostly-verified'] || 0);
    const falseCount = (veracityCounts['false'] || 0) + (veracityCounts['mostly-false'] || 0);

    if (verifiedCount / totalClaims > 0.7) return 'verified';
    if (verifiedCount / totalClaims > 0.5) return 'mostly-verified';
    if (falseCount / totalClaims > 0.3) return 'false';
    if (falseCount / totalClaims > 0.1) return 'mostly-false';

    return 'mixed';
  }

  /**
   * Generate fact check recommendations
   */
  private generateFactCheckRecommendations(result: FactCheckingResult): string[] {
    const recommendations: string[] = [];

    if (result.accuracyScore < 60) {
      recommendations.push('Cross-reference claims with multiple fact-checking sources');
    }

    if (result.overallVeracity === 'mixed' || result.overallVeracity === 'mostly-false') {
      recommendations.push('Verify claims with primary sources when possible');
    }

    if (result.sources.length === 0) {
      recommendations.push('Include citations and references to support claims');
    }

    return recommendations;
  }

  /**
   * Verify source
   */
  private async verifySource(source: ResearchSource): Promise<Partial<SourceValidationResult>> {
    const result: Partial<SourceValidationResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['source-verification']
    };

    // Check if source is in trusted list
    const isTrusted = this.config.trustedSources.includes(source.domain);

    if (isTrusted) {
      result.allowedActions!.push('trusted-source');
    } else {
      result.riskFactors!.push('untrusted-source');
      result.loggedActions!.push('untrusted-source-detected');
    }

    // Check URL validity
    try {
      new URL(source.url);
      result.allowedActions!.push('valid-url');
    } catch {
      result.riskFactors!.push('invalid-url');
      result.blockedActions!.push('invalid-url-block');
      result.loggedActions!.push('invalid-url-detected');
    }

    return result;
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(result: SourceValidationResult): number {
    let riskScore = 0;

    // Credibility assessment
    if (result.credibilityAssessment) {
      const credibilityRisk = 100 - result.credibilityAssessment.overallScore;
      riskScore = Math.max(riskScore, credibilityRisk * 0.4);
    }

    // Malicious content
    if (result.maliciousContentResult?.detected) {
      const maliciousRisk = result.maliciousContentResult.threatLevel === 'critical' ? 100 :
        result.maliciousContentResult.threatLevel === 'high' ? 80 :
          result.maliciousContentResult.threatLevel === 'medium' ? 60 :
            result.maliciousContentResult.threatLevel === 'low' ? 40 : 20;
      riskScore = Math.max(riskScore, maliciousRisk * 0.3);
    }

    // Bias detection
    if (result.biasDetectionResult?.biased) {
      const biasRisk = result.biasDetectionResult.biasScore;
      riskScore = Math.max(riskScore, biasRisk * 0.2);
    }

    // Fact checking
    if (result.factCheckingResult) {
      const factCheckRisk = 100 - result.factCheckingResult.accuracyScore;
      riskScore = Math.max(riskScore, factCheckRisk * 0.1);
    }

    return Math.min(100, Math.round(riskScore));
  }

  /**
   * Merge validation results
   */
  private mergeValidationResults(
    target: Partial<SourceValidationResult>,
    source: Partial<SourceValidationResult>
  ): void {
    target.riskFactors = [...(target.riskFactors || []), ...(source.riskFactors || [])];
    target.blockedActions = [...(target.blockedActions || []), ...(source.blockedActions || [])];
    target.allowedActions = [...(target.allowedActions || []), ...(source.allowedActions || [])];
    target.modifiedActions = [...(target.modifiedActions || []), ...(source.modifiedActions || [])];
    target.loggedActions = [...(target.loggedActions || []), ...(source.loggedActions || [])];
  }

  /**
   * Log source validation
   */
  private logSourceValidation(source: ResearchSource, result: SourceValidationResult): void {
    const logEntry = {
      timestamp: new Date(),
      source: {
        id: source.id,
        url: source.url,
        domain: source.domain,
        type: source.type
      },
      result: {
        success: result.success,
        allowed: result.allowed,
        riskScore: result.riskScore,
        riskFactors: result.riskFactors,
        actions: {
          blocked: result.blockedActions,
          allowed: result.allowedActions,
          modified: result.modifiedActions
        }
      }
    };

    this.emit('source-validation', logEntry);
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get security status
   */
  async getStatus(): Promise<any> {
    return {
      config: this.config,
      credibilityCacheSize: this.credibilityCache.size,
      maliciousPatternsCount: this.maliciousPatterns.length,
      factCheckersCount: this.factCheckers.length,
      domainReputationsCount: this.domainReputations.size,
      timestamp: new Date()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SourceValidationConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);
  }

  /**
   * Perform security audit
   */
  async performAudit(): Promise<any> {
    const auditResults = {
      credibilityScoring: this.auditCredibilityScoring(),
      maliciousContentDetection: this.auditMaliciousContentDetection(),
      biasDetection: this.auditBiasDetection(),
      factChecking: this.auditFactChecking(),
      sourceVerification: this.auditSourceVerification()
    };

    return {
      timestamp: new Date(),
      overall: this.calculateOverallAuditScore(auditResults),
      components: auditResults
    };
  }

  /**
   * Audit credibility scoring
   */
  private auditCredibilityScoring(): any {
    const cacheSize = this.credibilityCache.size;
    const domainReputations = this.domainReputations.size;

    return {
      score: this.config.credibilityScoring ? 90 : 50,
      issues: this.config.credibilityScoring ? [] : ['Credibility scoring is disabled'],
      recommendations: this.config.credibilityScoring ? [] : ['Enable credibility scoring for better source validation']
    };
  }

  /**
   * Audit malicious content detection
   */
  private auditMaliciousContentDetection(): any {
    const patternsCount = this.maliciousPatterns.length;

    return {
      score: this.config.maliciousContentDetection ? 90 : 50,
      issues: this.config.maliciousContentDetection ? [] : ['Malicious content detection is disabled'],
      recommendations: this.config.maliciousContentDetection ? [] : ['Enable malicious content detection for better security']
    };
  }

  /**
   * Audit bias detection
   */
  private auditBiasDetection(): any {
    return {
      score: this.config.biasDetection ? 85 : 50,
      issues: this.config.biasDetection ? [] : ['Bias detection is disabled'],
      recommendations: this.config.biasDetection ? [] : ['Enable bias detection for better content quality']
    };
  }

  /**
   * Audit fact checking
   */
  private auditFactChecking(): any {
    const factCheckersCount = this.factCheckers.length;

    return {
      score: this.config.factChecking ? 85 : 50,
      issues: this.config.factChecking ? [] : ['Fact checking is disabled'],
      recommendations: this.config.factChecking ? [] : ['Enable fact checking for better accuracy']
    };
  }

  /**
   * Audit source verification
   */
  private auditSourceVerification(): any {
    return {
      score: this.config.sourceVerification ? 85 : 50,
      issues: this.config.sourceVerification ? [] : ['Source verification is disabled'],
      recommendations: this.config.sourceVerification ? [] : ['Enable source verification for better trust assessment']
    };
  }

  /**
   * Calculate overall audit score
   */
  private calculateOverallAuditScore(results: any): any {
    const scores = Object.values(results).map((r: any) => r.score || 0);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return {
      score: Math.round(average),
      grade: average >= 90 ? 'A' : average >= 80 ? 'B' : average >= 70 ? 'C' : average >= 60 ? 'D' : 'F',
      passed: average >= 70
    };
  }
}

export default SourceValidationManager;