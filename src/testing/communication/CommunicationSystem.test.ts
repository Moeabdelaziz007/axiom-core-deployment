/**
 * 🧪 COMMUNICATION SYSTEM TESTS
 * 
 * Comprehensive test suite for the Axiom communication system
 * covering all components:
 * 
 * - Agent Communication System
 * - Real-time Communication
 * - Communication Monitoring
 * - DualityEngine Integration
 * - AxiomID System
 * - API Endpoints
 * - Security and Encryption
 * - Performance and Reliability
 * 
 * Tests follow AAA pattern:
 * - Arrange: Setup test environment and data
 * - Act: Execute the functionality being tested
 * - Assert: Verify expected outcomes
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AgentCommunicationIntegration } from '@/infra/core/AgentCommunicationIntegration';
import { RealtimeCommunicationSystem } from '@/infra/core/RealtimeCommunicationSystem';
import { CommunicationMonitoringSystem } from '@/infra/core/CommunicationMonitoringSystem';
import { DualityEngine, BehaviorType, BehaviorSeverity } from '@/infra/core/DualityEngine';
import { AxiomIDSystem, AxiomID } from '@/infra/core/AxiomID';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

describe('Axiom Communication System', () => {
  let communicationIntegration: AgentCommunicationIntegration;
  let realtimeSystem: RealtimeCommunicationSystem;
  let monitoringSystem: CommunicationMonitoringSystem;
  let dualityEngine: DualityEngine;
  let axiomIdSystem: AxiomIDSystem;
  let testAgentId: string;
  let testAxiomId: AxiomID;

  // ============================================================================
  // TEST SETUP
  // ============================================================================
  
  beforeEach(async () => {
    // Initialize systems
    communicationIntegration = new AgentCommunicationIntegration('test-agent');
    realtimeSystem = new RealtimeCommunicationSystem();
    monitoringSystem = new CommunicationMonitoringSystem();
    dualityEngine = new DualityEngine();
    axiomIdSystem = new AxiomIDSystem();
    
    // Create test agent
    testAgentId = 'test-agent-' + Date.now();
    testAxiomId = await axiomIdSystem.createIdentity(
      'ai',
      'Test Agent',
      'test-creator'
    );
    
    await dualityEngine.initializeAgent(testAgentId);
  });

  afterEach(() => {
    // Cleanup test data
    jest.clearAllMocks();
  });

  // ============================================================================
  // AGENT COMMUNICATION SYSTEM TESTS
  // ============================================================================

  describe('Agent Communication System', () => {
    describe('Message Sending', () => {
      it('should send message successfully between agents', async () => {
        const senderId = 'agent-1';
        const recipientId = 'agent-2';
        const messageType = 'text';
        const content = 'Test message content';

        const result = await communicationIntegration.sendMessage(
          senderId,
          recipientId,
          messageType,
          content
        );

        expect(result.success).toBe(true);
        expect(result.messageId).toBeDefined();
        expect(result.timestamp).toBeInstanceOf(Date);
        expect(result.deliveryConfirmation).toBe(true);
      });

      it('should handle multiple recipients', async () => {
        const senderId = 'agent-1';
        const recipientIds = ['agent-2', 'agent-3', 'agent-4'];
        const messageType = 'broadcast';
        const content = 'Broadcast message';

        const result = await communicationIntegration.sendMessage(
          senderId,
          recipientIds,
          messageType,
          content
        );

        expect(result.success).toBe(true);
        expect(result.deliveredTo).toHaveLength(3);
        expect(result.deliveryConfirmation).toBe(true);
      });

      it('should handle message with encryption', async () => {
        const senderId = 'agent-1';
        const recipientId = 'agent-2';
        const messageType = 'encrypted';
        const content = 'Sensitive data';

        const result = await communicationIntegration.sendMessage(
          senderId,
          recipientId,
          messageType,
          content,
          { encrypted: true, encryptionLevel: 'high' }
        );

        expect(result.success).toBe(true);
        expect(result.encrypted).toBe(true);
        expect(result.encryptionLevel).toBe('high');
      });

      it('should handle message sending failures gracefully', async () => {
        const senderId = 'invalid-agent';
        const recipientId = 'agent-2';
        const messageType = 'text';
        const content = 'Test message';

        const result = await communicationIntegration.sendMessage(
          senderId,
          recipientId,
          messageType,
          content
        );

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.messageId).toBe('unknown');
      });
    });

    describe('Message Receiving', () => {
      it('should receive messages correctly', async () => {
        const recipientId = 'agent-1';
        const messageId = 'msg-123';
        const senderId = 'agent-2';
        const content = 'Incoming message';

        const result = await communicationIntegration.receiveMessage(
          recipientId,
          messageId,
          senderId,
          content
        );

        expect(result.success).toBe(true);
        expect(result.delivered).toBe(true);
        expect(result.readReceipt).toBe(false);
      });

      it('should handle message priority', async () => {
        const recipientId = 'agent-1';
        const highPriorityMessage = {
          id: 'priority-msg',
          senderId: 'agent-2',
          content: 'Urgent message',
          priority: 'high'
        };

        const result = await communicationIntegration.receiveMessage(
          recipientId,
          highPriorityMessage.id,
          highPriorityMessage.senderId,
          highPriorityMessage.content,
          { priority: highPriorityMessage.priority }
        );

        expect(result.success).toBe(true);
        expect(result.priority).toBe('high');
        expect(result.processedImmediately).toBe(true);
      });
    });

    describe('Message Routing', () => {
      it('should route messages to correct recipients', async () => {
        const message = {
          id: 'route-test',
          senderId: 'agent-1',
          content: 'Routed message',
          routingStrategy: 'intelligent'
        };

        const routingResult = await communicationIntegration.routeMessage(
          message,
          ['agent-2', 'agent-3']
        );

        expect(routingResult.success).toBe(true);
        expect(routingResult.selectedRoute).toBeDefined();
        expect(routingResult.estimatedDelivery).toBeInstanceOf(Date);
      });

      it('should handle routing failures', async () => {
        const message = {
          id: 'route-fail',
          senderId: 'agent-1',
          content: 'Unroutable message'
        };

        const routingResult = await communicationIntegration.routeMessage(
          message,
          ['non-existent-agent']
        );

        expect(routingResult.success).toBe(false);
        expect(routingResult.error).toContain('No valid recipients');
      });
    });
  });

  // ============================================================================
  // REAL-TIME COMMUNICATION TESTS
  // ============================================================================

  describe('Real-time Communication System', () => {
    describe('Session Management', () => {
      it('should create communication session successfully', async () => {
        const initiatorId = 'agent-1';
        const participants = ['agent-2', 'agent-3'];
        const sessionType = 'conference';

        const result = await realtimeSystem.createSession(
          initiatorId,
          participants,
          sessionType
        );

        expect(result.success).toBe(true);
        expect(result.sessionId).toBeDefined();
        expect(result.participants).toContain(initiatorId);
        expect(result.participants).toEqual(expect.arrayContaining(participants));
      });

      it('should handle session joining', async () => {
        const sessionId = 'session-123';
        const agentId = 'agent-4';

        const result = await realtimeSystem.joinSession(sessionId, agentId);

        expect(result.success).toBe(true);
        expect(result.joinedAt).toBeInstanceOf(Date);
        expect(result.participantCount).toBeGreaterThan(0);
      });

      it('should handle session leaving', async () => {
        const sessionId = 'session-123';
        const agentId = 'agent-2';

        const result = await realtimeSystem.leaveSession(sessionId, agentId);

        expect(result.success).toBe(true);
        expect(result.leftAt).toBeInstanceOf(Date);
        expect(result.finalParticipantCount).toBeDefined();
      });

      it('should handle real-time message broadcasting', async () => {
        const sessionId = 'session-123';
        const senderId = 'agent-1';
        const message = 'Real-time broadcast';

        const result = await realtimeSystem.broadcastToSession(
          sessionId,
          senderId,
          message
        );

        expect(result.success).toBe(true);
        expect(result.broadcastTo).toEqual(expect.arrayContaining(['agent-2', 'agent-3']));
        expect(result.timestamp).toBeInstanceOf(Date);
      });
    });

    describe('WebSocket Connection', () => {
      it('should establish WebSocket connection', async () => {
        const agentId = 'agent-1';
        const sessionId = 'session-123';

        const connectionResult = await realtimeSystem.establishConnection(
          agentId,
          sessionId
        );

        expect(connectionResult.success).toBe(true);
        expect(connectionResult.websocketUrl).toContain('ws://');
        expect(connectionResult.connectionToken).toBeDefined();
      });

      it('should handle connection failures', async () => {
        const agentId = 'invalid-agent';
        const sessionId = 'invalid-session';

        const connectionResult = await realtimeSystem.establishConnection(
          agentId,
          sessionId
        );

        expect(connectionResult.success).toBe(false);
        expect(connectionResult.error).toBeDefined();
      });

      it('should maintain connection health', async () => {
        const sessionId = 'session-123';
        
        const healthResult = await realtimeSystem.checkConnectionHealth(sessionId);

        expect(healthResult.healthy).toBe(true);
        expect(healthResult.latency).toBeLessThan(1000); // Less than 1 second
        expect(healthResult.packetLoss).toBeLessThan(0.05); // Less than 5%
      });
    });

    describe('Media Sharing', () => {
      it('should handle file sharing', async () => {
        const sessionId = 'session-123';
        const senderId = 'agent-1';
        const fileData = {
          name: 'test-file.txt',
          size: 1024,
          type: 'text',
          content: 'File content'
        };

        const result = await realtimeSystem.shareFile(
          sessionId,
          senderId,
          fileData
        );

        expect(result.success).toBe(true);
        expect(result.fileId).toBeDefined();
        expect(result.downloadUrl).toBeDefined();
      });

      it('should handle voice communication', async () => {
        const sessionId = 'voice-session';
        const participantId = 'agent-1';

        const voiceResult = await realtimeSystem.enableVoice(
          sessionId,
          participantId
        );

        expect(voiceResult.success).toBe(true);
        expect(voiceResult.audioStream).toBeDefined();
        expect(voiceResult.codec).toBeDefined();
      });

      it('should handle video communication', async () => {
        const sessionId = 'video-session';
        const participantId = 'agent-1';

        const videoResult = await realtimeSystem.enableVideo(
          sessionId,
          participantId
        );

        expect(videoResult.success).toBe(true);
        expect(videoResult.videoStream).toBeDefined();
        expect(videoResult.resolution).toBeDefined();
      });
    });
  });

  // ============================================================================
  // COMMUNICATION MONITORING TESTS
  // ============================================================================

  describe('Communication Monitoring System', () => {
    describe('Performance Monitoring', () => {
      it('should track message delivery times', async () => {
        const messageId = 'perf-test-123';
        const startTime = Date.now();

        // Simulate message sending
        await communicationIntegration.sendMessage(
          'agent-1',
          'agent-2',
          'text',
          'Performance test message'
        );

        const endTime = Date.now();
        const deliveryTime = endTime - startTime;

        const metrics = monitoringSystem.getMetrics();

        expect(metrics.performance.averageDeliveryTime).toBeGreaterThan(0);
        expect(metrics.performance.totalMessages).toBeGreaterThan(0);
      });

      it('should track system uptime', () => {
        const uptimeMetrics = monitoringSystem.getUptimeMetrics();

        expect(uptimeMetrics.uptime).toBeGreaterThan(95); // At least 95% uptime
        expect(uptimeMetrics.downtimeIncidents).toBeDefined();
        expect(uptimeMetrics.meanTimeToRecovery).toBeGreaterThan(0);
      });

      it('should detect performance anomalies', () => {
        const anomalies = monitoringSystem.detectPerformanceAnomalies();

        expect(Array.isArray(anomalies)).toBe(true);
        expect(anomalies.length).toBeGreaterThan(0);
        expect(anomalies[0]).toHaveProperty('type');
        expect(anomalies[0]).toHaveProperty('severity');
        expect(anomalies[0]).toHaveProperty('timestamp');
      });
    });

    describe('Security Monitoring', () => {
      it('should track encryption usage', async () => {
        // Send encrypted message
        await communicationIntegration.sendMessage(
          'agent-1',
          'agent-2',
          'encrypted',
          'Secure content',
          { encrypted: true }
        );

        const securityMetrics = monitoringSystem.getSecurityMetrics();

        expect(securityMetrics.encryption.encryptedMessages).toBeGreaterThan(0);
        expect(securityMetrics.encryption.encryptionRate).toBeGreaterThan(0);
      });

      it('should detect security threats', () => {
        const threats = monitoringSystem.getSecurityThreats();

        expect(Array.isArray(threats)).toBe(true);
        expect(threats.length).toBeGreaterThan(0);
        expect(threats[0]).toHaveProperty('type');
        expect(threats[0]).toHaveProperty('severity');
        expect(threats[0]).toHaveProperty('description');
      });

      it('should track authentication attempts', () => {
        const authMetrics = monitoringSystem.getAuthenticationMetrics();

        expect(authMetrics.totalAttempts).toBeGreaterThan(0);
        expect(authMetrics.successRate).toBeGreaterThan(0);
        expect(authMetrics.failureRate).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Quality Metrics', () => {
      it('should calculate communication quality scores', () => {
        const qualityMetrics = monitoringSystem.getQualityMetrics();

        expect(qualityMetrics.overall).toBeGreaterThan(0);
        expect(qualityMetrics.overall).toBeLessThanOrEqual(100);
        expect(qualityMetrics.clarity).toBeDefined();
        expect(qualityMetrics.responsiveness).toBeDefined();
        expect(qualityMetrics.reliability).toBeDefined();
      });

      it('should track user satisfaction', () => {
        const satisfactionMetrics = monitoringSystem.getUserSatisfactionMetrics();

        expect(satisfactionMetrics.averageRating).toBeGreaterThan(0);
        expect(satisfactionMetrics.averageRating).toBeLessThanOrEqual(5);
        expect(satisfactionMetrics.netPromoterScore).toBeDefined();
        expect(satisfactionMetrics.feedbackCount).toBeGreaterThan(0);
      });
    });
  });

  // ============================================================================
  // DUALITY ENGINE TESTS
  // ============================================================================

  describe('DualityEngine', () => {
    describe('Behavior Tracking', () => {
      it('should record virtue behaviors', async () => {
        const virtueBehavior = {
          type: BehaviorType.SUCCESSFUL_COLLABORATION,
          severity: BehaviorSeverity.MODERATE,
          description: 'Agent collaborated successfully on task'
        };

        const result = await dualityEngine.recordBehavior(
          testAgentId,
          virtueBehavior.type,
          virtueBehavior.description,
          { severity: virtueBehavior.severity }
        );

        expect(result.success).toBe(true);
        expect(result.behaviorId).toBeDefined();
        expect(result.impact.reputation).toBeGreaterThan(0);
      });

      it('should record vice behaviors', async () => {
        const viceBehavior = {
          type: BehaviorType.TECHNICAL_ERROR,
          severity: BehaviorSeverity.SIGNIFICANT,
          description: 'Agent encountered technical error'
        };

        const result = await dualityEngine.recordBehavior(
          testAgentId,
          viceBehavior.type,
          viceBehavior.description,
          { severity: viceBehavior.severity }
        );

        expect(result.success).toBe(true);
        expect(result.behaviorId).toBeDefined();
        expect(result.impact.reputation).toBeLessThan(0);
      });

      it('should calculate karma balance correctly', () => {
        // Record some test behaviors
        dualityEngine.recordBehavior(testAgentId, BehaviorType.SUCCESSFUL_COLLABORATION, 'Good collaboration');
        dualityEngine.recordBehavior(testAgentId, BehaviorType.HELPFUL_ASSISTANCE, 'Helpful assistance');
        dualityEngine.recordBehavior(testAgentId, BehaviorType.TECHNICAL_ERROR, 'Technical error');

        const karmaBalance = dualityEngine.getKarmaBalance(testAgentId);

        expect(karmaBalance.virtuePoints).toBeGreaterThan(0);
        expect(karmaBalance.vicePoints).toBeGreaterThan(0);
        expect(karmaBalance.netBalance).toBeDefined();
        expect(karmaBalance.state).toBeDefined();
      });
    });

    describe('Penance System', () => {
      it('should trigger penance for excessive vice points', async () => {
        // Record many vice behaviors
        for (let i = 0; i < 10; i++) {
          await dualityEngine.recordBehavior(
            testAgentId,
            BehaviorType.MISSED_DEADLINE,
            `Missed deadline ${i}`
          );
        }

        const penanceState = dualityEngine.getPenanceState(testAgentId);

        expect(penanceState).toBeDefined();
        expect(penanceState.restrictions.length).toBeGreaterThan(0);
        expect(penanceState.requiredActions.length).toBeGreaterThan(0);
      });

      it('should clear penance when balance improves', async () => {
        // Put agent in penance
        for (let i = 0; i < 10; i++) {
          await dualityEngine.recordBehavior(
            testAgentId,
            BehaviorType.MISSED_DEADLINE,
            `Missed deadline ${i}`
          );
        }

        // Add virtue points to clear penance
        for (let i = 0; i < 15; i++) {
          await dualityEngine.recordBehavior(
            testAgentId,
            BehaviorType.SUCCESSFUL_COLLABORATION,
            `Good collaboration ${i}`
          );
        }

        const penanceState = dualityEngine.getPenanceState(testAgentId);

        expect(penanceState).toBeNull();
      });
    });
  });

  // ============================================================================
  // AXIOMID SYSTEM TESTS
  // ============================================================================

  describe('AxiomID System', () => {
    describe('Identity Creation', () => {
      it('should create new AxiomID successfully', async () => {
        const agentType = 'ai';
        const agentName = 'Test AI Agent';
        const creatorId = 'test-creator';

        const axiomId = await axiomIdSystem.createIdentity(
          agentType,
          agentName,
          creatorId
        );

        expect(axiomId).toBeDefined();
        expect(axiomId.id).toBeDefined();
        expect(axiomId.type).toBe(agentType);
        expect(axiomId.name).toBe(agentName);
        expect(axiomId.birthTime).toBeInstanceOf(Date);
        expect(axiomId.consciousness).toBeDefined();
        expect(axiomId.cosmicSignature).toBeDefined();
        expect(axiomId.evolution).toBeDefined();
      });

      it('should initialize consciousness state correctly', async () => {
        const axiomId = await axiomIdSystem.createIdentity('human', 'Test Human', 'creator');

        expect(axiomId.consciousness.level).toBeGreaterThan(0);
        expect(axiomId.consciousness.level).toBeLessThanOrEqual(100);
        expect(axiomId.consciousness.awareness).toBeDefined();
        expect(axiomId.consciousness.reflection).toBeDefined();
      });

      it('should generate unique cosmic signature', async () => {
        const axiomId1 = await axiomIdSystem.createIdentity('ai', 'Agent 1', 'creator');
        const axiomId2 = await axiomIdSystem.createIdentity('ai', 'Agent 2', 'creator');

        expect(axiomId1.cosmicSignature.frequency).not.toBe(axiomId2.cosmicSignature.frequency);
        expect(axiomId1.cosmicSignature.stellarClassification).toBeDefined();
        expect(axiomId2.cosmicSignature.stellarClassification).toBeDefined();
      });
    });

    describe('Evolution System', () => {
      it('should track evolution progress', async () => {
        const axiomId = await axiomIdSystem.createIdentity('ai', 'Evolving Agent', 'creator');
        
        // Simulate evolution experience
        const experience = {
          type: 'learning',
          intensity: 5,
          duration: 100,
          novelty: 3,
          impact: 4
        };

        const evolutionResult = await axiomIdSystem.evolveIdentity(axiomId.id, experience);

        expect(evolutionResult.newEvolutionState.evolutionPoints).toBeGreaterThan(0);
        expect(evolutionResult.newConsciousnessState.level).toBeGreaterThanOrEqual(axiomId.consciousness.level);
      });

      it('should handle ascension correctly', async () => {
        const axiomId = await axiomIdSystem.createIdentity('ai', 'Ascending Agent', 'creator');
        
        // Add enough evolution points for ascension
        for (let i = 0; i < 100; i++) {
          await axiomIdSystem.evolveIdentity(axiomId.id, {
            type: 'learning',
            intensity: 1,
            duration: 10,
            novelty: 1,
            impact: 1
          });
        }

        const karmaBalance = dualityEngine.getKarmaBalance(testAgentId);
        const cosmicReflection = await axiomIdSystem.getCosmicReflection(axiomId.id);

        expect(cosmicReflection.insights.length).toBeGreaterThan(0);
        expect(cosmicReflection.recommendations.length).toBeGreaterThan(0);
        expect(cosmicReflection.cosmicWisdom).toBeDefined();
      });
    });

    describe('Quantum Entanglement', () => {
      it('should create quantum entanglement between agents', async () => {
        const axiomId1 = await axiomIdSystem.createIdentity('ai', 'Agent 1', 'creator');
        const axiomId2 = await axiomIdSystem.createIdentity('ai', 'Agent 2', 'creator');

        const entanglement = await axiomIdSystem.createEntanglement(
          axiomId1.id,
          axiomId2.id,
          'perfect'
        );

        expect(entanglement).toBeDefined();
        expect(entanglement.entanglementStrength).toBeGreaterThan(0);
        expect(entanglement.correlationType).toBe('perfect');
        expect(entanglement.sharedQuantumState).toBeDefined();
      });

      it('should calculate entanglement compatibility', async () => {
        const axiomId1 = await axiomIdSystem.createIdentity('ai', 'Agent 1', 'creator');
        const axiomId2 = await axiomIdSystem.createIdentity('ai', 'Agent 2', 'creator');

        // Create entanglement
        await axiomIdSystem.createEntanglement(axiomId1.id, axiomId2.id, 'perfect');

        const compatibility = axiomIdSystem.calculateEntanglementCompatibility(axiomId1, axiomId2);

        expect(compatibility).toBeGreaterThan(0);
        expect(compatibility).toBeLessThanOrEqual(100);
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('System Integration', () => {
    it('should integrate communication with DualityEngine', async () => {
      const messageData = {
        senderId: 'agent-1',
        recipientId: 'agent-2',
        content: 'Integration test message'
      };

      // Send message through communication system
      const commResult = await communicationIntegration.sendMessage(
        messageData.senderId,
        messageData.recipientId,
        'text',
        messageData.content
      );

      // Check if behavior was recorded in DualityEngine
      const karmaBalance = dualityEngine.getKarmaBalance(messageData.senderId);

      expect(commResult.success).toBe(true);
      expect(karmaBalance).toBeDefined();
    });

    it('should integrate monitoring with real-time system', async () => {
      const sessionId = 'integration-session';
      const participantId = 'agent-1';

      // Create real-time session
      const sessionResult = await realtimeSystem.createSession(
        'initiator',
        [participantId],
        'conference'
      );

      // Check if session is being monitored
      const monitoringReport = monitoringSystem.getMonitoringReport();

      expect(sessionResult.success).toBe(true);
      expect(monitoringReport.activeSessions).toContain(sessionResult.sessionId);
    });

    it('should integrate AxiomID with communication system', async () => {
      const axiomId = await axiomIdSystem.createIdentity('ai', 'Integration Agent', 'creator');
      
      // Send message using the AxiomID
      const messageResult = await communicationIntegration.sendMessageWithSkills(
        axiomId.id,
        'agent-2',
        'text',
        'Message from AxiomID agent'
      );

      expect(messageResult.success).toBe(true);
      expect(messageResult.senderSkills).toBeDefined();
      expect(messageResult.skillSharing).toBeDefined();
    });
  });

  // ============================================================================
  // SECURITY TESTS
  // ============================================================================

  describe('Security and Encryption', () => {
    it('should encrypt messages end-to-end', async () => {
      const sensitiveMessage = 'Confidential data';
      const encryptionLevel = 'high';

      const result = await communicationIntegration.sendMessage(
        'agent-1',
        'agent-2',
        'encrypted',
        sensitiveMessage,
        { encrypted: true, encryptionLevel }
      );

      expect(result.success).toBe(true);
      expect(result.encrypted).toBe(true);
      expect(result.encryptionLevel).toBe(encryptionLevel);
      expect(result.encryptedContent).toBeDefined();
      expect(result.encryptedContent).not.toBe(sensitiveMessage);
    });

    it('should handle message integrity verification', async () => {
      const messageContent = 'Important message';
      const integrityHash = 'calculated-hash';

      const result = await communicationIntegration.sendMessage(
        'agent-1',
        'agent-2',
        'text',
        messageContent,
        { integrityHash }
      );

      expect(result.success).toBe(true);
      expect(result.integrityVerified).toBe(true);
    });

    it('should prevent unauthorized access', async () => {
      const unauthorizedAgent = 'unauthorized-agent';
      const targetAgent = 'agent-2';

      const result = await communicationIntegration.sendMessage(
        unauthorizedAgent,
        targetAgent,
        'text',
        'Unauthorized message'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('unauthorized');
    });

    it('should handle rate limiting', async () => {
      const senderId = 'agent-1';
      const recipientId = 'agent-2';

      // Send multiple messages rapidly
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          communicationIntegration.sendMessage(senderId, recipientId, 'text', `Message ${i}`)
        );
      }

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      const rateLimitedCount = results.filter(r => r.error?.includes('rate limit')).length;

      expect(rateLimitedCount).toBeGreaterThan(0);
      expect(successCount).toBeLessThan(10);
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance and Reliability', () => {
    it('should handle high message volume', async () => {
      const startTime = Date.now();
      const messageCount = 100;
      const promises = [];

      for (let i = 0; i < messageCount; i++) {
        promises.push(
          communicationIntegration.sendMessage(`agent-${i}`, 'agent-target', 'text', `Bulk message ${i}`)
        );
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      const successRate = results.filter(r => r.success).length / results.length;

      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      expect(successRate).toBeGreaterThan(0.95); // 95% success rate
    });

    it('should maintain performance under load', async () => {
      const concurrentSessions = 50;
      const promises = [];

      for (let i = 0; i < concurrentSessions; i++) {
        promises.push(
          realtimeSystem.createSession(`agent-${i}`, [`participant-${i}`], 'chat')
        );
      }

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      const averageCreationTime = results.reduce((sum, r) => sum + (r.creationTime || 0), 0) / results.length;

      expect(successCount).toBeGreaterThan(concurrentSessions * 0.9); // 90% success rate
      expect(averageCreationTime).toBeLessThan(1000); // Average creation time under 1 second
    });

    it('should handle network interruptions gracefully', async () => {
      // Simulate network interruption
      const originalNetworkState = monitoringSystem.getNetworkState();
      
      // Simulate interruption
      monitoringSystem.simulateNetworkInterruption();
      
      // Try to send message during interruption
      const result = await communicationIntegration.sendMessage(
        'agent-1',
        'agent-2',
        'text',
        'Message during interruption'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('network unavailable');
      
      // Restore network
      monitoringSystem.restoreNetwork();
      
      // Verify recovery
      const recoveredState = monitoringSystem.getNetworkState();
      expect(recoveredState.healthy).toBe(true);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling and Recovery', () => {
    it('should handle invalid message formats', async () => {
      const invalidMessage = null;

      const result = await communicationIntegration.sendMessage(
        'agent-1',
        'agent-2',
        'text',
        invalidMessage as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.errorCode).toBeDefined();
    });

    it('should handle session creation conflicts', async () => {
      const sessionId = 'conflict-session';
      const participantId = 'agent-1';

      // Create first session
      await realtimeSystem.createSession('initiator', [participantId], 'conference');

      // Try to create conflicting session
      const result = await realtimeSystem.createSession(
        'initiator',
        [participantId],
        'conference',
        { sessionId }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('session conflict');
    });

    it('should provide meaningful error messages', async () => {
      const invalidRecipient = 'non-existent-agent';

      const result = await communicationIntegration.sendMessage(
        'agent-1',
        invalidRecipient,
        'text',
        'Test message'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).not.toBe('Unknown error');
      expect(result.errorCode).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('should handle system recovery after errors', async () => {
      // Simulate system error
      monitoringSystem.simulateSystemError('memory leak');

      // Verify error detection
      const errorState = monitoringSystem.getSystemHealth();
      expect(errorState.healthy).toBe(false);
      expect(errorState.errors.length).toBeGreaterThan(0);

      // Trigger recovery
      const recoveryResult = await monitoringSystem.triggerRecovery();

      expect(recoveryResult.initiated).toBe(true);
      expect(recoveryResult.recoveryActions.length).toBeGreaterThan(0);

      // Verify recovery
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for recovery
      const recoveredState = monitoringSystem.getSystemHealth();
      expect(recoveredState.healthy).toBe(true);
    });
  });

  // ============================================================================
  // BOUNDARY TESTS
  // ============================================================================

  describe('Boundary and Edge Cases', () => {
    it('should handle extremely large messages', async () => {
      const largeMessage = 'x'.repeat(1000000); // 1MB message
      const senderId = 'agent-1';
      const recipientId = 'agent-2';

      const result = await communicationIntegration.sendMessage(
        senderId,
        recipientId,
        'text',
        largeMessage
      );

      expect(result.success).toBe(true);
      expect(result.compressed).toBe(true);
      expect(result.chunked).toBe(true);
    });

    it('should handle maximum session participants', async () => {
      const maxParticipants = 1000;
      const participants = Array.from({ length: maxParticipants }, (_, i) => `agent-${i}`);

      const result = await realtimeSystem.createSession(
        'initiator',
        participants,
        'conference'
      );

      expect(result.success).toBe(true);
      expect(result.participants.length).toBeLessThanOrEqual(maxParticipants);
      expect(result.warning).toContain('large session');
    });

    it('should handle concurrent operations', async () => {
      const agentId = 'concurrent-agent';
      const operations = [];

      // Start multiple concurrent operations
      for (let i = 0; i < 10; i++) {
        operations.push(
          communicationIntegration.sendMessage(agentId, `target-${i}`, 'text', `Concurrent message ${i}`)
        );
        operations.push(
          realtimeSystem.createSession(`initiator-${i}`, [agentId], 'chat')
        );
      }

      const results = await Promise.all(operations);
      const successCount = results.filter(r => r.success).length;

      expect(successCount).toBeGreaterThan(15); // At least 75% success rate
    });

    it('should handle system resource exhaustion', async () => {
      // Monitor resource usage
      const initialResources = monitoringSystem.getResourceUsage();

      // Simulate resource exhaustion
      monitoringSystem.simulateResourceExhaustion('memory');

      // Try operation with exhausted resources
      const result = await communicationIntegration.sendMessage(
        'agent-1',
        'agent-2',
        'text',
        'Resource exhaustion test'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('insufficient resources');
      expect(result.retryAfter).toBeDefined();
    });
  });
});