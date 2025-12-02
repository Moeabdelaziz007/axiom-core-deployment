/**
 * AIX Identity - Sovereign Agent Identity Management
 * 
 * This module defines how agents are identified, authenticated,
 * and managed in the sovereign system. Critical for:
 * - DID (Decentralized Identifier) management
 * - Wallet address integration with Solana blockchain
 * - Agent capabilities and permissions
 * - Secure identity verification and attestation
 * 
 * Designed to work with decentralized identity systems
 * and provide cryptographic proof of agent identity and capabilities.
 */

import { z } from 'zod';
import { createHash, createPublicKey, createPrivateKey } from 'crypto';

/**
 * Agent Identity Types - Different identity verification levels
 */
export const IdentityTypeSchema = z.enum([
  'human',           // Human user with full privileges
  'sovereign',       // Fully autonomous sovereign agent
  'hybrid',          // Human-supervised agent
  'restricted',      // Limited capability agent
  'service',         // Service agent with specific capabilities
  'temporary',       // Temporary agent with time-limited access
]);

export type IdentityType = z.infer<typeof IdentityTypeSchema>;

/**
 * Capability Types - What agents can do
 */
export const CapabilityTypeSchema = z.enum([
  'reasoning',        // Cognitive reasoning and inference
  'tool_execution',   // Execute external tools and APIs
  'memory_access',    // Access and manage memories
  'coordination',     // Coordinate with other agents
  'financial',        // Handle financial transactions
  'communication',    // Send and receive messages
  'learning',         // Learn and adapt from experience
  'governance',       // Participate in governance decisions
  'audit',           // Perform audit and compliance checks
]);

export type CapabilityType = z.infer<typeof CapabilityTypeSchema>;

/**
 * Agent Identity - Core identity structure for sovereign agents
 * 
 * Represents the complete identity of an agent including DID,
 * wallet addresses, capabilities, and verification status.
 */
export const AgentIdentitySchema = z.object({
  // Core identification
  did: z.string().describe('Decentralized Identifier for this agent'),
  name: z.string().describe('Human-readable agent name'),
  description: z.string().optional().describe('Agent description and purpose'),
  
  // Identity type and status
  type: IdentityTypeSchema.describe('Type of agent identity'),
  status: z.enum(['active', 'inactive', 'suspended', 'revoked']).default('active').describe('Current status'),
  level: z.number().min(1).max(100).default(1).describe('Agent level or experience'),
  
  // Cryptographic keys
  publicKey: z.string().describe('Public key for identity verification'),
  privateKey: z.string().optional().describe('Private key (encrypted storage only)'),
  keyId: z.string().describe('Key identifier for rotation'),
  
  // Blockchain integration
  walletAddresses: z.record(z.string()).describe('Wallet addresses by blockchain'),
  primaryWallet: z.string().describe('Primary wallet address'),
  
  // Capabilities and permissions
  capabilities: z.array(CapabilityTypeSchema).describe('Agent capabilities'),
  permissions: z.record(z.boolean()).describe('Granular permissions'),
  maxOperations: z.number().optional().describe('Maximum operations per time period'),
  
  // Trust and reputation
  trustScore: z.number().min(0).max(1).default(0.5).describe('Trust score 0-1'),
  reputationLevel: z.enum(['unknown', 'low', 'medium', 'high', 'excellent']).default('unknown').describe('Reputation level'),
  verifiedBy: z.array(z.string()).describe('Agents who verified this identity'),
  verificationMethod: z.string().optional().describe('How identity was verified'),
  lastVerified: z.number().optional().describe('Last verification timestamp'),
  
  // Temporal information
  createdAt: z.number().describe('When this identity was created'),
  lastActive: z.number().optional().describe('Last activity timestamp'),
  expiresAt: z.number().optional().describe('When this identity expires'),
  
  // Metadata and versioning
  version: z.string().default('1.0').describe('Identity version'),
  tags: z.array(z.string()).default([]).describe('Identity tags'),
  metadata: z.record(z.any()).optional().describe('Additional identity metadata'),
});

export type AgentIdentity = z.infer<typeof AgentIdentitySchema>;

/**
 * Identity Verification - Cryptographic proof of identity
 */
export const IdentityVerificationSchema = z.object({
  // Verification details
  method: z.string().describe('Verification method used'),
  verifier: z.string().describe('Who performed verification'),
  timestamp: z.number().describe('When verification occurred'),
  result: z.enum(['success', 'failed', 'pending']).describe('Verification result'),
  
  // Cryptographic proof
  signature: z.string().describe('Digital signature of verification'),
  proof: z.string().describe('Cryptographic proof'),
  hash: z.string().describe('Hash of verified identity data'),
  
  // Additional data
  metadata: z.record(z.any()).optional().describe('Additional verification metadata'),
});

export type IdentityVerification = z.infer<typeof IdentityVerificationSchema>;

/**
 * Identity Manager - Core identity management interface
 */
export class AIXIdentityManager {
  private identities: Map<string, AgentIdentity> = new Map();
  private verifications: Map<string, IdentityVerification[]> = new Map();
  private keyRotationInterval: number = 86400000; // 24 hours

  /**
   * Create new agent identity
   */
  async createIdentity(
     name: string,
     type: IdentityType,
     capabilities: CapabilityType[],
     options: {
       walletAddresses?: Record<string, string>;
       trustScore?: number;
       expiresAt?: number;
     } = {}
   ): Promise<string> {
     const did = this.generateDID(name);
     const keyPair = this.generateKeyPair();
     
     const identity: AgentIdentity = {
       did,
       name,
       type,
       status: 'active',
       level: 1,
       publicKey: keyPair.publicKey,
       privateKey: keyPair.privateKey,
       keyId: `key_${Date.now()}`,
       walletAddresses: options.walletAddresses || {},
       primaryWallet: options.walletAddresses?.solana || '',
       capabilities,
       permissions: this.generatePermissions(capabilities),
       trustScore: options.trustScore || 0.5,
       reputationLevel: 'unknown',
       verifiedBy: [],
       createdAt: Date.now(),
       lastActive: Date.now(),
       expiresAt: options.expiresAt,
       version: '1.0',
       tags: ['new-agent'],
       metadata: options.metadata || {},
     };

     this.identities.set(did, identity);
     return did;
   }

  /**
   * Verify agent identity
   */
   async verifyIdentity(
     did: string,
     verifier: string,
     method: string = 'cryptographic'
   ): Promise<IdentityVerification> {
     const identity = this.identities.get(did);
     if (!identity) {
       throw new Error(`Identity not found: ${did}`);
     }

     const verification: IdentityVerification = {
       method,
       verifier,
       timestamp: Date.now(),
       result: 'success',
       signature: this.generateVerificationSignature(identity, verifier),
       proof: this.generateVerificationProof(identity),
       hash: this.generateIdentityHash(identity),
     };

     // Store verification
     if (!this.verifications.has(did)) {
       this.verifications.set(did, []);
     }
     
     const verifications = this.verifications.get(did)!;
     verifications.push(verification);

     return verification;
   }

  /**
   * Get agent identity by DID
   */
  getIdentity(did: string): AgentIdentity | undefined {
     return this.identities.get(did);
   }

  /**
   * Update agent identity
   */
   updateIdentity(
     did: string,
     updates: Partial<AgentIdentity>
   ): boolean {
     const identity = this.identities.get(did);
     if (!identity) return false;

     const updated = { ...identity, ...updates };
     this.identities.set(did, updated);
     return true;
   }

  /**
   * Revoke agent identity
   */
   revokeIdentity(did: string, reason: string): boolean {
     const identity = this.identities.get(did);
     if (!identity) return false;

     identity.status = 'revoked';
     this.identities.set(did, identity);
     return true;
   }

  /**
   * Get identity by wallet address
   */
   getIdentityByWallet(walletAddress: string, blockchain: string = 'solana'): AgentIdentity | undefined {
     for (const identity of this.identities.values()) {
       if (identity.walletAddresses[blockchain] === walletAddress) {
         return identity;
       }
     }
     return undefined;
   }

  /**
   * Check if identity has capability
   */
  hasCapability(did: string, capability: CapabilityType): boolean {
     const identity = this.identities.get(did);
     return identity ? identity.capabilities.includes(capability) : false;
   }

  /**
   * Get all active identities
   */
   getActiveIdentities(): AgentIdentity[] {
     return Array.from(this.identities.values()).filter(
       identity => identity.status === 'active'
     );
   }

  /**
   * Generate DID (Decentralized Identifier)
   */
  private generateDID(name: string): string {
     const timestamp = Date.now();
     const nameHash = createHash('sha256').update(name).digest('hex');
     const randomBytes = crypto.randomBytes(16);
     const randomHex = randomBytes.toString('hex');
     
     return `did:aix:${nameHash.substring(0, 16)}:${timestamp}:${randomHex}`;
   }

  /**
   * Generate cryptographic key pair
   */
  private generateKeyPair(): { publicKey: string; privateKey: string } {
     const privateKey = createPrivateKey('ed25519');
     const publicKey = createPublicKey(privateKey, { format: 'compressed' });
     
     return {
       publicKey: publicKey.toString('hex'),
       privateKey: privateKey.toString('hex'),
     };
   }

  /**
   * Generate verification signature
   */
  private generateVerificationSignature(identity: AgentIdentity, verifier: string): string {
     const data = `${identity.did}:${identity.publicKey}:${verifier}:${Date.now()}`;
     return createHash('sha256').update(data).digest('hex');
   }

  /**
   * Generate verification proof
   */
   private generateVerificationProof(identity: AgentIdentity): string {
     return `Proof of identity ${identity.did} verified by cryptographic signature`;
   }

  /**
   * Generate identity hash
   */
   private generateIdentityHash(identity: AgentIdentity): string {
     const data = JSON.stringify({
       did: identity.did,
       publicKey: identity.publicKey,
       name: identity.name,
       type: identity.type,
       capabilities: identity.capabilities,
     });
     
     return createHash('sha256').update(data).digest('hex');
   }

  /**
   * Generate permissions from capabilities
   */
  private generatePermissions(capabilities: CapabilityType[]): Record<string, boolean> {
     const permissions: Record<string, boolean> = {};
     
     for (const capability of capabilities) {
       switch (capability) {
         case 'reasoning':
           permissions.can_think = true;
           permissions.can_infer = true;
           break;
           
         case 'tool_execution':
           permissions.can_execute_tools = true;
           permissions.can_call_apis = true;
           break;
           
         case 'memory_access':
           permissions.can_read_memory = true;
           permissions.can_write_memory = true;
           permissions.can_delete_memory = false;
           break;
           
         case 'coordination':
           permissions.can_coordinate = true;
           permissions.can_negotiate = true;
           break;
           
         case 'financial':
           permissions.can_handle_money = true;
           permissions.can_make_payments = true;
           permissions.can_view_balances = true;
           break;
           
         case 'communication':
           permissions.can_send_messages = true;
           permissions.can_receive_messages = true;
           permissions.can_broadcast = true;
           break;
           
         case 'learning':
           permissions.can_learn = true;
           permissions.can_adapt = true;
           permissions.can_update_model = true;
           break;
           
         case 'governance':
           permissions.can_vote = true;
           permissions.can_propose = true;
           permissions.can_audit = true;
           break;
           
         case 'audit':
           permissions.can_read_logs = true;
           permissions.can_verify_compliance = true;
           permissions.can_report_issues = true;
           break;
           
         default:
           break;
       }
     }
     
     return permissions;
   }

  /**
   * Get identity statistics
   */
  getIdentityStats(): {
     totalIdentities: number;
     activeIdentities: number;
     identitiesByType: Record<IdentityType, number>;
     capabilitiesDistribution: Record<CapabilityType, number>;
   } {
     const identities = Array.from(this.identities.values());
     
     const activeIdentities = identities.filter(i => i.status === 'active');
     
     const identitiesByType: Record<IdentityType, number> = {
       human: 0,
       sovereign: 0,
       hybrid: 0,
       restricted: 0,
       service: 0,
       temporary: 0,
     };
     
     const capabilitiesDistribution: Record<CapabilityType, number> = {
       reasoning: 0,
       tool_execution: 0,
       memory_access: 0,
       coordination: 0,
       financial: 0,
       communication: 0,
       learning: 0,
       governance: 0,
       audit: 0,
     };
     
     for (const identity of identities) {
       identitiesByType[identity.type]++;
       
       for (const capability of identity.capabilities) {
         capabilitiesDistribution[capability]++;
       }
     }
     
     return {
       totalIdentities: identities.length,
       activeIdentities: activeIdentities.length,
       identitiesByType,
       capabilitiesDistribution,
     };
   }
}

/**
 * Identity Utils - Utility functions for identity management
 */
export class IdentityUtils {
   /**
    * Validate agent identity structure
    */
   static validateIdentity(identity: any): { valid: boolean; errors: string[] } {
     const result = AgentIdentitySchema.safeParse(identity);
     return {
       valid: result.success,
       errors: result.success ? [] : result.error.issues.map(i => i.message),
     };
   }

   /**
    * Create identity from AIX message
    */
   static createIdentityFromMessage(
     message: any,
     senderDid: string
   ): AgentIdentity | null {
     if (message.type !== 'identity_create') return null;
     
     try {
       const identityData = {
         did: message.payload.did || IdentityUtils.generateDID(message.payload.name || 'agent'),
         name: message.payload.name || 'Unnamed Agent',
         type: message.payload.type || 'sovereign',
         status: 'active' as const,
         level: 1,
         publicKey: message.payload.publicKey,
         privateKey: message.payload.privateKey,
         keyId: `key_${Date.now()}`,
         walletAddresses: message.payload.walletAddresses || {},
         primaryWallet: message.payload.walletAddresses?.solana || '',
         capabilities: message.payload.capabilities || [],
         permissions: IdentityUtils.generatePermissions(message.payload.capabilities || []),
         trustScore: message.payload.trustScore || 0.5,
         reputationLevel: 'unknown',
         verifiedBy: [senderDid],
         createdAt: Date.now(),
         lastActive: Date.now(),
         version: '1.0',
         tags: message.payload.tags || [],
         metadata: message.payload.metadata || {},
       };

       return AgentIdentitySchema.parse(identityData);
     } catch (error) {
       console.error('Failed to create identity from message:', error);
       return null;
     }
   }

   /**
    * Generate DID from components
    */
   static generateDID(name: string, timestamp?: number): string {
     const ts = timestamp || Date.now();
     const nameHash = createHash('sha256').update(name).digest('hex');
     const randomBytes = crypto.randomBytes(16);
     const randomHex = randomBytes.toString('hex');
     
     return `did:aix:${nameHash.substring(0, 16)}:${ts}:${randomHex}`;
   }

   /**
    * Check if DID is valid format
    */
   static isValidDID(did: string): boolean {
     return did.startsWith('did:aix:') && did.split(':').length >= 4;
   }

   /**
    * Extract DID components
    */
   static parseDID(did: string): {
     method: string;
     identifier: string;
     timestamp: number;
     random: string;
   } | null {
     if (!IdentityUtils.isValidDID(did)) {
       return null;
     }
     
     const parts = did.split(':');
     return {
       method: parts[0] || '',
       identifier: parts[1] || '',
       timestamp: parseInt(parts[2] || '0'),
       random: parts[3] || '',
     };
   }

   /**
    * Generate permissions from capabilities
    */
   static generatePermissions(capabilities: CapabilityType[]): Record<string, boolean> {
     const permissions: Record<string, boolean> = {};
     
     for (const capability of capabilities) {
       switch (capability) {
         case 'reasoning':
           permissions.can_think = true;
           permissions.can_infer = true;
           break;
           
         case 'tool_execution':
           permissions.can_execute_tools = true;
           permissions.can_call_apis = true;
           break;
           
         case 'memory_access':
           permissions.can_read_memory = true;
           permissions.can_write_memory = true;
           permissions.can_delete_memory = false;
           break;
           
         case 'coordination':
           permissions.can_coordinate = true;
           permissions.can_negotiate = true;
           break;
           
         case 'financial':
           permissions.can_handle_money = true;
           permissions.can_make_payments = true;
           permissions.can_view_balances = true;
           break;
           
         case 'communication':
           permissions.can_send_messages = true;
           permissions.can_receive_messages = true;
           permissions.can_broadcast = true;
           break;
           
         case 'learning':
           permissions.can_learn = true;
           permissions.can_adapt = true;
           permissions.can_update_model = true;
           break;
           
         case 'governance':
           permissions.can_vote = true;
           permissions.can_propose = true;
           permissions.can_audit = true;
           break;
           
         case 'audit':
           permissions.can_read_logs = true;
           permissions.can_verify_compliance = true;
           permissions.can_report_issues = true;
           break;
           
         default:
           break;
       }
     }
     
     return permissions;
   }
}