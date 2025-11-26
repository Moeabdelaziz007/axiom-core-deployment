/**
 * 🔋 AXIOM ENERGY GRID - Resource Management API
 * 
 * REST API endpoints for managing agent resources, quotas,
 * cost tracking, and optimization across the Axiom ecosystem.
 * 
 * Endpoints:
 * - GET /api/resources - Get resource metrics for agent
 * - POST /api/resources/allocate - Allocate resources
 * - GET /api/resources/quota - Get quota information
 * - GET /api/resources/cost - Get cost tracking
 * - GET /api/resources/recommendations - Get optimization recommendations
 * - POST /api/resources/share - Share resources with other agents
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { resourceManager } from '@/infra/core/ResourceManager';
import { resourceIntegration } from '@/infra/core/ResourceIntegration';
import { ResourceType, RESOURCE_TYPES } from '@/types/agentResources';

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const action = searchParams.get('action');

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'metrics':
        return await getResourceMetrics(agentId);
      case 'quota':
        return await getResourceQuota(agentId);
      case 'cost':
        return await getCostTracking(agentId);
      case 'recommendations':
        return await getRecommendations(agentId);
      case 'sharing':
        return await getSharingPools(agentId);
      case 'performance':
        return await getPerformanceAnalysis(agentId);
      case 'scaling':
        return await getScalingConfiguration(agentId);
      default:
        return await getResourceMetrics(agentId);
    }
  } catch (error) {
    console.error('Resource API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, action } = body;

    if (!agentId || !action) {
      return NextResponse.json(
        { error: 'Agent ID and action are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'allocate':
        return await allocateResources(body);
      case 'share':
        return await shareResources(body);
      case 'purchase':
        return await purchaseFromMarketplace(body);
      case 'optimize':
        return await runOptimization(body);
      case 'scale':
        return await executeScaling(body);
      case 'update-config':
        return await updateConfiguration(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Resource API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// RESOURCE METRICS ENDPOINT
// ============================================================================

async function getResourceMetrics(agentId: string): Promise<NextResponse> {
  try {
    const metrics = await resourceManager.getResourceMetrics(agentId);
    return NextResponse.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get resource metrics', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// RESOURCE QUOTA ENDPOINT
// ============================================================================

async function getResourceQuota(agentId: string): Promise<NextResponse> {
  try {
    const quota = await resourceManager.getAgentQuota(agentId);
    return NextResponse.json({
      success: true,
      data: quota
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get resource quota', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// COST TRACKING ENDPOINT
// ============================================================================

async function getCostTracking(agentId: string): Promise<NextResponse> {
  try {
    const costTracking = await resourceManager.getAgentCostTracking(agentId);
    return NextResponse.json({
      success: true,
      data: costTracking
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get cost tracking', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// RECOMMENDATIONS ENDPOINT
// ============================================================================

async function getRecommendations(agentId: string): Promise<NextResponse> {
  try {
    const recommendations = await resourceIntegration.getResourcePerformanceRecommendations(agentId);
    return NextResponse.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get recommendations', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// SHARING POOLS ENDPOINT
// ============================================================================

async function getSharingPools(agentId: string): Promise<NextResponse> {
  try {
    const sharingPools = resourceIntegration.getSharingPools(agentId);
    return NextResponse.json({
      success: true,
      data: sharingPools
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get sharing pools', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// PERFORMANCE ANALYSIS ENDPOINT
// ============================================================================

async function getPerformanceAnalysis(agentId: string): Promise<NextResponse> {
  try {
    const analysis = await resourceManager.analyzePerformance(agentId);
    return NextResponse.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get performance analysis', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// SCALING CONFIGURATION ENDPOINT
// ============================================================================

async function getScalingConfiguration(agentId: string): Promise<NextResponse> {
  try {
    const scaling = await resourceManager.getResourceScaling(agentId);
    return NextResponse.json({
      success: true,
      data: scaling
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get scaling configuration', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// RESOURCE ALLOCATION ENDPOINT
// ============================================================================

async function allocateResources(body: any): Promise<NextResponse> {
  try {
    const { agentId, resourceType, amount, taskId } = body;

    if (!resourceType || !amount) {
      return NextResponse.json(
        { error: 'Resource type and amount are required' },
        { status: 400 }
      );
    }

    // Validate resource type
    if (!RESOURCE_TYPES.includes(resourceType as ResourceType)) {
      return NextResponse.json(
        { error: 'Invalid resource type' },
        { status: 400 }
      );
    }

    const allocation = await resourceManager.allocateResource(
      agentId,
      resourceType,
      amount,
      taskId
    );

    return NextResponse.json({
      success: true,
      data: allocation
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to allocate resources', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// RESOURCE SHARING ENDPOINT
// ============================================================================

async function shareResources(body: any): Promise<NextResponse> {
  try {
    const { agentId, resourceType, amount, targetAgentId } = body;

    if (!resourceType || !amount || !targetAgentId) {
      return NextResponse.json(
        { error: 'Resource type, amount, and target agent ID are required' },
        { status: 400 }
      );
    }

    await resourceIntegration.shareResources(
      agentId,
      resourceType,
      amount,
      targetAgentId
    );

    return NextResponse.json({
      success: true,
      message: 'Resources shared successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to share resources', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// MARKETPLACE PURCHASE ENDPOINT
// ============================================================================

async function purchaseFromMarketplace(body: any): Promise<NextResponse> {
  try {
    const { agentId, listingId, amount } = body;

    if (!listingId || !amount) {
      return NextResponse.json(
        { error: 'Listing ID and amount are required' },
        { status: 400 }
      );
    }

    const allocation = await resourceIntegration.purchaseFromMarketplace(
      agentId,
      listingId,
      amount
    );

    return NextResponse.json({
      success: true,
      data: allocation
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to purchase from marketplace', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIMIZATION ENDPOINT
// ============================================================================

async function runOptimization(body: any): Promise<NextResponse> {
  try {
    const { agentId, autoExecute = false } = body;

    if (autoExecute) {
      await resourceIntegration.runAutoOptimization(agentId);
    } else {
      const recommendations = await resourceIntegration.getResourcePerformanceRecommendations(agentId);
      return NextResponse.json({
        success: true,
        data: recommendations
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Optimization completed successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to run optimization', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// SCALING ENDPOINT
// ============================================================================

async function executeScaling(body: any): Promise<NextResponse> {
  try {
    const { agentId } = body;

    await resourceManager.executeScaling(agentId);

    return NextResponse.json({
      success: true,
      message: 'Scaling executed successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute scaling', details: error },
      { status: 500 }
    );
  }
}

// ============================================================================
// CONFIGURATION UPDATE ENDPOINT
// ============================================================================

async function updateConfiguration(body: any): Promise<NextResponse> {
  try {
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration is required' },
        { status: 400 }
      );
    }

    resourceIntegration.updateConfig(config);

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      data: resourceIntegration.getConfig()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update configuration', details: error },
      { status: 500 }
    );
  }
}