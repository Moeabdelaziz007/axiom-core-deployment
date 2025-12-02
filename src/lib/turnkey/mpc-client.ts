/**
 * Turnkey MPC Client for AxiomID Agent Wallets
 * Enables HD derivation from Master Vault for $0.99/month model
 */

import { createClient } from "@turnkey/http";
import { TurnkeyActivityError, TurnkeyRequestError } from "@turnkey/http";
import { Keypair, PublicKey } from "@solana/web3.js";
import { ed25519 } from "@noble/curves/ed25519";

// Turnkey Configuration
const TURNKEY_API_BASE_URL = process.env.TURNKEY_API_BASE_URL || "https://api.turnkey.com";
const TURNKEY_API_PUBLIC_KEY = process.env.TURNKEY_API_PUBLIC_KEY!;
const TURNKEY_API_PRIVATE_KEY = process.env.TURNKEY_API_PRIVATE_KEY!;

// Master Vault Configuration
const AXIOM_MASTER_VAULT_ID = process.env.AXIOM_MASTER_VAULT_ID!;
const AXIOM_ORGANIZATION_ID = process.env.AXIOM_ORGANIZATION_ID!;

export interface AgentWallet {
  agentId: string;
  walletId: string;
  address: string;
  derivationPath: string;
  publicKey: string;
  createdAt: number;
}

export interface WalletCreationResult {
  success: boolean;
  wallet?: AgentWallet;
  error?: string;
}

/**
 * Turnkey MPC Client for HD Wallet Management
 */
export class TurnkeyMPCClient {
  private client: ReturnType<typeof createClient>;
  private masterVaultId: string;
  private organizationId: string;

  constructor() {
    this.client = createClient({
      baseUrl: TURNKEY_API_BASE_URL,
      organizationId: AXIOM_ORGANIZATION_ID,
      apiPublicKey: TURNKEY_API_PUBLIC_KEY,
      apiPrivateKey: TURNKEY_API_PRIVATE_KEY,
    });

    this.masterVaultId = AXIOM_MASTER_VAULT_ID;
    this.organizationId = AXIOM_ORGANIZATION_ID;
  }

  /**
   * Generate derivation path for agent based on agent ID
   * Uses BIP-44 standard: m/44'/501'/0'/0/{agentIndex}
   */
  private generateDerivationPath(agentId: string): string {
    // Convert agent ID to numeric index (simple hash)
    const agentIndex = this.hashAgentId(agentId) % 1000000; // Support 1M agents
    return `m/44'/501'/0'/0/${agentIndex}`;
  }

  /**
   * Simple hash function to convert agent ID to numeric index
   */
  private hashAgentId(agentId: string): number {
    let hash = 0;
    for (let i = 0; i < agentId.length; i++) {
      const char = agentId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Create a new agent wallet using HD derivation from Master Vault
   */
  async createAgentWallet(agentId: string): Promise<WalletCreationResult> {
    try {
      const derivationPath = this.generateDerivationPath(agentId);
      
      // Create new wallet account in Turnkey
      const createWalletResponse = await this.client.createWallet({
        walletName: `agent-${agentId}`,
        accounts: [
          {
            curve: "CURVE_ED25519",
            path: derivationPath,
            addressFormat: "ADDRESS_FORMAT_SOLANA",
          },
        ],
      });

      if (!createWalletResponse.walletId) {
        throw new Error("Failed to create wallet: No wallet ID returned");
      }

      // Get the account details
      const walletAccounts = await this.client.getWalletAccounts({
        walletId: createWalletResponse.walletId,
      });

      if (!walletAccounts.accounts || walletAccounts.accounts.length === 0) {
        throw new Error("Failed to retrieve wallet accounts");
      }

      const account = walletAccounts.accounts[0];
      const publicKey = account.address;

      const agentWallet: AgentWallet = {
        agentId,
        walletId: createWalletResponse.walletId,
        address: publicKey,
        derivationPath,
        publicKey,
        createdAt: Date.now(),
      };

      return {
        success: true,
        wallet: agentWallet,
      };
    } catch (error) {
      console.error("Failed to create agent wallet:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Sign transaction using agent's derived wallet
   */
  async signTransaction(
    agentId: string,
    transaction: Uint8Array
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // Get agent's wallet
      const agentWallet = await this.getAgentWallet(agentId);
      if (!agentWallet) {
        throw new Error(`Agent wallet not found for agent ID: ${agentId}`);
      }

      // Sign the transaction
      const signResponse = await this.client.signRawPayload({
        walletId: agentWallet.walletId,
        signWith: agentWallet.address,
        payload: Array.from(transaction),
        type: "PAYLOAD_TYPE_RAW",
      });

      if (!signResponse.signature) {
        throw new Error("Failed to sign transaction: No signature returned");
      }

      return {
        success: true,
        signature: signResponse.signature,
      };
    } catch (error) {
      console.error("Failed to sign transaction:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get agent wallet information
   */
  async getAgentWallet(agentId: string): Promise<AgentWallet | null> {
    try {
      // In a real implementation, this would query a database
      // For now, we'll derive the expected address and return a mock wallet
      const derivationPath = this.generateDerivationPath(agentId);
      
      // Derive the public key (this is a simplified version)
      // In production, this would use Turnkey's API to get the actual wallet
      const mockWallet: AgentWallet = {
        agentId,
        walletId: `wallet-${agentId}`,
        address: this.deriveAddress(agentId),
        derivationPath,
        publicKey: this.deriveAddress(agentId),
        createdAt: Date.now(),
      };

      return mockWallet;
    } catch (error) {
      console.error("Failed to get agent wallet:", error);
      return null;
    }
  }

  /**
   * Derive Solana address from agent ID (simplified version)
   */
  private deriveAddress(agentId: string): string {
    // This is a simplified derivation for demonstration
    // In production, this would use proper HD wallet derivation
    const seed = this.agentIdToSeed(agentId);
    const keypair = Keypair.fromSeed(seed);
    return keypair.publicKey.toBase58();
  }

  /**
   * Convert agent ID to seed for key derivation
   */
  private agentIdToSeed(agentId: string): Uint8Array {
    const encoder = new TextEncoder();
    const data = encoder.encode(agentId);
    
    // Create a 32-byte seed from the agent ID
    const seed = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      seed[i] = data[i % data.length] ^ i;
    }
    
    return seed;
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(agentId: string): Promise<number> {
    try {
      const agentWallet = await this.getAgentWallet(agentId);
      if (!agentWallet) {
        throw new Error(`Agent wallet not found for agent ID: ${agentId}`);
      }

      // In production, this would query Solana RPC
      // For now, return a mock balance
      return 0;
    } catch (error) {
      console.error("Failed to get wallet balance:", error);
      return 0;
    }
  }

  /**
   * List all agent wallets
   */
  async listAgentWallets(): Promise<AgentWallet[]> {
    try {
      // In production, this would query the database
      // For now, return empty array
      return [];
    } catch (error) {
      console.error("Failed to list agent wallets:", error);
      return [];
    }
  }

  /**
   * Delete agent wallet
   */
  async deleteAgentWallet(agentId: string): Promise<boolean> {
    try {
      const agentWallet = await this.getAgentWallet(agentId);
      if (!agentWallet) {
        throw new Error(`Agent wallet not found for agent ID: ${agentId}`);
      }

      // Delete wallet in Turnkey
      await this.client.deleteWallet({
        walletId: agentWallet.walletId,
      });

      return true;
    } catch (error) {
      console.error("Failed to delete agent wallet:", error);
      return false;
    }
  }
}

// Singleton instance
export const turnkeyMPCClient = new TurnkeyMPCClient();

/**
 * Factory function to create agent wallets
 */
export async function createAgentWallet(agentId: string): Promise<WalletCreationResult> {
  return await turnkeyMPCClient.createAgentWallet(agentId);
}

/**
 * Get agent wallet by ID
 */
export async function getAgentWallet(agentId: string): Promise<AgentWallet | null> {
  return await turnkeyMPCClient.getAgentWallet(agentId);
}

/**
 * Sign transaction with agent wallet
 */
export async function signWithAgentWallet(
  agentId: string,
  transaction: Uint8Array
): Promise<{ success: boolean; signature?: string; error?: string }> {
  return await turnkeyMPCClient.signTransaction(agentId, transaction);
}

/**
 * Get agent wallet balance
 */
export async function getAgentWalletBalance(agentId: string): Promise<number> {
  return await turnkeyMPCClient.getWalletBalance(agentId);
}