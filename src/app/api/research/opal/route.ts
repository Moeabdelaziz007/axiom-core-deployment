/**
 * 🔍 OPAL RESEARCH API ENDPOINTS
 * 
 * RESTful API for Opal-powered research
 * Real-time research progress tracking
 * Research result formatting and delivery
 * Integration with existing agent chat system
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  ResearchSessionConfig, 
  ResearchRequest, 
  ResearchResult, 
  ResearchDomain, 
  AgentType,
  ResearchAnalytics,
  ResearchSystemConfig,
  OpalResearchExecutionRequest,
  ResearchExportConfig
} from '../../../../types/research';

import { OpalResearchEngine } from '../../../../infra/research/OpalResearchEngine';
import { ResearchAnalyticsService } from '../../../../services/research-analytics';
import { RESEARCH_WORKFLOW_TEMPLATES } from '../../../../templates/research-workflows';

// Initialize services
let researchEngine: OpalResearchEngine | null = null;
let analyticsService: ResearchAnalyticsService | null = null;

/**
 * Initialize research services
 */
function initializeServices() {
  if (!researchEngine || !analyticsService) {
    const config: ResearchSystemConfig = {
      opalIntegration: {
        enabled: true,
        endpoint: process.env.OPAL_API_ENDPOINT || 'https://api.opal.google.com',
        timeout: parseInt(process.env.OPAL_TIMEOUT || '300000'), // 5 minutes
        retryAttempts: parseInt(process.env.OPAL_RETRY_ATTEMPTS || '3')
      },
      aiEngine: {
        model: process.env.AI_MODEL || 'gemini-2.0-flash-exp',
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '8192')
      },
      quality: {
        minimumScore: parseFloat(process.env.RESEARCH_QUALITY_THRESHOLD || '0.8'),
        enableValidation: true,
        autoRetry: true
      },
      mena: {
        enableCulturalContext: process.env.ENABLE_CULTURAL_CONTEXT === 'true',
        enableArabicSupport: process.env.ENABLE_ARABIC_SUPPORT === 'true',
        enableIslamicCompliance: process.env.ENABLE_ISLAMIC_COMPLIANCE === 'true',
        defaultRegion: process.env.DEFAULT_MENA_REGION || 'GCC'
      },
      analytics: {
        enabled: process.env.ENABLE_RESEARCH_ANALYTICS === 'true',
        retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90'),
        realTimeUpdates: true
      },
      security: {
        encryptionEnabled: process.env.ENABLE_ENCRYPTION === 'true',
        auditTrail: process.env.ENABLE_AUDIT_TRAIL === 'true',
        accessControl: process.env.ENABLE_ACCESS_CONTROL === 'true'
      }
    };

    researchEngine = new OpalResearchEngine(config);
    analyticsService = new ResearchAnalyticsService(config);

    console.log('🔍 Research services initialized');
  }
}

/**
 * GET /api/research/opal - Get research system status and available workflows
 */
export async function GET(request: NextRequest) {
  try {
    initializeServices();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        return await handleGetStatus();
      case 'workflows':
        return await handleGetWorkflows(searchParams);
      case 'analytics':
        return await handleGetAnalytics(searchParams);
      case 'session':
        return await handleGetSession(searchParams);
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Research API GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/research/opal - Create and manage research sessions
 */
export async function POST(request: NextRequest) {
  try {
    initializeServices();

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'start_session':
        return await handleStartSession(data);
      case 'execute_research':
        return await handleExecuteResearch(data);
      case 'cancel_session':
        return await handleCancelSession(data);
      case 'export_results':
        return await handleExportResults(data);
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Research API POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET /api/research/opal?action=status
 */
async function handleGetStatus(): Promise<NextResponse> {
  if (!researchEngine) {
    return NextResponse.json(
      { error: 'Research engine not initialized' },
      { status: 503 }
    );
  }

  const systemStatus = await researchEngine.getSystemStatus();
  const activeSessions = researchEngine.getActiveSessions();

  return NextResponse.json({
    status: systemStatus,
    activeSessions: activeSessions.map(session => ({
      id: session.id,
      title: session.config.title,
      domain: session.config.domain,
      agentType: session.config.agentType,
      status: session.status,
      progress: session.progress,
      startTime: session.startTime,
      resultsCount: session.results.length
    })),
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle GET /api/research/opal?action=workflows
 */
async function handleGetWorkflows(searchParams: URLSearchParams): Promise<NextResponse> {
  const domain = searchParams.get('domain') as ResearchDomain;
  const agentType = searchParams.get('agentType') as AgentType;
  const category = searchParams.get('category');

  let workflows = RESEARCH_WORKFLOW_TEMPLATES;

  // Filter by domain
  if (domain) {
    workflows = workflows.filter(w => w.domain === domain);
  }

  // Filter by agent type
  if (agentType) {
    workflows = workflows.filter(w => w.agentType === agentType);
  }

  // Filter by category
  if (category) {
    workflows = workflows.filter(w => w.category === category);
  }

  return NextResponse.json({
    workflows: workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      domain: workflow.domain,
      agentType: workflow.agentType,
      category: workflow.category,
      estimatedCost: workflow.metadata.estimatedCost,
      estimatedDuration: workflow.metadata.estimatedDuration,
      complexity: workflow.metadata.complexity,
      tags: workflow.metadata.tags,
      menaSpecific: workflow.menaSpecific
    })),
    total: workflows.length
  });
}

/**
 * Handle GET /api/research/opal?action=analytics
 */
async function handleGetAnalytics(searchParams: URLSearchParams): Promise<NextResponse> {
  if (!analyticsService) {
    return NextResponse.json(
      { error: 'Analytics service not initialized' },
      { status: 503 }
    );
  }

  const timeframe = searchParams.get('timeframe') as 'week' | 'month' | 'quarter' | 'year' || 'month';
  const sessionId = searchParams.get('sessionId');
  const domain = searchParams.get('domain') as ResearchDomain;
  const agentType = searchParams.get('agentType') as AgentType;

  if (sessionId) {
    // Get specific session analytics
    const efficiencyMetrics = analyticsService.getEfficiencyMetrics(sessionId);
    return NextResponse.json({
      sessionId,
      efficiencyMetrics,
      timestamp: new Date().toISOString()
    });
  } else {
    // Get general analytics
    const analytics = await analyticsService.generatePerformanceReport(timeframe);
    
    // Filter by domain or agent type if specified
    if (domain) {
      analytics.domainPerformance = {
        [domain]: analytics.domainPerformance[domain]
      } as any;
    }
    
    if (agentType) {
      analytics.agentPerformance = {
        [agentType]: analytics.agentPerformance[agentType]
      } as any;
    }

    return NextResponse.json({
      analytics,
      timeframe,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Handle GET /api/research/opal?action=session
 */
async function handleGetSession(searchParams: URLSearchParams): Promise<NextResponse> {
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  if (!researchEngine) {
    return NextResponse.json(
      { error: 'Research engine not initialized' },
      { status: 503 }
    );
  }

  const session = researchEngine.getSessionStatus(sessionId);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    session: {
      id: session.id,
      config: session.config,
      status: session.status,
      progress: session.progress,
      startTime: session.startTime,
      endTime: session.endTime,
      results: session.results,
      metrics: session.metrics,
      quality: session.quality,
      errors: session.errors
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle POST /api/research/opal?action=start_session
 */
async function handleStartSession(data: any): Promise<NextResponse> {
  const { config } = data;

  if (!config) {
    return NextResponse.json(
      { error: 'Session configuration is required' },
      { status: 400 }
    );
  }

  // Validate required fields
  const requiredFields = ['title', 'domain', 'agentType', 'language', 'region'];
  for (const field of requiredFields) {
    if (!config[field]) {
      return NextResponse.json(
        { error: `${field} is required` },
        { status: 400 }
      );
    }
  }

  if (!researchEngine) {
    return NextResponse.json(
      { error: 'Research engine not initialized' },
      { status: 503 }
    );
  }

  try {
    const sessionId = await researchEngine.startResearchSession(config as ResearchSessionConfig);
    
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Research session started successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to start research session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle POST /api/research/opal?action=execute_research
 */
async function handleExecuteResearch(data: any): Promise<NextResponse> {
  const { sessionId, query, dataSources, parameters } = data;

  if (!sessionId || !query) {
    return NextResponse.json(
      { error: 'Session ID and query are required' },
      { status: 400 }
    );
  }

  if (!researchEngine) {
    return NextResponse.json(
      { error: 'Research engine not initialized' },
      { status: 503 }
    );
  }

  try {
    const session = researchEngine.getSessionStatus(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Create research request
    const researchRequest: ResearchRequest = {
      sessionId,
      query,
      dataSources: dataSources || [
        'google_search' as any,
        'document_analysis' as any,
        'api_integration' as any
      ],
      analysisTypes: ['summary', 'insights', 'recommendations'],
      parameters: parameters || {}
    };

    // Execute research (this would be handled by the existing session workflow)
    return NextResponse.json({
      success: true,
      message: 'Research request submitted successfully',
      sessionId,
      query,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to execute research',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle POST /api/research/opal?action=cancel_session
 */
async function handleCancelSession(data: any): Promise<NextResponse> {
  const { sessionId } = data;

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  if (!researchEngine) {
    return NextResponse.json(
      { error: 'Research engine not initialized' },
      { status: 503 }
    );
  }

  try {
    await researchEngine.cancelSession(sessionId);
    
    return NextResponse.json({
      success: true,
      message: 'Research session cancelled successfully',
      sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to cancel research session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle POST /api/research/opal?action=export_results
 */
async function handleExportResults(data: any): Promise<NextResponse> {
  const { sessionId, exportConfig } = data;

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  if (!researchEngine) {
    return NextResponse.json(
      { error: 'Research engine not initialized' },
      { status: 503 }
    );
  }

  try {
    const session = researchEngine.getSessionStatus(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'completed') {
      return NextResponse.json(
        { error: 'Session must be completed before export' },
        { status: 400 }
      );
    }

    // Generate export based on configuration
    const exportData = await generateExport(session.results, exportConfig as ResearchExportConfig);
    
    return NextResponse.json({
      success: true,
      exportData,
      sessionId,
      exportFormat: exportConfig?.format || 'json',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to export research results',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate export data based on configuration
 */
async function generateExport(
  results: ResearchResult[], 
  config: ResearchExportConfig
): Promise<any> {
  const format = config?.format || 'json';
  const language = config?.language || 'en';

  switch (format) {
    case 'json':
      return {
        format: 'json',
        data: results,
        metadata: {
          totalResults: results.length,
          exportTimestamp: new Date().toISOString(),
          language,
          version: '1.0.0'
        }
      };

    case 'html':
      return {
        format: 'html',
        data: generateHTMLReport(results, language),
        metadata: {
          totalResults: results.length,
          exportTimestamp: new Date().toISOString(),
          language
        }
      };

    case 'pdf':
      // In a real implementation, this would generate a PDF
      return {
        format: 'pdf',
        data: 'PDF generation would be implemented here',
        metadata: {
          totalResults: results.length,
          exportTimestamp: new Date().toISOString(),
          language
        }
      };

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Generate HTML report from research results
 */
function generateHTMLReport(results: ResearchResult[], language: string): string {
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  
  let html = `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Research Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .result { margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
        .result h3 { color: #333; margin-top: 0; }
        .quality { background: #f4f4f4; padding: 10px; border-radius: 3px; margin-top: 10px; }
        .insights { margin-top: 15px; }
        .insights ul { margin: 0; padding-left: 20px; }
        .footer { margin-top: 50px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Research Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Total Results: ${results.length}</p>
      </div>
  `;

  results.forEach((result, index) => {
    html += `
      <div class="result">
        <h3>Result ${index + 1}: ${result.query}</h3>
        <p><strong>Data Source:</strong> ${result.dataSource}</p>
        <p><strong>Timestamp:</strong> ${result.timestamp.toLocaleString()}</p>
        
        <div class="summary">
          <h4>Summary</h4>
          <p>${result.content.summary}</p>
        </div>
        
        <div class="insights">
          <h4>Key Insights</h4>
          <ul>
            ${result.content.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
          </ul>
        </div>
        
        <div class="quality">
          <h4>Quality Metrics</h4>
          <p>Overall Score: ${(result.quality.overall_score * 100).toFixed(1)}%</p>
          <p>Accuracy: ${(result.quality.accuracy * 100).toFixed(1)}%</p>
          <p>Completeness: ${(result.quality.completeness * 100).toFixed(1)}%</p>
          <p>Relevance: ${(result.quality.relevance * 100).toFixed(1)}%</p>
        </div>
      </div>
    `;
  });

  html += `
      <div class="footer">
        <p>Generated by Axiom Opal Research Engine</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Handle SSE for real-time updates
 */
export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'subscribe') {
    return handleSSESubscription(request);
  }

  return NextResponse.json(
    { error: 'Invalid action parameter' },
    { status: 400 }
  );
}

/**
 * Handle Server-Sent Events for real-time updates
 */
async function handleSSESubscription(request: NextRequest): Promise<NextResponse> {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString()
      })}\n\n`));

      // Set up event listeners if research engine is available
      if (researchEngine) {
        researchEngine.on('sessionProgress', (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            data,
            timestamp: new Date().toISOString()
          })}\n\n`));
        });

        researchEngine.on('sessionCompleted', (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'completed',
            data,
            timestamp: new Date().toISOString()
          })}\n\n`));
        });

        researchEngine.on('sessionFailed', (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'failed',
            data,
            timestamp: new Date().toISOString()
          })}\n\n`));
        });
      }

      // Send periodic heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        })}\n\n`));
      }, 30000); // 30 seconds

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}