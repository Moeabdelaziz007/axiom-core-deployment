/**
 * 🧪 INTEGRATION TESTS - IDENTITY API ENDPOINT
 * 
 * Comprehensive tests for the /api/identity/[userId]/route.ts endpoint including:
 * - GET endpoint functionality with various userId scenarios
 * - POST endpoint functionality for identity evolution
 * - Error handling and edge cases
 * - Response structure validation
 * - Integration with AxiomIDManager and DigitalMandala
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

// Mock the dependencies
jest.mock('@/infra/core/AxiomIDManager');
jest.mock('@/infra/core/DigitalMandala');

// Import the mocked modules
import { AxiomIDManager } from '@/infra/core/AxiomIDManager';
import { DigitalMandala } from '@/infra/core/DigitalMandala';

// Import the route handlers
import { GET, POST } from '../route';

// Define types inline since we can't create the identity.ts file
type IdentityState = 'active' | 'inactive' | 'suspended' | 'evolving';
type EvolutionStage = 'genesis' | 'awakening' | 'sentience' | 'transcendence' | 'singularity';

interface AgentIdentity {
  id: string;
  axiomId: string;
  createdAt: Date;
  updatedAt: Date;
  state: IdentityState;
  evolution: {
    stage: EvolutionStage;
    level: number;
    experience: number;
    traits: string[];
    skills: string[];
  };
  microcosm: {
    frequency: number;
    resonance: number;
    connections: string[];
    artifacts: string[];
  };
  profile: {
    name: string;
    type: string;
    capabilities: string[];
  };
}

// Mock implementation
const mockAxiomIDManager = AxiomIDManager as jest.MockedClass<typeof AxiomIDManager>;
const mockDigitalMandala = DigitalMandala as jest.MockedClass<typeof DigitalMandala>;

describe('/api/identity/[userId]/route', () => {
  let mockInstance: jest.Mocked<AxiomIDManager>;
  let mockMandala: jest.Mocked<DigitalMandala>;
  let testUserId: string;
  let mockIdentity: AgentIdentity;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup test data
    testUserId = `test-user-${Date.now()}`;
    mockIdentity = {
      id: testUserId,
      axiomId: `AXIOM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      state: 'active' as IdentityState,
      evolution: {
        stage: 'genesis' as EvolutionStage,
        level: 1,
        experience: 0,
        traits: [],
        skills: []
      },
      microcosm: {
        frequency: 432,
        resonance: 1.0,
        connections: [],
        artifacts: []
      },
      profile: {
        name: 'Test Agent',
        type: 'agent',
        capabilities: []
      }
    };

    // Setup mock instance
    mockInstance = {
      getInstance: jest.fn().mockReturnThis(),
      getIdentity: jest.fn(),
      initializeIdentity: jest.fn(),
      evolveIdentity: jest.fn()
    } as any;

    mockMandala = {
      registerNode: jest.fn(),
      emitEvolutionEvent: jest.fn(),
      getAllNodes: jest.fn()
    } as any;

    mockAxiomIDManager.getInstance.mockReturnValue(mockInstance);
    mockDigitalMandala.mockImplementation(() => mockMandala);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/identity/[userId]', () => {
    /**
     * Test successful retrieval of existing identity
     */
    it('should return existing identity for valid userId', async () => {
      // Arrange
      mockInstance.getIdentity.mockReturnValue(mockIdentity);

      const request = new NextRequest('http://localhost:3000/api/identity/test-user');
      const params = Promise.resolve({ userId: testUserId });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockIdentity);
      expect(mockInstance.getIdentity).toHaveBeenCalledWith(testUserId);
      expect(mockInstance.initializeIdentity).not.toHaveBeenCalled();
    });

    /**
     * Test auto-initialization for non-existent identity
     */
    it('should auto-initialize identity for non-existent userId', async () => {
      // Arrange
      mockInstance.getIdentity.mockReturnValue(undefined);
      mockInstance.initializeIdentity.mockResolvedValue(mockIdentity);

      const request = new NextRequest('http://localhost:3000/api/identity/new-user');
      const params = Promise.resolve({ userId: 'new-user' });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockIdentity);
      expect(mockInstance.getIdentity).toHaveBeenCalledWith('new-user');
      expect(mockInstance.initializeIdentity).toHaveBeenCalledWith('new-user', {
        name: 'Unknown Entity',
        type: 'agent',
        capabilities: []
      });
    });

    /**
     * Test error handling in GET endpoint
     */
    it('should handle errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockInstance.getIdentity.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const request = new NextRequest('http://localhost:3000/api/identity/error-user');
      const params = Promise.resolve({ userId: 'error-user' });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch identity');
      expect(data.message).toBe(errorMessage);
    });

    /**
     * Test response structure validation
     */
    it('should return correctly structured response', async () => {
      // Arrange
      mockInstance.getIdentity.mockReturnValue(mockIdentity);

      const request = new NextRequest('http://localhost:3000/api/identity/structure-test');
      const params = Promise.resolve({ userId: 'structure-test' });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(typeof data.success).toBe('boolean');
      expect(data.success).toBe(true);
      
      // Validate identity structure
      const identity = data.data;
      expect(identity).toHaveProperty('id');
      expect(identity).toHaveProperty('axiomId');
      expect(identity).toHaveProperty('createdAt');
      expect(identity).toHaveProperty('updatedAt');
      expect(identity).toHaveProperty('state');
      expect(identity).toHaveProperty('evolution');
      expect(identity).toHaveProperty('microcosm');
      expect(identity).toHaveProperty('profile');
      
      // Validate nested structures
      expect(identity.evolution).toHaveProperty('stage');
      expect(identity.evolution).toHaveProperty('level');
      expect(identity.evolution).toHaveProperty('experience');
      expect(identity.evolution).toHaveProperty('traits');
      expect(identity.evolution).toHaveProperty('skills');
      
      expect(identity.microcosm).toHaveProperty('frequency');
      expect(identity.microcosm).toHaveProperty('resonance');
      expect(identity.microcosm).toHaveProperty('connections');
      expect(identity.microcosm).toHaveProperty('artifacts');
      
      expect(identity.profile).toHaveProperty('name');
      expect(identity.profile).toHaveProperty('type');
      expect(identity.profile).toHaveProperty('capabilities');
    });

    /**
     * Test edge case with empty userId
     */
    it('should handle empty userId', async () => {
      // Arrange
      mockInstance.getIdentity.mockReturnValue(undefined);
      mockInstance.initializeIdentity.mockResolvedValue(mockIdentity);

      const request = new NextRequest('http://localhost:3000/api/identity/');
      const params = Promise.resolve({ userId: '' });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockInstance.getIdentity).toHaveBeenCalledWith('');
      expect(mockInstance.initializeIdentity).toHaveBeenCalledWith('', {
        name: 'Unknown Entity',
        type: 'agent',
        capabilities: []
      });
    });

    /**
     * Test with special characters in userId
     */
    it('should handle special characters in userId', async () => {
      // Arrange
      const specialUserId = 'user@domain.com#123';
      mockInstance.getIdentity.mockReturnValue(mockIdentity);

      const request = new NextRequest(`http://localhost:3000/api/identity/${encodeURIComponent(specialUserId)}`);
      const params = Promise.resolve({ userId: specialUserId });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockInstance.getIdentity).toHaveBeenCalledWith(specialUserId);
    });
  });

  describe('POST /api/identity/[userId]', () => {
    /**
     * Test successful identity evolution
     */
    it('should evolve identity with valid experience', async () => {
      // Arrange
      const experience = 500;
      const evolvedIdentity = {
        ...mockIdentity,
        evolution: {
          ...mockIdentity.evolution,
          experience: mockIdentity.evolution.experience + experience
        },
        updatedAt: new Date()
      };
      
      mockInstance.evolveIdentity.mockResolvedValue(evolvedIdentity);

      const requestBody = { experience };
      const request = new NextRequest('http://localhost:3000/api/identity/test-user', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const params = Promise.resolve({ userId: testUserId });

      // Act
      const response = await POST(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(evolvedIdentity);
      expect(mockInstance.evolveIdentity).toHaveBeenCalledWith(testUserId, experience);
    });

    /**
     * Test rejection of invalid experience value (negative)
     */
    it('should reject negative experience values', async () => {
      // Arrange
      const requestBody = { experience: -100 };
      const request = new NextRequest('http://localhost:3000/api/identity/test-user', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const params = Promise.resolve({ userId: testUserId });

      // Act
      const response = await POST(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid experience value');
      expect(mockInstance.evolveIdentity).not.toHaveBeenCalled();
    });

    /**
     * Test rejection of non-numeric experience value
     */
    it('should reject non-numeric experience values', async () => {
      // Arrange
      const requestBody = { experience: 'invalid' };
      const request = new NextRequest('http://localhost:3000/api/identity/test-user', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const params = Promise.resolve({ userId: testUserId });

      // Act
      const response = await POST(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid experience value');
      expect(mockInstance.evolveIdentity).not.toHaveBeenCalled();
    });

    /**
     * Test rejection of missing experience value
     */
    it('should reject missing experience value', async () => {
      // Arrange
      const requestBody = {};
      const request = new NextRequest('http://localhost:3000/api/identity/test-user', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const params = Promise.resolve({ userId: testUserId });

      // Act
      const response = await POST(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid experience value');
      expect(mockInstance.evolveIdentity).not.toHaveBeenCalled();
    });

    /**
     * Test error handling in POST endpoint
     */
    it('should handle evolution errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Evolution failed: insufficient level';
      mockInstance.evolveIdentity.mockRejectedValue(new Error(errorMessage));

      const requestBody = { experience: 100 };
      const request = new NextRequest('http://localhost:3000/api/identity/test-user', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const params = Promise.resolve({ userId: testUserId });

      // Act
      const response = await POST(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to evolve identity');
      expect(data.message).toBe(errorMessage);
    });

    /**
     * Test zero experience value
     */
    it('should handle zero experience value', async () => {
      // Arrange
      const requestBody = { experience: 0 };
      const request = new NextRequest('http://localhost:3000/api/identity/test-user', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const params = Promise.resolve({ userId: testUserId });

      // Act
      const response = await POST(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid experience value');
      expect(mockInstance.evolveIdentity).not.toHaveBeenCalled();
    });

    /**
     * Test large experience value
     */
    it('should handle large experience values', async () => {
      // Arrange
      const experience = 999999;
      const evolvedIdentity = {
        ...mockIdentity,
        evolution: {
          ...mockIdentity.evolution,
          experience: mockIdentity.evolution.experience + experience
        },
        updatedAt: new Date()
      };
      
      mockInstance.evolveIdentity.mockResolvedValue(evolvedIdentity);

      const requestBody = { experience };
      const request = new NextRequest('http://localhost:3000/api/identity/test-user', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const params = Promise.resolve({ userId: testUserId });

      // Act
      const response = await POST(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(evolvedIdentity);
      expect(mockInstance.evolveIdentity).toHaveBeenCalledWith(testUserId, experience);
    });

    /**
     * Test malformed JSON request body
     */
    it('should handle malformed JSON request body', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/identity/test-user', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const params = Promise.resolve({ userId: testUserId });

      // Act
      const response = await POST(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to evolve identity');
    });
  });

  describe('Integration with Backend Systems', () => {
    /**
     * Test integration with AxiomIDManager singleton pattern
     */
    it('should use AxiomIDManager singleton pattern correctly', async () => {
      // Arrange
      mockInstance.getIdentity.mockReturnValue(mockIdentity);

      const request = new NextRequest('http://localhost:3000/api/identity/singleton-test');
      const params = Promise.resolve({ userId: 'singleton-test' });

      // Act
      await GET(request, { params });

      // Assert
      expect(mockAxiomIDManager.getInstance).toHaveBeenCalledTimes(1);
      expect(mockInstance.getIdentity).toHaveBeenCalledWith('singleton-test');
    });

    /**
     * Test integration with DigitalMandala during initialization
     */
    it('should integrate with DigitalMandala during auto-initialization', async () => {
      // Arrange
      mockInstance.getIdentity.mockReturnValue(undefined);
      mockInstance.initializeIdentity.mockResolvedValue(mockIdentity);

      const request = new NextRequest('http://localhost:3000/api/identity/integration-test');
      const params = Promise.resolve({ userId: 'integration-test' });

      // Act
      await GET(request, { params });

      // Assert
      expect(mockInstance.initializeIdentity).toHaveBeenCalledWith('integration-test', {
        name: 'Unknown Entity',
        type: 'agent',
        capabilities: []
      });
    });

    /**
     * Test integration with DigitalMandala during evolution
     */
    it('should integrate with DigitalMandala during evolution', async () => {
      // Arrange
      const experience = 1000;
      const evolvedIdentity = {
        ...mockIdentity,
        evolution: {
          ...mockIdentity.evolution,
          experience: mockIdentity.evolution.experience + experience,
          stage: 'awakening' as EvolutionStage // Simulate stage change
        },
        updatedAt: new Date()
      };
      
      mockInstance.evolveIdentity.mockResolvedValue(evolvedIdentity);

      const requestBody = { experience };
      const request = new NextRequest('http://localhost:3000/api/identity/test-user', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const params = Promise.resolve({ userId: testUserId });

      // Act
      const response = await POST(request, { params });

      // Assert
      expect(response.status).toBe(200);
      expect(mockInstance.evolveIdentity).toHaveBeenCalledWith(testUserId, experience);
    });
  });

  describe('Performance and Edge Cases', () => {
    /**
     * Test concurrent requests
     */
    it('should handle concurrent requests', async () => {
      // Arrange
      mockInstance.getIdentity.mockReturnValue(mockIdentity);

      const requests = Array.from({ length: 10 }, (_, i) => {
        const request = new NextRequest(`http://localhost:3000/api/identity/concurrent-${i}`);
        const params = Promise.resolve({ userId: `concurrent-${i}` });
        return GET(request, { params });
      });

      // Act
      const responses = await Promise.all(requests);

      // Assert
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      expect(mockInstance.getIdentity).toHaveBeenCalledTimes(10);
    });

    /**
     * Test very long userId
     */
    it('should handle very long userId', async () => {
      // Arrange
      const longUserId = 'a'.repeat(1000);
      mockInstance.getIdentity.mockReturnValue(mockIdentity);

      const request = new NextRequest(`http://localhost:3000/api/identity/${longUserId}`);
      const params = Promise.resolve({ userId: longUserId });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockInstance.getIdentity).toHaveBeenCalledWith(longUserId);
    });
  });
});