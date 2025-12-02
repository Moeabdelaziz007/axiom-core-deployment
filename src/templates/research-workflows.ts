/**
 * 🔍 RESEARCH WORKFLOW TEMPLATES
 * 
 * Pre-built Opal research workflows for MENA markets
 * Business Intelligence, Travel Intelligence, Culinary Research, Legal Research
 * Cultural adaptations and Islamic finance compliance
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { 
  ResearchWorkflowTemplate, 
  ResearchDomain, 
  ResearchDataSource,
  ResearchWorkflowStep 
} from '../types/research';

import { AgentType } from '../lib/ai-engine';
import { OpalNodeType } from '../types/opal-agents';

// ============================================================================
// BUSINESS INTELLIGENCE WORKFLOWS
// ============================================================================

/**
 * MENA Market Analysis Workflow
 */
export const menaMarketAnalysisWorkflow: ResearchWorkflowTemplate = {
  id: 'mena-market-analysis',
  name: 'MENA Market Analysis',
  description: 'Comprehensive market analysis for MENA region with cultural and economic insights',
  domain: ResearchDomain.BUSINESS_INTELLIGENCE,
  agentType: AgentType.TAJER,
  category: 'market_research',
  steps: [
    {
      id: 'market_overview',
      name: 'Market Overview Collection',
      description: 'Collect general market data and trends',
      type: 'data_collection',
      agentType: AgentType.TAJER,
      dataSources: [ResearchDataSource.GOOGLE_SEARCH, ResearchDataSource.API_INTEGRATION],
      parameters: {
        searchQueries: [
          'MENA market trends 2024',
          'GCC economic outlook',
          'Middle East business opportunities'
        ],
        regions: ['GCC', 'Levant', 'North Africa'],
        languages: ['en', 'ar'],
        dateRange: 'last_12_months'
      },
      dependencies: [],
      estimatedDuration: 15,
      qualityChecks: [
        { type: 'source_credibility', threshold: 0.7, action: 'warn' },
        { type: 'data_freshness', threshold: 0.8, action: 'retry' }
      ],
      outputs: ['market_data']
    },
    {
      id: 'competitor_analysis',
      name: 'Competitor Intelligence',
      description: 'Analyze competitive landscape',
      type: 'analysis',
      agentType: AgentType.TAJER,
      dataSources: [ResearchDataSource.WEB_SCRAPING, ResearchDataSource.DATABASE_QUERY],
      parameters: {
        analysisDepth: 'deep',
        competitorTypes: ['direct', 'indirect', 'emerging'],
        focusAreas: ['pricing', 'market_share', 'strategies', 'innovations']
      },
      dependencies: ['market_data'],
      estimatedDuration: 20,
      qualityChecks: [
        { type: 'completeness', threshold: 0.8, action: 'retry' }
      ],
      outputs: ['competitor_insights']
    },
    {
      id: 'cultural_adaptation',
      name: 'Cultural Context Analysis',
      description: 'Analyze cultural factors affecting business',
      type: 'analysis',
      agentType: AgentType.TAJER,
      dataSources: [ResearchDataSource.GOOGLE_SEARCH, ResearchDataSource.DOCUMENT_ANALYSIS],
      parameters: {
        culturalFactors: ['business_etiquette', 'communication_styles', 'decision_making', 'relationship_building'],
        regionalFocus: 'MENA',
        languageSupport: ['ar', 'en']
      },
      dependencies: ['market_data'],
      estimatedDuration: 15,
      qualityChecks: [
        { type: 'cultural_relevance', threshold: 0.8, action: 'warn' }
      ],
      outputs: ['cultural_insights']
    },
    {
      id: 'islamic_finance',
      name: 'Islamic Finance Considerations',
      description: 'Assess Islamic finance compliance and opportunities',
      type: 'analysis',
      agentType: AgentType.TAJER,
      dataSources: [ResearchDataSource.DOCUMENT_ANALYSIS, ResearchDataSource.API_INTEGRATION],
      parameters: {
        complianceAreas: ['sharia_principles', 'riba_free', 'halal_investments'],
        financialProducts: ['sukuk', 'murabaha', 'ijara', 'musharakah'],
        jurisdictions: ['UAE', 'Saudi Arabia', 'Malaysia', 'UK']
      },
      dependencies: ['market_data'],
      estimatedDuration: 18,
      qualityChecks: [
        { type: 'islamic_compliance', threshold: 0.9, action: 'fail' }
      ],
      outputs: ['islamic_finance_insights']
    },
    {
      id: 'opportunity_synthesis',
      name: 'Opportunity Synthesis',
      description: 'Synthesize findings and identify opportunities',
      type: 'synthesis',
      agentType: AgentType.TAJER,
      dataSources: [],
      parameters: {
        synthesisType: 'strategic_opportunities',
        priorityFactors: ['market_size', 'growth_potential', 'competitive_advantage', 'cultural_fit'],
        riskAssessment: true
      },
      dependencies: ['market_data', 'competitor_insights', 'cultural_insights', 'islamic_finance_insights'],
      estimatedDuration: 12,
      qualityChecks: [
        { type: 'logical_consistency', threshold: 0.8, action: 'warn' }
      ],
      outputs: ['opportunity_report']
    },
    {
      id: 'validation',
      name: 'Quality Validation',
      description: 'Validate research quality and completeness',
      type: 'validation',
      agentType: AgentType.TAJER,
      dataSources: [],
      parameters: {
        validationCriteria: ['accuracy', 'completeness', 'relevance', 'cultural_appropriateness'],
        qualityThreshold: 0.8,
        peerReview: true
      },
      dependencies: ['opportunity_report'],
      estimatedDuration: 8,
      qualityChecks: [
        { type: 'overall_quality', threshold: 0.8, action: 'fail' }
      ],
      outputs: ['validation_report']
    }
  ],
  metadata: {
    version: '1.0.0',
    author: 'axiom-core',
    tags: ['mena', 'market-analysis', 'business-intelligence', 'cultural-adaptation'],
    estimatedCost: 25.50,
    estimatedDuration: 88,
    complexity: 'moderate',
    prerequisites: ['Basic business knowledge', 'MENA market understanding'],
    deliverables: ['Market analysis report', 'Competitive insights', 'Cultural recommendations', 'Opportunity assessment']
  },
  menaSpecific: {
    culturalAdaptation: true,
    languageSupport: ['en', 'ar', 'fr'],
    regionalFocus: ['GCC', 'Levant', 'North Africa'],
    islamicCompliance: true
  }
};

/**
 * Islamic Finance Deal Analysis Workflow
 */
export const islamicFinanceAnalysisWorkflow: ResearchWorkflowTemplate = {
  id: 'islamic-finance-analysis',
  name: 'Islamic Finance Deal Analysis',
  description: 'Comprehensive Islamic finance deal analysis with Sharia compliance checking',
  domain: ResearchDomain.BUSINESS_INTELLIGENCE,
  agentType: AgentType.TAJER,
  category: 'islamic_finance',
  steps: [
    {
      id: 'deal_structure_analysis',
      name: 'Deal Structure Analysis',
      description: 'Analyze deal structure for Sharia compliance',
      type: 'analysis',
      agentType: AgentType.TAJER,
      dataSources: [ResearchDataSource.DOCUMENT_ANALYSIS, ResearchDataSource.API_INTEGRATION],
      parameters: {
        structureTypes: ['murabaha', 'ijara', 'musharakah', 'mudarabah', 'sukuk'],
        complianceFrameworks: ['AAOIFI', 'IFSB', 'national_regulations'],
        riskFactors: ['market_risk', 'credit_risk', 'operational_risk', 'compliance_risk']
      },
      dependencies: [],
      estimatedDuration: 25,
      qualityChecks: [
        { type: 'sharia_compliance', threshold: 0.95, action: 'fail' }
      ],
      outputs: ['structure_analysis']
    },
    {
      id: 'jurisdictional_review',
      name: 'Jurisdictional Compliance Review',
      description: 'Review compliance with local Islamic finance regulations',
      type: 'analysis',
      agentType: AgentType.MOSTASHAR,
      dataSources: [ResearchDataSource.DOCUMENT_ANALYSIS, ResearchDataSource.DATABASE_QUERY],
      parameters: {
        jurisdictions: ['UAE', 'Saudi Arabia', 'Malaysia', 'UK', 'Singapore'],
        regulatoryBodies: ['central_banks', 'islamic_finance_authorities', 'securities_commissions'],
        complianceAreas: ['licensing', 'capital_adequacy', 'governance', 'disclosure']
      },
      dependencies: ['structure_analysis'],
      estimatedDuration: 20,
      qualityChecks: [
        { type: 'regulatory_compliance', threshold: 0.9, action: 'fail' }
      ],
      outputs: ['jurisdictional_review']
    },
    {
      id: 'financial_modeling',
      name: 'Islamic Financial Modeling',
      description: 'Create Sharia-compliant financial models',
      type: 'analysis',
      agentType: AgentType.TAJER,
      dataSources: [ResearchDataSource.API_INTEGRATION],
      parameters: {
        modelTypes: ['profit_sharing', 'rental_yield', 'mark_up_pricing', 'cost_plus_pricing'],
        scenarios: ['base_case', 'optimistic', 'pessimistic'],
        riskAdjustments: true
      },
      dependencies: ['structure_analysis', 'jurisdictional_review'],
      estimatedDuration: 30,
      qualityChecks: [
        { type: 'model_accuracy', threshold: 0.85, action: 'retry' }
      ],
      outputs: ['financial_models']
    },
    {
      id: 'zakat_impact',
      name: 'Zakat Impact Analysis',
      description: 'Calculate Zakat implications for the deal',
      type: 'analysis',
      agentType: AgentType.TAJER,
      dataSources: [ResearchDataSource.API_INTEGRATION],
      parameters: {
        zakatableAssets: ['cash', 'accounts_receivable', 'inventory', 'investments'],
        calculationMethods: ['net_worth', 'working_capital', 'cash_flow'],
        nisabThreshold: true
      },
      dependencies: ['financial_models'],
      estimatedDuration: 15,
      qualityChecks: [
        { type: 'calculation_accuracy', threshold: 0.95, action: 'retry' }
      ],
      outputs: ['zakat_analysis']
    },
    {
      id: 'risk_assessment',
      name: 'Risk Assessment & Mitigation',
      description: 'Comprehensive risk assessment from Islamic finance perspective',
      type: 'analysis',
      agentType: AgentType.TAJER,
      dataSources: [],
      parameters: {
        riskCategories: ['sharia_risk', 'market_risk', 'credit_risk', 'operational_risk', 'reputational_risk'],
        mitigationStrategies: ['diversification', 'insurance', 'due_diligence', 'governance'],
        stressTesting: true
      },
      dependencies: ['structure_analysis', 'financial_models', 'zakat_analysis'],
      estimatedDuration: 20,
      qualityChecks: [
        { type: 'risk_completeness', threshold: 0.8, action: 'warn' }
      ],
      outputs: ['risk_assessment']
    },
    {
      id: 'report_generation',
      name: 'Islamic Finance Report Generation',
      description: 'Generate comprehensive Islamic finance analysis report',
      type: 'reporting',
      agentType: AgentType.TAJER,
      dataSources: [],
      parameters: {
        reportFormat: 'islamic_finance_report',
        languages: ['en', 'ar'],
        includeSections: ['executive_summary', 'sharia_analysis', 'financial_analysis', 'risk_assessment', 'recommendations'],
        complianceCertificates: true
      },
      dependencies: ['structure_analysis', 'jurisdictional_review', 'financial_models', 'zakat_analysis', 'risk_assessment'],
      estimatedDuration: 15,
      qualityChecks: [
        { type: 'report_completeness', threshold: 0.9, action: 'retry' }
      ],
      outputs: ['islamic_finance_report']
    }
  ],
  metadata: {
    version: '1.0.0',
    author: 'axiom-core',
    tags: ['islamic-finance', 'sharia-compliance', 'zakat', 'risk-assessment', 'deal-analysis'],
    estimatedCost: 35.00,
    estimatedDuration: 125,
    complexity: 'complex',
    prerequisites: ['Islamic finance knowledge', 'Sharia principles understanding', 'Financial modeling skills'],
    deliverables: ['Sharia compliance report', 'Financial models', 'Risk assessment', 'Zakat analysis', 'Investment recommendations']
  },
  menaSpecific: {
    culturalAdaptation: true,
    languageSupport: ['en', 'ar'],
    regionalFocus: ['GCC', 'Southeast Asia', 'UK'],
    islamicCompliance: true
  }
};

// ============================================================================
// TRAVEL INTELLIGENCE WORKFLOWS
// ============================================================================

/**
 * Hajj & Umrah Planning Workflow
 */
export const hajjUmrahPlanningWorkflow: ResearchWorkflowTemplate = {
  id: 'hajj-umrah-planning',
  name: 'Hajj & Umrah Journey Planning',
  description: 'Specialized workflow for Hajj and Umrah pilgrimage planning with logistics and religious guidance',
  domain: ResearchDomain.TRAVEL_INTELLIGENCE,
  agentType: AgentType.MUSAFIR,
  category: 'religious_travel',
  steps: [
    {
      id: 'pilgrim_profile',
      name: 'Pilgrim Profile Analysis',
      description: 'Analyze pilgrim requirements and preferences',
      type: 'data_collection',
      agentType: AgentType.MUSAFIR,
      dataSources: [ResearchDataSource.GOOGLE_SEARCH, ResearchDataSource.DATABASE_QUERY],
      parameters: {
        profileFactors: ['age', 'health', 'mobility', 'language', 'budget', 'travel_history'],
        specialNeeds: true,
        groupSize: true,
        visaRequirements: true
      },
      dependencies: [],
      estimatedDuration: 10,
      qualityChecks: [
        { type: 'profile_completeness', threshold: 0.9, action: 'retry' }
      ],
      outputs: ['pilgrim_profile']
    },
    {
      id: 'visa_documentation',
      name: 'Visa & Documentation Research',
      description: 'Research visa requirements and documentation',
      type: 'analysis',
      agentType: AgentType.MUSAFIR,
      dataSources: [ResearchDataSource.API_INTEGRATION, ResearchDataSource.GOOGLE_SEARCH],
      parameters: {
        destination: 'Saudi Arabia',
        visaTypes: ['hajj_visa', 'umrah_visa', 'tourist_visa'],
        documentTypes: ['passport', 'photos', 'medical_certificate', 'vaccination'],
        processingTimes: true
      },
      dependencies: ['pilgrim_profile'],
      estimatedDuration: 15,
      qualityChecks: [
        { type: 'information_accuracy', threshold: 0.9, action: 'retry' }
      ],
      outputs: ['visa_requirements']
    },
    {
      id: 'accommodation_research',
      name: 'Holy Sites Accommodation Research',
      description: 'Research accommodation near holy sites',
      type: 'analysis',
      agentType: AgentType.MUSAFIR,
      dataSources: [ResearchDataSource.WEB_SCRAPING, ResearchDataSource.API_INTEGRATION],
      parameters: {
        locations: ['makkah_haram', 'madinah_nabawi', 'mina', 'arafat'],
        accommodationTypes: ['hotels', 'apartments', 'pilgrim_camps'],
        proximityLevels: ['walking_distance', 'short_transport', 'city_center'],
        budgetRanges: true
      },
      dependencies: ['pilgrim_profile'],
      estimatedDuration: 20,
      qualityChecks: [
        { type: 'data_freshness', threshold: 0.8, action: 'retry' }
      ],
      outputs: ['accommodation_options']
    },
    {
      id: 'transport_planning',
      name: 'Transport & Logistics Planning',
      description: 'Plan transport between holy sites',
      type: 'analysis',
      agentType: AgentType.MUSAFIR,
      dataSources: [ResearchDataSource.API_INTEGRATION, ResearchDataSource.GOOGLE_SEARCH],
      parameters: {
        routes: ['makkah_madinah', 'makkah_mina', 'mina_arafat', 'arafat_muzdalifah'],
        transportModes: ['bus', 'train', 'taxi', 'walking'],
        schedules: true,
        costs: true
      },
      dependencies: ['accommodation_options'],
      estimatedDuration: 18,
      qualityChecks: [
        { type: 'route_optimization', threshold: 0.8, action: 'warn' }
      ],
      outputs: ['transport_plan']
    },
    {
      id: 'ritual_guidance',
      name: 'Ritual Guidance & Timing',
      description: 'Provide step-by-step ritual guidance',
      type: 'analysis',
      agentType: AgentType.MUSAFIR,
      dataSources: [ResearchDataSource.DOCUMENT_ANALYSIS, ResearchDataSource.DATABASE_QUERY],
      parameters: {
        rituals: ['tawaf', 'sai', 'wuquf_arafat', 'rami_jamarat', 'qurban'],
        languages: ['en', 'ar', 'ur', 'bn', 'id'],
        timingGuidance: true,
        commonMistakes: true
      },
      dependencies: ['pilgrim_profile'],
      estimatedDuration: 15,
      qualityChecks: [
        { type: 'religious_accuracy', threshold: 0.95, action: 'fail' }
      ],
      outputs: ['ritual_guidance']
    },
    {
      id: 'budget_optimization',
      name: 'Budget Optimization & Cost Analysis',
      description: 'Optimize pilgrimage budget with cost breakdown',
      type: 'analysis',
      agentType: AgentType.MUSAFIR,
      dataSources: [ResearchDataSource.API_INTEGRATION],
      parameters: {
        costCategories: ['visa', 'flights', 'accommodation', 'transport', 'food', 'qurban', 'shopping'],
        currencies: ['SAR', 'USD', 'EUR', 'GBP', 'PKR', 'BDT'],
        optimizationStrategies: ['early_booking', 'group_discounts', 'off_peak_travel']
      },
      dependencies: ['visa_requirements', 'accommodation_options', 'transport_plan'],
      estimatedDuration: 12,
      qualityChecks: [
        { type: 'budget_accuracy', threshold: 0.85, action: 'warn' }
      ],
      outputs: ['budget_analysis']
    },
    {
      id: 'itinerary_generation',
      name: 'Complete Itinerary Generation',
      description: 'Generate comprehensive pilgrimage itinerary',
      type: 'synthesis',
      agentType: AgentType.MUSAFIR,
      dataSources: [],
      parameters: {
        format: 'pilgrimage_itinerary',
        languages: ['en', 'ar'],
        includeSections: ['daily_schedule', 'contact_info', 'emergency_procedures', 'checklist'],
        timelineView: true,
        mapIntegration: true
      },
      dependencies: ['pilgrim_profile', 'visa_requirements', 'accommodation_options', 'transport_plan', 'ritual_guidance', 'budget_analysis'],
      estimatedDuration: 15,
      qualityChecks: [
        { type: 'itinerary_completeness', threshold: 0.9, action: 'retry' }
      ],
      outputs: ['pilgrimage_itinerary']
    }
  ],
  metadata: {
    version: '1.0.0',
    author: 'axiom-core',
    tags: ['hajj', 'umrah', 'pilgrimage', 'religious-travel', 'islamic-rituals'],
    estimatedCost: 28.00,
    estimatedDuration: 105,
    complexity: 'moderate',
    prerequisites: ['Hajj knowledge', 'Saudi visa regulations', 'Islamic rituals understanding'],
    deliverables: ['Complete pilgrimage itinerary', 'Budget breakdown', 'Ritual guidance', 'Accommodation recommendations', 'Transport plan']
  },
  menaSpecific: {
    culturalAdaptation: true,
    languageSupport: ['en', 'ar', 'ur', 'bn', 'id'],
    regionalFocus: ['Saudi Arabia'],
    islamicCompliance: true
  }
};

// ============================================================================
// CULINARY RESEARCH WORKFLOWS
// ============================================================================

/**
 * Halal Restaurant Analysis Workflow
 */
export const halalRestaurantAnalysisWorkflow: ResearchWorkflowTemplate = {
  id: 'halal-restaurant-analysis',
  name: 'Halal Restaurant Market Analysis',
  description: 'Comprehensive analysis for Halal restaurant market with certification and cultural insights',
  domain: ResearchDomain.CULINARY_RESEARCH,
  agentType: AgentType.SOFRA,
  category: 'halal_compliance',
  steps: [
    {
      id: 'market_landscape',
      name: 'Halal Restaurant Market Landscape',
      description: 'Analyze Halal restaurant market trends and opportunities',
      type: 'data_collection',
      agentType: AgentType.SOFRA,
      dataSources: [ResearchDataSource.GOOGLE_SEARCH, ResearchDataSource.API_INTEGRATION],
      parameters: {
        marketSegments: ['fine_dining', 'casual_dining', 'fast_food', 'cafes'],
        cuisines: ['local', 'international', 'fusion'],
        regions: ['GCC', 'Levant', 'Southeast Asia', 'Europe'],
        trends: ['digital_delivery', 'ghost_kitchens', 'sustainable_practices']
      },
      dependencies: [],
      estimatedDuration: 18,
      qualityChecks: [
        { type: 'market_relevance', threshold: 0.8, action: 'warn' }
      ],
      outputs: ['market_data']
    },
    {
      id: 'halal_certification',
      name: 'Halal Certification Requirements',
      description: 'Research Halal certification requirements and processes',
      type: 'analysis',
      agentType: AgentType.SOFRA,
      dataSources: [ResearchDataSource.DOCUMENT_ANALYSIS, ResearchDataSource.API_INTEGRATION],
      parameters: {
        certificationBodies: ['JAKIM', 'MUIS', 'MUI', 'ESMA', 'SFDA'],
        certificationTypes: ['restaurant', 'food_processing', 'supply_chain'],
        requirements: ['ingredients', 'preparation', 'storage', 'handling'],
        costs: true,
        timelines: true
      },
      dependencies: ['market_data'],
      estimatedDuration: 20,
      qualityChecks: [
        { type: 'certification_accuracy', threshold: 0.9, action: 'retry' }
      ],
      outputs: ['certification_requirements']
    },
    {
      id: 'menu_optimization',
      name: 'Halal Menu Optimization',
      description: 'Optimize menu for Halal compliance and market appeal',
      type: 'analysis',
      agentType: AgentType.SOFRA,
      dataSources: [ResearchDataSource.IMAGE_ANALYSIS, ResearchDataSource.DOCUMENT_ANALYSIS],
      parameters: {
        menuAnalysis: ['ingredient_sourcing', 'preparation_methods', 'cross_contamination'],
        optimizationFactors: ['cost_efficiency', 'customer_preference', 'seasonal_availability'],
        culturalAdaptation: ['local_tastes', 'religious_considerations', 'dietary_restrictions']
      },
      dependencies: ['market_data', 'certification_requirements'],
      estimatedDuration: 22,
      qualityChecks: [
        { type: 'menu_completeness', threshold: 0.85, action: 'warn' }
      ],
      outputs: ['menu_recommendations']
    },
    {
      id: 'supplier_verification',
      name: 'Halal Supplier Verification',
      description: 'Verify and evaluate Halal suppliers',
      type: 'analysis',
      agentType: AgentType.SOFRA,
      dataSources: [ResearchDataSource.DATABASE_QUERY, ResearchDataSource.API_INTEGRATION],
      parameters: {
        supplierCategories: ['meat', 'poultry', 'seafood', 'dry_goods', 'beverages'],
        verificationCriteria: ['certification_validity', 'supply_chain_traceability', 'quality_standards'],
        riskAssessment: ['supply_disruption', 'certification_lapse', 'quality_issues']
      },
      dependencies: ['menu_recommendations'],
      estimatedDuration: 16,
      qualityChecks: [
        { type: 'supplier_reliability', threshold: 0.8, action: 'retry' }
      ],
      outputs: ['supplier_analysis']
    },
    {
      id: 'cultural_preferences',
      name: 'Cultural Dining Preferences',
      description: 'Analyze cultural dining preferences in target market',
      type: 'analysis',
      agentType: AgentType.SOFRA,
      dataSources: [ResearchDataSource.GOOGLE_SEARCH, ResearchDataSource.SOCIAL_MEDIA],
      parameters: {
        culturalFactors: ['dining_etiquette', 'family_preferences', 'religious_considerations'],
        marketSegments: ['families', 'young_professionals', 'tourists', 'expatriates'],
        regionalVariations: ['gulf_states', 'levant', 'north_africa', 'southeast_asia']
      },
      dependencies: ['market_data'],
      estimatedDuration: 15,
      qualityChecks: [
        { type: 'cultural_relevance', threshold: 0.8, action: 'warn' }
      ],
      outputs: ['cultural_insights']
    },
    {
      id: 'financial_modeling',
      name: 'Restaurant Financial Modeling',
      description: 'Create financial models for Halal restaurant',
      type: 'analysis',
      agentType: AgentType.SOFRA,
      dataSources: [ResearchDataSource.API_INTEGRATION],
      parameters: {
        modelComponents: ['revenue_projection', 'cost_analysis', 'profitability', 'break_even'],
        scenarios: ['conservative', 'realistic', 'optimistic'],
        costCategories: ['ingredients', 'labor', 'overhead', 'certification', 'marketing'],
        kpis: ['food_cost_percentage', 'labor_cost_percentage', 'profit_margin', 'roi']
      },
      dependencies: ['market_data', 'menu_recommendations', 'supplier_analysis'],
      estimatedDuration: 20,
      qualityChecks: [
        { type: 'financial_accuracy', threshold: 0.85, action: 'retry' }
      ],
      outputs: ['financial_models']
    },
    {
      id: 'restaurant_report',
      name: 'Comprehensive Restaurant Analysis Report',
      description: 'Generate comprehensive Halal restaurant analysis report',
      type: 'reporting',
      agentType: AgentType.SOFRA,
      dataSources: [],
      parameters: {
        reportFormat: 'restaurant_analysis_report',
        languages: ['en', 'ar'],
        includeSections: ['market_analysis', 'certification_roadmap', 'menu_strategy', 'supplier_recommendations', 'financial_projections'],
        actionPlan: true
      },
      dependencies: ['market_data', 'certification_requirements', 'menu_recommendations', 'supplier_analysis', 'cultural_insights', 'financial_models'],
      estimatedDuration: 12,
      qualityChecks: [
        { type: 'report_completeness', threshold: 0.9, action: 'retry' }
      ],
      outputs: ['restaurant_analysis_report']
    }
  ],
  metadata: {
    version: '1.0.0',
    author: 'axiom-core',
    tags: ['halal', 'restaurant', 'certification', 'menu-optimization', 'culinary-research'],
    estimatedCost: 32.00,
    estimatedDuration: 123,
    complexity: 'moderate',
    prerequisites: ['Food industry knowledge', 'Halal certification understanding', 'Restaurant management'],
    deliverables: ['Market analysis report', 'Certification roadmap', 'Menu optimization recommendations', 'Supplier analysis', 'Financial projections']
  },
  menaSpecific: {
    culturalAdaptation: true,
    languageSupport: ['en', 'ar', 'malay', 'indonesian'],
    regionalFocus: ['GCC', 'Southeast Asia', 'Europe', 'North America'],
    islamicCompliance: true
  }
};

// ============================================================================
// LEGAL RESEARCH WORKFLOWS
// ============================================================================

/**
 * MENA Legal Compliance Workflow
 */
export const menaLegalComplianceWorkflow: ResearchWorkflowTemplate = {
  id: 'mena-legal-compliance',
  name: 'MENA Legal Compliance Analysis',
  description: 'Comprehensive legal compliance analysis for MENA region with Islamic law considerations',
  domain: ResearchDomain.LEGAL_RESEARCH,
  agentType: AgentType.MOSTASHAR,
  category: 'legal_compliance',
  steps: [
    {
      id: 'jurisdiction_mapping',
      name: 'Jurisdictional Requirements Mapping',
      description: 'Map legal requirements across target jurisdictions',
      type: 'data_collection',
      agentType: AgentType.MOSTASHAR,
      dataSources: [ResearchDataSource.DOCUMENT_ANALYSIS, ResearchDataSource.DATABASE_QUERY],
      parameters: {
        jurisdictions: ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
        legalAreas: ['commercial_law', 'islamic_finance_law', 'employment_law', 'data_protection', 'anti_money_laundering'],
        regulatoryBodies: ['central_banks', 'securities_commissions', 'ministries', 'free_zone_authorities']
      },
      dependencies: [],
      estimatedDuration: 25,
      qualityChecks: [
        { type: 'legal_accuracy', threshold: 0.9, action: 'retry' }
      ],
      outputs: ['jurisdictional_requirements']
    },
    {
      id: 'islamic_law_analysis',
      name: 'Islamic Law (Sharia) Analysis',
      description: 'Analyze Islamic law implications and requirements',
      type: 'analysis',
      agentType: AgentType.MOSTASHAR,
      dataSources: [ResearchDataSource.DOCUMENT_ANALYSIS, ResearchDataSource.ACADEMIC_PAPERS],
      parameters: {
        shariaPrinciples: ['prohibition_of_riba', 'prohibition_of_gharar', 'risk_sharing', 'asset_backing'],
        legalSchools: ['hanafi', 'shafii', 'maliki', 'hanbali'],
        applicationAreas: ['contracts', 'finance', 'commercial_transactions', 'dispute_resolution']
      },
      dependencies: ['jurisdictional_requirements'],
      estimatedDuration: 22,
      qualityChecks: [
        { type: 'sharia_compliance', threshold: 0.95, action: 'fail' }
      ],
      outputs: ['islamic_law_analysis']
    },
    {
      id: 'regulatory_gap_analysis',
      name: 'Regulatory Gap Analysis',
      description: 'Identify gaps between current practices and regulatory requirements',
      type: 'analysis',
      agentType: AgentType.MOSTASHAR,
      dataSources: [ResearchDataSource.DOCUMENT_ANALYSIS, ResearchDataSource.DATABASE_QUERY],
      parameters: {
        analysisAreas: ['policies', 'procedures', 'documentation', 'reporting', 'governance'],
        gapCategories: ['missing_requirements', 'outdated_practices', 'insufficient_documentation', 'non_compliance_risks'],
        prioritization: ['risk_level', 'implementation_complexity', 'resource_requirements']
      },
      dependencies: ['jurisdictional_requirements', 'islamic_law_analysis'],
      estimatedDuration: 18,
      qualityChecks: [
        { type: 'gap_identification', threshold: 0.8, action: 'warn' }
      ],
      outputs: ['gap_analysis']
    },
    {
      id: 'compliance_roadmap',
      name: 'Compliance Implementation Roadmap',
      description: 'Create detailed roadmap for compliance implementation',
      type: 'synthesis',
      agentType: AgentType.MOSTASHAR,
      dataSources: [],
      parameters: {
        roadmapElements: ['action_items', 'timelines', 'responsibilities', 'resources', 'milestones'],
        implementationPhases: ['immediate_actions', 'short_term_improvements', 'long_term_strategies'],
        riskMitigation: true,
        success_metrics: true
      },
      dependencies: ['jurisdictional_requirements', 'islamic_law_analysis', 'gap_analysis'],
      estimatedDuration: 20,
      qualityChecks: [
        { type: 'roadmap_feasibility', threshold: 0.8, action: 'warn' }
      ],
      outputs: ['compliance_roadmap']
    },
    {
      id: 'document_templates',
      name: 'Legal Document Templates',
      description: 'Generate compliant legal document templates',
      type: 'analysis',
      agentType: AgentType.MOSTASHAR,
      dataSources: [ResearchDataSource.DOCUMENT_ANALYSIS],
      parameters: {
        documentTypes: ['contracts', 'policies', 'procedures', 'agreements', 'disclosures'],
        complianceFeatures: ['sharia_compliance_clauses', 'regulatory_references', 'risk_disclosures'],
        jurisdictions: ['UAE', 'Saudi Arabia', 'Qatar'],
        languages: ['en', 'ar']
      },
      dependencies: ['jurisdictional_requirements', 'islamic_law_analysis'],
      estimatedDuration: 25,
      qualityChecks: [
        { type: 'document_compliance', threshold: 0.9, action: 'retry' }
      ],
      outputs: ['document_templates']
    },
    {
      id: 'training_materials',
      name: 'Compliance Training Materials',
      description: 'Create compliance training materials for staff',
      type: 'synthesis',
      agentType: AgentType.MOSTASHAR,
      dataSources: [],
      parameters: {
        trainingModules: ['legal_requirements', 'islamic_finance_principles', 'compliance_procedures', 'risk_management'],
        formats: ['presentations', 'handbooks', 'case_studies', 'assessments'],
        targetAudiences: ['management', 'staff', 'compliance_officers'],
        languages: ['en', 'ar']
      },
      dependencies: ['jurisdictional_requirements', 'islamic_law_analysis', 'gap_analysis'],
      estimatedDuration: 15,
      qualityChecks: [
        { type: 'training_effectiveness', threshold: 0.8, action: 'warn' }
      ],
      outputs: ['training_materials']
    },
    {
      id: 'compliance_report',
      name: 'Comprehensive Compliance Report',
      description: 'Generate comprehensive legal compliance report',
      type: 'reporting',
      agentType: AgentType.MOSTASHAR,
      dataSources: [],
      parameters: {
        reportFormat: 'legal_compliance_report',
        languages: ['en', 'ar'],
        includeSections: ['executive_summary', 'regulatory_analysis', 'gap_analysis', 'implementation_roadmap', 'recommendations'],
        legalReferences: true,
        actionItems: true
      },
      dependencies: ['jurisdictional_requirements', 'islamic_law_analysis', 'gap_analysis', 'compliance_roadmap', 'document_templates', 'training_materials'],
      estimatedDuration: 15,
      qualityChecks: [
        { type: 'report_completeness', threshold: 0.9, action: 'retry' }
      ],
      outputs: ['compliance_report']
    }
  ],
  metadata: {
    version: '1.0.0',
    author: 'axiom-core',
    tags: ['legal-compliance', 'islamic-law', 'mena-regulations', 'sharia-compliance', 'risk-management'],
    estimatedCost: 45.00,
    estimatedDuration: 140,
    complexity: 'complex',
    prerequisites: ['Legal expertise', 'Islamic law knowledge', 'MENA regulatory understanding'],
    deliverables: ['Compliance report', 'Implementation roadmap', 'Document templates', 'Training materials', 'Risk assessment']
  },
  menaSpecific: {
    culturalAdaptation: true,
    languageSupport: ['en', 'ar'],
    regionalFocus: ['GCC', 'Levant', 'North Africa'],
    islamicCompliance: true
  }
};

// ============================================================================
// WORKFLOW COLLECTIONS AND UTILITIES
// ============================================================================

/**
 * All research workflow templates
 */
export const RESEARCH_WORKFLOW_TEMPLATES: ResearchWorkflowTemplate[] = [
  menaMarketAnalysisWorkflow,
  islamicFinanceAnalysisWorkflow,
  hajjUmrahPlanningWorkflow,
  halalRestaurantAnalysisWorkflow,
  menaLegalComplianceWorkflow
];

/**
 * Get workflow templates by domain
 */
export function getWorkflowTemplatesByDomain(domain: ResearchDomain): ResearchWorkflowTemplate[] {
  return RESEARCH_WORKFLOW_TEMPLATES.filter(template => template.domain === domain);
}

/**
 * Get workflow templates by agent type
 */
export function getWorkflowTemplatesByAgentType(agentType: AgentType): ResearchWorkflowTemplate[] {
  return RESEARCH_WORKFLOW_TEMPLATES.filter(template => template.agentType === agentType);
}

/**
 * Get workflow template by ID
 */
export function getWorkflowTemplateById(id: string): ResearchWorkflowTemplate | null {
  return RESEARCH_WORKFLOW_TEMPLATES.find(template => template.id === id) || null;
}

/**
 * Search workflow templates by tags
 */
export function searchWorkflowTemplatesByTags(tags: string[]): ResearchWorkflowTemplate[] {
  return RESEARCH_WORKFLOW_TEMPLATES.filter(template =>
    tags.some(tag => template.metadata.tags.includes(tag))
  );
}

/**
 * Get MENA-specific workflow templates
 */
export function getMENASpecificTemplates(): ResearchWorkflowTemplate[] {
  return RESEARCH_WORKFLOW_TEMPLATES.filter(template => template.menaSpecific.culturalAdaptation);
}

/**
 * Get Islamic compliance workflow templates
 */
export function getIslamicComplianceTemplates(): ResearchWorkflowTemplate[] {
  return RESEARCH_WORKFLOW_TEMPLATES.filter(template => template.menaSpecific.islamicCompliance);
}

// Export all templates and utilities
export {
  menaMarketAnalysisWorkflow,
  islamicFinanceAnalysisWorkflow,
  hajjUmrahPlanningWorkflow,
  halalRestaurantAnalysisWorkflow,
  menaLegalComplianceWorkflow
};