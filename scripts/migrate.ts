import { runMigrations } from '../src/lib/migrations';

async function runMigrations() {
  console.log('🚀 Starting database migration...');
  
  try {
    const result = await runMigrations();
    
    if (result.success) {
      console.log(`✅ Migration completed successfully!`);
      console.log(`📊 Migrated ${result.migrated} migration(s)`);
      console.log('\n🎉 Phase 1 Foundation Setup is ready!');
      console.log('\n📋 Next steps:');
      console.log('  1. Configure your .env file with proper values');
      console.log('  2. Test API endpoints: npm run test:api');
      console.log('  3. Start development server: npm run dev');
      console.log('  4. Proceed to Phase 2: Payment System');
    } else {
      console.error('❌ Migration failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigrations().catch(console.error);