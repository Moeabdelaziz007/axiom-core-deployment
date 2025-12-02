/**
 * Mizan Risk Management Engine
 * Simplified risk assessment using lookup tables instead of complex RL
 * Supports both Tajer trading bots and MENA Agentic AI decisions
 * Implements dynamic temperature scaling based on risk exposure
 */

interface RiskLevel {
  level: 1 | 2 | 3 | 4 | 5;
  label: 'low' | 'low-med' | 'medium' | 'med-high' | 'high';
  slippage: number;
  maxPosition: number;
  temperature: number;
  confidence: number;
  actionRequired: 'auto' | 'review' | 'approval';
}

interface MarketConditions {
  volatility: number; // 0-1 scale
  liquidity: number; // 0-1 scale  
  trendStrength: number; // 0-1 scale
  sentiment: 'bullish' | 'bearish' | 'neutral';
  fearGreedIndex: number; // 0-100
  volume: number;
}

interface RiskCalculationInput {
  userTier: 'basic' | 'pro' | 'enterprise';
  amountUSD: number;
  tokenLiquidity: number;
  marketCap: number;
  userExperience: 'beginner' | 'intermediate' | 'expert';
  currentConditions: MarketConditions;
  agentType: 'trading-bot' | 'legal-advisor' | 'travel-agent' | 'real-estate';
}

/**
 * Mizan Risk Lookup Tables
 * Pre-computed risk parameters for O(1) lookup performance
 */
export const MIZAN_LOOKUP_TABLES = {
  // Temperature (Creativity/Decision Making) based on risk level
  temperature: {
    1: 0.1,  // Very conservative, high precision
    2: 0.3,  // Conservative, moderate precision
    3: 0.5,  // Balanced, standard decision making
    4: 0.7,  // Aggressive, creative problem solving
    5: 0.9,  // Maximum creativity, experimental approach
  },

  // Maximum position sizes (USD) based on risk level
  maxPosition: {
    basic: {
      1: 100,
      2: 250, 
      3: 500,
      4: 1000,
      5: 5000,
    },
    pro: {
      1: 1000,
      2: 2500,
      3: 5000,
      4: 10000,
      5: 50000,
    },
    enterprise: {
      1: 10000,
      2: 25000,
      3: 50000,
      4: 100000,
      5: 500000,
    }
  },

  // Action requirements
  actionRequired: {
    1: 'auto',     // Auto-execute for very low risk
    2: 'auto',     // Auto-execute for low risk
    3: 'review',   // Requires review for medium risk
    4: 'approval', // Requires approval for high risk
    5: 'approval', // Requires approval for very high risk
  },

  // Confidence multipliers for different agent types
  agentMultipliers: {
    'trading-bot': 1.0,
    'legal-advisor': 0.8,     // Legal advice needs higher scrutiny
    'travel-agent': 1.2,      // Travel advice is generally safe
    'real-estate': 0.9,       // Real estate has medium risk
  },

  // Market condition adjustments
  marketAdjustments: {
    high_volatility: 0.3,     // Reduce risk appetite
    low_liquidity: 0.2,       // Reduce risk appetite  
    strong_bull_trend: 1.3,   // Increase risk appetite
    strong_bear_trend: 0.7,   // Reduce risk appetite
    fear_greed_extreme: 0.4,  // Reduce appetite at extremes
  }
};

/**
 * Mizan Risk Engine - Core Implementation
 * Converts complex risk calculations into O(1) lookup operations
 */
export class MizanRiskEngine {
  
  /**
   * Calculate risk level from input parameters
   * Returns O(1) lookup result instead of complex calculations
   */
  calculateRisk(input: RiskCalculationInput): RiskLevel {
    // Calculate base risk score using simple heuristics
    const baseRisk = this.calculateBaseRisk(input);
    
    // Apply market conditions adjustments
    const adjustedRisk = this.applyMarketConditions(baseRisk, input.currentConditions);
    
    // Apply agent type adjustments  
    const agentAdjustedRisk = this.applyAgentAdjustments(adjustedRisk, input.agentType);
    
    // Determine risk level (1-5)
    const riskLevel = this.determineRiskLevel(agentAdjustedRisk);
    
    // Lookup all parameters for this risk level
    return this.lookupRiskParameters(riskLevel, input.userTier, input.amountUSD);
  }

  /**
   * Calculate base risk using simple heuristics
   */
  private calculateBaseRisk(input: RiskCalculationInput): number {
    let risk = 0;

    // Amount-based risk
    if (input.amountUSD > 10000) risk += 2;
    else if (input.amountUSD > 1000) risk += 1;
    
    // Experience-based risk
    if (input.userExperience === 'beginner') risk += 1;
    else if (input.userExperience === 'expert') risk -= 0.5;
    
    // Liquidity risk
    if (input.tokenLiquidity < 1000000) risk += 1;
    else if (input.tokenLiquidity > 10000000) risk -= 0.5;
    
    // User tier protection
    if (input.userTier === 'enterprise') risk -= 0.5;
    else if (input.userTier === 'basic') risk += 0.5;

    return Math.max(0, Math.min(10, risk));
  }

  /**
   * Apply market condition adjustments
   */
  private applyMarketConditions(baseRisk: number, conditions: MarketConditions): number {
    let adjustedRisk = baseRisk;
    
    // Volatility adjustment
    if (conditions.volatility > 0.8) {
      adjustedRisk += baseRisk * MIZAN_LOOKUP_TABLES.marketAdjustments.high_volatility;
    }
    
    // Liquidity adjustment
    if (conditions.liquidity < 0.3) {
      adjustedRisk += baseRisk * MIZAN_LOOKUP_TABLES.marketAdjustments.low_liquidity;
    }
    
    // Trend adjustment
    if (conditions.trendStrength > 0.7 && conditions.sentiment === 'bullish') {
      adjustedRisk *= MIZAN_LOOKUP_TABLES.marketAdjustments.strong_bull_trend;
    } else if (conditions.trendStrength > 0.7 && conditions.sentiment === 'bearish') {
      adjustedRisk *= MIZAN_LOOKUP_TABLES.marketAdjustments.strong_bear_trend;
    }
    
    // Fear & Greed Index
    if (conditions.fearGreedIndex < 20 || conditions.fearGreedIndex > 80) {
      adjustedRisk *= MIZAN_LOOKUP_TABLES.marketAdjustments.fear_greed_extreme;
    }
    
    return adjustedRisk;
  }

  /**
   * Apply agent-specific risk adjustments
   */
  private applyAgentAdjustments(baseRisk: number, agentType: string): number {
    const multiplier = MIZAN_LOOKUP_TABLES.agentMultipliers[agentType as keyof typeof MIZAN_LOOKUP_TABLES.agentMultipliers];
    return baseRisk * (multiplier || 1.0);
  }

  /**
   * Determine risk level (1-5) from risk score
   */
  private determineRiskLevel(riskScore: number): 1 | 2 | 3 | 4 | 5 {
    if (riskScore <= 1.5) return 1;      // Very low risk
    if (riskScore <= 3.0) return 2;      // Low risk
    if (riskScore <= 5.0) return 3;      // Medium risk
    if (riskScore <= 7.5) return 4;      // High risk
    return 5;                             // Very high risk
  }

  /**
   * Lookup all risk parameters for given level and user tier
   */
  private lookupRiskParameters(level: 1 | 2 | 3 | 4 | 5, userTier: string, amountUSD: number): RiskLevel {
    const maxPosition = MIZAN_LOOKUP_TABLES.maxPosition[userTier as keyof typeof MIZAN_LOOKUP_TABLES.maxPosition][level];
    
    // Check if amount exceeds maximum position
    const exceedsPosition = amountUSD > maxPosition;
    
    return {
      level,
      label: this.getRiskLabel(level),
      slippage: level * 0.005, // 0.5% increments
      maxPosition,
      temperature: MIZAN_LOOKUP_TABLES.temperature[level],
      confidence: 1.0 - (level * 0.1), // Decreasing confidence with higher risk
      actionRequired: MIZAN_LOOKUP_TABLES.actionRequired[level],
    };
  }

  /**
   * Get risk level label
   */
  private getRiskLabel(level: 1 | 2 | 3 | 4 | 5): 'low' | 'low-med' | 'medium' | 'med-high' | 'high' {
    const labels = {
      1: 'low' as const,
      2: 'low-med' as const,
      3: 'medium' as const,
      4: 'med-high' as const,
      5: 'high' as const,
    };
    return labels[level];
  }

  /**
   * Get temperature for LLM based on risk level
   * Used in both trading bots and agentic AI
   */
  getTemperature(level: 1 | 2 | 3 | 4 | 5): number {
    return MIZAN_LOOKUP_TABLES.temperature[level];
  }

  /**
   * Determine if action should be executed automatically
   */
  shouldAutoExecute(level: 1 | 2 | 3 | 4 | 5): boolean {
    return MIZAN_LOOKUP_TABLES.actionRequired[level] === 'auto';
  }

  /**
   * Get risk-adjusted slippage for trading
   */
  getSlippage(level: 1 | 2 | 3 | 4 | 5): number {
    return level * 0.005; // 0.5% per risk level
  }

  /**
   * Update market conditions dynamically
   * Used for real-time risk assessment
   */
  updateMarketConditions(conditions: MarketConditions): void {
    // In a real implementation, this would update global conditions
    // that affect all risk calculations
    console.log('Market conditions updated:', conditions);
  }

  /**
   * Emergency risk lockdown
   * Automatically sets all actions to require approval during high volatility
   */
  enableRiskLockdown(reason: string): void {
    console.log(`🚨 MIZAN LOCKDOWN ACTIVATED: ${reason}`);
    // In real implementation, this would modify the lookup tables
    // to require approval for all risk levels
  }

  /**
   * Get risk summary for dashboard
   */
  getRiskSummary(input: RiskCalculationInput): {
    riskLevel: string;
    actionRequired: string;
    maxPosition: number;
    temperature: number;
    reasoning: string[];
  } {
    const risk = this.calculateRisk(input);
    const reasoning = this.generateReasoning(input, risk);
    
    return {
      riskLevel: risk.label,
      actionRequired: risk.actionRequired,
      maxPosition: risk.maxPosition,
      temperature: risk.temperature,
      reasoning,
    };
  }

  /**
   * Generate human-readable reasoning for risk decision
   */
  private generateReasoning(input: RiskCalculationInput, risk: RiskLevel): string[] {
    const reasons = [];
    
    if (input.amountUSD > 10000) {
      reasons.push('High transaction amount requires additional oversight');
    }
    
    if (input.tokenLiquidity < 1000000) {
      reasons.push('Low token liquidity increases execution risk');
    }
    
    if (input.currentConditions.volatility > 0.8) {
      reasons.push('High market volatility detected');
    }
    
    if (input.userTier === 'basic') {
      reasons.push('Basic tier users have additional safety measures');
    }
    
    if (risk.level >= 4) {
      reasons.push(`Risk level ${risk.level} requires human approval`);
    }
    
    return reasons;
  }
}

/**
 * Singleton instance for global use
 */
export const mizanEngine = new MizanRiskEngine();

/**
 * Utility functions for easy integration
 */
export const MizanUtils = {
  /**
   * Quick risk check for trading
   */
  quickTradingRisk(
    amountUSD: number,
    userTier: 'basic' | 'pro' | 'enterprise' = 'basic'
  ): RiskLevel {
    return mizanEngine.calculateRisk({
      userTier,
      amountUSD,
      tokenLiquidity: 10000000, // Default good liquidity
      marketCap: 1000000000,    // Default large market cap
      userExperience: 'intermediate',
      currentConditions: {
        volatility: 0.3,
        liquidity: 0.8,
        trendStrength: 0.5,
        sentiment: 'neutral',
        fearGreedIndex: 50,
        volume: 1000000,
      },
      agentType: 'trading-bot',
    });
  },

  /**
   * Quick risk check for agentic AI decisions
   */
  quickAgentRisk(
    agentType: 'legal-advisor' | 'travel-agent' | 'real-estate',
    decisionType: 'buy' | 'sell' | 'recommend' | 'analyze' = 'recommend'
  ): RiskLevel {
    // Different agent types have different risk profiles
    const baseRisk = agentType === 'legal-advisor' ? 2 : 
                    agentType === 'real-estate' ? 3 : 1;
    
    return mizanEngine.calculateRisk({
      userTier: 'pro',
      amountUSD: 1000, // Default for agent decisions
      tokenLiquidity: 10000000,
      marketCap: 1000000000,
      userExperience: 'expert',
      currentConditions: {
        volatility: 0.3,
        liquidity: 0.8,
        trendStrength: 0.5,
        sentiment: 'neutral',
        fearGreedIndex: 50,
        volume: 1000000,
      },
      agentType,
    });
  },

  /**
   * Temperature presets for different AI models
   */
  getTemperaturePresets() {
    return {
      groq_fast: 0.1,      // Fast inference, conservative decisions
      groq_accurate: 0.3,  // Accurate but still conservative
      gemini_long_context: 0.5, // Balanced for complex analysis
      huggingface_specialized: 0.7, // For specialized dialect models
    };
  }
};

export default MizanRiskEngine;