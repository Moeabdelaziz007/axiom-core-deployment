#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Axiom Agent System
 * 
 * This script orchestrates the complete testing pipeline including:
 * - Unit tests for agent superpowers
 * - Integration tests for marketplace and collaboration
 * - Performance benchmarking and load testing
 * - Security vulnerability scanning
 * - Agent capability validation
 * 
 * Adapted for Cloudflare Workers and Next.js architecture.
 */

import { TestFramework } from '../src/testing/framework/TestFramework';
import { TestEnvironmentManager } from '../src/testing/environment/TestEnvironmentManager';
import { ValidationEngine } from '../src/testing/validation/AgentValidation';
import { SecurityScanner } from '../src/testing/security/SecurityScanner';
import { setupTestEnvironment } from './setup-test-env';

// Test configuration
const TEST_CONFIG = {
  environment: process.env.NODE_ENV || 'test',
  testType: process.env.TEST_TYPE || 'all', // unit, integration, performance, security, validation, all
  agentFilter: process.env.AGENT_FILTER || 'all',
  parallel: process.env.PARALLEL_TESTS !== 'false',
  timeout: parseInt(process.env.TEST_TIMEOUT || '300000'), // 5 minutes default
  coverage: process.env.GENERATE_COVERAGE !== 'false',
  reporting: process.env.GENERATE_REPORTS !== 'false',
  failFast: process.env.FAIL_FAST === 'true',
  verbose: process.env.VERBOSE === 'true'
};

interface TestSuite {
  name: string;
  type: 'unit' | 'integration' | 'performance' | 'security' | 'validation';
  tests: TestConfig[];
  dependencies?: string[];
  timeout?: number;
  parallel?: boolean;
}

interface TestConfig {
  name: string;
  path: string;
  environment?: string;
  timeout?: number;
  parallel?: boolean;
  agents?: string[];
  services?: string[];
  database?: boolean;
  options?: any;
}

interface TestResults {
  suite: string;
  type: string;
  status: 'passed' | 'failed' | 'skipped' | 'timeout';
  duration: number;
  tests: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  errors: string[];
  warnings: string[];
  metrics: any;
}

interface ComprehensiveTestReport {
  summary: {
    totalSuites: number;
    passedSuites: number;
    failedSuites: number;
    skippedSuites: number;
    totalDuration: number;
    overallStatus: 'passed' | 'failed' | 'partial';
  };
  suites: TestResults[];
  environment: {
    id: string;
    type: string;
    status: string;
    resources: any;
  };
  qualityMetrics: {
    codeCoverage: number;
    securityScore: number;
    performanceScore: number;
    validationScore: number;
    overallQuality: number;
  };
  recommendations: string[];
  artifacts: {
    reports: string[];
    coverage: string[];
    logs: string[];
    metrics: string[];
  };
}

/**
 * Define test suites
 */
function getTestSuites(): TestSuite[] {
  const allSuites: TestSuite[] = [
    {
      name: 'Agent Superpowers Unit Tests',
      type: 'unit',
      tests: [
        {
          name: 'Superpower Activation Tests',
          path: 'src/testing/unit/AgentSuperpowers.test.ts',
          timeout: 60000,
          parallel: true,
          agents: ['axiom-brain', 'collaboration-hub', 'performance-metrics']
        },
        {
          name: 'Agent Evolution Tests',
          path: 'src/testing/unit/AgentEvolution.test.ts',
          timeout: 60000,
          parallel: true
        },
        {
          name: 'Collaboration System Tests',
          path: 'src/testing/unit/CollaborationSystem.test.ts',
          timeout: 60000,
          parallel: true
        }
      ]
    },
    {
      name: 'Marketplace Integration Tests',
      type: 'integration',
      tests: [
        {
          name: 'Agent Discovery Integration',
          path: 'src/testing/integration/MarketplaceIntegration.test.ts',
          timeout: 120000,
          parallel: false,
          services: ['marketplace-api', 'collaboration-api'],
          database: true
        },
        {
          name: 'Transaction Processing Tests',
          path: 'src/testing/integration/TransactionProcessing.test.ts',
          timeout: 120000,
          parallel: false,
          services: ['payment-aggregator', 'staking-engine'],
          database: true
        }
      ],
      dependencies: ['unit']
    },
    {
      name: 'Performance Load Tests',
      type: 'performance',
      tests: [
        {
          name: 'Basic Load Test',
          path: 'src/testing/performance/LoadTesting.test.ts',
          timeout: 300000,
          parallel: false,
          options: {
            scenario: 'basic-load',
            users: 100,
            duration: 60
          }
        },
        {
          name: 'Stress Test',
          path: 'src/testing/performance/LoadTesting.test.ts',
          timeout: 300000,
          parallel: false,
          options: {
            scenario: 'stress-test',
            users: 1000,
            duration: 120
          }
        }
      ],
      dependencies: ['integration']
    },
    {
      name: 'Security Vulnerability Tests',
      type: 'security',
      tests: [
        {
          name: 'SAST Code Analysis',
          path: 'src/testing/security/SecurityScanner.test.ts',
          timeout: 180000,
          parallel: false,
          options: {
            scanner: 'sast',
            target: 'src/',
            fastMode: true
          }
        },
        {
          name: 'Dependency Security Scan',
          path: 'src/testing/security/SecurityScanner.test.ts',
          timeout: 120000,
          parallel: false,
          options: {
            scanner: 'dependency',
            target: 'package.json'
          }
        }
      ]
    },
    {
      name: 'Agent Validation Tests',
      type: 'validation',
      tests: [
        {
          name: 'Agent Capability Validation',
          path: 'src/testing/validation/AgentValidation.test.ts',
          timeout: 120000,
          parallel: false,
          options: {
            criteria: ['functional', 'performance', 'security'],
            level: 'standard'
          }
        }
      ]
    }
  ];

  // Filter by test type
  if (TEST_CONFIG.testType !== 'all') {
    return allSuites.filter(suite => suite.type === TEST_CONFIG.testType);
  }

  return allSuites;
}

/**
 * Setup test environment
 */
async function setupEnvironment(): Promise<any> {
  console.log('🏗️ Setting up test environment...');
  
  const setupResult = await setupTestEnvironment();
  
  if (!setupResult.success) {
    throw new Error(`Test environment setup failed: ${setupResult.errors.join(', ')}`);
  }
  
  console.log(`✅ Test environment ready: ${setupResult.environment.id}`);
  return setupResult.environment;
}

/**
 * Run a single test suite
 */
async function runTestSuite(suite: TestSuite, environment: any): Promise<TestResults> {
  console.log(`\n🧪 Running ${suite.name}...`);
  
  const startTime = Date.now();
  const results: TestResults = {
    suite: suite.name,
    type: suite.type,
    status: 'passed',
    duration: 0,
    tests: { total: 0, passed: 0, failed: 0, skipped: 0 },
    errors: [],
    warnings: [],
    metrics: {}
  };

  try {
    const testFramework = new TestFramework();
    
    // Configure test framework
    await testFramework.configure({
      environment: TEST_CONFIG.environment,
      parallel: suite.parallel || TEST_CONFIG.parallel,
      timeout: suite.timeout || TEST_CONFIG.timeout,
      coverage: TEST_CONFIG.coverage,
      reporting: TEST_CONFIG.reporting,
      verbose: TEST_CONFIG.verbose
    });

    // Run tests in the suite
    for (const test of suite.tests) {
      console.log(`  📋 Running: ${test.name}`);
      
      try {
        const testResult = await testFramework.runTest({
          name: test.name,
          path: test.path,
          environment: test.environment || TEST_CONFIG.environment,
          timeout: test.timeout || suite.timeout || TEST_CONFIG.timeout,
          parallel: test.parallel || suite.parallel || TEST_CONFIG.parallel,
          options: {
            ...test.options,
            agents: test.agents,
            services: test.services,
            database: test.database,
            environmentId: environment.id
          }
        });

        // Update results
        results.tests.total += testResult.total;
        results.tests.passed += testResult.passed;
        results.tests.failed += testResult.failed;
        results.tests.skipped += testResult.skipped;

        // Add coverage if available
        if (testResult.coverage) {
          results.coverage = {
            ...results.coverage,
            ...testResult.coverage
          };
        }

        // Add errors and warnings
        results.errors.push(...testResult.errors);
        results.warnings.push(...testResult.warnings);

        // Add metrics
        results.metrics[test.name] = testResult.metrics;

        if (testResult.status === 'failed' && TEST_CONFIG.failFast) {
          throw new Error(`Test ${test.name} failed (fail-fast mode)`);
        }

        console.log(`    ${testResult.status === 'passed' ? '✅' : '❌'} ${test.name} (${testResult.passed}/${testResult.total} passed)`);

      } catch (error) {
        results.tests.failed++;
        results.errors.push(`${test.name}: ${error.message}`);
        console.log(`    ❌ ${test.name}: ${error.message}`);
        
        if (TEST_CONFIG.failFast) {
          throw error;
        }
      }
    }

    // Determine suite status
    if (results.tests.failed > 0) {
      results.status = 'failed';
    } else if (results.tests.skipped > 0) {
      results.status = 'partial';
    }

  } catch (error) {
    results.status = 'failed';
    results.errors.push(`Suite execution failed: ${error.message}`);
    console.error(`❌ Suite ${suite.name} failed:`, error.message);
  }

  results.duration = Date.now() - startTime;
  console.log(`⏱️ ${suite.name} completed in ${results.duration}ms (${results.tests.passed}/${results.tests.total} passed)`);
  
  return results;
}

/**
 * Generate comprehensive test report
 */
function generateTestReport(
  suiteResults: TestResults[],
  environment: any,
  startTime: number
): ComprehensiveTestReport {
  const totalDuration = Date.now() - startTime;
  
  const summary = {
    totalSuites: suiteResults.length,
    passedSuites: suiteResults.filter(r => r.status === 'passed').length,
    failedSuites: suiteResults.filter(r => r.status === 'failed').length,
    skippedSuites: suiteResults.filter(r => r.status === 'skipped').length,
    totalDuration,
    overallStatus: suiteResults.every(r => r.status === 'passed') ? 'passed' : 
                 suiteResults.some(r => r.status === 'failed') ? 'failed' : 'partial'
  };

  // Calculate quality metrics
  const qualityMetrics = {
    codeCoverage: calculateAverageCoverage(suiteResults),
    securityScore: calculateSecurityScore(suiteResults),
    performanceScore: calculatePerformanceScore(suiteResults),
    validationScore: calculateValidationScore(suiteResults),
    overallQuality: 0
  };
  
  qualityMetrics.overallQuality = (
    qualityMetrics.codeCoverage * 0.3 +
    qualityMetrics.securityScore * 0.3 +
    qualityMetrics.performanceScore * 0.2 +
    qualityMetrics.validationScore * 0.2
  );

  // Generate recommendations
  const recommendations = generateRecommendations(suiteResults, qualityMetrics);

  return {
    summary,
    suites: suiteResults,
    environment: {
      id: environment.id,
      type: environment.type,
      status: environment.status,
      resources: environment.resources
    },
    qualityMetrics,
    recommendations,
    artifacts: {
      reports: ['test-report.json', 'test-report.html'],
      coverage: ['coverage/lcov.info', 'coverage/coverage.json'],
      logs: ['test-results.log'],
      metrics: ['performance-metrics.json', 'security-scan.json']
    }
  };
}

/**
 * Calculate average code coverage
 */
function calculateAverageCoverage(suiteResults: TestResults[]): number {
  const coverageResults = suiteResults.filter(r => r.coverage);
  if (coverageResults.length === 0) return 0;
  
  const totalCoverage = coverageResults.reduce((sum, result) => {
    return sum + (result.coverage?.lines || 0);
  }, 0);
  
  return Math.round(totalCoverage / coverageResults.length);
}

/**
 * Calculate security score
 */
function calculateSecurityScore(suiteResults: TestResults[]): number {
  const securityResults = suiteResults.filter(r => r.type === 'security');
  if (securityResults.length === 0) return 100;
  
  const passedSecurity = securityResults.filter(r => r.status === 'passed').length;
  return Math.round((passedSecurity / securityResults.length) * 100);
}

/**
 * Calculate performance score
 */
function calculatePerformanceScore(suiteResults: TestResults[]): number {
  const performanceResults = suiteResults.filter(r => r.type === 'performance');
  if (performanceResults.length === 0) return 100;
  
  const passedPerformance = performanceResults.filter(r => r.status === 'passed').length;
  return Math.round((passedPerformance / performanceResults.length) * 100);
}

/**
 * Calculate validation score
 */
function calculateValidationScore(suiteResults: TestResults[]): number {
  const validationResults = suiteResults.filter(r => r.type === 'validation');
  if (validationResults.length === 0) return 100;
  
  const passedValidation = validationResults.filter(r => r.status === 'passed').length;
  return Math.round((passedValidation / validationResults.length) * 100);
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(suiteResults: TestResults[], qualityMetrics: any): string[] {
  const recommendations: string[] = [];
  
  // Coverage recommendations
  if (qualityMetrics.codeCoverage < 80) {
    recommendations.push('Increase code coverage to at least 80% for better reliability');
  }
  
  // Security recommendations
  if (qualityMetrics.securityScore < 90) {
    recommendations.push('Address security vulnerabilities to improve security score');
  }
  
  // Performance recommendations
  if (qualityMetrics.performanceScore < 85) {
    recommendations.push('Optimize performance bottlenecks identified in load tests');
  }
  
  // Validation recommendations
  if (qualityMetrics.validationScore < 95) {
    recommendations.push('Fix agent validation issues to ensure compliance');
  }
  
  // Error-based recommendations
  suiteResults.forEach(result => {
    if (result.errors.length > 0) {
      recommendations.push(`Fix ${result.errors.length} errors in ${result.suite}`);
    }
  });
  
  return recommendations;
}

/**
 * Main test execution function
 */
async function runComprehensiveTests(): Promise<ComprehensiveTestReport> {
  const startTime = Date.now();
  
  console.log('🚀 Starting Comprehensive Axiom Agent Testing...');
  console.log(`📋 Configuration:`, JSON.stringify(TEST_CONFIG, null, 2));
  
  let environment: any = null;
  const suiteResults: TestResults[] = [];
  
  try {
    // Setup test environment
    environment = await setupEnvironment();
    
    // Get test suites
    const testSuites = getTestSuites();
    console.log(`📋 Found ${testSuites.length} test suites to run`);
    
    // Run test suites
    for (const suite of testSuites) {
      const result = await runTestSuite(suite, environment);
      suiteResults.push(result);
      
      // Early exit if critical suite fails and fail-fast is enabled
      if (result.status === 'failed' && TEST_CONFIG.failFast) {
        console.log('🛑 Stopping test execution due to critical failure (fail-fast mode)');
        break;
      }
    }
    
    // Generate comprehensive report
    const report = generateTestReport(suiteResults, environment, startTime);
    
    // Print summary
    console.log('\n🎉 Comprehensive Testing Complete!');
    console.log(`📊 Summary: ${report.summary.passedSuites}/${report.summary.totalSuites} suites passed`);
    console.log(`⏱️ Total duration: ${report.summary.totalDuration}ms`);
    console.log(`🏆 Overall quality score: ${Math.round(report.qualityMetrics.overallQuality)}%`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
    
    return report;
    
  } catch (error) {
    console.error('❌ Comprehensive testing failed:', error);
    
    const report = generateTestReport(suiteResults, environment, startTime);
    report.summary.overallStatus = 'failed';
    
    return report;
  } finally {
    // Cleanup environment
    if (environment) {
      try {
        console.log('\n🧹 Cleaning up test environment...');
        const envManager = new TestEnvironmentManager();
        await envManager.cleanupEnvironment(environment.id);
        console.log('✅ Test environment cleaned up');
      } catch (cleanupError) {
        console.error('❌ Environment cleanup failed:', cleanupError);
      }
    }
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    const report = await runComprehensiveTests();
    
    // Save report
    if (TEST_CONFIG.reporting) {
      const fs = require('fs');
      const path = require('path');
      
      const reportDir = path.join(process.cwd(), 'test-reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Save JSON report
      fs.writeFileSync(
        path.join(reportDir, 'comprehensive-test-report.json'),
        JSON.stringify(report, null, 2)
      );
      
      // Save HTML report
      const htmlReport = generateHTMLReport(report);
      fs.writeFileSync(
        path.join(reportDir, 'comprehensive-test-report.html'),
        htmlReport
      );
      
      console.log(`📊 Reports saved to ${reportDir}`);
    }
    
    // Exit with appropriate code
    process.exit(
      report.summary.overallStatus === 'passed' ? 0 :
      report.summary.overallStatus === 'partial' ? 1 : 2
    );
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(3);
  }
}

/**
 * Generate HTML report
 */
function generateHTMLReport(report: ComprehensiveTestReport): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Axiom Agent Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    .summary { display: flex; gap: 20px; margin: 20px 0; }
    .metric { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
    .passed { background: #d4edda; }
    .failed { background: #f8d7da; }
    .partial { background: #fff3cd; }
    .suite { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
    .recommendations { background: #e7f3ff; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Axiom Agent Testing Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    <p>Environment: ${report.environment.id}</p>
  </div>
  
  <div class="summary">
    <div class="metric ${report.summary.overallStatus}">
      <h3>${report.summary.passedSuites}/${report.summary.totalSuites}</h3>
      <p>Suites Passed</p>
    </div>
    <div class="metric">
      <h3>${Math.round(report.qualityMetrics.overallQuality)}%</h3>
      <p>Quality Score</p>
    </div>
    <div class="metric">
      <h3>${Math.round(report.summary.totalDuration / 1000)}s</h3>
      <p>Total Duration</p>
    </div>
  </div>
  
  <h2>📊 Test Suites</h2>
  ${report.suites.map(suite => `
    <div class="suite ${suite.status}">
      <h3>${suite.suite}</h3>
      <p>Status: ${suite.status} | Duration: ${suite.duration}ms</p>
      <p>Tests: ${suite.tests.passed}/${suite.tests.total} passed</p>
      ${suite.errors.length > 0 ? `<p>Errors: ${suite.errors.join(', ')}</p>` : ''}
    </div>
  `).join('')}
  
  <h2>💡 Recommendations</h2>
  <div class="recommendations">
    <ul>
      ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
  </div>
</body>
</html>
  `;
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, exiting...');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, exiting...');
  process.exit(1);
});

// Run main function
if (require.main === module) {
  main();
}

export { runComprehensiveTests, getTestSuites };