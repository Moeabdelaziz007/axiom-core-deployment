/**
 * Library Utilities Barrel File
 * 
 * This file provides centralized exports for all utility modules in the lib directory.
 * It implements the Index Strategy pattern for clean imports and better code organization.
 */

// ============================================================================
// AI ENGINE UTILITIES
// ============================================================================

/**
 * AI Engine utilities for model management and inference
 * Provides unified access to Groq and Vercel AI models with intelligent routing
 */
export {
  aiEngine,
  AI_MODELS,
  GROQ_MODELS,
  groq,
  groqDirect,
  getModel,
  checkAIEnvironment
} from './ai-engine';

// ============================================================================
// GHOST CURSOR UTILITIES
// ============================================================================

/**
 * GhostCursor utilities for human-like mouse movement simulation
 * Includes both the class and type definitions for path generation
 */
export {
  GhostCursor,
  type Point,
  type PathData,
  type PathPoint
} from './ghost-cursor';

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

/**
 * Logging utilities for structured event tracking
 * Integrates with next-axiom for production-ready logging
 */
export {
  log,
  logAuthEvent,
  logDreamEvent
} from './logger';

// ============================================================================
// AUTHENTICATION UTILITIES
// ============================================================================

/**
 * Authentication utilities for wallet-based identity management
 * Provides JWT session management and Solana wallet verification
 * Note: Only available in server-side environment due to Solana dependencies
 */
// Authentication utilities are server-side only and not exported from barrel to prevent client-side bundling
// Import directly in server components: import { createSession, verifyWalletSignature, ... } from '@/lib/auth'

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Arcjet security utilities for bot detection and rate limiting
 * Provides production-ready security middleware
 * Note: Only available in server-side environment
 */
// Arcjet is server-side only and not exported from barrel to prevent client-side bundling
// Import directly in server components: import arcjet from '@/lib/arcjet'

// ============================================================================
// DEAD HAND PROTOCOL UTILITIES
// ============================================================================

/**
 * Dead Hand Protocol utilities for system safety monitoring
 * Provides heartbeat monitoring for critical system health
 */
export {
  getDeadHandStatus,
  updateHeartbeat
} from './deadHandStore';
// ============================================================================
// AIX LOADER UTILITIES
// ============================================================================

/**
 * AIX Loader utilities for parsing AI Persona eXchange format
 * Provides loading and validation of AIX agent definitions from YAML
 */
export {
  AixLoader,
  type AIXMizanConstraints,
  type AIXSolanaWallet,
  type AIXExtendedDocument,
  type AIXLoaderResult
} from './aix-loader';

// ============================================================================
// VECTOR DATABASE UTILITIES
// ============================================================================

/**
 * Pinecone utilities for vector memory and semantic search
 * Provides access to vector database operations
 * Note: Only available in server-side environment
 */
// Pinecone is server-side only and not exported from barrel to prevent client-side bundling
// Import directly in server components: import { pinecone, INDEX_NAME } from '@/lib/pinecone'

// ============================================================================
// CACHING UTILITIES
// ============================================================================

/**
 * Redis utilities for high-performance caching and data storage
 * Provides Upstash Redis client for serverless environments
 * Note: Only available in server-side environment
 */
// Redis is server-side only and not exported from barrel to prevent client-side bundling
// Import directly in server components: import { redis } from '@/lib/redis'