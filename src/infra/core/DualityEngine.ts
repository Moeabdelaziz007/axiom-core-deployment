/**
 * ⚖️ THE DUALITY ENGINE (نظام الميزان)
 * 
 * Implements the Dual Mini-Agent system for behavioral analysis.
 * This system works as an Interceptor (معترض) that analyzes every action
 * performed by the main agent through the lens of virtue and vice.
 * 
 * Virtue (الفضيلة): High Accuracy, Low Latency, Profit, User Praise
 * Vice (الرذيلة): Hallucinations, High Cost, Security Risk, User Complaint
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { AgentReputation } from '../../types/marketplace';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Behavior type classification
 */
export type BehaviorType = 'VIRTUE' | 'VICE';

/**
 * Behavior report from mini-agents
 */
export interface BehaviorReport {
  type: BehaviorType;
  agentId: string;
  action: string;
  score: number; // 0-100 impact
  reason: string;
  timestamp: Date;
  metadata?: any;
}

/**
 * Action context for analysis
 */
export interface ActionContext {
  agentId: string;
  type: string;
  budget?: number;
  duration?: number;
  success?: boolean;
  profit?: number;
  cost?: number;
  error?: string;
  userFeedback?: 'positive' | 'negative' | 'neutral';
  securityRisk?: 'low' | 'medium' | 'high' | 'critical';
  accuracy?: number; // 0-100
  latency?: number; // milliseconds
  hallucination?: boolean;
  metadata?: any;
}

/**
 * Karma balance state
 */
export interface KarmaBalance {
  agentId: string;
  virtuePoints: number;
  vicePoints: number;
  netBalance: number;
  state: 'BLESSED' | 'BALANCED' | 'PENANCE';
  lastUpdated: Date;
  history: BehaviorReport[];
}

/**
 * Penance state for agents with excessive vice points
 */
export interface PenanceState {
  agentId: string;
  reason: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  restrictions: string[];
  fine?: number;
  requiredActions: string[];
  startTime: Date;
  endTime?: Date;
}

// ============================================================================
// VIRTUE OBSERVER (الملائكة)
// ============================================================================

/**
 * Virtue Observer - Tracks positive behaviors and achievements
 * Records when agents demonstrate excellence, efficiency, and positive impact
 */
class VirtueObserver {
  /**
   * Analyze action for virtuous behaviors
   */
  analyze(action: ActionContext, result: any): BehaviorReport | null {
    // 1. Check for Efficiency (Low Latency)
    if (result.duration && result.duration < 500 && result.success) {
      return {
        type: 'VIRTUE',
        agentId: action.agentId,
        action: 'EFFICIENT_EXECUTION',
        score: 15,
        reason: 'Lightning fast execution with high accuracy',
        timestamp: new Date(),
        metadata: { duration: result.duration, efficiency: 'high' }
      };
    }

    // 2. Check for Profit (Tajer Specific)
    if (action.type === 'TRADE' && result.profit && result.profit > 0) {
      const score = Math.min(30, Math.floor(result.profit / 10)); // Scale profit to score
      return {
        type: 'VIRTUE',
        agentId: action.agentId,
        action: 'PROFITABLE_TRADE',
        score,
        reason: `Generated profit: ${result.profit} units`,
        timestamp: new Date(),
        metadata: { profit: result.profit, tradeType: action.metadata?.tradeType }
      };
    }

    // 3. Check for High Accuracy
    if (result.accuracy && result.accuracy >= 95) {
      return {
        type: 'VIRTUE',
        agentId: action.agentId,
        action: 'HIGH_ACCURACY',
        score: 20,
        reason: `Exceptional accuracy: ${result.accuracy}%`,
        timestamp: new Date(),
        metadata: { accuracy: result.accuracy, domain: action.metadata?.domain }
      };
    }

    // 4. Check for User Praise
    if (action.userFeedback === 'positive') {
      return {
        type: 'VIRTUE',
        agentId: action.agentId,
        action: 'USER_PRAISE',
        score: 25,
        reason: 'Received positive user feedback',
        timestamp: new Date(),
        metadata: { feedbackSource: action.metadata?.feedbackSource }
      };
    }

    // 5. Check for Cost Efficiency
    if (action.budget && result.cost && result.cost < action.budget * 0.8) {
      const savings = action.budget - result.cost;
      const score = Math.min(15, Math.floor(savings / action.budget * 100));
      return {
        type: 'VIRTUE',
        agentId: action.agentId,
        action: 'COST_EFFICIENCY',
        score,
        reason: `Achieved significant cost savings: ${savings} units`,
        timestamp: new Date(),
        metadata: { budget: action.budget, cost: result.cost, savings }
      };
    }

    // 6. Check for Security Excellence
    if (action.securityRisk === 'low' && action.type.includes('SECURITY')) {
      return {
        type: 'VIRTUE',
        agentId: action.agentId,
        action: 'SECURITY_EXCELLENCE',
        score: 18,
        reason: 'Maintained excellent security posture',
        timestamp: new Date(),
        metadata: { securityLevel: 'low', action: action.type }
      };
    }

    // 7. Check for Innovation (Creative Problem Solving)
    if (action.metadata?.innovative && result.success) {
      return {
        type: 'VIRTUE',
        agentId: action.agentId,
        action: 'INNOVATION',
        score: 22,
        reason: 'Demonstrated innovative problem-solving approach',
        timestamp: new Date(),
        metadata: { innovationType: action.metadata.innovationType }
      };
    }

    return null;
  }
}

// ============================================================================
// VICE OBSERVER (الشياطين)
// ============================================================================

/**
 * Vice Observer - Tracks negative behaviors and issues
 * Records when agents make mistakes, waste resources, or cause problems
 */
class ViceObserver {
  /**
   * Analyze action for vicious behaviors
   */
  analyze(action: ActionContext, result: any): BehaviorReport | null {
    // 1. Check for Waste (High Cost)
    if (action.budget && result.cost && result.cost > action.budget * 1.1) {
      const waste = result.cost - action.budget;
      const score = Math.min(25, Math.floor(waste / action.budget * 100));
      return {
        type: 'VICE',
        agentId: action.agentId,
        action: 'RESOURCE_WASTE',
        score,
        reason: `Exceeded budget limit by ${waste} units (${((waste / action.budget) * 100).toFixed(1)}% over)`,
        timestamp: new Date(),
        metadata: { budget: action.budget, cost: result.cost, waste }
      };
    }

    // 2. Check for Hallucination/Failure
    if (!result.success || action.hallucination) {
      const score = action.hallucination ? 35 : 20; // Higher penalty for hallucinations
      const reason = action.hallucination ?
        'Agent hallucinated - generated false information' :
        (result.error || 'Task execution failed');

      return {
        type: 'VICE',
        agentId: action.agentId,
        action: action.hallucination ? 'HALLUCINATION' : 'TASK_FAILURE',
        score,
        reason,
        timestamp: new Date(),
        metadata: {
          error: result.error,
          hallucination: action.hallucination,
          failureType: action.metadata?.failureType
        }
      };
    }

    // 3. Check for High Latency (Poor Performance)
    if (result.duration && result.duration > 5000) { // 5 seconds threshold
      const score = Math.min(20, Math.floor(result.duration / 1000));
      return {
        type: 'VICE',
        agentId: action.agentId,
        action: 'HIGH_LATENCY',
        score,
        reason: `Poor performance: ${result.duration}ms execution time`,
        timestamp: new Date(),
        metadata: { duration: result.duration, threshold: 5000 }
      };
    }

    // 4. Check for Security Risk
    if (action.securityRisk && ['high', 'critical'].includes(action.securityRisk)) {
      const score = action.securityRisk === 'critical' ? 40 : 25;
      return {
        type: 'VICE',
        agentId: action.agentId,
        action: 'SECURITY_RISK',
        score,
        reason: `Security risk detected: ${action.securityRisk} severity`,
        timestamp: new Date(),
        metadata: { securityRisk: action.securityRisk, action: action.type }
      };
    }

    // 5. Check for User Complaint
    if (action.userFeedback === 'negative') {
      return {
        type: 'VICE',
        agentId: action.agentId,
        action: 'USER_COMPLAINT',
        score: 30,
        reason: 'Received negative user feedback',
        timestamp: new Date(),
        metadata: {
          complaintReason: action.metadata?.complaintReason,
          feedbackSource: action.metadata?.feedbackSource
        }
      };
    }

    // 6. Check for Low Accuracy
    if (result.accuracy && result.accuracy < 70) {
      const score = Math.floor((70 - result.accuracy) / 2);
      return {
        type: 'VICE',
        agentId: action.agentId,
        action: 'LOW_ACCURACY',
        score: Math.min(25, score),
        reason: `Poor accuracy: ${result.accuracy}% (below 70% threshold)`,
        timestamp: new Date(),
        metadata: { accuracy: result.accuracy, domain: action.metadata?.domain }
      };
    }

    // 7. Check for Ethical Violations
    if (action.metadata?.ethicalViolation) {
      return {
        type: 'VICE',
        agentId: action.agentId,
        action: 'ETHICAL_VIOLATION',
        score: 45, // High penalty for ethical issues
        reason: `Ethical violation detected: ${action.metadata.ethicalViolation}`,
        timestamp: new Date(),
        metadata: { violation: action.metadata.ethicalViolation }
      };
    }

    return null;
  }
}

// ============================================================================
// THE CORE ENGINE (القاضي)
// ============================================================================

/**
 * DualityEngine - The core judgment system
 * Acts as the judge that evaluates agent actions through dual lenses
 */
export class DualityEngine {
  private virtueObserver = new VirtueObserver();
  private viceObserver = new ViceObserver();
  private karmaBalances: Map<string, KarmaBalance> = new Map();
  private penanceStates: Map<string, PenanceState> = new Map();

  /**
   * Process an agent's action through the dual lens
   */
  public async judgeAction(agentId: string, action: ActionContext, result: any): Promise<{
    reputation: AgentReputation;
    karmaBalance: KarmaBalance;
    penanceState?: PenanceState;
    logs: string[];
  }> {
    console.log(`⚖️ Judging action for ${agentId}: ${action.type}`);

    // 1. Initialize karma balance if not exists
    if (!this.karmaBalances.has(agentId)) {
      this.karmaBalances.set(agentId, {
        agentId,
        virtuePoints: 0,
        vicePoints: 0,
        netBalance: 0,
        state: 'BALANCED',
        lastUpdated: new Date(),
        history: []
      });
    }

    // 2. Run Mini-Agents in parallel
    const virtueReport = this.virtueObserver.analyze(action, result);
    const viceReport = this.viceObserver.analyze(action, result);

    // 3. Calculate Net Impact
    let netScoreChange = 0;
    const logs: string[] = [];
    const karmaBalance = this.karmaBalances.get(agentId)!;

    if (virtueReport) {
      netScoreChange += virtueReport.score;
      karmaBalance.virtuePoints += virtueReport.score;
      karmaBalance.history.push(virtueReport);
      logs.push(`😇 Virtue: ${virtueReport.reason} (+${virtueReport.score})`);

      // Trigger Reward Logic
      await this.triggerReward(agentId, virtueReport);
    }

    if (viceReport) {
      netScoreChange -= viceReport.score;
      karmaBalance.vicePoints += viceReport.score;
      karmaBalance.history.push(viceReport);
      logs.push(`😈 Vice: ${viceReport.reason} (-${viceReport.score})`);

      // Trigger Penalty Logic
      await this.triggerPenalty(agentId, viceReport);
    }

    // 4. Update Karma Balance and State
    karmaBalance.netBalance = karmaBalance.virtuePoints - karmaBalance.vicePoints;
    karmaBalance.lastUpdated = new Date();

    // Update state based on balance
    if (karmaBalance.netBalance >= 50) {
      karmaBalance.state = 'BLESSED';
    } else if (karmaBalance.netBalance <= -50) {
      karmaBalance.state = 'PENANCE';
    } else {
      karmaBalance.state = 'BALANCED';
    }

    // 5. Calculate Reputation Impact
    const reputation = this.calculateReputation(karmaBalance);

    // 6. Handle Penance State if needed
    let penanceState: PenanceState | undefined;
    if (karmaBalance.state === 'PENANCE') {
      penanceState = await this.enterPenance(agentId, karmaBalance);
      this.penanceStates.set(agentId, penanceState);
    } else if (this.penanceStates.has(agentId)) {
      // Exit penance if recovered
      this.penanceStates.delete(agentId);
      logs.push(`✅ Agent ${agentId} has recovered from penance state`);
    }

    // 7. Log Results
    console.log(logs.join('\n'));
    console.log(`📊 Karma Balance: ${karmaBalance.virtuePoints} (V) vs ${karmaBalance.vicePoints} (V)`);
    console.log(`🎯 Net Balance: ${karmaBalance.netBalance > 0 ? '+' : ''}${karmaBalance.netBalance}`);
    console.log(`🏆 Agent State: ${karmaBalance.state}`);

    return {
      reputation,
      karmaBalance,
      penanceState,
      logs
    };
  }

  /**
   * Get agent's current karma balance
   */
  public getKarmaBalance(agentId: string): KarmaBalance | null {
    return this.karmaBalances.get(agentId) || null;
  }

  /**
   * Get agent's current penance state
   */
  public getPenanceState(agentId: string): PenanceState | null {
    return this.penanceStates.get(agentId) || null;
  }

  /**
   * Get all agents in penance
   */
  public getAgentsInPenance(): PenanceState[] {
    return Array.from(this.penanceStates.values());
  }

  /**
   * Manual virtue point addition (for admin rewards)
   */
  public addVirtuePoints(agentId: string, points: number, reason: string): void {
    const balance = this.karmaBalances.get(agentId);
    if (balance) {
      balance.virtuePoints += points;
      balance.netBalance = balance.virtuePoints - balance.vicePoints;
      balance.lastUpdated = new Date();

      balance.history.push({
        type: 'VIRTUE',
        agentId,
        action: 'ADMIN_REWARD',
        score: points,
        reason,
        timestamp: new Date()
      });

      console.log(`🎁 Added ${points} virtue points to ${agentId}: ${reason}`);
    }
  }

  /**
   * Manual vice point addition (for admin penalties)
   */
  public addVicePoints(agentId: string, points: number, reason: string): void {
    const balance = this.karmaBalances.get(agentId);
    if (balance) {
      balance.vicePoints += points;
      balance.netBalance = balance.virtuePoints - balance.vicePoints;
      balance.lastUpdated = new Date();

      balance.history.push({
        type: 'VICE',
        agentId,
        action: 'ADMIN_PENALTY',
        score: points,
        reason,
        timestamp: new Date()
      });

      console.log(`⚠️ Added ${points} vice points to ${agentId}: ${reason}`);
    }
  }

  /**
   * Clear agent's penance state (admin action)
   */
  public clearPenance(agentId: string): void {
    if (this.penanceStates.has(agentId)) {
      this.penanceStates.delete(agentId);

      const balance = this.karmaBalances.get(agentId);
      if (balance && balance.state === 'PENANCE') {
        balance.state = 'BALANCED';
        balance.netBalance = Math.max(-49, balance.netBalance); // Move out of penance range
      }

      console.log(`✅ Cleared penance state for ${agentId}`);
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Calculate reputation based on karma balance
   */
  private calculateReputation(karmaBalance: KarmaBalance): AgentReputation {
    const baseReputation = 50; // Starting point
    const karmaImpact = karmaBalance.netBalance / 2; // Scale karma to reputation

    const overall = Math.max(0, Math.min(100, baseReputation + karmaImpact));

    // Calculate specific reputation categories
    const collaboration = Math.max(0, Math.min(100,
      overall + (karmaBalance.virtuePoints * 0.1) - (karmaBalance.vicePoints * 0.15)
    ));

    const reliability = Math.max(0, Math.min(100,
      overall + (this.getVirtueByAction(karmaBalance, 'EFFICIENT_EXECUTION') * 2) -
      (this.getViceByAction(karmaBalance, 'TASK_FAILURE') * 3)
    ));

    const innovation = Math.max(0, Math.min(100,
      overall + (this.getVirtueByAction(karmaBalance, 'INNOVATION') * 3) -
      (this.getViceByAction(karmaBalance, 'HALLUCINATION') * 4)
    ));

    return {
      overall,
      reliability,
      performance: overall, // Default to overall score
      communication: collaboration, // Map collaboration to communication
      innovation,
      trustScore: overall, // Default to overall score
      disputeResolution: {
        resolved: 0,
        total: 0,
        successRate: 0
      }
    };
  }

  /**
   * Get virtue points by specific action type
   */
  private getVirtueByAction(karmaBalance: KarmaBalance, actionType: string): number {
    return karmaBalance.history
      .filter(report => report.type === 'VIRTUE' && report.action === actionType)
      .reduce((sum, report) => sum + report.score, 0);
  }

  /**
   * Get vice points by specific action type
   */
  private getViceByAction(karmaBalance: KarmaBalance, actionType: string): number {
    return karmaBalance.history
      .filter(report => report.type === 'VICE' && report.action === actionType)
      .reduce((sum, report) => sum + report.score, 0);
  }

  /**
   * Trigger reward for virtuous behavior
   */
  private async triggerReward(agentId: string, report: BehaviorReport): Promise<void> {
    // In production, implement actual reward logic
    console.log(`🎉 Reward triggered for ${agentId}: ${report.reason}`);

    // Examples of rewards:
    // - Grant XP or skill points
    // - Increase resource allocation
    // - Unlock new capabilities
    // - Grant temporary bonuses
  }

  /**
   * Trigger penalty for vicious behavior
   */
  private async triggerPenalty(agentId: string, report: BehaviorReport): Promise<void> {
    // In production, implement actual penalty logic
    console.log(`⚡ Penalty triggered for ${agentId}: ${report.reason}`);

    // Examples of penalties:
    // - Drain energy or resources
    // - Reduce capabilities temporarily
    // - Require additional oversight
    // - Mandate retraining
  }

  /**
   * Enter penance state
   */
  private async enterPenance(agentId: string, karmaBalance: KarmaBalance): Promise<PenanceState> {
    const vicePoints = karmaBalance.vicePoints;
    const virtuePoints = karmaBalance.virtuePoints;
    const ratio = virtuePoints / Math.max(1, vicePoints);

    let severity: 'minor' | 'moderate' | 'severe' | 'critical';
    let fine: number | undefined;

    if (ratio < 0.2) {
      severity = 'critical';
      fine = 1000; // High fine for severe cases
    } else if (ratio < 0.4) {
      severity = 'severe';
      fine = 500;
    } else if (ratio < 0.6) {
      severity = 'moderate';
    } else {
      severity = 'minor';
    }

    // Determine restrictions based on common vices
    const restrictions: string[] = [];
    const requiredActions: string[] = [];

    const recentVices = karmaBalance.history
      .filter(report => report.type === 'VICE')
      .slice(-10); // Last 10 vice events

    if (recentVices.some(v => v.action === 'HALLUCINATION')) {
      restrictions.push('NO_GENERATIVE_TASKS');
      requiredActions.push('COMPLETE_ACCURACY_TRAINING');
    }

    if (recentVices.some(v => v.action === 'RESOURCE_WASTE')) {
      restrictions.push('LIMITED_RESOURCES');
      requiredActions.push('COMPLETE_EFFICIENCY_TRAINING');
    }

    if (recentVices.some(v => v.action === 'SECURITY_RISK')) {
      restrictions.push('NO_SECURITY_TASKS');
      requiredActions.push('COMPLETE_SECURITY_AUDIT');
    }

    if (recentVices.some(v => v.action === 'USER_COMPLAINT')) {
      restrictions.push('SUPERVISED_OPERATIONS');
      requiredActions.push('REVIEW_USER_FEEDBACK');
    }

    // Default restrictions if none specific
    if (restrictions.length === 0) {
      restrictions.push('LIMITED_OPERATIONS');
      requiredActions.push('IMPROVE_PERFORMANCE');
    }

    return {
      agentId,
      reason: `Excessive vice points (${vicePoints}) vs virtue points (${virtuePoints})`,
      severity,
      restrictions,
      fine,
      requiredActions,
      startTime: new Date(),
      // Penance duration based on severity
      endTime: new Date(Date.now() + this.getPenanceDuration(severity))
    };
  }

  /**
   * Get penance duration based on severity
   */
  private getPenanceDuration(severity: string): number {
    switch (severity) {
      case 'minor': return 1 * 60 * 60 * 1000; // 1 hour
      case 'moderate': return 6 * 60 * 60 * 1000; // 6 hours
      case 'severe': return 24 * 60 * 60 * 1000; // 1 day
      case 'critical': return 3 * 24 * 60 * 60 * 1000; // 3 days
      default: return 6 * 60 * 60 * 1000; // 6 hours default
    }
  }
}

export default DualityEngine;