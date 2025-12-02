import { NextRequest, NextResponse } from 'next/server';
import { researchWithGoogle } from '@/lib/ai-engine';
import { z } from 'zod';

// Zod schema for validation
const searchRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
  language: z.enum(["en", "ar"]).optional().default("en"),
  location: z.string().optional(),
  agent: z.enum(["sofra", "tajer", "general"]).optional()
});

// Search endpoint handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = searchRequestSchema.parse(body);

    let enhancedQuery = validatedData.query;
    
    // Route to specific agent if specified
    if (validatedData.agent === 'tajer') {
      enhancedQuery = validatedData.location 
        ? `Real estate market research: ${validatedData.query} in ${validatedData.location}`
        : `Real estate market research: ${validatedData.query}`;
    }

    const result = await researchWithGoogle(enhancedQuery);

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: 'Search research failed',
        details: result.error,
        endpoint: '/api/ai/google-tools/search',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      endpoint: '/api/ai/google-tools/search',
      request: {
        query: validatedData.query,
        language: validatedData.language,
        location: validatedData.location,
        agent: validatedData.agent
      },
      result: {
        response: result.response,
        searchQueries: result.searchQueries,
        sources: result.sources,
        agent: validatedData.agent
      },
      timestamp: new Date().toISOString(),
      examples: {
        tajer_research: {
          description: "Real estate market research for Tajer agent",
          request: { 
            query: "أسعار العقارات في الرياض", 
            language: "ar", 
            location: "Riyadh", 
            agent: "tajer" 
          }
        },
        general_search: {
          description: "General market research with Google grounding",
          request: { 
            query: "MENA e-commerce trends 2024", 
            language: "en" 
          }
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.issues,
        endpoint: '/api/ai/google-tools/search'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Search research failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      endpoint: '/api/ai/google-tools/search',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET handler for documentation
export async function GET() {
  return NextResponse.json({
    name: "Google Search API",
    version: "1.0.0",
    description: "Research with Google grounding for real-time information",
    endpoint: "/api/ai/google-tools/search",
    method: "POST",
    parameters: {
      query: "string - Search query",
      language: "string - en or ar (default: en)",
      location: "string - Location context (optional)",
      agent: "string - sofra, tajer, or general (optional)"
    },
    examples: [
      {
        name: "Tajer Real Estate Research",
        request: {
          query: "أسعار الشقق في دبي",
          language: "ar",
          location: "Dubai",
          agent: "tajer"
        }
      },
      {
        name: "General Market Research",
        request: {
          query: "MENA fintech trends 2024",
          language: "en"
        }
      }
    ]
  });
}