import dotenv from 'dotenv';
import path from 'path';
import { nanoid } from 'nanoid';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
console.log(`Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

console.log(`GROQ_API_KEY loaded: ${process.env.GROQ_API_KEY ? 'YES' : 'NO'}`);
console.log(`TURSO_DATABASE_URL loaded: ${process.env.TURSO_DATABASE_URL ? 'YES' : 'NO'}`);
console.log(`TURSO_AUTH_TOKEN loaded: ${process.env.TURSO_AUTH_TOKEN ? 'YES' : 'NO'}`);

if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing! Please check .env.local");
  process.exit(1);
}

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("❌ Turso database credentials are missing! Please check .env.local");
  process.exit(1);
}

async function runTest() {
  console.log("🚀 Starting Dream Factory Integration Test...");
  
  // Dynamic import to ensure env vars are loaded first
  const { createDreamGraph } = await import('../src/core/dream-factory/graph');
  const { DreamMemory } = await import('../src/services/dream-memory');
  
  const seed = "Create a decentralized AI agent that predicts crypto market crashes using sentiment analysis from Reddit and Twitter.";
  const userId = nanoid(); // Generate test user ID
  
  console.log(`🌱 Seed: "${seed}"`);
  console.log(`👤 Test User ID: ${userId}`);

  // First, let's test the DreamMemory service directly
  console.log("\n🧠 Testing DreamMemory service...");
  
  // Test saving a dream
  const testDreamId = await DreamMemory.saveDream({
    content: "Test dream for database integration",
    title: "Database Test Dream",
    metadata: { test: true, timestamp: Date.now() },
    userId: userId
  });
  
  if (testDreamId) {
    console.log(`✅ Successfully saved test dream with ID: ${testDreamId}`);
  } else {
    console.log("❌ Failed to save test dream");
    return;
  }
  
  // Test retrieving dreams
  const retrievedDreams = await DreamMemory.getLastThreeDreams(userId);
  console.log(`✅ Retrieved ${retrievedDreams.length} dreams from database`);
  
  // Test memory context formatting
  const memoryContext = DreamMemory.formatMemoryContext(retrievedDreams);
  console.log("📄 Memory Context Sample:", memoryContext.substring(0, 100) + "...");

  // Now test the complete graph
  console.log("\n🏭 Testing Dream Factory graph with database integration...");
  const graph = createDreamGraph(userId);
  
  const inputs = {
    seed,
    userId,
    dreamLog: [],
    iterationCount: 0
  };

  console.log("🌊 Streaming events...");
  
  try {
    const stream = await graph.streamEvents(inputs, { version: "v1" });

    for await (const event of stream) {
      if (event.event === "on_chain_end" && event.name !== "LangGraph") {
        console.log(`\n--------------------------------------------------`);
        console.log(`🤖 Agent: ${event.name}`);
        console.log(`--------------------------------------------------`);
        console.log(JSON.stringify(event.data.output, null, 2));
      }
    }
    
    // Verify the dream was persisted
    console.log("\n💾 Verifying dream persistence...");
    const finalDreams = await DreamMemory.getLastThreeDreams(userId);
    if (finalDreams.length > retrievedDreams.length) {
      console.log("✅ New dream was successfully persisted to database");
      console.log(`📊 Total dreams for user: ${finalDreams.length}`);
    } else {
      console.log("❌ Dream was not persisted to database");
    }
    
    console.log("\n✅ Integration Test Complete.");
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
  }
}

runTest();
