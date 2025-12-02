import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agentBlueprints } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/marketplace/blueprints
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching agent blueprints from database...');

    // Fetch all active agent blueprints from database
    const blueprints = await db
      .select({
        id: agentBlueprints.id,
        name: agentBlueprints.name,
        role: agentBlueprints.role,
        description: agentBlueprints.description,
        priceMonthlyUsd: agentBlueprints.priceMonthlyUsd,
        capabilities: agentBlueprints.capabilities,
        imageUrl: agentBlueprints.imageUrl,
        modelProvider: agentBlueprints.modelProvider,
        modelName: agentBlueprints.modelName,
        temperature: agentBlueprints.temperature,
        tools: agentBlueprints.tools,
        systemPrompt: agentBlueprints.systemPrompt,
        isActive: agentBlueprints.isActive,
        createdAt: agentBlueprints.createdAt,
        updatedAt: agentBlueprints.updatedAt,
      })
      .from(agentBlueprints)
      .where(
        and(
          eq(agentBlueprints.isActive, true)
        )
      )
      .orderBy(agentBlueprints.createdAt);

    console.log(`✅ Found ${blueprints.length} active agent blueprints`);

    // Format response data
    const formattedBlueprints = blueprints.map(blueprint => ({
      ...blueprint,
      // Convert cents to dollars for display
      priceDisplay: `$${(blueprint.priceMonthlyUsd / 100).toFixed(2)}/mo`,
      // Parse JSON capabilities and tools
      capabilities: blueprint.capabilities ? JSON.parse(blueprint.capabilities) : {},
      tools: blueprint.tools ? JSON.parse(blueprint.tools) : [],
    }));

    return NextResponse.json({
      success: true,
      data: formattedBlueprints,
      count: formattedBlueprints.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error fetching agent blueprints:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent blueprints',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}