/**
 * Services Barrel File
 * 
 * This file exports all services from the services directory to provide
 * a centralized import point for the application.
 */

// Identity Service - Comprehensive with Solana Wallet Integration & MENA Localization
export { identityService, IdentityService } from './identity-service';

// Dream Memory Service
export { DreamMemory } from './dream-memory';

// Axiom Forge Service
export { forgeAgentDNA } from './axiomForge';

// Transaction Executor Service
// export { transactionExecutor, TransactionResult } from './TransactionExecutor';

// WebSocket Client Service
export { wsClient } from './WebSocketClient';

// Topology Services
export { TOHADetector } from './topology/TOHADetector';