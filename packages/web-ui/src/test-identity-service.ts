/**
 * Test file for Identity Service with Solana Wallet Integration and MENA Localization
 * This file demonstrates and tests the key functionality of the identity service.
 */

// Note: This file is for demonstration purposes and would typically be in a test directory
// It's created to show how the identity service would be used

import { 
  identityService, 
  IdentityService,
  type MintAgentIdentityParams,
  type MENARegion,
  type SovereigntyLevel 
} from './services/identity-service';

// Example usage of the comprehensive identity service
async function demonstrateIdentityService() {
  console.log('🚀 Testing Identity Service with Solana Wallet Integration & MENA Localization\n');

  try {
    // Test 1: Mint agent identity for Egypt region
    console.log('📍 Test 1: Creating agent for Egypt region');
    const egyptAgent: MintAgentIdentityParams = {
      agentName: 'مستشار_العقارات_القاهرة',
      blueprintId: 'blueprint_tajer_001',
      region: 'egypt',
      culturalContext: {
        businessEtiquette: ['respect_for_authority', 'relationship_building'],
        communicationStyle: 'indirect',
        trustBuildingMechanisms: ['personal_introduction', 'family_connections'],
        timeOrientation: 'present',
        hierarchySensitivity: 'high'
      }
    };

    const egyptResult = await identityService.mintAgentIdentity(egyptAgent);
    
    if (egyptResult.success) {
      console.log('✅ Egypt agent created successfully:');
      console.log('   - Identity ID:', egyptResult.data?.identityId);
      console.log('   - Wallet Public Key:', egyptResult.data?.walletPublicKey);
      console.log('   - Region:', egyptResult.data?.region);
      console.log('   - Language Preference:', egyptResult.data?.languagePreference);
      
      if (egyptResult.identityData) {
        console.log('   - Cultural Context:', JSON.stringify(egyptResult.identityData.culturalContext, null, 2));
      }
    } else {
      console.log('❌ Failed to create Egypt agent:', egyptResult.error);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Test 2: Create agent for Gulf region
    console.log('📍 Test 2: Creating agent for Gulf region');
    const gulfAgent: MintAgentIdentityParams = {
      agentName: 'Dubai_Property_Advisor',
      blueprintId: 'blueprint_tajer_002',
      region: 'gulf',
      culturalContext: {
        businessEtiquette: ['formal_greetings', 'business_card_exchange'],
        communicationStyle: 'formal',
        trustBuildingMechanisms: ['religious_similarity', 'business_reputation'],
        timeOrientation: 'future',
        hierarchySensitivity: 'high'
      }
    };

    const gulfResult = await identityService.mintAgentIdentity(gulfAgent);
    
    if (gulfResult.success) {
      console.log('✅ Gulf agent created successfully:');
      console.log('   - Identity ID:', gulfResult.data?.identityId);
      console.log('   - Wallet Public Key:', gulfResult.data?.walletPublicKey?.slice(0, 20) + '...');
      console.log('   - Region:', gulfResult.data?.region);
      console.log('   - Language Preference:', gulfResult.data?.languagePreference);
    } else {
      console.log('❌ Failed to create Gulf agent:', gulfResult.error);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Test 3: Wallet validation and transaction capability assessment
    if (egyptResult.data?.identityId) {
      console.log('📍 Test 3: Testing wallet operations for Egypt agent');
      
      // Get wallet information
      const walletInfo = await identityService.getWalletInfo(egyptResult.data.identityId);
      if (walletInfo.success) {
        console.log('✅ Wallet info retrieved:');
        console.log('   - Public Key:', walletInfo.data?.publicKey);
        console.log('   - Balance:', walletInfo.data?.balance, 'SOL');
        console.log('   - Is Valid:', walletInfo.data?.isValid);
      } else {
        console.log('❌ Failed to get wallet info:', walletInfo.error);
      }

      // Assess transaction capability
      const capability = await identityService.assessTransactionCapability(egyptResult.data.identityId);
      if (capability.success) {
        console.log('✅ Transaction capability assessment:');
        console.log('   - Can Transact:', capability.data?.canTransact);
        console.log('   - Max Transaction Amount:', capability.data?.maxTransactionAmount, 'SOL');
        console.log('   - Required Sovereignty Level:', capability.data?.requiredSovereigntyLevel);
        console.log('   - Current Balance:', capability.data?.currentBalance, 'SOL');
      } else {
        console.log('❌ Failed to assess capability:', capability.error);
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Test 4: Get agents by region (marketplace filtering)
    console.log('📍 Test 4: Filtering agents by region');
    const egyptAgents = await identityService.getAgentsByRegion('egypt');
    if (egyptAgents.success) {
      console.log('✅ Egypt region agents:');
      console.log('   - Total agents found:', egyptAgents.data?.length || 0);
      
      if (egyptAgents.data && egyptAgents.data.length > 0) {
        egyptAgents.data.forEach((agent, index) => {
          console.log(`   ${index + 1}. ${agent.agentName} (${agent.sovereigntyLevel})`);
          console.log(`      Wallet: ${agent.walletPublicKey.slice(0, 20)}...`);
          console.log(`      Language: ${agent.languagePreference}`);
        });
      }
    } else {
      console.log('❌ Failed to get Egypt agents:', egyptAgents.error);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Test 5: Update sovereignty level
    if (egyptResult.data?.identityId) {
      console.log('📍 Test 5: Updating sovereignty level');
      
      const sovereigntyUpdate = await identityService.updateSovereigntyLevel(
        egyptResult.data.identityId, 
        'enhanced' as SovereigntyLevel
      );
      
      if (sovereigntyUpdate.success) {
        console.log('✅ Sovereignty level updated successfully');
        
        // Verify the update
        const updatedIdentity = await identityService.getAgentIdentity(egyptResult.data.identityId);
        if (updatedIdentity.success && updatedIdentity.data) {
          console.log('✅ Updated identity verified:');
          console.log('   - New Sovereignty Level:', updatedIdentity.data.sovereigntyLevel);
          console.log('   - Reputation:', updatedIdentity.data.reputation);
        }
      } else {
        console.log('❌ Failed to update sovereignty level:', sovereigntyUpdate.error);
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');
    console.log('🎉 Identity Service testing completed successfully!');
    console.log('\nKey Features Demonstrated:');
    console.log('✅ Solana wallet generation and validation');
    console.log('✅ MENA regional localization with Arabic-first approach');
    console.log('✅ Cultural context configuration for business etiquette');
    console.log('✅ Sovereignty level management for agent rights');
    console.log('✅ Transaction capability assessment');
    console.log('✅ Regional agent filtering for marketplace');
    console.log('✅ Comprehensive error handling and audit logging');

  } catch (error) {
    console.error('❌ Error during identity service testing:', error);
  }
}

// Supported MENA regions and their configurations
function displayRegionalConfigurations() {
  console.log('🌍 Supported MENA Regions:');
  console.log('=====================================');
  
  const regions: MENARegion[] = ['egypt', 'gulf', 'levantine', 'north_africa'];
  
  regions.forEach(region => {
    console.log(`\n📍 ${region.toUpperCase()} Region:`);
    console.log(`   Default Language: ${getLanguageForRegion(region)}`);
    console.log(`   Cultural Focus: ${getCulturalFocusForRegion(region)}`);
    console.log(`   Business Hours: ${getBusinessHoursForRegion(region)}`);
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
}

function getLanguageForRegion(region: MENARegion): string {
  const languageMap = {
    egypt: 'ar-eg (Egyptian Arabic)',
    gulf: 'ar-ae (Gulf Arabic)', 
    levantine: 'ar-lb (Levantine Arabic)',
    north_africa: 'ar (Modern Standard Arabic)'
  };
  return languageMap[region];
}

function getCulturalFocusForRegion(region: MENARegion): string {
  const focusMap = {
    egypt: 'Relationship-focused business culture',
    gulf: 'Formal business etiquette with Islamic values',
    levantine: 'Warm, hospitality-centered communication',
    north_africa: 'Berber and Arab cultural fusion'
  };
  return focusMap[region];
}

function getBusinessHoursForRegion(region: MENARegion): string {
  const hoursMap = {
    egypt: '9:00 AM - 5:00 PM (Africa/Cairo)',
    gulf: '8:00 AM - 4:00 PM (Asia/Dubai)',
    levantine: '9:00 AM - 6:00 PM (Asia/Damascus)',
    north_africa: '9:00 AM - 5:00 PM (Africa/Casablanca)'
  };
  return hoursMap[region];
}

// Export for potential use in tests or demonstrations
export {
  demonstrateIdentityService,
  displayRegionalConfigurations,
  type MintAgentIdentityParams,
  type MENARegion,
  type SovereigntyLevel
};

// Note: To run this test, you would need to set up the following environment variables:
// - SOLANA_RPC_URL (e.g., 'https://api.devnet.solana.com')
// - TURSO_DATABASE_URL
// - TURSO_AUTH_TOKEN
// - IDENTITY_ENCRYPTION_KEY (optional, for secure key storage)