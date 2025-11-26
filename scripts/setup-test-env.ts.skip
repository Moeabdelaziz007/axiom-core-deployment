#!/usr/bin/env node

/**
 * Test Environment Setup Script
 * 
 * This script sets up isolated testing environments for the Axiom agent system
 * adapted for Cloudflare Workers and Next.js architecture.
 * 
 * Features:
 * - Environment isolation using D1 databases
 * - Mock data generation for testing
 * - Test data cleanup utilities
 * - Performance monitoring setup
 */

import { TestEnvironmentManager } from '../src/testing/environment/TestEnvironmentManager';
import { ValidationEngine } from '../src/testing/validation/AgentValidation';
import { SecurityScanner } from '../src/testing/security/SecurityScanner';
import { TestFramework } from '../src/testing/framework/TestFramework';

// Configuration
const TEST_CONFIG = {
  environment: process.env.NODE_ENV || 'test',
  databaseId: process.env.TEST_DATABASE_ID || 'test-db',
  wranglerEnv: process.env.WRANGLER_ENV || 'test',
  isolationLevel: process.env.TEST_ISOLATION || 'full',
  mockDataSize: parseInt(process.env.MOCK_DATA_SIZE || '100'),
  performanceMonitoring: process.env.PERFORMANCE_MONITORING !== 'false',
  securityScanning: process.env.SECURITY_SCANNING !== 'false',
  validationLevel: process.env.VALIDATION_LEVEL || 'standard'
};

interface TestEnvironment {
  id: string;
  name: string;
  type: 'isolated' | 'shared' | 'production-like';
  purpose: 'unit' | 'integration' | 'performance' | 'security' | 'validation';
  databaseId: string;
  status: 'creating' | 'ready' | 'active' | 'cleaning' | 'error';
  createdAt: Date;
  resources: {
    mockData: any[];
    services: string[];
    endpoints: string[];
  };
  metrics: {
    setupTime: number;
    dataSize: number;
    resourceUsage: any;
  };
}

interface SetupResult {
  success: boolean;
  environment: TestEnvironment | null;
  errors: string[];
  warnings: string[];
  metrics: {
    totalTime: number;
    setupTime: number;
    dataGenerationTime: number;
    validationTime: number;
  };
}

/**
 * Main setup function for test environment
 */
async function setupTestEnvironment(): Promise<SetupResult> {
  const startTime = Date.now();
  const result: SetupResult = {
    success: false,
    environment: null,
    errors: [],
    warnings: [],
    metrics: {
      totalTime: 0,
      setupTime: 0,
      dataGenerationTime: 0,
      validationTime: 0
    }
  };

  console.log('🚀 Setting up Axiom Test Environment...');
  console.log(`📋 Configuration:`, JSON.stringify(TEST_CONFIG, null, 2));

  try {
    // Initialize environment manager
    const envManager = new TestEnvironmentManager();
    
    // Create isolated test environment
    console.log('🏗️ Creating isolated test environment...');
    const setupStart = Date.now();
    
    const environment = await envManager.createEnvironment({
      name: `Axiom Test Env - ${new Date().toISOString()}`,
      type: 'isolated',
      purpose: 'integration',
      config: {
        databaseId: TEST_CONFIG.databaseId,
        wranglerEnv: TEST_CONFIG.wranglerEnv,
        isolationLevel: TEST_CONFIG.isolationLevel,
        performanceMonitoring: TEST_CONFIG.performanceMonitoring
      }
    });

    result.metrics.setupTime = Date.now() - setupStart;
    result.environment = environment;

    console.log(`✅ Environment created: ${environment.id}`);

    // Generate mock data
    console.log('📊 Generating mock test data...');
    const dataGenStart = Date.now();
    
    // Generate user data
    const userData = await envManager.generateTestData('user-generator', {
      size: TEST_CONFIG.mockDataSize,
      environment: TEST_CONFIG.environment
    });

    // Generate agent data
    const agentData = await envManager.generateTestData('agent-generator', {
      size: Math.floor(TEST_CONFIG.mockDataSize / 2),
      types: ['axiom-brain', 'collaboration-hub', 'performance-metrics', 'fleet-monitor'],
      environment: TEST_CONFIG.environment
    });

    // Generate marketplace data
    const marketplaceData = await envManager.generateTestData('marketplace-generator', {
      size: Math.floor(TEST_CONFIG.mockDataSize / 3),
      transactionTypes: ['listing', 'purchase', 'stake', 'collaboration'],
      environment: TEST_CONFIG.environment
    });

    result.metrics.dataGenerationTime = Date.now() - dataGenStart;
    
    console.log(`📊 Generated ${userData.length} users, ${agentData.length} agents, ${marketplaceData.length} marketplace items`);

    // Run security validation if enabled
    if (TEST_CONFIG.securityScanning) {
      console.log('🔒 Running security validation...');
      const securityScanner = new SecurityScanner();
      
      const securityResults = await securityScanner.runSecurityScan({
        target: {
          type: 'environment',
          path: environment.id,
          environment: TEST_CONFIG.environment
        },
        scanners: ['sast', 'dependency', 'secrets'],
        options: {
          fastMode: true,
          environment: TEST_CONFIG.environment
        }
      });

      if (securityResults.overall.status === 'failed') {
        result.errors.push('Security validation failed');
        console.error('❌ Security validation failed:', securityResults.overall.summary);
      } else {
        console.log('✅ Security validation passed');
      }
    }

    // Run agent validation if enabled
    if (TEST_CONFIG.validationLevel !== 'none') {
      console.log('🔍 Running agent validation...');
      const validationStart = Date.now();
      
      const validationEngine = new ValidationEngine();
      
      const validationResults = await validationEngine.executeValidation({
        name: 'Pre-deployment validation',
        target: {
          agentId: 'test-agents',
          environment: TEST_CONFIG.environment
        },
        criteria: ['functional', 'performance', 'security'],
        options: {
          level: TEST_CONFIG.validationLevel,
          fastMode: true
        }
      });

      result.metrics.validationTime = Date.now() - validationStart;

      if (validationResults.overall.status === 'failed') {
        result.errors.push('Agent validation failed');
        console.error('❌ Agent validation failed:', validationResults.overall.summary);
      } else {
        console.log('✅ Agent validation passed');
      }
    }

    // Setup performance monitoring
    if (TEST_CONFIG.performanceMonitoring) {
      console.log('📈 Setting up performance monitoring...');
      await envManager.startPerformanceMonitoring({
        environmentId: environment.id,
        metrics: ['cpu', 'memory', 'requests', 'response-time'],
        interval: 5000
      });
    }

    // Final validation
    const validationResult = await envManager.validateEnvironment(environment.id);
    if (!validationResult.isValid) {
      result.errors.push(...validationResult.errors);
      console.error('❌ Environment validation failed:', validationResult.errors);
    } else {
      console.log('✅ Environment validation passed');
    }

    result.success = result.errors.length === 0;
    result.metrics.totalTime = Date.now() - startTime;

    // Print summary
    console.log('\n🎉 Test Environment Setup Complete!');
    console.log(`⏱️ Total time: ${result.metrics.totalTime}ms`);
    console.log(`📊 Environment: ${environment.id}`);
    console.log(`📊 Data generated: ${userData.length + agentData.length + marketplaceData.length} items`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    return result;

  } catch (error) {
    result.errors.push(`Setup failed: ${error.message}`);
    result.metrics.totalTime = Date.now() - startTime;
    
    console.error('❌ Test environment setup failed:', error);
    
    // Cleanup on failure
    if (result.environment) {
      try {
        await cleanupTestEnvironment(result.environment.id);
        console.log('🧹 Cleaned up failed environment');
      } catch (cleanupError) {
        console.error('❌ Cleanup failed:', cleanupError);
      }
    }
    
    return result;
  }
}

/**
 * Cleanup test environment
 */
async function cleanupTestEnvironment(environmentId: string): Promise<void> {
  console.log(`🧹 Cleaning up environment: ${environmentId}`);
  
  const envManager = new TestEnvironmentManager();
  await envManager.cleanupEnvironment(environmentId);
  
  console.log(`✅ Environment ${environmentId} cleaned up`);
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'setup';

  try {
    switch (command) {
      case 'setup':
        const result = await setupTestEnvironment();
        process.exit(result.success ? 0 : 1);
        
      case 'cleanup':
        const envId = args[1];
        if (!envId) {
          console.error('❌ Environment ID required for cleanup');
          process.exit(1);
        }
        await cleanupTestEnvironment(envId);
        break;
        
      case 'validate':
        const validateEnvId = args[1];
        if (!validateEnvId) {
          console.error('❌ Environment ID required for validation');
          process.exit(1);
        }
        
        const envManager = new TestEnvironmentManager();
        const validationResult = await envManager.validateEnvironment(validateEnvId);
        
        if (validationResult.isValid) {
          console.log('✅ Environment is valid');
          process.exit(0);
        } else {
          console.error('❌ Environment validation failed:', validationResult.errors);
          process.exit(1);
        }
        
      default:
        console.error('❌ Unknown command:', command);
        console.log('Available commands: setup, cleanup <envId>, validate <envId>');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Command execution failed:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  process.exit(0);
});

// Run main function
if (require.main === module) {
  main();
}

export { setupTestEnvironment, cleanupTestEnvironment };