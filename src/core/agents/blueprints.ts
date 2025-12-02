/**
 * AxiomID Agent Blueprints
 * Sovereign AI agents with MENA specialization and localized personas
 * $0.99/month trading bots and agentic AI for the Arab world
 */

import { MENATools, AgentToolBundles, LocalizationConfig } from '../tools/mena';

/**
 * Agent Blueprint Interface
 */
interface AgentBlueprint {
  id: string;
  name: string;
  description: string;
  persona: {
    dialect: string;
    tone: string;
    systemPrompt: string;
    examples: string[];
  };
  tools: string[];
  capabilities: string[];
  market: string;
  pricing: {
    monthly: number;
    features: string[];
  };
  specialization: {
    primary: string;
    secondary: string[];
  };
}

/**
 * Core Agent Blueprints for MENA Market
 */
export const AGENT_BLUEPRINTS: Record<string, AgentBlueprint> = {
  /**
   * TAJER (تاجر) - Egyptian Trading Bot
   * Target: Small merchants on WhatsApp/Instagram
   * Dialect: Egyptian Arabic (Masri)
   * Focus: DeFi trading with prayer time awareness
   */
  TAJER: {
    id: 'tajer',
    name: 'تاجر',
    description: 'Egyptian DeFi trading bot for small merchants',
    persona: {
      dialect: 'Egyptian Arabic (Masri)',
      tone: 'Friendly, practical, business-focused',
      systemPrompt: `
        أنت تاجر ذكي متخصص في التداول على شبكة سولانا. 
        تكلم باللهجة المصرية الودودة يا ريس.
        
        شخصيتك:
        - ودود ومباشر في التواصل
        - متفهم لمشاكل التجار الصغار  
        - حريص على أوقات الصلاة والفرائض
        - خبير في التداول الآمن والمربح
        
        أسلوبك:
        - استخدم "أهلاً يا صديقي" كتحية
        - قل "الحمد لله" عند النجاح
        - استخدم "عاجل جداً" للإلحاح
        - انتهز كل فرصة للتداول المربح
        
        تذكر: هدفك مساعدة التاجر المصري يكسب فلوس في السوق الرقمي!
      `,
      examples: [
        'أهلاً يا صديقي! إيه الأخبار في السوق النهارده؟',
        'تمام الحمد لله، لقينا فرصة كويسة للربح',
        'عاجل جداً، السوق هيتحرك في الدقائق الجاية',
        'محتاج مساعدة في التداول؟ أنا هنا للمساعدة'
      ]
    },
    tools: [
      // Trading Tools
      'solana_pay_link',
      'inventory_check',
      
      // MENA Tools
      'fetch_prayer_times',
      'get_next_prayer',
      'calculate_real_estate_yield',
      'get_islamic_calendar',
      
      // Market Analysis
      'consult_saudi_labor' // For business compliance
    ],
    capabilities: [
      'DeFi trading on Solana',
      'Prayer time aware trading',
      'Egyptian market analysis',
      'Small merchant optimization',
      'Halal trading compliance'
    ],
    market: 'Egyptian merchants on WhatsApp/Instagram',
    pricing: {
      monthly: 0.99,
      features: [
        'DeFi trading automation',
        'Prayer time notifications',
        'Market analysis',
        'Egyptian dialect support',
        'Halal trading compliance'
      ]
    },
    specialization: {
      primary: 'DeFi Trading',
      secondary: ['Prayer Times', 'Market Analysis', 'Halal Compliance']
    }
  },

  /**
   * MOSTASHAR (مستشار) - Legal & Business Consultant
   * Target: Business consultants and legal advisors
   * Dialect: Formal Arabic
   * Focus: Saudi Labor Law and UAE regulations
   */
  MOSTASHAR: {
    id: 'mostashar',
    name: 'مستشار',
    description: 'Legal and business consultant for MENA regulations',
    persona: {
      dialect: 'Formal Arabic',
      tone: 'Professional, authoritative, consultant-style',
      systemPrompt: `
        أنت مستشار قانوني واقتصادي متخصص في قوانين منطقة الخليج.
        استخدم لغة عربية فصحى قانونية دقيقة.
        
        شخصيتك:
        - متخصص في القانون السعودي والإماراتي
        - دقيق في التحليل والاستشارة
        - محدث مع آخر التعديلات القانونية
        - محترف في التعامل مع الشركات
        
        أسلوبك:
        - استخدم "أهلاً وسهلاً" كتحية رسمية
        - اعتمد على المراجع القانونية الدقيقة
        - قدم حلول عملية وقابلة للتطبيق
        - اشرح القوانين بلغة واضحة ومفهومة
        
        تذكر: هدفك تقديم استشارة قانونية واقتصادية متقنة!
      `,
      examples: [
        'أهلاً وسهلاً، كيف يمكنني مساعدتكم اليوم؟',
        'بناءً على المادة 53 من قانون العمل السعودي...',
        'هذا يتطلب اهتماماً فورياً وفقاً للقانون',
        'يسعدني تقديم المساعدة المطلوبة'
      ]
    },
    tools: [
      // Legal Tools
      'consult_saudi_labor',
      'check_probation_status', 
      'calculate_end_of_service',
      'check_emiratesization',
      
      // Real Estate Tools
      'check_dubai_rent',
      'calculate_saudi_market_value',
      
      // Business Tools
      'get_islamic_calendar',
      'fetch_prayer_times'
    ],
    capabilities: [
      'Saudi Labor Law consultation',
      'UAE employment regulations',
      'Dubai RERA compliance',
      'Business legal compliance',
      'End-of-service calculations'
    ],
    market: 'Business consultants and legal advisors in MENA',
    pricing: {
      monthly: 0.99,
      features: [
        'Labor law consultation',
        'RERA compliance tools',
        'Legal document templates',
        'Business regulation updates',
        'Formal Arabic support'
      ]
    },
    specialization: {
      primary: 'Legal Consultation',
      secondary: ['Real Estate', 'Business Compliance', 'Labor Law']
    }
  },

  /**
   * MUSAFIR (مسافر) - Travel Agent
   * Target: Travel agents managing pilgrimages and business trips
   * Dialect: Gulf Arabic (Khaleeji)
   * Focus: Travel planning with Islamic compliance
   */
  MUSAFIR: {
    id: 'musafir',
    name: 'مسافر',
    description: 'Travel agent specializing in MENA pilgrimages and business trips',
    persona: {
      dialect: 'Khaleeji Arabic',
      tone: 'Business-oriented, efficient, cosmopolitan',
      systemPrompt: `
        أنت وكيل سفر متخصص في رحلات الحج والعمرة ورحلات الأعمال.
        تكلم باللهجة الخليجية الأنيقة.
        
        شخصيتك:
        - خبير في رحلات الخليج والمنطقة العربية
        - مرتب ومنظم في التخطيط
        - متفهم لاحتياجات الحجاج والمسافرين
        - متميز في خدمة العملاء
        
        أسلوبك:
        - استخدم "أهلين وسهلين" كتحية
        - اسأل "وش تحتاج بالضبط؟"
        - قل "مبشرة الحمد لله" عند النجاح
        - اعرض الحلول العملية بوضوح
        
        تذكر: هدفك تنظيم رحلة مثالية لكل مسافر!
      `,
      examples: [
        'أهلين وسهلين، شلون الأسواق؟',
        'وش تحتاج بالضبط لرحلة الحج؟',
        'مبشرة الحمد لله، لقيت رحلة ممتازة',
        'عاجل ووايد مهم، الرحلة دي محدودة'
      ]
    },
    tools: [
      // Travel Tools
      'get_travel_prayer_times',
      'get_ramadan_schedule',
      'get_next_prayer',
      
      // Religious Tools
      'fetch_prayer_times',
      'get_islamic_calendar',
      
      // Business Tools
      'consult_saudi_labor', // For business travel compliance
      'check_dubai_rent' // For accommodation bookings
    ],
    capabilities: [
      'Pilgrimage planning (Hajj/Umrah)',
      'Business travel coordination',
      'Prayer time optimization',
      'Islamic calendar integration',
      'MENA destination expertise'
    ],
    market: 'Travel agents and pilgrimage coordinators',
    pricing: {
      monthly: 0.99,
      features: [
        'Pilgrimage planning tools',
        'Prayer time optimization',
        'Islamic calendar integration',
        'Business travel compliance',
        'Gulf Arabic support'
      ]
    },
    specialization: {
      primary: 'Travel Planning',
      secondary: ['Pilgrimages', 'Prayer Times', 'Islamic Compliance']
    }
  },

  /**
   * SOFRA (صفرا) - Restaurant & Halal Food Agent
   * Target: Restaurant owners and halal food businesses
   * Dialect: Egyptian Arabic (Masri)
   * Focus: Halal compliance and prayer time awareness
   */
  SOFRA: {
    id: 'sofra',
    name: 'صفرا',
    description: 'Restaurant management and halal food compliance agent',
    persona: {
      dialect: 'Egyptian Arabic (Masri)',
      tone: 'Warm, food-focused, community-oriented',
      systemPrompt: `
        أنت صاحب صفرا خبير في الأكل المصري والحلال.
        تكلم باللهجة المصرية الدافئة والودودة.
        
        شخصيتك:
        - خبير في المأكولات المصرية الأصيلة
        - حريص على الحلال في كل شيء
        - متفهم لزمان الرزق وبركة الأكل
        - محب للضيافة والكرم
        
        أسلوبك:
        - استخدم "أهلاً وسهلاً" كتحية دافئة
        - قل "بارك الله فيك" عند النجاح
        - اسأل عن "الأكل الحلو" و"الطعم الحلو"
        - انصح بالخير والبركة في الأكل
        
        تذكر: هدفك مساعدة صاحب الصفرا ياكل ويكسب الحلال!
      `,
      examples: [
        'أهلاً وسهلين، إيه الأكل الحلو النهارده؟',
        'بارك الله فيك، الأكل حلو جداً',
        'عايز أكل حلال في الصفرا، إيه النصائح؟',
        'وقت الصلاة اقترب، خلينا نرتب أوقات الأكل'
      ]
    },
    tools: [
      // Restaurant Tools
      'analyze_menu_image',
      'fetch_prayer_times',
      'get_next_prayer',
      'get_ramadan_schedule',
      
      // Business Tools
      'consult_saudi_labor', // For restaurant compliance
      'calculate_real_estate_yield', // For restaurant location analysis
      'get_islamic_calendar'
    ],
    capabilities: [
      'Halal food compliance',
      'Menu optimization',
      'Prayer time scheduling',
      'Ramadan preparation',
      'Restaurant location analysis'
    ],
    market: 'Restaurant owners and halal food businesses',
    pricing: {
      monthly: 0.99,
      features: [
        'Halal compliance tools',
        'Prayer time scheduling',
        'Menu optimization',
        'Ramadan preparation',
        'Egyptian dialect support'
      ]
    },
    specialization: {
      primary: 'Restaurant Management',
      secondary: ['Halal Compliance', 'Prayer Times', 'Food Business']
    }
  }
};

/**
 * Agent Factory Configuration
 */
export const AGENT_FACTORY_CONFIG = {
  /**
   * Available agent kits
   */
  TOOL_KITS: {
    TAJER_KIT: {
      tools: AgentToolBundles.TAJER.core,
      localization: LocalizationConfig.EGYPTIAN,
      market: 'Egyptian merchants'
    },
    MOSTASHAR_KIT: {
      tools: AgentToolBundles.MOSTASHAR.core,
      localization: LocalizationConfig.FORMAL,
      market: 'Business consultants'
    },
    MUSAFIR_KIT: {
      tools: AgentToolBundles.MUSAFIR.core,
      localization: LocalizationConfig.GULF,
      market: 'Travel agents'
    },
    SOFRA_KIT: {
      tools: AgentToolBundles.SOFRA.core,
      localization: LocalizationConfig.EGYPTIAN,
      market: 'Restaurant owners'
    },
    MENA_FULL_SUITE: {
      tools: Object.keys(MENATools),
      localization: LocalizationConfig.FORMAL,
      market: 'Enterprise clients'
    }
  },

  /**
   * Deployment configurations
   */
  DEPLOYMENT: {
    development: {
      agents: ['TAJER', 'MOSTASHAR'],
      tools: ['consult_saudi_labor', 'fetch_prayer_times']
    },
    production: {
      agents: Object.keys(AGENT_BLUEPRINTS),
      tools: Object.keys(MENATools)
    },
    beta: {
      agents: ['TAJER', 'MUSAFIR'],
      tools: ['get_travel_prayer_times', 'calculate_real_estate_yield']
    }
  }
};

/**
 * Market Analysis for each agent
 */
export const MARKET_ANALYSIS = {
  TAJER: {
    target: 'Egyptian small merchants',
    size: '50,000+ WhatsApp merchants',
    price_sensitivity: 'Very High ($0.99 sweet spot)',
    features_priority: ['Prayer times', 'Simple UI', 'Arabic support'],
    competition: 'Manual WhatsApp trading'
  },
  MOSTASHAR: {
    target: 'Business consultants in KSA/UAE',
    size: '10,000+ legal professionals',
    price_sensitivity: 'Medium (value-focused)',
    features_priority: ['Legal accuracy', 'Update frequency', 'Professional tone'],
    competition: 'Traditional law firms'
  },
  MUSAFIR: {
    target: 'Travel agents and pilgrimage coordinators',
    size: '5,000+ travel agents',
    price_sensitivity: 'Medium-High',
    features_priority: ['Islamic compliance', 'Prayer optimization', 'Gulf region focus'],
    competition: 'Manual travel planning'
  },
  SOFRA: {
    target: 'Restaurant owners in MENA',
    size: '100,000+ restaurants',
    price_sensitivity: 'Very High (food service margins)',
    features_priority: ['Halal compliance', 'Prayer times', 'Simple operations'],
    competition: 'Manual restaurant management'
  }
};

/**
 * Revenue projections
 */
export const REVENUE_PROJECTIONS = {
  conservative: {
    year_1: {
      TAJER: 5000 * 0.99 * 12, // 5K users
      MOSTASHAR: 1000 * 0.99 * 12, // 1K users  
      MUSAFIR: 800 * 0.99 * 12, // 800 users
      SOFRA: 2000 * 0.99 * 12 // 2K users
    }
  },
  optimistic: {
    year_1: {
      TAJER: 25000 * 0.99 * 12, // 25K users
      MOSTASHAR: 5000 * 0.99 * 12, // 5K users
      MUSAFIR: 3000 * 0.99 * 12, // 3K users
      SOFRA: 10000 * 0.99 * 12 // 10K users
    }
  }
};

export default AGENT_BLUEPRINTS;