import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createTransferInstruction } from '@solana/spl-token';
import crypto from 'crypto';

// Types for transaction creation
interface TransferTransactionParams {
  connection: Connection;
  fromPublicKey: PublicKey;
  amountLamports: number;
  referenceKey: string;
  splToken?: {
    mint?: string;
    decimals?: number;
  };
}

// Generate unique reference key for payment tracking
export function generateReferenceKey(paymentId: string, userId: string): string {
  const timestamp = Date.now();
  const randomSalt = crypto.randomBytes(8).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(`${paymentId}_${userId}_${timestamp}_${randomSalt}`)
    .digest('hex')
    .substring(0, 16); // Take first 16 chars for reference key
  
  return `${paymentId}_${userId}_${hash}`;
}

// Create SOL transfer transaction
async function createSolTransferTransaction(params: TransferTransactionParams): Promise<Transaction> {
  const { connection, fromPublicKey, amountLamports, referenceKey } = params;
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  
  // Get minimum balance for rent exemption
  const minimumBalance = await connection.getMinimumBalanceForRentExemption(0);
  
  // Create transaction
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPublicKey,
    lastValidBlockHeight: (await connection.getBlockHeight()) + 150,
  });

  // Add SOL transfer instruction
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: fromPublicKey,
    toPubkey: fromPublicKey, // For demo, in real app this would be the merchant wallet
    lamports: amountLamports,
  });

  // Add reference key as account instruction (for tracking)
  const referencePublicKey = new PublicKey(crypto.createHash('sha256').update(referenceKey).digest());
  const referenceInstruction = SystemProgram.assign({
    accountPublicKey: referencePublicKey,
    ownerPublicKey: fromPublicKey, // For demo purposes
  });

  transaction.add(transferInstruction, referenceInstruction);
  
  return transaction;
}

// Create SPL token transfer transaction
async function createSPLTokenTransferTransaction(params: TransferTransactionParams): Promise<Transaction> {
  const { connection, fromPublicKey, amountLamports, referenceKey, splToken } = params;
  
  if (!splToken?.mint) {
    throw new Error('SPL token mint is required for SPL token transfers');
  }

  const mintPublicKey = new PublicKey(splToken.mint);
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  
  // Create transaction
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPublicKey,
    lastValidBlockHeight: (await connection.getBlockHeight()) + 150,
  });

  // Convert lamports to token units
  const decimals = splToken.decimals || 9; // Default to 9 decimals if not specified
  const tokenAmount = amountLamports; // Assuming input is already in token units

  // Add SPL token transfer instruction
  const transferInstruction = createTransferInstruction(
    mintPublicKey,
    fromPublicKey, // from account (would be token account in real app)
    fromPublicKey, // to account (would be merchant token account in real app)
    tokenAmount,
    [],
    mintPublicKey
  );

  transaction.add(transferInstruction);
  
  return transaction;
}

// Main function to create transfer transactions
export async function createTransferTransaction(params: TransferTransactionParams): Promise<Transaction> {
  const { splToken } = params;
  
  if (splToken?.mint) {
    return await createSPLTokenTransferTransaction(params);
  } else {
    return await createSolTransferTransaction(params);
  }
}

// Verify transaction signature format
export function isValidTransactionSignature(signature: string): boolean {
  // Solana transaction signatures are 88-96 base58 encoded characters
  const signatureRegex = /^[A-Za-z0-9]{88,96}$/;
  return signatureRegex.test(signature);
}

// Generate webhook signature for Helius
export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Parse reference key from transaction instruction data
export function extractReferenceKey(transaction: any): string | null {
  try {
    // This would need to be implemented based on Helius webhook format
    // For now, return a placeholder
    return 'extracted_reference_key';
  } catch (error) {
    console.error('Failed to extract reference key:', error);
    return null;
  }
}

// Utility to convert lamports to human readable format
export function formatLamports(amountLamports: number, tokenSymbol: string = 'SOL', decimals: number = 9): string {
  const amount = amountLamports / Math.pow(10, decimals);
  return `${amount.toFixed(decimals === 9 ? 4 : 2)} ${tokenSymbol}`;
}

// Validate Solana address
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Get current Solana network status
export async function getSolanaNetworkStatus(): Promise<{
  connected: boolean;
  currentSlot: number;
  latestBlockhash: string;
  feeRate: number;
}> {
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
  );

  try {
    const [currentSlot, latestBlockhash, feeRate] = await Promise.all([
      connection.getSlot(),
      connection.getLatestBlockhash().then(res => res.blockhash),
      connection.getFeeCalculatorForBlockhash(latestBlockhash).then(res => res?.lamportsPerSignature || 10000),
    ]);

    return {
      connected: true,
      currentSlot,
      latestBlockhash,
      feeRate: feeRate / LAMPORTS_PER_SOL, // Convert to SOL
    };
  } catch (error) {
    console.error('Failed to get Solana network status:', error);
    return {
      connected: false,
      currentSlot: 0,
      latestBlockhash: '',
      feeRate: 0,
    };
  }
}