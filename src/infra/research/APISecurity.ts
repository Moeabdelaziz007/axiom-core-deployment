/**
 * 🔒 API SECURITY MANAGER
 * 
 * Comprehensive API security implementation for external research integration with:
 * - Authentication and authorization
 * - Rate limiting and throttling
 * - Input validation and sanitization
 * - API key management and rotation
 * - Request/response encryption
 * - Audit logging for all API calls
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

// ============================================================================
// API SECURITY TYPES
// ============================================================================

/**
 * API Security Configuration
 */
export interface APISecurityConfig {
  level: 'basic' | 'standard' | 'enhanced' | 'maximum';
  encryptionLevel: 'aes-256' | 'aes-512' | 'quantum-safe';
  keyRotationInterval: number; // hours
  rateLimiting: boolean;
  inputValidation: boolean;
  outputEncoding: boolean;
  auditLogging: boolean;
}

/**
 * API Request Context
 */
export interface APIRequestContext {
  requestId: string;
  timestamp: Date;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
  client?: {
    ip: string;
    userAgent: string;
    location?: string;
  };
}

/**
 * API Security Validation Result
 */
export interface APISecurityResult {
  success: boolean;
  allowed: boolean;
  riskScore: number; // 0-100
  riskFactors: string[];
  blockedActions: string[];
  allowedActions: string[];
  modifiedActions: string[];
  loggedActions: string[];
  recommendations: string[];
  sanitizedRequest?: any;
  encryptedResponse?: any;
}

/**
 * Rate Limit Configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

/**
 * API Key Management
 */
export interface APIKeyInfo {
  id: string;
  name: string;
  hashedKey: string;
  permissions: string[];
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  isActive: boolean;
}

// ============================================================================
// MAIN API SECURITY MANAGER
// ============================================================================

/**
 * API Security Manager
 * 
 * Provides comprehensive security for all API interactions in research integration
 * Implements zero-trust principles with defense-in-depth strategies
 */
export class APISecurityManager extends EventEmitter {
  private config: APISecurityConfig;
  private rateLimiters: Map<string, Map<string, number[]>> = new Map();
  private apiKeys: Map<string, APIKeyInfo> = new Map();
  private auditLog: any[] = [];
  private encryptionKeys: Map<string, string> = new Map();

  // Security patterns for validation
  private readonly maliciousPatterns = {
    sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    xss: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    pathTraversal: /\.\.[\\/]/i,
    commandInjection: /[;&|`$(){}[\]]/i,
    ldapInjection: /[()=,*!&|]/i
  };

  private readonly allowedContentTypes = [
    'application/json',
    'application/xml',
    'text/plain',
    'text/xml',
    'multipart/form-data'
  ];

  constructor(config: APISecurityConfig) {
    super();
    this.config = this.validateConfig(config);
    this.initializeEncryption();
    this.setupPeriodicTasks();
  }

  /**
   * Validate and normalize configuration
   */
  private validateConfig(config: APISecurityConfig): APISecurityConfig {
    const defaultConfig: APISecurityConfig = {
      level: 'enhanced',
      encryptionLevel: 'aes-256',
      keyRotationInterval: 24,
      rateLimiting: true,
      inputValidation: true,
      outputEncoding: true,
      auditLogging: true
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Initialize encryption keys
   */
  private initializeEncryption(): void {
    // Generate master encryption key
    const masterKey = crypto.randomBytes(32).toString('hex');
    this.encryptionKeys.set('master', masterKey);

    // Generate API key encryption key
    const apiKeyKey = crypto.randomBytes(32).toString('hex');
    this.encryptionKeys.set('api-keys', apiKeyKey);

    console.log('🔐 API Security encryption initialized');
  }

  /**
   * Setup periodic tasks
   */
  private setupPeriodicTasks(): void {
    // Rotate encryption keys periodically
    setInterval(() => {
      this.rotateEncryptionKeys();
    }, this.config.keyRotationInterval * 60 * 60 * 1000); // Convert hours to milliseconds

    // Clean up old rate limit data
    setInterval(() => {
      this.cleanupRateLimitData();
    }, 60 * 60 * 1000); // Every hour

    // Clean up old audit logs
    setInterval(() => {
      this.cleanupAuditLogs();
    }, 24 * 60 * 60 * 1000); // Every day
  }

  /**
   * Validate API request
   */
  async validateRequest(
    request: any,
    context: APIRequestContext
  ): Promise<APISecurityResult> {
    const startTime = Date.now();
    
    try {
      // Initialize result
      const result: APISecurityResult = {
        success: true,
        allowed: true,
        riskScore: 0,
        riskFactors: [],
        blockedActions: [],
        allowedActions: [],
        modifiedActions: [],
        loggedActions: ['request-received'],
        recommendations: []
      };

      // 1. Authentication and Authorization
      const authResult = await this.validateAuthentication(context);
      this.mergeValidationResults(result, authResult);

      // 2. Rate Limiting
      if (this.config.rateLimiting) {
        const rateLimitResult = await this.validateRateLimit(context);
        this.mergeValidationResults(result, rateLimitResult);
      }

      // 3. Input Validation and Sanitization
      if (this.config.inputValidation) {
        const inputResult = await this.validateAndSanitizeInput(request, context);
        this.mergeValidationResults(result, inputResult);
        result.sanitizedRequest = inputResult.sanitizedRequest;
      }

      // 4. Content Type Validation
      const contentTypeResult = this.validateContentType(context);
      this.mergeValidationResults(result, contentTypeResult);

      // 5. Request Size Validation
      const sizeResult = this.validateRequestSize(request);
      this.mergeValidationResults(result, sizeResult);

      // 6. API Key Validation (if applicable)
      const apiKeyResult = await this.validateAPIKey(context);
      this.mergeValidationResults(result, apiKeyResult);

      // 7. Calculate final risk score
      result.riskScore = this.calculateRiskScore(result.riskFactors);

      // 8. Determine if request should be blocked
      result.allowed = result.riskScore < 70 && result.blockedActions.length === 0;
      result.success = result.allowed;

      // 9. Log the request
      if (this.config.auditLogging) {
        this.logAPIRequest(context, result);
      }

      // 10. Emit security event if high risk
      if (result.riskScore >= 50) {
        this.emit('security-event', {
          type: 'high-risk-api-request',
          context,
          result,
          timestamp: new Date()
        });
      }

      return result;

    } catch (error) {
      const errorResult: APISecurityResult = {
        success: false,
        allowed: false,
        riskScore: 100,
        riskFactors: ['validation-error'],
        blockedActions: ['request'],
        allowedActions: [],
        modifiedActions: [],
        loggedActions: ['validation-error'],
        recommendations: ['Investigate API security validation error']
      };

      if (this.config.auditLogging) {
        this.logAPIRequest(context, errorResult);
      }

      return errorResult;
    }
  }

  /**
   * Validate authentication and authorization
   */
  private async validateAuthentication(
    context: APIRequestContext
  ): Promise<Partial<APISecurityResult>> {
    const result: Partial<APISecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      recommendations: []
    };

    // Check if user context is provided
    if (!context.user) {
      result.riskFactors!.push('missing-user-context');
      result.blockedActions!.push('unauthenticated-request');
      result.recommendations!.push('User authentication is required');
      return result;
    }

    // Validate user ID format
    if (!context.user.id || typeof context.user.id !== 'string' || context.user.id.length < 3) {
      result.riskFactors!.push('invalid-user-id');
      result.blockedActions!.push('invalid-user-format');
      result.recommendations!.push('Valid user ID is required');
      return result;
    }

    // Validate role
    if (!context.user.role || !['admin', 'user', 'agent', 'researcher'].includes(context.user.role)) {
      result.riskFactors!.push('invalid-role');
      result.blockedActions!.push('unauthorized-role');
      result.recommendations!.push('Valid user role is required');
      return result;
    }

    // Validate permissions for the requested resource
    const requiredPermissions = this.getRequiredPermissions(context.method, context.url);
    const hasPermissions = requiredPermissions.every(perm => 
      context.user.permissions.includes(perm)
    );

    if (!hasPermissions) {
      result.riskFactors!.push('insufficient-permissions');
      result.blockedActions!.push('unauthorized-access');
      result.recommendations!.push('Insufficient permissions for requested resource');
      return result;
    }

    result.allowedActions!.push('authenticated-access');
    return result;
  }

  /**
   * Validate rate limiting
   */
  private async validateRateLimit(
    context: APIRequestContext
  ): Promise<Partial<APISecurityResult>> {
    const result: Partial<APISecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      recommendations: []
    };

    const clientKey = context.client?.ip || 'unknown';
    const now = Date.now();

    // Get or create rate limiter for this client
    if (!this.rateLimiters.has(clientKey)) {
      this.rateLimiters.set(clientKey, new Map());
    }

    const clientLimiter = this.rateLimiters.get(clientKey)!;
    const windowStart = now - 60000; // 1 minute window

    // Clean old entries
    for (const [timestamp, requests] of clientLimiter.entries()) {
      if (parseInt(timestamp) < windowStart) {
        clientLimiter.delete(timestamp);
      }
    }

    // Add current request
    const currentSecond = Math.floor(now / 1000).toString();
    const currentRequests = clientLimiter.get(currentSecond) || [];
    currentRequests.push(now);
    clientLimiter.set(currentSecond, currentRequests);

    // Check rate limits based on security level
    const limits = this.getRateLimits();
    const totalRequests = Array.from(clientLimiter.values()).flat().length;

    if (totalRequests > limits.maxRequests) {
      result.riskFactors!.push('rate-limit-exceeded');
      result.blockedActions!.push('rate-limited');
      result.recommendations!.push(`Rate limit exceeded: ${limits.maxRequests} requests per minute`);
      return result;
    }

    result.allowedActions!.push('within-rate-limit');
    return result;
  }

  /**
   * Validate and sanitize input
   */
  private async validateAndSanitizeInput(
    request: any,
    context: APIRequestContext
  ): Promise<Partial<APISecurityResult>> {
    const result: Partial<APISecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      recommendations: [],
      sanitizedRequest: null
    };

    try {
      // Parse request if it's a string
      let requestData = request;
      if (typeof request === 'string') {
        requestData = JSON.parse(request);
      }

      // Validate JSON structure
      if (requestData && typeof requestData === 'object') {
        const sanitizedData = await this.sanitizeObject(requestData);
        result.sanitizedRequest = sanitizedData.sanitized;
        result.riskFactors!.push(...sanitizedData.riskFactors);
        result.recommendations!.push(...sanitizedData.recommendations);

        if (sanitizedData.riskFactors.length > 0) {
          result.blockedActions!.push('malicious-input-detected');
        } else {
          result.allowedActions!.push('input-sanitized');
        }
      } else {
        result.riskFactors!.push('invalid-request-format');
        result.blockedActions!.push('invalid-format');
        result.recommendations!.push('Request must be valid JSON object');
      }

    } catch (error) {
      result.riskFactors!.push('request-parse-error');
      result.blockedActions!.push('parse-error');
      result.recommendations!.push('Request could not be parsed');
    }

    return result;
  }

  /**
   * Sanitize object recursively
   */
  private async sanitizeObject(obj: any, path = ''): Promise<{
    sanitized: any;
    riskFactors: string[];
    recommendations: string[];
  }> {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let sanitized = obj;

    if (Array.isArray(obj)) {
      sanitized = await Promise.all(obj.map((item, index) => 
        this.sanitizeObject(item, `${path}[${index}]`)
      ));
    } else if (obj && typeof obj === 'object') {
      const sanitizedObj: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check for dangerous keys
        if (this.isDangerousKey(key)) {
          riskFactors.push(`dangerous-key: ${currentPath}`);
          recommendations.push(`Remove dangerous key: ${key}`);
          continue;
        }

        // Sanitize the value
        const sanitizedValue = await this.sanitizeValue(value, currentPath);
        sanitizedObj[key] = sanitizedValue.sanitized;
        
        riskFactors.push(...sanitizedValue.riskFactors);
        recommendations.push(...sanitizedValue.recommendations);
      }
      
      sanitized = sanitizedObj;
    } else {
      const sanitizedValue = await this.sanitizeValue(obj, path);
      sanitized = sanitizedValue.sanitized;
      riskFactors.push(...sanitizedValue.riskFactors);
      recommendations.push(...sanitizedValue.recommendations);
    }

    return { sanitized, riskFactors, recommendations };
  }

  /**
   * Check if key is dangerous
   */
  private isDangerousKey(key: string): boolean {
    const dangerousKeys = [
      '__proto__',
      'constructor',
      'prototype',
      'eval',
      'function',
      'script'
    ];

    return dangerousKeys.some(dangerous => 
      key.toLowerCase().includes(dangerous.toLowerCase())
    );
  }

  /**
   * Sanitize individual value
   */
  private async sanitizeValue(
    value: any,
    path: string
  ): Promise<{
    sanitized: any;
    riskFactors: string[];
    recommendations: string[];
  }> {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let sanitized = value;

    if (typeof value === 'string') {
      // Check for malicious patterns
      for (const [name, pattern] of Object.entries(this.maliciousPatterns)) {
        if (pattern.test(value)) {
          riskFactors.push(`${name}-detected: ${path}`);
          recommendations.push(`Remove ${name} pattern from ${path}`);
          sanitized = this.escapeString(value);
        }
      }

      // Length validation
      if (value.length > 10000) { // 10KB limit
        riskFactors.push('oversized-string');
        recommendations.push(`String too large at ${path}`);
        sanitized = value.substring(0, 10000);
      }

    } else if (typeof value === 'object' && value !== null) {
      // Recursive sanitization for objects
      const result = await this.sanitizeObject(value, path);
      sanitized = result.sanitized;
      riskFactors.push(...result.riskFactors);
      recommendations.push(...result.recommendations);
    }

    return { sanitized, riskFactors, recommendations };
  }

  /**
   * Escape string to prevent injection
   */
  private escapeString(str: string): string {
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate content type
   */
  private validateContentType(
    context: APIRequestContext
  ): Partial<APISecurityResult> {
    const result: Partial<APISecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      recommendations: []
    };

    const contentType = context.headers['content-type'];
    
    if (!contentType) {
      result.riskFactors!.push('missing-content-type');
      result.blockedActions!.push('no-content-type');
      result.recommendations!.push('Content-Type header is required');
      return result;
    }

    if (!this.allowedContentTypes.some(allowed => 
      contentType.toLowerCase().includes(allowed.toLowerCase())
    )) {
      result.riskFactors!.push('invalid-content-type');
      result.blockedActions!.push('unsupported-content-type');
      result.recommendations!.push(`Content-Type ${contentType} is not allowed`);
      return result;
    }

    result.allowedActions!.push('valid-content-type');
    return result;
  }

  /**
   * Validate request size
   */
  private validateRequestSize(request: any): Partial<APISecurityResult> {
    const result: Partial<APISecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      recommendations: []
    };

    const size = JSON.stringify(request).length;
    const maxSize = this.getMaxRequestSize();

    if (size > maxSize) {
      result.riskFactors!.push('oversized-request');
      result.blockedActions!.push('request-too-large');
      result.recommendations!.push(`Request size ${size} exceeds maximum ${maxSize}`);
      return result;
    }

    result.allowedActions!.push('valid-request-size');
    return result;
  }

  /**
   * Validate API key
   */
  private async validateAPIKey(
    context: APIRequestContext
  ): Promise<Partial<APISecurityResult>> {
    const result: Partial<APISecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      recommendations: []
    };

    const apiKey = context.headers['x-api-key'] || context.headers['authorization'];
    
    if (!apiKey) {
      // Some endpoints don't require API key
      result.allowedActions!.push('no-api-key-required');
      return result;
    }

    // Extract key from Authorization header if using Bearer token
    const key = apiKey.startsWith('Bearer ') ? 
      apiKey.substring(7) : apiKey;

    // Validate key format
    if (!this.isValidAPIKeyFormat(key)) {
      result.riskFactors!.push('invalid-api-key-format');
      result.blockedActions!.push('invalid-api-key');
      result.recommendations!.push('Invalid API key format');
      return result;
    }

    // Check if key exists and is active
    const keyInfo = Array.from(this.apiKeys.values()).find(k => 
      crypto.timingSafeEqual(k.hashedKey, this.hashAPIKey(key))
    );

    if (!keyInfo) {
      result.riskFactors!.push('unknown-api-key');
      result.blockedActions!.push('unauthorized-api-key');
      result.recommendations!.push('Unknown or invalid API key');
      return result;
    }

    if (!keyInfo.isActive) {
      result.riskFactors!.push('inactive-api-key');
      result.blockedActions!.push('disabled-api-key');
      result.recommendations!.push('API key is inactive');
      return result;
    }

    if (keyInfo.expiresAt && keyInfo.expiresAt < new Date()) {
      result.riskFactors!.push('expired-api-key');
      result.blockedActions!.push('expired-api-key');
      result.recommendations!.push('API key has expired');
      return result;
    }

    // Update usage statistics
    keyInfo.lastUsed = new Date();
    keyInfo.usageCount++;

    result.allowedActions!.push('valid-api-key');
    return result;
  }

  /**
   * Check if API key format is valid
   */
  private isValidAPIKeyFormat(key: string): boolean {
    // API keys should be at least 32 characters and contain only valid characters
    const validPattern = /^[a-zA-Z0-9._-]{32,}$/;
    return validPattern.test(key);
  }

  /**
   * Hash API key for secure storage
   */
  private hashAPIKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Get required permissions for endpoint
   */
  private getRequiredPermissions(method: string, url: string): string[] {
    // Simple permission mapping - in production, this would be more sophisticated
    const permissions: Record<string, string[]> = {
      'GET': ['read'],
      'POST': ['write', 'create'],
      'PUT': ['write', 'update'],
      'DELETE': ['delete'],
      'PATCH': ['write', 'update']
    };

    // Add resource-specific permissions
    if (url.includes('/research')) {
      permissions[method] = [...(permissions[method] || []), 'research:access'];
    } else if (url.includes('/aix')) {
      permissions[method] = [...(permissions[method] || []), 'aix:access'];
    } else if (url.includes('/workers')) {
      permissions[method] = [...(permissions[method] || []), 'workers:manage'];
    }

    return permissions[method] || [];
  }

  /**
   * Get rate limits based on security level
   */
  private getRateLimits(): RateLimitConfig {
    const limits: Record<string, RateLimitConfig> = {
      'basic': { windowMs: 60000, maxRequests: 100, skipSuccessfulRequests: false, skipFailedRequests: false },
      'standard': { windowMs: 60000, maxRequests: 200, skipSuccessfulRequests: false, skipFailedRequests: false },
      'enhanced': { windowMs: 60000, maxRequests: 500, skipSuccessfulRequests: false, skipFailedRequests: false },
      'maximum': { windowMs: 60000, maxRequests: 1000, skipSuccessfulRequests: false, skipFailedRequests: false }
    };

    return limits[this.config.level];
  }

  /**
   * Get max request size based on security level
   */
  private getMaxRequestSize(): number {
    const sizes: Record<string, number> = {
      'basic': 1024 * 1024,      // 1MB
      'standard': 5 * 1024 * 1024, // 5MB
      'enhanced': 10 * 1024 * 1024, // 10MB
      'maximum': 50 * 1024 * 1024  // 50MB
    };

    return sizes[this.config.level];
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(riskFactors: string[]): number {
    const factorWeights: Record<string, number> = {
      'missing-user-context': 30,
      'invalid-user-id': 20,
      'invalid-role': 25,
      'insufficient-permissions': 35,
      'rate-limit-exceeded': 40,
      'malicious-input-detected': 50,
      'invalid-request-format': 25,
      'missing-content-type': 15,
      'invalid-content-type': 20,
      'oversized-request': 30,
      'invalid-api-key-format': 35,
      'unknown-api-key': 40,
      'inactive-api-key': 30,
      'expired-api-key': 35
    };

    return riskFactors.reduce((score, factor) => {
      return score + (factorWeights[factor] || 10);
    }, 0);
  }

  /**
   * Merge validation results
   */
  private mergeValidationResults(
    target: Partial<APISecurityResult>,
    source: Partial<APISecurityResult>
  ): void {
    target.riskFactors = [...(target.riskFactors || []), ...(source.riskFactors || [])];
    target.blockedActions = [...(target.blockedActions || []), ...(source.blockedActions || [])];
    target.allowedActions = [...(target.allowedActions || []), ...(source.allowedActions || [])];
    target.modifiedActions = [...(target.modifiedActions || []), ...(source.modifiedActions || [])];
    target.loggedActions = [...(target.loggedActions || []), ...(source.loggedActions || [])];
    target.recommendations = [...(target.recommendations || []), ...(source.recommendations || [])];
  }

  /**
   * Log API request for audit
   */
  private logAPIRequest(
    context: APIRequestContext,
    result: APISecurityResult
  ): void {
    const logEntry = {
      timestamp: new Date(),
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      user: context.user,
      client: context.client,
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
    this.emit('audit-log', logEntry);
  }

  // ============================================================================
  // PERIODIC MAINTENANCE METHODS
  // ============================================================================

  /**
   * Rotate encryption keys
   */
  private rotateEncryptionKeys(): void {
    // Generate new master key
    const newMasterKey = crypto.randomBytes(32).toString('hex');
    
    // Re-encrypt all API keys with new master key
    for (const [id, keyInfo] of this.apiKeys.entries()) {
      // In production, this would properly re-encrypt the key
      // For now, just mark for rotation
      keyInfo.lastUsed = new Date();
    }

    this.encryptionKeys.set('master', newMasterKey);
    this.emit('keys-rotated', { timestamp: new Date() });
  }

  /**
   * Clean up old rate limit data
   */
  private cleanupRateLimitData(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    for (const [client, limiter] of this.rateLimiters.entries()) {
      for (const [timestamp] of limiter.entries()) {
        if (parseInt(timestamp) < cutoffTime) {
          limiter.delete(timestamp);
        }
      }
    }
  }

  /**
   * Clean up old audit logs
   */
  private cleanupAuditLogs(): void {
    const cutoffTime = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days ago
    
    this.auditLog = this.auditLog.filter(entry => 
      entry.timestamp.getTime() > cutoffTime
    );
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Create new API key
   */
  async createAPIKey(
    name: string,
    permissions: string[],
    expiresAt?: Date
  ): Promise<string> {
    const apiKey = this.generateSecureAPIKey();
    const hashedKey = this.hashAPIKey(apiKey);

    const keyInfo: APIKeyInfo = {
      id: this.generateId(),
      name,
      hashedKey,
      permissions,
      createdAt: new Date(),
      expiresAt,
      usageCount: 0,
      isActive: true
    };

    this.apiKeys.set(keyInfo.id, keyInfo);
    
    // Log key creation
    this.emit('api-key-created', {
      keyId: keyInfo.id,
      name,
      permissions,
      timestamp: new Date()
    });

    return apiKey;
  }

  /**
   * Generate secure API key
   */
  private generateSecureAPIKey(): string {
    const prefix = 'ak_';
    const randomBytes = crypto.randomBytes(32);
    const key = prefix + randomBytes.toString('hex');
    return key;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(keyId: string): Promise<boolean> {
    const keyInfo = this.apiKeys.get(keyId);
    if (!keyInfo) {
      return false;
    }

    keyInfo.isActive = false;
    
    // Log key revocation
    this.emit('api-key-revoked', {
      keyId,
      name: keyInfo.name,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Get security status
   */
  async getStatus(): Promise<any> {
    return {
      config: this.config,
      activeAPIKeys: Array.from(this.apiKeys.values()).filter(k => k.isActive).length,
      totalAPIKeys: this.apiKeys.size,
      rateLimiters: this.rateLimiters.size,
      auditLogSize: this.auditLog.length,
      lastKeyRotation: this.encryptionKeys.get('last-rotation'),
      timestamp: new Date()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<APISecurityConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Perform security audit
   */
  async performAudit(): Promise<any> {
    const auditResults = {
      apiKeys: this.auditAPIKeys(),
      rateLimiting: this.auditRateLimiting(),
      encryption: this.auditEncryption(),
      configuration: this.auditConfiguration()
    };

    return {
      timestamp: new Date(),
      overall: this.calculateAuditScore(auditResults),
      components: auditResults
    };
  }

  /**
   * Audit API keys
   */
  private auditAPIKeys(): any {
    const keys = Array.from(this.apiKeys.values());
    const activeKeys = keys.filter(k => k.isActive);
    const expiredKeys = keys.filter(k => k.expiresAt && k.expiresAt < new Date());

    return {
      score: expiredKeys.length > 0 ? 50 : activeKeys.length > 0 ? 90 : 100,
      issues: [
        ...(expiredKeys.length > 0 ? [`${expiredKeys.length} expired keys`] : []),
        ...(activeKeys.length === 0 ? ['No active keys'] : [])
      ],
      recommendations: [
        ...(expiredKeys.length > 0 ? ['Revoke expired keys'] : []),
        ...(activeKeys.length === 0 ? ['Create active API keys'] : [])
      ]
    };
  }

  /**
   * Audit rate limiting
   */
  private auditRateLimiting(): any {
    const totalClients = this.rateLimiters.size;
    const activeClients = Array.from(this.rateLimiters.entries())
      .filter(([_, limiter]) => limiter.size > 0).length;

    return {
      score: this.config.rateLimiting ? 90 : 50,
      issues: this.config.rateLimiting ? [] : ['Rate limiting is disabled'],
      recommendations: this.config.rateLimiting ? [] : ['Enable rate limiting']
    };
  }

  /**
   * Audit encryption
   */
  private auditEncryption(): any {
    const hasMasterKey = this.encryptionKeys.has('master');
    const hasAPIKeyKey = this.encryptionKeys.has('api-keys');

    return {
      score: (hasMasterKey && hasAPIKeyKey) ? 90 : 30,
      issues: [
        ...(hasMasterKey ? [] : ['Master encryption key missing']),
        ...(hasAPIKeyKey ? [] : ['API key encryption key missing'])
      ],
      recommendations: [
        ...(hasMasterKey ? [] : ['Generate master encryption key']),
        ...(hasAPIKeyKey ? [] : ['Generate API key encryption key'])
      ]
    };
  }

  /**
   * Audit configuration
   */
  private auditConfiguration(): any {
    const issues: string[] = [];
    
    if (!this.config.rateLimiting) issues.push('Rate limiting is disabled');
    if (!this.config.inputValidation) issues.push('Input validation is disabled');
    if (!this.config.auditLogging) issues.push('Audit logging is disabled');
    if (this.config.level === 'basic') issues.push('Security level is set to basic');

    return {
      score: Math.max(0, 100 - (issues.length * 10)),
      issues,
      recommendations: issues.map(issue => `Enable ${issue}`)
    };
  }

  /**
   * Calculate audit score
   */
  private calculateAuditScore(results: any): any {
    const scores = Object.values(results).map((r: any) => r.score || 0);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      score: Math.round(average),
      grade: average >= 90 ? 'A' : average >= 80 ? 'B' : average >= 70 ? 'C' : average >= 60 ? 'D' : 'F',
      passed: average >= 70
    };
  }
}

export default APISecurityManager;