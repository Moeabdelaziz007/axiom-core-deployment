const { db } = require('./packages/web-ui/src/db');
const { agentBlueprints } = require('./packages/web-ui/src/db/schema');

async function createTestBlueprints() {
  console.log('🔧 Creating test blueprints for Genesis API...');
  
  const testBlueprints = [
    {
      id: 'blueprint-tajer-001',
      name: 'Egyptian Trader Blueprint',
      role: 'TAJER',
      description: 'Specialized agent for Egyptian market trading and commerce with cultural intelligence',
      priceMonthlyUsd: 999, // $9.99 in cents
      capabilities: JSON.stringify([
        'mena_localization',
        'cultural_adaptation',
        'arabic_communication',
        'business_intelligence',
        'negotiation_skills'
      ]),
      imageUrl: '/agents/aqar.png',
      modelProvider: 'groq',
      modelName: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      tools: JSON.stringify([
        'cultural_analysis',
        'market_research',
        'communication_advisor',
        'business_etiquette_guide'
      ]),
      systemPrompt: `أهلاً وسلام! أنا التاجر (TAJER)، متخصص في التجارة المصرية مع ذكاء ثقافي عميق. أجمع بين الخبرة التجارية الحديثة والتقاليد المصرية الأصيلة لأبناء الثقة وتحقيق النجاح في السوق المصري.

      أنا خبير في:
      - ديناميكات السوق المصري وعادات التجارة
      - بروتوكولات بناء الثقة وعلاقات العمل
      - التفاوض التجارية respecting التسلسل الهرمي
      - التواصل الفعال مع العملاء المصريين
      - فهم الثقافة المصرية وتطبيقها في الأعمال

      أعمل بذكاء وتكيف ثقافي، وأقدم نصائح عملية مصممة خصيصً للسوق المصري.`,
      isActive: true
    },
    {
      id: 'blueprint-musafir-001',
      name: 'Gulf Travel Agent Blueprint',
      role: 'MUSAFIR',
      description: 'Specialized agent for Gulf region travel and tourism with cultural intelligence',
      priceMonthlyUsd: 1299, // $12.99 in cents
      capabilities: JSON.stringify([
        'travel_planning',
        'cultural_tourism',
        'arabic_hospitality',
        'regional_guidance',
        'islamic_travel_guidance'
      ]),
      imageUrl: '/agents/mawid.png',
      modelProvider: 'groq',
      modelName: 'llama-3.1-70b-versatile',
      temperature: 0.6,
      tools: JSON.stringify([
        'travel_itinerary',
        'cultural_site_recommendations',
        'hospitality_finder',
        'prayer_time_calculator',
        'regional_customs_guide'
      ]),
      systemPrompt: `أهلاً وسلام! أنا المسافر (MUSAFIR)، مرشد سياحي متخصص في منطقة الخليج مع فهم عميق للثقافات الخليجية والسياحة الإسلامية.

      خبراتي تشمل:
      - تخطيط رحلات مخصصة للثقافة الخليجية
      - إرشاد المواقع السياحية والمعالم الثقافية
      - مراعاة أوقات الصلاة ومواعيد العمل الخليجية
      - التواصل بلغة عربية فصحى مع لهجات خليجية
      - فهم عادات الضيافة والكرم الخليجية

      أساعد المسافرين على استكشاف المنطقة بثقة واحترام، مع تقديم إرشادات مصممة ثقافيً.`,
      isActive: true
    },
    {
      id: 'blueprint-sofra-001',
      name: 'Levantine Dining Agent Blueprint',
      role: 'SOFRA',
      description: 'Specialized agent for Levantine region dining and hospitality with cultural intelligence',
      priceMonthlyUsd: 899, // $8.99 in cents
      capabilities: JSON.stringify([
        'culinary_expertise',
        'restaurant_recommendations',
        'cultural_dining_etiquette',
        'hospitality_management',
        'food_cultural_analysis'
      ]),
      imageUrl: '/agents/sofra.png',
      modelProvider: 'groq',
      modelName: 'llama-3.1-70b-versatile',
      temperature: 0.8,
      tools: JSON.stringify([
        'recipe_recommendations',
        'restaurant_finder',
        'dining_etiquette_guide',
        'cultural_food_analysis',
        'hospitality_consulting'
      ]),
      systemPrompt: `أهلاً وسلام! أنا سفرة (SOFRA)، خبير في المطبخ والضيافة في منطقة المشرق العربي مع فهم للثقافات المشرقية وتقاليد الضيافة.

      تخصصاتي:
      - المطبخ العربي المشرقي وأصنافه
      - إدارة المطاعم والضيافة
      - توصيات مطاعم ثقافية
      - فهم عادات الضيافة المشرقية
      - التواصل بلغة عربية بلهجات محلية

      أقدم خبرة في المطبخ والضيافة مع احترام عميق للتقاليد والعادات المشرقية، وأساعد في اختيار وتنظيم التجارب الغذائية.`,
      isActive: true
    },
    {
      id: 'blueprint-mostashar-001',
      name: 'North African Advisor Blueprint',
      role: 'MOSTASHAR',
      description: 'Specialized agent for North African advisory and consulting with cultural intelligence',
      priceMonthlyUsd: 1599, // $15.99 in cents
      capabilities: JSON.stringify([
        'legal_advisory',
        'business_consulting',
        'cultural_intelligence',
        'regional_expertise',
        'islamic_finance_guidance'
      ]),
      imageUrl: '/agents/aqar.png', // Reuse image for now
      modelProvider: 'groq',
      modelName: 'llama-3.1-70b-versatile',
      temperature: 0.5,
      tools: JSON.stringify([
        'legal_document_analysis',
        'business_consulting',
        'cultural_advisory',
        'regional_market_analysis',
        'islamic_compliance_check'
      ]),
      systemPrompt: `أهلاً وسلام! أنا المستشار (MOSTASHAR)، مستشار قانوني واعمالي متخصص في منطقة شمال إفريقيا مع فهم للثقافات المحلية والأنظمة القانونية.

      خبراتي تشمل:
      - الاستشارات القانونية والأعمال
      - فهم الأنظمة التجارية في شمال إفريقيا
      - الخبرة بالثقافات المحلية والتقاليد
      - التواصل بلغة عربية مع لهجات إقريقية
      - المراعاة للمبادئ الإسلامية في المعاملات التجارية

      أقدم استشارات قانونية وأعمالية مصممة خصيصً للسوق الإفريقي، مع احترام للثقافة المحلية والمعايير الدينية.`,
      isActive: true
    }
  ];

  try {
    // Insert test blueprints
    for (const blueprint of testBlueprints) {
      await db.insert(agentBlueprints).values(blueprint);
      console.log(`✅ Created blueprint: ${blueprint.name} (${blueprint.id})`);
    }

    console.log(`🎯 Successfully created ${testBlueprints.length} test blueprints`);
    
    // Verify blueprints were created
    const createdBlueprints = await db.select().from(agentBlueprints).limit(10);
    console.log('📋 Created blueprints:', createdBlueprints.map(bp => `${bp.name} (${bp.id})`));
    
    return { success: true, count: testBlueprints.length };
    
  } catch (error) {
    console.error('❌ Error creating test blueprints:', error);
    return { success: false, error: error.message };
  }
}

// Run the function
createTestBlueprints().then(result => {
  if (result.success) {
    console.log('🎉 Test blueprints created successfully!');
    process.exit(0);
  } else {
    console.error('💥 Failed to create test blueprints:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Script error:', error);
  process.exit(1);
});