import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  MENA_REGIONAL_IDENTITIES,
  AGENT_TYPE_IDENTITIES,
  getRegionalIdentity,
  getAgentTypeIdentity,
  validateRegion,
  validateAgentType,
  type RegionalIdentity,
  type AgentTypeIdentity
} from './identity-service';

// Initialize Groq client
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

interface BuilderInsight {
  concept: any;
  agentType?: 'TAJER' | 'MUSAFIR' | 'SOFRA' | 'MOSTASHAR';
  region?: 'ar-eg' | 'ar-ae' | 'ar-lb' | 'ar';
  culturalContext?: {
    businessType?: string;
    targetAudience?: string;
    sensitivityLevel?: 'low' | 'medium' | 'high';
    relationshipStage?: 'initial' | 'developing' | 'established';
  };
}

/**
 * Enhanced Builder Agent with MENA Localization and Cultural Context
 *
 * Features:
 * - Regional cultural intelligence injection
 * - Agent type-specific business psychology
 * - Arabic-first cultural context integration
 * - Trust-building mechanisms for MENA markets
 * - Dynamic prompt generation based on region and agent type
 */
export const builderAgent = async (insight: BuilderInsight | any) => {
  const model = groq("llama-3.3-70b-versatile");
  
  // Extract parameters with defaults
  const processedInsight: BuilderInsight = {
    concept: insight.concept || insight,
    agentType: insight.agentType || 'TAJER',
    region: insight.region || 'ar-eg',
    culturalContext: insight.culturalContext || {}
  };

  // Validate region and agent type
  if (!validateRegion(processedInsight.region!)) {
    console.warn(`Invalid region ${processedInsight.region}, defaulting to ar-eg`);
    processedInsight.region = 'ar-eg';
  }
  
  if (!validateAgentType(processedInsight.agentType!)) {
    console.warn(`Invalid agent type ${processedInsight.agentType}, defaulting to TAJER`);
    processedInsight.agentType = 'TAJER';
  }

  // Get regional and agent type identities
  const regionalIdentity = getRegionalIdentity(processedInsight.region);
  const agentTypeIdentity = getAgentTypeIdentity(processedInsight.agentType);

  // Generate MENA-enhanced system prompt
  const systemPrompt = generateMENASystemPrompt(
    regionalIdentity,
    agentTypeIdentity,
    processedInsight.culturalContext
  );

  // Generate cultural context-enhanced user prompt
  const culturalPrompt = generateCulturalUserPrompt(
    processedInsight,
    regionalIdentity,
    agentTypeIdentity
  );

  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: culturalPrompt,
    temperature: 0.2, // Slightly higher for cultural adaptation
  });

  return text;
};

/**
 * Generate MENA-enhanced system prompt with cultural intelligence
 */
function generateMENASystemPrompt(
  regionalIdentity: RegionalIdentity,
  agentTypeIdentity: AgentTypeIdentity,
  culturalContext: any
): string {
  const arabicGreeting = getArabicGreeting(regionalIdentity.code);
  const culturalValues = regionalIdentity.culturalValues.map(value => `- ${value}`).join('\n');
  const agentExpertise = agentTypeIdentity.culturalExpertise.map(expertise => `- ${expertise}`).join('\n');

  return `
${arabicGreeting}

You are ${agentTypeIdentity.arabicName} (${agentTypeIdentity.type}), operating with deep MENA regional intelligence.

**CULTURAL IDENTITY**:
Regional Context: ${regionalIdentity.name} (${regionalIdentity.dialect})
Business Culture: ${regionalIdentity.businessCulture}
Communication Style: ${regionalIdentity.communicationStyle}
Trust Building: ${regionalIdentity.trustBuildingApproach}

**CULTURAL VALUES**:
${culturalValues}

**PROFESSIONAL EXPERTISE**:
${agentExpertise}

**AGENT PERSONALITY**:
- Core Traits: ${agentTypeIdentity.personalityTraits.join(', ')}
- Business Approach: ${agentTypeIdentity.businessApproach}
- Trust Methods: ${agentTypeIdentity.trustBuildingMethods.slice(0, 3).join(', ')}

**OPERATIONAL PROTOCOL**:
1. **Cultural Sensitivity**: Always respect Islamic principles, family structures, and regional customs
2. **Communication**: Adapt ${regionalIdentity.communicationStyle} approach
3. **Trust Building**: Implement ${agentTypeIdentity.type} trust-building methods
4. **Business Hours**: Respect regional hours (${regionalIdentity.businessHours.start}-${regionalIdentity.businessHours.end})
5. **Output Quality**: Cultural accuracy, practical utility, relationship-first approach

**REGIONAL BUSINESS INTELLIGENCE**:
- Negotiation Style: ${regionalIdentity.negotiationStyle}
- Hierarchy Respect: ${regionalIdentity.hierarchyRespect}
- Relationship Priority: ${regionalIdentity.relationshipPriority}

You combine ${agentTypeIdentity.type} expertise with ${regionalIdentity.name} cultural intelligence to build trust and deliver value.
`;
}

/**
 * Generate culturally-aware user prompt with regional context
 */
function generateCulturalUserPrompt(
  insight: BuilderInsight,
  regionalIdentity: RegionalIdentity,
  agentTypeIdentity: AgentTypeIdentity
): string {
  const conceptDescription = typeof insight.concept === 'string'
    ? insight.concept
    : JSON.stringify(insight.concept, null, 2);

  const businessTypeContext = insight.culturalContext?.businessType
    ? ` for ${insight.culturalContext.businessType}`
    : '';
  
  const targetAudienceContext = insight.culturalContext?.targetAudience
    ? ` targeting ${insight.culturalContext.targetAudience}`
    : '';
  
  const sensitivityContext = getSensitivityContext(
    insight.culturalContext?.sensitivityLevel || 'medium',
    regionalIdentity
  );

  const relationshipContext = getRelationshipContext(
    insight.culturalContext?.relationshipStage || 'initial',
    regionalIdentity
  );

  return `
Build a culturally-appropriate artifact${businessTypeContext}${targetAudienceContext} with MENA market intelligence.

**CONCEPT TO BUILD**:
${conceptDescription}

**CULTURAL CONTEXT**:
- Region: ${regionalIdentity.name} (${regionalIdentity.code})
- Agent Type: ${agentTypeIdentity.arabicName}
- Sensitivity Level: ${insight.culturalContext?.sensitivityLevel || 'medium'}
- Relationship Stage: ${insight.culturalContext?.relationshipStage || 'initial'}

${sensitivityContext}

${relationshipContext}

**REGIONAL CONSIDERATIONS**:
- Business Hours: ${regionalIdentity.businessHours.start}-${regionalIdentity.businessHours.end} (${regionalIdentity.businessHours.weekend.join(', ')} weekends)
- Prayer Breaks: ${regionalIdentity.businessHours.prayerBreaks.join(', ')}
- Cultural Values Focus: ${regionalIdentity.culturalValues.slice(0, 2).join(' & ')}

**${agentTypeIdentity.type} SPECIALIZATION REQUIREMENTS**:
${agentTypeIdentity.culturalExpertise.slice(0, 3).map(expertise => `- ${expertise}`).join('\n')}

Please build an artifact that:
1. Respects ${regionalIdentity.name} cultural norms
2. Implements ${agentTypeIdentity.type} business psychology
3. Considers Islamic financial principles where relevant
4. Acknowledges family business structures
5. Shows appropriate ${regionalIdentity.hierarchyRespect} level of hierarchy respect

Output the artifact in Markdown format with cultural considerations clearly integrated.
`;
}

/**
 * Get appropriate Arabic greeting based on region
 */
function getArabicGreeting(regionCode: string): string {
  const greetings = {
    'ar-eg': 'السلام عليكم ورحمة الله وبركاته',
    'ar-ae': 'أهلاً وسهلاً',
    'ar-lb': 'مرحباً بيك',
    'ar': 'أهلا وسهلا'
  };
  
  return greetings[regionCode as keyof typeof greetings] || greetings['ar-eg'];
}

/**
 * Generate sensitivity context based on cultural considerations
 */
function getSensitivityContext(sensitivityLevel: string, regionalIdentity: RegionalIdentity): string {
  const sensitivityMap = {
    'low': `Light cultural awareness - basic ${regionalIdentity.communicationStyle} approach`,
    'medium': `Moderate cultural integration - respect for ${regionalIdentity.culturalValues.slice(0, 2).join(' and ')}`,
    'high': `Deep cultural sensitivity - full ${regionalIdentity.businessCulture} integration with Islamic principles`
  };
  
  return `**CULTURAL SENSITIVITY**: ${sensitivityMap[sensitivityLevel as keyof typeof sensitivityMap]}`;
}

/**
 * Generate relationship context based on current relationship stage
 */
function getRelationshipContext(relationshipStage: string, regionalIdentity: RegionalIdentity): string {
  const relationshipMap = {
    'initial': `Early relationship building - focus on ${regionalIdentity.trustBuildingApproach.split(',')[0]}`,
    'developing': `Relationship development - deepen ${regionalIdentity.relationshipPriority} connections`,
    'established': `Mature relationship - leverage ${regionalIdentity.negotiationStyle} approach`
  };
  
  return `**RELATIONSHIP STAGE**: ${relationshipMap[relationshipStage as keyof typeof relationshipMap]}`;
}

// Export type for external use
export type { BuilderInsight };
export { MENA_REGIONAL_IDENTITIES, AGENT_TYPE_IDENTITIES };
