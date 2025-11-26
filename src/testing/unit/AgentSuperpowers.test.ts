/**
 * 🧪 UNIT TESTS - AGENT SUPERPOWERS
 * 
 * Comprehensive unit tests for agent superpowers framework including:
 * - Superpower activation and validation
 * - Agent evolution and skill acquisition
 * - Performance monitoring and metrics
 * - Collaboration and knowledge sharing
 * - Energy cost calculation and cooldowns
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  AgentSuperpowersFramework,
  AgentEvolution,
  AgentPerformanceMonitor,
  AgentCollaborationSystem,
  AGENT_SUPERPOWERS,
  validateSuperpowerRequirements,
  calculateSuperpowerCost,
  getAvailableSuperpowers
} from '../../infra/core/AgentSuperpowersFramework';
import { TestResult, TestContext } from '../framework/TestFramework';

describe('Agent Superpowers Framework', () => {
  let agentFramework: AgentSuperpowersFramework;
  let testAgentId: string;

  beforeEach(() => {
    testAgentId = `test-agent-${Date.now()}`;
    agentFramework = new AgentSuperpowersFramework(testAgentId);
  });

  afterEach(() => {
    // Cleanup test data
  });

  describe('Superpower Activation', () => {
    it('should activate valid superpower successfully', async () => {
      // Test activating quantum_analysis superpower
      const result = agentFramework.activateSuperpower('quantum_analysis');
      
      expect(result).toBe(true);
      
      const status = agentFramework.getAgentStatus();
      expect(status.evolution.acquiredSkills).toContain('quantum_analysis');
    });

    it('should reject invalid superpower', async () => {
      const result = agentFramework.activateSuperpower('invalid_superpower');
      
      expect(result).toBe(false);
    });

    it('should enforce superpower requirements', async () => {
      // Try to activate high-level superpower with low-level agent
      const result = agentFramework.activateSuperpower('blockchain_master');
      
      expect(result).toBe(false);
    });

    it('should handle superpower cooldowns', async () => {
      // Activate superpower
      agentFramework.activateSuperpower('quantum_analysis');
      
      // Try to activate again immediately (should fail due to cooldown)
      const immediateResult = agentFramework.activateSuperpower('quantum_analysis');
      expect(immediateResult).toBe(false);
    });

    it('should calculate energy costs correctly', () => {
      const baseCost = calculateSuperpowerCost('quantum_analysis', 50);
      expect(baseCost).toBe(50); // 100% mastery = 50% discount = 25 cost, min 10% = 5
      
      const masteryCost = calculateSuperpowerCost('quantum_analysis', 100);
      expect(masteryCost).toBe(25); // 100% mastery = 50% discount
    });
  });

  describe('Agent Evolution', () => {
    let evolution: AgentEvolution;

    beforeEach(() => {
      evolution = new AgentEvolution(testAgentId);
    });

    it('should gain experience and level up', () => {
      const initialLevel = evolution.getStatus().totalLevel;
      
      evolution.gainExperience(1500);
      
      const newStatus = evolution.getStatus();
      expect(newStatus.totalLevel).toBe(initialLevel + 1);
      expect(newStatus.skillPoints).toBe(5); // 5 skill points per level
    });

    it('should acquire superpowers with skill points', () => {
      // Give enough skill points
      evolution.gainExperience(10000);
      
      const result = evolution.acquireSuperpower('neural_learning');
      expect(result).toBe(true);
      
      const status = evolution.getStatus();
      expect(status.acquiredSkills).toContain('neural_learning');
    });

    it('should improve mastery through usage', () => {
      evolution.acquireSuperpower('neural_learning');
      
      evolution.improveMastery('neural_learning', 25);
      
      const status = evolution.getStatus();
      expect(status.mastery['neural_learning']).toBe(50); // 25 initial + 25 improvement
    });

    it('should validate superpower requirements', () => {
      const canAcquire = validateSuperpowerRequirements('quantum_analysis', 8);
      expect(canAcquire).toBe(true);
      
      const cannotAcquire = validateSuperpowerRequirements('quantum_analysis', 3);
      expect(cannotAcquire).toBe(false);
    });

    it('should filter available superpowers by level', () => {
      const level1Powers = getAvailableSuperpowers(1);
      expect(level1Powers.length).toBe(0); // No superpowers available at level 1
      
      const level5Powers = getAvailableSuperpowers(5);
      expect(level5Powers.length).toBeGreaterThan(0);
      expect(level5Powers.every(power => power.level <= 5)).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    let monitor: AgentPerformanceMonitor;

    beforeEach(() => {
      monitor = new AgentPerformanceMonitor();
    });

    it('should record agent metrics', () => {
      const metrics = {
        cpu: 45,
        memory: 60,
        networkLatency: 120,
        tasksCompleted: 10,
        successRate: 95,
        userSatisfaction: 88,
        energyLevel: 75,
        activeSuperpowers: ['neural_learning']
      };

      monitor.recordMetrics(testAgentId, metrics);
      
      const analytics = monitor.getAnalytics(testAgentId);
      expect(analytics.metrics).toHaveLength(1);
      expect(analytics.metrics[0].cpu).toBe(45);
    });

    it('should generate performance alerts', () => {
      // High CPU usage should trigger alert
      monitor.recordMetrics(testAgentId, {
        cpu: 95,
        memory: 60,
        networkLatency: 120,
        tasksCompleted: 10,
        successRate: 95,
        userSatisfaction: 88,
        energyLevel: 75,
        activeSuperpowers: []
      });

      const alerts = monitor.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(alert => 
        alert.agentId === testAgentId && 
        alert.type === 'performance' &&
        alert.message.includes('High CPU usage')
      )).toBe(true);
    });

    it('should calculate performance trends', () => {
      // Record multiple metrics to establish trend
      for (let i = 0; i < 10; i++) {
        monitor.recordMetrics(testAgentId, {
          cpu: 50 + i * 2,
          memory: 60 + i,
          networkLatency: 120,
          tasksCompleted: 10,
          successRate: 95 - i,
          userSatisfaction: 88,
          energyLevel: 75,
          activeSuperpowers: []
        });
      }

      const analytics = monitor.getAnalytics(testAgentId);
      expect(analytics.trends.cpu).toBe('improving'); // Increasing CPU usage
      expect(analytics.trends.successRate).toBe('degrading'); // Decreasing success rate
    });
  });

  describe('Collaboration System', () => {
    let collaboration: AgentCollaborationSystem;

    beforeEach(() => {
      collaboration = new AgentCollaborationSystem(agentFramework);
    });

    it('should create collaboration session', async () => {
      const session = await collaboration.createSession(
        'Test Session',
        'Test collaboration session',
        testAgentId,
        ['agent-2', 'agent-3'],
        'realtime'
      );

      expect(session.id).toBeDefined();
      expect(session.name).toBe('Test Session');
      expect(session.participants).toContain(testAgentId);
      expect(session.participants).toContain('agent-2');
      expect(session.participants).toContain('agent-3');
    });

    it('should manage session participants', async () => {
      const session = await collaboration.createSession(
        'Test Session',
        'Test session',
        testAgentId,
        [],
        'realtime'
      );

      // Add participant
      const joinResult = await collaboration.joinSession(session.id, 'agent-2');
      expect(joinResult).toBe(true);

      // Remove participant
      const leaveResult = await collaboration.leaveSession(session.id, 'agent-2');
      expect(leaveResult).toBe(true);
    });

    it('should create and manage tasks', async () => {
      const session = await collaboration.createSession(
        'Test Session',
        'Test session',
        testAgentId,
        ['agent-2'],
        'realtime'
      );

      const task = await collaboration.createTask(
        session.id,
        'Test Task',
        'Test task description',
        ['agent-2'],
        testAgentId,
        'high'
      );

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.assignedTo).toContain('agent-2');

      // Update task progress
      const progressResult = await collaboration.updateTaskProgress(
        task.id,
        50,
        'agent-2'
      );
      expect(progressResult).toBe(true);
    });

    it('should share knowledge', async () => {
      const session = await collaboration.createSession(
        'Test Session',
        'Test session',
        testAgentId,
        [],
        'realtime'
      );

      const knowledge = await collaboration.shareKnowledge(
        session.id,
        testAgentId,
        'skill',
        'Test Knowledge',
        { content: 'Test knowledge content' },
        ['testing', 'knowledge']
      );

      expect(knowledge.id).toBeDefined();
      expect(knowledge.title).toBe('Test Knowledge');
      expect(knowledge.contributorId).toBe(testAgentId);
    });

    it('should maintain audit trail', async () => {
      const session = await collaboration.createSession(
        'Test Session',
        'Test session',
        testAgentId,
        [],
        'realtime'
      );

      const auditTrail = collaboration.getAuditTrail({
        sessionId: session.id
      });

      expect(auditTrail.length).toBeGreaterThan(0);
      expect(auditTrail.some(entry => 
        entry.action === 'create_session' &&
        entry.agentId === testAgentId
      )).toBe(true);
    });
  });

  describe('Superpower Categories', () => {
    it('should have cognitive superpowers', () => {
      const cognitivePowers = Object.values(AGENT_SUPERPOWERS)
        .filter(power => power.category === 'cognitive');

      expect(cognitivePowers.length).toBeGreaterThan(0);
      expect(cognitivePowers.some(power => power.id === 'quantum_analysis')).toBe(true);
      expect(cognitivePowers.some(power => power.id === 'neural_learning')).toBe(true);
      expect(cognitivePowers.some(power => power.id === 'memory_palace')).toBe(true);
    });

    it('should have social superpowers', () => {
      const socialPowers = Object.values(AGENT_SUPERPOWERS)
        .filter(power => power.category === 'social');

      expect(socialPowers.length).toBeGreaterThan(0);
      expect(socialPowers.some(power => power.id === 'viral_amplifier')).toBe(true);
      expect(socialPowers.some(power => power.id === 'influence_network')).toBe(true);
      expect(socialPowers.some(power => power.id === 'sentiment_oracle')).toBe(true);
    });

    it('should have technical superpowers', () => {
      const technicalPowers = Object.values(AGENT_SUPERPOWERS)
        .filter(power => power.category === 'technical');

      expect(technicalPowers.length).toBeGreaterThan(0);
      expect(technicalPowers.some(power => power.id === 'code_generator')).toBe(true);
      expect(technicalPowers.some(power => power.id === 'system_optimizer')).toBe(true);
      expect(technicalPowers.some(power => power.id === 'api_connector')).toBe(true);
      expect(technicalPowers.some(power => power.id === 'blockchain_master')).toBe(true);
    });

    it('should have creative superpowers', () => {
      const creativePowers = Object.values(AGENT_SUPERPOWERS)
        .filter(power => power.category === 'creative');

      expect(creativePowers.length).toBeGreaterThan(0);
      expect(creativePowers.some(power => power.id === 'content_creator')).toBe(true);
      expect(creativePowers.some(power => power.id === 'design_synthesizer')).toBe(true);
    });

    it('should have security superpowers', () => {
      const securityPowers = Object.values(AGENT_SUPERPOWERS)
        .filter(power => power.category === 'security');

      expect(securityPowers.length).toBeGreaterThan(0);
      expect(securityPowers.some(power => power.id === 'quantum_shield')).toBe(true);
      expect(securityPowers.some(power => power.id === 'privacy_guardian')).toBe(true);
    });
  });

  describe('Superpower Validation', () => {
    it('should validate superpower structure', () => {
      Object.values(AGENT_SUPERPOWERS).forEach(superpower => {
        expect(superpower.id).toBeDefined();
        expect(superpower.name).toBeDefined();
        expect(superpower.description).toBeDefined();
        expect(superpower.category).toBeDefined();
        expect(superpower.level).toBeGreaterThan(0);
        expect(superpower.level).toBeLessThanOrEqual(10);
        expect(superpower.energyCost).toBeGreaterThan(0);
        expect(superpower.cooldownTime).toBeGreaterThan(0);
        expect(superpower.requirements).toBeInstanceOf(Array);
        expect(superpower.capabilities).toBeInstanceOf(Array);
      });
    });

    it('should have valid capability mappings', () => {
      Object.values(AGENT_SUPERPOWERS).forEach(superpower => {
        superpower.capabilities.forEach(capability => {
          expect(typeof capability).toBe('string');
          expect(capability.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have consistent power levels', () => {
      const powerLevels = Object.values(AGENT_SUPERPOWERS)
        .map(power => power.level)
        .sort((a, b) => a - b);

      // Should have powers across different levels
      expect(powerLevels[0]).toBeLessThanOrEqual(5);
      expect(powerLevels[powerLevels.length - 1]).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Energy Management', () => {
    it('should calculate energy costs with mastery discounts', () => {
      const basePower = AGENT_SUPERPOWERS['quantum_analysis'];
      expect(basePower.energyCost).toBe(50);

      // 0% mastery = no discount
      expect(calculateSuperpowerCost('quantum_analysis', 0)).toBe(50);

      // 50% mastery = 25% discount
      expect(calculateSuperpowerCost('quantum_analysis', 50)).toBe(37.5);

      // 100% mastery = 50% discount (maximum)
      expect(calculateSuperpowerCost('quantum_analysis', 100)).toBe(25);
    });

    it('should enforce minimum energy cost', () => {
      // Even at 100% mastery, should not go below 10% of base cost
      const minCost = AGENT_SUPERPOWERS['api_connector'].energyCost * 0.1;
      expect(calculateSuperpowerCost('api_connector', 100)).toBeGreaterThanOrEqual(minCost);
    });

    it('should handle invalid superpower IDs', () => {
      expect(calculateSuperpowerCost('invalid_power', 50)).toBe(0);
    });
  });

  describe('Integration with Agent Framework', () => {
    it('should initialize agent framework successfully', async () => {
      await agentFramework.initializeAgent();
      
      const status = agentFramework.getAgentStatus();
      expect(status.evolution.totalLevel).toBe(1);
      expect(status.evolution.skillPoints).toBe(0);
      expect(status.evolution.acquiredSkills).toHaveLength(0);
    });

    it('should track agent status across systems', async () => {
      await agentFramework.initializeAgent();
      
      // Activate superpower
      agentFramework.activateSuperpower('neural_learning');
      
      const status = agentFramework.getAgentStatus();
      expect(status.evolution.acquiredSkills).toContain('neural_learning');
      
      // Check performance monitoring integration
      expect(status.performance).toBeDefined();
    });
  });
});

// Test utilities
export const createTestContext = (): TestContext => {
  return {
    environment: {
      id: 'test-env',
      name: 'Test Environment',
      type: 'isolated',
      status: 'ready',
      resources: { cpu: 2, memory: 4096, storage: 20, network: 'testnet' },
      configuration: {},
      agents: [],
      createdAt: new Date()
    },
    agentFramework: new AgentSuperpowersFramework('test-agent'),
    collaborationSystem: new AgentCollaborationSystem(new AgentSuperpowersFramework('test-agent')),
    marketplaceEngine: {} as any, // Mock for unit tests
    variables: new Map(),
    artifacts: [],
    startTime: new Date()
  };
};

export const createTestResult = (overrides: Partial<TestResult> = {}): TestResult => {
  return {
    id: `test-${Date.now()}`,
    name: 'Test Case',
    category: 'unit',
    status: 'pending',
    startTime: new Date(),
    message: 'Test initialized',
    ...overrides
  };
};