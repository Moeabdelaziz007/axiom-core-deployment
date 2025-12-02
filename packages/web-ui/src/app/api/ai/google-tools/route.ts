import { NextRequest, NextResponse } from 'next/server';
import {
  researchWithGoogle,
  analyzeImage,
  generateStructuredData
} from '@/lib/ai-engine';
import { z } from 'zod';

// Zod schemas for validation
const visionRequestSchema = z.object({
  imageUrl: z.string().url("Invalid URL format"),
  analysisType: z.enum(["general", "menu", "real-estate"]).optional().default("general"),
  agent: z.enum(["sofra", "tajer", "general"]).optional()
});

const searchRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
  language: z.enum(["en", "ar"]).optional().default("en"),
  location: z.string().optional(),
  agent: z.enum(["sofra", "tajer", "general"]).optional()
});

const structuredRequestSchema = z.object({
  input: z.string().min(1, "Input cannot be empty"),
  schema: z.object({
    description: z.string(),
    type: z.enum(["OBJECT", "ARRAY", "STRING", "NUMBER", "BOOLEAN"]),
    properties: z.record(z.string(), z.any()).optional()
  }),
  language: z.enum(["en", "ar"]).optional().default("en"),
  agent: z.enum(["sofra", "tajer", "general"]).optional()
});

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
    
    // Validate request body
    const validatedData = visionRequestSchema.parse(body);

    let prompt = "";

    switch (validatedData.analysisType) {
      case "menu":
        prompt = `Analyze this restaurant menu image and extract:
1. All menu items with their prices in the local currency
2. Categories and sections
3. Special offers or deals
4. Dietary information if available
5. Restaurant name and location if visible

Format the response as structured JSON with items array containing name, price, category, and description fields.`;
        break;
      case "real-estate":
        prompt = `Analyze this real estate image and provide:
1. Property type (apartment, villa, commercial, etc.)
2. Estimated size and room count
3. Condition and quality assessment
4. Location features if visible
5. Estimated price range in local currency
6. Key features and amenities

Format as structured JSON with property details.`;
        break;
      default:
        prompt = `Analyze this image and provide a detailed description including:
1. Main objects and subjects
2. Context and setting
3. Text content if any
4. Relevant details for business or analysis purposes
5. Quality assessment

Provide response in both English and Arabic if relevant to MENA region.`;
    }

    const result = await analyzeImage(validatedData.imageUrl, prompt);

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: 'Vision analysis failed',
        details: result.error,
        endpoint: '/api/ai/google-tools/vision',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      endpoint: '/api/ai/google-tools/vision',
      request: {
        imageUrl: validatedData.imageUrl,
        analysisType: validatedData.analysisType,
        agent: validatedData.agent
      },
      result: {
        analysis: result.response,
        analysisType: validatedData.analysisType,
        agent: validatedData.agent
      },
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.issues,
        endpoint: '/api/ai/google-tools/vision'
      }, { status: 400 });
    }

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

// Structured data endpoint handler
async function handleStructuredRequest(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = structuredRequestSchema.parse(body);

    // Convert the schema to a Zod schema for generateStructuredData
    let zodSchema: z.ZodSchema<any>;
    
    try {
      // Create a dynamic Zod schema based on the input
      const schemaObj: Record<string, z.ZodTypeAny> = {};
      
      if (validatedData.schema.properties) {
        Object.entries(validatedData.schema.properties).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const type = (value as any).type;
            switch (type) {
              case 'STRING':
                schemaObj[key] = z.string();
                break;
              case 'NUMBER':
                schemaObj[key] = z.number();
                break;
              case 'BOOLEAN':
                schemaObj[key] = z.boolean();
                break;
              case 'ARRAY':
                schemaObj[key] = z.array(z.any());
                break;
              case 'OBJECT':
                schemaObj[key] = z.record(z.string(), z.any());
                break;
              default:
                schemaObj[key] = z.any();
            }
          } else {
            schemaObj[key] = z.any();
          }
        });
      }
      
      zodSchema = z.object(schemaObj);
    } catch (schemaError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid schema format',
        details: schemaError instanceof Error ? schemaError.message : 'Unknown schema error',
        endpoint: '/api/ai/google-tools/structured'
      }, { status: 400 });
    }

    const prompt = `${validatedData.schema.description}

Input Data: ${validatedData.input}

Please generate structured data following the provided schema.
Ensure all required fields are populated and data is accurate and relevant to the input.
${validatedData.language === 'ar' ? 'الرجاء الاستجابة باللغة العربية.' : 'Please respond in English.'}`;

    const result = await generateStructuredData(prompt, zodSchema);

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: 'Structured data generation failed',
        details: result.error,
        endpoint: '/api/ai/google-tools/structured',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      endpoint: '/api/ai/google-tools/structured',
      request: {
        input: validatedData.input,
        schema: validatedData.schema,
        language: validatedData.language,
        agent: validatedData.agent
      },
      result: {
        data: result.data,
        agent: validatedData.agent
      },
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.issues,
        endpoint: '/api/ai/google-tools/structured'
      }, { status: 400 });
    }

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