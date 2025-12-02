import { createClient } from '@libsql/client';

// Turso/LibSQL client for payment fulfillment
export const paymentsDb = createClient({
  url: process.env.TURSO_DB_URL || 'file:local.db',
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
  // Configure for 64-bit integer handling
  intMode: 'bigint' as const,
});

// Existing D1 client for other operations (using LibSQL client for consistency)
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

// Health check function
export async function checkDatabaseHealth() {
  try {
    const paymentsHealth = await paymentsDb.execute('SELECT 1 as test');
    const mainHealth = await mainDb.execute('SELECT 1 as test');
    
    return {
      payments: paymentsHealth.success,
      main: mainHealth.success,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      payments: false,
      main: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Transaction helper for payment operations
export async function withPaymentTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  try {
    await paymentsDb.execute('BEGIN TRANSACTION');
    const result = await callback(paymentsDb);
    await paymentsDb.execute('COMMIT');
    return result;
  } catch (error) {
    await paymentsDb.execute('ROLLBACK');
    console.error('Payment transaction failed:', error);
    throw error;
  }
}

// Transaction helper for main database operations
export async function withMainTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  try {
    await mainDb.execute('BEGIN TRANSACTION');
    const result = await callback(mainDb);
    await mainDb.execute('COMMIT');
    return result;
  } catch (error) {
    await mainDb.execute('ROLLBACK');
    console.error('Main transaction failed:', error);
    throw error;
  }
}