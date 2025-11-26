#!/usr/bin/env node

/**
 * Agent Deployment Validation Script
 * 
 * This script validates agent deployments before they go to production.
 * It runs comprehensive checks including security, performance, and functionality validation.
 */

import { TestEnvironmentManager } from '../src/testing/environment/TestEnvironmentManager';
import { ValidationEngine } from '../src/testing/validation/AgentValidation';
import { SecurityScanner } from '../src/testing/security/SecurityScanner';
import { TestFramework } from '../src/testing/framework/TestFramework';

// Configuration
interface ValidationConfig {
  agentId: string;
  environment: string;
  validationLevel: 'basic' | 'standard' | 'comprehensive';
  skipSecurity: boolean;
  skipPerformance: boolean;
  skipFunctional: boolean;
  timeout: number;
  reportFormat: 'json' | 'html' | 'all';
}

interface ValidationResult {
  agentId: string;
  environment: string;
  timestamp: string;
  overallStatus: 'passed' | 'failed' | 'warning';
  validations: {
    security: SecurityValidationResult;
    performance: PerformanceValidationResult;
    functional: FunctionalValidationResult;
    compliance: ComplianceValidationResult;
  };
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warningChecks: number;
    score: number;
  };
  recommendations: string[];
  artifacts: {
    reportPath: string;
    logPath: string;
    metricsPath: string;
  };
}

interface SecurityValidationResult {
  status: 'passed' | 'failed' | 'warning';
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  scans: {
    sast: ScanResult;
    dependency: ScanResult;
    container: ScanResult;
    infrastructure: ScanResult;
  };
  issues: SecurityIssue[];
}

interface PerformanceValidationResult {
  status: 'passed' | 'failed' | 'warning';
  metrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    resourceUsage: {
      cpu: number;
      memory: number;
      network: number;
    };
  };
  benchmarks: BenchmarkResult[];
  thresholds: PerformanceThresholds;
}

interface FunctionalValidationResult {
  status: 'passed' | 'failed' | 'warning';
  tests: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  capabilities: CapabilityTestResult[];
  workflows: WorkflowTestResult[];
  integration: IntegrationTestResult[];
}

interface ComplianceValidationResult {
  status: 'passed' | 'failed' | 'warning';
  standards: ComplianceStandard[];
  certifications: CertificationResult[];
  auditTrail: AuditTrailEntry[];
  score: number;
}

// Main validation function
async function validateAgentDeployment(config: ValidationConfig): Promise<ValidationResult> {
  const startTime = Date.now();
  
  console.log(`🔍 Starting agent deployment validation...`);
  console.log(`📋 Agent ID: ${config.agentId}`);
  console.log(`🌍 Environment: ${config.environment}`);
  console.log(`📊 Validation Level: ${config.validationLevel}`);
  
  const result: ValidationResult = {
    agentId: config.agentId,
    environment: config.environment,
    timestamp: new Date().toISOString(),
    overallStatus: 'passed',
    validations: {
      security: { status: 'passed', vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0, info: 0 }, scans: {}, issues: [] },
      performance: { status: 'passed', metrics: { responseTime: 0, throughput: 0, errorRate: 0, resourceUsage: { cpu: 0, memory: 0, network: 0 } }, benchmarks: [], thresholds: {} },
      functional: { status: 'passed', tests: { total: 0, passed: 0, failed: 0, skipped: 0 }, capabilities: [], workflows: [], integration: [] },
      compliance: { status: 'passed', standards: [], certifications: [], auditTrail: [], score: 0 }
    },
    summary: {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warningChecks: 0,
      score: 0
    },
    recommendations: [],
    artifacts: {
      reportPath: '',
      logPath: '',
      metricsPath: ''
    }
  };
  
  try {
    // Setup validation environment
    const envManager = new TestEnvironmentManager();
    const testEnv = await envManager.createEnvironment({
      name: `Validation Environment - ${config.agentId}`,
      type: 'isolated',
      purpose: 'validation',
      config: {
        agentId: config.agentId,
        environment: config.environment,
        validationLevel: config.validationLevel
      }
    });
    
    console.log(`✅ Validation environment ready: ${testEnv.id}`);
    
    // Run security validation
    if (!config.skipSecurity) {
      console.log('🔒 Running security validation...');
      result.validations.security = await runSecurityValidation(config, testEnv);
    }
    
    // Run performance validation
    if (!config.skipPerformance) {
      console.log('📈 Running performance validation...');
      result.validations.performance = await runPerformanceValidation(config, testEnv);
    }
    
    // Run functional validation
    if (!config.skipFunctional) {
      console.log('🧪 Running functional validation...');
      result.validations.functional = await runFunctionalValidation(config, testEnv);
    }
    
    // Run compliance validation
    console.log('📋 Running compliance validation...');
    result.validations.compliance = await runComplianceValidation(config, testEnv);
    
    // Calculate overall results
    calculateOverallResults(result);
    
    // Generate artifacts
    await generateValidationArtifacts(result, config);
    
    // Cleanup
    await envManager.cleanupEnvironment(testEnv.id);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Validation completed in ${duration}ms`);
    console.log(`📊 Overall Status: ${result.overallStatus}`);
    console.log(`🏆 Score: ${result.summary.score}%`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    result.overallStatus = 'failed';
    result.summary.failedChecks++;
    result.recommendations.push(`Validation process failed: ${error.message}`);
    return result;
  }
}

// Security validation
async function runSecurityValidation(config: ValidationConfig, testEnv: any): Promise<SecurityValidationResult> {
  const securityScanner = new SecurityScanner();
  
  const scanConfig = {
    target: {
      type: 'agent',
      agentId: config.agentId,
      environment: config.environment
    },
    scanners: ['sast', 'dependency', 'container', 'infrastructure'],
    options: {
      level: config.validationLevel,
      fastMode: config.validationLevel === 'basic'
    }
  };
  
  const scanResults = await securityScanner.runSecurityScan(scanConfig);
  
  return {
    status: scanResults.overall.status === 'passed' ? 'passed' : 
            scanResults.overall.status === 'warning' ? 'warning' : 'failed',
    vulnerabilities: {
      critical: scanResults.vulnerabilities.filter(v => v.severity === 'critical').length,
      high: scanResults.vulnerabilities.filter(v => v.severity === 'high').length,
      medium: scanResults.vulnerabilities.filter(v => v.severity === 'medium').length,
      low: scanResults.vulnerabilities.filter(v => v.severity === 'low').length,
      info: scanResults.vulnerabilities.filter(v => v.severity === 'info').length
    },
    scans: scanResults.scans,
    issues: scanResults.vulnerabilities.map(v => ({
      type: v.type,
      severity: v.severity,
      description: v.description,
      recommendation: v.recommendation,
      cve: v.cve
    }))
  };
}

// Performance validation
async function runPerformanceValidation(config: ValidationConfig, testEnv: any): Promise<PerformanceValidationResult> {
  const testFramework = new TestFramework();
  
  const performanceConfig = {
    agentId: config.agentId,
    environment: config.environment,
    scenarios: config.validationLevel === 'comprehensive' ? 
      ['basic-load', 'stress-test', 'scalability-test'] : 
      ['basic-load'],
    duration: config.validationLevel === 'comprehensive' ? 120000 : 60000,
    thresholds: {
      responseTime: config.validationLevel === 'comprehensive' ? 200 : 500,
      errorRate: 0.01,
      throughput: 100
    }
  };
  
  const performanceResults = await testFramework.runPerformanceTest(performanceConfig);
  
  return {
    status: performanceResults.overall.status === 'passed' ? 'passed' : 'failed',
    metrics: performanceResults.metrics,
    benchmarks: performanceResults.benchmarks,
    thresholds: performanceConfig.thresholds
  };
}

// Functional validation
async function runFunctionalValidation(config: ValidationConfig, testEnv: any): Promise<FunctionalValidationResult> {
  const testFramework = new TestFramework();
  
  const functionalConfig = {
    agentId: config.agentId,
    environment: config.environment,
    testSuites: ['unit', 'integration'],
    coverage: config.validationLevel !== 'basic',
    parallel: true
  };
  
  const functionalResults = await testFramework.runFunctionalTest(functionalConfig);
  
  return {
    status: functionalResults.overall.status === 'passed' ? 'passed' : 'failed',
    tests: functionalResults.tests,
    capabilities: functionalResults.capabilities,
    workflows: functionalResults.workflows,
    integration: functionalResults.integration
  };
}

// Compliance validation
async function runComplianceValidation(config: ValidationConfig, testEnv: any): Promise<ComplianceValidationResult> {
  const validationEngine = new ValidationEngine();
  
  const complianceConfig = {
    target: {
      agentId: config.agentId,
      environment: config.environment
    },
    criteria: ['functional', 'performance', 'security', 'compliance'],
    standards: ['OWASP', 'GDPR', 'SOC2', 'ISO27001'],
    level: config.validationLevel
  };
  
  const complianceResults = await validationEngine.executeValidation(complianceConfig);
  
  return {
    status: complianceResults.overall.status === 'passed' ? 'passed' : 'warning',
    standards: complianceResults.standards,
    certifications: complianceResults.certifications,
    auditTrail: complianceResults.auditTrail,
    score: complianceResults.overall.score
  };
}

// Calculate overall results
function calculateOverallResults(result: ValidationResult): void {
  const validations = result.validations;
  
  // Count checks
  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;
  let warningChecks = 0;
  
  Object.values(validations).forEach(validation => {
    if (validation.status === 'passed') passedChecks++;
    else if (validation.status === 'failed') failedChecks++;
    else if (validation.status === 'warning') warningChecks++;
    totalChecks++;
  });
  
  result.summary = {
    totalChecks,
    passedChecks,
    failedChecks,
    warningChecks,
    score: Math.round((passedChecks / totalChecks) * 100)
  };
  
  // Determine overall status
  if (failedChecks > 0) {
    result.overallStatus = 'failed';
  } else if (warningChecks > 0) {
    result.overallStatus = 'warning';
  } else {
    result.overallStatus = 'passed';
  }
  
  // Generate recommendations
  generateRecommendations(result);
}

// Generate recommendations
function generateRecommendations(result: ValidationResult): void {
  const recommendations: string[] = [];
  
  // Security recommendations
  const security = result.validations.security;
  if (security.status !== 'passed') {
    if (security.vulnerabilities.critical > 0) {
      recommendations.push('🚨 Critical security vulnerabilities must be resolved before deployment');
    }
    if (security.vulnerabilities.high > 0) {
      recommendations.push('⚠️ Address high-severity security issues');
    }
    recommendations.push('🔒 Run security scan with latest vulnerability database');
  }
  
  // Performance recommendations
  const performance = result.validations.performance;
  if (performance.status !== 'passed') {
    if (performance.metrics.responseTime > 500) {
      recommendations.push('📈 Optimize response time (currently > 500ms)');
    }
    if (performance.metrics.errorRate > 0.01) {
      recommendations.push('🚨 Reduce error rate (currently > 1%)');
    }
    recommendations.push('⚡ Consider performance optimization and caching');
  }
  
  // Functional recommendations
  const functional = result.validations.functional;
  if (functional.status !== 'passed') {
    if (functional.tests.failed > 0) {
      recommendations.push(`🧪 Fix ${functional.tests.failed} failing functional tests`);
    }
    recommendations.push('🔧 Ensure all functional tests pass before deployment');
  }
  
  // Compliance recommendations
  const compliance = result.validations.compliance;
  if (compliance.status !== 'passed') {
    recommendations.push('📋 Address compliance issues');
    recommendations.push('🏷️ Update documentation and audit trails');
  }
  
  result.recommendations = recommendations;
}

// Generate validation artifacts
async function generateValidationArtifacts(result: ValidationResult, config: ValidationConfig): Promise<void> {
  const fs = require('fs');
  const path = require('path');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.join(process.cwd(), 'validation-reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportBase = `validation-${result.agentId}-${timestamp}`;
  
  // JSON report
  if (config.reportFormat === 'json' || config.reportFormat === 'all') {
    const jsonPath = path.join(reportDir, `${reportBase}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    result.artifacts.reportPath = jsonPath;
  }
  
  // HTML report
  if (config.reportFormat === 'html' || config.reportFormat === 'all') {
    const htmlPath = path.join(reportDir, `${reportBase}.html`);
    const htmlReport = generateHTMLReport(result);
    fs.writeFileSync(htmlPath, htmlReport);
    if (!result.artifacts.reportPath) {
      result.artifacts.reportPath = htmlPath;
    }
  }
  
  // Log file
  const logPath = path.join(reportDir, `${reportBase}.log`);
  const logContent = generateLogFile(result);
  fs.writeFileSync(logPath, logContent);
  result.artifacts.logPath = logPath;
  
  // Metrics file
  const metricsPath = path.join(reportDir, `${reportBase}-metrics.json`);
  const metrics = extractMetrics(result);
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  result.artifacts.metricsPath = metricsPath;
}

// Generate HTML report
function generateHTMLReport(result: ValidationResult): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Agent Deployment Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
    .status-passed { background: #d4edda; color: #155724; }
    .status-failed { background: #f8d7da; color: #721c24; }
    .status-warning { background: #fff3cd; color: #856404; }
    .metric { display: inline-block; margin: 10px; padding: 15px; background: #e9ecef; border-radius: 5px; text-align: center; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .recommendations { background: #e7f3ff; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Agent Deployment Validation Report</h1>
    <p><strong>Agent ID:</strong> ${result.agentId}</p>
    <p><strong>Environment:</strong> ${result.environment}</p>
    <p><strong>Timestamp:</strong> ${result.timestamp}</p>
    <p><strong>Overall Status:</strong> <span class="status-${result.overallStatus}">${result.overallStatus.toUpperCase()}</span></p>
  </div>
  
  <div class="section">
    <h2>📊 Summary</h2>
    <div class="metric">
      <h3>${result.summary.score}%</h3>
      <p>Overall Score</p>
    </div>
    <div class="metric">
      <h3>${result.summary.passedChecks}/${result.summary.totalChecks}</h3>
      <p>Checks Passed</p>
    </div>
    <div class="metric">
      <h3>${result.summary.failedChecks}</h3>
      <p>Checks Failed</p>
    </div>
  </div>
  
  <div class="section">
    <h2>🔒 Security Validation</h2>
    <p><strong>Status:</strong> <span class="status-${result.validations.security.status}">${result.validations.security.status}</span></p>
    <p><strong>Vulnerabilities:</strong> ${result.validations.security.vulnerabilities.critical} critical, ${result.validations.security.vulnerabilities.high} high, ${result.validations.security.vulnerabilities.medium} medium, ${result.validations.security.vulnerabilities.low} low</p>
  </div>
  
  <div class="section">
    <h2>📈 Performance Validation</h2>
    <p><strong>Status:</strong> <span class="status-${result.validations.performance.status}">${result.validations.performance.status}</span></p>
    <p><strong>Response Time:</strong> ${result.validations.performance.metrics.responseTime}ms</p>
    <p><strong>Throughput:</strong> ${result.validations.performance.metrics.throughput} req/s</p>
    <p><strong>Error Rate:</strong> ${(result.validations.performance.metrics.errorRate * 100).toFixed(2)}%</p>
  </div>
  
  <div class="section">
    <h2>🧪 Functional Validation</h2>
    <p><strong>Status:</strong> <span class="status-${result.validations.functional.status}">${result.validations.functional.status}</span></p>
    <p><strong>Tests:</strong> ${result.validations.functional.tests.passed}/${result.validations.functional.tests.total} passed</p>
  </div>
  
  <div class="recommendations">
    <h2>💡 Recommendations</h2>
    <ul>
      ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
  </div>
</body>
</html>
  `;
}

// Generate log file
function generateLogFile(result: ValidationResult): string {
  const log = [
    `Agent Deployment Validation Log`,
    `================================`,
    `Agent ID: ${result.agentId}`,
    `Environment: ${result.environment}`,
    `Timestamp: ${result.timestamp}`,
    `Overall Status: ${result.overallStatus}`,
    `Score: ${result.summary.score}%`,
    ``,
    `Validation Results:`,
    `- Security: ${result.validations.security.status}`,
    `- Performance: ${result.validations.performance.status}`,
    `- Functional: ${result.validations.functional.status}`,
    `- Compliance: ${result.validations.compliance.status}`,
    ``,
    `Recommendations:`,
    ...result.recommendations.map(rec => `- ${rec}`),
    ``,
    `Artifacts:`,
    `- Report: ${result.artifacts.reportPath}`,
    `- Log: ${result.artifacts.logPath}`,
    `- Metrics: ${result.artifacts.metricsPath}`
  ];
  
  return log.join('\n');
}

// Extract metrics
function extractMetrics(result: ValidationResult): any {
  return {
    agentId: result.agentId,
    environment: result.environment,
    timestamp: result.timestamp,
    overallStatus: result.overallStatus,
    score: result.summary.score,
    security: {
      status: result.validations.security.status,
      vulnerabilities: result.validations.security.vulnerabilities
    },
    performance: {
      status: result.validations.performance.status,
      metrics: result.validations.performance.metrics
    },
    functional: {
      status: result.validations.functional.status,
      tests: result.validations.functional.tests
    },
    compliance: {
      status: result.validations.compliance.status,
      score: result.validations.compliance.score
    }
  };
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Agent ID is required');
    console.log('Usage: npm run validate:agent -- <agent-id> [options]');
    console.log('Options:');
    console.log('  --environment <env>    Target environment (default: staging)');
    console.log('  --level <level>        Validation level: basic, standard, comprehensive (default: standard)');
    console.log('  --skip-security         Skip security validation');
    console.log('  --skip-performance      Skip performance validation');
    console.log('  --skip-functional       Skip functional validation');
    console.log('  --format <format>       Report format: json, html, all (default: all)');
    process.exit(1);
  }
  
  const config: ValidationConfig = {
    agentId: args[0],
    environment: 'staging',
    validationLevel: 'standard',
    skipSecurity: false,
    skipPerformance: false,
    skipFunctional: false,
    timeout: 300000,
    reportFormat: 'all'
  };
  
  // Parse command line arguments
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--environment':
        config.environment = args[++i];
        break;
      case '--level':
        config.validationLevel = args[++i] as any;
        break;
      case '--skip-security':
        config.skipSecurity = true;
        break;
      case '--skip-performance':
        config.skipPerformance = true;
        break;
      case '--skip-functional':
        config.skipFunctional = true;
        break;
      case '--format':
        config.reportFormat = args[++i] as any;
        break;
    }
  }
  
  try {
    const result = await validateAgentDeployment(config);
    
    // Exit with appropriate code
    process.exit(
      result.overallStatus === 'passed' ? 0 :
      result.overallStatus === 'warning' ? 1 : 2
    );
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(3);
  }
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

export { validateAgentDeployment, ValidationConfig, ValidationResult };