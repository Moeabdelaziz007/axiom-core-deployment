/**
 * 📨 AGENT COMMUNICATION MESSAGES API
 * 
 * API endpoints for agent message handling:
 * - Send messages between agents
 * - Broadcast messages to multiple agents
 * - Get message history
 * - Mark messages as read
 * - Handle message delivery confirmations
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AgentCommunicationSystem } from '../../../../infra/core/AgentCommunicationSystem';
import { RealtimeCommunicationSystem } from '../../../../infra/core/RealtimeCommunicationSystem';
import { AgentSuperpowersFramework } from '../../../../infra/core/AgentSuperpowersFramework';
import { AgentCollaborationSystem } from '../../../../infra/core/AgentCollaborationSystem';
import { AgentMarketplaceEngine } from '../../../../infra/core/AgentMarketplaceEngine';

// Initialize communication systems (in production, these would be injected)
const agentFramework = new AgentSuperpowersFramework('system');
const collaborationSystem = new AgentCollaborationSystem(agentFramework);
const marketplaceEngine = new AgentMarketplaceEngine(agentFramework, collaborationSystem);
const communicationSystem = new AgentCommunicationSystem(agentFramework, collaborationSystem, marketplaceEngine);
const realtimeSystem = new RealtimeCommunicationSystem();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SendMessageSchema = z.object({
  senderId: z.string().min(1),
  recipientId: z.union([z.string().min(1), z.array(z.string().min(1))]),
  type: z.enum(['text', 'file', 'task', 'result', 'knowledge', 'system', 'heartbeat', 'discovery', 'handshake', 'error', 'status', 'collaboration', 'marketplace', 'performance', 'security', 'voice', 'video', 'typing', 'read_receipt', 'presence']),
  content: z.any(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'critical', 'emergency']).optional(),
  options: z.object({
    format: z.string().optional(),
    compression: z.any().optional(),
    routingStrategy: z.enum(['shortest_path', 'least_cost', 'fastest_delivery', 'most_reliable', 'load_balanced', 'priority_based', 'security_first', 'adaptive']).optional(),
    messageTTL: z.number().optional(),
    encrypted: z.boolean().optional()
  }).optional()
});

const BroadcastMessageSchema = z.object({
  senderId: z.string().min(1),
  recipients: z.array(z.string().min(1)).min(1),
  type: z.enum(['text', 'file', 'task', 'result', 'knowledge', 'system', 'heartbeat', 'discovery', 'handshake', 'error', 'status', 'collaboration', 'marketplace', 'performance', 'security', 'voice', 'video', 'typing', 'read_receipt', 'presence']),
  content: z.any(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'critical', 'emergency']).optional(),
  options: z.object({
    format: z.string().optional(),
    compression: z.any().optional(),
    routingStrategy: z.enum(['shortest_path', 'least_cost', 'fastest_delivery', 'most_reliable', 'load_balanced', 'priority_based', 'security_first', 'adaptive']).optional(),
    messageTTL: z.number().optional(),
    encrypted: z.boolean().optional()
  }).optional()
});

const GetMessageHistorySchema = z.object({
  agentId: z.string().min(1),
  sessionId: z.string().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  messageType: z.enum(['text', 'file', 'task', 'result', 'knowledge', 'system', 'heartbeat', 'discovery', 'handshake', 'error', 'status', 'collaboration', 'marketplace', 'performance', 'security', 'voice', 'video', 'typing', 'read_receipt', 'presence']).optional()
});

const MarkAsReadSchema = z.object({
  messageId: z.string().min(1),
  agentId: z.string().min(1),
  readAt: z.string().datetime().optional()
});

const GetDeliveryStatusSchema = z.object({
  messageId: z.string().min(1),
  agentId: z.string().min(1)
});

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /api/communication/messages
 * Get message history for an agent
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const sessionId = searchParams.get('sessionId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const messageType = searchParams.get('messageType');

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Validate query parameters
    const validation = GetMessageHistorySchema.safeParse({
      agentId,
      sessionId,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      startDate,
      endDate,
      messageType
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: validation.error },
        { status: 400 }
      );
    }

    // Get message history from communication system
    const messages = await communicationSystem.getMessageHistory(
      validation.data.agentId,
      {
        sessionId: validation.data.sessionId,
        limit: validation.data.limit,
        offset: validation.data.offset,
        startDate: validation.data.startDate ? new Date(validation.data.startDate) : undefined,
        endDate: validation.data.endDate ? new Date(validation.data.endDate) : undefined,
        messageType: validation.data.messageType
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        messages,
        total: messages.length,
        agentId: validation.data.agentId,
        filters: {
          sessionId: validation.data.sessionId,
          messageType: validation.data.messageType,
          dateRange: {
            start: validation.data.startDate,
            end: validation.data.endDate
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Get message history error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communication/messages/send
 * Send message to agent or broadcast to multiple agents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body for single message
    const singleMessageValidation = SendMessageSchema.safeParse(body);
    if (singleMessageValidation.success) {
      const result = await communicationSystem.sendMessage(
        singleMessageValidation.data.senderId,
        singleMessageValidation.data.recipientId,
        singleMessageValidation.data.type,
        singleMessageValidation.data.content,
        singleMessageValidation.data.options
      );

      return NextResponse.json({
        success: result.success,
        data: {
          messageId: result.messageId,
          timestamp: result.timestamp,
          estimatedDelivery: result.estimatedDelivery,
          priority: singleMessageValidation.data.options?.priority || 'normal'
        },
        error: result.error
      });
    }

    // Validate request body for broadcast message
    const broadcastValidation = BroadcastMessageSchema.safeParse(body);
    if (broadcastValidation.success) {
      const result = await communicationSystem.broadcastMessage(
        broadcastValidation.data.senderId,
        broadcastValidation.data.recipients,
        broadcastValidation.data.type,
        broadcastValidation.data.content,
        broadcastValidation.data.options
      );

      return NextResponse.json({
        success: result.success,
        data: {
          totalRecipients: result.totalRecipients,
          successCount: result.successCount,
          failureCount: result.failureCount,
          results: result.results,
          timestamp: result.timestamp,
          priority: broadcastValidation.data.options?.priority || 'normal'
        },
        error: result.error
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request format' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Send message error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communication/messages/read
 * Mark message as read
 */
export async function READ(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = MarkAsReadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters', details: validation.error },
        { status: 400 }
      );
    }

    const result = await communicationSystem.markAsRead(
      validation.data.messageId,
      validation.data.agentId,
      validation.data.readAt ? new Date(validation.data.readAt) : new Date()
    );

    return NextResponse.json({
      success: result.success,
      data: {
        messageId: validation.data.messageId,
        agentId: validation.data.agentId,
        readAt: result.readAt,
        confirmed: result.confirmed
      },
      error: result.error
    });

  } catch (error) {
    console.error('❌ Mark as read error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/communication/messages/delivery/:messageId
 * Get delivery status for a specific message
 */
export async function GET_DELIVERY(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const { messageId } = await params;
    const validation = GetDeliveryStatusSchema.safeParse({
      messageId,
      agentId
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', details: validation.error },
        { status: 400 }
      );
    }

    const status = await communicationSystem.getDeliveryStatus(
      validation.data.messageId,
      validation.data.agentId
    );

    return NextResponse.json({
      success: true,
      data: {
        messageId: validation.data.messageId,
        agentId: validation.data.agentId,
        status: status.status,
        attempts: status.attempts,
        lastAttempt: status.lastAttempt,
        deliveredAt: status.deliveredAt,
        readAt: status.readAt,
        acknowledged: status.acknowledged,
        trace: status.trace,
        error: status.error
      }
    });

  } catch (error) {
    console.error('❌ Get delivery status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/communication/messages/:messageId
 * Delete a message
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<any> }) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const { messageId } = await params;
    const result = await communicationSystem.deleteMessage(
      messageId,
      agentId
    );

    return NextResponse.json({
      success: result.success,
      data: {
        messageId: params.messageId,
        agentId,
        deletedAt: result.deletedAt
      },
      error: result.error
    });

  } catch (error) {
    console.error('❌ Delete message error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/communication/messages/queue/:agentId
 * Get message queue for an agent
 */
export async function GET_QUEUE(request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');
    const limit = searchParams.get('limit');

    const { agentId } = await params;
    const queue = await communicationSystem.getMessageQueue(
      agentId,
      {
        priority: priority as any,
        limit: limit ? parseInt(limit) : undefined
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        agentId,
        queue,
        total: queue.length,
        filters: {
          priority
        }
      }
    });

  } catch (error) {
    console.error('❌ Get message queue error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communication/messages/priority
 * Send priority message
 */
export async function POST_PRIORITY(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = SendMessageSchema.safeParse(body);

    if (!validation.success || !validation.data.options?.priority) {
      return NextResponse.json(
        { success: false, error: 'Priority message requires priority parameter' },
        { status: 400 }
      );
    }

    const result = await communicationSystem.sendPriorityMessage(
      validation.data.senderId,
      validation.data.recipientId,
      validation.data.type,
      validation.data.content,
      validation.data.options.priority
    );

    return NextResponse.json({
      success: result.success,
      data: {
        messageId: result.messageId,
        timestamp: result.timestamp,
        estimatedDelivery: result.estimatedDelivery,
        priority: validation.data.options.priority,
        queuePosition: result.queuePosition
      },
      error: result.error
    });

  } catch (error) {
    console.error('❌ Send priority message error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/communication/messages/search
 * Search messages
 */
export async function GET_SEARCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const query = searchParams.get('query');
    const messageType = searchParams.get('messageType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (!agentId || !query) {
      return NextResponse.json(
        { success: false, error: 'Agent ID and query are required' },
        { status: 400 }
      );
    }

    const results = await communicationSystem.searchMessages(
      agentId,
      query,
      {
        messageType: messageType as any,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        query,
        agentId,
        results: results.messages,
        total: results.total,
        filters: {
          messageType,
          dateRange: {
            start: startDate,
            end: endDate
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Search messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/communication/messages/stats/:agentId
 * Get message statistics for an agent
 */
export async function GET_STATS(request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // day, week, month, year
    const messageType = searchParams.get('messageType');

    const { agentId } = await params;
    const stats = await communicationSystem.getMessageStats(
      agentId,
      {
        period: period as any,
        messageType: messageType as any
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        agentId,
        period,
        stats,
        filters: {
          messageType
        }
      }
    });

  } catch (error) {
    console.error('❌ Get message stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}