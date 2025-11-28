/**
 * 🛡️ AXIOM AGENT SECURITY FRAMEWORK
 * 
 * Comprehensive security and permissions system for Axiom ecosystem with:
 * - Role-Based Access Control (RBAC)
 * - Security Monitoring & Compliance
 * - Data Protection & Privacy
 * - Agent Identity & Authentication
 * - Infrastructure Security
 * - Compliance & Governance
 * - Security Testing & Validation
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { z } from 'zod';

// ============================================================================
// CORE SECURITY TYPES
// ============================================================================

/**
 * Security framework configuration
 */
export interface SecurityFrameworkConfig {
  rbac: {
    enabled: boolean;
    defaultRoles: string[];
    adminRoles: string[];
    sessionTimeout: number;
    maxFailedAttempts: number;
    lockoutDuration: number;
  };
  monitoring: {
    enabled: boolean;
    realTimeThreatDetection: boolean;
    auditTrailRetention: number;
    alertThresholds: SecurityAlertThresholds;
    complianceFrameworks: ComplianceFramework[];
  };
  dataProtection: {
    encryptionLevel: EncryptionLevel;
    keyRotationInterval: number;
    dataRetentionPolicy: DataRetentionPolicy;
    anonymizationEnabled: boolean;
    gdprCompliant: boolean;
  };
  authentication: {
    mfaRequired: boolean;
    biometricEnabled: boolean;
    sessionManagement: boolean;
    tokenExpiry: number;
    passwordPolicy: PasswordPolicy;
  };
  infrastructure: {
    containerSecurity: boolean;
    networkSecurity: boolean;
    apiRateLimiting: boolean;
    ddosProtection: boolean;
    secretsManagement: boolean;
  };
  compliance: {
    automatedChecking: boolean;
    governanceEnabled: boolean;
    regulatoryFrameworks: RegulatoryFramework[];
    auditFrequency: number;
  };
}

/**
 * Security alert thresholds
 */
export interface SecurityAlertThresholds {
  failedLoginAttempts: number;
  unusualActivityPattern: number;
  dataAccessAnomalies: number;
  resourceAbuseThreshold: number;
  complianceViolationThreshold: number;
  threatDetectionSensitivity: number;
}

/**
 * Compliance frameworks
 */
export type ComplianceFramework =
  | 'gdpr'
  | 'soc2'
  | 'iso27001'
  | 'pci-dss'
  | 'hipaa'
  | 'nist-800-53'
  | 'ccpa'
  | 'lgpd'
  | 'pdpa';

/**
 * Regulatory frameworks
 */
export type RegulatoryFramework =
  | 'financial-services'
  | 'healthcare'
  | 'education'
  | 'government'
  | 'eu-data-protection'
  | 'california-privacy'
  | 'children-privacy';

/**
 * Encryption levels
 */
export type EncryptionLevel =
  | 'none'
  | 'basic'
  | 'advanced'
  | 'quantum'
  | 'military-grade';

/**
 * Data retention policy
 */
export interface DataRetentionPolicy {
  auditLogs: number; // days
  userSessions: number; // days
  encryptedData: number; // days
  anonymizedData: number; // days
  deletedData: { immediate: boolean; secureDeletion: boolean };
}

/**
 * Password policy
 */
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number; // number of previous passwords
  expiryDays: number;
}

// ============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================================

/**
 * Role definition
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  level: number; // 1-100, higher = more privileges
  permissions: Permission[];
  inheritsFrom?: string[];
  timeBound?: TimeBoundRole;
  contextAware?: ContextAwareRole;
  delegationRules?: DelegationRule[];
}

/**
 * Permission definition
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  constraints?: PermissionConstraint[];
}

/**
 * Permission condition
 */
export interface PermissionCondition {
  type: 'time' | 'location' | 'device' | 'context' | 'risk-level';
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains' | 'not-contains';
  value: any;
  required: boolean;
}

/**
 * Permission constraint
 */
export interface PermissionConstraint {
  type: 'rate-limit' | 'data-volume' | 'time-window' | 'geographic' | 'resource-limit';
  maximum: number;
  period: number; // time window in seconds
  action: 'block' | 'warn' | 'log';
}

/**
 * Time-bound role
 */
export interface TimeBoundRole {
  startTime: Date;
  endTime: Date;
  timezone: string;
  recurring?: RecurringPattern;
}

/**
 * Context-aware role
 */
export interface ContextAwareRole {
  contexts: SecurityContext[];
  requiredContexts: string[];
  fallbackRole?: string;
}

/**
 * Security context
 */
export interface SecurityContext {
  type: 'location' | 'device' | 'network' | 'time' | 'risk' | 'compliance';
  value: any;
  confidence: number; // 0-100
  verified: boolean;
}

/**
 * Recurring pattern
 */
export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  pattern: string; // cron-like pattern
  timezone: string;
}

/**
 * Delegation rule
 */
export interface DelegationRule {
  canDelegateTo: string[]; // role IDs
  maxDuration: number; // seconds
  requiresApproval: boolean;
  approvalRoles: string[];
  conditions: DelegationCondition[];
}

/**
 * Delegation condition
 */
export interface DelegationCondition {
  type: 'time' | 'risk-level' | 'resource-load' | 'compliance';
  operator: string;
  value: any;
}

/**
 * User role assignment
 */
export interface UserRoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  delegatedFrom?: string;
  context?: SecurityContext[];
  active: boolean;
  metadata?: Record<string, any>;
}

// ============================================================================
// SECURITY MONITORING & COMPLIANCE
// ============================================================================

/**
 * Security event
 */
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: Date;
  source: {
    userId?: string;
    agentId?: string;
    ip?: string;
    userAgent?: string;
    location?: string;
  };
  target: {
    resource?: string;
    action?: string;
    data?: any;
  };
  description: string;
  details: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'false-positive';
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  impact: SecurityImpact;
  mitigation?: SecurityMitigation;
}

/**
 * Security event types
 */
export type SecurityEventType =
  | 'authentication-failure'
  | 'authorization-failure'
  | 'privilege-escalation'
  | 'data-access-violation'
  | 'suspicious-activity'
  | 'malware-detected'
  | 'network-intrusion'
  | 'data-exfiltration'
  | 'policy-violation'
  | 'compliance-breach'
  | 'system-anomaly'
  | 'resource-abuse'
  | 'denial-of-service'
  | 'unauthorized-access'
  | 'session-hijacking'
  | 'man-in-the-middle'
  | 'social-engineering'
  | 'phishing-attempt'
  | 'brute-force-attack'
  | 'zero-day-exploit';

/**
 * Security severity levels
 */
export type SecuritySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Security impact assessment
 */
export interface SecurityImpact {
  confidentiality: SecurityImpactLevel;
  integrity: SecurityImpactLevel;
  availability: SecurityImpactLevel;
  financial: SecurityImpactLevel;
  reputation: SecurityImpactLevel;
  legal: SecurityImpactLevel;
}

/**
 * Security impact levels
 */
export type SecurityImpactLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Security mitigation
 */
export interface SecurityMitigation {
  automated: boolean;
  actions: SecurityAction[];
  effectiveness: number; // 0-100
  resourcesRequired: string[];
  estimatedCost: number;
  timeToResolve: number; // minutes
}

/**
 * Security action
 */
export type SecurityAction =
  | 'block-ip'
  | 'lock-account'
  | 'terminate-session'
  | 'revoke-permissions'
  | 'quarantine-data'
  | 'isolate-system'
  | 'notify-admin'
  | 'escalate-incident'
  | 'backup-data'
  | 'patch-system'
  | 'update-firewall'
  | 'enable-mfa'
  | 'force-password-reset'
  | 'disable-account'
  | 'audit-logs'
  | 'scan-for-malware'
  | 'isolate-network-segment'
  | 'rate-limit-requests'
  | 'enable-additional-monitoring';

/**
 * Compliance report
 */
export interface ComplianceReport {
  id: string;
  framework: ComplianceFramework;
  period: {
    startDate: Date;
    endDate: Date;
  };
  status: 'compliant' | 'non-compliant' | 'partial' | 'pending-review';
  score: number; // 0-100
  requirements: ComplianceRequirement[];
  violations: ComplianceViolation[];
  recommendations: ComplianceRecommendation[];
  generatedAt: Date;
  nextReview: Date;
}

/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'compliant' | 'non-compliant' | 'not-applicable' | 'pending';
  evidence: ComplianceEvidence[];
  lastChecked: Date;
  nextCheck: Date;
}

/**
 * Compliance evidence
 */
export interface ComplianceEvidence {
  type: 'screenshot' | 'log-entry' | 'configuration' | 'test-result' | 'documentation' | 'audit-trail';
  description: string;
  source: string;
  timestamp: Date;
  verified: boolean;
}

/**
 * Compliance violation
 */
export interface ComplianceViolation {
  id: string;
  requirementId: string;
  severity: SecuritySeverity;
  description: string;
  impact: string;
  discoveredAt: Date;
  status: 'open' | 'investigating' | 'resolved' | 'accepted-risk';
  resolvedAt?: Date;
  resolution?: string;
  fine?: number;
  correctiveAction?: string;
}

/**
 * Compliance recommendation
 */
export interface ComplianceRecommendation {
  id: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'trivial' | 'easy' | 'moderate' | 'complex';
  timeline: string;
  resources: string[];
  cost?: number;
}

// ============================================================================
// DATA PROTECTION & PRIVACY
// ============================================================================

/**
 * Data protection policy
 */
export interface DataProtectionPolicy {
  id: string;
  name: string;
  description: string;
  dataTypes: ProtectedDataType[];
  encryption: EncryptionPolicy;
  accessControl: AccessControlPolicy;
  retention: DataRetentionPolicy;
  anonymization: AnonymizationPolicy;
  crossBorderTransfer: CrossBorderPolicy;
  rights: DataRightsPolicy;
  breachNotification: BreachNotificationPolicy;
}

/**
 * Protected data types
 */
export type ProtectedDataType =
  | 'personal-identifiable-information'
  | 'health-information'
  | 'financial-information'
  | 'biometric-data'
  | 'genetic-information'
  | 'communication-data'
  | 'location-data'
  | 'behavioral-data'
  | 'professional-information'
  | 'educational-information'
  | 'government-identifier'
  | 'children-information';

/**
 * Encryption policy
 */
export interface EncryptionPolicy {
  atRest: EncryptionLevel;
  inTransit: EncryptionLevel;
  inProcessing: EncryptionLevel;
  keyManagement: KeyManagementPolicy;
  algorithm: string;
  keyRotation: KeyRotationPolicy;
}

/**
 * Key management policy
 */
export interface KeyManagementPolicy {
  provider: 'internal' | 'aws-kms' | 'azure-key-vault' | 'google-cloud-kms' | 'hashicorp-vault';
  storage: 'hsm' | 'cloud' | 'software';
  access: KeyAccessPolicy;
  rotation: KeyRotationPolicy;
  backup: KeyBackupPolicy;
  recovery: KeyRecoveryPolicy;
}

/**
 * Key access policy
 */
export interface KeyAccessPolicy {
  requireMFA: boolean;
  approvalRequired: boolean;
  approverRoles: string[];
  accessLogging: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
}

/**
 * Key rotation policy
 */
export interface KeyRotationPolicy {
  interval: number; // days
  automatic: boolean;
  manualApproval: boolean;
  notificationRequired: boolean;
  gracePeriod: number; // days
}

/**
 * Key backup policy
 */
export interface KeyBackupPolicy {
  enabled: boolean;
  frequency: number; // days
  locations: string[];
  encryption: EncryptionLevel;
  retention: number; // days
  testRestore: boolean;
}

/**
 * Key recovery policy
 */
export interface KeyRecoveryPolicy {
  enabled: boolean;
  threshold: number; // minimum approvers
  approverRoles: string[];
  timeWindow: number; // hours
  emergencyOverride: boolean;
}

/**
 * Access control policy
 */
export interface AccessControlPolicy {
  model: 'rbac' | 'abac' | 'pbac' | 'hybrid';
  principleOfLeastPrivilege: boolean;
  separationOfDuties: boolean;
  timeBoundAccess: boolean;
  contextAwareAccess: boolean;
  emergencyAccess: EmergencyAccessPolicy;
}

/**
 * Emergency access policy
 */
export interface EmergencyAccessPolicy {
  enabled: boolean;
  approverRoles: string[];
  minimumApprovers: number;
  timeWindow: number; // hours
  justificationRequired: boolean;
  auditLevel: 'enhanced' | 'standard';
  autoRevoke: boolean;
  revokeDelay: number; // hours
}

/**
 * Anonymization policy
 */
export interface AnonymizationPolicy {
  enabled: boolean;
  techniques: AnonymizationTechnique[];
  retentionPeriod: number; // days before anonymization
  irreversibility: boolean;
  privacyBudget: number; // epsilon for differential privacy
  verification: AnonymizationVerification;
}

/**
 * Anonymization techniques
 */
export type AnonymizationTechnique =
  | 'data-masking'
  | 'pseudonymization'
  | 'generalization'
  | 'data-swapping'
  | 'noise-addition'
  | 'differential-privacy'
  | 'k-anonymity'
  | 'l-diversity'
  | 't-closeness';

/**
 * Anonymization verification
 */
export interface AnonymizationVerification {
  enabled: boolean;
  tests: AnonymizationTest[];
  threshold: number; // re-identification risk threshold
  frequency: number; // days
  reporting: boolean;
}

/**
 * Anonymization test
 */
export interface AnonymizationTest {
  type: 're-identification-risk' | 'attribute-disclosure' | 'inference-risk' | 'diversity-analysis';
  threshold: number;
  enabled: boolean;
}

/**
 * Cross-border policy
 */
export interface CrossBorderPolicy {
  allowed: boolean;
  restrictedCountries: string[];
  dataLocalization: DataLocalizationPolicy;
  transferMechanisms: TransferMechanism[];
  complianceFrameworks: ComplianceFramework[];
  notificationRequired: boolean;
}

/**
 * Data localization policy
 */
export interface DataLocalizationPolicy {
  required: boolean;
  countries: string[];
  storageLocation: string;
  encryption: EncryptionLevel;
  accessControl: boolean;
}

/**
 * Transfer mechanisms
 */
export type TransferMechanism =
  | 'standard-contractual-clauses'
  | 'binding-corporate-rules'
  | 'adequacy-decisions'
  | 'explicit-consent'
  | 'supervisory-authorization';

/**
 * Data rights policy
 */
export interface DataRightsPolicy {
  access: boolean;
  rectification: boolean;
  erasure: boolean;
  portability: boolean;
  objection: boolean;
  restriction: boolean;
  consent: ConsentPolicy;
  automatedDecisionRights: AutomatedDecisionRights;
}

/**
 * Consent policy
 */
export interface ConsentPolicy {
  required: boolean;
  granular: boolean;
  purposeLimitation: boolean;
  timeLimitation: boolean;
  withdrawalRights: boolean;
  ageVerification: boolean;
  parentalConsent: boolean;
  recordKeeping: boolean;
}

/**
 * Automated decision rights
 */
export interface AutomatedDecisionRights {
  enabled: boolean;
  explanation: boolean;
  humanReview: boolean;
  appealProcess: boolean;
  dataUsed: boolean;
}

/**
 * Breach notification policy
 */
export interface BreachNotificationPolicy {
  required: boolean;
  timeframe: number; // hours
  authorities: AuthorityNotificationPolicy;
  individuals: IndividualNotificationPolicy;
  content: NotificationContentPolicy;
  channels: NotificationChannel[];
}

/**
 * Authority notification policy
 */
export interface AuthorityNotificationPolicy {
  required: boolean;
  jurisdictions: string[];
  timeframe: number; // hours
  contactInformation: string[];
  reportingFormat: 'standardized' | 'custom';
}

/**
 * Individual notification policy
 */
export interface IndividualNotificationPolicy {
  required: boolean;
  timeframe: number; // hours
  method: 'direct' | 'indirect' | 'public';
  content: NotificationContentPolicy;
  languageSupport: string[];
  accessibility: boolean;
}

/**
 * Notification content policy
 */
export interface NotificationContentPolicy {
  description: boolean;
  nature: boolean;
  impact: boolean;
  measures: boolean;
  contact: boolean;
  template: string;
}

/**
 * Notification channels
 */
export type NotificationChannel =
  | 'email'
  | 'sms'
  | 'phone'
  | 'mail'
  | 'in-app'
  | 'website'
  | 'press-release'
  | 'regulatory-portal';
// ============================================================================
// AGENT IDENTITY & AUTHENTICATION (continued)
// ============================================================================

/**
 * Device context
 */
export interface DeviceContext {
  id: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'server' | 'iot' | 'container';
  platform: string;
  version: string;
  trusted: boolean;
  fingerprint: string;
  security: DeviceSecurity;
}

/**
 * Device security
 */
export interface DeviceSecurity {
  encryption: boolean;
  screenLock: boolean;
  biometric: boolean;
  rooted: boolean;
  malwareProtection: boolean;
  firewall: boolean;
  vpn: boolean;
  lastSecurityScan: Date;
}

/**
 * Location context
 */
export interface LocationContext {
  type: 'gps' | 'ip-geolocation' | 'network' | 'user-provided' | 'fenced';
  coordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  address?: {
    country: string;
    region: string;
    city: string;
  };
  network?: string;
  trusted: boolean;
  geofence?: Geofence;
}

/**
 * Geofence
 */
export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  coordinates: Array<{ latitude: number; longitude: number }>;
  radius?: number; // for circle
  rules: GeofenceRule[];
}

/**
 * Geofence rule
 */
export interface GeofenceRule {
  action: 'allow' | 'deny' | 'challenge' | 'log';
  timeRestrictions?: TimeRestriction;
  riskLevel: 'low' | 'medium' | 'high';
  notificationRequired: boolean;
}

/**
 * Time restriction
 */
export interface TimeRestriction {
  type: 'daily' | 'weekly' | 'date-range' | 'custom';
  schedule: string; // cron-like format
  timezone: string;
  exceptions: Date[];
}

/**
 * Network context
 */
export interface NetworkContext {
  type: 'wifi' | 'cellular' | 'ethernet' | 'vpn' | 'proxy' | 'tor';
  trusted: boolean;
  publicIP: string;
  localIP: string;
  mac?: string;
  isp?: string;
  organization?: string;
  asn?: string;
}

/**
 * Risk assessment
 */
export interface RiskAssessment {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  adaptiveAuthentication: boolean;
  recommendedActions: string[];
}

/**
 * Risk factors
 */
export interface RiskFactor {
  type: 'new-device' | 'new-location' | 'possible-travel' | 'anomalous-behavior' | 'compromised-credentials' | 'malicious-network' | 'unusual-time' | 'high-privilege-request';
  weight: number; // 0-100
  detected: boolean;
  confidence: number; // 0-100
  description: string;
}

/**
 * Identity verification
 */
export interface IdentityVerification {
  id: string;
  userId: string;
  type: VerificationType;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'expired';
  method: VerificationMethod;
  data: VerificationData;
  issuedAt: Date;
  expiresAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  evidence: VerificationEvidence[];
  metadata: Record<string, any>;
}

/**
 * Verification types
 */
export type VerificationType =
  | 'identity'
  | 'address'
  | 'age'
  | 'professional-qualification'
  | 'business-registration'
  | 'accreditation'
  | 'background-check'
  | 'sanctions-screening'
  | 'pep-screening' // politically exposed person
  | 'source-of-funds'
  | 'beneficial-ownership';

/**
 * Verification methods
 */
export type VerificationMethod =
  | 'document-upload'
  | 'biometric-scan'
  | 'video-verification'
  | 'live-check'
  | 'database-verification'
  | 'third-party-service'
  | 'blockchain-verification'
  | 'in-person-verification'
  | 'digital-signature'
  | 'knowledge-based-verification';

/**
 * Verification data
 */
export interface VerificationData {
  documents?: VerificationDocument[];
  biometrics?: BiometricData;
  checks?: VerificationCheck[];
  references?: VerificationReference[];
  questionnaires?: VerificationQuestionnaire[];
}

/**
 * Verification document
 */
export interface VerificationDocument {
  type: DocumentType;
  name: string;
  hash: string;
  uploadedAt: Date;
  expiresAt?: Date;
  verified: boolean;
  rejectedReason?: string;
  metadata: Record<string, any>;
}

/**
 * Document types
 */
export type DocumentType =
  | 'passport'
  | 'national-id'
  | 'drivers-license'
  | 'birth-certificate'
  | 'utility-bill'
  | 'bank-statement'
  | 'tax-return'
  | 'business-license'
  | 'professional-certificate'
  | 'academic-diploma'
  | 'proof-of-address'
  | 'proof-of-income'
  | 'company-registration'
  | 'articles-of-incorporation'
  | 'shareholder-register'
  | 'beneficial-ownership-register';

/**
 * Biometric data
 */
export interface BiometricData {
  type: BiometricType;
  template: string;
  quality: number; // 0-100
  liveness: boolean;
  antiSpoof: boolean;
  capturedAt: Date;
  expiresAt?: Date;
  metadata: Record<string, any>;
}

/**
 * Biometric types
 */
export type BiometricType =
  | 'fingerprint'
  | 'face'
  | 'iris'
  | 'voice'
  | 'palm'
  | 'vein-pattern'
  | 'gait'
  | 'signature'
  | 'dna'
  | 'behavioral-pattern';

/**
 * Verification check
 */
export interface VerificationCheck {
  type: CheckType;
  service: string;
  status: 'pending' | 'passed' | 'failed' | 'error';
  result?: any;
  checkedAt: Date;
  metadata: Record<string, any>;
}

/**
 * Check types
 */
export type CheckType =
  | 'criminal-record'
  | 'sanctions-list'
  | 'pep-list'
  | 'credit-check'
  | 'employment-verification'
  | 'education-verification'
  | 'professional-license'
  | 'business-verification'
  | 'adverse-media'
  | 'social-media'
  | 'address-verification'
  | 'email-verification'
  | 'phone-verification';

/**
 * Verification reference
 */
export interface VerificationReference {
  type: 'professional' | 'personal' | 'academic' | 'business';
  name: string;
  relationship: string;
  contact: ContactInfo;
  verified: boolean;
  feedback?: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  position?: string;
}

/**
 * Verification questionnaire
 */
export interface VerificationQuestionnaire {
  id: string;
  questions: VerificationQuestion[];
  responses: VerificationResponse[];
  completedAt: Date;
  score?: number;
}

/**
 * Verification question
 */
export interface VerificationQuestion {
  id: string;
  type: 'text' | 'multiple-choice' | 'yes-no' | 'date' | 'number' | 'file-upload';
  question: string;
  required: boolean;
  validation?: ValidationRule[];
  options?: string[];
}

/**
 * Validation rule
 */
export interface ValidationRule {
  type: 'required' | 'format' | 'length' | 'range' | 'pattern' | 'custom';
  rule: string;
  message: string;
}

/**
 * Verification response
 */
export interface VerificationResponse {
  questionId: string;
  response: string | number | boolean | any;
  timestamp: Date;
}

/**
 * Verification evidence
 */
export interface VerificationEvidence {
  type: EvidenceType;
  data: any;
  timestamp: Date;
  verified: boolean;
  hash?: string;
  signature?: string;
}

/**
 * Evidence types
 */
export type EvidenceType =
  | 'screenshot'
  | 'video-recording'
  | 'audio-recording'
  | 'document-scan'
  | 'system-log'
  | 'api-response'
  | 'third-party-report'
  | 'blockchain-transaction'
  | 'digital-signature'
  | 'biometric-template'
  | 'ip-logs'
  | 'device-fingerprint';

// ============================================================================
// INFRASTRUCTURE SECURITY (continued)
// ============================================================================

/**
 * Infrastructure security configuration
 */
export interface InfrastructureSecurityConfig {
  containers: ContainerSecurityConfig;
  network: NetworkSecurityConfig;
  api: APISecurityConfig;
  ddos: DDoSProtectionConfig;
  secrets: SecretsManagementConfig;
  monitoring: InfrastructureMonitoringConfig;
}

/**
 * Container security configuration
 */
export interface ContainerSecurityConfig {
  imageScanning: boolean;
  runtimeProtection: boolean;
  networkPolicies: boolean;
  resourceLimits: boolean;
  privilegedContainers: boolean;
  rootUser: boolean;
  seccomp: boolean;
  apparmor: boolean;
  selinux: boolean;
}

/**
 * Network security configuration
 */
export interface NetworkSecurityConfig {
  firewall: FirewallConfig;
  intrusionDetection: boolean;
  intrusionPrevention: boolean;
  networkSegmentation: boolean;
  vpn: boolean;
}

/**
 * Firewall configuration
 */
export interface FirewallConfig {
  defaultDeny: boolean;
  allowedPorts: number[];
  allowedIPs: string[];
  allowedProtocols: string[];
  rateLimiting: boolean;
  logging: boolean;
  monitoring: boolean;
}

/**
 * API security configuration
 */
export interface APISecurityConfig {
  authentication: boolean;
  authorization: boolean;
  rateLimiting: boolean;
  inputValidation: boolean;
  outputEncoding: boolean;
  cors: CORSConfig;
  waf: boolean;
  monitoring: boolean;
}

/**
 * CORS configuration
 */
export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

/**
 * DDoS protection configuration
 */
export interface DDoSProtectionConfig {
  enabled: boolean;
  threshold: number; // requests per second
  burstLimit: number;
  mitigation: DDoSMitigationStrategy;
  monitoring: boolean;
  alerting: boolean;
}

/**
 * DDoS mitigation strategies
 */
export interface DDoSMitigationStrategy {
  rateLimiting: boolean;
  ipBlocking: boolean;
  challengeResponse: boolean;
  trafficShaping: boolean;
  cdn: boolean;
  anycast: boolean;
}

/**
 * Secrets management configuration
 */
export interface SecretsManagementConfig {
  provider: 'internal' | 'aws-secrets-manager' | 'azure-key-vault' | 'google-secret-manager' | 'hashicorp-vault';
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  rotationPolicy: KeyRotationPolicy;
  accessLogging: boolean;
  auditLogging: boolean;
}

/**
 * Key rotation policy
 */
export interface KeyRotationPolicy {
  interval: number; // days
  automatic: boolean;
  manualApproval: boolean;
  notificationRequired: boolean;
  gracePeriod: number; // days
}

/**
 * Infrastructure monitoring configuration
 */
export interface InfrastructureMonitoringConfig {
  enabled: boolean;
  metrics: InfrastructureMetrics;
  alerts: InfrastructureAlerts;
  logging: InfrastructureLogging;
}

/**
 * Infrastructure metrics
 */
export interface InfrastructureMetrics {
  performance: boolean;
  security: boolean;
  availability: boolean;
  resource: boolean;
  network: boolean;
  custom: string[];
}

/**
 * Infrastructure alerts
 */
export interface InfrastructureAlerts {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThreshold[];
  escalation: EscalationPolicy;
}

/**
 * Alert channels
 */
export type AlertChannel =
  | 'email'
  | 'sms'
  | 'slack'
  | 'webhook'
  | 'pagerduty'
  | 'teams'
  | 'discord'
  | 'telegram';

/**
 * Alert threshold
 */
export interface AlertThreshold {
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number;
  duration: number; // minutes
  severity: 'info' | 'warning' | 'critical';
  action: string;
}

/**
 * Escalation policy
 */
export interface EscalationPolicy {
  enabled: boolean;
  levels: EscalationLevel[];
  autoEscalate: boolean;
  timeout: number; // minutes
}

/**
 * Escalation level
 */
export interface EscalationLevel {
  level: number;
  name: string;
  channels: AlertChannel[];
  approvers: string[];
  timeout: number; // minutes
}

/**
 * Infrastructure logging
 */
export interface InfrastructureLogging {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  format: 'json' | 'text' | 'syslog' | 'custom';
  retention: number; // days
  aggregation: boolean;
  compression: boolean;
  streaming: boolean;
}

// ============================================================================
// SECURITY TESTING & VALIDATION
// ============================================================================

/**
 * Security test configuration
 */
export interface SecurityTestConfig {
  penetrationTesting: PenetrationTestConfig;
  vulnerabilityScanning: VulnerabilityScanConfig;
  complianceTesting: ComplianceTestConfig;
  loadTesting: LoadTestConfig;
  securityAudit: SecurityAuditConfig;
  continuousMonitoring: ContinuousMonitoringConfig;
}

/**
 * Penetration test configuration
 */
export interface PenetrationTestConfig {
  enabled: boolean;
  scope: TestScope;
  methods: PenTestMethod[];
  schedule: TestSchedule;
  reporting: TestReporting;
  approval: TestApproval;
}

/**
 * Test scope
 */
export interface TestScope {
  applications: string[];
  networks: string[];
  endpoints: string[];
  dataTypes: string[];
  exclusions: string[];
  timeBound: boolean;
  startTime?: Date;
  endTime?: Date;
}

/**
 * Penetration test methods
 */
export type PenTestMethod =
  | 'network-scanning'
  | 'vulnerability-assessment'
  | 'social-engineering'
  | 'physical-testing'
  | 'wireless-testing'
  | 'web-application-testing'
  | 'api-testing'
  | 'mobile-application-testing'
  | 'cloud-configuration-testing'
  | 'container-security-testing'
  | 'blockchain-testing'
  | 'iot-testing'
  | 'ai-prompt-injection'
  | 'business-logic-testing';

/**
 * Test schedule
 */
export interface TestSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on-demand' | 'continuous';
  cronExpression?: string;
  timezone: string;
  nextRun?: Date;
  duration: number; // hours
}

/**
 * Test reporting
 */
export interface TestReporting {
  format: 'json' | 'html' | 'pdf' | 'xml' | 'sarif';
  stakeholders: string[];
  distribution: ReportDistribution;
  anonymization: boolean;
  retention: number; // days
}

/**
 * Report distribution
 */
export interface ReportDistribution {
  email: string[];
  slack: string[];
  jira: string[];
  confluence: string[];
  custom: ReportDistributionCustom[];
}

/**
 * Report distribution custom
 */
export interface ReportDistributionCustom {
  name: string;
  type: 'webhook' | 'api' | 'email' | 'database';
  configuration: Record<string, any>;
}

/**
 * Test approval
 */
export interface TestApproval {
  required: boolean;
  approvers: string[];
  justification: string;
  documentation: string[];
  timeout: number; // hours
  emergency: TestEmergencyApproval;
}

/**
 * Test emergency approval
 */
export interface TestEmergencyApproval {
  enabled: boolean;
  approvers: string[];
  timeout: number; // minutes
  autoApproval: boolean;
  conditions: string[];
}

/**
 * Vulnerability scan configuration
 */
export interface VulnerabilityScanConfig {
  enabled: boolean;
  scanners: VulnerabilityScanner[];
  targets: ScanTarget[];
  schedule: TestSchedule;
  reporting: TestReporting;
  falsePositiveManagement: FalsePositiveManagement;
}

/**
 * Vulnerability scanners
 */
export type VulnerabilityScanner =
  | 'nessus'
  | 'openvas'
  | 'nikto'
  | 'burp-suite'
  | 'owasp-zap'
  | 'acunetix'
  | 'qualys'
  | 'tenable'
  | 'rapid7'
  | 'snyk'
  | 'checkmarx'
  | 'veracode'
  | 'sonarqube'
  | 'semgrep'
  | 'codeql'
  | 'bandit'
  | 'trivy'
  | 'grype'
  | 'gitleaks'
  | 'dependency-check'
  | 'container-scan'
  | 'infrastructure-scan'
  | 'cloud-config-scan'
  | 'secrets-scan';

/**
 * Scan targets
 */
export interface ScanTarget {
  type: 'application' | 'network' | 'infrastructure' | 'cloud' | 'container' | 'code';
  identifier: string;
  endpoints?: string[];
  networks?: string[];
  credentials?: ScanCredentials;
  configuration: Record<string, any>;
}

/**
 * Scan credentials
 */
export interface ScanCredentials {
  type: 'basic-auth' | 'api-key' | 'certificate' | 'oauth' | 'sso';
  username?: string;
  password?: string;
  apiKey?: string;
  certificate?: string;
  privateKey?: string;
  token?: string;
  scopes?: string[];
}

/**
 * False positive management
 */
export interface FalsePositiveManagement {
  enabled: boolean;
  reviewProcess: FalsePositiveReviewProcess;
  autoClassification: boolean;
  machineLearning: boolean;
  feedbackLoop: boolean;
}

/**
 * False positive review process
 */
export interface FalsePositiveReviewProcess {
  reviewers: string[];
  timeLimit: number; // hours
  escalation: boolean;
  documentation: boolean;
  approval: boolean;
}

/**
 * Compliance test configuration
 */
export interface ComplianceTestConfig {
  enabled: boolean;
  frameworks: ComplianceFramework[];
  requirements: ComplianceTestRequirement[];
  schedule: TestSchedule;
  reporting: TestReporting;
  gapAnalysis: ComplianceGapAnalysis;
}

/**
 * Compliance test requirement
 */
export interface ComplianceTestRequirement {
  framework: ComplianceFramework;
  requirement: string;
  category: string;
  controls: ComplianceControl[];
  testing: ComplianceTesting;
  evidence: ComplianceTestEvidence;
}

/**
 * Compliance controls
 */
export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  category: string;
  implementation: string;
  testing: string;
  effectiveness: 'implemented' | 'partial' | 'planned' | 'not-implemented';
  lastTested: Date;
  nextTest: Date;
}

/**
 * Compliance testing
 */
export interface ComplianceTesting {
  automated: boolean;
  manual: boolean;
  tools: ComplianceTestTool[];
  frequency: string;
  evidence: ComplianceTestEvidence[];
}

/**
 * Compliance test tools
 */
export interface ComplianceTestTool {
  name: string;
  type: 'automated' | 'manual';
  configuration: Record<string, any>;
  integration: ToolIntegration;
}

/**
 * Tool integration
 */
export interface ToolIntegration {
  type: 'api' | 'cli' | 'webhook' | 'database' | 'file-share';
  configuration: Record<string, any>;
  authentication: AuthenticationIntegration;
}

/**
 * Authentication integration
 */
export interface AuthenticationIntegration {
  type: 'api-key' | 'oauth2' | 'saml' | 'ldap' | 'certificate';
  configuration: Record<string, any>;
}

/**
 * Compliance test evidence
 */
export interface ComplianceTestEvidence {
  type: 'screenshot' | 'log-entry' | 'configuration' | 'test-result' | 'documentation' | 'audit-trail';
  description: string;
  source: string;
  timestamp: Date;
  verified: boolean;
  hash?: string;
  signature?: string;
}

/**
 * Compliance gap analysis
 */
export interface ComplianceGapAnalysis {
  enabled: boolean;
  framework: ComplianceFramework;
  categories: ComplianceCategory[];
  reporting: GapAnalysisReporting;
}

/**
 * Compliance category
 */
export interface ComplianceCategory {
  name: string;
  requirements: ComplianceTestRequirement[];
  gaps: ComplianceGap[];
  recommendations: ComplianceRecommendation[];
  riskAssessment: ComplianceRiskAssessment;
}

/**
 * Compliance gap
 */
export interface ComplianceGap {
  requirement: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  remediation: string;
  effort: 'trivial' | 'easy' | 'moderate' | 'complex';
  timeline: string;
  cost?: number;
}

/**
 * Compliance recommendation
 */
export interface ComplianceRecommendation {
  id: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'trivial' | 'easy' | 'moderate' | 'complex';
  timeline: string;
  resources: string[];
  cost?: number;
}

/**
 * Compliance risk assessment
 */
export interface ComplianceRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: ComplianceRiskFactor[];
  residualRisk: string;
  treatment: ComplianceRiskTreatment;
}

/**
 * Compliance risk factors
 */
export interface ComplianceRiskFactor {
  factor: string;
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost-certain';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskScore: number;
  mitigation: string;
}

/**
 * Compliance risk treatment
 */
export interface ComplianceRiskTreatment {
  strategy: 'accept' | 'mitigate' | 'transfer' | 'avoid';
  controls: string[];
  monitoring: boolean;
  reviewFrequency: string;
}

/**
 * Gap analysis reporting
 */
export interface GapAnalysisReporting {
  format: 'executive' | 'detailed' | 'technical' | 'presentation';
  stakeholders: string[];
  distribution: ReportDistribution;
  anonymization: boolean;
  retention: number; // days
}

/**
 * Load test configuration
 */
export interface LoadTestConfig {
  enabled: boolean;
  scenarios: LoadTestScenario[];
  targets: LoadTestTarget[];
  schedule: TestSchedule;
  reporting: TestReporting;
  thresholds: LoadTestThresholds;
}

/**
 * Load test scenario
 */
export interface LoadTestScenario {
  name: string;
  type: 'stress' | 'volume' | 'endurance' | 'spike' | 'ramp-up' | 'soak';
  description: string;
  parameters: LoadTestParameters;
  successCriteria: LoadTestSuccessCriteria;
}

/**
 * Load test parameters
 */
export interface LoadTestParameters {
  users: number;
  duration: number; // minutes
  rampUp: number; // minutes
  rampDown: number; // minutes
  thinkTime: number; // seconds
  pacing: number; // requests per second
  data: LoadTestData;
}

/**
 * Load test data
 */
export interface LoadTestData {
  type: 'static' | 'dynamic' | 'parameterized';
  size: number; // bytes
  variation: number; // percentage
  correlation: boolean;
  cache: boolean;
}

/**
 * Load test success criteria
 */
export interface LoadTestSuccessCriteria {
  responseTime: LoadTestMetric;
  throughput: LoadTestMetric;
  errorRate: LoadTestMetric;
  resourceUtilization: LoadTestMetric;
  availability: LoadTestMetric;
}

/**
 * Load test metric
 */
export interface LoadTestMetric {
  average: number;
  p95: number;
  p99: number;
  maximum: number;
  unit: string;
}

/**
 * Load test target
 */
export interface LoadTestTarget {
  type: 'api' | 'web' | 'database' | 'infrastructure';
  identifier: string;
  endpoints?: string[];
  configuration: Record<string, any>;
  credentials?: ScanCredentials;
}

/**
 * Load test thresholds
 */
export interface LoadTestThresholds {
  responseTime: LoadTestMetric;
  errorRate: LoadTestMetric;
  throughput: LoadTestMetric;
  resourceUtilization: LoadTestMetric;
  availability: LoadTestMetric;
}

/**
 * Security audit configuration
 */
export interface SecurityAuditConfig {
  enabled: boolean;
  scope: SecurityAuditScope;
  frequency: AuditFrequency;
  reviewers: SecurityAuditor[];
  reporting: SecurityAuditReporting;
  remediation: SecurityRemediation;
}

/**
 * Security audit scope
 */
export interface SecurityAuditScope {
  systems: string[];
  processes: string[];
  data: string[];
  personnel: string[];
  physical: string[];
  thirdParty: string[];
  documentation: string[];
}

/**
 * Audit frequency
 */
export interface AuditFrequency {
  type: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on-demand';
  schedule?: string;
  lastAudit?: Date;
  nextAudit?: Date;
}

/**
 * Security auditor
 */
export interface SecurityAuditor {
  id: string;
  name: string;
  qualifications: string[];
  certifications: string[];
  experience: number; // years
  specialties: string[];
  availability: AuditorAvailability;
}

/**
 * Auditor availability
 */
export interface AuditorAvailability {
  schedule: string;
  timezone: string;
  responseTime: number; // hours
  emergency: boolean;
}

/**
 * Security audit reporting
 */
export interface SecurityAuditReporting {
  format: 'executive' | 'detailed' | 'technical' | 'presentation';
  stakeholders: string[];
  distribution: ReportDistribution;
  anonymization: boolean;
  retention: number; // days
  legalHold: boolean;
}

/**
 * Security remediation
 */
export interface SecurityRemediation {
  workflow: SecurityRemediationWorkflow;
  tracking: SecurityRemediationTracking;
  verification: SecurityRemediationVerification;
  escalation: SecurityRemediationEscalation;
}

/**
 * Security remediation workflow
 */
export interface SecurityRemediationWorkflow {
  stages: SecurityRemediationStage[];
  approvers: string[];
  timeLimits: SecurityTimeLimits;
  automation: SecurityRemediationAutomation;
}

/**
 * Security remediation stage
 */
export interface SecurityRemediationStage {
  id: string;
  name: string;
  description: string;
  requiredActions: string[];
  approvers: string[];
  timeLimit: number; // hours
  automation: boolean;
  verification: boolean;
}

/**
 * Security time limits
 */
export interface SecurityTimeLimits {
  identification: number; // hours
  assessment: number; // hours
  planning: number; // hours
  implementation: number; // hours
  verification: number; // hours
  total: number; // hours
}

/**
 * Security remediation automation
 */
export interface SecurityRemediationAutomation {
  enabled: boolean;
  tools: SecurityRemediationTool[];
  playbooks: SecurityPlaybook[];
  integration: ToolIntegration[];
}

/**
 * Security remediation tool
 */
export interface SecurityRemediationTool {
  name: string;
  type: 'patch-management' | 'configuration-management' | 'vulnerability-scanner' | 'siem' | 'edr' | 'backup' | 'orchestration';
  integration: ToolIntegration;
}

/**
 * Security playbooks
 */
export interface SecurityPlaybook {
  id: string;
  name: string;
  description: string;
  category: string;
  triggers: SecurityPlaybookTrigger[];
  steps: SecurityPlaybookStep[];
  verification: SecurityPlaybookVerification;
}

/**
 * Security playbook trigger
 */
export interface SecurityPlaybookTrigger {
  type: 'event' | 'condition' | 'schedule' | 'manual';
  value: any;
  operator: string;
  threshold?: number;
}

/**
 * Security playbook step
 */
export interface SecurityPlaybookStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'hybrid';
  tool?: string;
  command?: string;
  script?: string;
  parameters: Record<string, any>;
  timeout: number; // minutes
  verification: boolean;
}

/**
 * Security playbook verification
 */
export interface SecurityPlaybookVerification {
  enabled: boolean;
  methods: string[];
  thresholds: Record<string, number>;
  rollback: boolean;
}

/**
 * Security remediation tracking
 */
export interface SecurityRemediationTracking {
  system: string;
  tickets: SecurityTicket[];
  metrics: SecurityRemediationMetrics;
  reporting: SecurityRemediationReporting;
}

/**
 * Security ticket
 */
export interface SecurityTicket {
  id: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  reportedBy: string;
  reportedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  effort: number; // hours
  tags: string[];
  attachments: SecurityTicketAttachment[];
}

/**
 * Security ticket attachment
 */
export interface SecurityTicketAttachment {
  name: string;
  type: 'screenshot' | 'log' | 'report' | 'evidence' | 'configuration';
  size: number; // bytes
  hash: string;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Security remediation metrics
 */
export interface SecurityRemediationMetrics {
  mttr: number; // mean time to remediate
  mtbf: number; // mean time between failures
  availability: number; // percentage
  resolutionRate: number; // percentage
  backlog: number;
  responseTime: SecurityTimeMetrics;
  cost: SecurityCostMetrics;
}

/**
 * Security time metrics
 */
export interface SecurityTimeMetrics {
  average: number;
  p95: number;
  p99: number;
  maximum: number;
  unit: string;
}

/**
 * Security cost metrics
 */
export interface SecurityCostMetrics {
  remediation: number;
  prevention: number;
  monitoring: number;
  tools: number;
  training: number;
  total: number;
}

/**
 * Security remediation reporting
 */
export interface SecurityRemediationReporting {
  format: 'executive' | 'detailed' | 'technical' | 'presentation';
  stakeholders: string[];
  distribution: ReportDistribution;
  anonymization: boolean;
  retention: number; // days
}

/**
 * Security remediation verification
 */
export interface SecurityRemediationVerification {
  enabled: boolean;
  methods: string[];
  testing: SecurityRemediationTesting;
  documentation: boolean;
  rollback: boolean;
}

/**
 * Security remediation testing
 */
export interface SecurityRemediationTesting {
  automated: boolean;
  manual: boolean;
  tools: SecurityRemediationTool[];
  frequency: string;
  evidence: SecurityTestEvidence[];
}

/**
 * Continuous monitoring configuration
 */
export interface ContinuousMonitoringConfig {
  enabled: boolean;
  systems: MonitoringSystem[];
  alerts: ContinuousMonitoringAlerts;
  dashboards: MonitoringDashboard[];
  reporting: ContinuousMonitoringReporting;
}

/**
 * Monitoring system
 */
export interface MonitoringSystem {
  id: string;
  name: string;
  type: 'application' | 'infrastructure' | 'network' | 'security' | 'performance' | 'business';
  configuration: Record<string, any>;
  integration: ToolIntegration;
}

/**
 * Continuous monitoring alerts
 */
export interface ContinuousMonitoringAlerts {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThreshold[];
  correlation: AlertCorrelation;
  escalation: EscalationPolicy;
}

/**
 * Alert correlation
 */
export interface AlertCorrelation {
  enabled: boolean;
  rules: CorrelationRule[];
  timeWindow: number; // minutes
  aggregation: AlertAggregation;
}

/**
 * Correlation rule
 */
export interface CorrelationRule {
  name: string;
  conditions: CorrelationCondition[];
  actions: CorrelationAction[];
  enabled: boolean;
}

/**
 * Correlation condition
 */
export interface CorrelationCondition {
  field: string;
  operator: string;
  value: any;
  timeWindow?: number;
}

/**
 * Correlation action
 */
export interface CorrelationAction {
  type: 'create-ticket' | 'escalate' | 'suppress' | 'notify' | 'run-playbook';
  parameters: Record<string, any>;
}

/**
 * Alert aggregation
 */
export interface AlertAggregation {
  enabled: boolean;
  rules: AggregationRule[];
  timeWindow: number; // minutes
}

/**
 * Aggregation rule
 */
export interface AggregationRule {
  name: string;
  conditions: AggregationCondition[];
  aggregation: AggregationMethod;
  threshold: number;
  action: CorrelationAction;
}

/**
 * Aggregation condition
 */
export interface AggregationCondition {
  field: string;
  operator: string;
  value: any;
}

/**
 * Aggregation method
 */
export type AggregationMethod =
  | 'count'
  | 'sum'
  | 'average'
  | 'max'
  | 'min'
  | 'rate';

/**
 * Monitoring dashboard
 */
export interface MonitoringDashboard {
  id: string;
  name: string;
  type: 'security' | 'operations' | 'performance' | 'business';
  widgets: DashboardWidget[];
  access: DashboardAccess;
  refresh: number; // seconds
}

/**
 * Dashboard widget
 */
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'alert' | 'map' | 'log';
  title: string;
  configuration: Record<string, any>;
  dataSource: string;
  refresh: number; // seconds
}

/**
 * Dashboard access
 */
export interface DashboardAccess {
  roles: string[];
  users: string[];
  authentication: boolean;
  ipWhitelist: string[];
  timeRestrictions: TimeRestriction[];
}

/**
 * Continuous monitoring reporting
 */
export interface ContinuousMonitoringReporting {
  format: 'json' | 'html' | 'pdf' | 'dashboard';
  stakeholders: string[];
  distribution: ReportDistribution;
  anonymization: boolean;
  retention: number; // days
  realTime: boolean;
}

// ============================================================================
// MAIN SECURITY FRAMEWORK CLASS
// ============================================================================

/**
 * Main Agent Security Framework
 * Orchestrates all security components and provides unified interface
 */
export class AgentSecurityFramework extends EventEmitter {
  private config: SecurityFrameworkConfig;
  private rbacSystem: RoleBasedAccessControl;
  private monitoringSystem: SecurityMonitoringSystem;
  private complianceSystem: ComplianceSystem;
  private dataProtectionSystem: DataProtectionSystem;
  private authenticationSystem: AuthenticationSystem;
  private infrastructureSecurity: InfrastructureSecurity;
  private testingSystem: SecurityTestingSystem;

  constructor(config: SecurityFrameworkConfig = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.initializeComponents();
  }

  /**
   * Initialize all security components
   */
  private initializeComponents(): void {
    console.log('🛡️ Initializing Axiom Security Framework...');

    // Initialize RBAC system
    this.rbacSystem = new RoleBasedAccessControl(this.config.rbac);

    // Initialize monitoring system
    this.monitoringSystem = new SecurityMonitoringSystem(this.config.monitoring);

    // Initialize compliance system
    this.complianceSystem = new ComplianceSystem(this.config.compliance);

    // Initialize data protection system
    this.dataProtectionSystem = new DataProtectionSystem(this.config.dataProtection);

    // Initialize authentication system
    this.authenticationSystem = new AuthenticationSystem(this.config.authentication);

    // Initialize infrastructure security
    this.infrastructureSecurity = new InfrastructureSecurity(this.config.infrastructure);

    // Initialize testing system
    this.testingSystem = new SecurityTestingSystem(this.config);

    console.log('✅ Security Framework initialized successfully');
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(userConfig: SecurityFrameworkConfig): SecurityFrameworkConfig {
    const defaultConfig: SecurityFrameworkConfig = {
      rbac: {
        enabled: true,
        defaultRoles: ['admin', 'user', 'agent', 'guest'],
        adminRoles: ['super-admin', 'security-admin'],
        sessionTimeout: 3600, // 1 hour
        maxFailedAttempts: 5,
        lockoutDuration: 900, // 15 minutes
      },
      monitoring: {
        enabled: true,
        realTimeThreatDetection: true,
        auditTrailRetention: 90, // days
        alertThresholds: {
          failedLoginAttempts: 5,
          unusualActivityPattern: 10,
          dataAccessAnomalies: 5,
          resourceAbuseThreshold: 100,
          complianceViolationThreshold: 1,
          threatDetectionSensitivity: 75,
        },
        complianceFrameworks: ['gdpr', 'soc2', 'iso27001'],
      },
      dataProtection: {
        encryptionLevel: 'advanced',
        keyRotationInterval: 90, // days
        dataRetentionPolicy: {
          auditLogs: 365, // 1 year
          userSessions: 30, // 30 days
          encryptedData: 2555, // 7 years
          anonymizedData: 3650, // 10 years
          deletedData: { immediate: true, secureDeletion: true },
        },
        anonymizationEnabled: true,
        gdprCompliant: true,
      },
      authentication: {
        mfaRequired: true,
        biometricEnabled: true,
        sessionManagement: true,
        tokenExpiry: 3600, // 1 hour
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          preventReuse: 5,
          expiryDays: 90,
        },
      },
      infrastructure: {
        containerSecurity: true,
        networkSecurity: true,
        apiRateLimiting: true,
        ddosProtection: true,
        secretsManagement: true,
      },
      compliance: {
        automatedChecking: true,
        governanceEnabled: true,
        regulatoryFrameworks: ['gdpr', 'soc2', 'pci-dss'],
        auditFrequency: 30, // days
      },
    };

    return this.deepMerge(defaultConfig, userConfig);
  }

  /**
   * Deep merge objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Get security status
   */
  async getSecurityStatus(): Promise<SecurityStatus> {
    const rbacStatus = this.rbacSystem.getStatus();
    const monitoringStatus = this.monitoringSystem.getStatus();
    const complianceStatus = this.complianceSystem.getStatus();
    const dataProtectionStatus = this.dataProtectionSystem.getStatus();
    const authStatus = this.authenticationSystem.getStatus();
    const infraStatus = this.infrastructureSecurity.getStatus();
    const testingStatus = this.testingSystem.getStatus();

    return {
      overall: this.calculateOverallStatus([
        rbacStatus.health,
        monitoringStatus.health,
        complianceStatus.health,
        dataProtectionStatus.health,
        authStatus.health,
        infraStatus.health,
        testingStatus.health
      ]),
      components: {
        rbac: rbacStatus,
        monitoring: monitoringStatus,
        compliance: complianceStatus,
        dataProtection: dataProtectionStatus,
        authentication: authStatus,
        infrastructure: infraStatus,
        testing: testingStatus,
      },
      metrics: {
        totalUsers: rbacStatus.metrics.totalUsers,
        activeSessions: authStatus.metrics.activeSessions,
        securityEvents: monitoringStatus.metrics.totalEvents,
        threatsDetected: monitoringStatus.metrics.threatsDetected,
        complianceScore: complianceStatus.metrics.score,
        dataBreachIncidents: dataProtectionStatus.metrics.breaches,
        vulnerabilitiesFound: testingStatus.metrics.vulnerabilities,
      },
      alerts: [
        ...monitoringStatus.activeAlerts,
        ...complianceStatus.activeAlerts,
        ...dataProtectionStatus.activeAlerts,
      ],
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate overall security status
   */
  private calculateOverallStatus(componentStatuses: ('healthy' | 'degraded' | 'unhealthy')[]): 'healthy' | 'degraded' | 'unhealthy' {
    const degradedCount = componentStatuses.filter(status => status === 'degraded').length;
    const unhealthyCount = componentStatuses.filter(status => status === 'unhealthy').length;

    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  }

  /**
   * Handle security event
   */
  async handleSecurityEvent(event: SecurityEvent): Promise<void> {
    console.log(`🚨 Security event: ${event.type} - ${event.description}`);

    // Log event
    await this.monitoringSystem.logEvent(event);

    // Assess impact
    const impact = await this.assessEventImpact(event);

    // Trigger automated response
    await this.triggerAutomatedResponse(event, impact);

    // Emit event for external systems
    this.emit('security-event', { event, impact });
  }

  /**
   * Assess event impact
   */
  private async assessEventImpact(event: SecurityEvent): Promise<SecurityImpact> {
    // Implementation would analyze event and assess impact
    return {
      confidentiality: 'medium',
      integrity: 'low',
      availability: 'low',
      financial: 'low',
      reputation: 'medium',
      legal: 'low',
    };
  }

  /**
   * Trigger automated response
   */
  private async triggerAutomatedResponse(event: SecurityEvent, impact: SecurityImpact): Promise<void> {
    // Implementation would trigger appropriate automated responses
    console.log(`🤖 Triggering automated response for event: ${event.id}`);
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(framework: ComplianceFramework): Promise<ComplianceReport> {
    return this.complianceSystem.generateReport(framework);
  }

  /**
   * Run security audit
   */
  async runSecurityAudit(): Promise<SecurityAuditResult> {
    return this.testingSystem.runSecurityAudit();
  }

  /**
   * Update security configuration
   */
  updateConfiguration(updates: Partial<SecurityFrameworkConfig>): void {
    this.config = this.deepMerge(this.config, updates);
    this.updateComponents();
  }

  /**
   * Update components with new configuration
   */
  private updateComponents(): void {
    this.rbacSystem.updateConfig(this.config.rbac);
    this.monitoringSystem.updateConfig(this.config.monitoring);
    this.complianceSystem.updateConfig(this.config.compliance);
    this.dataProtectionSystem.updateConfig(this.config.dataProtection);
    this.authenticationSystem.updateConfig(this.config.authentication);
    this.infrastructureSecurity.updateConfig(this.config.infrastructure);
    this.testingSystem.updateConfig(this.config);
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

/**
 * Security status
 */
export interface SecurityStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    rbac: ComponentStatus;
    monitoring: ComponentStatus;
    compliance: ComponentStatus;
    dataProtection: ComponentStatus;
    authentication: ComponentStatus;
    infrastructure: ComponentStatus;
    testing: ComponentStatus;
  };
  metrics: {
    totalUsers: number;
    activeSessions: number;
    securityEvents: number;
    threatsDetected: number;
    complianceScore: number;
    dataBreachIncidents: number;
    vulnerabilitiesFound: number;
  };
  alerts: SecurityAlert[];
  lastUpdated: Date;
}

/**
 * Component status
 */
export interface ComponentStatus {
  health: 'healthy' | 'degraded' | 'unhealthy';
  metrics: any;
  lastCheck: Date;
}

/**
 * Security alert
 */
export interface SecurityAlert {
  id: string;
  type: string;
  severity: SecuritySeverity;
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  acknowledged: boolean;
  resolved: boolean;
  metadata: Record<string, any>;
}

/**
 * Security audit result
 */
export interface SecurityAuditResult {
  id: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  findings: SecurityAuditFinding[];
  recommendations: string[];
  startDate: Date;
  endDate: Date;
  auditors: string[];
}

/**
 * Security audit finding
 */
export interface SecurityAuditFinding {
  id: string;
  category: string;
  severity: SecuritySeverity;
  title: string;
  description: string;
  recommendation: string;
  evidence: string[];
  cvssScore?: number;
}

// Placeholder class implementations (would be in separate files)
class RoleBasedAccessControl {
  constructor(config: any) { }
  getStatus() { return { health: 'healthy', metrics: { totalUsers: 0 } }; }
  updateConfig(config: any) { }
}

class SecurityMonitoringSystem {
  constructor(config: any) { }
  getStatus() { return { health: 'healthy', metrics: { totalEvents: 0, threatsDetected: 0 }, activeAlerts: [] }; }
  updateConfig(config: any) { }
  async logEvent(event: SecurityEvent): Promise<void> { }
}

class ComplianceSystem {
  constructor(config: any) { }
  getStatus() { return { health: 'healthy', metrics: { score: 100 }, activeAlerts: [] }; }
  updateConfig(config: any) { }
  async generateReport(framework: ComplianceFramework): Promise<ComplianceReport> {
    return {} as ComplianceReport;
  }
}

class DataProtectionSystem {
  constructor(config: any) { }
  getStatus() { return { health: 'healthy', metrics: { breaches: 0 }, activeAlerts: [] }; }
  updateConfig(config: any) { }
}

class AuthenticationSystem {
  constructor(config: any) { }
  getStatus() { return { health: 'healthy', metrics: { activeSessions: 0 } }; }
  updateConfig(config: any) { }
}

class InfrastructureSecurity {
  constructor(config: any) { }
  getStatus() { return { health: 'healthy' }; }
  updateConfig(config: any) { }
}

class SecurityTestingSystem {
  constructor(config: any) { }
  getStatus() { return { health: 'healthy', metrics: { vulnerabilities: 0 } }; }
  updateConfig(config: any) { }
  async runSecurityAudit(): Promise<SecurityAuditResult> {
    return {} as SecurityAuditResult;
  }
}

export default AgentSecurityFramework;