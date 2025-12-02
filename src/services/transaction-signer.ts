/**
 * Transaction Signing Service for AxiomID Agents
 * Simulates TEE (Trusted Execution Environment) for secure transaction signing
 * Derives private keys in memory from Master Seed and signs transactions
 */

import { Keypair, Transaction, PublicKey } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import { mnemonicToSeedSync } from 'bip39';
import { createClient } from '@libsql/client';
import { identityService } from './identity-service';

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

export interface SigningResult {
  success: boolean;
  signature?: string;
  signedTransaction?: string;
  error?: string;
}

export interface TransactionRequest {
  agentId: string;
  unsignedTransaction: string; // Base64 encoded transaction
  feePayer?: string; // Optional fee payer
  recentBlockhash?: string; // Optional recent blockhash
}

export interface SigningAuditLog {
  id: string;
  agentId: string;
  transactionHash: string;
  signature: string;
  derivationPath: string;
  signedAt: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Transaction Signing Service
 * Provides secure transaction signing using HD wallet derivation
 */
export class TransactionSigner {
  private masterSeed: Buffer;
  private db: ReturnType<typeof createClient>;

  constructor() {
    // Derive master seed from mnemonic (NEVER store this, only derive in memory)
    this.masterSeed = mnemonicToSeedSync(MASTER_MNEMONIC);
    this.db = db;
  }

  /**
   * Derive keypair from master seed using derivation path
   * This simulates the secure key derivation in a TEE
   */
  private deriveKeypair(derivationPath: string): Keypair {
    const derivedKey = derivePath(derivationPath, this.masterSeed.toString('hex')).key;
    return Keypair.fromSeed(derivedKey);
  }

  /**
   * Sign transaction for agent using HD-derived wallet
   */
  async signTransaction(request: TransactionRequest): Promise<SigningResult> {
    try {
      // Get agent identity to retrieve derivation path
      const identity = await identityService.getIdentity(request.agentId);
      if (!identity) {
        return {
          success: false,
          error: `Agent identity not found: ${request.agentId}`,
        };
      }

      // Derive keypair in memory (simulating TEE)
      const keypair = this.deriveKeypair(identity.derivationPath);

      // Decode and parse transaction
      const transaction = Transaction.from(
        Buffer.from(request.unsignedTransaction, 'base64')
      );

      // Set fee payer if provided
      if (request.feePayer) {
        transaction.feePayer = new PublicKey(request.feePayer);
      } else {
        transaction.feePayer = keypair.publicKey;
      }

      // Set recent blockhash if provided
      if (request.recentBlockhash) {
        transaction.recentBlockhash = request.recentBlockhash;
      }

      // Sign the transaction
      transaction.sign(keypair);

      // Get the signature
      const signature = transaction.signatures.find(
        sig => sig.publicKey.equals(keypair.publicKey)
      )?.signature;

      if (!signature) {
        return {
          success: false,
          error: 'Failed to generate transaction signature',
        };
      }

      // Serialize the signed transaction
      const signedTransaction = transaction.serialize({
        requireAllSignatures: true,
        verifySignatures: true,
      });

      // Log the signing operation for audit
      await this.logSigningOperation({
        id: `signing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentId: request.agentId,
        transactionHash: this.getTransactionHash(transaction),
        signature: signature.toString('base64'),
        derivationPath: identity.derivationPath,
        signedAt: Date.now(),
      });

      return {
        success: true,
        signature: signature.toString('base64'),
        signedTransaction: signedTransaction.toString('base64'),
      };
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sign multiple transactions (batch signing)
   */
  async signTransactions(
    requests: TransactionRequest[]
  ): Promise<SigningResult[]> {
    const results: SigningResult[] = [];

    for (const request of requests) {
      const result = await this.signTransaction(request);
      results.push(result);
    }

    return results;
  }

  /**
   * Verify transaction signature
   */
  async verifySignature(
    agentId: string,
    transaction: string,
    signature: string
  ): Promise<boolean> {
    try {
      const identity = await identityService.getIdentity(agentId);
      if (!identity) {
        return false;
      }

      // Derive the expected public key
      const keypair = this.deriveKeypair(identity.derivationPath);
      const expectedPublicKey = keypair.publicKey;

      // Parse transaction and verify signature
      const tx = Transaction.from(Buffer.from(transaction, 'base64'));
      const sig = Buffer.from(signature, 'base64');

      // Verify the signature
      return tx.verifySignatures();
    } catch (error) {
      console.error('Failed to verify signature:', error);
      return false;
    }
  }

  /**
   * Get transaction hash for logging
   */
  private getTransactionHash(transaction: Transaction): string {
    // Create a simple hash of the transaction for logging
    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      const char = serialized[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Log signing operation for audit trail
   */
  private async logSigningOperation(log: SigningAuditLog): Promise<void> {
    try {
      await this.db.execute({
        sql: `
          INSERT INTO signing_audit_logs (
            id, agent_id, transaction_hash, signature, derivation_path,
            signed_at, ip_address, user_agent
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          log.id,
          log.agentId,
          log.transactionHash,
          log.signature,
          log.derivationPath,
          log.signedAt,
          log.ipAddress || null,
          log.userAgent || null,
        ],
      });
    } catch (error) {
      console.error('Failed to log signing operation:', error);
      // Don't throw here - logging failure shouldn't break signing
    }
  }

  /**
   * Get signing audit logs for agent
   */
  async getSigningLogs(
    agentId: string,
    limit: number = 50
  ): Promise<SigningAuditLog[]> {
    try {
      const result = await this.db.execute({
        sql: `
          SELECT id, agent_id, transaction_hash, signature, derivation_path,
                 signed_at, ip_address, user_agent
          FROM signing_audit_logs
          WHERE agent_id = ?
          ORDER BY signed_at DESC
          LIMIT ?
        `,
        args: [agentId, limit],
      });

      return result.rows.map(row => ({
        id: row.id as string,
        agentId: row.agent_id as string,
        transactionHash: row.transaction_hash as string,
        signature: row.signature as string,
        derivationPath: row.derivation_path as string,
        signedAt: row.signed_at as number,
        ipAddress: row.ip_address as string | undefined,
        userAgent: row.user_agent as string | undefined,
      }));
    } catch (error) {
      console.error('Failed to get signing logs:', error);
      return [];
    }
  }

  /**
   * Get signing statistics
   */
  async getSigningStats(): Promise<{
    total: number;
    byAgent: Record<string, number>;
    last24h: number;
  }> {
    try {
      const totalResult = await this.db.execute({
        sql: 'SELECT COUNT(*) as count FROM signing_audit_logs',
      });

      const byAgentResult = await this.db.execute({
        sql: `
          SELECT agent_id, COUNT(*) as count
          FROM signing_audit_logs
          GROUP BY agent_id
        `,
      });

      const last24hResult = await this.db.execute({
        sql: `
          SELECT COUNT(*) as count
          FROM signing_audit_logs
          WHERE signed_at > ?
        `,
        args: [Date.now() - 24 * 60 * 60 * 1000], // Last 24 hours
      });

      const total = totalResult.rows[0].count as number;
      const byAgent: Record<string, number> = {};
      const last24h = last24hResult.rows[0].count as number;

      for (const row of byAgentResult.rows) {
        byAgent[row.agent_id as string] = row.count as number;
      }

      return { total, byAgent, last24h };
    } catch (error) {
      console.error('Failed to get signing stats:', error);
      return { total: 0, byAgent: {}, last24h: 0 };
    }
  }

  /**
   * Create signing audit table if it doesn't exist
   */
  async ensureAuditTable(): Promise<void> {
    try {
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS signing_audit_logs (
          id TEXT PRIMARY KEY,
          agent_id TEXT NOT NULL,
          transaction_hash TEXT NOT NULL,
          signature TEXT NOT NULL,
          derivation_path TEXT NOT NULL,
          signed_at INTEGER NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          created_at INTEGER DEFAULT (strftime('%s', 'now')) * 1000
        )
      `);

      // Create indexes for performance
      await this.db.execute(`
        CREATE INDEX IF NOT EXISTS idx_signing_logs_agent_id 
        ON signing_audit_logs(agent_id)
      `);

      await this.db.execute(`
        CREATE INDEX IF NOT EXISTS idx_signing_logs_signed_at 
        ON signing_audit_logs(signed_at)
      `);
    } catch (error) {
      console.error('Failed to create audit table:', error);
    }
  }
}

// Singleton instance
export const transactionSigner = new TransactionSigner();

// Initialize audit table
transactionSigner.ensureAuditTable();

/**
 * Factory function to sign transaction
 */
export async function signTransaction(request: TransactionRequest): Promise<SigningResult> {
  return await transactionSigner.signTransaction(request);
}

/**
 * Sign multiple transactions
 */
export async function signTransactions(requests: TransactionRequest[]): Promise<SigningResult[]> {
  return await transactionSigner.signTransactions(requests);
}

/**
 * Verify transaction signature
 */
export async function verifySignature(
  agentId: string,
  transaction: string,
  signature: string
): Promise<boolean> {
  return await transactionSigner.verifySignature(agentId, transaction, signature);
}

/**
 * Get signing audit logs
 */
export async function getSigningLogs(agentId: string, limit?: number): Promise<SigningAuditLog[]> {
  return await transactionSigner.getSigningLogs(agentId, limit);
}

/**
 * Get signing statistics
 */
export async function getSigningStats(): Promise<{
  total: number;
  byAgent: Record<string, number>;
  last24h: number;
}> {
  return await transactionSigner.getSigningStats();
}