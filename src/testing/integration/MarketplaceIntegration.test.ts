/**
 * 🧪 INTEGRATION TESTS - MARKETPLACE AND DEPLOYMENT
 * 
 * Comprehensive integration tests for agent marketplace and deployment including:
 * - Agent discovery and search functionality
 * - Transaction processing and smart contracts
 * - Agent deployment and customization
 * - Economic system and incentives
 * - Reputation and reviews system
 * - Dispute resolution mechanisms
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { AgentMarketplaceEngine } from '../../infra/core/AgentMarketplaceEngine';
import { AgentSuperpowersFramework } from '../../infra/core/AgentSuperpowersFramework';
import { AgentCollaborationSystem } from '../../infra/core/AgentCollaborationSystem';
import { 
  MarketplaceAgent, 
  MarketplaceSearchFilters, 
  DeploymentConfig,
  MarketplaceTransaction,
  TransactionType,
  AgentCustomization
} from '../../types/marketplace';
import { TestContext } from '../framework/TestFramework';

describe('Marketplace Integration Tests', () => {
  let marketplaceEngine: AgentMarketplaceEngine;
  let agentFramework: AgentSuperpowersFramework;
  let collaborationSystem: AgentCollaborationSystem;
  let testContext: TestContext;

  beforeAll(async () => {
    // Initialize core systems
    agentFramework = new AgentSuperpowersFramework('integration-test-agent');
    await agentFramework.initializeAgent();
    
    collaborationSystem = new AgentCollaborationSystem(agentFramework);
    marketplaceEngine = new AgentMarketplaceEngine(agentFramework, collaborationSystem);
  });

  beforeEach(async () => {
    // Setup test context
    testContext = {
      environment: {
        id: 'integration-test-env',
        name: 'Integration Test Environment',
        type: 'isolated',
        status: 'ready',
        resources: { cpu: 4, memory: 8192, storage: 50, network: 'testnet' },
        configuration: { environment: 'development' },
        agents: [],
        createdAt: new Date()
      },
      agentFramework,
      collaborationSystem,
      marketplaceEngine,
      variables: new Map(),
      artifacts: [],
      startTime: new Date()
    };
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  afterAll(async () => {
    // Final cleanup
  });

  describe('Agent Discovery and Search', () => {
    it('should search agents by category', async () => {
      const filters: MarketplaceSearchFilters = {
        category: 'business',
        pagination: { page: 1, limit: 10 }
      };

      const results = await marketplaceEngine.searchAgents(filters);

      expect(results.agents).toBeDefined();
      expect(results.total).toBeGreaterThanOrEqual(0);
      expect(results.page).toBe(1);
      expect(results.limit).toBe(10);
      
      // All returned agents should be in business category
      if (results.agents.length > 0) {
        expect(results.agents.every(agent => agent.category === 'business')).toBe(true);
      }
    });

    it('should search agents by tags', async () => {
      const filters: MarketplaceSearchFilters = {
        tags: ['real-estate', 'property-valuation'],
        pagination: { page: 1, limit: 5 }
      };

      const results = await marketplaceEngine.searchAgents(filters);

      expect(results.agents).toBeDefined();
      if (results.agents.length > 0) {
        expect(results.agents.every(agent => 
          agent.tags.some(tag => 
            ['real-estate', 'property-valuation'].includes(tag)
          )
        )).toBe(true);
      }
    });

    it('should search agents by pricing range', async () => {
      const filters: MarketplaceSearchFilters = {
        pricing: {
          model: ['subscription'],
          minPrice: 0.5,
          maxPrice: 2.0,
          currency: 'USDC'
        },
        pagination: { page: 1, limit: 10 }
      };

      const results = await marketplaceEngine.searchAgents(filters);

      expect(results.agents).toBeDefined();
      if (results.agents.length > 0) {
        expect(results.agents.every(agent => 
          agent.pricing.model === 'subscription' &&
          agent.pricing.monthlyPrice! >= 0.5 &&
          agent.pricing.monthlyPrice! <= 2.0
        )).toBe(true);
      }
    });

    it('should search agents by performance criteria', async () => {
      const filters: MarketplaceSearchFilters = {
        performance: {
          minSuccessRate: 90,
          maxResponseTime: 500,
          minUptime: 99.0
        },
        pagination: { page: 1, limit: 10 }
      };

      const results = await marketplaceEngine.searchAgents(filters);

      expect(results.agents).toBeDefined();
      if (results.agents.length > 0) {
        expect(results.agents.every(agent => 
          agent.performance.successRate >= 90 &&
          agent.performance.averageResponseTime <= 500 &&
          agent.performance.averageUptime >= 99.0
        )).toBe(true);
      }
    });

    it('should return search facets', async () => {
      const filters: MarketplaceSearchFilters = {
        pagination: { page: 1, limit: 10 }
      };

      const results = await marketplaceEngine.searchAgents(filters);

      expect(results.facets).toBeDefined();
      expect(results.facets.categories).toBeDefined();
      expect(results.facets.tags).toBeDefined();
      expect(results.facets.pricingModels).toBeDefined();
      expect(results.facets.ratings).toBeDefined();
    });

    it('should handle text search', async () => {
      const filters: MarketplaceSearchFilters = {
        query: 'real estate',
        pagination: { page: 1, limit: 10 }
      };

      const results = await marketplaceEngine.searchAgents(filters);

      expect(results.agents).toBeDefined();
      if (results.agents.length > 0) {
        expect(results.agents.every(agent => 
          agent.name.toLowerCase().includes('real estate') ||
          agent.description.toLowerCase().includes('real estate') ||
          agent.tags.some(tag => tag.toLowerCase().includes('real estate'))
        )).toBe(true);
      }
    });
  });

  describe('Agent Registration and Management', () => {
    it('should register new agent', async () => {
      const agentData: Omit<MarketplaceAgent, 'id' | 'createdAt' | 'updatedAt' | 'marketplaceStats'> = {
        name: 'Test Agent',
        description: 'Test agent for integration testing',
        avatar: '/agents/test-agent.png',
        category: 'business',
        subcategory: 'testing',
        tags: ['testing', 'integration'],
        capabilities: [],
        superpowers: ['neural_learning'],
        rating: 4.5,
        reviewCount: 0,
        reputation: {
          overall: 85,
          reliability: 90,
          performance: 85,
          communication: 80,
          innovation: 85,
          trustScore: 87,
          disputeResolution: { resolved: 0, total: 0, successRate: 100 }
        },
        performance: {
          totalDeployments: 0,
          activeDeployments: 0,
          averageUptime: 99.5,
          averageResponseTime: 200,
          successRate: 95.0,
          errorRate: 1.0,
          userSatisfaction: 88,
          taskCompletionRate: 92,
          averageCpuUsage: 45,
          averageMemoryUsage: 60,
          costEfficiency: 85,
          performanceTrend: 'stable',
          popularityTrend: 'rising'
        },
        pricing: {
          model: 'subscription',
          monthlyPrice: 1.99,
          yearlyPrice: 19.99,
          currency: 'USDC',
          trialPeriodDays: 7
        },
        availability: {
          status: 'available',
          capacity: {
            maxConcurrentUsers: 100,
            currentUsers: 0,
            utilizationRate: 0
          },
          sla: {
            uptime: 99.9,
            responseTime: 500,
            supportResponseTime: 24
          }
        },
        deploymentOptions: [],
        developer: {
          id: 'test-developer',
          name: 'Test Developer',
          verified: true,
          reputation: 90
        },
        version: '1.0.0',
        featured: false,
        verified: true,
        collaborationHistory: {
          totalCollaborations: 0,
          successfulCollaborations: 0,
          averageCollaborationRating: 0,
          recentPartners: [],
          collaborationTypes: []
        }
      };

      const agent = await marketplaceEngine.registerAgent(agentData);

      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Test Agent');
      expect(agent.createdAt).toBeDefined();
      expect(agent.marketplaceStats).toBeDefined();
      expect(agent.marketplaceStats.views).toBe(0);
      expect(agent.marketplaceStats.deployments).toBe(0);
    });

    it('should update agent information', async () => {
      // First register an agent
      const agentData: Omit<MarketplaceAgent, 'id' | 'createdAt' | 'updatedAt' | 'marketplaceStats'> = {
        name: 'Update Test Agent',
        description: 'Agent for update testing',
        avatar: '/agents/update-test.png',
        category: 'technical',
        subcategory: 'testing',
        tags: ['testing'],
        capabilities: [],
        superpowers: ['api_connector'],
        rating: 4.0,
        reviewCount: 0,
        reputation: {
          overall: 80,
          reliability: 85,
          performance: 80,
          communication: 75,
          innovation: 80,
          trustScore: 82,
          disputeResolution: { resolved: 0, total: 0, successRate: 100 }
        },
        performance: {
          totalDeployments: 0,
          activeDeployments: 0,
          averageUptime: 99.0,
          averageResponseTime: 250,
          successRate: 90.0,
          errorRate: 2.0,
          userSatisfaction: 85,
          taskCompletionRate: 88,
          averageCpuUsage: 50,
          averageMemoryUsage: 65,
          costEfficiency: 80,
          performanceTrend: 'stable',
          popularityTrend: 'stable'
        },
        pricing: {
          model: 'pay-per-use',
          costPerTask: 0.10,
          currency: 'USDC'
        },
        availability: {
          status: 'available',
          capacity: {
            maxConcurrentUsers: 50,
            currentUsers: 0,
            utilizationRate: 0
          },
          sla: {
            uptime: 99.5,
            responseTime: 1000,
            supportResponseTime: 48
          }
        },
        deploymentOptions: [],
        developer: {
          id: 'update-test-developer',
          name: 'Update Test Developer',
          verified: true,
          reputation: 85
        },
        version: '1.0.0',
        featured: false,
        verified: true,
        collaborationHistory: {
          totalCollaborations: 0,
          successfulCollaborations: 0,
          averageCollaborationRating: 0,
          recentPartners: [],
          collaborationTypes: []
        }
      };

      const agent = await marketplaceEngine.registerAgent(agentData);
      
      // Update the agent
      const updates = {
        description: 'Updated description',
        rating: 4.5,
        version: '1.1.0'
      };

      const updatedAgent = await marketplaceEngine.updateAgent(agent.id, updates);

      expect(updatedAgent).toBeDefined();
      expect(updatedAgent!.description).toBe('Updated description');
      expect(updatedAgent!.rating).toBe(4.5);
      expect(updatedAgent!.version).toBe('1.1.0');
      expect(updatedAgent!.updatedAt.getTime()).toBeGreaterThan(agent.updatedAt.getTime());
    });

    it('should validate agent data on registration', async () => {
      const invalidAgentData = {
        name: '', // Invalid empty name
        description: 'Too short',
        rating: 6.0, // Invalid rating > 5
        category: 'invalid-category' as any
      };

      await expect(marketplaceEngine.registerAgent(invalidAgentData as any))
        .rejects.toThrow();
    });
  });

  describe('Transaction Processing', () => {
    let testAgent: MarketplaceAgent;
    let buyerId: string;
    let sellerId: string;

    beforeEach(async () => {
      // Create test agent for transactions
      const agentData: Omit<MarketplaceAgent, 'id' | 'createdAt' | 'updatedAt' | 'marketplaceStats'> = {
        name: 'Transaction Test Agent',
        description: 'Agent for transaction testing',
        avatar: '/agents/transaction-test.png',
        category: 'business',
        subcategory: 'testing',
        tags: ['testing', 'transaction'],
        capabilities: [],
        superpowers: ['neural_learning'],
        rating: 4.5,
        reviewCount: 10,
        reputation: {
          overall: 90,
          reliability: 95,
          performance: 90,
          communication: 85,
          innovation: 90,
          trustScore: 92,
          disputeResolution: { resolved: 2, total: 2, successRate: 100 }
        },
        performance: {
          totalDeployments: 50,
          activeDeployments: 5,
          averageUptime: 99.8,
          averageResponseTime: 150,
          successRate: 97.0,
          errorRate: 0.5,
          userSatisfaction: 92,
          taskCompletionRate: 95,
          averageCpuUsage: 40,
          averageMemoryUsage: 55,
          costEfficiency: 90,
          performanceTrend: 'improving',
          popularityTrend: 'rising'
        },
        pricing: {
          model: 'subscription',
          monthlyPrice: 2.99,
          yearlyPrice: 29.99,
          currency: 'USDC',
          trialPeriodDays: 14
        },
        availability: {
          status: 'available',
          capacity: {
            maxConcurrentUsers: 200,
            currentUsers: 25,
            utilizationRate: 12.5
          },
          sla: {
            uptime: 99.9,
            responseTime: 300,
            supportResponseTime: 12
          }
        },
        deploymentOptions: [],
        developer: {
          id: 'transaction-developer',
          name: 'Transaction Developer',
          verified: true,
          reputation: 95
        },
        version: '2.0.0',
        featured: true,
        verified: true,
        collaborationHistory: {
          totalCollaborations: 25,
          successfulCollaborations: 24,
          averageCollaborationRating: 4.6,
          recentPartners: ['partner-1', 'partner-2'],
          collaborationTypes: ['consultation', 'task-delegation']
        }
      };

      testAgent = await marketplaceEngine.registerAgent(agentData);
      buyerId = 'test-buyer';
      sellerId = 'test-seller';
    });

    it('should process purchase transaction', async () => {
      const transaction = await marketplaceEngine.processTransaction(
        'purchase',
        buyerId,
        sellerId,
        testAgent.id,
        29.99,
        'USDC',
        { test: true }
      );

      expect(transaction.id).toBeDefined();
      expect(transaction.type).toBe('purchase');
      expect(transaction.status).toBe('completed');
      expect(transaction.buyer.id).toBe(buyerId);
      expect(transaction.seller.id).toBe(sellerId);
      expect(transaction.agentId).toBe(testAgent.id);
      expect(transaction.amount).toBe(29.99);
      expect(transaction.currency).toBe('USDC');
      expect(transaction.fee).toBeDefined();
      expect(transaction.completedAt).toBeDefined();
    });

    it('should process subscription transaction', async () => {
      const transaction = await marketplaceEngine.processTransaction(
        'subscription',
        buyerId,
        sellerId,
        testAgent.id,
        2.99,
        'USDC',
        { billingCycle: 'monthly' }
      );

      expect(transaction.type).toBe('subscription');
      expect(transaction.status).toBe('completed');
      expect(transaction.amount).toBe(2.99);
    });

    it('should handle deployment transaction', async () => {
      const transaction = await marketplaceEngine.processTransaction(
        'deployment',
        buyerId,
        sellerId,
        testAgent.id,
        5.00,
        'USDC',
        { deploymentType: 'cloud' }
      );

      expect(transaction.type).toBe('deployment');
      expect(transaction.status).toBe('completed');
      expect(transaction.deploymentType).toBe('cloud');
    });

    it('should set up escrow for applicable transactions', async () => {
      const transaction = await marketplaceEngine.processTransaction(
        'purchase',
        buyerId,
        sellerId,
        testAgent.id,
        50.00,
        'USDC'
      );

      expect(transaction.escrow).toBeDefined();
      expect(transaction.escrow!.releaseDate).toBeDefined();
      expect(transaction.escrow!.conditions).toBeDefined();
      expect(transaction.escrow!.released).toBe(false);
    });

    it('should calculate transaction fees correctly', async () => {
      const amount = 100.00;
      const transaction = await marketplaceEngine.processTransaction(
        'purchase',
        buyerId,
        sellerId,
        testAgent.id,
        amount,
        'USDC'
      );

      expect(transaction.fee.marketplace).toBe(2.50); // 2.5%
      expect(transaction.fee.platform).toBe(1.00); // 1%
      expect(transaction.fee.total).toBe(3.50); // Total fee
    });

    it('should retrieve transaction by ID', async () => {
      const transaction = await marketplaceEngine.processTransaction(
        'purchase',
        buyerId,
        sellerId,
        testAgent.id,
        25.00,
        'USDC'
      );

      const retrievedTransaction = marketplaceEngine.getTransaction(transaction.id);

      expect(retrievedTransaction).toBeDefined();
      expect(retrievedTransaction!.id).toBe(transaction.id);
      expect(retrievedTransaction!.amount).toBe(25.00);
    });

    it('should get user transactions', async () => {
      // Create multiple transactions
      await marketplaceEngine.processTransaction('purchase', buyerId, sellerId, testAgent.id, 10.00, 'USDC');
      await marketplaceEngine.processTransaction('subscription', buyerId, sellerId, testAgent.id, 5.00, 'USDC');

      const userTransactions = marketplaceEngine.getUserTransactions(buyerId);

      expect(userTransactions.length).toBeGreaterThanOrEqual(2);
      expect(userTransactions.every(tx => tx.buyer.id === buyerId || tx.seller.id === buyerId)).toBe(true);
    });
  });

  describe('Agent Deployment', () => {
    let testAgent: MarketplaceAgent;
    let ownerId: string;

    beforeEach(async () => {
      // Create test agent for deployment
      const agentData: Omit<MarketplaceAgent, 'id' | 'createdAt' | 'updatedAt' | 'marketplaceStats'> = {
        name: 'Deployment Test Agent',
        description: 'Agent for deployment testing',
        avatar: '/agents/deployment-test.png',
        category: 'technical',
        subcategory: 'deployment',
        tags: ['testing', 'deployment'],
        capabilities: [],
        superpowers: ['system_optimizer'],
        rating: 4.8,
        reviewCount: 25,
        reputation: {
          overall: 92,
          reliability: 95,
          performance: 92,
          communication: 90,
          innovation: 92,
          trustScore: 94,
          disputeResolution: { resolved: 1, total: 1, successRate: 100 }
        },
        performance: {
          totalDeployments: 100,
          activeDeployments: 15,
          averageUptime: 99.9,
          averageResponseTime: 100,
          successRate: 98.5,
          errorRate: 0.3,
          userSatisfaction: 94,
          taskCompletionRate: 97,
          averageCpuUsage: 35,
          averageMemoryUsage: 50,
          costEfficiency: 92,
          performanceTrend: 'improving',
          popularityTrend: 'rising'
        },
        pricing: {
          model: 'subscription',
          monthlyPrice: 4.99,
          yearlyPrice: 49.99,
          currency: 'USDC',
          trialPeriodDays: 30
        },
        availability: {
          status: 'available',
          capacity: {
            maxConcurrentUsers: 500,
            currentUsers: 75,
            utilizationRate: 15
          },
          sla: {
            uptime: 99.95,
            responseTime: 200,
            supportResponseTime: 8
          }
        },
        deploymentOptions: [
          {
            id: 'cloud-standard',
            name: 'Cloud Standard',
            description: 'Standard cloud deployment',
            type: 'cloud',
            resources: {
              cpu: '2 vCPU',
              memory: '4GB RAM',
              storage: '20GB SSD'
            },
            infrastructure: {
              platforms: ['AWS', 'Google Cloud'],
              dependencies: ['Node.js', 'PostgreSQL']
            },
            configuration: {
              environmentVariables: {},
              configFiles: [],
              secrets: []
            },
            deploymentCost: 4.99,
            currency: 'USDC'
          }
        ],
        developer: {
          id: 'deployment-developer',
          name: 'Deployment Developer',
          verified: true,
          reputation: 96
        },
        version: '3.0.0',
        featured: true,
        verified: true,
        collaborationHistory: {
          totalCollaborations: 50,
          successfulCollaborations: 48,
          averageCollaborationRating: 4.7,
          recentPartners: ['partner-1', 'partner-2', 'partner-3'],
          collaborationTypes: ['consultation', 'task-delegation', 'data-request']
        }
      };

      testAgent = await marketplaceEngine.registerAgent(agentData);
      ownerId = 'test-owner';
    });

    it('should deploy agent successfully', async () => {
      const deploymentConfig: Omit<DeploymentConfig, 'id' | 'agentId' | 'agentVersion' | 'status' | 'createdAt' | 'updatedAt' | 'deployedAt' | 'version'> = {
        target: {
          type: 'cloud',
          platform: 'AWS',
          environment: 'staging'
        },
        resources: {
          cpu: 2,
          memory: 4096,
          storage: 20,
          bandwidth: 100
        },
        configuration: {
          environmentVariables: {
            'NODE_ENV': 'staging',
            'LOG_LEVEL': 'info'
          },
          secrets: {
            'API_KEY': 'test-key'
          },
          configFiles: {
            'config.json': '{"setting": "value"}'
          }
        },
        scaling: {
          minInstances: 1,
          maxInstances: 5,
          autoScaling: true,
          metrics: ['cpu', 'memory', 'response_time']
        },
        monitoring: {
          enabled: true,
          metrics: ['cpu', 'memory', 'response_time', 'error_rate'],
          alerts: [
            {
              id: 'high-cpu',
              name: 'High CPU Alert',
              condition: 'cpu > 80',
              threshold: 80,
              severity: 'high',
              channels: ['email', 'slack'],
              enabled: true
            }
          ],
          logs: {
            level: 'info',
            retention: 30,
            destinations: ['cloudwatch'],
            structured: true
          }
        },
        security: {
          encryption: true,
          accessControl: {
            authentication: true,
            authorization: true,
            roles: ['admin', 'user'],
            permissions: {
              'admin': ['all'],
              'user': ['read', 'write']
            }
          },
          compliance: ['GDPR', 'SOC2']
        },
        owner: {
          id: ownerId,
          wallet: `${ownerId}-wallet`
        }
      };

      const deployment = await marketplaceEngine.deployAgent(testAgent.id, deploymentConfig, ownerId);

      expect(deployment.id).toBeDefined();
      expect(deployment.agentId).toBe(testAgent.id);
      expect(deployment.status).toBe('running');
      expect(deployment.target.platform).toBe('AWS');
      expect(deployment.resources.cpu).toBe(2);
      expect(deployment.deployedAt).toBeDefined();
    });

    it('should handle deployment configuration validation', async () => {
      const invalidDeploymentConfig = {
        target: {
          type: 'cloud' as const,
          platform: '', // Invalid empty platform
          environment: 'staging' as const
        },
        resources: {
          cpu: 0, // Invalid zero CPU
          memory: 4096,
          storage: 20
        },
        configuration: {
          environmentVariables: {},
          secrets: {},
          configFiles: {}
        },
        scaling: {
          minInstances: 1,
          maxInstances: 5,
          autoScaling: true,
          metrics: []
        },
        monitoring: {
          enabled: true,
          metrics: [],
          alerts: [],
          logs: {
            level: 'info' as const,
            retention: 30,
            destinations: [],
            structured: true
          }
        },
        security: {
          encryption: true,
          accessControl: {
            authentication: true,
            authorization: true,
            roles: [],
            permissions: {}
          },
          compliance: []
        },
        owner: {
          id: ownerId,
          wallet: `${ownerId}-wallet`
        }
      };

      await expect(marketplaceEngine.deployAgent(testAgent.id, invalidDeploymentConfig, ownerId))
        .rejects.toThrow();
    });

    it('should support deployment rollback', async () => {
      // First deploy agent
      const deploymentConfig: Omit<DeploymentConfig, 'id' | 'agentId' | 'agentVersion' | 'status' | 'createdAt' | 'updatedAt' | 'deployedAt' | 'version'> = {
        target: {
          type: 'cloud',
          platform: 'AWS',
          environment: 'staging'
        },
        resources: {
          cpu: 2,
          memory: 4096,
          storage: 20
        },
        configuration: {
          environmentVariables: {},
          secrets: {},
          configFiles: {}
        },
        scaling: {
          minInstances: 1,
          maxInstances: 5,
          autoScaling: true,
          metrics: []
        },
        monitoring: {
          enabled: true,
          metrics: [],
          alerts: [],
          logs: {
            level: 'info',
            retention: 30,
            destinations: [],
            structured: true
          }
        },
        security: {
          encryption: true,
          accessControl: {
            authentication: true,
            authorization: true,
            roles: [],
            permissions: {}
          },
          compliance: []
        },
        owner: {
          id: ownerId,
          wallet: `${ownerId}-wallet`
        }
      };

      const deployment = await marketplaceEngine.deployAgent(testAgent.id, deploymentConfig, ownerId);
      
      // Update deployment to add version history
      const updatedDeployment = await marketplaceEngine.updateDeployment(deployment.id, {
        version: {
          current: '1.1.0',
          history: [
            {
              version: '1.0.0',
              deployedAt: new Date(),
              deployedBy: ownerId,
              changes: ['Initial deployment'],
              rollbackAvailable: true
            }
          ],
          rollbackEnabled: true
        }
      });

      expect(updatedDeployment).toBeDefined();
      expect(updatedDeployment!.version.current).toBe('1.1.0');
      expect(updatedDeployment!.version.history).toHaveLength(1);

      // Test rollback
      const rollbackDeployment = await marketplaceEngine.rollbackDeployment(deployment.id, '1.0.0');
      
      expect(rollbackDeployment).toBeDefined();
      expect(rollbackDeployment!.version.current).toBe('1.0.0');
    });

    it('should get deployment by ID', async () => {
      const deploymentConfig: Omit<DeploymentConfig, 'id' | 'agentId' | 'agentVersion' | 'status' | 'createdAt' | 'updatedAt' | 'deployedAt' | 'version'> = {
        target: {
          type: 'cloud',
          platform: 'AWS',
          environment: 'staging'
        },
        resources: {
          cpu: 1,
          memory: 2048,
          storage: 10
        },
        configuration: {
          environmentVariables: {},
          secrets: {},
          configFiles: {}
        },
        scaling: {
          minInstances: 1,
          maxInstances: 3,
          autoScaling: false,
          metrics: []
        },
        monitoring: {
          enabled: false,
          metrics: [],
          alerts: [],
          logs: {
            level: 'error',
            retention: 7,
            destinations: [],
            structured: false
          }
        },
        security: {
          encryption: false,
          accessControl: {
            authentication: false,
            authorization: false,
            roles: [],
            permissions: {}
          },
          compliance: []
        },
        owner: {
          id: ownerId,
          wallet: `${ownerId}-wallet`
        }
      };

      const deployment = await marketplaceEngine.deployAgent(testAgent.id, deploymentConfig, ownerId);
      const retrievedDeployment = marketplaceEngine.getDeployment(deployment.id);

      expect(retrievedDeployment).toBeDefined();
      expect(retrievedDeployment!.id).toBe(deployment.id);
      expect(retrievedDeployment!.agentId).toBe(testAgent.id);
    });

    it('should get user deployments', async () => {
      // Create multiple deployments
      await marketplaceEngine.deployAgent(testAgent.id, {
        target: { type: 'cloud', platform: 'AWS', environment: 'staging' },
        resources: { cpu: 1, memory: 2048, storage: 10 },
        configuration: { environmentVariables: {}, secrets: {}, configFiles: {} },
        scaling: { minInstances: 1, maxInstances: 3, autoScaling: false, metrics: [] },
        monitoring: { enabled: false, metrics: [], alerts: [], logs: { level: 'error', retention: 7, destinations: [], structured: false } },
        security: { encryption: false, accessControl: { authentication: false, authorization: false, roles: [], permissions: {} }, compliance: [] },
        owner: { id: ownerId, wallet: `${ownerId}-wallet` }
      }, ownerId);

      await marketplaceEngine.deployAgent(testAgent.id, {
        target: { type: 'edge', platform: 'Cloudflare', environment: 'production' },
        resources: { cpu: 2, memory: 4096, storage: 20 },
        configuration: { environmentVariables: {}, secrets: {}, configFiles: {} },
        scaling: { minInstances: 1, maxInstances: 5, autoScaling: true, metrics: [] },
        monitoring: { enabled: true, metrics: [], alerts: [], logs: { level: 'info', retention: 30, destinations: [], structured: true } },
        security: { encryption: true, accessControl: { authentication: true, authorization: true, roles: [], permissions: {} }, compliance: ['GDPR'] },
        owner: { id: ownerId, wallet: `${ownerId}-wallet` }
      }, ownerId);

      const userDeployments = marketplaceEngine.getUserDeployments(ownerId);

      expect(userDeployments.length).toBeGreaterThanOrEqual(2);
      expect(userDeployments.every(deployment => deployment.owner.id === ownerId)).toBe(true);
    });
  });

  describe('Agent Customization', () => {
    let testAgent: MarketplaceAgent;
    let ownerId: string;

    beforeEach(async () => {
      const agentData: Omit<MarketplaceAgent, 'id' | 'createdAt' | 'updatedAt' | 'marketplaceStats'> = {
        name: 'Customization Test Agent',
        description: 'Agent for customization testing',
        avatar: '/agents/customization-test.png',
        category: 'creative',
        subcategory: 'customization',
        tags: ['testing', 'customization'],
        capabilities: [],
        superpowers: ['content_creator'],
        rating: 4.6,
        reviewCount: 15,
        reputation: {
          overall: 88,
          reliability: 90,
          performance: 87,
          communication: 85,
          innovation: 88,
          trustScore: 89,
          disputeResolution: { resolved: 1, total: 1, successRate: 100 }
        },
        performance: {
          totalDeployments: 75,
          activeDeployments: 10,
          averageUptime: 99.7,
          averageResponseTime: 180,
          successRate: 96.0,
          errorRate: 0.8,
          userSatisfaction: 90,
          taskCompletionRate: 94,
          averageCpuUsage: 42,
          averageMemoryUsage: 58,
          costEfficiency: 87,
          performanceTrend: 'stable',
          popularityTrend: 'stable'
        },
        pricing: {
          model: 'hybrid',
          monthlyPrice: 3.99,
          costPerTask: 0.05,
          currency: 'USDC'
        },
        availability: {
          status: 'available',
          capacity: {
            maxConcurrentUsers: 300,
            currentUsers: 45,
            utilizationRate: 15
          },
          sla: {
            uptime: 99.8,
            responseTime: 250,
            supportResponseTime: 16
          }
        },
        deploymentOptions: [],
        developer: {
          id: 'customization-developer',
          name: 'Customization Developer',
          verified: true,
          reputation: 91
        },
        version: '2.5.0',
        featured: false,
        verified: true,
        collaborationHistory: {
          totalCollaborations: 35,
          successfulCollaborations: 33,
          averageCollaborationRating: 4.5,
          recentPartners: ['partner-1', 'partner-2'],
          collaborationTypes: ['consultation', 'task-delegation']
        }
      };

      testAgent = await marketplaceEngine.registerAgent(agentData);
      ownerId = 'customization-owner';
    });

    it('should create agent customization', async () => {
      const customizationData: Omit<AgentCustomization, 'id' | 'agentId' | 'createdAt' | 'updatedAt' | 'version'> = {
        appearance: {
          theme: {
            id: 'custom-theme',
            name: 'Custom Theme',
            colors: {
              background: '#ffffff',
              foreground: '#000000',
              primary: '#007bff',
              secondary: '#6c757d',
              accent: '#28a745',
              error: '#dc3545',
              warning: '#ffc107',
              success: '#28a745'
            },
            fonts: {
              primary: 'Arial',
              secondary: 'Helvetica',
              monospace: 'Courier New'
            },
            spacing: {
              xs: '4px',
              sm: '8px',
              md: '16px',
              lg: '24px',
              xl: '32px'
            },
            borderRadius: '8px',
            shadows: ['0 2px 4px rgba(0,0,0,0.1)']
          },
          branding: {
            colors: {
              primary: '#007bff',
              secondary: '#6c757d',
              accent: '#28a745'
            },
            fonts: {
              primary: 'Arial',
              secondary: 'Helvetica'
            }
          }
        },
        personality: {
          name: 'Custom Agent Name',
          description: 'Custom agent description',
          traits: [
            { name: 'helpfulness', value: 90, description: 'Very helpful' },
            { name: 'creativity', value: 85, description: 'Creative problem solver' }
          ],
          communicationStyle: {
            formality: 'friendly',
            verbosity: 'balanced',
            empathy: 80,
            humor: 60,
            proactivity: 70
          },
          language: 'en',
          tone: 'supportive'
        },
        skills: {
          enabled: ['content_creator', 'design_synthesizer'],
          disabled: [],
          priorities: [
            { skillId: 'content_creator', priority: 9, enabled: true },
            { skillId: 'design_synthesizer', priority: 7, enabled: true }
          ],
          customizations: {
            content_creator: {
              creativity_level: 'high',
              style_preference: 'modern'
            }
          }
        },
        behavior: {
          responsePatterns: [
            {
              id: 'greeting',
              trigger: 'hello',
              pattern: 'greeting_response',
              response: 'Hello! How can I help you today?',
              priority: 1,
              enabled: true
            }
          ],
          decisionRules: [
            {
              id: 'priority_routing',
              condition: 'urgent_request',
              action: 'immediate_response',
              priority: 1,
              enabled: true
            }
          ],
          automation: [
            {
              id: 'daily_summary',
              trigger: 'daily_report',
              conditions: ['end_of_day'],
              actions: ['generate_summary', 'send_notification'],
              enabled: true,
              schedule: '0 18 * * *' // 6 PM daily
            }
          ]
        },
        integrations: {
          apis: [
            {
              id: 'openai_api',
              name: 'OpenAI API',
              type: 'rest',
              endpoint: 'https://api.openai.com/v1',
              authentication: {
                type: 'api-key',
                credentials: { api_key: 'test-key' }
              },
              configuration: { model: 'gpt-4' },
              enabled: true
            }
          ],
          webhooks: [
            {
              id: 'slack_webhook',
              name: 'Slack Integration',
              url: 'https://hooks.slack.com/test',
              events: ['task_completed', 'error_occurred'],
              authentication: {
                type: 'api-key',
                credentials: { token: 'test-token' }
              },
              retryPolicy: {
                maxAttempts: 3,
                backoff: 1000
              },
              enabled: true
            }
          ],
          databases: [
            {
              id: 'user_db',
              name: 'User Database',
              type: 'postgresql',
              connection: {
                host: 'localhost',
                port: 5432,
                database: 'test_db',
                username: 'test_user',
                password: 'test_password'
              },
              configuration: { pool_size: 10 },
              enabled: true
            }
          ],
          services: [
            {
              id: 'email_service',
              name: 'Email Service',
              type: 'smtp',
              configuration: {
                host: 'smtp.example.com',
                port: 587,
                use_tls: true
              },
              enabled: true
            }
          ]
        },
        performance: {
          optimization: {
            caching: true,
            compression: true,
            minification: true,
            lazyLoading: true,
            connectionPooling: true,
            queryOptimization: true
          },
          caching: {
            enabled: true,
            type: 'redis',
            configuration: { host: 'localhost', port: 6379 },
            ttl: 3600,
            maxSize: 100
          },
          monitoring: {
            enabled: true,
            metrics: ['response_time', 'error_rate', 'throughput'],
            intervals: {
              collection: 60,
              aggregation: 300
            },
            retention: 7
          }
        },
        owner: {
          id: ownerId,
          wallet: `${ownerId}-wallet`
        }
      };

      const customization = await marketplaceEngine.createCustomization(testAgent.id, customizationData, ownerId);

      expect(customization.id).toBeDefined();
      expect(customization.agentId).toBe(testAgent.id);
      expect(customization.personality.name).toBe('Custom Agent Name');
      expect(customization.appearance.theme.id).toBe('custom-theme');
      expect(customization.createdAt).toBeDefined();
    });

    it('should update agent customization', async () => {
      // First create customization
      const customizationData: Omit<AgentCustomization, 'id' | 'agentId' | 'createdAt' | 'updatedAt' | 'version'> = {
        appearance: {
          theme: {
            id: 'initial-theme',
            name: 'Initial Theme',
            colors: {
              background: '#ffffff',
              foreground: '#000000',
              primary: '#007bff',
              secondary: '#6c757d',
              accent: '#28a745',
              error: '#dc3545',
              warning: '#ffc107',
              success: '#28a745'
            },
            fonts: {
              primary: 'Arial',
              secondary: 'Helvetica',
              monospace: 'Courier New'
            },
            spacing: {
              xs: '4px',
              sm: '8px',
              md: '16px',
              lg: '24px',
              xl: '32px'
            },
            borderRadius: '8px',
            shadows: ['0 2px 4px rgba(0,0,0,0.1)']
          },
          branding: {
            colors: {
              primary: '#007bff',
              secondary: '#6c757d',
              accent: '#28a745'
            },
            fonts: {
              primary: 'Arial',
              secondary: 'Helvetica'
            }
          }
        },
        personality: {
          name: 'Initial Agent',
          description: 'Initial description',
          traits: [],
          communicationStyle: {
            formality: 'neutral',
            verbosity: 'balanced',
            empathy: 70,
            humor: 50,
            proactivity: 60
          },
          language: 'en',
          tone: 'professional'
        },
        skills: {
          enabled: [],
          disabled: [],
          priorities: [],
          customizations: {}
        },
        behavior: {
          responsePatterns: [],
          decisionRules: [],
          automation: []
        },
        integrations: {
          apis: [],
          webhooks: [],
          databases: [],
          services: []
        },
        performance: {
          optimization: {
            caching: false,
            compression: false,
            minification: false,
            lazyLoading: false,
            connectionPooling: false,
            queryOptimization: false
          },
          caching: {
            enabled: false,
            type: 'memory',
            configuration: {},
            ttl: 0,
            maxSize: 0
          },
          monitoring: {
            enabled: false,
            metrics: [],
            intervals: {
              collection: 0,
              aggregation: 0
            },
            retention: 0
          }
        },
        owner: {
          id: ownerId,
          wallet: `${ownerId}-wallet`
        }
      };

      const customization = await marketplaceEngine.createCustomization(testAgent.id, customizationData, ownerId);
      
      // Update customization
      const updates = {
        personality: {
          name: 'Updated Agent',
          description: 'Updated description',
          traits: [
            { name: 'helpfulness', value: 95, description: 'Extremely helpful' }
          ],
          communicationStyle: {
            formality: 'friendly',
            verbosity: 'detailed',
            empathy: 85,
            humor: 70,
            proactivity: 75
          },
          language: 'en',
          tone: 'supportive'
        },
        performance: {
          optimization: {
            caching: true,
            compression: true,
            minification: true,
            lazyLoading: true,
            connectionPooling: true,
            queryOptimization: true
          }
        }
      };

      const updatedCustomization = await marketplaceEngine.updateCustomization(customization.id, updates);

      expect(updatedCustomization).toBeDefined();
      expect(updatedCustomization!.personality.name).toBe('Updated Agent');
      expect(updatedCustomization!.performance.optimization.caching).toBe(true);
      expect(updatedCustomization!.updatedAt.getTime()).toBeGreaterThan(customization.updatedAt.getTime());
    });

    it('should get agent customizations', async () => {
      // Create multiple customizations
      await marketplaceEngine.createCustomization(testAgent.id, {
        appearance: { theme: { id: 'theme1', name: 'Theme 1', colors: { background: '#fff', foreground: '#000', primary: '#007bff', secondary: '#6c757d', accent: '#28a745', error: '#dc3545', warning: '#ffc107', success: '#28a745' }, fonts: { primary: 'Arial', secondary: 'Helvetica', monospace: 'Courier New' }, spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' }, borderRadius: '8px', shadows: [] } },
        branding: { colors: { primary: '#007bff', secondary: '#6c757d', accent: '#28a745' }, fonts: { primary: 'Arial', secondary: 'Helvetica' } }
        },
        personality: { name: 'Agent 1', description: 'First customization', traits: [], communicationStyle: { formality: 'neutral', verbosity: 'balanced', empathy: 70, humor: 50, proactivity: 60 }, language: 'en', tone: 'professional' },
        skills: { enabled: [], disabled: [], priorities: [], customizations: {} },
        behavior: { responsePatterns: [], decisionRules: [], automation: [] },
        integrations: { apis: [], webhooks: [], databases: [], services: [] },
        performance: { optimization: { caching: false, compression: false, minification: false, lazyLoading: false, connectionPooling: false, queryOptimization: false }, caching: { enabled: false, type: 'memory', configuration: {}, ttl: 0, maxSize: 0 }, monitoring: { enabled: false, metrics: [], intervals: { collection: 0, aggregation: 0 }, retention: 0 } },
        owner: { id: ownerId, wallet: `${ownerId}-wallet` }
      }, ownerId);

      await marketplaceEngine.createCustomization(testAgent.id, {
        appearance: { theme: { id: 'theme2', name: 'Theme 2', colors: { background: '#000', foreground: '#fff', primary: '#28a745', secondary: '#17a2b8', accent: '#ffc107', error: '#dc3545', warning: '#fd7e14', success: '#28a745' }, fonts: { primary: 'Helvetica', secondary: 'Arial', monospace: 'Monaco' }, spacing: { xs: '2px', sm: '4px', md: '8px', lg: '16px', xl: '24px' }, borderRadius: '4px', shadows: [] } },
        branding: { colors: { primary: '#28a745', secondary: '#17a2b8', accent: '#ffc107' }, fonts: { primary: 'Helvetica', secondary: 'Arial' } }
        },
        personality: { name: 'Agent 2', description: 'Second customization', traits: [], communicationStyle: { formality: 'casual', verbosity: 'concise', empathy: 80, humor: 60, proactivity: 70 }, language: 'en', tone: 'friendly' },
        skills: { enabled: [], disabled: [], priorities: [], customizations: {} },
        behavior: { responsePatterns: [], decisionRules: [], automation: [] },
        integrations: { apis: [], webhooks: [], databases: [], services: [] },
        performance: { optimization: { caching: true, compression: true, minification: true, lazyLoading: true, connectionPooling: true, queryOptimization: true }, caching: { enabled: true, type: 'redis', configuration: {}, ttl: 3600, maxSize: 100 }, monitoring: { enabled: true, metrics: [], intervals: { collection: 60, aggregation: 300 }, retention: 7 } },
        owner: { id: ownerId, wallet: `${ownerId}-wallet` }
      }, ownerId);

      const customizations = marketplaceEngine.getAgentCustomizations(testAgent.id);

      expect(customizations.length).toBeGreaterThanOrEqual(2);
      expect(customizations.every(custom => custom.agentId === testAgent.id)).toBe(true);
    });
  });

  describe('Marketplace Analytics', () => {
    it('should get marketplace analytics', async () => {
      const analytics = marketplaceEngine.getAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.overview).toBeDefined();
      expect(analytics.overview.totalAgents).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.activeAgents).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.totalTransactions).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.totalVolume).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.activeUsers).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.averageRating).toBeGreaterThanOrEqual(0);
    });

    it('should track agent performance metrics', async () => {
      // Create a test agent with known performance
      const agentData: Omit<MarketplaceAgent, 'id' | 'createdAt' | 'updatedAt' | 'marketplaceStats'> = {
        name: 'Analytics Test Agent',
        description: 'Agent for analytics testing',
        avatar: '/agents/analytics-test.png',
        category: 'business',
        subcategory: 'analytics',
        tags: ['testing', 'analytics'],
        capabilities: [],
        superpowers: ['quantum_analysis'],
        rating: 4.7,
        reviewCount: 50,
        reputation: {
          overall: 91,
          reliability: 93,
          performance: 90,
          communication: 89,
          innovation: 92,
          trustScore: 93,
          disputeResolution: { resolved: 2, total: 2, successRate: 100 }
        },
        performance: {
          totalDeployments: 200,
          activeDeployments: 25,
          averageUptime: 99.85,
          averageResponseTime: 120,
          successRate: 97.5,
          errorRate: 0.4,
          userSatisfaction: 93,
          taskCompletionRate: 96,
          averageCpuUsage: 38,
          averageMemoryUsage: 52,
          costEfficiency: 91,
          performanceTrend: 'improving',
          popularityTrend: 'rising'
        },
        pricing: {
          model: 'subscription',
          monthlyPrice: 5.99,
          yearlyPrice: 59.99,
          currency: 'USDC',
          trialPeriodDays: 14
        },
        availability: {
          status: 'available',
          capacity: {
            maxConcurrentUsers: 1000,
            currentUsers: 150,
            utilizationRate: 15
          },
          sla: {
            uptime: 99.9,
            responseTime: 150,
            supportResponseTime: 6
          }
        },
        deploymentOptions: [],
        developer: {
          id: 'analytics-developer',
          name: 'Analytics Developer',
          verified: true,
          reputation: 94
        },
        version: '4.0.0',
        featured: true,
        verified: true,
        collaborationHistory: {
          totalCollaborations: 100,
          successfulCollaborations: 97,
          averageCollaborationRating: 4.8,
          recentPartners: ['partner-1', 'partner-2', 'partner-3'],
          collaborationTypes: ['consultation', 'task-delegation', 'data-request']
        }
      };

      await marketplaceEngine.registerAgent(agentData);

      const analytics = marketplaceEngine.getAnalytics();

      expect(analytics.performance.topPerformingAgents).toBeDefined();
      expect(analytics.performance.topPerformingAgents.length).toBeGreaterThan(0);
      
      // Check if our test agent is in top performers
      const topPerformers = analytics.performance.topPerformingAgents;
      const testAgentInTopPerformers = topPerformers.some(agent => 
        agent.agentName === 'Analytics Test Agent'
      );
      
      if (testAgentInTopPerformers) {
        const agentPerformance = topPerformers.find(agent => 
          agent.agentName === 'Analytics Test Agent'
        );
        expect(agentPerformance!.rating).toBe(4.7);
        expect(agentPerformance!.deployments).toBe(200);
        expect(agentPerformance!.uptime).toBe(99.85);
        expect(agentPerformance!.responseTime).toBe(120);
      }
    });
  });
});

// Helper function to cleanup test data
async function cleanupTestData(): Promise<void> {
  // This would cleanup any test data created during tests
  // In a real implementation, this would clean up databases, file systems, etc.
  console.log('🧹 Cleaning up test data...');
}