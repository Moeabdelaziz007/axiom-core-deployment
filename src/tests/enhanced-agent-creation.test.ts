/**
 * 🔷 ENHANCED AGENT CREATION TESTS
 * 
 * Comprehensive test suite for Opal-enabled agent creation
 * Tests Tesla frequency integration, Solana wallet generation, Opal workflows, and MENA cultural adaptation
 * 
 * @author Axiom Core Team
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createEnhancedAxiomForge } from '@/services/enhanced-axiom-forge';
import { OpalIntegrationService } from '@/services/opal-integration';
import { 
  EnhancedAgentConfig,
  EnhancedAgentCreationRequest,
  AgentType,
  isEnhancedAgentConfig,
  isValidAgentType
} from '@/types/enhanced-agents';
import { COMPREHENSIVE_MENA_TEMPLATES } from '@/templates/opal-agent-templates';

// Mock Opal integration service
const mockOpalIntegration = {
  executeWorkflow: jest.fn(),
  createWorkflowTemplate: jest.fn(),
  getWorkflowTemplates: jest.fn(),
  healthCheck: jest.fn().mockResolvedValue(true)
} as any;

// Test data
const validCreationRequest: EnhancedAgentCreationRequest = {
  name: 'TestAgent',
  role: 'Market Analysis',
  vibe: 'Analytical/Stoic',
  agent_type: AgentType.TAJER,
  frequency_band: '3Hz',
  enable_opal_workflows: true,
  enable_wallet: true,
  region: 'UAE',
  language: 'en',
  workflow_categories: ['islamic_finance', 'market_research'],
  security_level: 'standard',
  privacy_mode: false
};

describe('Enhanced Agent Creation System', () => {
  let enhancedForge: any;

  beforeEach(() => {
    enhancedForge = createEnhancedAxiomForge(mockOpalIntegration);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Enhanced Agent Forge', () => {
    it('should create enhanced forge with Opal integration', () => {
      expect(enhancedForge).toBeDefined();
      expect(enhancedForge.forgeOpalAgent).toBeDefined();
      expect(enhancedForge.validateAgentConfig).toBeDefined();
      expect(enhancedForge.upgradeAgentWithOpal).toBeDefined();
    });

    it('should forge Opal-enabled agent successfully', async () => {
      const result = await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Market Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER,
        region: 'UAE',
        language: 'en'
      });

      expect(result).toBeDefined();
      expect(isEnhancedAgentConfig(result)).toBe(true);
      expect(result.agent_name).toBe('TestAgent');
      expect(result.agent_type).toBe(AgentType.TAJER);
      expect(result.wallet).toBeDefined();
      expect(result.wallet.publicKey).toBeDefined();
      expect(result.wallet.secretKey).toBeDefined();
      expect(result.opal_config).toBeDefined();
      expect(result.cultural_context).toBeDefined();
      expect(result.personality_profile).toBeDefined();
    });

    it('should generate valid Solana wallet', async () => {
      const result = await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Market Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER
      });

      expect(result.wallet.publicKey).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
      expect(result.wallet.secretKey).toMatch(/^[1-9A-HJ-NP-Za-km-z]{88}$/);
    });

    it('should configure Opal capabilities based on agent type', async () => {
      const result = await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Market Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER
      });

      expect(result.opal_config.opalCapabilities).toBeDefined();
      expect(result.opal_config.opalCapabilities.length).toBeGreaterThan(0);
      expect(result.opal_config.workflowTemplates).toBeDefined();
      expect(result.opal_config.workflowTemplates.length).toBeGreaterThan(0);
    });

    it('should apply cultural context for MENA regions', async () => {
      const result = await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Market Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER,
        region: 'UAE',
        language: 'ar'
      });

      expect(result.cultural_context.region).toBe('UAE');
      expect(result.cultural_context.language).toBe('ar');
      expect(result.cultural_context.business_practices).toContain('Negotiation tactics');
      expect(result.cultural_context.compliance_requirements).toContain('Commercial licensing');
    });

    it('should initialize Tesla frequency personality', async () => {
      const result = await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Market Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER
      });

      expect(result.personality_profile.frequency_band).toBeDefined();
      expect(result.personality_profile.traits).toBeDefined();
      expect(result.personality_profile.communication_style).toBeDefined();
      expect(result.personality_profile.decision_making).toBeDefined();
      expect(result.personality_profile.learning_style).toBeDefined();
    });
  });

  describe('Agent Type Validation', () => {
    it('should validate agent types correctly', () => {
      expect(isValidAgentType('TAJER')).toBe(true);
      expect(isValidAgentType('MUSAFIR')).toBe(true);
      expect(isValidAgentType('SOFRA')).toBe(true);
      expect(isValidAgentType('MOSTASHAR')).toBe(true);
      expect(isValidAgentType('INVALID')).toBe(false);
    });

    it('should handle case sensitivity in agent type validation', () => {
      expect(isValidAgentType('tajer')).toBe(false);
      expect(isValidAgentType('TAJER')).toBe(true);
    });
  });

  describe('Enhanced Agent Configuration', () => {
    it('should validate enhanced agent config structure', () => {
      const validConfig = {
        agent_name: 'TestAgent',
        agent_type: AgentType.TAJER,
        core_frequency: '432Hz',
        system_prompt: 'Test prompt',
        welcome_message: 'Welcome',
        voice_config: {
          voice_id: 'default',
          speed: 1.0,
          style: 'professional',
          language_support: ['en']
        },
        wallet: {
          publicKey: 'test_pubkey',
          secretKey: 'test_secret'
        },
        opal_config: {
          agentType: AgentType.TAJER,
          opalCapabilities: [],
          workflowTemplates: [],
          executionTimeout: 300000,
          retryPolicy: {} as any,
          sandboxConfig: {} as any,
          monitoringConfig: {} as any
        },
        evolution: {
          stage: 'genesis',
          level: 1,
          experience: 0,
          traits: [],
          skills: []
        },
        cultural_context: {
          language: 'en',
          region: 'UAE',
          business_practices: [],
          compliance_requirements: [],
          timezone: 'GMT+4',
          currency_preference: ['AED']
        },
        performance_metrics: {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          averageExecutionTime: 0,
          totalCost: 0,
          efficiency: 0,
          reliability: 0,
          availability: 100
        },
        personality_profile: {
          frequency_band: '3Hz',
          traits: [],
          communication_style: 'analytical',
          decision_making: 'logical',
          learning_style: 'multimodal'
        },
        capabilities: {
          economic_operations: true,
          workflow_execution: true,
          ai_analysis: true,
          data_processing: true,
          communication: true,
          learning: true,
          collaboration: true
        },
        security_config: {
          encryption_level: 'standard',
          data_retention_days: 30,
          audit_logging: true,
          access_controls: [],
          privacy_mode: false
        },
        metadata: {
          version: '2.0.0',
          created_at: new Date(),
          updated_at: new Date(),
          deployment_environment: 'development',
          tags: [],
          category: 'general'
        }
      };

      expect(isEnhancedAgentConfig(validConfig)).toBe(true);
    });

    it('should reject invalid enhanced agent config', () => {
      const invalidConfig = {
        agent_name: 'TestAgent',
        // Missing required fields
        agent_type: 'INVALID',
        core_frequency: '432Hz'
      };

      expect(isEnhancedAgentConfig(invalidConfig)).toBe(false);
    });
  });

  describe('Tesla Frequency Integration', () => {
    it('should support all Tesla frequency bands', () => {
      const frequencyBands = ['3Hz', '6Hz', '9Hz', 'custom'];
      
      frequencyBands.forEach(band => {
        expect(['3Hz', '6Hz', '9Hz', 'custom']).toContain(band);
      });
    });

    it('should generate personality traits based on frequency', async () => {
      const testCases = [
        { frequency: '3Hz', expectedTraits: ['Stable', 'Reliable', 'Grounded'] },
        { frequency: '6Hz', expectedTraits: ['Creative', 'Balanced', 'Intuitive'] },
        { frequency: '9Hz', expectedTraits: ['Wise', 'Insightful', 'Spiritual'] }
      ];

      for (const testCase of testCases) {
        const result = await enhancedForge.forgeOpalAgent({
          name: 'TestAgent',
          role: 'Analyst',
          vibe: 'Analytical',
          agentType: AgentType.TAJER
        });

        // Override frequency for testing
        result.personality_profile.frequency_band = testCase.frequency as any;
        
        expect(result.personality_profile.frequency_band).toBe(testCase.frequency);
        expect(result.personality_profile.traits.length).toBeGreaterThan(0);
      }
    });

    it('should handle custom frequencies', async () => {
      const result = await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER
      });

      // Simulate custom frequency
      result.core_frequency = '777Hz';
      result.personality_profile.frequency_band = 'custom';

      expect(result.core_frequency).toBe('777Hz');
      expect(result.personality_profile.frequency_band).toBe('custom');
    });
  });

  describe('Solana Wallet Integration', () => {
    it('should generate unique wallet for each agent', async () => {
      const agent1 = await enhancedForge.forgeOpalAgent({
        name: 'Agent1',
        role: 'Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER
      });

      const agent2 = await enhancedForge.forgeOpalAgent({
        name: 'Agent2',
        role: 'Consultant',
        vibe: 'Strategic',
        agentType: AgentType.MOSTASHAR
      });

      expect(agent1.wallet.publicKey).not.toBe(agent2.wallet.publicKey);
      expect(agent1.wallet.secretKey).not.toBe(agent2.wallet.secretKey);
    });

    it('should generate valid Solana keypair format', async () => {
      const result = await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER
      });

      // Public key should be 32-44 characters, base58
      expect(result.wallet.publicKey.length).toBeGreaterThanOrEqual(32);
      expect(result.wallet.publicKey.length).toBeLessThanOrEqual(44);
      
      // Secret key should be 88 characters, base58
      expect(result.wallet.secretKey.length).toBe(88);
    });
  });

  describe('MENA Cultural Adaptation', () => {
    it('should configure region-specific business practices', async () => {
      const testCases = [
        { 
          agentType: AgentType.TAJER, 
          region: 'UAE', 
          expectedPractices: ['Negotiation tactics', 'Relationship building'] 
        },
        { 
          agentType: AgentType.MUSAFIR, 
          region: 'SA', 
          expectedPractices: ['Hospitality protocols', 'Cultural site guidance'] 
        },
        { 
          agentType: AgentType.SOFRA, 
          region: 'EG', 
          expectedPractices: ['Food safety standards', 'Halal compliance'] 
        },
        { 
          agentType: AgentType.MOSTASHAR, 
          region: 'JO', 
          expectedPractices: ['Legal compliance', 'Contract review'] 
        }
      ];

      for (const testCase of testCases) {
        const result = await enhancedForge.forgeOpalAgent({
          name: 'TestAgent',
          role: 'Specialist',
          vibe: 'Professional',
          agentType: testCase.agentType,
          region: testCase.region
        });

        expect(result.cultural_context.region).toBe(testCase.region);
        testCase.expectedPractices.forEach(practice => {
          expect(result.cultural_context.business_practices).toContain(practice);
        });
      }
    });

    it('should support multiple languages', async () => {
      const languages = ['en', 'ar', 'fr', 'ur'];
      
      for (const language of languages) {
        const result = await enhancedForge.forgeOpalAgent({
          name: 'TestAgent',
          role: 'Specialist',
          vibe: 'Professional',
          agentType: AgentType.TAJER,
          language
        });

        expect(result.cultural_context.language).toBe(language);
        expect(result.voice_config.language_support).toContain(language);
      }
    });

    it('should configure appropriate currencies', async () => {
      const testCases = [
        { region: 'UAE', expectedCurrencies: ['AED', 'USD'] },
        { region: 'SA', expectedCurrencies: ['SAR', 'USD'] },
        { region: 'EG', expectedCurrencies: ['EGP', 'USD'] },
        { region: 'JO', expectedCurrencies: ['JOD', 'USD'] }
      ];

      for (const testCase of testCases) {
        const result = await enhancedForge.forgeOpalAgent({
          name: 'TestAgent',
          role: 'Specialist',
          vibe: 'Professional',
          agentType: AgentType.TAJER,
          region: testCase.region
        });

        testCase.expectedCurrencies.forEach(currency => {
          expect(result.cultural_context.currency_preference).toContain(currency);
        });
      }
    });
  });

  describe('Opal Workflow Templates', () => {
    it('should have templates for all MENA agent types', () => {
      const tajerTemplates = COMPREHENSIVE_MENA_TEMPLATES.filter(t => t.agentType === AgentType.TAJER);
      const musafirTemplates = COMPREHENSIVE_MENA_TEMPLATES.filter(t => t.agentType === AgentType.MUSAFIR);
      const sofraTemplates = COMPREHENSIVE_MENA_TEMPLATES.filter(t => t.agentType === AgentType.SOFRA);
      const mostasharTemplates = COMPREHENSIVE_MENA_TEMPLATES.filter(t => t.agentType === AgentType.MOSTASHAR);

      expect(tajerTemplates.length).toBeGreaterThan(0);
      expect(musafirTemplates.length).toBeGreaterThan(0);
      expect(sofraTemplates.length).toBeGreaterThan(0);
      expect(mostasharTemplates.length).toBeGreaterThan(0);
    });

    it('should include Islamic finance templates for TAJER', () => {
      const tajerTemplates = COMPREHENSIVE_MENA_TEMPLATES.filter(t => t.agentType === AgentType.TAJER);
      const islamicFinanceTemplates = tajerTemplates.filter(t => t.category === 'islamic_finance');

      expect(islamicFinanceTemplates.length).toBeGreaterThan(0);
      
      islamicFinanceTemplates.forEach(template => {
        expect(template.metadata.tags).toContain('islamic-finance');
        expect(template.metadata.tags).toContain('sharia-compliance');
      });
    });

    it('should include Hajj/Umrah templates for MUSAFIR', () => {
      const musafirTemplates = COMPREHENSIVE_MENA_TEMPLATES.filter(t => t.agentType === AgentType.MUSAFIR);
      const religiousTravelTemplates = musafirTemplates.filter(t => t.category === 'religious_travel');

      expect(religiousTravelTemplates.length).toBeGreaterThan(0);
      
      religiousTravelTemplates.forEach(template => {
        expect(template.metadata.tags).toContain('hajj');
        expect(template.metadata.tags).toContain('umrah');
        expect(template.metadata.tags).toContain('pilgrimage');
      });
    });

    it('should include Halal compliance templates for SOFRA', () => {
      const sofraTemplates = COMPREHENSIVE_MENA_TEMPLATES.filter(t => t.agentType === AgentType.SOFRA);
      const halalTemplates = sofraTemplates.filter(t => t.category === 'halal_compliance');

      expect(halalTemplates.length).toBeGreaterThan(0);
      
      halalTemplates.forEach(template => {
        expect(template.metadata.tags).toContain('halal');
        expect(template.metadata.tags).toContain('certification');
        expect(template.metadata.tags).toContain('food-safety');
      });
    });

    it('should include Islamic law templates for MOSTASHAR', () => {
      const mostasharTemplates = COMPREHENSIVE_MENA_TEMPLATES.filter(t => t.agentType === AgentType.MOSTASHAR);
      const islamicLawTemplates = mostasharTemplates.filter(t => t.category === 'islamic_law');

      expect(islamicLawTemplates.length).toBeGreaterThan(0);
      
      islamicLawTemplates.forEach(template => {
        expect(template.metadata.tags).toContain('islamic-law');
        expect(template.metadata.tags).toContain('sharia-compliance');
        expect(template.metadata.tags).toContain('legal-opinion');
      });
    });
  });

  describe('Agent Configuration Validation', () => {
    it('should validate complete agent configuration', async () => {
      const validConfig = await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER
      });

      const validation = await enhancedForge.validateAgentConfig(validConfig);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required fields', async () => {
      const invalidConfig = {
        agent_name: '',
        agent_type: AgentType.TAJER,
        core_frequency: '432Hz',
        system_prompt: '',
        welcome_message: '',
        voice_config: {
          voice_id: '',
          speed: 0,
          style: '',
          language_support: []
        },
        wallet: {
          publicKey: '',
          secretKey: ''
        },
        opal_config: {} as any,
        evolution: {} as any,
        cultural_context: {} as any,
        performance_metrics: {} as any,
        personality_profile: {} as any,
        capabilities: {} as any,
        security_config: {} as any,
        metadata: {} as any
      };

      const validation = await enhancedForge.validateAgentConfig(invalidConfig);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors).toContain('Agent name is required');
      expect(validation.errors).toContain('System prompt is required');
      expect(validation.errors).toContain('Solana wallet public key is required');
    });

    it('should provide warnings for optional but recommended fields', async () => {
      const configWithWarnings = await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER
      });

      // Remove Opal workflows to trigger warning
      configWithWarnings.opal_config.opalCapabilities = [];
      configWithWarnings.opal_config.workflowTemplates = [];

      const validation = await enhancedForge.validateAgentConfig(configWithWarnings);
      
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings).toContain('No Opal capabilities configured');
      expect(validation.warnings).toContain('No workflow templates available');
    });
  });

  describe('Agent Upgrade Capabilities', () => {
    it('should upgrade existing agent with Opal capabilities', async () => {
      const existingAgent = {
        agent_name: 'ExistingAgent',
        agent_type: 'BASIC' as any,
        core_frequency: '432Hz',
        system_prompt: 'Basic prompt',
        welcome_message: 'Welcome',
        voice_config: {
          voice_id: 'default',
          speed: 1.0,
          style: 'professional',
          language_support: ['en']
        }
      };

      const upgradedAgent = await enhancedForge.upgradeAgentWithOpal(existingAgent, AgentType.TAJER);

      expect(upgradedAgent.agent_type).toBe(AgentType.TAJER);
      expect(upgradedAgent.opal_config).toBeDefined();
      expect(upgradedAgent.cultural_context).toBeDefined();
      expect(upgradedAgent.evolution).toBeDefined();
    });

    it('should preserve existing agent properties during upgrade', async () => {
      const existingAgent = {
        agent_name: 'ExistingAgent',
        core_frequency: '528Hz',
        system_prompt: 'Existing prompt',
        welcome_message: 'Existing welcome',
        voice_config: {
          voice_id: 'custom',
          speed: 1.2,
          style: 'casual',
          language_support: ['ar', 'en']
        }
      };

      const upgradedAgent = await enhancedForge.upgradeAgentWithOpal(existingAgent, AgentType.TAJER);

      expect(upgradedAgent.agent_name).toBe(existingAgent.agent_name);
      expect(upgradedAgent.core_frequency).toBe(existingAgent.core_frequency);
      expect(upgradedAgent.system_prompt).toBe(existingAgent.system_prompt);
      expect(upgradedAgent.welcome_message).toBe(existingAgent.welcome_message);
      expect(upgradedAgent.voice_config).toEqual(existingAgent.voice_config);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid agent type gracefully', async () => {
      await expect(
        enhancedForge.forgeOpalAgent({
          name: 'TestAgent',
          role: 'Analyst',
          vibe: 'Analytical',
          agentType: 'INVALID' as any
        })
      ).rejects.toThrow('Failed to forge Enhanced Opal Agent');
    });

    it('should handle Opal integration failures', async () => {
      // Mock Opal integration failure
      mockOpalIntegration.getWorkflowTemplates.mockRejectedValue(new Error('Opal API unavailable'));

      await expect(
        enhancedForge.forgeOpalAgent({
          name: 'TestAgent',
          role: 'Analyst',
          vibe: 'Analytical',
          agentType: AgentType.TAJER
        })
      ).rejects.toThrow();
    });

    it('should provide meaningful error messages', async () => {
      try {
        await enhancedForge.forgeOpalAgent({
          name: 'TestAgent',
          role: 'Analyst',
          vibe: 'Analytical',
          agentType: 'INVALID' as any
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Failed to forge Enhanced Opal Agent');
      }
    });
  });

  describe('Performance Metrics', () => {
    it('should track agent creation performance', async () => {
      const startTime = Date.now();
      
      await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeGreaterThan(0);
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should initialize performance metrics correctly', async () => {
      const result = await enhancedForge.forgeOpalAgent({
        name: 'TestAgent',
        role: 'Analyst',
        vibe: 'Analytical',
        agentType: AgentType.TAJER
      });

      expect(result.performance_metrics).toBeDefined();
      expect(result.performance_metrics.totalExecutions).toBe(0);
      expect(result.performance_metrics.successfulExecutions).toBe(0);
      expect(result.performance_metrics.failedExecutions).toBe(0);
      expect(result.performance_metrics.averageExecutionTime).toBe(0);
      expect(result.performance_metrics.totalCost).toBe(0);
      expect(result.performance_metrics.efficiency).toBe(0);
      expect(result.performance_metrics.reliability).toBe(0);
      expect(result.performance_metrics.availability).toBe(100);
    });
  });
});

describe('API Integration Tests', () => {
  it('should handle agent creation API request', async () => {
    const response = await fetch('/api/agents/create-opal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validCreationRequest),
    });

    expect(response.ok).toBe(true);
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.agent).toBeDefined();
    expect(result.creation_metadata).toBeDefined();
    expect(result.validation_results).toBeDefined();
    expect(result.deployment_info).toBeDefined();
  });

  it('should validate API request parameters', async () => {
    const invalidRequest = {
      ...validCreationRequest,
      name: '', // Invalid: empty name
      agent_type: 'INVALID' // Invalid: unknown agent type
    };

    const response = await fetch('/api/agents/create-opal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidRequest),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation failed');
    expect(result.details).toBeDefined();
  });

  it('should return available agent types and configurations', async () => {
    const response = await fetch('/api/agents/create-opal', {
      method: 'GET',
    });

    expect(response.ok).toBe(true);
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.agent_types).toBeDefined();
    expect(result.data.workflow_templates).toBeDefined();
    expect(result.data.frequency_bands).toBeDefined();
    expect(result.data.supported_regions).toBeDefined();
    expect(result.data.features).toBeDefined();
  });
});