/**
 * Axiom Gigafactory API Endpoint
 * Real-time agent creation with wallet minting and tool loading
 */

import { NextRequest, NextResponse } from 'next/server';
import { mintAgentIdentity } from '@/services/identity-service';
import { createSolanaPayLink } from '@/services/solana-tools';

// SSE event types for agent creation
export interface GigafactoryEvent {
  type: 'SOUL_INJECTION' | 'IDENTITY_MINTED' | 'TOOL_LOADING' | 'AGENT_READY' | 'CREATION_ERROR';
  agentId: string;
  agentType: 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra';
  timestamp: number;
  data: {
    message?: string;
    progress?: number;
    walletAddress?: string;
    tools?: string[];
    error?: string;
    metadata?: Record<string, any>;
  };
}

// Helper function to generate events
function generateGigafactoryEvent(type: GigafactoryEvent['type'], data: Partial<GigafactoryEvent>): GigafactoryEvent {
  return {
    type,
    agentId: data.agentId || `agent-${Date.now()}`,
    agentType: data.agentType || 'dreamer',
    timestamp: Date.now(),
    data: {
      message: data.message,
      progress: data.progress,
      walletAddress: data.walletAddress,
      tools: data.tools,
      error: data.error,
      metadata: data.metadata,
    },
  };
}

// Helper function to get tools based on agent type
function getAgentTools(agentType: string): string[] {
  const toolMap: Record<string, string[]> = {
    dreamer: ['solana_pay_link', 'google_search_grounding', 'fetch_prayer_times'],
    analyst: ['consult_saudi_labor', 'check_dubai_rent', 'fetch_regional_sentiment'],
    judge: ['analyze_menu_image', 'audit_listing'],
    builder: ['solana_transfer', 'solana_balance', 'inventory_check'],
    tajer: ['solana_pay_link', 'solana_transfer', 'inventory_check', 'fetch_prayer_times'],
    aqar: ['consult_saudi_labor', 'check_dubai_rent', 'calculate_saudi_market_value'],
    mawid: ['fetch_prayer_times', 'get_next_prayer', 'get_ramadan_schedule'],
    sofra: ['analyze_menu_image', 'fetch_prayer_times', 'get_islamic_calendar'],
  };
  
  return toolMap[agentType] || [];
}

// SSE endpoint for real-time agent creation
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      console.log('🏭 Gigafactory SSE Connection established');
      
      // Send initial connection event
      const initEvent = generateGigafactoryEvent('SOUL_INJECTION', {
        message: 'Connected to Axiom Gigafactory - Ready for agent creation',
        metadata: {
          availableAgentTypes: ['dreamer', 'analyst', 'judge', 'builder', 'tajer', 'aqar', 'mawid', 'sofra']
        }
      });
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initEvent)}\n\n`));
      
      // Simulate real-time events (in production, this would be replaced by actual LangGraph events)
      const eventInterval = setInterval(() => {
        const randomType = Math.random() > 0.7 ? 'SOUL_INJECTION' : 'IDENTITY_MINTED';
        const agentTypes: GigafactoryEvent['agentType'][] = ['dreamer', 'analyst', 'judge', 'builder', 'tajer', 'aqar', 'mawid', 'mawid', 'sofra'];
        const randomAgentType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
        
        const event = generateGigafactoryEvent(randomType, {
          agentId: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          agentType: randomAgentType,
          progress: randomType === 'SOUL_INJECTION' ? 25 : 
                  randomType === 'IDENTITY_MINTED' ? 75 : 
                  randomType === 'TOOL_LOADING' ? 90 : 100,
        });
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }, 3000 + Math.random() * 2000); // 3-5 seconds intervals
      
      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        console.log('🏭 Gigafactory SSE Connection closed');
        clearInterval(eventInterval);
        controller.close();
      });
      
      // Auto-cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(eventInterval);
        controller.close();
      }, 5 * 60 * 1000);
    },
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

// Handle POST requests for agent creation with real backend integration
export async function POST(request: NextRequest) {
  try {
    const { agentType, agentName, customizations } = await request.json();
    
    if (!agentType) {
      return NextResponse.json(
        { error: 'Missing required field: agentType' },
        { status: 400 }
      );
    }
    
    console.log(`🏭 Starting agent creation: ${agentType} - ${agentName}`);
    
    const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Return immediate response
    const response = {
      success: true,
      agentId,
      agentType,
      status: 'CREATION_STARTED',
      timestamp: Date.now(),
      message: `Agent creation started for ${agentType}`,
    };
    
    // Create the agent asynchronously
    createAgentWithBackend(agentId, agentType, agentName, customizations);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Gigafactory API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Real agent creation with backend integration
async function createAgentWithBackend(agentId: string, agentType: string, agentName?: string, customizations?: any) {
  try {
    // Step 1: Soul Injection (Matrix-style text rain)
    setTimeout(() => {
      const soulEvent = generateGigafactoryEvent('SOUL_INJECTION', {
        agentId,
        agentType,
        message: `Injecting soul into ${agentType} agent...`,
        progress: 25,
      });
      
      console.log('Soul injection event:', JSON.stringify(soulEvent, null, 2));
      // In production, this would be sent via SSE
    }, 1000);
    
    // Step 2: Identity Minting (HD wallet creation)
    setTimeout(async () => {
      try {
        console.log(`🏭 Creating identity for ${agentType} agent...`);
        
        const identityResult = await mintAgentIdentity(agentId, agentType);
        
        if (!identityResult.success) {
          const errorEvent = generateGigafactoryEvent('CREATION_ERROR', {
            agentId,
            agentType,
            error: identityResult.error,
          });
          
          console.error('Agent creation failed:', identityResult.error);
          return;
        }
        
        console.log(`✅ Identity created: ${identityResult.identity?.walletAddress}`);
        
        const identityEvent = generateGigafactoryEvent('IDENTITY_MINTED', {
          agentId,
          agentType,
          message: `Identity minted for ${agentType} agent`,
          progress: 75,
          walletAddress: identityResult.identity?.walletAddress,
        });
        
        console.log('Identity minted event:', JSON.stringify(identityEvent, null, 2));
        
        // Step 3: Tool Loading (based on agent type)
        setTimeout(() => {
          const agentTools = getAgentTools(agentType);
          
          const toolLoadingEvent = generateGigafactoryEvent('TOOL_LOADING', {
            agentId,
            agentType,
            message: `Loading tools for ${agentType} agent...`,
            progress: 90,
            tools: agentTools,
          });
          
          console.log('Tool loading event:', JSON.stringify(toolLoadingEvent, null, 2));
          
          // Simulate tool loading completion
          setTimeout(() => {
            const readyEvent = generateGigafactoryEvent('AGENT_READY', {
              agentId,
              agentType,
              message: `${agentType} agent is ready for deployment`,
              progress: 100,
              walletAddress: identityResult.identity?.walletAddress,
              tools: agentTools,
            });
            
            console.log('Agent ready event:', JSON.stringify(readyEvent, null, 2));
          }, 2000);
        }, 3000);
        
      } catch (error) {
        console.error('Identity creation error:', error);
        
        const errorEvent = generateGigafactoryEvent('CREATION_ERROR', {
          agentId,
          agentType,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        });
        
        console.error('Error event:', JSON.stringify(errorEvent, null, 2));
      }
    }, 3000);
    
  } catch (error) {
    console.error('Agent creation error:', error);
    
    const errorEvent = generateGigafactoryEvent('CREATION_ERROR', {
      agentId,
      agentType,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
    
    console.error('Error event:', JSON.stringify(errorEvent, null, 2));
  }
}