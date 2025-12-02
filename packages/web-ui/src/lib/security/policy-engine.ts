import { createClient } from '@libsql/client';

// Database client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Policy violation types
export enum PolicyViolationType {
  AMOUNT_TOO_LOW = 'AMOUNT_TOO_LOW',
  INVALID_DESTINATION = 'INVALID_DESTINATION',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  SUSPICIOUS_PATTERN = 'SUSPICIOUS_PATTERN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  BLACKLISTED_ADDRESS = 'BLACKLISTED_ADDRESS',
  UNAUTHORIZED_MINT = 'UNAUTHORIZED_MINT'
}

// Policy severity levels
export enum PolicySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Policy evaluation result
export interface PolicyEvaluationResult {
  allowed: boolean;
  violations: PolicyViolation[];
  riskScore: number;
  recommendations: string[];
}

// Policy violation
export interface PolicyViolation {
  type: PolicyViolationType;
  severity: PolicySeverity;
  description: string;
  details?: any;
}

// Transaction context for policy evaluation
export interface TransactionContext {
  signature: string;
  amount: number;
  fromAddress: string;
  toAddress: string;
  timestamp: number;
  slot: number;
  referenceKey?: string;
  userId?: string;
  mint?: string;
  metadata?: any;
}

// Zero-Trust Policy Engine
export class PolicyEngine {
  private db: any;
  private riskThresholds: Map<string, number>;

  constructor() {
    this.db = db;
    this.initializeRiskThresholds();
  }

  // Initialize risk scoring thresholds
  private initializeRiskThresholds(): void {
    this.riskThresholds = new Map([
      ['AMOUNT_TOO_LOW', 30],
      ['INVALID_DESTINATION', 80],
      ['DUPLICATE_TRANSACTION', 90],
      ['SUSPICIOUS_PATTERN', 70],
      ['RATE_LIMIT_EXCEEDED', 60],
      ['INVALID_SIGNATURE', 95],
      ['BLACKLISTED_ADDRESS', 100],
      ['UNAUTHORIZED_MINT', 85]
    ]);
  }

  // Evaluate transaction against all policies
  async evaluateTransaction(context: TransactionContext): Promise<PolicyEvaluationResult> {
    const violations: PolicyViolation[] = [];
    let totalRiskScore = 0;

    // Policy 1: Minimum amount validation
    const amountViolation = this.validateMinimumAmount(context.amount);
    if (amountViolation) {
      violations.push(amountViolation);
      totalRiskScore += this.riskThresholds.get(amountViolation.type) || 0;
    }

    // Policy 2: Destination address validation
    const destinationViolation = await this.validateDestinationAddress(context.toAddress);
    if (destinationViolation) {
      violations.push(destinationViolation);
      totalRiskScore += this.riskThresholds.get(destinationViolation.type) || 0;
    }

    // Policy 3: Duplicate transaction check
    const duplicateViolation = await this.checkDuplicateTransaction(context.signature, context.referenceKey);
    if (duplicateViolation) {
      violations.push(duplicateViolation);
      totalRiskScore += this.riskThresholds.get(duplicateViolation.type) || 0;
    }

    // Policy 4: Suspicious pattern detection
    const patternViolation = await this.detectSuspiciousPatterns(context);
    if (patternViolation) {
      violations.push(patternViolation);
      totalRiskScore += this.riskThresholds.get(patternViolation.type) || 0;
    }

    // Policy 5: Rate limiting check
    const rateLimitViolation = await this.checkRateLimit(context.fromAddress, context.timestamp);
    if (rateLimitViolation) {
      violations.push(rateLimitViolation);
      totalRiskScore += this.riskThresholds.get(rateLimitViolation.type) || 0;
    }

    // Policy 6: Blacklist check
    const blacklistViolation = await this.checkBlacklist(context.fromAddress, context.toAddress);
    if (blacklistViolation) {
      violations.push(blacklistViolation);
      totalRiskScore += this.riskThresholds.get(blacklistViolation.type) || 0;
    }

    // Policy 7: Mint authorization (for SPL tokens)
    if (context.mint) {
      const mintViolation = await this.validateMintAuthorization(context.mint);
      if (mintViolation) {
        violations.push(mintViolation);
        totalRiskScore += this.riskThresholds.get(mintViolation.type) || 0;
      }
    }

    // Generate recommendations based on violations
    const recommendations = this.generateRecommendations(violations, totalRiskScore);

    // Determine if transaction is allowed
    const allowed = totalRiskScore < 100 && !violations.some(v => 
      v.severity === PolicySeverity.CRITICAL || v.type === PolicyViolationType.BLACKLISTED_ADDRESS
    );

    return {
      allowed,
      violations,
      riskScore: totalRiskScore,
      recommendations
    };
  }

  // Validate minimum payment amount
  private validateMinimumAmount(amount: number): PolicyViolation | null {
    const minimumAmount = 0.99 * 1e9; // 0.99 SOL in lamports
    
    if (amount < minimumAmount) {
      return {
        type: PolicyViolationType.AMOUNT_TOO_LOW,
        severity: PolicySeverity.MEDIUM,
        description: `Payment amount ${amount / 1e9} SOL is below minimum required amount of 0.99 SOL`,
        details: { amount, minimumAmount }
      };
    }

    return null;
  }

  // Validate destination address
  private async validateDestinationAddress(destination: string): Promise<PolicyViolation | null> {
    const treasuryAddress = process.env.SOLANA_TREASURY_ADDRESS;
    
    if (!treasuryAddress) {
      return {
        type: PolicyViolationType.INVALID_DESTINATION,
        severity: PolicySeverity.HIGH,
        description: 'Treasury address not configured',
        details: { destination }
      };
    }

    if (destination !== treasuryAddress) {
      return {
        type: PolicyViolationType.INVALID_DESTINATION,
        severity: PolicySeverity.HIGH,
        description: `Payment destination ${destination} does not match treasury address`,
        details: { destination, expectedAddress: treasuryAddress }
      };
    }

    return null;
  }

  // Check for duplicate transactions
  private async checkDuplicateTransaction(signature: string, referenceKey?: string): Promise<PolicyViolation | null> {
    try {
      // Check if transaction already exists
      const result = await this.db.execute({
        sql: 'SELECT COUNT(*) as count FROM payments WHERE tx_signature = ? OR reference_key = ?',
        args: [signature, referenceKey]
      });

      const count = result.rows[0]?.count || 0;
      
      if (count > 0) {
        return {
          type: PolicyViolationType.DUPLICATE_TRANSACTION,
          severity: PolicySeverity.HIGH,
          description: 'Transaction has already been processed',
          details: { signature, referenceKey, existingCount: count }
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking duplicate transaction:', error);
      return null;
    }
  }

  // Detect suspicious patterns
  private async detectSuspiciousPatterns(context: TransactionContext): Promise<PolicyViolation | null> {
    try {
      // Check for rapid successive transactions from same address
      const recentTransactions = await this.db.execute({
        sql: `
          SELECT COUNT(*) as count, MAX(timestamp) as last_tx
          FROM payments 
          WHERE user_id = ? AND timestamp > ?
        `,
        args: [context.userId, context.timestamp - 5 * 60 * 1000] // Last 5 minutes
      });

      const recentCount = recentTransactions.rows[0]?.count || 0;
      
      if (recentCount > 10) { // More than 10 transactions in 5 minutes
        return {
          type: PolicyViolationType.SUSPICIOUS_PATTERN,
          severity: PolicySeverity.MEDIUM,
          description: `Suspicious activity: ${recentCount} transactions in last 5 minutes`,
          details: { recentCount, timeWindow: '5 minutes' }
        };
      }

      // Check for round number amounts (potential automation)
      if (context.amount % 1e9 === 0 && context.amount < 5 * 1e9) { // Round SOL amount < 5 SOL
        return {
          type: PolicyViolationType.SUSPICIOUS_PATTERN,
          severity: PolicySeverity.LOW,
          description: 'Round number amount may indicate automated activity',
          details: { amount: context.amount / 1e9 }
        };
      }

      return null;
    } catch (error) {
      console.error('Error detecting suspicious patterns:', error);
      return null;
    }
  }

  // Check rate limiting
  private async checkRateLimit(fromAddress: string, timestamp: number): Promise<PolicyViolation | null> {
    try {
      const windowStart = timestamp - 60 * 1000; // 1 minute window
      
      const result = await this.db.execute({
        sql: `
          SELECT COUNT(*) as count
          FROM payments 
          WHERE from_address = ? AND timestamp > ?
        `,
        args: [fromAddress, windowStart]
      });

      const count = result.rows[0]?.count || 0;
      
      if (count > 5) { // More than 5 transactions per minute
        return {
          type: PolicyViolationType.RATE_LIMIT_EXCEEDED,
          severity: PolicySeverity.MEDIUM,
          description: `Rate limit exceeded: ${count} transactions in last minute`,
          details: { count, limit: 5, timeWindow: '1 minute' }
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return null;
    }
  }

  // Check against blacklist
  private async checkBlacklist(fromAddress: string, toAddress: string): Promise<PolicyViolation | null> {
    try {
      // In a real implementation, this would check against a blacklist table
      // For now, we'll implement basic checks
      
      const suspiciousPatterns = [
        /^1111/, // Known testnet pattern
        /^5ej/, // Known suspicious pattern
        /^sys/, // System addresses
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => 
        pattern.test(fromAddress) || pattern.test(toAddress)
      );

      if (isSuspicious) {
        return {
          type: PolicyViolationType.BLACKLISTED_ADDRESS,
          severity: PolicySeverity.CRITICAL,
          description: 'Address matches suspicious pattern',
          details: { fromAddress, toAddress }
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking blacklist:', error);
      return null;
    }
  }

  // Validate mint authorization for SPL tokens
  private async validateMintAuthorization(mint: string): Promise<PolicyViolation | null> {
    try {
      // In a real implementation, this would check against an authorized mints table
      // For now, we'll allow all mints but log for review
      
      console.log(`🔍 SPL token mint verification: ${mint}`);
      
      return null;
    } catch (error) {
      console.error('Error validating mint:', error);
      return null;
    }
  }

  // Generate recommendations based on violations
  private generateRecommendations(violations: PolicyViolation[], riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore >= 80) {
      recommendations.push('HIGH RISK: Manual review required before processing');
    }

    if (riskScore >= 60) {
      recommendations.push('MEDIUM RISK: Additional verification recommended');
    }

    if (violations.some(v => v.type === PolicyViolationType.AMOUNT_TOO_LOW)) {
      recommendations.push('Ensure payment meets minimum amount requirement (0.99 SOL)');
    }

    if (violations.some(v => v.type === PolicyViolationType.INVALID_DESTINATION)) {
      recommendations.push('Verify treasury address configuration');
    }

    if (violations.some(v => v.type === PolicyViolationType.RATE_LIMIT_EXCEEDED)) {
      recommendations.push('Implement cooling period for this address');
    }

    if (violations.some(v => v.type === PolicyViolationType.SUSPICIOUS_PATTERN)) {
      recommendations.push('Monitor address for automated activity patterns');
    }

    if (recommendations.length === 0 && riskScore > 0) {
      recommendations.push('Monitor transaction for unusual patterns');
    }

    return recommendations;
  }

  // Log policy evaluation for audit trail
  async logPolicyEvaluation(
    context: TransactionContext,
    result: PolicyEvaluationResult
  ): Promise<void> {
    try {
      await this.db.execute({
        sql: `
          INSERT INTO policy_audit_log (
            transaction_signature,
            user_id,
            risk_score,
            violations_count,
            allowed,
            recommendations,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          context.signature,
          context.userId || 'anonymous',
          result.riskScore,
          result.violations.length,
          result.allowed,
          JSON.stringify(result.recommendations),
          Date.now()
        ]
      });

      console.log(`🛡️ Policy Evaluation: ${context.signature} | Risk: ${result.riskScore} | Allowed: ${result.allowed}`);
    } catch (error) {
      console.error('Failed to log policy evaluation:', error);
    }
  }
}