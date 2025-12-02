# Phase 1: Foundation Setup - Implementation Guide

## Overview

This phase establishes the foundational infrastructure for the payment fulfillment and API safety systems. We'll set up the database connections, create the necessary schemas, and configure the basic application structure.

## Step 1: Database Setup and Configuration

### 1.1 Install Required Dependencies

First, we need to add the Turso/LibSQL client and other required packages:

```bash
npm install @libsql/client @upstash/ratelimit @upstash/redis helius-sdk
npm install -D @types/node-cron
```

### 1.2 Create Database Configuration

Create `src/lib/db.ts` for Turso/LibSQL configuration:

```typescript
import { createClient } from '@libsql/client';

// Turso/LibSQL client for payment fulfillment
export const paymentsDb = createClient({
  url: process.env.TURSO_DB_URL || 'file:local.db',
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
  // Configure for 64-bit integer handling
  intMode: 'bigint' as const,
});

// Existing D1 client for other operations
export const mainDb = createClient({
  url: process.env.D1_DATABASE_URL || 'file:main.db',
  intMode: 'bigint' as const,
});

// Database connection helper
export async function connectToDatabase() {
  try {
    // Test connections
    await paymentsDb.execute('SELECT 1');
    await mainDb.execute('SELECT 1');
    console.log('✅ Database connections established');
    return { paymentsDb, mainDb };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}
```

### 1.3 Create Payment Schema

Create `schema/001_payment_fulfillment.sql`:

```sql
-- Payment Fulfillment Schema for Turso/LibSQL
-- This schema implements deterministic payment tracking with anti-replay protection

-- Primary payments table with strict constraints
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_signature TEXT UNIQUE NOT NULL,           -- Solana transaction signature
    user_id TEXT NOT NULL,                       -- User identifier
    reference_key TEXT UNIQUE NOT NULL,          -- Anti-replay protection
    amount_lamports INTEGER NOT NULL,             -- Amount in lamports (64-bit)
    status TEXT CHECK(status IN ('pending', 'verified', 'provisioned', 'failed')) DEFAULT 'pending',
    finalized_at INTEGER,                         -- Unix timestamp when finalized
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Payment metadata for additional context
CREATE TABLE IF NOT EXISTS payment_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    UNIQUE(payment_id, key)
);

-- Webhook event log for audit trail
CREATE TABLE IF NOT EXISTS webhook_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER,
    webhook_type TEXT NOT NULL,                  -- 'helius', 'paymob'
    event_data TEXT NOT NULL,                    -- JSON payload
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference_key ON payments(reference_key);
CREATE INDEX IF NOT EXISTS idx_payments_tx_signature ON payments(tx_signature);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_payment_id ON webhook_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
```

### 1.4 Database Migration System

Create `src/lib/migrations.ts`:

```typescript
import { paymentsDb } from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

interface Migration {
  id: string;
  filename: string;
  sql: string;
  executed_at?: number;
}

export class MigrationManager {
  private migrationsPath = join(process.cwd(), 'schema');

  async ensureMigrationsTable() {
    await paymentsDb.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        executed_at INTEGER NOT NULL
      )
    `);
  }

  async getPendingMigrations(): Promise<Migration[]> {
    const files = ['001_payment_fulfillment.sql']; // Add more as needed
    const migrations: Migration[] = [];

    for (const file of files) {
      const sql = readFileSync(join(this.migrationsPath, file), 'utf-8');
      migrations.push({
        id: file.replace('.sql', ''),
        filename: file,
        sql
      });
    }

    // Get executed migrations
    const result = await paymentsDb.execute('SELECT id FROM migrations');
    const executed = new Set(result.rows.map((row: any) => row.id));

    return migrations.filter(m => !executed.has(m.id));
  }

  async runMigration(migration: Migration) {
    try {
      // Start transaction
      await paymentsDb.execute('BEGIN TRANSACTION');
      
      // Execute migration SQL
      await paymentsDb.execute(migration.sql);
      
      // Record migration
      await paymentsDb.execute({
        sql: 'INSERT INTO migrations (id, filename, executed_at) VALUES (?, ?, ?)',
        args: [migration.id, migration.filename, Date.now()]
      });
      
      await paymentsDb.execute('COMMIT');
      console.log(`✅ Migration ${migration.filename} executed successfully`);
    } catch (error) {
      await paymentsDb.execute('ROLLBACK');
      console.error(`❌ Migration ${migration.filename} failed:`, error);
      throw error;
    }
  }

  async migrate() {
    await this.ensureMigrationsTable();
    const pending = await this.getPendingMigrations();
    
    if (pending.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`🔄 Running ${pending.length} pending migrations...`);
    
    for (const migration of pending) {
      await this.runMigration(migration);
    }
    
    console.log('✅ All migrations completed');
  }
}
```

## Step 2: Next.js Configuration Updates

### 2.1 Update Next.js Config

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Environment variables for client-side access
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/webhooks/:path*',
        destination: '/api/webhooks/:path*',
      },
      {
        source: '/api/proxy/:path*',
        destination: '/api/proxy/:path*',
      },
    ];
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
  
  // Experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@libsql/client'],
  },
};

module.exports = nextConfig;
```

### 2.2 Environment Variables Template

Create `.env.example`:

```bash
# Database Configuration
TURSO_DB_URL="libsql://your-db.turso.io"
TURSO_DB_AUTH_TOKEN="your-auth-token"
D1_DATABASE_URL="file:local.db"

# Solana Configuration
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_PRIVATE_KEY="your-private-key"
HELIUS_WEBHOOK_SECRET="your-webhook-secret"

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Amadeus API Configuration
AMADEUS_CLIENT_ID="your-client-id"
AMADEUS_CLIENT_SECRET="your-client-secret"
AMADEUS_BASE_URL="https://test.api.amadeus.com"

# Legacy Paymob Configuration
PAYMOB_HMAC_SECRET="your-paymob-secret"

# Application Configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 3: Basic API Route Structure

### 3.1 Create API Base Structure

Create `src/app/api/payments/route.ts` as a base payment endpoint:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { paymentsDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const result = await paymentsDb.execute({
      sql: 'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    });

    return NextResponse.json({ payments: result.rows });
  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amountLamports, referenceKey } = body;

    if (!userId || !amountLamports || !referenceKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment record
    const result = await paymentsDb.execute({
      sql: `
        INSERT INTO payments (user_id, reference_key, amount_lamports, status)
        VALUES (?, ?, ?, 'pending')
        RETURNING *
      `,
      args: [userId, referenceKey, amountLamports]
    });

    return NextResponse.json({ 
      payment: result.rows[0],
      message: 'Payment record created'
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Step 4: Testing the Foundation

### 4.1 Database Connection Test

Create `src/lib/test-db.ts`:

```typescript
import { connectToDatabase } from './db';
import { MigrationManager } from './migrations';

export async function testDatabaseSetup() {
  try {
    console.log('🧪 Testing database connections...');
    
    // Test connections
    const { paymentsDb, mainDb } = await connectToDatabase();
    
    // Test basic query
    const result = await paymentsDb.execute('SELECT 1 as test');
    console.log('✅ Basic query result:', result.rows[0]);
    
    // Run migrations
    const migrationManager = new MigrationManager();
    await migrationManager.migrate();
    
    // Test table creation
    const tables = await paymentsDb.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE 'payment%'
    `);
    console.log('✅ Created tables:', tables.rows.map((r: any) => r.name));
    
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}
```

### 4.2 API Route Test

Create a simple test script to verify the foundation works:

```typescript
// scripts/test-foundation.ts
import { testDatabaseSetup } from '../src/lib/test-db';

async function runTests() {
  console.log('🚀 Starting Phase 1 Foundation Tests...\n');
  
  const dbTest = await testDatabaseSetup();
  
  if (dbTest) {
    console.log('\n✅ Phase 1 Foundation Setup Complete!');
    console.log('📋 Next steps:');
    console.log('  1. Configure environment variables');
    console.log('  2. Set up Turso database');
    console.log('  3. Test API endpoints');
    console.log('  4. Proceed to Phase 2: Payment System');
  } else {
    console.log('\n❌ Phase 1 Foundation Setup Failed!');
    console.log('🔧 Please check:');
    console.log('  1. Database configuration');
    console.log('  2. Environment variables');
    console.log('  3. Network connectivity');
  }
}

runTests().catch(console.error);
```

## Step 5: Deployment Preparation

### 5.1 Update Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "migrate": "npx ts-node scripts/migrate.ts",
    "test:db": "npx ts-node scripts/test-foundation.ts",
    "setup:phase1": "npm run migrate && npm run test:db"
  }
}
```

### 5.2 Create Migration Script

Create `scripts/migrate.ts`:

```typescript
import { MigrationManager } from '../src/lib/migrations';

async function runMigrations() {
  const migrationManager = new MigrationManager();
  await migrationManager.migrate();
}

runMigrations().catch(console.error);
```

## Validation Checklist

Before proceeding to Phase 2, ensure:

- [ ] Turso/LibSQL database is created and accessible
- [ ] Environment variables are properly configured
- [ ] Database migrations run successfully
- [ ] Basic API endpoints respond correctly
- [ ] Database connections are stable
- [ ] Error handling is working
- [ ] Logging is functional

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check TURSO_DB_URL and TURSO_DB_AUTH_TOKEN
   - Verify network connectivity
   - Ensure proper authentication

2. **Migration Errors**
   - Check SQL syntax
   - Verify file permissions
   - Check for existing tables

3. **API Route Errors**
   - Verify Next.js configuration
   - Check import paths
   - Ensure proper TypeScript types

### Debug Commands

```bash
# Test database connection
npm run test:db

# Run migrations
npm run migrate

# Check TypeScript compilation
npm run build

# Start development server
npm run dev
```

This foundation provides the solid base needed for implementing the payment fulfillment and API safety systems in subsequent phases.