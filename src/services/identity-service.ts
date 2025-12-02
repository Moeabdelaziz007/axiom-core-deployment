/**
 * AxiomID Identity Service with HD Wallet Derivation
 * Implements BIP-44 derivation for scalable agent wallet generation
 */

import { createClient } from '@libsql/client';
import { Keypair, PublicKey } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import { mnemonicToSeedSync } from 'bip39';
import { hashAgentId } from '@/lib/utils/crypto';

// Database configuration
const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Master Seed Configuration (for development - use Turnkey in production)
const MASTER_MNEMONIC = process.env.AXIOM_MASTER_MNEMONIC!;
if (!MASTER_MNEMONIC) {
  throw new Error('AXIOM_MASTER_MNEMONIC environment variable is required');
}

// BIP-44 Configuration for Solana
const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";

export interface AgentIdentity {
  id: string;
  agentId: string;
  agentType: string;
  publicKey: string;
  derivationPath: string;
  walletAddress: string;
  createdAt: number;
  updatedAt: number;
}

export interface MintIdentityResult {
  success: boolean;
  identity?: AgentIdentity;
  error?: string;
}

/**
 * Identity Service for managing agent identities with HD wallet derivation
 */
export class IdentityService {
  private masterSeed: Buffer;
  private db: ReturnType<typeof createClient>;

  constructor() {
    // Derive master seed from mnemonic (NEVER store this, only derive in memory)
    this.masterSeed = mnemonicToSeedSync(MASTER_MNEMONIC);
    this.db = db;
  }

  /**
   * Generate derivation path for agent based on agent ID
   * Uses BIP-44 standard: m/44'/501'/0'/0'/{agent_index}'
   */
  private generateDerivationPath(agentId: string): string {
    // Convert agent ID to numeric index using hash function
    const agentIndex = hashAgentId(agentId) % 1000000; // Support 1M agents
    return `${SOLANA_DERIVATION_PATH}/${agentIndex}'`;
  }

  /**
   * Derive keypair from master seed using derivation path
   */
  private deriveKeypair(derivationPath: string): Keypair {
    const derivedKey = derivePath(derivationPath, this.masterSeed.toString('hex')).key;
    return Keypair.fromSeed(derivedKey);
  }

  /**
   * Mint a new agent identity with HD-derived wallet
   */
  async mintAgentIdentity(
    agentId: string,
    agentType: string
  ): Promise<MintIdentityResult> {
    try {
      // Check if identity already exists
      const existingIdentity = await this.getIdentity(agentId);
      if (existingIdentity) {
        return {
          success: false,
          error: `Identity already exists for agent: ${agentId}`,
        };
      }

      // Generate derivation path
      const derivationPath = this.generateDerivationPath(agentId);

      // Derive keypair (private key never stored)
      const keypair = this.deriveKeypair(derivationPath);
      const publicKey = keypair.publicKey.toBase58();
      const walletAddress = publicKey; // For Solana, public key = wallet address

      // Store only public information in database
      const identity: AgentIdentity = {
        id: `identity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        agentType,
        publicKey,
        derivationPath,
        walletAddress,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Insert into database
      await this.db.execute({
        sql: `
          INSERT INTO axiom_identities (
            id, agent_id, agent_type, public_key, derivation_path, 
            wallet_address, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          identity.id,
          identity.agentId,
          identity.agentType,
          identity.publicKey,
          identity.derivationPath,
          identity.walletAddress,
          identity.createdAt,
          identity.updatedAt,
        ],
      });

      return {
        success: true,
        identity,
      };
    } catch (error) {
      console.error('Failed to mint agent identity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get agent identity by agent ID
   */
  async getIdentity(agentId: string): Promise<AgentIdentity | null> {
    try {
      const result = await this.db.execute({
        sql: `
          SELECT id, agent_id, agent_type, public_key, derivation_path,
                 wallet_address, created_at, updated_at
          FROM axiom_identities
          WHERE agent_id = ?
        `,
        args: [agentId],
      });

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id as string,
        agentId: row.agent_id as string,
        agentType: row.agent_type as string,
        publicKey: row.public_key as string,
        derivationPath: row.derivation_path as string,
        walletAddress: row.wallet_address as string,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      };
    } catch (error) {
      console.error('Failed to get agent identity:', error);
      return null;
    }
  }

  /**
   * Get all identities for a specific agent type
   */
  async getIdentitiesByType(agentType: string): Promise<AgentIdentity[]> {
    try {
      const result = await this.db.execute({
        sql: `
          SELECT id, agent_id, agent_type, public_key, derivation_path,
                 wallet_address, created_at, updated_at
          FROM axiom_identities
          WHERE agent_type = ?
          ORDER BY created_at DESC
        `,
        args: [agentType],
      });

      return result.rows.map(row => ({
        id: row.id as string,
        agentId: row.agent_id as string,
        agentType: row.agent_type as string,
        publicKey: row.public_key as string,
        derivationPath: row.derivation_path as string,
        walletAddress: row.wallet_address as string,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      }));
    } catch (error) {
      console.error('Failed to get identities by type:', error);
      return [];
    }
  }

  /**
   * Update agent identity
   */
  async updateIdentity(
    agentId: string,
    updates: Partial<Pick<AgentIdentity, 'agentType'>>
  ): Promise<boolean> {
    try {
      const setClause = [];
      const args = [];

      if (updates.agentType) {
        setClause.push('agent_type = ?');
        args.push(updates.agentType);
      }

      if (setClause.length === 0) {
        return true; // No updates needed
      }

      setClause.push('updated_at = ?');
      args.push(Date.now());
      args.push(agentId);

      await this.db.execute({
        sql: `
          UPDATE axiom_identities
          SET ${setClause.join(', ')}
          WHERE agent_id = ?
        `,
        args,
      });

      return true;
    } catch (error) {
      console.error('Failed to update agent identity:', error);
      return false;
    }
  }

  /**
   * Delete agent identity
   */
  async deleteIdentity(agentId: string): Promise<boolean> {
    try {
      await this.db.execute({
        sql: 'DELETE FROM axiom_identities WHERE agent_id = ?',
        args: [agentId],
      });

      return true;
    } catch (error) {
      console.error('Failed to delete agent identity:', error);
      return false;
    }
  }

  /**
   * Get wallet address for agent
   */
  async getWalletAddress(agentId: string): Promise<string | null> {
    const identity = await this.getIdentity(agentId);
    return identity?.walletAddress || null;
  }

  /**
   * List all agent identities
   */
  async listIdentities(): Promise<AgentIdentity[]> {
    try {
      const result = await this.db.execute({
        sql: `
          SELECT id, agent_id, agent_type, public_key, derivation_path,
                 wallet_address, created_at, updated_at
          FROM axiom_identities
          ORDER BY created_at DESC
        `,
      });

      return result.rows.map(row => ({
        id: row.id as string,
        agentId: row.agent_id as string,
        agentType: row.agent_type as string,
        publicKey: row.public_key as string,
        derivationPath: row.derivation_path as string,
        walletAddress: row.wallet_address as string,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      }));
    } catch (error) {
      console.error('Failed to list identities:', error);
      return [];
    }
  }

  /**
   * Get identity statistics
   */
  async getIdentityStats(): Promise<{
    total: number;
    byType: Record<string, number>;
  }> {
    try {
      const totalResult = await this.db.execute({
        sql: 'SELECT COUNT(*) as count FROM axiom_identities',
      });

      const byTypeResult = await this.db.execute({
        sql: `
          SELECT agent_type, COUNT(*) as count
          FROM axiom_identities
          GROUP BY agent_type
        `,
      });

      const total = totalResult.rows[0].count as number;
      const byType: Record<string, number> = {};

      for (const row of byTypeResult.rows) {
        byType[row.agent_type as string] = row.count as number;
      }

      return { total, byType };
    } catch (error) {
      console.error('Failed to get identity stats:', error);
      return { total: 0, byType: {} };
    }
  }
}

// Singleton instance
export const identityService = new IdentityService();

/**
 * Factory function to mint agent identity
 */
export async function mintAgentIdentity(
  agentId: string,
  agentType: string
): Promise<MintIdentityResult> {
  return await identityService.mintAgentIdentity(agentId, agentType);
}

/**
 * Get agent identity
 */
export async function getAgentIdentity(agentId: string): Promise<AgentIdentity | null> {
  return await identityService.getIdentity(agentId);
}

/**
 * Get agent wallet address
 */
export async function getAgentWalletAddress(agentId: string): Promise<string | null> {
  return await identityService.getWalletAddress(agentId);
}

/**
 * List all agent identities
 */
export async function listAgentIdentities(): Promise<AgentIdentity[]> {
  return await identityService.listIdentities();
}

/**
 * Get identity statistics
 */
export async function getIdentityStats(): Promise<{
  total: number;
  byType: Record<string, number>;
}> {
  return await identityService.getIdentityStats();
}