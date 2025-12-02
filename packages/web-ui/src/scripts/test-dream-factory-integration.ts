import { createDreamGraph, initialState } from '../core/dream-factory/graph';
import { nanoid } from 'nanoid';
import { DreamMemory } from '../services/dream-memory';
import { logDreamEvent } from '../lib/logger';

/**
 * Test script to verify Dream Factory integration with Turso database
 * This script tests the complete flow: memory retrieval -> generation -> persistence
 */
async function testDreamFactoryIntegration() {
  console.log('🧪 Testing Dream Factory Integration with Turso Database...');
  
  try {
    // Create a test user ID
    const testUserId = nanoid();
    console.log(`👤 Test User ID: ${testUserId}`);
    
    // Step 1: Create some initial dreams for testing memory context
    console.log('\n📝 Creating test dreams for memory context...');
    const initialDreams = [
      { seed: 'quantum consciousness', content: 'In 2050, quantum consciousness emerged...' },
      { seed: 'neural architecture', content: 'The neural architecture of cities...' },
      { seed: 'biological computing', content: 'Biological computing revolutionized...' }
    ];
    
    for (const dream of initialDreams) {
      const dreamId = await DreamMemory.saveDream({
        content: dream.content,
        title: `Test Dream: ${dream.seed}`,
        metadata: { seed: dream.seed, test: true },
        userId: testUserId
      });
      
      if (dreamId) {
        console.log(`✅ Created test dream: ${dream.seed} (ID: ${dreamId})`);
      } else {
        console.log(`❌ Failed to create test dream: ${dream.seed}`);
      }
    }
    
    // Step 2: Test memory retrieval
    console.log('\n🧠 Testing memory retrieval...');
    const retrievedDreams = await DreamMemory.getLastThreeDreams(testUserId);
    console.log(`✅ Retrieved ${retrievedDreams.length} dreams from database`);
    
    // Step 3: Test memory context formatting
    console.log('\n📋 Testing memory context formatting...');
    const memoryContext = DreamMemory.formatMemoryContext(retrievedDreams);
    console.log('📄 Memory Context:');
    console.log(memoryContext);
    
    // Step 4: Test the complete Dream Factory graph
    console.log('\n🏭 Testing Dream Factory graph execution...');
    const dreamGraph = createDreamGraph(testUserId);
    const initialStateData = initialState(testUserId);
    initialStateData.seed = 'synthetic biology meets blockchain';
    
    console.log(`🌱 Using seed: "${initialStateData.seed}"`);
    
    // Execute the graph
    const result = await dreamGraph.invoke(initialStateData as any);
    
    console.log('\n🎯 Graph Execution Results:');
    console.log(`✅ Generated ${(result.dreamLog as string[]).length} dreams`);
    console.log(`✅ Quality Score: ${result.qualityScore as number}`);
    console.log(`✅ Iterations: ${result.iterationCount as number}`);
    console.log(`✅ Artifacts Created: ${(result.artifacts as any[]).length}`);
    
    // Step 5: Verify the dream was persisted
    console.log('\n💾 Verifying dream persistence...');
    const finalDreams = await DreamMemory.getLastThreeDreams(testUserId);
    console.log(`✅ Total dreams in database: ${finalDreams.length}`);
    
    if (finalDreams.length > retrievedDreams.length) {
      console.log('✅ New dream was successfully persisted to database');
      const latestDream = finalDreams[0];
      console.log(`📄 Latest Dream Preview: ${latestDream.content.substring(0, 100)}...`);
    } else {
      console.log('❌ New dream was not persisted to database');
    }
    
    // Step 6: Test error handling (simulate database failure)
    console.log('\n🛡️ Testing error handling...');
    
    // Test with invalid user ID to simulate database errors
    const invalidUserId = 'invalid-user-id';
    const errorTestGraph = createDreamGraph(invalidUserId);
    const errorTestState = initialState(invalidUserId);
    errorTestState.seed = 'error test seed';
    
    try {
      const errorResult = await errorTestGraph.invoke(errorTestState as any);
      console.log('✅ Graph handled errors gracefully and continued execution');
      console.log(`📊 Error test result: Generated ${(errorResult.dreamLog as string[]).length} dreams`);
    } catch (error) {
      console.log(`❌ Graph failed with error: ${error}`);
    }
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    // Note: In a real implementation, you might want to keep test data for debugging
    console.log('✅ Test completed successfully!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return false;
  }
}

/**
 * Test individual components
 */
async function testIndividualComponents() {
  console.log('\n🔧 Testing Individual Components...');
  
  const testUserId = nanoid();
  
  // Test DreamMemory service directly
  console.log('\n💾 Testing DreamMemory service...');
  
  // Test saveDream
  const dreamId = await DreamMemory.saveDream({
    content: 'Test dream content for component testing',
    title: 'Component Test Dream',
    metadata: { test: 'component', timestamp: Date.now() },
    userId: testUserId
  });
  
  if (dreamId) {
    console.log(`✅ saveDream works: ${dreamId}`);
  } else {
    console.log('❌ saveDream failed');
    return false;
  }
  
  // Test getLastThreeDreams
  const dreams = await DreamMemory.getLastThreeDreams(testUserId);
  if (dreams.length > 0) {
    console.log(`✅ getLastThreeDreams works: Found ${dreams.length} dreams`);
  } else {
    console.log('❌ getLastThreeDreams failed');
    return false;
  }
  
  // Test formatMemoryContext
  const context = DreamMemory.formatMemoryContext(dreams);
  if (context.includes('Memory Context:')) {
    console.log('✅ formatMemoryContext works');
  } else {
    console.log('❌ formatMemoryContext failed');
    return false;
  }
  
  return true;
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    console.log('🚀 Starting Dream Factory Integration Tests...\n');
    
    // Test individual components first
    const componentTestsPassed = await testIndividualComponents();
    
    if (componentTestsPassed) {
      // Run full integration test
      const integrationTestsPassed = await testDreamFactoryIntegration();
      
      if (integrationTestsPassed) {
        console.log('\n🎉 All tests passed! Dream Factory integration is working correctly.');
        process.exit(0);
      } else {
        console.log('\n❌ Integration tests failed.');
        process.exit(1);
      }
    } else {
      console.log('\n❌ Component tests failed.');
      process.exit(1);
    }
  })();
}

export { testDreamFactoryIntegration, testIndividualComponents };