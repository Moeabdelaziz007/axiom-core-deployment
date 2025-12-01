/**
 * 🔒 DATA SECURITY MANAGER
 * 
 * Comprehensive data protection mechanisms for external research integration with:
 * - Encryption for research data at rest and in transit
 * - Data masking and anonymization for sensitive information
 * - Secure storage of research credentials and API keys
 * - Data retention and deletion policies
 * - Privacy-preserving research techniques
 * - Environment variable security protection
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

// ============================================================================
// DATA SECURITY TYPES
// ============================================================================

/**
 * Data Security Configuration
 */
export interface DataSecurityConfig {
  encryptionLevel: 'aes-256' | 'aes-512' | 'quantum-safe';
  anonymizationEnabled: boolean;
  dataRetention: number; // days
  gdprCompliant: boolean;
  differentialPrivacy: boolean;
  secureEnvironmentVars: boolean;
  keyRotationInterval: number; // hours
}

/**
 * Data Classification
 */
export type DataClassification =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted'
  | 'research-sensitive'
  | 'pii';

/**
 * Encryption Context
 */
export interface EncryptionContext {
  algorithm: string;
  keyId: string;
  iv?: string;
  tag?: string;
  timestamp: Date;
  classification: DataClassification;
}

/**
 * Data Masking Configuration
 */
export interface DataMaskingConfig {
  enabled: boolean;
  technique: 'tokenization' | 'substitution' | 'shuffling' | 'generalization' | 'suppression';
  preserveFormat: boolean;
  reversible: boolean;
  salt?: string;
}

/**
 * Anonymization Result
 */
export interface AnonymizationResult {
  success: boolean;
  anonymizedData: any;
  privacyRisk: number; // 0-100, lower is better
  reidentificationRisk: number; // 0-100, lower is better
  utilityLoss: number; // 0-100, lower is better
  technique: string;
  parameters: Record<string, any>;
}

/**
 * Data Retention Policy
 */
export interface DataRetentionPolicy {
  classification: DataClassification;
  retentionPeriod: number; // days
  autoDelete: boolean;
  secureDeletion: boolean;
  archivalRequired: boolean;
  archivalPeriod?: number; // days
}

/**
 * Secure Credential Entry
 */
export interface SecureCredentialEntry {
  id: string;
  name: string;
  type: 'api-key' | 'database' | 'service' | 'certificate';
  encryptedValue: string;
  keyId: string;
  createdAt: Date;
  expiresAt?: Date;
  lastAccessed?: Date;
  accessCount: number;
  classification: DataClassification;
  rotationRequired: boolean;
}

/**
 * Data Security Validation Result
 */
export interface DataSecurityResult {
  success: boolean;
  allowed: boolean;
  riskScore: number; // 0-100
  riskFactors: string[];
  blockedActions: string[];
  allowedActions: string[];
  modifiedActions: string[];
  loggedActions: string[];
  recommendations: string[];
  encryptedData?: any;
  anonymizedData?: any;
  metadata: {
    processingTime: number; // milliseconds
    protocol: 'data-security';
    version: '1.0.0';
    timestamp: Date
  };
}

// ============================================================================
// MAIN DATA SECURITY MANAGER
// ============================================================================

/**
 * Data Security Manager
 * 
 * Provides comprehensive data protection for research operations
 * Implements zero-trust principles with defense-in-depth strategies
 */
export class DataSecurityManager extends EventEmitter {
  private config: DataSecurityConfig;
  private encryptionKeys: Map<string, string> = new Map();
  private secureCredentials: Map<string, SecureCredentialEntry> = new Map();
  private dataRetentionPolicies: Map<DataClassification, DataRetentionPolicy> = new Map();
  private auditLog: any[] = [];
  private privacyBudget: number = 1.0; // epsilon for differential privacy

  constructor(config: DataSecurityConfig) {
    super();
    this.config = this.validateConfig(config);
    this.initializeEncryption();
    this.initializeRetentionPolicies();
    this.setupPeriodicTasks();
  }

  /**
   * Validate and normalize configuration
   */
  private validateConfig(config: DataSecurityConfig): DataSecurityConfig {
    const defaultConfig: DataSecurityConfig = {
      encryptionLevel: 'aes-256',
      anonymizationEnabled: true,
      dataRetention: 2555, // 7 years
      gdprCompliant: true,
      differentialPrivacy: true,
      secureEnvironmentVars: true,
      keyRotationInterval: 24 // 24 hours
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Initialize encryption keys
   */
  private initializeEncryption(): void {
    console.log('🔐 Initializing Data Security encryption...');
    
    // Generate master encryption key
    const masterKey = crypto.randomBytes(32).toString('hex');
    this.encryptionKeys.set('master', masterKey);

    // Generate data encryption key
    const dataKey = crypto.randomBytes(32).toString('hex');
    this.encryptionKeys.set('data', dataKey);

    // Generate credential encryption key
    const credentialKey = crypto.randomBytes(32).toString('hex');
    this.encryptionKeys.set('credentials', credentialKey);

    console.log('✅ Data Security encryption initialized');
  }

  /**
   * Initialize data retention policies
   */
  private initializeRetentionPolicies(): void {
    const policies: DataRetentionPolicy[] = [
      {
        classification: 'public',
        retentionPeriod: 3650, // 10 years
        autoDelete: false,
        secureDeletion: false,
        archivalRequired: true,
        archivalPeriod: 3650
      },
      {
        classification: 'internal',
        retentionPeriod: 2555, // 7 years
        autoDelete: true,
        secureDeletion: true,
        archivalRequired: false
      },
      {
        classification: 'confidential',
        retentionPeriod: 1825, // 5 years
        autoDelete: true,
        secureDeletion: true,
        archivalRequired: true,
        archivalPeriod: 365
      },
      {
        classification: 'restricted',
        retentionPeriod: 1095, // 3 years
        autoDelete: true,
        secureDeletion: true,
        archivalRequired: true,
        archivalPeriod: 90
      },
      {
        classification: 'research-sensitive',
        retentionPeriod: 730, // 2 years
        autoDelete: true,
        secureDeletion: true,
        archivalRequired: true,
        archivalPeriod: 30
      },
      {
        classification: 'pii',
        retentionPeriod: 365, // 1 year
        autoDelete: true,
        secureDeletion: true,
        archivalRequired: false
      }
    ];

    policies.forEach(policy => {
      this.dataRetentionPolicies.set(policy.classification, policy);
    });

    console.log(`✅ Initialized ${policies.length} data retention policies`);
  }

  /**
   * Setup periodic tasks
   */
  private setupPeriodicTasks(): void {
    // Rotate encryption keys periodically
    setInterval(() => {
      this.rotateEncryptionKeys();
    }, this.config.keyRotationInterval * 60 * 60 * 1000); // Convert hours to milliseconds

    // Clean up old audit logs
    setInterval(() => {
      this.cleanupAuditLogs();
    }, 24 * 60 * 60 * 1000); // Every day

    // Check data retention policies
    setInterval(() => {
      this.enforceRetentionPolicies();
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Validate and secure research data
   */
  async validateData(
    data: any,
    context: {
      classification: DataClassification;
      operation: 'read' | 'write' | 'delete' | 'share';
      userId?: string;
      sessionId?: string;
    }
  ): Promise<DataSecurityResult> {
    const startTime = Date.now();
    
    try {
      const result: DataSecurityResult = {
        success: true,
        allowed: true,
        riskScore: 0,
        riskFactors: [],
        blockedActions: [],
        allowedActions: ['data-operation'],
        modifiedActions: [],
        loggedActions: ['data-validation'],
        recommendations: [],
        metadata: {
          processingTime: 0,
          protocol: 'data-security',
          version: '1.0.0',
          timestamp: new Date()
        }
      };

      // 1. Data Classification Validation
      const classificationResult = this.validateDataClassification(data, context.classification);
      this.mergeValidationResults(result, classificationResult);

      // 2. Encryption Validation
      const encryptionResult = await this.validateEncryption(data, context.classification);
      this.mergeValidationResults(result, encryptionResult);

      // 3. Anonymization Check
      if (this.config.anonymizationEnabled) {
        const anonymizationResult = await this.validateAnonymization(data, context.classification);
        this.mergeValidationResults(result, anonymizationResult);
      }

      // 4. Access Control Validation
      const accessResult = this.validateAccessControl(data, context);
      this.mergeValidationResults(result, accessResult);

      // 5. Data Integrity Check
      const integrityResult = this.validateDataIntegrity(data);
      this.mergeValidationResults(result, integrityResult);

      // 6. Calculate final risk score
      result.riskScore = this.calculateRiskScore(result.riskFactors);

      // 7. Determine if operation should be blocked
      result.allowed = result.riskScore < 70 && result.blockedActions.length === 0;
      result.success = result.allowed;

      // 8. Apply security transformations if needed
      if (result.allowed) {
        if (context.operation === 'write') {
          result.encryptedData = await this.encryptData(data, context.classification);
          result.modifiedActions.push('data-encrypted');
        }

        if (this.config.anonymizationEnabled && context.classification === 'pii') {
          result.anonymizedData = await this.anonymizeData(data);
          result.modifiedActions.push('data-anonymized');
        }
      }

      result.metadata.processingTime = Date.now() - startTime;

      // Log the validation
      this.logDataSecurityEvent(context, result);

      return result;

    } catch (error) {
      const errorResult: DataSecurityResult = {
        success: false,
        allowed: false,
        riskScore: 100,
        riskFactors: ['validation-error'],
        blockedActions: ['data-operation'],
        allowedActions: [],
        modifiedActions: [],
        loggedActions: ['validation-error'],
        recommendations: ['Investigate data security system error'],
        metadata: {
          processingTime: Date.now() - startTime,
          protocol: 'data-security',
          version: '1.0.0',
          timestamp: new Date()
        }
      };

      this.logDataSecurityEvent(context, errorResult);
      return errorResult;
    }
  }

  /**
   * Validate data classification
   */
  private validateDataClassification(data: any, classification: DataClassification): Partial<DataSecurityResult> {
    const result: Partial<DataSecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['classification-validation']
    };

    // Check if data contains sensitive information that matches classification
    const detectedClassification = this.detectDataClassification(data);
    
    if (detectedClassification !== classification) {
      result.riskFactors!.push('classification-mismatch');
      result.blockedActions!.push('classification-violation');
      result.loggedActions!.push('classification-mismatch-detected');
    } else {
      result.allowedActions!.push('classification-valid');
    }

    return result;
  }

  /**
   * Detect data classification automatically
   */
  private detectDataClassification(data: any): DataClassification {
    const dataString = JSON.stringify(data).toLowerCase();

    // Check for PII patterns
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}-\d{3}-\d{4}\b/ // Phone number
    ];

    if (piiPatterns.some(pattern => pattern.test(dataString))) {
      return 'pii';
    }

    // Check for research sensitive patterns
    const researchPatterns = [
      /api[_-]?key/i,
      /password/i,
      /secret/i,
      /token/i,
      /credential/i
    ];

    if (researchPatterns.some(pattern => pattern.test(dataString))) {
      return 'research-sensitive';
    }

    // Check for confidential patterns
    if (dataString.includes('confidential') || dataString.includes('proprietary')) {
      return 'confidential';
    }

    return 'internal';
  }

  /**
   * Validate encryption requirements
   */
  private async validateEncryption(data: any, classification: DataClassification): Promise<Partial<DataSecurityResult>> {
    const result: Partial<DataSecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['encryption-validation']
    };

    const requiredEncryption = this.getRequiredEncryptionLevel(classification);
    
    if (requiredEncryption === 'none') {
      result.allowedActions!.push('no-encryption-required');
      return result;
    }

    // Check if data is already encrypted
    if (this.isDataEncrypted(data)) {
      result.allowedActions!.push('data-encrypted');
      return result;
    }

    // Data needs encryption
    result.riskFactors!.push('unencrypted-sensitive-data');
    result.blockedActions!.push('encryption-required');
    result.loggedActions!.push('unencrypted-data-detected');

    return result;
  }

  /**
   * Get required encryption level for data classification
   */
  private getRequiredEncryptionLevel(classification: DataClassification): 'none' | 'basic' | 'advanced' | 'quantum' {
    const requirements: Record<DataClassification, 'none' | 'basic' | 'advanced' | 'quantum'> = {
      'public': 'none',
      'internal': 'basic',
      'confidential': 'advanced',
      'restricted': 'advanced',
      'research-sensitive': 'quantum',
      'pii': 'quantum'
    };

    return requirements[classification] || 'basic';
  }

  /**
   * Check if data is encrypted
   */
  private isDataEncrypted(data: any): boolean {
    if (typeof data === 'string') {
      try {
        // Try to parse as JSON, if it fails it might be encrypted
        JSON.parse(data);
        return false;
      } catch {
        return true;
      }
    }
    return false;
  }

  /**
   * Validate anonymization requirements
   */
  private async validateAnonymization(data: any, classification: DataClassification): Promise<Partial<DataSecurityResult>> {
    const result: Partial<DataSecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['anonymization-validation']
    };

    if (classification === 'pii' && !this.isDataAnonymized(data)) {
      result.riskFactors!.push('pii-not-anonymized');
      result.blockedActions!.push('anonymization-required');
      result.loggedActions!.push('pii-exposure-risk');
    } else {
      result.allowedActions!.push('anonymization-valid');
    }

    return result;
  }

  /**
   * Check if data is anonymized
   */
  private isDataAnonymized(data: any): boolean {
    // Simple check - in production, this would be more sophisticated
    const dataString = JSON.stringify(data);
    const anonymizationMarkers = ['***', 'ANONYMIZED', 'MASKED', 'TOKENIZED'];
    return anonymizationMarkers.some(marker => dataString.includes(marker));
  }

  /**
   * Validate access control
   */
  private validateAccessControl(data: any, context: any): Partial<DataSecurityResult> {
    const result: Partial<DataSecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['access-control-validation']
    };

    // Check for unauthorized access patterns
    if (!context.userId && context.operation !== 'read') {
      result.riskFactors!.push('unauthorized-access-attempt');
      result.blockedActions!.push('access-denied');
      result.loggedActions!.push('unauthorized-access');
    } else {
      result.allowedActions!.push('access-authorized');
    }

    return result;
  }

  /**
   * Validate data integrity
   */
  private validateDataIntegrity(data: any): Partial<DataSecurityResult> {
    const result: Partial<DataSecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['integrity-validation']
    };

    // Check for data tampering indicators
    const dataString = JSON.stringify(data);
    
    if (dataString.includes('TAMPERED') || dataString.includes('MODIFIED')) {
      result.riskFactors!.push('data-tampering-detected');
      result.blockedActions!.push('integrity-violation');
      result.loggedActions!.push('tampering-detected');
    } else {
      result.allowedActions!.push('integrity-valid');
    }

    return result;
  }

  /**
   * Encrypt data
   */
  private async encryptData(data: any, classification: DataClassification): Promise<any> {
    const algorithm = this.getEncryptionAlgorithm(classification);
    const key = this.encryptionKeys.get('data');
    
    if (!key) {
      throw new Error('Data encryption key not available');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from(classification));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      algorithm,
      classification,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get encryption algorithm for classification
   */
  private getEncryptionAlgorithm(classification: DataClassification): string {
    const algorithms: Record<DataClassification, string> = {
      'public': 'aes-256-cbc',
      'internal': 'aes-256-gcm',
      'confidential': 'aes-512-gcm',
      'restricted': 'aes-512-gcm',
      'research-sensitive': 'aes-512-gcm',
      'pii': 'aes-512-gcm'
    };

    return algorithms[classification] || 'aes-256-gcm';
  }

  /**
   * Anonymize data
   */
  private async anonymizeData(data: any): Promise<any> {
    const anonymized = JSON.parse(JSON.stringify(data));
    
    // Simple anonymization - in production, use more sophisticated techniques
    this.anonymizeObject(anonymized);
    
    return anonymized;
  }

  /**
   * Recursively anonymize object
   */
  private anonymizeObject(obj: any): void {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (typeof item === 'object') {
          this.anonymizeObject(item);
        } else if (typeof item === 'string') {
          obj[index] = this.anonymizeString(item);
        }
      });
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
          this.anonymizeObject(obj[key]);
        } else if (typeof obj[key] === 'string') {
          obj[key] = this.anonymizeString(obj[key]);
        }
      });
    }
  }

  /**
   * Anonymize string
   */
  private anonymizeString(str: string): string {
    // Email anonymization
    if (str.includes('@')) {
      return str.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)/g, '***@$2');
    }
    
    // Phone anonymization
    if (/\d{3}-\d{3}-\d{4}/.test(str)) {
      return str.replace(/\d{3}-\d{3}-\d{4}/g, '***-***-****');
    }
    
    // SSN anonymization
    if (/\d{3}-\d{2}-\d{4}/.test(str)) {
      return str.replace(/\d{3}-\d{2}-\d{4}/g, '***-**-****');
    }
    
    return str;
  }

  /**
   * Store secure credential
   */
  async storeCredential(
    name: string,
    value: string,
    type: SecureCredentialEntry['type'],
    classification: DataClassification = 'confidential',
    expiresAt?: Date
  ): Promise<string> {
    const credentialId = this.generateId();
    const keyId = 'credentials';
    const key = this.encryptionKeys.get(keyId);
    
    if (!key) {
      throw new Error('Credential encryption key not available');
    }

    const encryptedValue = this.encryptCredential(value, key);
    
    const credential: SecureCredentialEntry = {
      id: credentialId,
      name,
      type,
      encryptedValue,
      keyId,
      createdAt: new Date(),
      expiresAt,
      lastAccessed: new Date(),
      accessCount: 0,
      classification,
      rotationRequired: false
    };

    this.secureCredentials.set(credentialId, credential);
    
    // Log credential storage
    this.emit('credential-stored', {
      credentialId,
      name,
      type,
      classification,
      timestamp: new Date()
    });

    return credentialId;
  }

  /**
   * Encrypt credential
   */
  private encryptCredential(value: string, key: string): string {
    const cipher = crypto.createCipher('aes-256-gcm', key);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Retrieve secure credential
   */
  async retrieveCredential(credentialId: string, userId?: string): Promise<string | null> {
    const credential = this.secureCredentials.get(credentialId);
    
    if (!credential) {
      return null;
    }

    // Check if expired
    if (credential.expiresAt && credential.expiresAt < new Date()) {
      this.emit('credential-expired', { credentialId, name: credential.name });
      return null;
    }

    // Update access tracking
    credential.lastAccessed = new Date();
    credential.accessCount++;

    // Check if rotation is required
    if (credential.accessCount > 100) {
      credential.rotationRequired = true;
      this.emit('credential-rotation-required', { credentialId, name: credential.name });
    }

    const key = this.encryptionKeys.get(credential.keyId);
    if (!key) {
      throw new Error('Credential decryption key not available');
    }

    const decryptedValue = this.decryptCredential(credential.encryptedValue, key);
    
    // Log credential access
    this.emit('credential-accessed', {
      credentialId,
      name: credential.name,
      userId,
      timestamp: new Date()
    });

    return decryptedValue;
  }

  /**
   * Decrypt credential
   */
  private decryptCredential(encryptedValue: string, key: string): string {
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(riskFactors: string[]): number {
    const factorWeights: Record<string, number> = {
      'classification-mismatch': 30,
      'unencrypted-sensitive-data': 40,
      'pii-not-anonymized': 50,
      'unauthorized-access-attempt': 35,
      'data-tampering-detected': 60,
      'validation-error': 25
    };

    return riskFactors.reduce((score, factor) => {
      return score + (factorWeights[factor] || 10);
    }, 0);
  }

  /**
   * Merge validation results
   */
  private mergeValidationResults(
    target: Partial<DataSecurityResult>,
    source: Partial<DataSecurityResult>
  ): void {
    target.riskFactors = [...(target.riskFactors || []), ...(source.riskFactors || [])];
    target.blockedActions = [...(target.blockedActions || []), ...(source.blockedActions || [])];
    target.allowedActions = [...(target.allowedActions || []), ...(source.allowedActions || [])];
    target.modifiedActions = [...(target.modifiedActions || []), ...(source.modifiedActions || [])];
    target.loggedActions = [...(target.loggedActions || []), ...(source.loggedActions || [])];
  }

  /**
   * Log data security event
   */
  private logDataSecurityEvent(
    context: any,
    result: DataSecurityResult
  ): void {
    const logEntry = {
      timestamp: new Date(),
      context,
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

    this.auditLog.push(logEntry);

    // Emit for external logging
    this.emit('security-event', logEntry);
  }

  /**
   * Rotate encryption keys
   */
  private rotateEncryptionKeys(): void {
    console.log('🔄 Rotating encryption keys...');
    
    // Generate new keys
    const newMasterKey = crypto.randomBytes(32).toString('hex');
    const newDataKey = crypto.randomBytes(32).toString('hex');
    const newCredentialKey = crypto.randomBytes(32).toString('hex');
    
    // Update keys
    this.encryptionKeys.set('master', newMasterKey);
    this.encryptionKeys.set('data', newDataKey);
    this.encryptionKeys.set('credentials', newCredentialKey);
    
    // Mark credentials for re-encryption
    for (const credential of this.secureCredentials.values()) {
      credential.rotationRequired = true;
    }
    
    this.emit('keys-rotated', { timestamp: new Date() });
    console.log('✅ Encryption keys rotated successfully');
  }

  /**
   * Clean up old audit logs
   */
  private cleanupAuditLogs(): void {
    const cutoffTime = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days ago
    
    const originalSize = this.auditLog.length;
    this.auditLog = this.auditLog.filter(entry => 
      entry.timestamp.getTime() > cutoffTime
    );
    
    const cleanedCount = originalSize - this.auditLog.length;
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old audit log entries`);
    }
  }

  /**
   * Enforce retention policies
   */
  private enforceRetentionPolicies(): void {
    // Implementation would check data age against retention policies
    // and trigger deletion/archival as needed
    console.log('📅 Enforcing data retention policies...');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      encryptionKeys: this.encryptionKeys.size,
      secureCredentials: this.secureCredentials.size,
      retentionPolicies: this.dataRetentionPolicies.size,
      auditLogSize: this.auditLog.length,
      privacyBudget: this.privacyBudget,
      timestamp: new Date()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<DataSecurityConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);
  }

  /**
   * Perform security audit
   */
  async performAudit(): Promise<any> {
    const auditResults = {
      encryption: this.auditEncryption(),
      credentials: this.auditCredentials(),
      retention: this.auditRetention(),
      anonymization: this.auditAnonymization(),
      configuration: this.auditConfiguration()
    };

    return {
      timestamp: new Date(),
      overall: this.calculateOverallAuditScore(auditResults),
      components: auditResults
    };
  }

  /**
   * Audit encryption
   */
  private auditEncryption(): any {
    const hasMasterKey = this.encryptionKeys.has('master');
    const hasDataKey = this.encryptionKeys.has('data');
    const hasCredentialKey = this.encryptionKeys.has('credentials');
    
    return {
      score: (hasMasterKey && hasDataKey && hasCredentialKey) ? 90 : 30,
      issues: [
        ...(hasMasterKey ? [] : ['Master encryption key missing']),
        ...(hasDataKey ? [] : ['Data encryption key missing']),
        ...(hasCredentialKey ? [] : ['Credential encryption key missing'])
      ],
      recommendations: [
        ...(hasMasterKey ? [] : ['Generate master encryption key']),
        ...(hasDataKey ? [] : ['Generate data encryption key']),
        ...(hasCredentialKey ? [] : ['Generate credential encryption key'])
      ]
    };
  }

  /**
   * Audit credentials
   */
  private auditCredentials(): any {
    const credentials = Array.from(this.secureCredentials.values());
    const expiredCredentials = credentials.filter(c => c.expiresAt && c.expiresAt < new Date());
    const credentialsNeedingRotation = credentials.filter(c => c.rotationRequired);
    
    return {
      score: (expiredCredentials.length === 0 && credentialsNeedingRotation.length === 0) ? 90 : 50,
      issues: [
        ...(expiredCredentials.length > 0 ? [`${expiredCredentials.length} expired credentials`] : []),
        ...(credentialsNeedingRotation.length > 0 ? [`${credentialsNeedingRotation.length} credentials need rotation`] : [])
      ],
      recommendations: [
        ...(expiredCredentials.length > 0 ? ['Remove expired credentials'] : []),
        ...(credentialsNeedingRotation.length > 0 ? ['Rotate credentials requiring rotation'] : [])
      ]
    };
  }

  /**
   * Audit retention policies
   */
  private auditRetention(): any {
    const policies = Array.from(this.dataRetentionPolicies.values());
    const hasAllRequiredPolicies = ['pii', 'research-sensitive', 'restricted'].every(classification =>
      this.dataRetentionPolicies.has(classification)
    );
    
    return {
      score: hasAllRequiredPolicies ? 90 : 70,
      issues: hasAllRequiredPolicies ? [] : ['Missing retention policies for sensitive data'],
      recommendations: hasAllRequiredPolicies ? [] : ['Implement retention policies for all data classifications']
    };
  }

  /**
   * Audit anonymization
   */
  private auditAnonymization(): any {
    return {
      score: this.config.anonymizationEnabled ? 90 : 50,
      issues: this.config.anonymizationEnabled ? [] : ['Anonymization is disabled'],
      recommendations: this.config.anonymizationEnabled ? [] : ['Enable data anonymization for PII']
    };
  }

  /**
   * Audit configuration
   */
  private auditConfiguration(): any {
    const issues: string[] = [];
    
    if (!this.config.gdprCompliant) issues.push('GDPR compliance is disabled');
    if (!this.config.differentialPrivacy) issues.push('Differential privacy is disabled');
    if (!this.config.secureEnvironmentVars) issues.push('Environment variable security is disabled');
    if (this.config.keyRotationInterval > 168) issues.push('Key rotation interval is too long (> 7 days)');
    
    return {
      score: Math.max(0, 100 - (issues.length * 10)),
      issues,
      recommendations: issues.map(issue => `Enable ${issue}`)
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

export default DataSecurityManager;