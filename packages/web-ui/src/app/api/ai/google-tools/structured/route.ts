import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredData } from '@/lib/ai-engine';
import { z } from 'zod';

// Zod schemas for validation
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

// Structured data endpoint handler
export async function POST(req: NextRequest) {
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

// GET handler for documentation
export async function GET() {
  return NextResponse.json({
    name: "Google Structured Data API",
    version: "1.0.0",
    description: "Generate structured data using custom schemas",
    endpoint: "/api/ai/google-tools/structured",
    method: "POST",
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
  });
}