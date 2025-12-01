import { NextRequest, NextResponse } from 'next/server';
import {
  researchWithGoogle,
  analyzeImage,
  generateStructuredData,
  sofraMenuAnalysis,
  tajerRealEstateResearch
} from '@/lib/ai-engine';

// DEBUG: Add diagnostic logging
console.log('🔍 DEBUG: AI Engine imports loaded successfully');
console.log('🔍 DEBUG: researchWithGoogle function:', typeof researchWithGoogle);
console.log('🔍 DEBUG: analyzeImage function:', typeof analyzeImage);
console.log('🔍 DEBUG: generateStructuredData function:', typeof generateStructuredData);

// Manual validation functions
function validateVisionRequest(body: any) {
  const errors: string[] = [];
  
  if (!body.imageUrl || typeof body.imageUrl !== 'string') {
    errors.push("imageUrl is required and must be a string");
  } else {
    try {
      new URL(body.imageUrl);
    } catch {
      errors.push("imageUrl must be a valid URL");
    }
  }
  
  if (body.analysisType && !["general", "menu", "real-estate"].includes(body.analysisType)) {
    errors.push("analysisType must be one of: general, menu, real-estate");
  }
  
  if (body.agent && !["sofra", "tajer", "general"].includes(body.agent)) {
    errors.push("agent must be one of: sofra, tajer, general");
  }
  
  return { valid: errors.length === 0, errors };
}

function validateSearchRequest(body: any) {
  const errors: string[] = [];
  
  if (!body.query || typeof body.query !== 'string' || body.query.trim().length === 0) {
    errors.push("query is required and must be a non-empty string");
  }
  
  if (body.language && !["en", "ar"].includes(body.language)) {
    errors.push("language must be one of: en, ar");
  }
  
  if (body.agent && !["sofra", "tajer", "general"].includes(body.agent)) {
    errors.push("agent must be one of: sofra, tajer, general");
  }
  
  return { valid: errors.length === 0, errors };
}

function validateStructuredRequest(body: any) {
  const errors: string[] = [];
  
  if (!body.input || typeof body.input !== 'string' || body.input.trim().length === 0) {
    errors.push("input is required and must be a non-empty string");
  }
  
  if (!body.schema || typeof body.schema !== 'object') {
    errors.push("schema is required and must be an object");
  } else {
    if (!body.schema.description || typeof body.schema.description !== 'string') {
      errors.push("schema.description is required and must be a string");
    }
    
    if (!body.schema.type || !["OBJECT", "ARRAY", "STRING", "NUMBER", "BOOLEAN"].includes(body.schema.type)) {
      errors.push("schema.type must be one of: OBJECT, ARRAY, STRING, NUMBER, BOOLEAN");
    }
  }
  
  if (body.language && !["en", "ar"].includes(body.language)) {
    errors.push("language must be one of: en, ar");
  }
  
  if (body.agent && !["sofra", "tajer", "general"].includes(body.agent)) {
    errors.push("agent must be one of: sofra, tajer, general");
  }
  
  return { valid: errors.length === 0, errors };
}

// Main POST handler with routing
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Route to specific endpoints based on path
    if (pathname.endsWith('/vision')) {
      return handleVisionRequest(req);
    } else if (pathname.endsWith('/search')) {
      return handleSearchRequest(req);
    } else if (pathname.endsWith('/structured')) {
      return handleStructuredRequest(req);
    } else {
      // Main endpoint - determine action from request body
      const body = await req.json();
      const { action } = body;

      switch (action) {
        case 'vision':
          return handleVisionRequest(req);
        case 'search':
          return handleSearchRequest(req);
        case 'structured':
          return handleStructuredRequest(req);
        default:
          return NextResponse.json({
            success: false,
            error: 'Invalid action. Use: vision, search, or structured',
            available_endpoints: [
              'POST /api/ai/google-tools/vision',
              'POST /api/ai/google-tools/search', 
              'POST /api/ai/google-tools/structured'
            ]
          }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('Google Tools API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Vision endpoint handler
async function handleVisionRequest(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateVisionRequest(body);
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
        endpoint: '/api/ai/google-tools/vision'
      }, { status: 400 });
    }
    
    const validatedData = {
      imageUrl: body.imageUrl,
      analysisType: body.analysisType || "general",
      agent: body.agent
    };

    let result;
    
    // Route to specific agent if specified
    if (validatedData.agent === 'sofra' || validatedData.analysisType === 'menu') {
      result = await sofraMenuAnalysis(validatedData.imageUrl, {
        agent: 'sofra',
        requestTime: new Date().toISOString()
      });
    } else if (validatedData.agent === 'tajer' || validatedData.analysisType === 'real-estate') {
      result = await analyzeImage(validatedData.imageUrl, 'real-estate');
    } else {
      result = await analyzeImage(validatedData.imageUrl, validatedData.analysisType);
    }

    return NextResponse.json({
      success: true,
      endpoint: '/api/ai/google-tools/vision',
      request: {
        imageUrl: validatedData.imageUrl,
        analysisType: validatedData.analysisType,
        agent: validatedData.agent
      },
      result,
      timestamp: new Date().toISOString(),
      examples: {
        sofra_menu: {
          description: "Analyze restaurant menu for Sofra agent",
          request: { imageUrl: "https://example.com/menu.jpg", analysisType: "menu", agent: "sofra" }
        },
        tajer_property: {
          description: "Analyze property image for Tajer agent", 
          request: { imageUrl: "https://example.com/property.jpg", analysisType: "real-estate", agent: "tajer" }
        }
      }
    });
  } catch (error) {

    return NextResponse.json({
      success: false,
      error: 'Vision analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      endpoint: '/api/ai/google-tools/vision',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Search endpoint handler
async function handleSearchRequest(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateSearchRequest(body);
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
        endpoint: '/api/ai/google-tools/search'
      }, { status: 400 });
    }
    
    const validatedData = {
      query: body.query,
      language: body.language || "en",
      location: body.location,
      agent: body.agent
    };

    let result;
    
    // Route to specific agent if specified
    if (validatedData.agent === 'tajer') {
      const enhancedQuery = validatedData.location 
        ? `Real estate market research: ${validatedData.query} in ${validatedData.location}`
        : `Real estate market research: ${validatedData.query}`;
      
      result = await tajerRealEstateResearch(enhancedQuery, validatedData.location);
    } else {
      result = await researchWithGoogle(validatedData.query, validatedData.language);
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
      result,
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

    return NextResponse.json({
      success: false,
      error: 'Search research failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      endpoint: '/api/ai/google-tools/search',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Structured data endpoint handler
async function handleStructuredRequest(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateStructuredRequest(body);
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
        endpoint: '/api/ai/google-tools/structured'
      }, { status: 400 });
    }
    
    const validatedData = {
      input: body.input,
      schema: body.schema,
      language: body.language || "en",
      agent: body.agent
    };

    const result = await generateStructuredData(
      validatedData.input,
      validatedData.schema,
      validatedData.language
    );

    return NextResponse.json({
      success: true,
      endpoint: '/api/ai/google-tools/structured',
      request: {
        input: validatedData.input,
        schema: validatedData.schema,
        language: validatedData.language,
        agent: validatedData.agent
      },
      result,
      timestamp: new Date().toISOString(),
      examples: {
        menu_structuring: {
          description: "Structure menu data for Sofra agent",
          request: {
            input: "Restaurant menu with items and prices",
            schema: {
              description: "Structured menu data",
              type: "OBJECT",
              properties: {
                items: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      price: { type: "NUMBER" },
                      category: { type: "STRING" }
                    }
                  }
                }
              }
            },
            language: "en"
          }
        },
        property_analysis: {
          description: "Structure property data for Tajer agent",
          request: {
            input: "Property listing details and market analysis",
            schema: {
              description: "Real estate property data",
              type: "OBJECT",
              properties: {
                property: {
                  type: "OBJECT",
                  properties: {
                    type: { type: "STRING" },
                    price: { type: "NUMBER" },
                    location: { type: "STRING" }
                  }
                },
                market: {
                  type: "OBJECT",
                  properties: {
                    trend: { type: "STRING" },
                    roi: { type: "NUMBER" }
                  }
                }
              }
            },
            language: "ar"
          }
        }
      }
    });
  } catch (error) {

    return NextResponse.json({
      success: false,
      error: 'Structured data generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      endpoint: '/api/ai/google-tools/structured',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET handler for API documentation
export async function GET() {
  return NextResponse.json({
    name: "Google Tools API",
    version: "1.0.0",
    description: "AI-powered tools for vision analysis, search grounding, and structured data generation",
    endpoints: {
      "POST /api/ai/google-tools/vision": {
        description: "Analyze images using Google Gemini Vision",
        parameters: {
          imageUrl: "string (URL) - Image to analyze",
          analysisType: "string - general, menu, or real-estate",
          agent: "string - sofra, tajer, or general (optional)"
        },
        examples: [
          {
            name: "Sofra Menu Analysis",
            request: {
              imageUrl: "https://example.com/restaurant-menu.jpg",
              analysisType: "menu",
              agent: "sofra"
            }
          },
          {
            name: "Tajer Property Analysis", 
            request: {
              imageUrl: "https://example.com/property-photo.jpg",
              analysisType: "real-estate",
              agent: "tajer"
            }
          }
        ]
      },
      "POST /api/ai/google-tools/search": {
        description: "Research with Google grounding for real-time information",
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
      },
      "POST /api/ai/google-tools/structured": {
        description: "Generate structured data using custom schemas",
        parameters: {
          input: "string - Raw input data",
          schema: "object - JSON schema for output structure",
          language: "string - en or ar (default: en)",
          agent: "string - sofra, tajer, or general (optional)"
        },
        examples: [
          {
            name: "Menu Data Structuring",
            request: {
              input: "Extract menu items and prices from this text...",
              schema: {
                description: "Restaurant menu structure",
                type: "OBJECT",
                properties: {
                  restaurant: { type: "STRING" },
                  items: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        name: { type: "STRING" },
                        price: { type: "NUMBER" },
                        category: { type: "STRING" }
                      }
                    }
                  }
                }
              },
              language: "en"
            }
          }
        ]
      }
    },
    mena_agents: {
      sofra: {
        description: "Restaurant and menu analysis agent",
        capabilities: ["Menu price extraction", "Dietary information", "Restaurant insights"],
        primary_endpoints: ["/vision", "/structured"]
      },
      tajer: {
        description: "Real estate research and analysis agent", 
        capabilities: ["Property analysis", "Market research", "ROI calculations"],
        primary_endpoints: ["/vision", "/search", "/structured"]
      }
    },
    security: {
      authentication: "API key via GOOGLE_API_KEY environment variable",
      rate_limiting: "Configured at infrastructure level",
      data_privacy: "Images and queries processed securely"
    }
  });
}