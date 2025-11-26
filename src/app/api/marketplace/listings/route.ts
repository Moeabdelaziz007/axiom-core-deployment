/**
 * 🏪 MARKETPLACE LISTINGS API
 * 
 * API endpoints for marketplace agent listings, search, and filtering
 * Integrates with AgentMarketplaceEngine for data operations
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MarketplaceAgent, MarketplaceSearchFilters, SearchSorting } from '@/types/marketplace';
import AgentMarketplaceEngine from '@/infra/core/AgentMarketplaceEngine';

// Initialize marketplace engine
const marketplaceEngine = new AgentMarketplaceEngine({} as any, {} as any);

// Validation schemas
const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  category: z.enum(['business', 'creative', 'technical', 'analytical', 'communication', 'security', 'education', 'entertainment']).optional(),
  subcategories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  pricing: z.object({
    model: z.array(z.enum(['free', 'subscription', 'pay-per-use', 'one-time', 'hybrid'])).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    currency: z.enum(['SOL', 'USDC', 'AXIOM']).optional()
  }).optional(),
  rating: z.object({
    min: z.number().min(0).max(5).optional(),
    max: z.number().min(0).max(5).optional()
  }).optional(),
  features: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  developer: z.string().optional(),
  verified: z.boolean().optional(),
  featured: z.boolean().optional(),
  availability: z.array(z.enum(['available', 'busy', 'maintenance', 'deprecated'])).optional(),
  performance: z.object({
    minSuccessRate: z.number().min(0).max(100).optional(),
    maxResponseTime: z.number().min(0).optional(),
    minUptime: z.number().min(0).max(100).optional()
  }).optional(),
  deployment: z.object({
    type: z.array(z.enum(['cloud', 'edge', 'on-premise', 'hybrid'])).optional(),
    platforms: z.array(z.string()).optional()
  }).optional(),
  sorting: z.enum(['relevance', 'rating-desc', 'rating-asc', 'price-desc', 'price-asc', 'popularity-desc', 'popularity-asc', 'newest', 'oldest', 'name-asc', 'name-desc']).optional(),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20)
  }).optional()
});

const AgentIdSchema = z.object({
  id: z.string().min(1)
});

/**
 * GET /api/marketplace/listings
 * Search and filter marketplace agents
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate and parse filters
    const filtersResult = SearchFiltersSchema.safeParse(queryParams);
    if (!filtersResult.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: filtersResult.error },
        { status: 400 }
      );
    }
    
    const filters: MarketplaceSearchFilters = filtersResult.data || {};
    
    // Apply default pagination if not provided
    if (!filters.pagination) {
      filters.pagination = { page: 1, limit: 20 };
    }
    
    // Search agents
    const results = await marketplaceEngine.searchAgents(filters);
    
    // Return results with pagination metadata
    return NextResponse.json({
      success: true,
      data: {
        agents: results.agents,
        pagination: {
          page: results.page,
          limit: results.limit,
          total: results.total,
          totalPages: results.totalPages,
          hasNext: results.page < results.totalPages,
          hasPrev: results.page > 1
        },
        facets: results.facets,
        suggestions: results.suggestions
      }
    });
    
  } catch (error) {
    console.error('Marketplace search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/listings
 * Create new agent listing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate agent data
    const agentData = {
      name: body.name,
      description: body.description,
      category: body.category,
      subcategory: body.subcategory,
      tags: body.tags || [],
      capabilities: body.capabilities || [],
      superpowers: body.superpowers || [],
      pricing: body.pricing,
      availability: body.availability,
      deploymentOptions: body.deploymentOptions || [],
      developer: body.developer
    };
    
    // Register agent in marketplace
    const agent = await marketplaceEngine.registerAgent(agentData);
    
    return NextResponse.json({
      success: true,
      data: agent
    }, { status: 201 });
    
  } catch (error) {
    console.error('Agent registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/marketplace/listings
 * Update existing agent listing
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }
    
    // Update agent
    const updatedAgent = await marketplaceEngine.updateAgent(id, updates);
    
    if (!updatedAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedAgent
    });
    
  } catch (error) {
    console.error('Agent update error:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplace/listings/[id]
 * Get specific agent details
 */
export async function getAgentById(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }
    
    // Get agent details
    const agent = marketplaceEngine.getAgent(id);
    
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: agent
    });
    
  } catch (error) {
    console.error('Get agent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketplace/listings/[id]
 * Remove agent listing
 */
export async function deleteAgent(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would:
    // 1. Verify ownership/permissions
    // 2. Check for active deployments
    // 3. Handle cleanup of related resources
    // 4. Process refunds if applicable
    
    return NextResponse.json({
      success: true,
      message: 'Agent listing removed successfully'
    });
    
  } catch (error) {
    console.error('Agent deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to remove agent' },
      { status: 500 }
    );
  }
}