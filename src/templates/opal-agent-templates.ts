/**
 * 🔷 OPAL AGENT TEMPLATES FOR MENA SPECIALIZATIONS
 * 
 * Comprehensive Opal workflow templates for each MENA agent type
 * Includes cultural and linguistic considerations for MENA markets
 * Integration with Islamic finance calculations and regional requirements
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { OpalWorkflowTemplate, OpalNodeType } from '../types/opal-agents';
import { AgentType } from '../lib/ai-engine';

/**
 * TAJER - Business Analysis Templates
 */

export const TAJER_BUSINESS_ANALYSIS_TEMPLATES: OpalWorkflowTemplate[] = [
  {
    id: 'tajer-islamic-finance-analysis',
    name: 'Islamic Finance Deal Analysis',
    description: 'Comprehensive Islamic finance deal analysis with Sharia compliance checking',
    category: 'islamic_finance',
    agentType: AgentType.TAJER,
    nodes: [
      {
        id: 'deal_input',
        type: OpalNodeType.INPUT,
        name: 'Deal Information',
        description: 'Input deal parameters and financial data',
        position: { x: 100, y: 100 },
        config: { 
          schema: 'islamic_finance_deal',
          languages: ['en', 'ar'],
          currencySupport: ['SAR', 'AED', 'USD', 'EGP']
        },
        inputs: [],
        outputs: [{ id: 'deal_data', name: 'Deal Data', type: 'object' }]
      },
      {
        id: 'sharia_compliance',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Sharia Compliance Check',
        description: 'Analyze deal for Sharia compliance',
        position: { x: 300, y: 100 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'sharia_compliance',
          islamicPrinciples: ['riba_free', 'gharar_free', 'halal_investment']
        },
        inputs: [{ id: 'deal', name: 'Deal Data', type: 'object', required: true }],
        outputs: [{ id: 'compliance_result', name: 'Compliance Result', type: 'object' }]
      },
      {
        id: 'profit_calculation',
        type: OpalNodeType.PROCESSOR,
        name: 'Profit & Loss Calculation',
        description: 'Calculate profit distribution according to Islamic principles',
        position: { x: 500, y: 100 },
        config: { 
          algorithm: 'islamic_finance_calculation',
          calculations: ['mudarabah', 'musharakah', 'murabaha', 'ijara']
        },
        inputs: [
          { id: 'deal', name: 'Deal Data', type: 'object', required: true },
          { id: 'compliance', name: 'Compliance Result', type: 'object', required: true }
        ],
        outputs: [{ id: 'profit_analysis', name: 'Profit Analysis', type: 'object' }]
      },
      {
        id: 'zakat_calculation',
        type: OpalNodeType.PROCESSOR,
        name: 'Zakat Calculation',
        description: 'Calculate applicable Zakat amounts',
        position: { x: 700, y: 100 },
        config: { 
          algorithm: 'zakat_calculation',
          rates: { gold: 2.5, silver: 2.5, cash: 2.5, trade_goods: 2.5 }
        },
        inputs: [{ id: 'profit', name: 'Profit Analysis', type: 'object', required: true }],
        outputs: [{ id: 'zakat_amount', name: 'Zakat Amount', type: 'object' }]
      },
      {
        id: 'risk_assessment',
        type: OpalNodeType.DECISION,
        name: 'Risk Assessment',
        description: 'Assess investment risks from Islamic perspective',
        position: { x: 500, y: 300 },
        config: { 
          riskFactors: ['market_risk', 'credit_risk', 'operational_risk', 'compliance_risk'],
          mitigationStrategies: ['diversification', 'insurance', 'due_diligence']
        },
        inputs: [
          { id: 'profit', name: 'Profit Analysis', type: 'object', required: true },
          { id: 'zakat', name: 'Zakat Amount', type: 'object', required: true }
        ],
        outputs: [{ id: 'risk_profile', name: 'Risk Profile', type: 'object' }]
      },
      {
        id: 'final_report',
        type: OpalNodeType.OUTPUT,
        name: 'Islamic Finance Report',
        description: 'Generate comprehensive Islamic finance analysis report',
        position: { x: 900, y: 200 },
        config: { 
          format: 'islamic_finance_report',
          languages: ['en', 'ar'],
          includeCharts: true,
          complianceCertificates: true
        },
        inputs: [
          { id: 'compliance', name: 'Compliance Result', type: 'object', required: true },
          { id: 'profit', name: 'Profit Analysis', type: 'object', required: true },
          { id: 'zakat', name: 'Zakat Amount', type: 'object', required: true },
          { id: 'risk', name: 'Risk Profile', type: 'object', required: true }
        ],
        outputs: []
      }
    ],
    connections: [
      {
        id: 'c1',
        sourceNodeId: 'deal_input',
        sourceOutputId: 'deal_data',
        targetNodeId: 'sharia_compliance',
        targetInputId: 'deal'
      },
      {
        id: 'c2',
        sourceNodeId: 'sharia_compliance',
        sourceOutputId: 'compliance_result',
        targetNodeId: 'profit_calculation',
        targetInputId: 'compliance'
      },
      {
        id: 'c3',
        sourceNodeId: 'deal_input',
        sourceOutputId: 'deal_data',
        targetNodeId: 'profit_calculation',
        targetInputId: 'deal'
      },
      {
        id: 'c4',
        sourceNodeId: 'profit_calculation',
        sourceOutputId: 'profit_analysis',
        targetNodeId: 'zakat_calculation',
        targetInputId: 'profit'
      },
      {
        id: 'c5',
        sourceNodeId: 'zakat_calculation',
        sourceOutputId: 'zakat_amount',
        targetNodeId: 'risk_assessment',
        targetInputId: 'zakat'
      },
      {
        id: 'c6',
        sourceNodeId: 'profit_calculation',
        sourceOutputId: 'profit_analysis',
        targetNodeId: 'risk_assessment',
        targetInputId: 'profit'
      },
      {
        id: 'c7',
        sourceNodeId: 'sharia_compliance',
        sourceOutputId: 'compliance_result',
        targetNodeId: 'final_report',
        targetInputId: 'compliance'
      },
      {
        id: 'c8',
        sourceNodeId: 'profit_calculation',
        sourceOutputId: 'profit_analysis',
        targetNodeId: 'final_report',
        targetInputId: 'profit'
      },
      {
        id: 'c9',
        sourceNodeId: 'zakat_calculation',
        sourceOutputId: 'zakat_amount',
        targetNodeId: 'final_report',
        targetInputId: 'zakat'
      },
      {
        id: 'c10',
        sourceNodeId: 'risk_assessment',
        sourceOutputId: 'risk_profile',
        targetNodeId: 'final_report',
        targetInputId: 'risk'
      }
    ],
    metadata: {
      version: '1.0.0',
      author: 'axiom-core',
      tags: ['islamic-finance', 'sharia-compliance', 'zakat', 'risk-assessment', 'tajer'],
      useCases: ['Islamic investment analysis', 'Sharia compliance checking', 'Zakat calculation'],
      prerequisites: ['Islamic finance knowledge', 'Sharia principles understanding', 'Risk assessment tools']
    }
  },
  {
    id: 'tajer-mena-market-research',
    name: 'MENA Market Research Automation',
    description: 'Automated market research for MENA region with cultural adaptation',
    category: 'market_research',
    agentType: AgentType.TAJER,
    nodes: [
      {
        id: 'market_parameters',
        type: OpalNodeType.INPUT,
        name: 'Market Research Parameters',
        description: 'Define market research scope and parameters',
        position: { x: 100, y: 100 },
        config: { 
          schema: 'market_research_params',
          regions: ['GCC', 'Levant', 'North Africa', 'MENA'],
          languages: ['en', 'ar', 'fr'],
          currencies: ['SAR', 'AED', 'USD', 'EGP', 'LBP']
        },
        inputs: [],
        outputs: [{ id: 'research_params', name: 'Research Parameters', type: 'object' }]
      },
      {
        id: 'cultural_analysis',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Cultural Context Analysis',
        description: 'Analyze cultural factors affecting market',
        position: { x: 300, y: 100 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'cultural_analysis',
          culturalFactors: ['religion', 'traditions', 'language', 'business_etiquette']
        },
        inputs: [{ id: 'params', name: 'Research Parameters', type: 'object', required: true }],
        outputs: [{ id: 'cultural_insights', name: 'Cultural Insights', type: 'object' }]
      },
      {
        id: 'competitor_analysis',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Competitor Analysis',
        description: 'Analyze competitive landscape in target market',
        position: { x: 300, y: 300 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'competitor_analysis',
          focusAreas: ['pricing', 'products', 'market_share', 'strategies']
        },
        inputs: [{ id: 'params', name: 'Research Parameters', type: 'object', required: true }],
        outputs: [{ id: 'competitor_data', name: 'Competitor Data', type: 'object' }]
      },
      {
        id: 'data_aggregation',
        type: OpalNodeType.PROCESSOR,
        name: 'Market Data Aggregation',
        description: 'Aggregate and process market data from multiple sources',
        position: { x: 500, y: 200 },
        config: { 
          algorithm: 'market_data_aggregation',
          dataSources: ['government_stats', 'industry_reports', 'surveys', 'social_media']
        },
        inputs: [
          { id: 'cultural', name: 'Cultural Insights', type: 'object', required: true },
          { id: 'competitor', name: 'Competitor Data', type: 'object', required: true }
        ],
        outputs: [{ id: 'aggregated_data', name: 'Aggregated Data', type: 'object' }]
      },
      {
        id: 'opportunity_identification',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Opportunity Identification',
        description: 'Identify market opportunities using AI analysis',
        position: { x: 700, y: 200 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'opportunity_identification',
          opportunityTypes: ['market_gap', 'underserved_segments', 'new_trends', 'innovation_areas']
        },
        inputs: [{ id: 'data', name: 'Aggregated Data', type: 'object', required: true }],
        outputs: [{ id: 'opportunities', name: 'Opportunities', type: 'object' }]
      },
      {
        id: 'market_report',
        type: OpalNodeType.OUTPUT,
        name: 'Market Research Report',
        description: 'Generate comprehensive market research report',
        position: { x: 900, y: 200 },
        config: { 
          format: 'market_research_report',
          languages: ['en', 'ar'],
          includeCharts: true,
          executiveSummary: true,
          recommendations: true
        },
        inputs: [
          { id: 'cultural', name: 'Cultural Insights', type: 'object', required: true },
          { id: 'competitor', name: 'Competitor Data', type: 'object', required: true },
          { id: 'aggregated', name: 'Aggregated Data', type: 'object', required: true },
          { id: 'opportunities', name: 'Opportunities', type: 'object', required: true }
        ],
        outputs: []
      }
    ],
    connections: [
      {
        id: 'c1',
        sourceNodeId: 'market_parameters',
        sourceOutputId: 'research_params',
        targetNodeId: 'cultural_analysis',
        targetInputId: 'params'
      },
      {
        id: 'c2',
        sourceNodeId: 'market_parameters',
        sourceOutputId: 'research_params',
        targetNodeId: 'competitor_analysis',
        targetInputId: 'params'
      },
      {
        id: 'c3',
        sourceNodeId: 'cultural_analysis',
        sourceOutputId: 'cultural_insights',
        targetNodeId: 'data_aggregation',
        targetInputId: 'cultural'
      },
      {
        id: 'c4',
        sourceNodeId: 'competitor_analysis',
        sourceOutputId: 'competitor_data',
        targetNodeId: 'data_aggregation',
        targetInputId: 'competitor'
      },
      {
        id: 'c5',
        sourceNodeId: 'data_aggregation',
        sourceOutputId: 'aggregated_data',
        targetNodeId: 'opportunity_identification',
        targetInputId: 'data'
      },
      {
        id: 'c6',
        sourceNodeId: 'cultural_analysis',
        sourceOutputId: 'cultural_insights',
        targetNodeId: 'market_report',
        targetInputId: 'cultural'
      },
      {
        id: 'c7',
        sourceNodeId: 'competitor_analysis',
        sourceOutputId: 'competitor_data',
        targetNodeId: 'market_report',
        targetInputId: 'competitor'
      },
      {
        id: 'c8',
        sourceNodeId: 'data_aggregation',
        sourceOutputId: 'aggregated_data',
        targetNodeId: 'market_report',
        targetInputId: 'aggregated'
      },
      {
        id: 'c9',
        sourceNodeId: 'opportunity_identification',
        sourceOutputId: 'opportunities',
        targetNodeId: 'market_report',
        targetInputId: 'opportunities'
      }
    ],
    metadata: {
      version: '1.0.0',
      author: 'axiom-core',
      tags: ['market-research', 'cultural-analysis', 'competitor-analysis', 'mena', 'tajer'],
      useCases: ['Market entry strategy', 'Competitive intelligence', 'Opportunity assessment'],
      prerequisites: ['Market data sources', 'Cultural knowledge base', 'Analytics tools']
    }
  }
];

/**
 * MUSAFIR - Travel Planning Templates
 */

export const MUSAFIR_TRAVEL_TEMPLATES: OpalWorkflowTemplate[] = [
  {
    id: 'musafir-hajj-umrah-planning',
    name: 'Hajj & Umrah Journey Planning',
    description: 'Specialized workflow for Hajj and Umrah pilgrimage planning',
    category: 'religious_travel',
    agentType: AgentType.MUSAFIR,
    nodes: [
      {
        id: 'pilgrim_info',
        type: OpalNodeType.INPUT,
        name: 'Pilgrim Information',
        description: 'Input pilgrim details and requirements',
        position: { x: 100, y: 100 },
        config: { 
          schema: 'hajj_umrah_pilgrim',
          languages: ['en', 'ar', 'ur', 'bn', 'id'],
          specialNeeds: true
        },
        inputs: [],
        outputs: [{ id: 'pilgrim_data', name: 'Pilgrim Data', type: 'object' }]
      },
      {
        id: 'visa_requirements',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Visa & Documentation',
        description: 'Check visa requirements and documentation',
        position: { x: 300, y: 100 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'visa_requirements',
          countries: ['Saudi Arabia'],
          visaTypes: ['hajj_visa', 'umrah_visa', 'tourist_visa']
        },
        inputs: [{ id: 'pilgrim', name: 'Pilgrim Data', type: 'object', required: true }],
        outputs: [{ id: 'visa_info', name: 'Visa Information', type: 'object' }]
      },
      {
        id: 'accommodation_planning',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Accommodation Planning',
        description: 'Find suitable accommodation near holy sites',
        position: { x: 300, y: 300 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'accommodation_search',
          proximity: ['haram', 'masjid_nabawi', 'holy_sites'],
          categories: ['hotels', 'apartments', 'pilgrim_camps']
        },
        inputs: [{ id: 'pilgrim', name: 'Pilgrim Data', type: 'object', required: true }],
        outputs: [{ id: 'accommodation_options', name: 'Accommodation Options', type: 'object' }]
      },
      {
        id: 'transport_planning',
        type: OpalNodeType.PROCESSOR,
        name: 'Transport Planning',
        description: 'Plan transport between holy sites',
        position: { x: 500, y: 200 },
        config: { 
          algorithm: 'hajj_transport_planning',
          transportModes: ['bus', 'train', 'taxi', 'walking'],
          routes: ['makkah_madinah', 'makkah_mina', 'mina_arafat', 'arafat_muzdalifah']
        },
        inputs: [
          { id: 'pilgrim', name: 'Pilgrim Data', type: 'object', required: true },
          { id: 'accommodation', name: 'Accommodation Options', type: 'object', required: true }
        ],
        outputs: [{ id: 'transport_plan', name: 'Transport Plan', type: 'object' }]
      },
      {
        id: 'ritual_guidance',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Ritual Guidance',
        description: 'Provide step-by-step ritual guidance',
        position: { x: 700, y: 200 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'ritual_guidance',
          rituals: ['tawaf', 'sai', 'wuquf_arafat', 'rami_jamarat', 'qurban'],
          languages: ['en', 'ar', 'ur', 'bn']
        },
        inputs: [{ id: 'pilgrim', name: 'Pilgrim Data', type: 'object', required: true }],
        outputs: [{ id: 'ritual_guide', name: 'Ritual Guide', type: 'object' }]
      },
      {
        id: 'budget_calculation',
        type: OpalNodeType.PROCESSOR,
        name: 'Budget Calculation',
        description: 'Calculate total pilgrimage budget',
        position: { x: 500, y: 400 },
        config: { 
          algorithm: 'hajj_budget_calculation',
          currencies: ['SAR', 'USD', 'EUR', 'GBP', 'PKR', 'BDT'],
          costCategories: ['visa', 'flights', 'accommodation', 'transport', 'food', 'qurban']
        },
        inputs: [
          { id: 'pilgrim', name: 'Pilgrim Data', type: 'object', required: true },
          { id: 'accommodation', name: 'Accommodation Options', type: 'object', required: true },
          { id: 'transport', name: 'Transport Plan', type: 'object', required: true }
        ],
        outputs: [{ id: 'budget_breakdown', name: 'Budget Breakdown', type: 'object' }]
      },
      {
        id: 'itinerary_output',
        type: OpalNodeType.OUTPUT,
        name: 'Complete Pilgrimage Itinerary',
        description: 'Generate complete Hajj/Umrah itinerary',
        position: { x: 900, y: 200 },
        config: { 
          format: 'pilgrimage_itinerary',
          languages: ['en', 'ar', 'ur', 'bn'],
          includeMaps: true,
          emergencyContacts: true,
          checklist: true
        },
        inputs: [
          { id: 'visa', name: 'Visa Information', type: 'object', required: true },
          { id: 'accommodation', name: 'Accommodation Options', type: 'object', required: true },
          { id: 'transport', name: 'Transport Plan', type: 'object', required: true },
          { id: 'rituals', name: 'Ritual Guide', type: 'object', required: true },
          { id: 'budget', name: 'Budget Breakdown', type: 'object', required: true }
        ],
        outputs: []
      }
    ],
    connections: [
      {
        id: 'c1',
        sourceNodeId: 'pilgrim_info',
        sourceOutputId: 'pilgrim_data',
        targetNodeId: 'visa_requirements',
        targetInputId: 'pilgrim'
      },
      {
        id: 'c2',
        sourceNodeId: 'pilgrim_info',
        sourceOutputId: 'pilgrim_data',
        targetNodeId: 'accommodation_planning',
        targetInputId: 'pilgrim'
      },
      {
        id: 'c3',
        sourceNodeId: 'pilgrim_info',
        sourceOutputId: 'pilgrim_data',
        targetNodeId: 'transport_planning',
        targetInputId: 'pilgrim'
      },
      {
        id: 'c4',
        sourceNodeId: 'accommodation_planning',
        sourceOutputId: 'accommodation_options',
        targetNodeId: 'transport_planning',
        targetInputId: 'accommodation'
      },
      {
        id: 'c5',
        sourceNodeId: 'pilgrim_info',
        sourceOutputId: 'pilgrim_data',
        targetNodeId: 'ritual_guidance',
        targetInputId: 'pilgrim'
      },
      {
        id: 'c6',
        sourceNodeId: 'pilgrim_info',
        sourceOutputId: 'pilgrim_data',
        targetNodeId: 'budget_calculation',
        targetInputId: 'pilgrim'
      },
      {
        id: 'c7',
        sourceNodeId: 'accommodation_planning',
        sourceOutputId: 'accommodation_options',
        targetNodeId: 'budget_calculation',
        targetInputId: 'accommodation'
      },
      {
        id: 'c8',
        sourceNodeId: 'transport_planning',
        sourceOutputId: 'transport_plan',
        targetNodeId: 'budget_calculation',
        targetInputId: 'transport'
      },
      {
        id: 'c9',
        sourceNodeId: 'visa_requirements',
        sourceOutputId: 'visa_info',
        targetNodeId: 'itinerary_output',
        targetInputId: 'visa'
      },
      {
        id: 'c10',
        sourceNodeId: 'accommodation_planning',
        sourceOutputId: 'accommodation_options',
        targetNodeId: 'itinerary_output',
        targetInputId: 'accommodation'
      },
      {
        id: 'c11',
        sourceNodeId: 'transport_planning',
        sourceOutputId: 'transport_plan',
        targetNodeId: 'itinerary_output',
        targetInputId: 'transport'
      },
      {
        id: 'c12',
        sourceNodeId: 'ritual_guidance',
        sourceOutputId: 'ritual_guide',
        targetNodeId: 'itinerary_output',
        targetInputId: 'rituals'
      },
      {
        id: 'c13',
        sourceNodeId: 'budget_calculation',
        sourceOutputId: 'budget_breakdown',
        targetNodeId: 'itinerary_output',
        targetInputId: 'budget'
      }
    ],
    metadata: {
      version: '1.0.0',
      author: 'axiom-core',
      tags: ['hajj', 'umrah', 'pilgrimage', 'religious-travel', 'musafir'],
      useCases: ['Hajj planning', 'Umrah packages', 'Pilgrimage guidance'],
      prerequisites: ['Saudi visa regulations', 'Hajj authority guidelines', 'Islamic knowledge']
    }
  },
  {
    id: 'musafir-cultural-tour',
    name: 'MENA Cultural Heritage Tour',
    description: 'Cultural heritage and historical sites tour planning',
    category: 'cultural_tourism',
    agentType: AgentType.MUSAFIR,
    nodes: [
      {
        id: 'tour_preferences',
        type: OpalNodeType.INPUT,
        name: 'Tour Preferences',
        description: 'Input cultural tour preferences and interests',
        position: { x: 100, y: 100 },
        config: { 
          schema: 'cultural_tour_preferences',
          interests: ['history', 'architecture', 'art', 'food', 'music', 'traditions'],
          regions: ['north_africa', 'levant', 'gcc', 'mesopotamia'],
          periods: ['ancient', 'islamic_golden_age', 'ottoman', 'modern']
        },
        inputs: [],
        outputs: [{ id: 'preferences', name: 'Tour Preferences', type: 'object' }]
      },
      {
        id: 'heritage_sites',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Heritage Sites Identification',
        description: 'Identify relevant heritage sites based on preferences',
        position: { x: 300, y: 100 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'heritage_sites_search',
          siteTypes: ['unesco', 'mosques', 'museums', 'ancient_ruins', 'historical_districts'],
          accessibility: true
        },
        inputs: [{ id: 'prefs', name: 'Tour Preferences', type: 'object', required: true }],
        outputs: [{ id: 'heritage_sites', name: 'Heritage Sites', type: 'object' }]
      },
      {
        id: 'cultural_context',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Cultural Context Analysis',
        description: 'Provide cultural and historical context',
        position: { x: 300, y: 300 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'cultural_context',
          aspects: ['history', 'traditions', 'etiquette', 'language', 'cuisine']
        },
        inputs: [{ id: 'prefs', name: 'Tour Preferences', type: 'object', required: true }],
        outputs: [{ id: 'cultural_info', name: 'Cultural Information', type: 'object' }]
      },
      {
        id: 'route_optimization',
        type: OpalNodeType.PROCESSOR,
        name: 'Tour Route Optimization',
        description: 'Optimize travel route between heritage sites',
        position: { x: 500, y: 200 },
        config: { 
          algorithm: 'tour_route_optimization',
          factors: ['distance', 'time', 'cultural_significance', 'opening_hours'],
          transportModes: ['walking', 'public_transport', 'private_car', 'guided_tour']
        },
        inputs: [
          { id: 'sites', name: 'Heritage Sites', type: 'object', required: true },
          { id: 'prefs', name: 'Tour Preferences', type: 'object', required: true }
        ],
        outputs: [{ id: 'optimized_route', name: 'Optimized Route', type: 'object' }]
      },
      {
        id: 'local_experiences',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Local Experiences',
        description: 'Identify authentic local cultural experiences',
        position: { x: 700, y: 200 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'local_experiences',
          experienceTypes: ['traditional_crafts', 'cooking_classes', 'music_performances', 'festivals', 'local_markets']
        },
        inputs: [
          { id: 'route', name: 'Optimized Route', type: 'object', required: true },
          { id: 'cultural', name: 'Cultural Information', type: 'object', required: true }
        ],
        outputs: [{ id: 'experiences', name: 'Local Experiences', type: 'object' }]
      },
      {
        id: 'cultural_itinerary',
        type: OpalNodeType.OUTPUT,
        name: 'Cultural Heritage Itinerary',
        description: 'Generate comprehensive cultural tour itinerary',
        position: { x: 900, y: 200 },
        config: { 
          format: 'cultural_tour_itinerary',
          languages: ['en', 'ar', 'fr'],
          includeCulturalNotes: true,
          historicalTimeline: true,
          photographyTips: true
        },
        inputs: [
          { id: 'sites', name: 'Heritage Sites', type: 'object', required: true },
          { id: 'cultural', name: 'Cultural Information', type: 'object', required: true },
          { id: 'route', name: 'Optimized Route', type: 'object', required: true },
          { id: 'experiences', name: 'Local Experiences', type: 'object', required: true }
        ],
        outputs: []
      }
    ],
    connections: [
      {
        id: 'c1',
        sourceNodeId: 'tour_preferences',
        sourceOutputId: 'preferences',
        targetNodeId: 'heritage_sites',
        targetInputId: 'prefs'
      },
      {
        id: 'c2',
        sourceNodeId: 'tour_preferences',
        sourceOutputId: 'preferences',
        targetNodeId: 'cultural_context',
        targetInputId: 'prefs'
      },
      {
        id: 'c3',
        sourceNodeId: 'heritage_sites',
        sourceOutputId: 'heritage_sites',
        targetNodeId: 'route_optimization',
        targetInputId: 'sites'
      },
      {
        id: 'c4',
        sourceNodeId: 'tour_preferences',
        sourceOutputId: 'preferences',
        targetNodeId: 'route_optimization',
        targetInputId: 'prefs'
      },
      {
        id: 'c5',
        sourceNodeId: 'route_optimization',
        sourceOutputId: 'optimized_route',
        targetNodeId: 'local_experiences',
        targetInputId: 'route'
      },
      {
        id: 'c6',
        sourceNodeId: 'cultural_context',
        sourceOutputId: 'cultural_info',
        targetNodeId: 'local_experiences',
        targetInputId: 'cultural'
      },
      {
        id: 'c7',
        sourceNodeId: 'heritage_sites',
        sourceOutputId: 'heritage_sites',
        targetNodeId: 'cultural_itinerary',
        targetInputId: 'sites'
      },
      {
        id: 'c8',
        sourceNodeId: 'cultural_context',
        sourceOutputId: 'cultural_info',
        targetNodeId: 'cultural_itinerary',
        targetInputId: 'cultural'
      },
      {
        id: 'c9',
        sourceNodeId: 'route_optimization',
        sourceOutputId: 'optimized_route',
        targetNodeId: 'cultural_itinerary',
        targetInputId: 'route'
      },
      {
        id: 'c10',
        sourceNodeId: 'local_experiences',
        sourceOutputId: 'experiences',
        targetNodeId: 'cultural_itinerary',
        targetInputId: 'experiences'
      }
    ],
    metadata: {
      version: '1.0.0',
      author: 'axiom-core',
      tags: ['cultural-tourism', 'heritage', 'history', 'museums', 'musafir'],
      useCases: ['Cultural tours', 'Historical site visits', 'Educational travel'],
      prerequisites: ['Heritage site database', 'Cultural knowledge base', 'Route optimization']
    }
  }
];

/**
 * SOFRA - Restaurant Management Templates
 */

export const SOFRA_RESTAURANT_TEMPLATES: OpalWorkflowTemplate[] = [
  {
    id: 'sofra-halal-certification',
    name: 'Halal Certification Process',
    description: 'Complete Halal certification workflow for restaurants',
    category: 'halal_compliance',
    agentType: AgentType.SOFRA,
    nodes: [
      {
        id: 'restaurant_info',
        type: OpalNodeType.INPUT,
        name: 'Restaurant Information',
        description: 'Input restaurant details for Halal certification',
        position: { x: 100, y: 100 },
        config: { 
          schema: 'halal_certification_restaurant',
          certificationBodies: ['JAKIM', 'MUIS', 'MUI', 'ESMA', 'SFDA'],
          documentTypes: ['business_license', 'supplier_certificates', 'ingredient_lists']
        },
        inputs: [],
        outputs: [{ id: 'restaurant_data', name: 'Restaurant Data', type: 'object' }]
      },
      {
        id: 'compliance_check',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Halal Compliance Analysis',
        description: 'Analyze restaurant for Halal compliance requirements',
        position: { x: 300, y: 100 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'halal_compliance',
          complianceAreas: ['ingredients', 'preparation', 'storage', 'handling', 'sourcing']
        },
        inputs: [{ id: 'restaurant', name: 'Restaurant Data', type: 'object', required: true }],
        outputs: [{ id: 'compliance_analysis', name: 'Compliance Analysis', type: 'object' }]
      },
      {
        id: 'supplier_verification',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Supplier Halal Verification',
        description: 'Verify supplier Halal certification status',
        position: { x: 300, y: 300 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'supplier_verification',
          verificationMethods: ['certificate_check', 'facility_audit', 'traceability']
        },
        inputs: [{ id: 'restaurant', name: 'Restaurant Data', type: 'object', required: true }],
        outputs: [{ id: 'supplier_status', name: 'Supplier Status', type: 'object' }]
      },
      {
        id: 'gap_analysis',
        type: OpalNodeType.PROCESSOR,
        name: 'Compliance Gap Analysis',
        description: 'Identify gaps in Halal compliance',
        position: { x: 500, y: 200 },
        config: { 
          algorithm: 'compliance_gap_analysis',
          gapCategories: ['documentation', 'processes', 'facilities', 'training'],
          priorityLevels: ['critical', 'major', 'minor']
        },
        inputs: [
          { id: 'compliance', name: 'Compliance Analysis', type: 'object', required: true },
          { id: 'suppliers', name: 'Supplier Status', type: 'object', required: true }
        ],
        outputs: [{ id: 'gap_report', name: 'Gap Report', type: 'object' }]
      },
      {
        id: 'improvement_plan',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Improvement Plan Generation',
        description: 'Generate improvement plan for Halal compliance',
        position: { x: 700, y: 200 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'improvement_planning',
          timeline: ['immediate', 'short_term', 'long_term'],
          resources: ['training', 'equipment', 'documentation', 'procedures']
        },
        inputs: [{ id: 'gaps', name: 'Gap Report', type: 'object', required: true }],
        outputs: [{ id: 'improvement_plan', name: 'Improvement Plan', type: 'object' }]
      },
      {
        id: 'certification_readiness',
        type: OpalNodeType.DECISION,
        name: 'Certification Readiness Assessment',
        description: 'Assess readiness for Halal certification',
        position: { x: 500, y: 400 },
        config: { 
          criteria: ['compliance_score', 'documentation_complete', 'supplier_verified', 'facility_ready'],
          thresholds: { ready: 90, conditional: 70, not_ready: 50 }
        },
        inputs: [
          { id: 'compliance', name: 'Compliance Analysis', type: 'object', required: true },
          { id: 'suppliers', name: 'Supplier Status', type: 'object', required: true },
          { id: 'gaps', name: 'Gap Report', type: 'object', required: true }
        ],
        outputs: [{ id: 'readiness_assessment', name: 'Readiness Assessment', type: 'object' }]
      },
      {
        id: 'halal_certification_report',
        type: OpalNodeType.OUTPUT,
        name: 'Halal Certification Report',
        description: 'Generate comprehensive Halal certification report',
        position: { x: 900, y: 200 },
        config: { 
          format: 'halal_certification_report',
          languages: ['en', 'ar'],
          includeChecklist: true,
          auditTrail: true,
          recommendations: true
        },
        inputs: [
          { id: 'compliance', name: 'Compliance Analysis', type: 'object', required: true },
          { id: 'suppliers', name: 'Supplier Status', type: 'object', required: true },
          { id: 'gaps', name: 'Gap Report', type: 'object', required: true },
          { id: 'improvements', name: 'Improvement Plan', type: 'object', required: true },
          { id: 'readiness', name: 'Readiness Assessment', type: 'object', required: true }
        ],
        outputs: []
      }
    ],
    connections: [
      {
        id: 'c1',
        sourceNodeId: 'restaurant_info',
        sourceOutputId: 'restaurant_data',
        targetNodeId: 'compliance_check',
        targetInputId: 'restaurant'
      },
      {
        id: 'c2',
        sourceNodeId: 'restaurant_info',
        sourceOutputId: 'restaurant_data',
        targetNodeId: 'supplier_verification',
        targetInputId: 'restaurant'
      },
      {
        id: 'c3',
        sourceNodeId: 'compliance_check',
        sourceOutputId: 'compliance_analysis',
        targetNodeId: 'gap_analysis',
        targetInputId: 'compliance'
      },
      {
        id: 'c4',
        sourceNodeId: 'supplier_verification',
        sourceOutputId: 'supplier_status',
        targetNodeId: 'gap_analysis',
        targetInputId: 'suppliers'
      },
      {
        id: 'c5',
        sourceNodeId: 'gap_analysis',
        sourceOutputId: 'gap_report',
        targetNodeId: 'improvement_plan',
        targetInputId: 'gaps'
      },
      {
        id: 'c6',
        sourceNodeId: 'compliance_check',
        sourceOutputId: 'compliance_analysis',
        targetNodeId: 'certification_readiness',
        targetInputId: 'compliance'
      },
      {
        id: 'c7',
        sourceNodeId: 'supplier_verification',
        sourceOutputId: 'supplier_status',
        targetNodeId: 'certification_readiness',
        targetInputId: 'suppliers'
      },
      {
        id: 'c8',
        sourceNodeId: 'gap_analysis',
        sourceOutputId: 'gap_report',
        targetNodeId: 'certification_readiness',
        targetInputId: 'gaps'
      },
      {
        id: 'c9',
        sourceNodeId: 'compliance_check',
        sourceOutputId: 'compliance_analysis',
        targetNodeId: 'halal_certification_report',
        targetInputId: 'compliance'
      },
      {
        id: 'c10',
        sourceNodeId: 'supplier_verification',
        sourceOutputId: 'supplier_status',
        targetNodeId: 'halal_certification_report',
        targetInputId: 'suppliers'
      },
      {
        id: 'c11',
        sourceNodeId: 'gap_analysis',
        sourceOutputId: 'gap_report',
        targetNodeId: 'halal_certification_report',
        targetInputId: 'gaps'
      },
      {
        id: 'c12',
        sourceNodeId: 'improvement_plan',
        sourceOutputId: 'improvement_plan',
        targetNodeId: 'halal_certification_report',
        targetInputId: 'improvements'
      },
      {
        id: 'c13',
        sourceNodeId: 'certification_readiness',
        sourceOutputId: 'readiness_assessment',
        targetNodeId: 'halal_certification_report',
        targetInputId: 'readiness'
      }
    ],
    metadata: {
      version: '1.0.0',
      author: 'axiom-core',
      tags: ['halal', 'certification', 'compliance', 'food-safety', 'sofra'],
      useCases: ['Halal certification preparation', 'Compliance auditing', 'Quality assurance'],
      prerequisites: ['Halal standards knowledge', 'Food safety regulations', 'Supplier management']
    }
  }
];

/**
 * MOSTASHAR - Legal Document Templates
 */

export const MOSTASHAR_LEGAL_TEMPLATES: OpalWorkflowTemplate[] = [
  {
    id: 'mostashar-islamic-contract',
    name: 'Islamic Contract Analysis',
    description: 'Comprehensive Islamic contract analysis and compliance checking',
    category: 'islamic_law',
    agentType: AgentType.MOSTASHAR,
    nodes: [
      {
        id: 'contract_input',
        type: OpalNodeType.INPUT,
        name: 'Contract Document',
        description: 'Input contract for Islamic law analysis',
        position: { x: 100, y: 100 },
        config: { 
          schema: 'islamic_contract',
          contractTypes: ['murabaha', 'ijara', 'musharakah', 'mudarabah', 'sukuk'],
          languages: ['en', 'ar'],
          jurisdictions: ['UAE', 'Saudi Arabia', 'Malaysia', 'UK']
        },
        inputs: [],
        outputs: [{ id: 'contract_data', name: 'Contract Data', type: 'object' }]
      },
      {
        id: 'sharia_compliance',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Sharia Compliance Review',
        description: 'Review contract for Sharia compliance',
        position: { x: 300, y: 100 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'sharia_contract_review',
          compliancePrinciples: ['prohibition_of_riba', 'prohibition_of_gharar', 'risk_sharing', 'asset_backing']
        },
        inputs: [{ id: 'contract', name: 'Contract Data', type: 'object', required: true }],
        outputs: [{ id: 'sharia_analysis', name: 'Sharia Analysis', type: 'object' }]
      },
      {
        id: 'jurisdiction_check',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Jurisdiction Compliance',
        description: 'Check compliance with local jurisdiction',
        position: { x: 300, y: 300 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'jurisdiction_compliance',
          legalFrameworks: ['civil_law', 'common_law', 'islamic_finance_law'],
          regulatoryBodies: ['central_banks', 'securities_commissions', 'islamic_finance_authorities']
        },
        inputs: [{ id: 'contract', name: 'Contract Data', type: 'object', required: true }],
        outputs: [{ id: 'jurisdiction_analysis', name: 'Jurisdiction Analysis', type: 'object' }]
      },
      {
        id: 'risk_assessment',
        type: OpalNodeType.PROCESSOR,
        name: 'Legal Risk Assessment',
        description: 'Assess legal and compliance risks',
        position: { x: 500, y: 200 },
        config: { 
          algorithm: 'legal_risk_assessment',
          riskCategories: ['compliance_risk', 'operational_risk', 'legal_risk', 'reputation_risk'],
          severityLevels: ['low', 'medium', 'high', 'critical']
        },
        inputs: [
          { id: 'sharia', name: 'Sharia Analysis', type: 'object', required: true },
          { id: 'jurisdiction', name: 'Jurisdiction Analysis', type: 'object', required: true }
        ],
        outputs: [{ id: 'risk_profile', name: 'Risk Profile', type: 'object' }]
      },
      {
        id: 'clause_analysis',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Clause-by-Clause Analysis',
        description: 'Detailed analysis of contract clauses',
        position: { x: 700, y: 200 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'clause_analysis',
          clauseTypes: ['payment_terms', 'default_provisions', 'dispute_resolution', 'termination'],
          focusAreas: ['ambiguity', 'enforceability', 'fairness', 'compliance']
        },
        inputs: [
          { id: 'contract', name: 'Contract Data', type: 'object', required: true },
          { id: 'sharia', name: 'Sharia Analysis', type: 'object', required: true }
        ],
        outputs: [{ id: 'clause_analysis', name: 'Clause Analysis', type: 'object' }]
      },
      {
        id: 'recommendations',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Legal Recommendations',
        description: 'Generate legal recommendations and improvements',
        position: { x: 500, y: 400 },
        config: { 
          model: 'gemini-2.0-flash-exp',
          analysisType: 'legal_recommendations',
          recommendationTypes: ['clause_modifications', 'compliance_improvements', 'risk_mitigation', 'best_practices']
        },
        inputs: [
          { id: 'risk', name: 'Risk Profile', type: 'object', required: true },
          { id: 'clauses', name: 'Clause Analysis', type: 'object', required: true }
        ],
        outputs: [{ id: 'recommendations', name: 'Recommendations', type: 'object' }]
      },
      {
        id: 'legal_opinion',
        type: OpalNodeType.OUTPUT,
        name: 'Islamic Legal Opinion',
        description: 'Generate comprehensive Islamic legal opinion',
        position: { x: 900, y: 200 },
        config: { 
          format: 'islamic_legal_opinion',
          languages: ['en', 'ar'],
          includePrecedents: true,
          riskAssessment: true,
          actionableRecommendations: true
        },
        inputs: [
          { id: 'contract', name: 'Contract Data', type: 'object', required: true },
          { id: 'sharia', name: 'Sharia Analysis', type: 'object', required: true },
          { id: 'jurisdiction', name: 'Jurisdiction Analysis', type: 'object', required: true },
          { id: 'risk', name: 'Risk Profile', type: 'object', required: true },
          { id: 'clauses', name: 'Clause Analysis', type: 'object', required: true },
          { id: 'recommendations', name: 'Recommendations', type: 'object', required: true }
        ],
        outputs: []
      }
    ],
    connections: [
      {
        id: 'c1',
        sourceNodeId: 'contract_input',
        sourceOutputId: 'contract_data',
        targetNodeId: 'sharia_compliance',
        targetInputId: 'contract'
      },
      {
        id: 'c2',
        sourceNodeId: 'contract_input',
        sourceOutputId: 'contract_data',
        targetNodeId: 'jurisdiction_check',
        targetInputId: 'contract'
      },
      {
        id: 'c3',
        sourceNodeId: 'sharia_compliance',
        sourceOutputId: 'sharia_analysis',
        targetNodeId: 'risk_assessment',
        targetInputId: 'sharia'
      },
      {
        id: 'c4',
        sourceNodeId: 'jurisdiction_check',
        sourceOutputId: 'jurisdiction_analysis',
        targetNodeId: 'risk_assessment',
        targetInputId: 'jurisdiction'
      },
      {
        id: 'c5',
        sourceNodeId: 'contract_input',
        sourceOutputId: 'contract_data',
        targetNodeId: 'clause_analysis',
        targetInputId: 'contract'
      },
      {
        id: 'c6',
        sourceNodeId: 'sharia_compliance',
        sourceOutputId: 'sharia_analysis',
        targetNodeId: 'clause_analysis',
        targetInputId: 'sharia'
      },
      {
        id: 'c7',
        sourceNodeId: 'risk_assessment',
        sourceOutputId: 'risk_profile',
        targetNodeId: 'recommendations',
        targetInputId: 'risk'
      },
      {
        id: 'c8',
        sourceNodeId: 'clause_analysis',
        sourceOutputId: 'clause_analysis',
        targetNodeId: 'recommendations',
        targetInputId: 'clauses'
      },
      {
        id: 'c9',
        sourceNodeId: 'contract_input',
        sourceOutputId: 'contract_data',
        targetNodeId: 'legal_opinion',
        targetInputId: 'contract'
      },
      {
        id: 'c10',
        sourceNodeId: 'sharia_compliance',
        sourceOutputId: 'sharia_analysis',
        targetNodeId: 'legal_opinion',
        targetInputId: 'sharia'
      },
      {
        id: 'c11',
        sourceNodeId: 'jurisdiction_check',
        sourceOutputId: 'jurisdiction_analysis',
        targetNodeId: 'legal_opinion',
        targetInputId: 'jurisdiction'
      },
      {
        id: 'c12',
        sourceNodeId: 'risk_assessment',
        sourceOutputId: 'risk_profile',
        targetNodeId: 'legal_opinion',
        targetInputId: 'risk'
      },
      {
        id: 'c13',
        sourceNodeId: 'clause_analysis',
        sourceOutputId: 'clause_analysis',
        targetNodeId: 'legal_opinion',
        targetInputId: 'clauses'
      },
      {
        id: 'c14',
        sourceNodeId: 'recommendations',
        sourceOutputId: 'recommendations',
        targetNodeId: 'legal_opinion',
        targetInputId: 'recommendations'
      }
    ],
    metadata: {
      version: '1.0.0',
      author: 'axiom-core',
      tags: ['islamic-law', 'contract-analysis', 'sharia-compliance', 'legal-opinion', 'mostashar'],
      useCases: ['Islamic finance contracts', 'Sharia compliance review', 'Legal risk assessment'],
      prerequisites: ['Islamic law expertise', 'Contract law knowledge', 'Jurisdiction understanding']
    }
  }
];

/**
 * Complete collection of all MENA Opal templates
 */
export const COMPREHENSIVE_MENA_TEMPLATES: OpalWorkflowTemplate[] = [
  ...TAJER_BUSINESS_ANALYSIS_TEMPLATES,
  ...MUSAFIR_TRAVEL_TEMPLATES,
  ...SOFRA_RESTAURANT_TEMPLATES,
  ...MOSTASHAR_LEGAL_TEMPLATES
];

/**
 * Template categories for organization
 */
export const TEMPLATE_CATEGORIES = {
  BUSINESS_ANALYSIS: 'business_analysis',
  ISLAMIC_FINANCE: 'islamic_finance',
  MARKET_RESEARCH: 'market_research',
  RELIGIOUS_TRAVEL: 'religious_travel',
  CULTURAL_TOURISM: 'cultural_tourism',
  HALAL_COMPLIANCE: 'halal_compliance',
  ISLAMIC_LAW: 'islamic_law'
} as const;

/**
 * Get templates by agent type
 */
export function getTemplatesByAgentType(agentType: AgentType): OpalWorkflowTemplate[] {
  switch (agentType) {
    case AgentType.TAJER:
      return TAJER_BUSINESS_ANALYSIS_TEMPLATES;
    case AgentType.MUSAFIR:
      return MUSAFIR_TRAVEL_TEMPLATES;
    case AgentType.SOFRA:
      return SOFRA_RESTAURANT_TEMPLATES;
    case AgentType.MOSTASHAR:
      return MOSTASHAR_LEGAL_TEMPLATES;
    default:
      return [];
  }
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): OpalWorkflowTemplate[] {
  return COMPREHENSIVE_MENA_TEMPLATES.filter(template => template.category === category);
}

/**
 * Search templates by tags
 */
export function searchTemplatesByTags(tags: string[]): OpalWorkflowTemplate[] {
  return COMPREHENSIVE_MENA_TEMPLATES.filter(template =>
    tags.some(tag => template.metadata.tags.includes(tag))
  );
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): OpalWorkflowTemplate | null {
  return COMPREHENSIVE_MENA_TEMPLATES.find(template => template.id === templateId) || null;
}

// Export all templates and utilities
export {
  TEMPLATE_CATEGORIES
};