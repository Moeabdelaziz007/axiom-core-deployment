import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
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
