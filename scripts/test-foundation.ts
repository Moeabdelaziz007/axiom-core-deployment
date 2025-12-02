import { connectToDatabase, checkDatabaseHealth } from '../src/lib/db';
import { runMigrations } from '../src/lib/migrations';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
}

class FoundationTester {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    console.log(`🧪 Running test: ${name}`);
    
    try {
      await testFn();
      const result: TestResult = {
        name,
        success: true,
        message: '✅ PASSED'
      };
      this.results.push(result);
      console.log(`✅ ${name} - PASSED\n`);
      return result;
    } catch (error) {
      const result: TestResult = {
        name,
        success: false,
        message: '❌ FAILED',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
      this.results.push(result);
      console.error(`❌ ${name} - FAILED:`, result.details);
      console.log('');
      return result;
    }
  }

  async testDatabaseConnection() {
    const { paymentsDb, mainDb } = await connectToDatabase();
    
    // Test basic queries
    const paymentsResult = await paymentsDb.execute('SELECT 1 as test');
    const mainResult = await mainDb.execute('SELECT 1 as test');
    
    if (!paymentsResult.success || !mainResult.success) {
      throw new Error('Database connection failed');
    }
  }

  async testDatabaseHealth() {
    const health = await checkDatabaseHealth();
    
    if (!health.payments || !health.main) {
      throw new Error('Database health check failed');
    }
  }

  async testMigrations() {
    const result = await runMigrations();
    
    if (!result.success) {
      throw new Error(result.error || 'Migration failed');
    }
  }

  async testTableCreation() {
    const { paymentsDb } = await connectToDatabase();
    
    // Check if tables exist
    const tables = await paymentsDb.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('payments', 'payment_metadata', 'webhook_events', 'payment_attempts')
    `);
    
    const expectedTables = ['payments', 'payment_metadata', 'webhook_events', 'payment_attempts'];
    const actualTables = tables.rows.map((row: any) => row.name);
    
    for (const table of expectedTables) {
      if (!actualTables.includes(table)) {
        throw new Error(`Table ${table} not found`);
      }
    }
  }

  async testIndexes() {
    const { paymentsDb } = await connectToDatabase();
    
    // Check if indexes exist
    const indexes = await paymentsDb.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name LIKE 'idx_%'
    `);
    
    const expectedIndexes = [
      'idx_payments_user_id',
      'idx_payments_status', 
      'idx_payments_reference_key',
      'idx_payments_tx_signature',
      'idx_payment_metadata_payment_id',
      'idx_webhook_events_payment_id'
    ];
    
    const actualIndexes = indexes.rows.map((row: any) => row.name);
    
    for (const index of expectedIndexes) {
      if (!actualIndexes.includes(index)) {
        throw new Error(`Index ${index} not found`);
      }
    }
  }

  async testConstraints() {
    const { paymentsDb } = await connectToDatabase();
    
    // Test unique constraints
    try {
      // Insert test payment
      await paymentsDb.execute({
        sql: 'INSERT INTO payments (tx_signature, user_id, reference_key, amount_lamports, status) VALUES (?, ?, ?, ?, ?)',
        args: ['test_sig_1', 'test_user', 'test_ref_1', 1000]
      });
      
      // Try to insert duplicate reference key (should fail)
      await paymentsDb.execute({
        sql: 'INSERT INTO payments (tx_signature, user_id, reference_key, amount_lamports, status) VALUES (?, ?, ?, ?, ?)',
        args: ['test_sig_2', 'test_user_2', 'test_ref_1', 2000]
      });
      
      // If we get here, constraint didn't work
      await paymentsDb.execute('DELETE FROM payments WHERE reference_key = ?', ['test_ref_1']);
      throw new Error('Unique constraint not working');
    } catch (error: any) {
      // Expected error due to unique constraint
      if (error.message && error.message.includes('UNIQUE')) {
        // Clean up test data
        await paymentsDb.execute('DELETE FROM payments WHERE reference_key = ?', ['test_ref_1']);
        return; // Success!
      }
      throw error;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Phase 1 Foundation Tests...\n');
    
    // Run all tests
    await this.runTest('Database Connection', () => this.testDatabaseConnection());
    await this.runTest('Database Health Check', () => this.testDatabaseHealth());
    await this.runTest('Database Migrations', () => this.testMigrations());
    await this.runTest('Table Creation', () => this.testTableCreation());
    await this.runTest('Index Creation', () => this.testIndexes());
    await this.runTest('Database Constraints', () => this.testConstraints());
    
    // Summary
    this.printSummary();
  }

  private printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.details}`);
        });
      
      console.log('\n🔧 Please fix the above issues before proceeding to Phase 2.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed! Phase 1 Foundation is ready.');
      console.log('\n📋 Next steps:');
      console.log('  1. Configure your .env file with real values');
      console.log('  2. Test API endpoints: npm run test:api');
      console.log('  3. Start development server: npm run dev');
      console.log('  4. Begin Phase 2: Payment System Implementation');
    }
  }
}

// Run tests if this file is executed directly
async function main() {
  const tester = new FoundationTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { FoundationTester };