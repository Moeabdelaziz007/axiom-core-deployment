/**
 * Cryptographic utilities for AxiomID
 * Provides secure hashing and key derivation functions
 */

import { createHash } from 'crypto';

/**
 * Hash agent ID to numeric index for HD derivation
 * Uses SHA-256 to ensure consistent, deterministic results
 */
export function hashAgentId(agentId: string): number {
  const hash = createHash('sha256').update(agentId).digest('hex');
  
  // Convert first 8 characters of hex to number
  const hexPart = hash.substring(0, 8);
  const num = parseInt(hexPart, 16);
  
  // Ensure positive number and limit to reasonable range
  return Math.abs(num) % 1000000; // Support 1M agents
}

/**
 * Generate deterministic UUID from agent ID
 */
export function generateAgentUUID(agentId: string): string {
  const hash = createHash('sha256').update(`axiom-agent-${agentId}`).digest('hex');
  
  // Format as UUID (version 4 variant)
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // Version 4
    '8' + hash.substring(17, 20), // Variant
    hash.substring(20, 32)
  ].join('-');
}

/**
 * Create secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Hash transaction for audit logging
 */
export function hashTransaction(transaction: Buffer): string {
  return createHash('sha256').update(transaction).digest('hex');
}

/**
 * Verify mnemonic strength
 */
export function validateMnemonicStrength(mnemonic: string): boolean {
  const words = mnemonic.trim().split(/\s+/);
  
  // Must be 12, 15, 18, 21, or 24 words
  const validLengths = [12, 15, 18, 21, 24];
  
  return validLengths.includes(words.length);
}

/**
 * Derive entropy from agent ID for additional security
 */
export function deriveAgentEntropy(agentId: string, salt: string = 'axiom-salt'): Buffer {
  return createHash('sha256')
    .update(agentId)
    .update(salt)
    .digest();
}