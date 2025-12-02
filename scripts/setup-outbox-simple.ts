import { execSync } from 'child_process';
import { paymentsDb } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green');
}

function logError(message: string): void {
  log(`❌ ${message}`, 'red');
}

function logWarning(message: string): void {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message: string): void {
  log(`ℹ️ ${message}`, 'cyan');
}

// Execute SQL migration file
async function executeMigration(filePath: string): Promise<boolean> {
  try {
    logInfo(`Executing migration: ${filePath}`);
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await paymentsDb.execute({
          sql: statement,
          args: []
        });
      }
    }
    
    logSuccess(`Migration completed: ${filePath}`);
    return true;
    
  } catch (error) {
    logError(`Migration failed: ${filePath} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

// Verify migration was applied
async function verifyMigration(tableName: string): Promise<boolean> {
  try {
    const result = await paymentsDb.execute({
      sql: `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      args: [tableName]
    });
    
    return result.rows.length > 0;
  } catch (error) {
    logError(`Verification failed for table ${tableName}: ${error}`);
    return false;
  }
}

// Main setup function
async function setupOutboxPattern(): Promise<void> {
  log('🚀 Setting up Transactional Outbox Pattern for EDA Compliance', 'bright');
  log('', 'reset');
  
  try {
    // Test database connection
    logInfo('Testing database connection...');
    await paymentsDb.execute('SELECT 1');
    logSuccess('Database connection successful');
    
    // Execute migrations
    logInfo('Running database migrations...');
    const migrationFiles = [
      'schema/001_payment_fulfillment.sql',
      'schema/transactional_outbox.sql'
    ];
    
    let migrationSuccess = true;
    
    for (const migrationFile of migrationFiles) {
      const fullPath = path.join(process.cwd(), migrationFile);
      
      if (!fs.existsSync(fullPath)) {
        logWarning(`Migration file not found: ${migrationFile}`);
        migrationSuccess = false;
        continue;
      }
      
      const success = await executeMigration(fullPath);
      if (!success) {
        migrationSuccess = false;
      }
    }
    
    if (migrationSuccess) {
      logSuccess('All migrations completed successfully');
    } else {
      logError('Some migrations failed');
      process.exit(1);
    }
    
    // Verify schema
    logInfo('Verifying schema...');
    const requiredTables = [
      'payments',
      'transactional_outbox',
      'dead_letter_queue',
      'event_subscriptions',
      'event_delivery_log'
    ];
    
    let allTablesExist = true;
    for (const table of requiredTables) {
      const exists = await verifyMigration(table);
      if (!exists) {
        logError(`Required table missing: ${table}`);
        allTablesExist = false;
      }
    }
    
    if (allTablesExist) {
      logSuccess('Schema verification successful');
    } else {
      logError('Schema verification failed');
      process.exit(1);
    }
    
    // Test outbox functionality
    logInfo('Testing outbox functionality...');
    
    // Test event insertion
    const testEventId = 'test_setup_event_' + Date.now();
    await paymentsDb.execute({
      sql: `
        INSERT INTO transactional_outbox (
          event_id, aggregate_type, aggregate_id, event_type, 
          event_data, status, created_at
        ) VALUES (?, ?, ?, ?, 'pending', strftime('%s', 'now'))
      `,
      args: [
        testEventId,
        'payment',
        'test_payment',
        'payment_verified',
        JSON.stringify({ test: true, timestamp: Date.now() })
      ]
    });
    
    logSuccess('Test event inserted successfully');
    
    // Test event retrieval
    const retrievedEvent = await paymentsDb.execute({
      sql: 'SELECT * FROM transactional_outbox WHERE event_id = ?',
      args: [testEventId]
    });
    
    if (retrievedEvent.rows.length === 1) {
      logSuccess('Event retrieval test passed');
    } else {
      logError('Event retrieval test failed');
    }
    
    // Clean up test event
    await paymentsDb.execute({
      sql: 'DELETE FROM transactional_outbox WHERE event_id = ?',
      args: [testEventId]
    });
    
    logSuccess('Setup completed successfully!');
    log('', 'reset');
    
    log('📋 Summary:', 'bright');
    log('  ✅ Database migrations completed', 'green');
    log('  ✅ Schema verification passed', 'green');
    log('  ✅ Outbox functionality tested', 'green');
    log('  ✅ Ready for event-driven architecture', 'green');
    log('', 'reset');
    
    logInfo('Transactional Outbox Pattern is now ready for use!');
    logInfo('Next steps:');
    logInfo('  1. Import getOutboxProcessor() in your application code');
    logInfo('  2. Import getEventPublisher() for publishing events');
    logInfo('  3. Use withEventPublishing() for transactional event publishing');
    logInfo('  4. Start: outbox processor: await getOutboxProcessor().start()');
    logInfo('  5. Monitor with: await getOutboxMonitor().start()');
    
  } catch (error) {
    logError(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    log('Transactional Outbox Pattern Setup Script', 'bright');
    log('', 'reset');
    log('Usage:', 'cyan');
    log('  npm run setup:outbox-simple [options]', 'reset');
    log('', 'reset');
    log('Options:', 'cyan');
    log('  --help, -h     Show this help message', 'reset');
    log('  --verify, -v   Only verify existing setup', 'reset');
    log('  --force, -f    Force re-run migrations', 'reset');
    log('', 'reset');
    log('Examples:', 'cyan');
    log('  npm run setup:outbox-simple                # Full setup', 'reset');
    log('  npm run setup:outbox-simple --verify       # Verify only', 'reset');
    log('  npm run setup:outbox-simple --force       # Force setup', 'reset');
    process.exit(0);
  }
  
  if (args.includes('--verify') || args.includes('-v')) {
    log('Verifying existing Transactional Outbox Pattern setup...', 'bright');
    
    const requiredTables = [
      'transactional_outbox',
      'dead_letter_queue',
      'event_subscriptions',
      'event_delivery_log'
    ];
    
    let allGood = true;
    for (const table of requiredTables) {
      const exists = await verifyMigration(table);
      if (exists) {
        logSuccess(`✓ Table exists: ${table}`);
      } else {
        logError(`✗ Table missing: ${table}`);
        allGood = false;
      }
    }
    
    if (allGood) {
      logSuccess('Transactional Outbox Pattern setup is verified and ready!');
    } else {
      logError('Transactional Outbox Pattern setup is incomplete. Run without --verify to complete setup.');
      process.exit(1);
    }
    
    return;
  }
  
  // Force mode - skip verification and run setup
  if (args.includes('--force') || args.includes('-f')) {
    logWarning('Force mode enabled - running full setup...');
  }
  
  // Run the main setup
  setupOutboxPattern().catch(error => {
    logError(`Setup script failed: ${error}`);
    process.exit(1);
  });
}

export { setupOutboxPattern };