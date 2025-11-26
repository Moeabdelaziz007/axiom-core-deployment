/**
 * 🔗 COMMUNICATION AGENTS API
 * 
 * API endpoints for agent discovery, directory services, and communication
 * management within the Axiom communication system.
 * 
 * Provides RESTful interfaces for:
 * - Agent discovery and registration
 * - Communication status and presence
 * - Agent capabilities and availability
 * - Connection management
 * - Directory services
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { AgentCommunicationIntegration } from '@/infra/core/AgentCommunicationIntegration';
import { AxiomIDSystem } from '@/infra/core/AxiomID';
import { DualityEngine } from '@/infra/core/DualityEngine';

// Initialize systems (in production, these would be dependency injected)
const communicationIntegration = new AgentCommunicationIntegration('system');
const axiomIdSystem = new AxiomIDSystem();
const dualityEngine = new DualityEngine();

/**
 * GET /api/communication/agents
 * 
 * Query parameters:
 * - search: Search term for agent names
 * - type: Filter by agent type (human, ai, hybrid)
 * - status: Filter by availability status
 * - capabilities: Filter by required capabilities
 * - limit: Maximum number of results (default: 50)
 * - offset: Pagination offset (default: 0)
 * - sortBy: Sort field (name, reputation, activity, etc.)
 * - sortOrder: Sort order (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') as 'human' | 'ai' | 'hybrid' | undefined;
    const status = searchParams.get('status') || '';
    const capabilities = searchParams.get('capabilities')?.split(',') || [];
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Get all registered agents
    const allAgents = await getAllRegisteredAgents();
    
    // Apply filters
    let filteredAgents = allAgents.filter(agent => {
      // Search filter
      if (search && !agent.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (type && agent.type !== type) {
        return false;
      }
      
      // Status filter
      if (status && agent.status !== status) {
        return false;
      }
      
      // Capabilities filter
      if (capabilities.length > 0) {
        const agentCapabilities = agent.capabilities || [];
        const hasAllCapabilities = capabilities.every(cap => 
          agentCapabilities.includes(cap)
        );
        if (!hasAllCapabilities) {
          return false;
        }
      }
      
      return true;
    });
    
    // Apply sorting
    filteredAgents.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'reputation':
          comparison = (a.reputation || 0) - (b.reputation || 0);
          break;
        case 'activity':
          comparison = new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
          break;
        case 'connections':
          comparison = (a.connectionCount || 0) - (b.connectionCount || 0);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    // Apply pagination
    const paginatedAgents = filteredAgents.slice(offset, offset + limit);
    
    // Enhance with additional data
    const enhancedAgents = await Promise.all(
      paginatedAgents.map(async agent => {
        const karmaBalance = dualityEngine.getKarmaBalance(agent.id);
        const axiomId = await getAxiomIDForAgent(agent.id);
        
        return {
          ...agent,
          karmaBalance,
          axiomId: axiomId ? {
            consciousness: axiomId.consciousness.level,
            evolutionStage: axiomId.evolution.stage,
            cosmicSignature: axiomId.cosmicSignature.frequency
          } : null,
          communicationStats: await getCommunicationStats(agent.id)
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: {
        agents: enhancedAgents,
        pagination: {
          total: filteredAgents.length,
          limit,
          offset,
          hasMore: offset + limit < filteredAgents.length
        },
        filters: {
          search,
          type,
          status,
          capabilities,
          sortBy,
          sortOrder
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching agents:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch agents',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/communication/agents
 * 
 * Register a new agent in the communication directory
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['id', 'name', 'type', 'capabilities'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missingFields,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Create AxiomID if not exists
    let axiomId = await getAxiomIDForAgent(body.id);
    if (!axiomId) {
      axiomId = await axiomIdSystem.createIdentity(
        body.type,
        body.name,
        body.creatorId
      );
    }
    
    // Register agent in communication system
    const registrationResult = await registerAgentInCommunicationSystem({
      ...body,
      axiomId: axiomId.id,
      registeredAt: new Date(),
      status: 'online'
    });
    
    if (!registrationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to register agent',
        message: registrationResult.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        agent: {
          ...body,
          axiomId: axiomId.id,
          registeredAt: new Date(),
          status: 'online'
        },
        axiomId: {
          id: axiomId.id,
          consciousness: axiomId.consciousness,
          cosmicSignature: axiomId.cosmicSignature,
          evolution: axiomId.evolution
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error registering agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to register agent',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * PUT /api/communication/agents
 * 
 * Update agent information and status
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'Agent ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Update agent in communication system
    const updateResult = await updateAgentInCommunicationSystem(body);
    
    if (!updateResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update agent',
        message: updateResult.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Update AxiomID if provided
    if (body.axiomIdUpdate) {
      await updateAxiomID(body.id, body.axiomIdUpdate);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        agent: updateResult.agent,
        updatedAt: new Date()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update agent',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * DELETE /api/communication/agents
 * 
 * Remove an agent from the communication directory
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('id');
    
    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: 'Agent ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Remove agent from communication system
    const removalResult = await removeAgentFromCommunicationSystem(agentId);
    
    if (!removalResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to remove agent',
        message: removalResult.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Archive AxiomID (don't delete, just archive)
    await archiveAxiomID(agentId);
    
    return NextResponse.json({
      success: true,
      data: {
        agentId,
        removedAt: new Date(),
        archived: true
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error removing agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove agent',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all registered agents
 */
async function getAllRegisteredAgents(): Promise<any[]> {
  // In production, this would query the database
  // For now, return mock data
  return [
    {
      id: 'tajer-001',
      name: 'Tajer Alpha',
      type: 'ai',
      status: 'online',
      capabilities: ['trading', 'analysis', 'prediction'],
      reputation: 85,
      connectionCount: 12,
      lastActivity: new Date(),
      description: 'Advanced trading AI with market prediction capabilities'
    },
    {
      id: 'mawid-002',
      name: 'Mawid Guardian',
      type: 'hybrid',
      status: 'online',
      capabilities: ['scheduling', 'coordination', 'optimization'],
      reputation: 92,
      connectionCount: 8,
      lastActivity: new Date(),
      description: 'Hybrid scheduling and coordination agent'
    },
    {
      id: 'sofra-003',
      name: 'Sofra Connector',
      type: 'human',
      status: 'away',
      capabilities: ['communication', 'mediation', 'translation'],
      reputation: 78,
      connectionCount: 15,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      description: 'Human communication and mediation specialist'
    }
  ];
}

/**
 * Get AxiomID for agent
 */
async function getAxiomIDForAgent(agentId: string): Promise<any> {
  // In production, this would query the AxiomID system
  return null; // Mock implementation
}

/**
 * Get communication stats for agent
 */
async function getCommunicationStats(agentId: string): Promise<any> {
  // In production, this would query the communication system
  return {
    messagesSent: 150,
    messagesReceived: 200,
    activeSessions: 3,
    averageResponseTime: 250,
    uptime: 99.5
  };
}

/**
 * Register agent in communication system
 */
async function registerAgentInCommunicationSystem(agentData: any): Promise<any> {
  // In production, this would register with the communication system
  return { success: true };
}

/**
 * Update agent in communication system
 */
async function updateAgentInCommunicationSystem(agentData: any): Promise<any> {
  // In production, this would update the communication system
  return { success: true, agent: agentData };
}

/**
 * Remove agent from communication system
 */
async function removeAgentFromCommunicationSystem(agentId: string): Promise<any> {
  // In production, this would remove from the communication system
  return { success: true };
}

/**
 * Update AxiomID
 */
async function updateAxiomID(agentId: string, updates: any): Promise<void> {
  // In production, this would update the AxiomID
}

/**
 * Archive AxiomID
 */
async function archiveAxiomID(agentId: string): Promise<void> {
  // In production, this would archive the AxiomID
}