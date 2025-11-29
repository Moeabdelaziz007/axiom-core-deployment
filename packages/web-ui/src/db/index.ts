import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.warn('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://dummy-url',
  authToken: process.env.TURSO_AUTH_TOKEN || 'dummy-token',
});

export const db = drizzle(client, { schema });
