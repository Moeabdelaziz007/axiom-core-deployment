// Simple test for AI Engine
const { aiEngine, AgentType } = require('./src/lib/ai-engine.ts');

async function testAIEngine() {
  try {
    console.log('Testing AI Engine initialization...');
    
    // Test 1: Research with Google
    console.log('Testing research with Google...');
    const researchResult = await aiEngine.researchWithGoogle('MENA market trends 2024', 'en');
    console.log('Research result:', researchResult.success ? 'SUCCESS' : 'FAILED');
    
    // Test 2: Code execution
    console.log('Testing code execution...');
    const codeResult = await aiEngine.executeCode('print("Hello from AI Engine!")');
    console.log('Code execution result:', codeResult.success ? 'SUCCESS' : 'FAILED');
    
    // Test 3: Agent-specific code generation
    console.log('Testing agent code generation...');
    const agentCode = await aiEngine.generateAgentCode(AgentType.TAJER, 'Generate sales forecast', { period: 'Q4-2024' });
    console.log('Agent code generation result:', agentCode ? 'SUCCESS' : 'FAILED');
    
    // Test 4: Currency conversion
    console.log('Testing currency conversion...');
    const convertedAmount = aiEngine.convertCurrency(100, 'USD', 'SAR');
    console.log('Currency conversion result:', convertedAmount);
    
    console.log('AI Engine test completed successfully!');
    
  } catch (error) {
    console.error('AI Engine test failed:', error.message);
  }
}

testAIEngine();