/**
 * Solana Tools Integration for AxiomID Agents
 * Integrates with Transaction Signer service for secure HD wallet operations
 */

import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  TransactionInstruction
} from '@solana/web3.js';
import { 
  signTransaction, 
  getAgentWalletAddress,
  SigningResult,
  TransactionRequest 
} from './transaction-signer';
import { 
  getAgentIdentity,
  AgentIdentity 
} from './identity-service';

// Solana RPC Configuration
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export interface SolanaTransferRequest {
  agentId: string;
  recipient: string;
  amountLamports: number;
  feePayer?: string;
}

export interface SolanaTransferResult {
  success: boolean;
  signature?: string;
  error?: string;
  transactionUrl?: string;
}

export interface SolanaBalanceResult {
  success: boolean;
  balance?: number;
  balanceSol?: number;
  error?: string;
}

export interface SolanaAccountInfo {
  address: string;
  balance: number;
  balanceSol: number;
  executable: boolean;
  owner: string;
  lamports: number;
}

/**
 * Solana Agent Tools
 * Provides Solana blockchain operations for AxiomID agents
 */
export class SolanaAgentTools {
  private connection: Connection;

  constructor(rpcUrl?: string) {
    this.connection = new Connection(rpcUrl || SOLANA_RPC_URL, 'confirmed');
  }

  /**
   * Get agent's wallet address
   */
  async getAgentWalletAddress(agentId: string): Promise<string | null> {
    return await getAgentWalletAddress(agentId);
  }

  /**
   * Get agent's full identity information
   */
  async getAgentIdentity(agentId: string): Promise<AgentIdentity | null> {
    return await getAgentIdentity(agentId);
  }

  /**
   * Get SOL balance for agent
   */
  async getBalance(agentId: string): Promise<SolanaBalanceResult> {
    try {
      const walletAddress = await this.getAgentWalletAddress(agentId);
      if (!walletAddress) {
        return {
          success: false,
          error: `Agent wallet not found: ${agentId}`,
        };
      }

      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      
      return {
        success: true,
        balance,
        balanceSol: balance / LAMPORTS_PER_SOL,
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Transfer SOL from agent to recipient
   */
  async transferSOL(request: SolanaTransferRequest): Promise<SolanaTransferResult> {
    try {
      // Get agent wallet address
      const fromAddress = await this.getAgentWalletAddress(request.agentId);
      if (!fromAddress) {
        return {
          success: false,
          error: `Agent wallet not found: ${request.agentId}`,
        };
      }

      // Create transfer transaction
      const transaction = new Transaction();
      const fromPubkey = new PublicKey(fromAddress);
      const toPubkey = new PublicKey(request.recipient);

      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: request.amountLamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Set fee payer
      if (request.feePayer) {
        transaction.feePayer = new PublicKey(request.feePayer);
      } else {
        transaction.feePayer = fromPubkey;
      }

      // Serialize transaction for signing
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      // Sign transaction using Transaction Signer service
      const signingResult: SigningResult = await signTransaction({
        agentId: request.agentId,
        unsignedTransaction: serializedTransaction.toString('base64'),
        feePayer: request.feePayer,
        recentBlockhash: blockhash,
      });

      if (!signingResult.success || !signingResult.signedTransaction) {
        return {
          success: false,
          error: signingResult.error || 'Failed to sign transaction',
        };
      }

      // Deserialize and send signed transaction
      const signedTx = Transaction.from(
        Buffer.from(signingResult.signedTransaction, 'base64')
      );

      const signature = await this.connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(
        signature,
        'confirmed'
      );

      if (confirmation.value.err) {
        return {
          success: false,
          error: `Transaction failed: ${confirmation.value.err}`,
          signature,
        };
      }

      return {
        success: true,
        signature,
        transactionUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      };
    } catch (error) {
      console.error('Failed to transfer SOL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create and sign a custom transaction
   */
  async createAndSignTransaction(
    agentId: string,
    instructions: TransactionInstruction[],
    feePayer?: string
  ): Promise<SigningResult> {
    try {
      // Get agent wallet address
      const walletAddress = await this.getAgentWalletAddress(agentId);
      if (!walletAddress) {
        return {
          success: false,
          error: `Agent wallet not found: ${agentId}`,
        };
      }

      // Create transaction
      const transaction = new Transaction();
      instructions.forEach(instruction => transaction.add(instruction));

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Set fee payer
      if (feePayer) {
        transaction.feePayer = new PublicKey(feePayer);
      } else {
        transaction.feePayer = new PublicKey(walletAddress);
      }

      // Serialize for signing
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      // Sign transaction
      return await signTransaction({
        agentId,
        unsignedTransaction: serializedTransaction.toString('base64'),
        feePayer,
        recentBlockhash: blockhash,
      });
    } catch (error) {
      console.error('Failed to create and sign transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(address: string): Promise<SolanaAccountInfo | null> {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      
      if (!accountInfo) {
        return null;
      }

      return {
        address,
        balance: accountInfo.lamports,
        balanceSol: accountInfo.lamports / LAMPORTS_PER_SOL,
        executable: accountInfo.executable,
        owner: accountInfo.owner.toBase58(),
        lamports: accountInfo.lamports,
      };
    } catch (error) {
      console.error('Failed to get account info:', error);
      return null;
    }
  }

  /**
   * Airdrop SOL to agent wallet (devnet only)
   */
  async airdropSOL(agentId: string, amountSol: number = 1): Promise<SolanaTransferResult> {
    try {
      const walletAddress = await this.getAgentWalletAddress(agentId);
      if (!walletAddress) {
        return {
          success: false,
          error: `Agent wallet not found: ${agentId}`,
        };
      }

      const publicKey = new PublicKey(walletAddress);
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amountSol * LAMPORTS_PER_SOL
      );

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(
        signature,
        'confirmed'
      );

      if (confirmation.value.err) {
        return {
          success: false,
          error: `Airdrop failed: ${confirmation.value.err}`,
          signature,
        };
      }

      return {
        success: true,
        signature,
        transactionUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      };
    } catch (error) {
      console.error('Failed to airdrop SOL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(signature: string): Promise<{
    confirmed: boolean;
    finalized: boolean;
    error?: string;
  }> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      
      if (!status.value) {
        return {
          confirmed: false,
          finalized: false,
        };
      }

      return {
        confirmed: status.value.confirmationStatus === 'confirmed' || 
                  status.value.confirmationStatus === 'finalized',
        finalized: status.value.confirmationStatus === 'finalized',
        error: status.value.err ? String(status.value.err) : undefined,
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return {
        confirmed: false,
        finalized: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Singleton instance
export const solanaAgentTools = new SolanaAgentTools();

/**
 * Factory functions for Solana operations
 */
export async function getAgentBalance(agentId: string): Promise<SolanaBalanceResult> {
  return await solanaAgentTools.getBalance(agentId);
}

export async function transferAgentSOL(request: SolanaTransferRequest): Promise<SolanaTransferResult> {
  return await solanaAgentTools.transferSOL(request);
}

export async function airdropAgentSOL(agentId: string, amountSol?: number): Promise<SolanaTransferResult> {
  return await solanaAgentTools.airdropSOL(agentId, amountSol);
}

export async function getAgentAccountInfo(address: string): Promise<SolanaAccountInfo | null> {
  return await solanaAgentTools.getAccountInfo(address);
}

export async function getTransactionStatus(signature: string): Promise<{
  confirmed: boolean;
  finalized: boolean;
  error?: string;
}> {
  return await solanaAgentTools.getTransactionStatus(signature);
}