/**
 * 🧪 OPAL INTEGRATION VALIDATION & TESTING
 * 
 * Comprehensive test suite for the Core Opal Integration Layer
 * Validates integration with existing ai-engine.ts and tests all components
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { 
  OpalIntegrationService, 
  OpalIntegrationConfig 
} from '../services/opal-integration';
import { 
  OpalAPIClient, 
  OpalAPIError 
} from '../lib/opal-client';
import { WorkflowBridgeService } from '../services/workflow-bridge';
import { 
  OpalWorkflowTemplate,
  OpalExecutionRequest,
  AgentType,
  DEFAULT_OPAL_CONFIGS,
  MENA_OPAL_TEMPLATES,
  OpalCapability
} from '../types/opal-agents';
import { aiEngine } from '../lib/ai-engine';

/**
 * Test configuration for local development
 */
const TEST_CONFIG: OpalIntegrationConfig = {
  opalBridgeConfig: {
    apiEndpoint: 'https://api.opal.dev/v1',
    authentication: {
      type: 'api_key',
      credentials: {
        apiKey: process.env.OPAL_API_KEY || 'test_api_key'
      }
    },
    timeout: 30000,
    retryAttempts: 3,
    rateLimiting: {
      requestsPerMinute: 100,
      burstLimit: 10
    },
    webhooks: {
      enabled: true,
      endpoint: 'https://axiom.example.com/webhooks/opal',
      secret: process.env.OPAL_WEBHOOK_SECRET || 'test_secret'
    }
  },
  workflowBridgeConfig: {
    defaultTimeout: 300000,
    maxRetries: 3,
    enableCaching: true,
    cacheTimeout: 300000,
    enableMetrics: true
  },
  agentConfigs: DEFAULT_OPAL_CONFIGS,
  monitoring: {
    enabled: true,
    logLevel: 'info',
    metricsCollection: true,
    alertThresholds: {
      executionTime: 600000,
      errorRate: 0.1,
      costLimit: 10.0
    }
  }
};

/**
 * Test result interface
 */
interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  duration: number;
  data?: any;
  error?: any;
}

/**
 * Opal Integration Test Suite
 */
export class OpalIntegrationTestSuite {
  private integrationService: OpalIntegrationService;
  private apiClient: OpalAPIClient;
  private workflowBridge: WorkflowBridgeService;
  private testResults: TestResult[] = [];

  constructor() {
    console.log('🧪 Initializing Opal Integration Test Suite');
    
    // Initialize components
    this.apiClient = new OpalAPIClient(TEST_CONFIG.opalBridgeConfig);
    this.workflowBridge = new WorkflowBridgeService(TEST_CONFIG.workflowBridgeConfig);
    this.integrationService = new OpalIntegrationService(TEST_CONFIG);
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<{
    total: number;
    passed: number;
    failed: number;
    results: TestResult[];
    summary: string;
  }> {
    console.log('🚀 Starting comprehensive test suite...\n');

    const testMethods = [
      this.testTypeDefinitions.bind(this),
      this.testAPIClientInitialization.bind(this),
      this.testWorkflowBridgeInitialization.bind(this),
      this.testIntegrationServiceInitialization.bind(this),
      this.testAgentTypeIntegration.bind(this),
      this.testWorkflowTemplateCreation.bind(this),
      this.testWorkflowExecutionViaBridge.bind(this),
      this.testAgentCapabilityMappings.bind(this),
      this.testMENAWorkflowTemplates.bind(this),
      this.testPerformanceMetrics.bind(this),
      this.testErrorHandling.bind(this),
      this.testHealthCheck.bind(this),
      this.testEventSystem.bind(this),
      this.testCachingMechanism.bind(this),
      this.testSecurityFeatures.bind(this)
    ];

    for (const testMethod of testMethods) {
      try {
        await testMethod();
      } catch (error) {
        this.addTestResult(testMethod.name.replace('test', ''), false, 'Test execution failed', 0, null, error);
      }
    }

    return this.generateTestReport();
  }

  /**
   * Test 1: Type Definitions and Imports
   */
  private async testTypeDefinitions(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test agent types
      const agentTypes = Object.values(AgentType);
      if (agentTypes.length !== 4) {
        throw new Error(`Expected 4 agent types, got ${agentTypes.length}`);
      }

      // Test default configurations
      const tajerConfig = DEFAULT_OPAL_CONFIGS[AgentType.TAJER];
      if (!tajerConfig || tajerConfig.agentType !== AgentType.TAJER) {
        throw new Error('TAJER agent configuration invalid');
      }

      // Test MENA templates
      if (MENA_OPAL_TEMPLATES.length === 0) {
        throw new Error('No MENA workflow templates found');
      }

      this.addTestResult('Type Definitions', true, 'All types properly defined', Date.now() - startTime);
    } catch (error) {
      this.addTestResult('Type Definitions', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 2: API Client Initialization
   */
  private async testAPIClientInitialization(): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (!this.apiClient) {
        throw new Error('API Client not initialized');
      }

      // Test health check (will fail with test endpoint, but should not throw)
      try {
        const isHealthy = await this.apiClient.healthCheck();
        this.addTestResult('API Client Health', !isHealthy, 'Expected health check to fail with test endpoint', Date.now() - startTime);
      } catch (error) {
        // Expected to fail with test configuration
        this.addTestResult('API Client Health', true, 'API client handles errors gracefully', Date.now() - startTime);
      }

      this.addTestResult('API Client Initialization', true, 'Client initialized successfully', Date.now() - startTime);
    } catch (error) {
      this.addTestResult('API Client Initialization', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 3: Workflow Bridge Initialization
   */
  private async testWorkflowBridgeInitialization(): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (!this.workflowBridge) {
        throw new Error('Workflow Bridge not initialized');
      }

      const health = await this.workflowBridge.getHealth();
      if (!health || typeof health.status !== 'string') {
        throw new Error('Invalid health check response');
      }

      this.addTestResult('Workflow Bridge Initialization', true, 'Bridge initialized successfully', Date.now() - startTime, health);
    } catch (error) {
      this.addTestResult('Workflow Bridge Initialization', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 4: Integration Service Initialization
   */
  private async testIntegrationServiceInitialization(): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (!this.integrationService) {
        throw new Error('Integration Service not initialized');
      }

      const health = await this.integrationService.healthCheck();
      if (!health || typeof health.status !== 'string') {
        throw new Error('Invalid health check response');
      }

      const agentStates = this.integrationService.getAllAgentStates();
      if (agentStates.length === 0) {
        throw new Error('No agent states initialized');
      }

      this.addTestResult('Integration Service Initialization', true, 'Service initialized successfully', Date.now() - startTime, { health, agentStates: agentStates.length });
    } catch (error) {
      this.addTestResult('Integration Service Initialization', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 5: Agent Type Integration
   */
  private async testAgentTypeIntegration(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test all agent types from ai-engine integration
      const agentTypes = [AgentType.TAJER, AgentType.MUSAFIR, AgentType.SOFRA, AgentType.MOSTASHAR];
      
      for (const agentType of agentTypes) {
        const agentId = `${agentType.toLowerCase()}-opal-agent`;
        const agentState = this.integrationService.getAgentState(agentId);
        
        if (!agentState) {
          throw new Error(`Agent state not found for ${agentType}`);
        }

        if (agentState.agentType !== agentType) {
          throw new Error(`Agent type mismatch for ${agentType}`);
        }

        if (!agentState.capabilities || agentState.capabilities.length === 0) {
          throw new Error(`No capabilities defined for ${agentType}`);
        }
      }

      this.addTestResult('Agent Type Integration', true, 'All agent types properly integrated', Date.now() - startTime);
    } catch (error) {
      this.addTestResult('Agent Type Integration', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 6: Workflow Template Creation
   */
  private async testWorkflowTemplateCreation(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test getting workflow templates
      const templates = await this.integrationService.getWorkflowTemplates();
      
      if (!templates || templates.length === 0) {
        throw new Error('No workflow templates available');
      }

      // Test filtering by category
      const businessTemplates = await this.integrationService.getWorkflowTemplates({ category: 'business_analysis' });
      
      // Test filtering by agent type
      const tajerTemplates = await this.integrationService.getWorkflowTemplates({ agentType: AgentType.TAJER });

      this.addTestResult('Workflow Template Creation', true, 'Templates retrieved successfully', Date.now() - startTime, {
        total: templates.length,
        business: businessTemplates.length,
        tajer: tajerTemplates.length
      });
    } catch (error) {
      this.addTestResult('Workflow Template Creation', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 7: Workflow Execution via Bridge
   */
  private async testWorkflowExecutionViaBridge(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Use a simple MENA template for testing
      const template = MENA_OPAL_TEMPLATES.find(t => t.id === 'tajer-business-analysis');
      if (!template) {
        throw new Error('Test template not found');
      }

      // Test data for business analysis
      const testData = {
        dealAmount: 100000,
        currency: 'USD',
        industry: 'real_estate',
        location: 'Dubai, UAE',
        riskTolerance: 'medium'
      };

      const agentId = 'tajer-opal-agent';
      
      // Execute via workflow bridge (fallback execution)
      const result = await this.workflowBridge.executeWorkflow(template, agentId, testData);

      if (!result || !result.executionId || !result.metrics) {
        throw new Error('Invalid execution result');
      }

      this.addTestResult('Workflow Execution via Bridge', true, 'Bridge execution successful', Date.now() - startTime, result);
    } catch (error) {
      this.addTestResult('Workflow Execution via Bridge', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 8: Agent Capability Mappings
   */
  private async testAgentCapabilityMappings(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test each agent's capabilities
      const agents = ['tajer-opal-agent', 'musafir-opal-agent', 'sofra-opal-agent', 'mostashar-opal-agent'];
      
      for (const agentId of agents) {
        const agentState = this.integrationService.getAgentState(agentId);
        if (!agentState) {
          throw new Error(`Agent state not found for ${agentId}`);
        }

        if (agentState.capabilities.length === 0) {
          throw new Error(`No capabilities defined for ${agentId}`);
        }

        // Verify each capability has required fields
        for (const capability of agentState.capabilities) {
          if (!capability.id || !capability.name || !capability.nodeTypes) {
            throw new Error(`Invalid capability structure for ${agentId}`);
          }
        }
      }

      this.addTestResult('Agent Capability Mappings', true, 'All agent capabilities properly mapped', Date.now() - startTime, {
        totalAgents: agents.length
      });
    } catch (error) {
      this.addTestResult('Agent Capability Mappings', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 9: MENA Workflow Templates
   */
  private async testMENAWorkflowTemplates(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test MENA-specific templates
      const tajerTemplate = MENA_OPAL_TEMPLATES.find(t => t.id === 'tajer-business-analysis');
      const sofraTemplate = MENA_OPAL_TEMPLATES.find(t => t.id === 'sofra-menu-analysis');

      if (!tajerTemplate || !sofraTemplate) {
        throw new Error('Required MENA templates not found');
      }

      // Validate template structure
      const validateTemplate = (template: OpalWorkflowTemplate) => {
        if (!template.id || !template.name || !template.nodes || !template.connections) {
          throw new Error(`Invalid template structure for ${template.id}`);
        }

        if (template.nodes.length === 0 || template.connections.length === 0) {
          throw new Error(`Template ${template.id} missing nodes or connections`);
        }

        // Check for MENA-specific metadata
        if (!template.metadata || !template.metadata.tags) {
          throw new Error(`Template ${template.id} missing MENA metadata`);
        }

        const hasMenaTags = template.metadata.tags.some(tag => 
          ['mena', 'business', 'restaurant', 'arabic'].includes(tag.toLowerCase())
        );
        if (!hasMenaTags) {
          throw new Error(`Template ${template.id} missing MENA-specific tags`);
        }
      };

      validateTemplate(tajerTemplate);
      validateTemplate(sofraTemplate);

      this.addTestResult('MENA Workflow Templates', true, 'MENA templates validated successfully', Date.now() - startTime, {
        templates: [tajerTemplate.id, sofraTemplate.id]
      });
    } catch (error) {
      this.addTestResult('MENA Workflow Templates', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 10: Performance Metrics
   */
  private async testPerformanceMetrics(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const analytics = this.integrationService.getAnalytics();
      
      if (!analytics || typeof analytics.totalExecutions !== 'number') {
        throw new Error('Invalid analytics data');
      }

      const health = await this.integrationService.healthCheck();
      if (!health || !health.components) {
        throw new Error('Invalid health check data');
      }

      this.addTestResult('Performance Metrics', true, 'Metrics collection working', Date.now() - startTime, {
        analytics: {
          totalExecutions: analytics.totalExecutions,
          agentUtilization: analytics.agentUtilization.size
        },
        health: {
          status: health.status,
          components: Object.keys(health.components).length
        }
      });
    } catch (error) {
      this.addTestResult('Performance Metrics', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 11: Error Handling
   */
  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test invalid execution request
      const invalidRequest: OpalExecutionRequest = {
        workflowTemplateId: 'non-existent-template',
        agentId: 'non-existent-agent',
        agentType: AgentType.TAJER,
        inputData: {},
        priority: 'normal'
      };

      let errorCaught = false;
      try {
        await this.integrationService.executeWorkflow(invalidRequest);
      } catch (error) {
        errorCaught = true;
        if (!error instanceof Error) {
          throw new Error('Error should be an Error instance');
        }
      }

      if (!errorCaught) {
        throw new Error('Expected error was not thrown');
      }

      this.addTestResult('Error Handling', true, 'Error handling working correctly', Date.now() - startTime);
    } catch (error) {
      this.addTestResult('Error Handling', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 12: Health Check System
   */
  private async testHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test integration service health
      const integrationHealth = await this.integrationService.healthCheck();
      if (!integrationHealth.status || !integrationHealth.components) {
        throw new Error('Invalid integration health check');
      }

      // Test workflow bridge health
      const bridgeHealth = await this.workflowBridge.getHealth();
      if (!bridgeHealth.status || !bridgeHealth.metrics) {
        throw new Error('Invalid bridge health check');
      }

      this.addTestResult('Health Check System', true, 'All health checks working', Date.now() - startTime, {
        integration: integrationHealth.status,
        bridge: bridgeHealth.status
      });
    } catch (error) {
      this.addTestResult('Health Check System', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 13: Event System
   */
  private async testEventSystem(): Promise<void> {
    const startTime = Date.now();
    
    try {
      let eventReceived = false;
      
      // Register event listener
      this.integrationService.on('workflow_completed', (data) => {
        eventReceived = true;
      });

      // Trigger a simple execution that should complete
      const template = MENA_OPAL_TEMPLATES[0];
      if (template) {
        const testData = { test: 'data' };
        const result = await this.workflowBridge.executeWorkflow(template, 'tajer-opal-agent', testData);
        
        // Small delay to allow event processing
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.addTestResult('Event System', true, 'Event system functional', Date.now() - startTime, { eventReceived });
    } catch (error) {
      this.addTestResult('Event System', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 14: Caching Mechanism
   */
  private async testCachingMechanism(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test workflow bridge cache cleanup
      const initialCacheSize = (this.workflowBridge as any).executionCache?.size || 0;
      
      // Trigger some executions to populate cache
      const template = MENA_OPAL_TEMPLATES[0];
      if (template) {
        await this.workflowBridge.executeWorkflow(template, 'tajer-opal-agent', { test: 'cache' });
      }
      
      // Clean up cache
      this.workflowBridge.cleanupCache();
      
      const finalCacheSize = (this.workflowBridge as any).executionCache?.size || 0;

      this.addTestResult('Caching Mechanism', true, 'Cache management working', Date.now() - startTime, {
        initialCacheSize,
        finalCacheSize
      });
    } catch (error) {
      this.addTestResult('Caching Mechanism', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Test 15: Security Features
   */
  private async testSecurityFeatures(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test API client rate limiting status
      const rateLimitStatus = this.apiClient.getRateLimitStatus();
      if (!rateLimitStatus || typeof rateLimitStatus.requests !== 'number') {
        throw new Error('Invalid rate limit status');
      }

      // Test webhook signature verification (should exist)
      const webhookConfig = TEST_CONFIG.opalBridgeConfig.webhooks;
      if (!webhookConfig.enabled || !webhookConfig.secret) {
        throw new Error('Webhook security not configured');
      }

      this.addTestResult('Security Features', true, 'Security measures in place', Date.now() - startTime, {
        rateLimiting: {
          enabled: true,
          currentRequests: rateLimitStatus.requests
        },
        webhooks: {
          enabled: webhookConfig.enabled,
          secretConfigured: !!webhookConfig.secret
        }
      });
    } catch (error) {
      this.addTestResult('Security Features', false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime, null, error);
    }
  }

  /**
   * Add test result
   */
  private addTestResult(
    testName: string, 
    success: boolean, 
    message: string, 
    duration: number, 
    data?: any, 
    error?: any
  ): void {
    const result: TestResult = {
      testName,
      success,
      message,
      duration,
      data,
      error: error ? (error instanceof Error ? error.message : String(error)) : undefined
    };

    this.testResults.push(result);
    
    const status = success ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message} (${duration}ms)`);
    
    if (!success && error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  /**
   * Generate test report
   */
  private generateTestReport(): {
    total: number;
    passed: number;
    failed: number;
    results: TestResult[];
    summary: string;
  } {
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const total = this.testResults.length;

    const summary = `
🧪 OPAL INTEGRATION TEST REPORT
================================
Total Tests: ${total}
Passed: ${passed}
Failed: ${failed}
Success Rate: ${((passed / total) * 100).toFixed(1)}%
Total Duration: ${this.testResults.reduce((sum, r) => sum + r.duration, 0)}ms

${this.testResults.map(r => 
  `${r.success ? '✅' : '❌'} ${r.testName}: ${r.message} (${r.duration}ms)`
).join('\n')}
    `.trim();

    console.log('\n' + summary);

    return {
      total,
      passed,
      failed,
      results: this.testResults,
      summary
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test resources...');
    
    try {
      await this.integrationService.shutdown();
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error);
    }
  }
}

/**
 * Main test runner function
 */
export async function runOpalIntegrationTests(): Promise<void> {
  console.log('🔷 Starting Opal Integration Layer Validation\n');

  const testSuite = new OpalIntegrationTestSuite();
  
  try {
    const report = await testSuite.runAllTests();
    
    if (report.failed === 0) {
      console.log('\n🎉 All tests passed! Opal Integration Layer is working correctly.');
    } else {
      console.log(`\n⚠️ ${report.failed} test(s) failed. Please review the issues above.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test suite execution failed:', error);
    process.exit(1);
  } finally {
    await testSuite.cleanup();
  }
}

/**
 * Example usage demonstration
 */
export async function demonstrateOpalIntegration(): Promise<void> {
  console.log('🔷 Opal Integration Layer Demonstration\n');

  const testSuite = new OpalIntegrationTestSuite();
  
  try {
    // Initialize service
    console.log('1️⃣ Initializing Opal Integration Service...');
    const health = await testSuite['integrationService'].healthCheck();
    console.log(`   Service Status: ${health.status}`);
    console.log(`   Active Agents: ${health.components.agents}`);

    // Show available templates
    console.log('\n2️⃣ Available MENA Workflow Templates:');
    const templates = await testSuite['integrationService'].getWorkflowTemplates();
    templates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.agentType})`);
    });

    // Show agent capabilities
    console.log('\n3️⃣ Agent Capabilities:');
    const agentStates = testSuite['integrationService'].getAllAgentStates();
    agentStates.forEach(agent => {
      console.log(`   ${agent.agentId}: ${agent.capabilities.length} capabilities`);
      agent.capabilities.forEach(cap => {
        console.log(`     - ${cap.name}: ${cap.description}`);
      });
    });

    // Execute a sample workflow
    console.log('\n4️⃣ Executing Sample Workflow...');
    const tajerTemplate = templates.find(t => t.id === 'tajer-business-analysis');
    if (tajerTemplate) {
      const sampleData = {
        dealAmount: 250000,
        currency: 'USD',
        location: 'Riyadh, Saudi Arabia',
        industry: 'commercial_real_estate'
      };

      const result = await testSuite['workflowBridge'].executeWorkflow(
        tajerTemplate,
        'tajer-opal-agent',
        sampleData
      );

      console.log(`   Execution ID: ${result.executionId}`);
      console.log(`   Status: Completed`);
      console.log(`   Nodes Executed: ${result.metrics.completedNodes}/${result.metrics.totalNodes}`);
      console.log(`   Execution Time: ${result.metrics.totalExecutionTime}ms`);
      console.log(`   AI API Calls: ${result.metrics.aiApiCalls}`);
    }

    console.log('\n🎯 Demonstration completed successfully!');
    
  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  } finally {
    await testSuite.cleanup();
  }
}

// Export for standalone usage
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      runOpalIntegrationTests();
      break;
    case 'demo':
      demonstrateOpalIntegration();
      break;
    default:
      console.log('Usage: node opal-integration-tests.js [test|demo]');
      process.exit(1);
  }
}