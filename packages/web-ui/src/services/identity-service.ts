import { Keypair, PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { axiomIdentities } from '../db/schema';

// Types
export type MENARegion = 'egypt' | 'gulf' | 'levantine' | 'north_africa';
export type LanguagePreference = 'ar' | 'ar-eg' | 'ar-ae' | 'ar-lb' | 'en';
export type SovereigntyLevel = 'basic' | 'enhanced' | 'full';

export interface WalletInfo {
  publicKey: string;
  balance: number;
  isValid: boolean;
  lastUpdated: Date;
}

export interface CulturalContext {
  businessEtiquette: string[];
  communicationStyle: 'direct' | 'indirect' | 'formal' | 'casual';
  trustBuildingMechanisms: string[];
  timeOrientation: 'future' | 'present' | 'past';
  hierarchySensitivity: 'high' | 'medium' | 'low';
}

export interface AgentIdentityData {
  id: string;
  agentName: string;
  walletPublicKey: string;
  status: 'ACTIVE' | 'SUSPENDED';
  reputation: number;
  dnaProfile: Record<string, any>;
  evolutionStage: number;
  languagePreference: LanguagePreference;
  region: MENARegion;
  culturalContext: CulturalContext;
  sovereigntyLevel: SovereigntyLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface MintAgentIdentityParams {
  agentName: string;
  blueprintId: string;
  region: MENARegion;
  culturalContext?: Partial<CulturalContext>;
}

export interface WalletOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  transactionHash?: string;
}

// Regional configurations for MENA markets
const REGIONAL_CONFIGS: Record<MENARegion, {
  defaultLanguage: LanguagePreference;
  timezone: string;
  currency: string;
  businessHours: { start: string; end: string };
  culturalDefaults: CulturalContext;
}> = {
  egypt: {
    defaultLanguage: 'ar-eg',
    timezone: 'Africa/Cairo',
    currency: 'EGP',
    businessHours: { start: '09:00', end: '17:00' },
    culturalDefaults: {
      businessEtiquette: ['respect_for_authority', 'personal_relationships_first', 'hospitality'],
      communicationStyle: 'indirect',
      trustBuildingMechanisms: ['personal_introduction', 'family_connections', 'religious_commonality'],
      timeOrientation: 'present',
      hierarchySensitivity: 'high'
    }
  },
  gulf: {
    defaultLanguage: 'ar-ae',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    businessHours: { start: '08:00', end: '16:00' },
    culturalDefaults: {
      businessEtiquette: ['formal_greetings', 'business_card_exchange', 'right_handed_handshakes'],
      communicationStyle: 'formal',
      trustBuildingMechanisms: ['religious_similarity', 'tribal_connections', 'business_reputation'],
      timeOrientation: 'future',
      hierarchySensitivity: 'high'
    }
  },
  levantine: {
    defaultLanguage: 'ar-lb',
    timezone: 'Asia/Damascus',
    currency: 'LBP',
    businessHours: { start: '09:00', end: '18:00' },
    culturalDefaults: {
      businessEtiquette: ['warm_greetings', 'coffee_culture', 'extended_conversations'],
      communicationStyle: 'indirect',
      trustBuildingMechanisms: ['personal_networks', 'regional_pride', 'family_business'],
      timeOrientation: 'present',
      hierarchySensitivity: 'medium'
    }
  },
  north_africa: {
    defaultLanguage: 'ar',
    timezone: 'Africa/Casablanca',
    currency: 'MAD',
    businessHours: { start: '09:00', end: '17:00' },
    culturalDefaults: {
      businessEtiquette: ['french_influence', 'arab_hospitality', 'negotiation_focus'],
      communicationStyle: 'direct',
      trustBuildingMechanisms: ['business_acumen', 'religious_respect', 'regional_networks'],
      timeOrientation: 'past',
      hierarchySensitivity: 'medium'
    }
  }
};

/**
 * Comprehensive Identity Service for Agent Sovereignty Protocol
 * Handles Solana wallet integration with MENA localization support
 */
export class IdentityService {
  private solanaConnection: Connection;
  private encryptionKey: string | null = null;

  constructor() {
    // Initialize Solana connection (using devnet for testing, mainnet for production)
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.solanaConnection = new Connection(rpcUrl, 'confirmed');
    
    // Initialize encryption key for secure key storage
    this.encryptionKey = process.env.IDENTITY_ENCRYPTION_KEY || null;
  }

  /**
   * Main function to mint agent identity with Solana wallet integration
   */
  async mintAgentIdentity(
    params: MintAgentIdentityParams
  ): Promise<WalletOperationResult & { identityData?: AgentIdentityData }> {
    try {
      console.log('🎯 Starting agent identity minting process...', params);

      // 1. Validate inputs
      const validation = this.validateMintParams(params);
      if (!validation.success) {
        return validation;
      }

      // 2. Generate secure Solana keypair
      const keypairResult = await this.generateSecureKeypair();
      if (!keypairResult.success || !keypairResult.data?.keypair) {
        return {
          success: false,
          error: `Keypair generation failed: ${keypairResult.error}`
        };
      }

      const keypair = keypairResult.data.keypair;

      // 3. Configure MENA localization settings
      const localizationConfig = this.getRegionalConfiguration(params.region);
      
      // 4. Merge custom cultural context with defaults
      const culturalContext = this.mergeCulturalContext(
        localizationConfig.culturalDefaults,
        params.culturalContext || {}
      );

      // 5. Create agent identity data
      const identityData: AgentIdentityData = {
        id: uuidv4(),
        agentName: params.agentName,
        walletPublicKey: keypair.publicKey.toString(),
        status: 'ACTIVE',
        reputation: 0,
        dnaProfile: {
          traits: {
            adaptability: 0.8,
            culturalIntelligence: 0.9,
            trustBuilding: 0.85
          },
          capabilities: ['mena_localization', 'cultural_adaptation', 'arabic_communication']
        },
        evolutionStage: 1,
        languagePreference: localizationConfig.defaultLanguage,
        region: params.region,
        culturalContext,
        sovereigntyLevel: 'basic',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 6. Store in database with transaction
      const dbResult = await this.storeIdentityInDatabase(identityData);
      if (!dbResult.success) {
        return {
          success: false,
          error: `Database storage failed: ${dbResult.error}`
        };
      }

      // 7. Perform wallet operations (balance check, validation)
      const walletValidation = await this.validateWallet(keypair.publicKey);
      if (!walletValidation.success) {
        console.warn('⚠️ Wallet validation failed, but continuing:', walletValidation.error);
      }

      // 8. Audit log the operation
      await this.logAuditEvent('MINT_AGENT_IDENTITY', {
        identityId: identityData.id,
        agentName: identityData.agentName,
        region: identityData.region,
        walletPublicKey: identityData.walletPublicKey,
        sovereigntyLevel: identityData.sovereigntyLevel
      });

      console.log('✅ Agent identity minted successfully:', identityData.id);
      return {
        success: true,
        data: {
          identityId: identityData.id,
          walletPublicKey: identityData.walletPublicKey,
          region: identityData.region,
          languagePreference: identityData.languagePreference
        },
        identityData
      };

    } catch (error) {
      console.error('❌ Error in mintAgentIdentity:', error);
      return {
        success: false,
        error: `Identity minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate secure Solana keypair with entropy
   */
  private async generateSecureKeypair(): Promise<WalletOperationResult & { data?: { keypair: Keypair; encryptedPrivateKey?: string } }> {
    try {
      // Generate random keypair
      const keypair = Keypair.generate();
      
      // Optional encryption for private key storage
      let encryptedPrivateKey: string | undefined;
      if (this.encryptionKey) {
        // Simple encryption (in production, use proper encryption like AES-256)
        encryptedPrivateKey = Buffer.from(keypair.secretKey).toString('base64');
      }

      console.log('🔑 Generated Solana keypair for wallet:', keypair.publicKey.toString());
      
      return {
        success: true,
        data: {
          keypair,
          encryptedPrivateKey
        }
      };
    } catch (error) {
      console.error('❌ Keypair generation error:', error);
      return {
        success: false,
        error: `Failed to generate keypair: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Store agent identity in Turso database
   */
  private async storeIdentityInDatabase(identityData: AgentIdentityData): Promise<WalletOperationResult> {
    try {
      const result = await db.insert(axiomIdentities).values({
        id: identityData.id,
        agentName: identityData.agentName,
        walletPublicKey: identityData.walletPublicKey,
        status: identityData.status,
        reputation: identityData.reputation,
        dnaProfile: JSON.stringify(identityData.dnaProfile),
        evolutionStage: identityData.evolutionStage,
        languagePreference: identityData.languagePreference,
        region: identityData.region,
        culturalContext: JSON.stringify(identityData.culturalContext),
        sovereigntyLevel: identityData.sovereigntyLevel,
        createdAt: identityData.createdAt,
        updatedAt: identityData.updatedAt
      });

      console.log('💾 Stored agent identity in database:', identityData.id);
      return { success: true };

    } catch (error) {
      console.error('❌ Database storage error:', error);
      return {
        success: false,
        error: `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate wallet public key and check balance
   */
  private async validateWallet(publicKey: PublicKey): Promise<WalletOperationResult & { data?: WalletInfo }> {
    try {
      // Check if public key is valid
      if (!PublicKey.isOnCurve(publicKey)) {
        return {
          success: false,
          error: 'Invalid Solana public key'
        };
      }

      // Get account info
      const accountInfo = await this.solanaConnection.getAccountInfo(publicKey);
      const balance = accountInfo ? accountInfo.lamports / LAMPORTS_PER_SOL : 0;

      const walletInfo: WalletInfo = {
        publicKey: publicKey.toString(),
        balance,
        isValid: true,
        lastUpdated: new Date()
      };

      console.log('💰 Wallet validation successful:', walletInfo.publicKey, 'Balance:', balance, 'SOL');
      
      return {
        success: true,
        data: walletInfo
      };

    } catch (error) {
      console.error('❌ Wallet validation error:', error);
      return {
        success: false,
        error: `Wallet validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get wallet information for an existing agent
   */
  async getWalletInfo(agentId: string): Promise<WalletOperationResult & { data?: WalletInfo }> {
    try {
      const [identity] = await db
        .select()
        .from(axiomIdentities)
        .where(eq(axiomIdentities.id, agentId));

      if (!identity) {
        return {
          success: false,
          error: 'Agent identity not found'
        };
      }

      const publicKey = new PublicKey(identity.walletPublicKey);
      return await this.validateWallet(publicKey);

    } catch (error) {
      console.error('❌ Get wallet info error:', error);
      return {
        success: false,
        error: `Failed to get wallet info: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update agent sovereignty level
   */
  async updateSovereigntyLevel(
    agentId: string, 
    newLevel: SovereigntyLevel
  ): Promise<WalletOperationResult> {
    try {
      const validLevels: SovereigntyLevel[] = ['basic', 'enhanced', 'full'];
      if (!validLevels.includes(newLevel)) {
        return {
          success: false,
          error: 'Invalid sovereignty level'
        };
      }

      await db
        .update(axiomIdentities)
        .set({ 
          sovereigntyLevel: newLevel,
          updatedAt: new Date()
        })
        .where(eq(axiomIdentities.id, agentId));

      await this.logAuditEvent('UPDATE_SOVEREIGNTY_LEVEL', {
        agentId,
        newLevel,
        timestamp: new Date()
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Update sovereignty level error:', error);
      return {
        success: false,
        error: `Failed to update sovereignty level: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get agent identity with cultural context
   */
  async getAgentIdentity(agentId: string): Promise<WalletOperationResult & { data?: AgentIdentityData }> {
    try {
      const [identity] = await db
        .select()
        .from(axiomIdentities)
        .where(eq(axiomIdentities.id, agentId));

      if (!identity) {
        return {
          success: false,
          error: 'Agent identity not found'
        };
      }

      const identityData: AgentIdentityData = {
        id: identity.id,
        agentName: identity.agentName,
        walletPublicKey: identity.walletPublicKey,
        status: identity.status,
        reputation: identity.reputation,
        dnaProfile: JSON.parse(identity.dnaProfile || '{}'),
        evolutionStage: identity.evolutionStage,
        languagePreference: identity.languagePreference as LanguagePreference,
        region: identity.region as MENARegion,
        culturalContext: JSON.parse(identity.culturalContext || '{}'),
        sovereigntyLevel: identity.sovereigntyLevel as SovereigntyLevel,
        createdAt: identity.createdAt!,
        updatedAt: identity.updatedAt!
      };

      return {
        success: true,
        data: identityData
      };

    } catch (error) {
      console.error('❌ Get agent identity error:', error);
      return {
        success: false,
        error: `Failed to get agent identity: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Private helper methods

  private validateMintParams(params: MintAgentIdentityParams): WalletOperationResult {
    // Validate agent name
    if (!params.agentName || params.agentName.trim().length === 0) {
      return { success: false, error: 'Agent name is required' };
    }

    if (params.agentName.length > 100) {
      return { success: false, error: 'Agent name too long (max 100 characters)' };
    }

    // Validate blueprint ID
    if (!params.blueprintId || params.blueprintId.trim().length === 0) {
      return { success: false, error: 'Blueprint ID is required' };
    }

    // Validate region
    const validRegions: MENARegion[] = ['egypt', 'gulf', 'levantine', 'north_africa'];
    if (!validRegions.includes(params.region)) {
      return { success: false, error: 'Invalid MENA region specified' };
    }

    return { success: true };
  }

  private getRegionalConfiguration(region: MENARegion) {
    return REGIONAL_CONFIGS[region];
  }

  private mergeCulturalContext(defaults: CulturalContext, overrides: Partial<CulturalContext>): CulturalContext {
    return {
      businessEtiquette: overrides.businessEtiquette || defaults.businessEtiquette,
      communicationStyle: overrides.communicationStyle || defaults.communicationStyle,
      trustBuildingMechanisms: overrides.trustBuildingMechanisms || defaults.trustBuildingMechanisms,
      timeOrientation: overrides.timeOrientation || defaults.timeOrientation,
      hierarchySensitivity: overrides.hierarchySensitivity || defaults.hierarchySensitivity
    };
  }

  private async logAuditEvent(eventType: string, metadata: Record<string, any>): Promise<void> {
    try {
      // In production, this would store in an audit log table
      console.log(`📋 AUDIT: ${eventType}`, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('❌ Audit logging error:', error);
      // Don't fail the main operation due to audit logging issues
    }
  }

  /**
   * Get all agent identities for a region (for marketplace filtering)
   */
  async getAgentsByRegion(region: MENARegion): Promise<WalletOperationResult & { data?: AgentIdentityData[] }> {
    try {
      const identities = await db
        .select()
        .from(axiomIdentities)
        .where(eq(axiomIdentities.region, region))
        .orderBy(desc(axiomIdentities.createdAt));

      const identityData: AgentIdentityData[] = identities.map(identity => ({
        id: identity.id,
        agentName: identity.agentName,
        walletPublicKey: identity.walletPublicKey,
        status: identity.status,
        reputation: identity.reputation,
        dnaProfile: JSON.parse(identity.dnaProfile || '{}'),
        evolutionStage: identity.evolutionStage,
        languagePreference: identity.languagePreference as LanguagePreference,
        region: identity.region as MENARegion,
        culturalContext: JSON.parse(identity.culturalContext || '{}'),
        sovereigntyLevel: identity.sovereigntyLevel as SovereigntyLevel,
        createdAt: identity.createdAt!,
        updatedAt: identity.updatedAt!
      }));

      return {
        success: true,
        data: identityData
      };

    } catch (error) {
      console.error('❌ Get agents by region error:', error);
      return {
        success: false,
        error: `Failed to get agents by region: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Assess transaction capability based on wallet balance and sovereignty level
   */
  async assessTransactionCapability(agentId: string): Promise<WalletOperationResult & { data?: {
    canTransact: boolean;
    maxTransactionAmount: number;
    requiredSovereigntyLevel: SovereigntyLevel;
    currentBalance: number;
  } }> {
    try {
      const walletResult = await this.getWalletInfo(agentId);
      const identityResult = await this.getAgentIdentity(agentId);
      
      if (!walletResult.success || !walletResult.data) {
        return {
          success: false,
          error: walletResult.error || 'Wallet info unavailable'
        };
      }

      if (!identityResult.success || !identityResult.data) {
        return {
          success: false,
          error: identityResult.error || 'Identity unavailable'
        };
      }

      const { sovereigntyLevel } = identityResult.data;
      const { balance } = walletResult.data;

      // Define capability requirements by sovereignty level
      const capabilityMap: Record<SovereigntyLevel, { minBalance: number; maxAmount: number }> = {
        basic: { minBalance: 0, maxAmount: 1 },
        enhanced: { minBalance: 1, maxAmount: 10 },
        full: { minBalance: 5, maxAmount: 100 }
      };

      const capabilities = capabilityMap[sovereigntyLevel];
      const canTransact = balance >= capabilities.minBalance;

      return {
        success: true,
        data: {
          canTransact,
          maxTransactionAmount: capabilities.maxAmount,
          requiredSovereigntyLevel: sovereigntyLevel,
          currentBalance: balance
        }
      };

    } catch (error) {
      console.error('❌ Assess transaction capability error:', error);
      return {
        success: false,
        error: `Failed to assess transaction capability: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const identityService = new IdentityService();