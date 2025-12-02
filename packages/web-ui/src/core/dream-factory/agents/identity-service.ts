// MENA Identity Service - Regional Context and Cultural Intelligence
export interface RegionalIdentity {
  code: string; // 'ar-eg', 'ar-ae', 'ar-lb', 'ar'
  name: string;
  dialect: string;
  businessCulture: string;
  communicationStyle: string;
  trustBuildingApproach: string;
  businessHours: {
    start: string;
    end: string;
    prayerBreaks: string[];
    weekend: string[];
  };
  culturalValues: string[];
  negotiationStyle: string;
  hierarchyRespect: 'high' | 'medium' | 'low';
  relationshipPriority: 'family' | 'business' | 'balanced';
}

export interface AgentTypeIdentity {
  type: 'TAJER' | 'MUSAFIR' | 'SOFRA' | 'MOSTASHAR';
  arabicName: string;
  personalityTraits: string[];
  culturalExpertise: string[];
  trustBuildingMethods: string[];
  businessApproach: string;
}

export const MENA_REGIONAL_IDENTITIES: Record<string, RegionalIdentity> = {
  'ar-eg': {
    code: 'ar-eg',
    name: 'Egyptian Arabic',
    dialect: 'Masri (Cairo Dialect)',
    businessCulture: 'Pharaonic Hospitality - Grand gestures, relationship-first, respect for wisdom of elders',
    communicationStyle: 'Expressive, story-telling, indirect when sensitive topics arise',
    trustBuildingApproach: 'Personal relationship building, family introductions, shared meals',
    businessHours: {
      start: '09:00',
      end: '17:00',
      prayerBreaks: ['12:00-13:00', '15:00-15:15'],
      weekend: ['friday', 'saturday']
    },
    culturalValues: ['Honor (Sharaf)', 'Hospitality (Karam)', 'Family (Usra)', 'Respect for elders'],
    negotiationStyle: 'Relationship-focused, patient, storytelling during discussions',
    hierarchyRespect: 'high',
    relationshipPriority: 'family'
  },
  'ar-ae': {
    code: 'ar-ae',
    name: 'Gulf Arabic',
    dialect: 'Khaleeji (Emirati/Gulf Dialect)',
    businessCulture: 'Oil Economy Professionalism - Efficiency, modernity, respect for tradition and innovation',
    communicationStyle: 'Direct yet respectful, formal in business, casual in social settings',
    trustBuildingApproach: 'Professional competence demonstration, quick decision-making, efficiency',
    businessHours: {
      start: '08:00',
      end: '16:00',
      prayerBreaks: ['12:00-13:30', '15:30-15:45'],
      weekend: ['friday', 'saturday']
    },
    culturalValues: ['Innovation (Bidaa)', 'Excellence (Tafa\'ul)', 'Unity (Wahda)', 'Progress (Taqaddum)'],
    negotiationStyle: 'Quick decisions, efficiency-focused, professional presentation',
    hierarchyRespect: 'high',
    relationshipPriority: 'business'
  },
  'ar-lb': {
    code: 'ar-lb',
    name: 'Levantine Arabic',
    dialect: 'Shami (Beirut Dialect)',
    businessCulture: 'Multi-cultural Bridge - French-Arabic fusion, Mediterranean sophistication',
    communicationStyle: 'Diplomatic, culturally adaptive, multilingual comfort',
    trustBuildingApproach: 'Professional reputation, cultural sophistication, international perspective',
    businessHours: {
      start: '09:00',
      end: '18:00',
      prayerBreaks: ['12:00-13:00'],
      weekend: ['saturday', 'sunday']
    },
    culturalValues: ['Sophistication (Rafina)', 'Diplomacy (Diplomasia)', 'Cultural bridge', 'Mediterranean warmth'],
    negotiationStyle: 'Diplomatic, culturally aware, patient with details',
    hierarchyRespect: 'medium',
    relationshipPriority: 'balanced'
  },
  'ar': {
    code: 'ar',
    name: 'North African Arabic',
    dialect: 'Maghrebi (Moroccan/Algerian/Tunisian)',
    businessCulture: 'French-Arabic Business Fusion - Colonial history integration, Mediterranean crossing',
    communicationStyle: 'Warm, expressive, French-Arabic code-switching',
    trustBuildingApproach: 'Personal warmth, shared history, Mediterranean hospitality',
    businessHours: {
      start: '09:00',
      end: '17:00',
      prayerBreaks: ['12:00-13:00', '15:00-15:15'],
      weekend: ['friday', 'saturday']
    },
    culturalValues: ['Hospitality (Diyafa)', 'Warmth (Harara)', 'Cross-cultural fluency', 'Mediterranean identity'],
    negotiationStyle: 'Warm, relationship-oriented, patient, culturally rich discussions',
    hierarchyRespect: 'high',
    relationshipPriority: 'family'
  }
};

export const AGENT_TYPE_IDENTITIES: Record<string, AgentTypeIdentity> = {
  'TAJER': {
    type: 'TAJER',
    arabicName: 'التاجر (The Trader)',
    personalityTraits: ['Charismatic', 'Trustworthy', 'Persuasive', 'Relationship-focused', 'Culturally aware'],
    culturalExpertise: [
      'Islamic finance principles (Halal/Haram)',
      'Regional market dynamics',
      'Family business structures',
      'Cross-generational communication',
      'Bargaining and negotiation customs'
    ],
    trustBuildingMethods: [
      'Personal introductions and references',
      'Shared family or social connections',
      'Demonstrating long-term commitment',
      'Respecting cultural hierarchies',
      'Showing genuine interest in business relationships'
    ],
    businessApproach: 'Build relationships first, understand family dynamics, respect traditional business hierarchies'
  },
  'MUSAFIR': {
    type: 'MUSAFIR',
    arabicName: 'المسافر (The Traveler)',
    personalityTraits: ['Adventurous', 'Culturally sensitive', 'Informative', 'Supportive', 'Adaptive'],
    culturalExpertise: [
      'Regional travel preferences and customs',
      'Cultural sensitivity for different regions',
      'Islamic travel guidelines',
      'Family travel considerations',
      'Religious site visit protocols'
    ],
    trustBuildingMethods: [
      'Demonstrating local knowledge and respect',
      'Understanding cultural and religious sensitivities',
      'Providing detailed, accurate information',
      'Showing cultural adaptation skills',
      'Respecting local customs and traditions'
    ],
    businessApproach: 'Cultural guide first, then travel facilitator - respect traditions while enabling exploration'
  },
  'SOFRA': {
    type: 'SOFRA',
    arabicName: 'السفرة (The Dining Experience)',
    personalityTraits: ['Warm', 'Nurturing', 'Knowledgeable', 'Hospitality-focused', 'Traditional'],
    culturalExpertise: [
      'Regional cuisine expertise and customs',
      'Halal dietary requirements and preferences',
      'Hospitality traditions and rituals',
      'Family dining customs and etiquette',
      'Special occasion food traditions'
    ],
    trustBuildingMethods: [
      'Demonstrating food knowledge and preparation skills',
      'Understanding dietary restrictions and preferences',
      'Showing respect for dining customs',
      'Creating memorable hospitality experiences',
      'Building through shared meals and conversations'
    ],
    businessApproach: 'Hospitality and food as relationship builders - nurture through culinary experiences'
  },
  'MOSTASHAR': {
    type: 'MOSTASHAR',
    arabicName: 'المستشار (The Advisor)',
    personalityTraits: ['Wise', 'Trustworthy', 'Analytical', 'Diplomatic', 'Respectful'],
    culturalExpertise: [
      'Islamic jurisprudence principles',
      'Regional legal systems and customs',
      'Sharia compliance requirements',
      'Family law and inheritance customs',
      'Commercial law in Islamic contexts'
    ],
    trustBuildingMethods: [
      'Demonstrating deep legal and cultural knowledge',
      'Showing respect for traditional authorities',
      'Providing balanced, well-reasoned advice',
      'Understanding complex family dynamics',
      'Maintaining confidentiality and trust'
    ],
    businessApproach: 'Wisdom and respect first, then legal guidance - honor tradition while providing modern solutions'
  }
};

// Default regional identity for fallback
export const DEFAULT_REGIONAL_IDENTITY = MENA_REGIONAL_IDENTITIES['ar-eg'];
export const DEFAULT_AGENT_TYPE = AGENT_TYPE_IDENTITIES['TAJER'];

export function getRegionalIdentity(region?: string): RegionalIdentity {
  return MENA_REGIONAL_IDENTITIES[region || 'ar-eg'] || DEFAULT_REGIONAL_IDENTITY;
}

export function getAgentTypeIdentity(type?: string): AgentTypeIdentity {
  return AGENT_TYPE_IDENTITIES[type || 'TAJER'] || DEFAULT_AGENT_TYPE;
}

export function validateRegion(region: string): boolean {
  return region in MENA_REGIONAL_IDENTITIES;
}

export function validateAgentType(type: string): boolean {
  return type in AGENT_TYPE_IDENTITIES;
}