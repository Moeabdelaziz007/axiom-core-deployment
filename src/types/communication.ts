/**
 * 🌐 AXIOM AGENT COMMUNICATION PROTOCOLS
 * 
 * Comprehensive type definitions for secure agent-to-agent communication including:
 * - Message passing and routing
 * - Real-time communication channels
 * - Security and encryption protocols
 * - Communication standards and error handling
 * - Performance monitoring and analytics
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { z } from "zod";

// ============================================================================
// CORE COMMUNICATION TYPES
// ============================================================================

/**
 * Universal message format for all agent communications
 */
export interface AgentMessage {
  id: string;
  messageId: string; // Unique message identifier across the system
  senderId: string;
  recipientId: string | string[]; // Single recipient or broadcast
  sessionId?: string; // For session-based communications
  
  // Message content
  type: MessageType;
  content: MessageContent;
  payload?: any; // Additional data payload
  
  // Metadata
  timestamp: Date;
  priority: MessagePriority;
  encrypted: boolean;
  signed: boolean;
  
  // Routing and delivery
  routing: MessageRouting;
  delivery: DeliveryStatus;
  
  // Security
  security: SecurityMetadata;
  
  // Performance tracking
  metrics: MessageMetrics;
  
  // Protocol versioning
  version: string;
  compatibility: CompatibilityInfo;
}

/**
 * Message types with specific purposes
 */
export type MessageType = 
  | 'text'           // Plain text messages
  | 'file'           // File transfers
  | 'task'           // Task delegation
  | 'result'         // Task results
  | 'knowledge'       // Knowledge sharing
  | 'system'         // System notifications
  | 'heartbeat'      // Keep-alive messages
  | 'discovery'      // Agent discovery
  | 'handshake'      // Connection establishment
  | 'error'          // Error reports
  | 'status'         // Status updates
  | 'collaboration'  // Collaboration requests
  | 'marketplace'    // Marketplace transactions
  | 'performance'    // Performance metrics
  | 'security'       // Security alerts
  | 'voice'          // Voice communication
  | 'video'          // Video communication
  | 'typing'         // Typing indicators
  | 'read_receipt'   // Read receipts
  | 'presence'       // Presence updates;

/**
 * Message content structure
 */
export interface MessageContent {
  format: ContentFormat;
  data: any;
  encoding?: string;
  compression?: CompressionInfo;
  localization?: LocalizationInfo;
}

/**
 * Content format types
 */
export type ContentFormat = 
  | 'text'           | 'json'           | 'xml'            | 'binary'
  | 'base64'         | 'multipart'       | 'encrypted'       | 'signed'
  | 'stream'         | 'blob'           | 'arraybuffer'     | 'url';

/**
 * Message priority levels
 */
export type MessagePriority = 
  | 'low'            | 'normal'         | 'high'            | 'urgent'
  | 'critical'       | 'emergency';

/**
 * Message routing information
 */
export interface MessageRouting {
  path: string[]; // Route hops
  protocol: RoutingProtocol;
  strategy: RoutingStrategy;
  fallback: FallbackRouting;
  multicast?: MulticastInfo;
}

/**
 * Routing protocols
 */
export type RoutingProtocol = 
  | 'direct'         | 'broadcast'      | 'multicast'       | 'anycast'
  | 'peer-to-peer'   | 'relay'          | 'store-and-forward' | 'flood';

/**
 * Routing strategies
 */
export type RoutingStrategy = 
  | 'shortest_path'  | 'least_cost'     | 'fastest_delivery' | 'most_reliable'
  | 'load_balanced'   | 'priority_based'  | 'security_first'  | 'adaptive';

/**
 * Fallback routing options
 */
export interface FallbackRouting {
  enabled: boolean;
  strategies: RoutingStrategy[];
  timeout: number; // milliseconds
  retryCount: number;
  backoffStrategy: BackoffStrategy;
}

/**
 * Backoff strategies for retries
 */
export type BackoffStrategy = 
  | 'linear'         | 'exponential'    | 'fixed'           | 'jitter'
  | 'adaptive';

/**
 * Multicast information
 */
export interface MulticastInfo {
  groupId: string;
  members: string[];
  exclude?: string[];
  ttl?: number; // Time to live
}

/**
 * Delivery status tracking
 */
export interface DeliveryStatus {
  status: DeliveryState;
  attempts: number;
  lastAttempt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  acknowledged?: boolean;
  error?: DeliveryError;
  trace: DeliveryTrace[];
}

/**
 * Delivery states
 */
export type DeliveryState = 
  | 'pending'        | 'queued'         | 'in_transit'      | 'delivered'
  | 'read'           | 'acknowledged'    | 'failed'          | 'expired'
  | 'cancelled';

/**
 * Delivery error information
 */
export interface DeliveryError {
  code: string;
  message: string;
  retryable: boolean;
  category: ErrorCategory;
  severity: ErrorSeverity;
}

/**
 * Error categories
 */
export type ErrorCategory = 
  | 'network'        | 'routing'        | 'security'        | 'protocol'
  | 'format'         | 'timeout'         | 'resource'        | 'permission'
  | 'authentication'  | 'authorization'   | 'rate_limit'      | 'quota'
  | 'system';

/**
 * Error severity levels
 */
export type ErrorSeverity = 
  | 'low'            | 'medium'          | 'high'            | 'critical';

/**
 * Delivery trace information
 */
export interface DeliveryTrace {
  hop: number;
  nodeId: string;
  timestamp: Date;
  action: 'sent' | 'received' | 'forwarded' | 'processed' | 'failed';
  duration?: number; // milliseconds
  metadata?: Record<string, any>;
}

/**
 * Security metadata
 */
export interface SecurityMetadata {
  encryption: EncryptionInfo;
  signature: SignatureInfo;
  authentication: AuthenticationInfo;
  integrity: IntegrityInfo;
  privacy: PrivacyInfo;
}

/**
 * Encryption information
 */
export interface EncryptionInfo {
  algorithm: EncryptionAlgorithm;
  keyId: string;
  iv?: string; // Initialization vector
  keyExchange: KeyExchangeMethod;
  strength: EncryptionStrength;
  compliant: boolean; // Regulatory compliance
}

/**
 * Encryption algorithms
 */
export type EncryptionAlgorithm = 
  | 'AES-256-GCM'    | 'ChaCha20-Poly1305' | 'RSA-OAEP-256'   | 'ECDH-ES'
  | 'Quantum-Resistant' | 'Hybrid'           | 'End-to-End'      | 'Transport';

/**
 * Key exchange methods
 */
export type KeyExchangeMethod = 
  | 'RSA'            | 'Diffie-Hellman'   | 'ECDH'            | 'Quantum-Key-Distribution'
  | 'Pre-Shared'      | 'Certificate-Based' | 'Blockchain-Based'  | 'KMS-Managed';

/**
 * Encryption strength levels
 */
export type EncryptionStrength = 
  | 'standard'        | 'high'            | 'military'        | 'quantum-safe'
  | 'custom';

/**
 * Signature information
 */
export interface SignatureInfo {
  algorithm: SignatureAlgorithm;
  keyId: string;
  signature: string;
  timestamp: Date;
  valid: boolean;
  verified?: boolean;
}

/**
 * Signature algorithms
 */
export type SignatureAlgorithm = 
  | 'ECDSA-P256'     | 'ECDSA-P384'     | 'RSA-PSS-2048'    | 'RSA-PSS-4096'
  | 'Ed25519'         | 'Quantum-Safe'    | 'Multi-Signature'  | 'Threshold';

/**
 * Authentication information
 */
export interface AuthenticationInfo {
  method: AuthenticationMethod;
  credentials: CredentialInfo;
  sessionId?: string;
  expiresAt?: Date;
  mfa?: MFAInfo;
}

/**
 * Authentication methods
 */
export type AuthenticationMethod = 
  | 'token'           | 'certificate'     | 'biometric'       | 'multi-factor'
  | 'zero-knowledge'   | 'blockchain'       | 'decentralized'   | 'federated';

/**
 * Credential information
 */
export interface CredentialInfo {
  type: CredentialType;
  identifier: string;
  issuer: string;
  issuedAt: Date;
  expiresAt?: Date;
  revoked?: boolean;
  trustLevel: TrustLevel;
}

/**
 * Credential types
 */
export type CredentialType = 
  | 'JWT'             | 'X.509'           | 'DID'              | 'Verifiable-Credential'
  | 'API-Key'          | 'OAuth-Token'       | 'Session-Token'    | 'Hardware-Token';

/**
 * Trust levels
 */
export type TrustLevel = 
  | 'untrusted'       | 'low'              | 'medium'           | 'high'
  | 'critical'         | 'root';

/**
 * Multi-factor authentication info
 */
export interface MFAInfo {
  enabled: boolean;
  methods: MFAMethod[];
  verified: boolean;
  challenge?: string;
}

/**
 * MFA methods
 */
export type MFAMethod = 
  | 'TOTP'            | 'SMS'              | 'Email'            | 'Hardware-Key'
  | 'Biometric'        | 'Push-Notification' | 'Backup-Codes';

/**
 * Integrity verification
 */
export interface IntegrityInfo {
  algorithm: IntegrityAlgorithm;
  checksum: string;
  verified: boolean;
  timestamp: Date;
}

/**
 * Integrity algorithms
 */
export type IntegrityAlgorithm = 
  | 'SHA-256'         | 'SHA-512'         | 'BLAKE3'           | 'CRC32'
  | 'HMAC-SHA256'      | 'Quantum-Resistant' | 'Merkle-Tree';

/**
 * Privacy information
 */
export interface PrivacyInfo {
  level: PrivacyLevel;
  anonymization: AnonymizationInfo;
  dataRetention: RetentionPolicy;
  compliance: ComplianceInfo;
}

/**
 * Privacy levels
 */
export type PrivacyLevel = 
  | 'public'           | 'internal'         | 'confidential'     | 'secret'
  | 'top-secret';

/**
 * Anonymization information
 */
export interface AnonymizationInfo {
  enabled: boolean;
  method: AnonymizationMethod;
  dataTypes: string[];
  reversible: boolean;
}

/**
 * Anonymization methods
 */
export type AnonymizationMethod = 
  | 'hashing'          | 'tokenization'     | 'masking'          | 'generalization'
  | 'differential-privacy' | 'k-anonymity'    | 'l-diversity';

/**
 * Retention policy
 */
export interface RetentionPolicy {
  duration: number; // days
  autoDelete: boolean;
  archival: boolean;
  legalHold: boolean;
}

/**
 * Compliance information
 */
export interface ComplianceInfo {
  frameworks: ComplianceFramework[];
  auditRequired: boolean;
  dataLocation: string[];
  crossBorder: boolean;
}

/**
 * Compliance frameworks
 */
export type ComplianceFramework = 
  | 'GDPR'            | 'HIPAA'            | 'SOC2'             | 'PCI-DSS'
  | 'ISO-27001'        | 'NIST'             | 'CCPA'             | 'POPIA';

/**
 * Message metrics for performance tracking
 */
export interface MessageMetrics {
  size: number; // bytes
  latency: number; // milliseconds
  processingTime: number; // milliseconds
  queueTime: number; // milliseconds
  networkHops: number;
  bandwidth: number; // bytes per second
  compressionRatio?: number;
  encryptionOverhead: number; // bytes
  routingCost: number; // arbitrary units
  qualityScore: number; // 0-100
}

/**
 * Compression information
 */
export interface CompressionInfo {
  algorithm: CompressionAlgorithm;
  level: number; // 1-9
  originalSize: number;
  compressedSize: number;
  ratio: number;
}

/**
 * Compression algorithms
 */
export type CompressionAlgorithm = 
  | 'gzip'            | 'deflate'          | 'brotli'           | 'lz4'
  | 'zstd'             | 'custom';

/**
 * Localization information
 */
export interface LocalizationInfo {
  language: string;
  region: string;
  timezone: string;
  currency?: string;
  dateFormat: string;
  numberFormat: string;
}

/**
 * Compatibility information
 */
export interface CompatibilityInfo {
  version: string;
  minVersion: string;
  maxVersion: string;
  features: string[];
  deprecated: string[];
  experimental: string[];
}

// ============================================================================
// REAL-TIME COMMUNICATION TYPES
// ============================================================================

/**
 * Real-time communication session
 */
export interface RealtimeSession {
  id: string;
  type: SessionType;
  participants: Participant[];
  state: SessionState;
  configuration: SessionConfig;
  media: MediaConfig;
  security: SessionSecurity;
  quality: QualityMetrics;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // seconds
}

/**
 * Session types
 */
export type SessionType = 
  | 'chat'            | 'voice-call'       | 'video-call'       | 'conference'
  | 'webinar'          | 'broadcast'        | 'collaboration'    | 'screen-share'
  | 'file-transfer';

/**
 * Session states
 */
export type SessionState = 
  | 'initiating'       | 'ringing'         | 'connecting'       | 'connected'
  | 'active'           | 'on-hold'         | 'reconnecting'     | 'ended'
  | 'failed';

/**
 * Participant information
 */
export interface Participant {
  id: string;
  role: ParticipantRole;
  permissions: ParticipantPermissions;
  status: ParticipantStatus;
  joinedAt: Date;
  leftAt?: Date;
  device: DeviceInfo;
  network: NetworkInfo;
  media: MediaState;
}

/**
 * Participant roles
 */
export type ParticipantRole = 
  | 'host'            | 'moderator'        | 'presenter'        | 'participant'
  | 'observer'         | 'guest';

/**
 * Participant permissions
 */
export interface ParticipantPermissions {
  canSpeak: boolean;
  canVideo: boolean;
  canShare: boolean;
  canRecord: boolean;
  canModerate: boolean;
  canInvite: boolean;
  canKick: boolean;
  canMute: boolean;
  canControl: boolean;
}

/**
 * Participant status
 */
export type ParticipantStatus = 
  | 'online'           | 'offline'          | 'away'             | 'busy'
  | 'in-call'          | 'do-not-disturb';

/**
 * Device information
 */
export interface DeviceInfo {
  type: DeviceType;
  platform: string;
  browser?: string;
  app?: string;
  version: string;
  capabilities: DeviceCapabilities;
}

/**
 * Device types
 */
export type DeviceType = 
  | 'desktop'          | 'mobile'           | 'tablet'           | 'wearable'
  | 'iot'              | 'server'           | 'edge-device';

/**
 * Device capabilities
 */
export interface DeviceCapabilities {
  video: VideoCapabilities;
  audio: AudioCapabilities;
  screen: ScreenCapabilities;
  network: NetworkCapabilities;
  storage: StorageCapabilities;
  processing: ProcessingCapabilities;
}

/**
 * Video capabilities
 */
export interface VideoCapabilities {
  enabled: boolean;
  maxResolution: string;
  maxFrameRate: number;
  codecs: string[];
  hardwareAcceleration: boolean;
  simulcast: boolean;
}

/**
 * Audio capabilities
 */
export interface AudioCapabilities {
  enabled: boolean;
  inputDevices: number;
  outputDevices: number;
  codecs: string[];
  noiseCancellation: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
}

/**
 * Screen capabilities
 */
export interface ScreenCapabilities {
  sharing: boolean;
  maxResolution: string;
  frameRate: number;
  multipleMonitors: boolean;
  annotation: boolean;
  remoteControl: boolean;
}

/**
 * Network capabilities
 */
export interface NetworkCapabilities {
  bandwidth: NetworkBandwidth;
  latency: number;
  jitter: number;
  packetLoss: number;
  connectionType: ConnectionType;
}

/**
 * Network bandwidth
 */
export interface NetworkBandwidth {
  upload: number; // Mbps
  download: number; // Mbps
  available: number; // Mbps
}

/**
 * Connection types
 */
export type ConnectionType = 
  | 'wifi'             | 'ethernet'         | 'cellular'         | 'satellite'
  | 'fiber'            | 'dsl'              | 'dial-up'          | 'bluetooth';

/**
 * Storage capabilities
 */
export interface StorageCapabilities {
  available: number; // GB
  total: number; // GB
  type: StorageType;
  speed: number; // MB/s
}

/**
 * Storage types
 */
export type StorageType = 
  | 'local'            | 'cloud'            | 'network'          | 'removable'
  | 'encrypted';

/**
 * Processing capabilities
 */
export interface ProcessingCapabilities {
  cpu: string;
  cores: number;
  memory: number; // GB
  gpu?: string;
  threads: number;
  architecture: string;
}

/**
 * Network information
 */
export interface NetworkInfo {
  connectionType: ConnectionType;
  quality: NetworkQuality;
  bandwidth: NetworkBandwidth;
  latency: number;
  jitter: number;
  packetLoss: number;
  stable: boolean;
  ipv4: string;
  ipv6?: string;
  publicIP: string;
  localIP: string;
}

/**
 * Network quality levels
 */
export type NetworkQuality = 
  | 'excellent'        | 'good'             | 'fair'             | 'poor'
  | 'unusable';

/**
 * Media state
 */
export interface MediaState {
  audio: AudioState;
  video: VideoState;
  screen: ScreenState;
}

/**
 * Audio state
 */
export interface AudioState {
  enabled: boolean;
  muted: boolean;
  inputDevice?: string;
  outputDevice?: string;
  volume: number; // 0-100
  quality: AudioQuality;
}

/**
 * Audio quality levels
 */
export type AudioQuality = 
  | 'low'              | 'medium'           | 'high'             | 'ultra'
  | 'hd'               | 'studio';

/**
 * Video state
 */
export interface VideoState {
  enabled: boolean;
  muted: boolean;
  device?: string;
  resolution: string;
  frameRate: number;
  quality: VideoQualityLevel;
  bandwidth: number; // kbps
}

/**
 * Video quality levels
 */
export type VideoQualityLevel = 
  | '144p'             | '240p'             | '360p'             | '480p'
  | '720p'             | '1080p'            | '1440p'            | '4K'
  | '8K'               | 'auto';

/**
 * Screen state
 */
export interface ScreenState {
  sharing: boolean;
  source: ScreenSource;
  resolution: string;
  frameRate: number;
  quality: VideoQualityLevel;
  annotation: boolean;
}

/**
 * Screen sources
 */
export type ScreenSource = 
  | 'entire-screen'    | 'application'      | 'browser-tab'      | 'window'
  | 'region'           | 'monitor';

/**
 * Session configuration
 */
export interface SessionConfig {
  maxParticipants: number;
  recording: RecordingConfig;
  moderation: ModerationConfig;
  quality: QualityConfig;
  features: SessionFeatures;
  scheduling: SchedulingConfig;
}

/**
 * Recording configuration
 */
export interface RecordingConfig {
  enabled: boolean;
  autoStart: boolean;
  format: RecordingFormat;
  quality: RecordingQuality;
  storage: RecordingStorage;
  retention: RetentionPolicy;
}

/**
 * Recording formats
 */
export type RecordingFormat = 
  | 'mp4'              | 'webm'             | 'mkv'              | 'avi'
  | 'mov'              | 'mp3'              | 'wav'              | 'flac'
  | 'm4a';

/**
 * Recording quality levels
 */
export type RecordingQuality = 
  | 'low'              | 'medium'           | 'high'             | 'ultra'
  | 'lossless';

/**
 * Recording storage
 */
export interface RecordingStorage {
  location: StorageLocation;
  encryption: boolean;
  compression: boolean;
  backup: boolean;
  cloudSync: boolean;
}

/**
 * Storage locations
 */
export type StorageLocation = 
  | 'local'            | 'cloud'            | 'network'          | 'hybrid'
  | 'distributed';

/**
 * Moderation configuration
 */
export interface ModerationConfig {
  enabled: boolean;
  autoModeration: boolean;
  rules: ModerationRule[];
  moderators: string[];
  waitingRoom: boolean;
  raiseHand: boolean;
}

/**
 * Moderation rules
 */
export interface ModerationRule {
  id: string;
  type: ModerationType;
  condition: string;
  action: ModerationAction;
  severity: ModerationSeverity;
  enabled: boolean;
}

/**
 * Moderation types
 */
export type ModerationType = 
  | 'content-filter'   | 'language'         | 'behavior'         | 'spam'
  | 'harassment'       | 'violence'         | 'copyright'        | 'privacy';

/**
 * Moderation actions
 */
export type ModerationAction = 
  | 'warn'             | 'mute'             | 'remove'           | 'ban'
  | 'flag'             | 'blur'             | 'delay'            | 'escalate';

/**
 * Moderation severity levels
 */
export type ModerationSeverity = 
  | 'low'              | 'medium'           | 'high'             | 'critical';

/**
 * Quality configuration
 */
export interface QualityConfig {
  video: VideoQualityConfig;
  audio: AudioQualityConfig;
  screen: ScreenQualityConfig;
  adaptive: boolean;
  optimization: OptimizationConfig;
}

/**
 * Video quality configuration
 */
export interface VideoQualityConfig {
  resolution: string;
  frameRate: number;
  bitrate: number; // kbps
  codec: string;
  profile: string;
  hardwareAcceleration: boolean;
}

/**
 * Audio quality configuration
 */
export interface AudioQualityConfig {
  bitrate: number; // kbps
  sampleRate: number; // Hz
  channels: number;
  codec: string;
  noiseCancellation: boolean;
  echoCancellation: boolean;
}

/**
 * Screen quality configuration
 */
export interface ScreenQualityConfig {
  resolution: string;
  frameRate: number;
  bitrate: number; // kbps
  codec: string;
  compression: number; // 0-100
}

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  bandwidthAdaptation: boolean;
  qualityAdaptation: boolean;
  loadBalancing: boolean;
  congestionControl: boolean;
  errorRecovery: boolean;
}

/**
 * Session features
 */
export interface SessionFeatures {
  chat: boolean;
  reactions: boolean;
  polls: boolean;
  breakout: boolean;
  whiteboard: boolean;
  fileShare: boolean;
  recording: boolean;
  transcription: boolean;
  translation: boolean;
  accessibility: AccessibilityFeatures;
}

/**
 * Accessibility features
 */
export interface AccessibilityFeatures {
  captions: boolean;
  signLanguage: boolean;
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  voiceControl: boolean;
}

/**
 * Scheduling configuration
 */
export interface SchedulingConfig {
  startAt?: Date;
  duration?: number; // minutes
  recurring?: RecurringConfig;
  reminders: ReminderConfig[];
  timezone: string;
  autoStart: boolean;
}

/**
 * Recurring configuration
 */
export interface RecurringConfig {
  enabled: boolean;
  pattern: RecurringPattern;
  interval: number;
  endDate?: Date;
  maxOccurrences?: number;
}

/**
 * Recurring patterns
 */
export type RecurringPattern = 
  | 'daily'            | 'weekly'           | 'monthly'          | 'yearly'
  | 'custom';

/**
 * Reminder configuration
 */
export interface ReminderConfig {
  enabled: boolean;
  time: number; // minutes before start
  method: ReminderMethod[];
  message?: string;
}

/**
 * Reminder methods
 */
export type ReminderMethod = 
  | 'email'            | 'sms'              | 'push'             | 'in-app'
  | 'calendar';

/**
 * Media configuration
 */
export interface MediaConfig {
  audio: MediaAudioConfig;
  video: MediaVideoConfig;
  screen: MediaScreenConfig;
  recording: MediaRecordingConfig;
  streaming: MediaStreamingConfig;
}

/**
 * Media audio configuration
 */
export interface MediaAudioConfig {
  enabled: boolean;
  required: boolean;
  devices: AudioDevice[];
  processing: AudioProcessingConfig;
}

/**
 * Audio devices
 */
export interface AudioDevice {
  id: string;
  name: string;
  type: AudioDeviceType;
  capabilities: AudioDeviceCapabilities;
  default: boolean;
}

/**
 * Audio device types
 */
export type AudioDeviceType = 
  | 'microphone'       | 'speaker'          | 'headset'          | 'usb'
  | 'bluetooth'        | 'virtual';

/**
 * Audio device capabilities
 */
export interface AudioDeviceCapabilities {
  channels: number;
  sampleRate: number;
  bitDepth: number;
  latency: number;
  noiseCancellation: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
}

/**
 * Audio processing configuration
 */
export interface AudioProcessingConfig {
  noiseReduction: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  equalization: boolean;
  compression: boolean;
  enhancement: boolean;
}

/**
 * Media video configuration
 */
export interface MediaVideoConfig {
  enabled: boolean;
  required: boolean;
  devices: VideoDevice[];
  processing: VideoProcessingConfig;
}

/**
 * Video devices
 */
export interface VideoDevice {
  id: string;
  name: string;
  type: VideoDeviceType;
  capabilities: VideoDeviceCapabilities;
  default: boolean;
}

/**
 * Video device types
 */
export type VideoDeviceType = 
  | 'webcam'           | 'camera'           | 'ip-camera'        | 'virtual'
  | 'capture-card'      | 'usb';

/**
 * Video device capabilities
 */
export interface VideoDeviceCapabilities {
  maxResolution: string;
  maxFrameRate: number;
  codecs: string[];
  hardwareAcceleration: boolean;
  lowLight: boolean;
  autofocus: boolean;
  zoom: boolean;
  pan: boolean;
  tilt: boolean;
}

/**
 * Video processing configuration
 */
export interface VideoProcessingConfig {
  enhancement: boolean;
  stabilization: boolean;
  backgroundBlur: boolean;
  backgroundReplacement: boolean;
  faceDetection: boolean;
  objectDetection: boolean;
  colorCorrection: boolean;
}

/**
 * Media screen configuration
 */
export interface MediaScreenConfig {
  enabled: boolean;
  sources: ScreenSource[];
  processing: ScreenProcessingConfig;
}

/**
 * Screen processing configuration
 */
export interface ScreenProcessingConfig {
  optimization: boolean;
  compression: boolean;
  annotation: boolean;
  cursor: boolean;
  multiMonitor: boolean;
  regionSelection: boolean;
}

/**
 * Media recording configuration
 */
export interface MediaRecordingConfig {
  enabled: boolean;
  format: RecordingFormat;
  quality: RecordingQuality;
  storage: RecordingStorage;
  metadata: RecordingMetadata;
}

/**
 * Recording metadata
 */
export interface RecordingMetadata {
  title?: string;
  description?: string;
  tags: string[];
  participants: string[];
  location?: string;
  language?: string;
  category?: string;
}

/**
 * Media streaming configuration
 */
export interface MediaStreamingConfig {
  enabled: boolean;
  protocol: StreamingProtocol;
  quality: StreamingQuality;
  latency: StreamingLatency;
  adaptive: boolean;
}

/**
 * Streaming protocols
 */
export type StreamingProtocol = 
  | 'WebRTC'           | 'RTMP'             | 'HLS'              | 'DASH'
  | 'SRT'              | 'WebSocket'        | 'UDP'              | 'TCP';

/**
 * Streaming quality levels
 */
export type StreamingQuality = 
  | 'auto'             | 'low'              | 'medium'           | 'high'
  | 'ultra'            | 'lossless';

/**
 * Streaming latency configuration
 */
export interface StreamingLatency {
  target: number; // milliseconds
  max: number; // milliseconds
  adaptive: boolean;
}

/**
 * Session security configuration
 */
export interface SessionSecurity {
  encryption: SessionEncryption;
  authentication: SessionAuthentication;
  authorization: SessionAuthorization;
  audit: SessionAudit;
}

/**
 * Session encryption
 */
export interface SessionEncryption {
  enabled: boolean;
  algorithm: EncryptionAlgorithm;
  keyRotation: boolean;
  keyRotationInterval: number; // minutes
  endToEnd: boolean;
  transport: boolean;
}

/**
 * Session authentication
 */
export interface SessionAuthentication {
  required: boolean;
  methods: AuthenticationMethod[];
  mfa: boolean;
  deviceVerification: boolean;
  biometric: boolean;
}

/**
 * Session authorization
 */
export interface SessionAuthorization {
  roles: Role[];
  permissions: Permission[];
  policies: Policy[];
  accessControl: AccessControlConfig;
}

/**
 * Role definition
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  hierarchy: number;
  inheritFrom?: string[];
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
  conditions: Condition[];
}

/**
 * Condition definition
 */
export interface Condition {
  type: ConditionType;
  operator: ConditionOperator;
  value: any;
  negate: boolean;
}

/**
 * Condition types
 */
export type ConditionType = 
  | 'time'             | 'location'         | 'device'           | 'role'
  | 'status'           | 'attribute'        | 'custom';

/**
 * Condition operators
 */
export type ConditionOperator = 
  | 'equals'           | 'not-equals'       | 'greater-than'     | 'less-than'
  | 'contains'         | 'not-contains'     | 'in'               | 'not-in'
  | 'matches'          | 'before'           | 'after'            | 'between';

/**
 * Policy definition
 */
export interface Policy {
  id: string;
  name: string;
  description: string;
  rules: Rule[];
  priority: number;
  enabled: boolean;
}

/**
 * Rule definition
 */
export interface Rule {
  id: string;
  condition: Condition;
  action: RuleAction;
  parameters: Record<string, any>;
}

/**
 * Rule actions
 */
export type RuleAction = 
  | 'allow'            | 'deny'             | 'log'              | 'alert'
  | 'escalate'         | 'transform'        | 'redirect';

/**
 * Access control configuration
 */
export interface AccessControlConfig {
  model: AccessControlModel;
  enforcement: EnforcementMode;
  caching: boolean;
  audit: boolean;
}

/**
 * Access control models
 */
export type AccessControlModel = 
  | 'RBAC'             | 'ABAC'             | 'PBAC'             | 'Hybrid'
  | 'Custom';

/**
 * Enforcement modes
 */
export type EnforcementMode = 
  | 'permissive'        | 'strict'           | 'monitoring'       | 'learning';

/**
 * Session audit configuration
 */
export interface SessionAudit {
  enabled: boolean;
  level: AuditLevel;
  events: AuditEvent[];
  retention: RetentionPolicy;
  realTime: boolean;
}

/**
 * Audit levels
 */
export type AuditLevel = 
  | 'minimal'           | 'standard'         | 'comprehensive'    | 'verbose';

/**
 * Audit events
 */
export type AuditEvent = 
  | 'join'             | 'leave'            | 'message'          | 'file-share'
  | 'screen-share'      | 'recording'        | 'permission-change' | 'error'
  | 'security-violation' | 'performance'      | 'custom';

/**
 * Quality metrics
 */
export interface QualityMetrics {
  overall: QualityScore;
  audio: AudioQualityMetrics;
  video: VideoQualityMetrics;
  network: NetworkQualityMetrics;
  experience: ExperienceMetrics;
  timestamp: Date;
}

/**
 * Quality score
 */
export interface QualityScore {
  value: number; // 0-100
  category: QualityCategory;
  trend: QualityTrend;
  factors: QualityFactor[];
}

/**
 * Quality categories
 */
export type QualityCategory = 
  | 'excellent'         | 'good'             | 'fair'             | 'poor'
  | 'unacceptable';

/**
 * Quality trends
 */
export type QualityTrend = 
  | 'improving'        | 'stable'           | 'degrading'        | 'fluctuating';

/**
 * Quality factors
 */
export interface QualityFactor {
  name: string;
  value: number;
  weight: number;
  impact: 'high' | 'medium' | 'low';
}

/**
 * Audio quality metrics
 */
export interface AudioQualityMetrics {
  clarity: number; // 0-100
  volume: number; // 0-100
  noise: number; // 0-100 (lower is better)
  echo: number; // 0-100 (lower is better)
  latency: number; // milliseconds
  jitter: number; // milliseconds
  packetLoss: number; // percentage
  mos: number; // Mean Opinion Score 1-5
}

/**
 * Video quality metrics
 */
export interface VideoQualityMetrics {
  resolution: string;
  frameRate: number;
  bitrate: number; // kbps
  clarity: number; // 0-100
  smoothness: number; // 0-100
  colorAccuracy: number; // 0-100
  latency: number; // milliseconds
  jitter: number; // milliseconds
  packetLoss: number; // percentage
  freezeRate: number; // percentage
}

/**
 * Network quality metrics
 */
export interface NetworkQualityMetrics {
  bandwidth: NetworkBandwidth;
  latency: number; // milliseconds
  jitter: number; // milliseconds
  packetLoss: number; // percentage
  connectionStability: number; // 0-100
  routeEfficiency: number; // 0-100
  congestion: number; // 0-100
}

/**
 * Experience metrics
 */
export interface ExperienceMetrics {
  satisfaction: number; // 0-100
  engagement: number; // 0-100
  responsiveness: number; // 0-100
  reliability: number; // 0-100
  usability: number; // 0-100
  accessibility: number; // 0-100
}

// ============================================================================
// COMMUNICATION STANDARDS AND PROTOCOLS
// ============================================================================

/**
 * Communication protocol definition
 */
export interface CommunicationProtocol {
  id: string;
  name: string;
  version: string;
  type: ProtocolType;
  transport: TransportProtocol;
  format: MessageFormat;
  security: SecurityProtocol;
  reliability: ReliabilityProtocol;
  performance: PerformanceProtocol;
}

/**
 * Protocol types
 */
export type ProtocolType = 
  | 'messaging'         | 'streaming'        | 'file-transfer'     | 'broadcast'
  | 'multicast'        | 'discovery'        | 'signaling'        | 'control';

/**
 * Transport protocols
 */
export type TransportProtocol = 
  | 'TCP'              | 'UDP'              | 'WebSocket'        | 'WebRTC'
  | 'HTTP'             | 'HTTPS'            | 'gRPC'             | 'MQTT'
  | 'AMQP'             | 'STOMP'            | 'SSE'              | 'Custom';

/**
 * Message formats
 */
export type MessageFormat = 
  | 'JSON'             | 'XML'              | 'Protocol-Buffers' | 'MessagePack'
  | 'CBOR'             | 'Avro'             | 'FlatBuffers'      | 'Custom';

/**
 * Security protocols
 */
export type SecurityProtocol = 
  | 'TLS-1.3'          | 'DTLS-1.3'         | 'QUIC'             | 'Custom-Encryption'
  | 'End-to-End'       | 'Hybrid'           | 'Quantum-Safe';

/**
 * Reliability protocols
 */
export type ReliabilityProtocol = 
  | 'ACK-NACK'          | 'Selective-Repeat'  | 'Go-Back-N'        | 'TCP-Style'
  | 'Custom-Retry';

/**
 * Performance protocols
 */
export type PerformanceProtocol = 
  | 'Adaptive-QoS'      | 'Traffic-Shaping'   | 'Load-Balancing'   | 'Caching'
  | 'Compression'        | 'Optimization';

/**
 * Protocol compatibility matrix
 */
export interface ProtocolCompatibility {
  protocol: string;
  version: string;
  compatibleWith: CompatibleProtocol[];
  deprecated: boolean;
  replacement?: string;
  migrationPath?: MigrationPath;
}

/**
 * Compatible protocol information
 */
export interface CompatibleProtocol {
  protocol: string;
  version: string;
  features: string[];
  limitations: string[];
}

/**
 * Migration path
 */
export interface MigrationPath {
  from: string;
  to: string;
  steps: MigrationStep[];
  timeline: string;
  impact: MigrationImpact;
}

/**
 * Migration step
 */
export interface MigrationStep {
  order: number;
  description: string;
  action: string;
  dependencies: string[];
  rollback: boolean;
}

/**
 * Migration impact
 */
export type MigrationImpact = 
  | 'minimal'           | 'moderate'         | 'significant'       | 'critical';

// ============================================================================
// ERROR HANDLING AND RETRY MECHANISMS
// ============================================================================

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  retry: RetryConfig;
  fallback: FallbackConfig;
  escalation: EscalationConfig;
  reporting: ErrorReportingConfig;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  multiplier: number;
  jitter: boolean;
  retryableErrors: string[];
}

/**
 * Fallback configuration
 */
export interface FallbackConfig {
  enabled: boolean;
  strategies: FallbackStrategy[];
  conditions: FallbackCondition[];
  timeout: number; // milliseconds
}

/**
 * Fallback strategy
 */
export interface FallbackStrategy {
  name: string;
  type: FallbackType;
  config: Record<string, any>;
  priority: number;
}

/**
 * Fallback types
 */
export type FallbackType = 
  | 'alternative-route'  | 'different-protocol' | 'cached-response'  | 'degraded-service'
  | 'manual-intervention' | 'emergency-mode';

/**
 * Fallback condition
 */
export interface FallbackCondition {
  metric: string;
  operator: ConditionOperator;
  threshold: number;
  duration: number; // milliseconds
}

/**
 * Escalation configuration
 */
export interface EscalationConfig {
  enabled: boolean;
  rules: EscalationRule[];
  channels: EscalationChannel[];
  timeouts: EscalationTimeout[];
}

/**
 * Escalation rule
 */
export interface EscalationRule {
  id: string;
  condition: Condition;
  action: EscalationAction;
  level: number;
  delay: number; // milliseconds
}

/**
 * Escalation actions
 */
export type EscalationAction = 
  | 'notify-admin'      | 'create-ticket'     | 'escalate-support' | 'auto-recovery'
  | 'failover'         | 'circuit-breaker';

/**
 * Escalation channels
 */
export interface EscalationChannel {
  type: EscalationChannelType;
  config: Record<string, any>;
  enabled: boolean;
  priority: number;
}

/**
 * Escalation channel types
 */
export type EscalationChannelType = 
  | 'email'            | 'sms'              | 'slack'            | 'pagerduty'
  | 'webhook'          | 'api'              | 'custom';

/**
 * Escalation timeout
 */
export interface EscalationTimeout {
  level: number;
  timeout: number; // milliseconds
  action: EscalationAction;
}

/**
 * Error reporting configuration
 */
export interface ErrorReportingConfig {
  enabled: boolean;
  destinations: ErrorDestination[];
  format: ErrorFormat;
  filters: ErrorFilter[];
  aggregation: ErrorAggregation;
}

/**
 * Error destination
 */
export interface ErrorDestination {
  type: ErrorDestinationType;
  endpoint: string;
  authentication: AuthenticationInfo;
  format: ErrorFormat;
  retry: RetryConfig;
}

/**
 * Error destination types
 */
export type ErrorDestinationType = 
  | 'logging-service'   | 'monitoring'       | 'alerting'         | 'database'
  | 'file'             | 'webhook'          | 'email';

/**
 * Error format
 */
export type ErrorFormat = 
  | 'JSON'             | 'XML'              | 'CSV'              | 'Syslog'
  | 'Custom';

/**
 * Error filter
 */
export interface ErrorFilter {
  field: string;
  operator: ConditionOperator;
  value: any;
  action: FilterAction;
}

/**
 * Filter actions
 */
export type FilterAction = 
  | 'include'           | 'exclude'           | 'transform'        | 'aggregate';

/**
 * Error aggregation
 */
export interface ErrorAggregation {
  enabled: boolean;
  window: number; // milliseconds
  threshold: number;
  groupBy: string[];
  alertOnThreshold: boolean;
}

// ============================================================================
// RATE LIMITING AND SPAM PROTECTION
// ============================================================================

/**
 * Rate limiting configuration
 */
export interface RateLimitingConfig {
  enabled: boolean;
  rules: RateLimitRule[];
  algorithm: RateLimitAlgorithm;
  storage: RateLimitStorage;
  enforcement: EnforcementMode;
}

/**
 * Rate limit rule
 */
export interface RateLimitRule {
  id: string;
  name: string;
  scope: RateLimitScope;
  limits: RateLimit[];
  priority: number;
  conditions: Condition[];
  actions: RateLimitAction[];
}

/**
 * Rate limit scopes
 */
export type RateLimitScope = 
  | 'global'           | 'per-user'         | 'per-agent'        | 'per-session'
  | 'per-ip'           | 'per-organization' | 'custom';

/**
 * Rate limit definition
 */
export interface RateLimit {
  metric: RateLimitMetric;
  value: number;
  window: number; // milliseconds
  burst?: number;
}

/**
 * Rate limit metrics
 */
export type RateLimitMetric = 
  | 'messages'         | 'bytes'            | 'requests'        | 'connections'
  | 'operations'       | 'cpu-time'         | 'memory'           | 'custom';

/**
 * Rate limit actions
 */
export interface RateLimitAction {
  type: RateLimitActionType;
  config: Record<string, any>;
  delay: number; // milliseconds
}

/**
 * Rate limit action types
 */
export type RateLimitActionType = 
  | 'reject'           | 'delay'            | 'throttle'         | 'queue'
  | 'degrade'          | 'notify';

/**
 * Rate limiting algorithms
 */
export type RateLimitAlgorithm = 
  | 'token-bucket'      | 'sliding-window'   | 'fixed-window'     | 'leaky-bucket'
  | 'adaptive'         | 'custom';

/**
 * Rate limit storage
 */
export interface RateLimitStorage {
  type: RateLimitStorageType;
  config: Record<string, any>;
  ttl: number; // seconds
  distributed: boolean;
}

/**
 * Rate limit storage types
 */
export type RateLimitStorageType = 
  | 'memory'           | 'redis'            | 'database'         | 'distributed-cache'
  | 'custom';

/**
 * Spam protection configuration
 */
export interface SpamProtectionConfig {
  enabled: boolean;
  filters: SpamFilter[];
  scoring: SpamScoringConfig;
  actions: SpamAction[];
  learning: SpamLearningConfig;
}

/**
 * Spam filter
 */
export interface SpamFilter {
  id: string;
  name: string;
  type: SpamFilterType;
  config: Record<string, any>;
  enabled: boolean;
  weight: number;
}

/**
 * Spam filter types
 */
export type SpamFilterType = 
  | 'keyword'          | 'pattern'          | 'frequency'        | 'reputation'
  | 'behavioral'       | 'machine-learning'  | 'external-service' | 'custom';

/**
 * Spam scoring configuration
 */
export interface SpamScoringConfig {
  enabled: boolean;
  threshold: number;
  weights: Record<string, number>;
  aggregation: ScoringAggregation;
}

/**
 * Scoring aggregation methods
 */
export type ScoringAggregation = 
  | 'sum'              | 'average'          | 'weighted-average'  | 'max'
  | 'custom';

/**
 * Spam actions
 */
export interface SpamAction {
  condition: Condition;
  action: SpamActionType;
  config: Record<string, any>;
}

/**
 * Spam action types
 */
export type SpamActionType = 
  | 'block'            | 'quarantine'       | 'flag'             | 'delay'
  | 'require-review'    | 'rate-limit'       | 'notify';

/**
 * Spam learning configuration
 */
export interface SpamLearningConfig {
  enabled: boolean;
  algorithm: LearningAlgorithm;
  feedback: FeedbackConfig;
  modelUpdate: ModelUpdateConfig;
}

/**
 * Learning algorithms
 */
export type LearningAlgorithm = 
  | 'naive-bayes'     | 'svm'              | 'neural-network'   | 'random-forest'
  | 'ensemble'         | 'deep-learning'    | 'custom';

/**
 * Feedback configuration
 */
export interface FeedbackConfig {
  enabled: boolean;
  sources: FeedbackSource[];
  weight: number;
  validation: boolean;
}

/**
 * Feedback sources
 */
export type FeedbackSource = 
  | 'user-reports'     | 'admin-actions'    | 'automatic'        | 'external'
  | 'hybrid';

/**
 * Model update configuration
 */
export interface ModelUpdateConfig {
  frequency: ModelUpdateFrequency;
  validation: boolean;
  rollback: boolean;
  deployment: ModelDeploymentStrategy;
}

/**
 * Model update frequencies
 */
export type ModelUpdateFrequency = 
  | 'real-time'        | 'hourly'          | 'daily'            | 'weekly'
  | 'monthly'          | 'custom';

/**
 * Model deployment strategies
 */
export type ModelDeploymentStrategy = 
  | 'immediate'        | 'canary'          | 'blue-green'       | 'gradual'
  | 'custom';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const AgentMessageSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  senderId: z.string(),
  recipientId: z.union([z.string(), z.array(z.string())]),
  sessionId: z.string().optional(),
  type: z.enum(['text', 'file', 'task', 'result', 'knowledge', 'system', 'heartbeat', 'discovery', 'handshake', 'error', 'status', 'collaboration', 'marketplace', 'performance', 'security', 'voice', 'video', 'typing', 'read_receipt', 'presence']),
  content: z.object({
    format: z.enum(['text', 'json', 'xml', 'binary', 'base64', 'multipart', 'encrypted', 'signed', 'stream', 'blob', 'arraybuffer', 'url']),
    data: z.any(),
    encoding: z.string().optional(),
    compression: z.object({
      algorithm: z.enum(['gzip', 'deflate', 'brotli', 'lz4', 'zstd', 'custom']),
      level: z.number().min(1).max(9),
      originalSize: z.number(),
      compressedSize: z.number(),
      ratio: z.number()
    }).optional(),
    localization: z.object({
      language: z.string(),
      region: z.string(),
      timezone: z.string(),
      currency: z.string().optional(),
      dateFormat: z.string(),
      numberFormat: z.string()
    }).optional()
  }),
  payload: z.any().optional(),
  timestamp: z.date(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'critical', 'emergency']),
  encrypted: z.boolean(),
  signed: z.boolean(),
  routing: z.object({
    path: z.array(z.string()),
    protocol: z.enum(['direct', 'broadcast', 'multicast', 'anycast', 'peer-to-peer', 'relay', 'store-and-forward', 'flood']),
    strategy: z.enum(['shortest_path', 'least_cost', 'fastest_delivery', 'most_reliable', 'load_balanced', 'priority_based', 'security_first', 'adaptive']),
    fallback: z.object({
      enabled: z.boolean(),
      strategies: z.array(z.enum(['shortest_path', 'least_cost', 'fastest_delivery', 'most_reliable', 'load_balanced', 'priority_based', 'security_first', 'adaptive'])),
      timeout: z.number(),
      retryCount: z.number(),
      backoffStrategy: z.enum(['linear', 'exponential', 'fixed', 'jitter', 'adaptive'])
    }),
    multicast: z.object({
      groupId: z.string(),
      members: z.array(z.string()),
      exclude: z.array(z.string()).optional(),
      ttl: z.number().optional()
    }).optional()
  }),
  delivery: z.object({
    status: z.enum(['pending', 'queued', 'in_transit', 'delivered', 'read', 'acknowledged', 'failed', 'expired', 'cancelled']),
    attempts: z.number(),
    lastAttempt: z.date().optional(),
    deliveredAt: z.date().optional(),
    readAt: z.date().optional(),
    acknowledged: z.boolean(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      retryable: z.boolean(),
      category: z.enum(['network', 'routing', 'security', 'protocol', 'format', 'timeout', 'resource', 'permission', 'authentication', 'authorization', 'rate_limit', 'quota', 'system']),
      severity: z.enum(['low', 'medium', 'high', 'critical'])
    }).optional(),
    trace: z.array(z.object({
      hop: z.number(),
      nodeId: z.string(),
      timestamp: z.date(),
      action: z.enum(['sent', 'received', 'forwarded', 'processed', 'failed']),
      duration: z.number().optional(),
      metadata: z.record(z.any()).optional()
    }))
  }),
  security: z.object({
    encryption: z.object({
      algorithm: z.enum(['AES-256-GCM', 'ChaCha20-Poly1305', 'RSA-OAEP-256', 'ECDH-ES', 'Quantum-Resistant', 'Hybrid', 'End-to-End', 'Transport']),
      keyId: z.string(),
      iv: z.string().optional(),
      keyExchange: z.enum(['RSA', 'Diffie-Hellman', 'ECDH', 'Quantum-Key-Distribution', 'Pre-Shared', 'Certificate-Based', 'Blockchain-Based', 'KMS-Managed']),
      strength: z.enum(['standard', 'high', 'military', 'quantum-safe', 'custom']),
      compliant: z.boolean()
    }),
    signature: z.object({
      algorithm: z.enum(['ECDSA-P256', 'ECDSA-P384', 'RSA-PSS-2048', 'RSA-PSS-4096', 'Ed25519', 'Quantum-Safe', 'Multi-Signature', 'Threshold']),
      keyId: z.string(),
      signature: z.string(),
      timestamp: z.date(),
      valid: z.boolean(),
      verified: z.boolean().optional()
    }),
    authentication: z.object({
      method: z.enum(['token', 'certificate', 'biometric', 'multi-factor', 'zero-knowledge', 'blockchain', 'decentralized', 'federated']),
      credentials: z.object({
        type: z.enum(['JWT', 'X.509', 'DID', 'Verifiable-Credential', 'API-Key', 'OAuth-Token', 'Session-Token', 'Hardware-Token']),
        identifier: z.string(),
        issuer: z.string(),
        issuedAt: z.date(),
        expiresAt: z.date().optional(),
        revoked: z.boolean(),
        trustLevel: z.enum(['untrusted', 'low', 'medium', 'high', 'critical', 'root'])
      }),
      sessionId: z.string().optional(),
      expiresAt: z.date().optional(),
      mfa: z.object({
        enabled: z.boolean(),
        methods: z.array(z.enum(['TOTP', 'SMS', 'Email', 'Hardware-Key', 'Biometric', 'Push-Notification', 'Backup-Codes'])),
        verified: z.boolean(),
        challenge: z.string().optional()
      }).optional()
    }),
    integrity: z.object({
      algorithm: z.enum(['SHA-256', 'SHA-512', 'BLAKE3', 'CRC32', 'HMAC-SHA256', 'Quantum-Resistant', 'Merkle-Tree']),
      checksum: z.string(),
      verified: z.boolean(),
      timestamp: z.date()
    }),
    privacy: z.object({
      level: z.enum(['public', 'internal', 'confidential', 'secret', 'top-secret']),
      anonymization: z.object({
        enabled: z.boolean(),
        method: z.enum(['hashing', 'tokenization', 'masking', 'generalization', 'differential-privacy', 'k-anonymity', 'l-diversity']),
        dataTypes: z.array(z.string()),
        reversible: z.boolean()
      }),
      dataRetention: z.object({
        duration: z.number(),
        autoDelete: z.boolean(),
        archival: z.boolean(),
        legalHold: z.boolean()
      }),
      compliance: z.object({
        frameworks: z.array(z.enum(['GDPR', 'HIPAA', 'SOC2', 'PCI-DSS', 'ISO-27001', 'NIST', 'CCPA', 'POPIA'])),
        auditRequired: z.boolean(),
        dataLocation: z.array(z.string()),
        crossBorder: z.boolean()
      })
    })
  }),
  metrics: z.object({
    size: z.number(),
    latency: z.number(),
    processingTime: z.number(),
    queueTime: z.number(),
    networkHops: z.number(),
    bandwidth: z.number(),
    compressionRatio: z.number().optional(),
    encryptionOverhead: z.number(),
    routingCost: z.number(),
    qualityScore: z.number().min(0).max(100)
  }),
  version: z.string(),
  compatibility: z.object({
    version: z.string(),
    minVersion: z.string(),
    maxVersion: z.string(),
    features: z.array(z.string()),
    deprecated: z.array(z.string()),
    experimental: z.array(z.string())
  })
});

export default AgentMessageSchema;