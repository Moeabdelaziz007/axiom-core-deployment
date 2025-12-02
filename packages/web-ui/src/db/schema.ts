import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. Agents Roster (The Brains)
export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  status: text('status').default('IDLE'),
  brainModel: text('brain_model').default('llama-3.1-70b'),
  trustScore: integer('trust_score').default(100),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

// 2. System Logs (The Black Box)
export const systemLogs = sqliteTable('system_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  level: text('level').notNull(),
  message: text('message').notNull(),
  agentId: text('agent_id').references(() => agents.id),
  metadata: text('metadata'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

// 3. Users (The Commanders)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  walletAddress: text('wallet_address'),
  tier: text('tier').default('FREE'),
});

// 4. Synthetic Dreams (Dream Factory Storage)
export const syntheticDreams = sqliteTable('synthetic_dreams', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  title: text('title'),
  metadata: text('metadata'), // JSON object for additional dream metadata
  sessionId: text('session_id'), // Optional session identifier for grouping related dreams
  userId: text('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

// 5. Agent Blueprints (Marketplace Templates)
export const agentBlueprints = sqliteTable('agent_blueprints', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(), // TAJER, MUSAFIR, SOFRA, MOSTASHAR
  description: text('description'),
  priceMonthlyUsd: integer('price_monthly_usd').notNull(), // in cents (99 = $0.99)
  capabilities: text('capabilities'), // JSON string of capabilities
  imageUrl: text('image_url'),
  modelProvider: text('model_provider').notNull(),
  modelName: text('model_name').notNull(),
  temperature: real('temperature').default(0.5), // 0.0 to 1.0
  tools: text('tools'), // JSON array of available tools
  systemPrompt: text('system_prompt'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

// 6. Subscriptions (Marketplace Transactions)
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userWallet: text('user_wallet').notNull(),
  blueprintId: text('blueprint_id').references(() => agentBlueprints.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, EXPIRED, CANCELLED
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  txHash: text('tx_hash').unique(),
  amountPaid: integer('amount_paid').notNull(), // in lamports
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

// 7. Axiom Identities (Gigafactory Logic - Enhanced)
export const axiomIdentities = sqliteTable('axiom_identities', {
  id: text('id').primaryKey(),
  agentName: text('agent_name').notNull(),
  walletPublicKey: text('wallet_public_key').notNull(),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' or 'SUSPENDED'
  reputation: integer('reputation').notNull().default(0),
  dnaProfile: text('dna_profile'), // JSON for personality traits
  evolutionStage: integer('evolution_stage').default(1), // 1-10 evolution levels
  
  // MENA Localization Support Fields
  // Language preference with Arabic-first approach and dialect variants
  languagePreference: text('language_preference').default('ar'), // 'ar', 'ar-eg', 'ar-ae', 'ar-lb', 'en'
  
  // Regional customization for MENA markets
  region: text('region').default('egypt'), // 'egypt', 'gulf', 'levantine', 'north_africa'
  
  // Cultural context for region-specific preferences (JSON field)
  // Stores business etiquette, communication style, trust-building mechanisms
  culturalContext: text('cultural_context'), // JSON object
  
  // Agent sovereignty level tracking
  sovereigntyLevel: text('sovereignty_level').default('basic'), // 'basic', 'enhanced', 'full'
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

// Indexes for efficient querying of synthetic dreams and axiom identities will be created in the migration
// Additional indexes for MENA localization fields:
// - idx_axiom_identities_language_preference on language_preference
// - idx_axiom_identities_region on region
// - idx_axiom_identities_sovereignty_level on sovereignty_level
// - idx_axiom_identities_region_language on (region, language_preference) for composite queries
