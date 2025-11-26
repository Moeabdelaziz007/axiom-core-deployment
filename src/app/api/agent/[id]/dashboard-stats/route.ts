/**
 * 🎯 AGENT DASHBOARD STATS API
 * 
 * Comprehensive dashboard API that aggregates data from multiple sources:
 * - Agent status from Durable Objects
 * - Skills and experience from D1 Database
 * - Recent transactions from Solana history
 * - Performance metrics from monitoring system
 * 
 * This is the "Super-Endpoint" that provides all dashboard data in one call
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for agent ID
const AgentIdSchema = z.object({
  id: z.string().min(1, 'Agent ID is required')
});

/**
 * GET - Comprehensive dashboard stats for a specific agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate agent ID
    const { id: agentId } = AgentIdSchema.parse(await params);

    // Parallel data fetching from multiple sources
    const [
      agentStatus,
      agentSkills,
      recentTransactions,
      performanceMetrics,
      systemHealth
    ] = await Promise.allSettled([
      getAgentStatus(agentId),
      getAgentSkills(agentId),
      getRecentTransactions(agentId),
      getPerformanceMetrics(agentId),
      getSystemHealth()
    ]);

    // Aggregate the data
    const dashboardData = {
      agent: {
        id: agentId,
        status: agentStatus.status === 'fulfilled' ? agentStatus.value : null,
        skills: agentSkills.status === 'fulfilled' ? agentSkills.value : null,
        transactions: recentTransactions.status === 'fulfilled' ? recentTransactions.value : null,
        performance: performanceMetrics.status === 'fulfilled' ? performanceMetrics.value : null
      },
      system: systemHealth.status === 'fulfilled' ? systemHealth.value : null,
      lastUpdated: new Date().toISOString(),
      errors: [
        agentStatus.status === 'rejected' ? agentStatus.reason : null,
        agentSkills.status === 'rejected' ? agentSkills.reason : null,
        recentTransactions.status === 'rejected' ? recentTransactions.reason : null,
        performanceMetrics.status === 'rejected' ? performanceMetrics.reason : null,
        systemHealth.status === 'rejected' ? systemHealth.reason : null
      ].filter(Boolean)
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

/**
 * Get agent status from Fleet Monitor Durable Object
 */
async function getAgentStatus(agentId: string) {
  try {
    // In production, this would call the Fleet Monitor Durable Object
    const fleetMonitorUrl = process.env.FLEET_MONITOR_URL || 'https://fleet-monitor-production.amrikyy.workers.dev';

    const response = await fetch(`${fleetMonitorUrl}/health`);
    if (!response.ok) {
      throw new Error(`Fleet Monitor error: ${response.status}`);
    }

    const fleetData = await response.json();

    // Find the specific agent
    const agent = fleetData.agents?.find((a: any) => a.id === agentId);

    if (!agent) {
      throw new Error(`Agent ${agentId} not found in fleet monitor`);
    }

    return {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      health: agent.health,
      cpu: agent.cpu,
      status: agent.status,
      lastUpdate: agent.lastUpdate,
      activeConnections: agent.activeConnections,
      tasksProcessed: agent.tasksProcessed,
      responseTime: agent.responseTime,
      predictionStatus: agent.predictionStatus,
      predictionColor: agent.predictionColor
    };

  } catch (error) {
    console.error('Error fetching agent status:', error);
    throw error;
  }
}

/**
 * Get agent skills and experience from D1 Database
 */
async function getAgentSkills(agentId: string) {
  try {
    // In production, this would query the D1 database
    // For now, return mock data that matches the expected structure

    // Mock D1 query for agent stats
    const agentStats = {
      level: 5,
      experience: 2500,
      skillPoints: 15,
      energy: 85,
      reputation: 92
    };

    // Mock D1 query for agent skills
    const agentSkills = [
      {
        id: 'neural_learning',
        name: 'Neural Learning',
        level: 3,
        mastery: 75,
        unlocked: true,
        category: 'cognitive'
      },
      {
        id: 'api_connector',
        name: 'API Connector',
        level: 2,
        mastery: 60,
        unlocked: true,
        category: 'technical'
      },
      {
        id: 'quantum_analysis',
        name: 'Quantum Analysis',
        level: 0,
        mastery: 0,
        unlocked: false,
        category: 'cognitive',
        requirements: {
          level: 8,
          skillPoints: 50,
          prerequisites: ['neural_learning', 'memory_palace']
        }
      }
    ];

    return {
      stats: agentStats,
      skills: agentSkills,
      availableSkills: 12,
      masteredSkills: 2
    };

  } catch (error) {
    console.error('Error fetching agent skills:', error);
    throw error;
  }
}

/**
 * Get recent transactions from Solana history
 */
async function getRecentTransactions(agentId: string) {
  try {
    // In production, this would query Solana transaction history
    // For now, return mock data

    const transactions = [
      {
        id: 'tx_1',
        type: 'task_completion',
        amount: 0.05,
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        status: 'confirmed',
        description: 'Completed customer service task'
      },
      {
        id: 'tx_2',
        type: 'skill_purchase',
        amount: -0.10,
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        status: 'confirmed',
        description: 'Purchased API Connector skill'
      },
      {
        id: 'tx_3',
        type: 'reward',
        amount: 0.15,
        timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        status: 'confirmed',
        description: 'Performance bonus for high satisfaction rating'
      }
    ];

    return {
      transactions: transactions.slice(0, 10), // Last 10 transactions
      totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      successRate: 100
    };

  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Get performance metrics from monitoring system
 */
async function getPerformanceMetrics(agentId: string) {
  try {
    // In production, this would query the performance metrics system
    // For now, return mock data

    const metrics = {
      overview: {
        overallScore: 87,
        efficiency: 92,
        reliability: 85,
        quality: 90,
        scalability: 78,
        costEffectiveness: 88
      },
      trends: {
        cpu: 'stable',
        memory: 'decreasing',
        responseTime: 'improving',
        successRate: 'stable'
      },
      alerts: [
        {
          type: 'warning',
          message: 'Memory usage trending upward',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ],
      recommendations: [
        {
          category: 'performance',
          priority: 'medium',
          title: 'Optimize memory usage',
          description: 'Consider implementing memory pooling to reduce allocation overhead',
          expectedImprovement: 15
        }
      ]
    };

    return metrics;

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    throw error;
  }
}

/**
 * Get overall system health status
 */
async function getSystemHealth() {
  try {
    // In production, this would aggregate health from all systems
    return {
      status: 'healthy',
      components: {
        database: 'healthy',
        blockchain: 'healthy',
        fleetMonitor: 'healthy',
        performanceSystem: 'healthy'
      },
      uptime: '99.9%',
      lastRestart: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
      version: '1.0.0'
    };

  } catch (error) {
    console.error('Error fetching system health:', error);
    throw error;
  }
}