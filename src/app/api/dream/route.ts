import { NextRequest, NextResponse } from 'next/server';

// LangGraph event types for agent thinking states
export interface LangGraphEvent {
  type: 'AGENT_THINKING' | 'AGENT_COMPLETED' | 'AGENT_ERROR' | 'WORKFLOW_STARTED' | 'WORKFLOW_COMPLETED';
  agentId: string;
  agentType: 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra';
  timestamp: number;
  data: {
    thought?: string;
    progress?: number;
    result?: any;
    error?: string;
    metadata?: Record<string, any>;
  };
}

// Agent configuration for NeuralWorkspace
const AGENT_CONFIG = {
  dreamer: {
    name: 'Dreamer',
    color: '#8B5CF6', // Purple
    icon: '🌟',
    description: 'Creative ideation and vision planning'
  },
  analyst: {
    name: 'Analyst',
    color: '#06B6D4', // Cyan
    icon: '📊',
    description: 'Data analysis and pattern recognition'
  },
  judge: {
    name: 'Judge',
    color: '#EF4444', // Red
    icon: '⚖️',
    description: 'Decision making and conflict resolution'
  },
  builder: {
    name: 'Builder',
    color: '#F97316', // Orange
    icon: '🔨',
    description: 'System architecture and implementation'
  },
  tajer: {
    name: 'Tajer',
    color: '#8B5CF6',
    icon: '🤝',
    description: 'Business negotiation and deal analysis'
  },
  aqar: {
    name: 'Aqar',
    color: '#06B6D4',
    icon: '🏢',
    description: 'Property valuation and market analysis'
  },
  mawid: {
    name: 'Mawid',
    color: '#10B981',
    icon: '📅',
    description: 'Appointment scheduling and resource optimization'
  },
  sofra: {
    name: 'Sofra',
    color: '#F59E0B',
    icon: '🍽',
    description: 'Customer experience and quality audit'
  }
};

// Mock LangGraph event generator for demonstration
function generateMockEvent(): LangGraphEvent {
  const agentTypes = Object.keys(AGENT_CONFIG) as Array<keyof typeof AGENT_CONFIG>;
  const eventTypes: LangGraphEvent['type'][] = ['AGENT_THINKING', 'AGENT_COMPLETED', 'AGENT_ERROR', 'WORKFLOW_STARTED', 'WORKFLOW_COMPLETED'];
  
  const randomAgent = agentTypes[Math.floor(Math.random() * agentTypes.length)];
  const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  
  return {
    type: randomEventType,
    agentId: `${randomAgent}-${Math.floor(Math.random() * 1000)}`,
    agentType: randomAgent as LangGraphEvent['agentType'],
    timestamp: Date.now(),
    data: {
      thought: randomEventType === 'AGENT_THINKING' ? `Processing complex ${randomAgent} task...` : undefined,
      progress: randomEventType === 'AGENT_THINKING' ? Math.floor(Math.random() * 100) : undefined,
      result: randomEventType === 'AGENT_COMPLETED' ? { status: 'success', output: 'Task completed successfully' } : undefined,
      error: randomEventType === 'AGENT_ERROR' ? 'Processing timeout occurred' : undefined,
      metadata: {
        workflowId: `workflow-${Math.floor(Math.random() * 100)}`,
        priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)]
      }
    }
  };
}

// SSE endpoint for real-time LangGraph events
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      console.log('🧠 SSE Connection established for NeuralWorkspace');
      
      // Send initial connection event
      const initEvent = {
        type: 'CONNECTION_ESTABLISHED',
        timestamp: Date.now(),
        data: {
          message: 'Connected to Neural Workspace',
          agents: Object.keys(AGENT_CONFIG),
          agentConfig: AGENT_CONFIG
        }
      };
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initEvent)}\n\n`));
      
      // Simulate real-time events
      const eventInterval = setInterval(() => {
        try {
          const event = generateMockEvent();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch (error) {
          console.error('Error generating SSE event:', error);
        }
      }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
      
      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        console.log('🧠 SSE Connection closed');
        clearInterval(eventInterval);
        controller.close();
      });
      
      // Auto-cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(eventInterval);
        controller.close();
      }, 5 * 60 * 1000);
    },
    
    cancel() {
      console.log('🧠 SSE Stream cancelled');
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Handle POST requests for triggering specific agent actions
export async function POST(request: NextRequest) {
  try {
    const { agentId, action, parameters } = await request.json();
    
    if (!agentId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, action' },
        { status: 400 }
      );
    }
    
    // Log the action for demonstration
    console.log(`🧠 Agent action triggered: ${agentId} -> ${action}`, parameters);
    
    // In a real implementation, this would trigger actual LangGraph workflows
    const response = {
      success: true,
      agentId,
      action,
      status: 'TRIGGERED',
      timestamp: Date.now(),
      message: `Action ${action} triggered for agent ${agentId}`
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Dream API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}