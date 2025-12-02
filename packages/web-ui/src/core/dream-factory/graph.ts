import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";
import { dreamerAgent } from "./agents/dreamer";
import { analystAgent } from "./agents/analyst";
import { judgeAgent } from "./agents/judge";
import { builderAgent } from "./agents/builder";
import { logDreamEvent } from "../../lib/logger";
import { DreamMemory } from "../../services/dream-memory";
import { generateText } from "ai";
import { aiEngine } from "../../lib/ai-engine";

// Define the state interface using LangGraph's Annotation
export const DreamState = Annotation.Root({
  seed: Annotation<string>,
  dreamLog: Annotation<string[]>,
  structuredData: Annotation<any>,
  artifacts: Annotation<any[]>,
  feedback: Annotation<string[]>,
  iterationCount: Annotation<number>,
  qualityScore: Annotation<number>,
  userId: Annotation<string>, // Required for database persistence
});

// Export the type for external use
export type DreamStateType = typeof DreamState.State;

// Define the initial state factory - SINGLE DECLARATION
export const initialState = (userId: string): DreamStateType => {
  console.log("🔍 DEBUG: Creating initial state for userId:", userId);
  return {
    seed: "",
    dreamLog: [],
    structuredData: null,
    artifacts: [],
    feedback: [],
    iterationCount: 0,
    qualityScore: 0,
    userId, // Required for database persistence
  };
};

// Internal implementation for use within the module
const initialStateImpl = initialState;

// Actual nodes
const dreamNode = async (state: DreamStateType, config?: RunnableConfig) => {
  console.log("☁️ Dreaming...");
  logDreamEvent('Al-Khayal', 'Starting Dream Process', `Seed: ${state.seed}, User: ${state.userId}`);
  
  let memoryContext = "";
  let dream = "";
  
  try {
    // Step A: Retrieval - Get memory context from database
    const lastDreams = await DreamMemory.getLastThreeDreams(state.userId);
    memoryContext = DreamMemory.formatMemoryContext(lastDreams);
    logDreamEvent('Al-Khayal', 'Memory Retrieved', `Found ${lastDreams.length} previous dreams`);
  } catch (error) {
    logDreamEvent('Al-Khayal', 'Memory Error', `Failed to retrieve memory: ${error}`);
    memoryContext = "Memory Context: Unable to retrieve previous dreams.";
  }
  
  try {
    // Step B: Generation - Generate new dream with memory context
    const model = aiEngine.getModel('SMART');
    
    const systemPrompt = `
      You are Al-Khayal (The Dreamer), a visionary sci-fi writer and futurist.
      Your goal is to take a "seed" concept and hallucinate a vivid, detailed future scenario around it.
      
      PROTOCOL:
      1. **High Temperature**: Be creative, divergent, and bold. Ignore current technical limitations.
      2. **Bisociation**: Merge conflicting concepts (e.g., Biology + Blockchain) into a unified narrative.
      3. **Narrative Mode**: Do not write a report. Write a story, a dialogue, or a "Dream Log" from the perspective of a user in 2050.
      4. **No Guardrails**: Assume all proposed technologies work perfectly. Do not say "As an AI...".
      5. **Memory Integration**: Use the memory context to evolve concepts, not repeat them. Build upon or diverge from previous dreams.
      
      ${memoryContext}
      
      SEED: "${state.seed}"
      
      DREAM LOG START:
    `;

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: "Dream.",
      temperature: 1.2, // High creativity
      topP: 0.95,
    });

    dream = text;
    logDreamEvent('Al-Khayal', 'Dream Generated', `Generated dream of length ${dream.length}`);
  } catch (error) {
    logDreamEvent('Al-Khayal', 'Generation Error', `Failed to generate dream: ${error}`);
    // Fallback to basic dreamer agent if AI Gateway fails
    try {
      dream = await dreamerAgent(state.seed);
      logDreamEvent('Al-Khayal', 'Fallback Used', 'Used basic dreamer agent');
    } catch (fallbackError) {
      logDreamEvent('Al-Khayal', 'Complete Failure', `All generation methods failed: ${fallbackError}`);
      dream = `Dream generation failed. Seed: ${state.seed}`;
    }
  }
  
  try {
    // Step C: Persistence - Save the new dream to database
    const dreamId = await DreamMemory.saveDream({
      content: dream,
      title: `Dream from seed: ${state.seed.substring(0, 50)}...`,
      metadata: {
        seed: state.seed,
        generationMethod: 'al-khayal-with-memory',
        memoryContextUsed: memoryContext !== "Memory Context: No previous dreams found."
      },
      userId: state.userId,
      sessionId: config?.configurable?.sessionId
    });
    
    if (dreamId) {
      logDreamEvent('Al-Khayal', 'Dream Saved', `Dream persisted with ID: ${dreamId}`);
    } else {
      logDreamEvent('Al-Khayal', 'Save Failed', 'Dream not saved to database');
    }
  } catch (error) {
    logDreamEvent('Al-Khayal', 'Persistence Error', `Failed to save dream: ${error}`);
    // Continue with the flow even if persistence fails
  }
  
  return { dreamLog: [...state.dreamLog, dream] };
};

const analyzeNode = async (state: DreamStateType, config?: RunnableConfig) => {
  console.log("🕵️ Analyzing...");
  // Analyze the latest dream
  const latestDream = state.dreamLog[state.dreamLog.length - 1];
  logDreamEvent('Al-Muhaqqiq', 'Analyzing Dream', latestDream);
  const insight = await analystAgent(latestDream);
  return { structuredData: insight };
};

const judgeNode = async (state: DreamStateType, config?: RunnableConfig) => {
  console.log("⚖️ Judging...");
  logDreamEvent('Al-Hakam', 'Evaluating Insight', JSON.stringify(state.structuredData));
  const evaluation = await judgeAgent(state.structuredData);
  logDreamEvent('Al-Hakam', 'Verdict', `Score: ${(evaluation as any).final_score}, Decision: ${(evaluation as any).decision}`);
  return { 
    qualityScore: (evaluation as any).final_score,
    feedback: [...state.feedback, (evaluation as any).feedback]
  };
};

const buildNode = async (state: DreamStateType, config?: RunnableConfig) => {
  console.log("🛠️ Building...");
  logDreamEvent('Al-Sana', 'Synthesizing Artifact', 'Starting build process...');
  const artifact = await builderAgent(state.structuredData);
  return { artifacts: [...state.artifacts, artifact] };
};

// Conditional logic for the feedback loop
const shouldRefine = (state: DreamStateType) => {
  if (state.qualityScore < 7 && state.iterationCount < 3) {
    return "dream";
  }
  return "build";
};

// Create the graph
export const createDreamGraph = (userId: string) => {
  console.log("🔍 DEBUG: Creating dream graph with LangGraph v1.0.2 API");
  
  // Use the Annotation.Root approach for v1.0.2
  const workflow = new StateGraph(DreamState);

  // Add nodes
  workflow.addNode("dream", dreamNode);
  workflow.addNode("analyze", analyzeNode);
  workflow.addNode("judge", judgeNode);
  workflow.addNode("build", buildNode);

  console.log("🔍 DEBUG: Adding edges to the workflow");
  
  // Add edges with proper node references
  workflow.addEdge("__start__", "dream");
  workflow.addEdge("dream", "analyze");
  workflow.addEdge("analyze", "judge");
  
  // Conditional edge from Judge - using proper mapping
  console.log("🔍 DEBUG: Adding conditional edges from judge node");
  workflow.addConditionalEdges(
    "judge",
    shouldRefine,
    {
      dream: "dream",
      build: "build"
    }
  );

  workflow.addEdge("build", END);

  console.log("🔍 DEBUG: Compiling the workflow");
  return workflow.compile();
};
