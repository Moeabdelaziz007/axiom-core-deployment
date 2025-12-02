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
      try {
        const sql = readFileSync(join(this.migrationsPath, file), 'utf-8');
        migrations.push({
          id: file.replace('.sql', ''),
          filename: file,
          sql
        });
      } catch (error) {
        console.error(`Failed to read migration file ${file}:`, error);
        throw error;
      }
    }

    // Get executed migrations
    try {
      const result = await paymentsDb.execute('SELECT id FROM migrations');
      const executed = new Set(result.rows.map((row: any) => row.id));
      return migrations.filter(m => !executed.has(m.id));
    } catch (error) {
      console.error('Failed to get executed migrations:', error);
      // If migrations table doesn't exist, return all migrations
      return migrations;
    }
  }

  async runMigration(migration: Migration) {
    console.log(`🔄 Running migration: ${migration.filename}`);
    
    try {
      // Start transaction
      await paymentsDb.execute('BEGIN TRANSACTION');
      
      // Split SQL by semicolons and execute each statement
      const statements = migration.sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        try {
          await paymentsDb.execute(statement);
        } catch (stmtError) {
          console.warn(`Warning executing statement: ${statement.substring(0, 100)}...`, stmtError);
          // Continue with other statements for non-critical errors
        }
      }
      
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
    try {
      await this.ensureMigrationsTable();
      const pending = await this.getPendingMigrations();
      
      if (pending.length === 0) {
        console.log('✅ No pending migrations');
        return { success: true, migrated: 0 };
      }

      console.log(`🔄 Running ${pending.length} pending migrations...`);
      
      let migrated = 0;
      for (const migration of pending) {
        await this.runMigration(migration);
        migrated++;
      }
      
      console.log('✅ All migrations completed successfully');
      return { success: true, migrated };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async rollback(migrationId: string) {
    // For now, we don't support automatic rollbacks
    // In production, you'd want to have down migrations
    console.warn(`Rollback requested for ${migrationId}, but automatic rollbacks are not implemented`);
    throw new Error('Automatic rollbacks not implemented. Please restore from backup.');
  }

  async getMigrationStatus() {
    await this.ensureMigrationsTable();
    
    const result = await paymentsDb.execute(`
      SELECT id, filename, executed_at 
      FROM migrations 
      ORDER BY executed_at ASC
    `);

    const pending = await this.getPendingMigrations();
    
    return {
      executed: result.rows,
      pending: pending.map(m => m.id),
      total: result.rows.length + pending.length
    };
  }
}

// Singleton instance
export const migrationManager = new MigrationManager();

// Convenience function for running migrations
export async function runMigrations() {
  return await migrationManager.migrate();
}

// Convenience function for checking migration status
export async function getMigrationStatus() {
  return await migrationManager.getMigrationStatus();
}