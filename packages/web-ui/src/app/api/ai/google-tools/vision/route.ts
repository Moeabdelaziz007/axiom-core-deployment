import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/ai-engine';
import { z } from 'zod';

// Zod schema for validation
const visionRequestSchema = z.object({
  imageUrl: z.string().url("Invalid URL format"),
  analysisType: z.enum(["general", "menu", "real-estate"]).optional().default("general"),
  agent: z.enum(["sofra", "tajer", "general"]).optional()
});

// Vision endpoint handler
export async function POST(req: NextRequest) {
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

// GET handler for documentation
export async function GET() {
  return NextResponse.json({
    name: "Google Vision API",
    version: "1.0.0",
    description: "Analyze images using Google Gemini Vision",
    endpoint: "/api/ai/google-tools/vision",
    method: "POST",
    parameters: {
      imageUrl: "string (URL) - Image to analyze",
      analysisType: "string - general, menu, or real-estate (default: general)",
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
  });
}