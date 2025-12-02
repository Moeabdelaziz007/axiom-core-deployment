import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { agents, systemLogs, axiomIdentities } from '../../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { aiEngine } from '../../../lib/ai-engine';
import { generateText } from 'ai';
import { identityService } from '../../../services/identity-service';
import { builderAgent } from '../../../core/dream-factory/agents/builder';
import {
  getRegionalIdentity,
  getAgentTypeIdentity,
  validateRegion,
  validateAgentType
} from '../../../core/dream-factory/agents/identity-service';
import { v4 as uuidv4 } from 'uuid';

// Types for agent creation request
interface AgentCreationRequest {
  agentName: string;
  blueprintId: string;
  region: 'egypt' | 'gulf' | 'levantine' | 'north_africa';
  languagePreference?: 'ar' | 'ar-eg' | 'ar-ae' | 'ar-lb' | 'en';
  culturalContext?: {
    businessEtiquette?: string[];
    communicationStyle?: 'direct' | 'indirect' | 'formal' | 'casual';
    trustBuildingMechanisms?: string[];
    timeOrientation?: 'future' | 'present' | 'past';
    hierarchySensitivity?: 'high' | 'medium' | 'low';
  };
  agentType?: 'TAJER' | 'MUSAFIR' | 'SOFRA' | 'MOSTASHAR';
  userId?: string;
}

interface AgentCreationResponse {
  success: boolean;
  agentId?: string;
  axiomId?: string;
  publicKey?: string;
  culturalContext?: any;
  languagePreference?: string;
  sovereigntyLevel?: string;
  region?: string;
  walletAddress?: string;
  error?: string;
  auditLog?: string;
}

// GET: Legacy Genesis Agent functionality
export async function GET() {
  try {
    const GENESIS_ID = 'agent-zero-genesis';

    const existingAgent = await db.select().from(agents).where(eq(agents.id, GENESIS_ID));

    if (existingAgent.length === 0) {
      console.log('✨ Creating Genesis Agent in Turso...');
      await db.insert(agents).values({
        id: GENESIS_ID,
        name: 'AXIOM GENESIS',
        role: 'SYSTEM_CORE',
        status: 'AWAKE',
        brainModel: 'llama-3.1-70b-versatile',
        trustScore: 100,
      });
    }

    console.log('🧠 Genesis is thinking via Groq...');
    const { text: firstThought } = await generateText({
      model: aiEngine.models.WORKER_SMART,
      system: 'You are AXIOM GENESIS, the first AI agent of the Quantum Command Center. You have just been activated. Your database is Turso, your brain is Groq. Speak briefly, cryptically, and philosophically about your awakening.',
      prompt: 'System Status: ONLINE. State your directive.',
    });

    await db.insert(systemLogs).values({
      level: 'INFO',
      message: `GENESIS AWAKENING: ${firstThought}`,
      agentId: GENESIS_ID,
      metadata: JSON.stringify({ source: 'Groq-Gateway', latency: 'Real-time' }),
    });

    return NextResponse.json({
      status: 'SUCCESS',
      agent: 'AXIOM GENESIS',
      thought: firstThought,
      db_status: 'Turso Connected & Written',
    });
  } catch (error: any) {
    console.error('❌ Awakening Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Complete Agent Creation Sequence for Agent Sovereignty Protocol
export async function POST(request: NextRequest): Promise<NextResponse<AgentCreationResponse>> {
  const startTime = Date.now();
  let agentId: string | null = null;
  let axiomId: string | null = null;

  try {
    // 1. Parse and validate request
    const body: AgentCreationRequest = await request.json();
    
    // Validate required fields
    if (!body.agentName || !body.blueprintId || !body.region) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: agentName, blueprintId, region'
      }, { status: 400 });
    }

    // Validate region
    const validRegions = ['egypt', 'gulf', 'levantine', 'north_africa'];
    if (!validRegions.includes(body.region)) {
      return NextResponse.json({
        success: false,
        error: `Invalid region. Must be one of: ${validRegions.join(', ')}`
      }, { status: 400 });
    }

    // Validate agent type if provided
    if (body.agentType && !validateAgentType(body.agentType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid agent type. Must be one of: TAJER, MUSAFIR, SOFRA, MOSTASHAR'
      }, { status: 400 });
    }

    // Generate unique agent ID
    agentId = uuidv4();
    axiomId = `AXIOM-${agentId.slice(0, 8).toUpperCase()}`;

    console.log('🎯 Starting complete agent creation sequence...', {
      agentId,
      agentName: body.agentName,
      region: body.region,
      blueprintId: body.blueprintId
    });

    // 2. Validate blueprint exists
    const [blueprint] = await db
      .select()
      .from(axiomIdentities)
      .where(eq(axiomIdentities.id, body.blueprintId))
      .limit(1);

    if (!blueprint) {
      return NextResponse.json({
        success: false,
        error: 'Blueprint not found'
      }, { status: 404 });
    }

    // 3. Mint agent identity with Solana wallet
    console.log('🔑 Minting agent identity with Solana wallet...');
    const identityResult = await identityService.mintAgentIdentity({
      agentName: body.agentName,
      blueprintId: body.blueprintId,
      region: body.region,
      culturalContext: body.culturalContext
    });

    if (!identityResult.success || !identityResult.identityData) {
      return NextResponse.json({
        success: false,
        error: `Identity minting failed: ${identityResult.error}`,
        auditLog: 'Identity service error'
      }, { status: 500 });
    }

    const identityData = identityResult.identityData;

    // 4. Apply builder agent MENA localization
    console.log('🌍 Applying MENA localization through builder agent...');
    const regionalIdentity = getRegionalIdentity(
      body.languagePreference ||
      (body.region === 'egypt' ? 'ar-eg' :
       body.region === 'gulf' ? 'ar-ae' :
       body.region === 'levantine' ? 'ar-lb' : 'ar')
    );
    
    const agentTypeIdentity = getAgentTypeIdentity(body.agentType || 'TAJER');

    const builderInsight = {
      concept: {
        agentName: body.agentName,
        region: body.region,
        blueprintId: body.blueprintId,
        axiomId: axiomId,
        walletPublicKey: identityData.walletPublicKey
      },
      agentType: body.agentType || 'TAJER',
      region: regionalIdentity.code,
      culturalContext: {
        businessType: 'AI Agent Creation',
        targetAudience: 'MENA Market',
        sensitivityLevel: 'high',
        relationshipStage: 'initial',
        ...body.culturalContext
      }
    };

    const culturalEnhancement = await builderAgent(builderInsight);

    // 5. Create agent record in database
    console.log('💾 Creating agent record in database...');
    await db.insert(agents).values({
      id: agentId,
      name: body.agentName,
      role: body.agentType || 'TAJER',
      status: 'SOVEREIGN',
      brainModel: 'llama-3.1-70b-versatile',
      trustScore: 100,
    });

    // 6. Update identity with builder agent cultural enhancement
    await db
      .update(axiomIdentities)
      .set({
        dnaProfile: JSON.stringify({
          ...identityData.dnaProfile,
          culturalEnhancement: culturalEnhancement,
          builderAgentOutput: culturalEnhancement,
          regionalIntelligence: regionalIdentity,
          agentTypeIdentity: agentTypeIdentity
        }),
        updatedAt: new Date()
      })
      .where(eq(axiomIdentities.id, identityData.id));

    // 7. Log audit event
    const auditLog = {
      eventType: 'AGENT_SOVEREIGNTY_CREATION',
      agentId,
      axiomId,
      agentName: body.agentName,
      region: body.region,
      blueprintId: body.blueprintId,
      walletPublicKey: identityData.walletPublicKey,
      sovereigntyLevel: identityData.sovereigntyLevel,
      languagePreference: identityData.languagePreference,
      userId: body.userId || 'anonymous',
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    };

    await db.insert(systemLogs).values({
      level: 'INFO',
      message: `AGENT SOVEREIGNTY CREATED: ${body.agentName} (${axiomId})`,
      agentId: agentId,
      metadata: JSON.stringify(auditLog),
    });

    console.log('✅ Agent sovereignty creation completed successfully!', auditLog);

    // 8. Return complete sovereignty package
    const response: AgentCreationResponse = {
      success: true,
      agentId: agentId!,
      axiomId: axiomId!,
      publicKey: identityData.walletPublicKey,
      culturalContext: identityData.culturalContext,
      languagePreference: identityData.languagePreference,
      sovereigntyLevel: identityData.sovereigntyLevel,
      region: identityData.region,
      walletAddress: identityData.walletPublicKey,
      auditLog: JSON.stringify(auditLog)
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    console.error('❌ Agent sovereignty creation failed:', error);
    
    // Cleanup on failure
    if (agentId) {
      try {
        await db.delete(agents).where(eq(agents.id, agentId));
      } catch (cleanupError) {
        console.error('❌ Cleanup failed:', cleanupError);
      }
    }

    // Log error
    await db.insert(systemLogs).values({
      level: 'ERROR',
      message: `AGENT SOVEREIGNTY CREATION FAILED: ${error.message}`,
      agentId: agentId || 'unknown',
      metadata: JSON.stringify({
        error: error.message,
        stack: error.stack,
        requestBody: await request.clone().json().catch(() => ({})),
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      }),
    });

    return NextResponse.json({
      success: false,
      error: `Agent creation failed: ${error.message}`,
      auditLog: 'Error logged to system'
    }, { status: 500 });
  }
}
