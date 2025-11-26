import { StateGraph, END, START } from "@langchain/langgraph";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { ChatCloudflareWorkersAI } from "@langchain/cloudflare";
import { trendSurferKernel } from "./TrendSurferKernel";
import { z } from "zod";

/**
 * @summary AgentHissabSoul is a LangGraph blueprint that orchestrates a planning and execution flow.
 * It begins with a Planner that formulates a plan based on user input.
 * The plan is then executed by a series of Kernels, each responsible for a specific task.
 * The LangGraph manages the state and transitions between the Planner and Kernels.
 */

// Define the state interface for the graph
interface HissabState {
    messages: BaseMessage[];
    next?: string;
}

// Define the routing schema for the Supervisor
const routeSchema = z.object({
    destination: z.enum(["TrendSurfer", "GeminiWriter", "Scheduler", "Tajer", "Chat"]).describe("The next agent to route the request to.")
});

/**
 * Agent Hissab Soul (Supervisor)
 * 
 * The central orchestrator that manages the lifecycle of a social media task.
 * It uses a Supervisor pattern to delegate work to specialized Kernels.
 */
export class AgentHissabSoul {
    private env: any;
    private model: ChatCloudflareWorkersAI;

    constructor(env: any) {
        this.env = env;
        this.model = new ChatCloudflareWorkersAI({
            model: "@cf/meta/llama-3-8b-instruct", // Using Llama 3 on Workers AI
            cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
            cloudflareApiToken: env.CLOUDFLARE_API_TOKEN
        });
    }

    /**
     * Builds the LangGraph workflow for Agent Hissab
     */
    public buildGraph() {
        // 1. Define the Supervisor Node
        const supervisorNode = async (state: HissabState) => {
            const systemPrompt = `You are Hissab, the Chief Social Media Officer (CSMO).
      Your goal is to manage social media presence by delegating tasks to your team:
      - TrendSurfer: For researching viral trends.
      - GeminiWriter: For writing content (Not implemented yet).
      - Scheduler: For posting content (Not implemented yet).
      - Tajer: For e-commerce negotiation, competitor analysis, and inventory management.
      
      Analyze the user's request and decide which team member should act next.
      If the task is complete or requires general conversation, route to 'Chat'.`;

            // Use structured output to determine the next step
            // Note: Llama 3 on Workers AI might need prompt engineering for strict JSON if .withStructuredOutput isn't fully supported yet.
            // For robustness, we'll use a direct prompt approach here for the "Soul" logic.

            const response = await this.model.invoke([
                { role: "system", content: systemPrompt },
                ...state.messages,
                { role: "user", content: "Who should handle this next? Respond with ONLY one word: TrendSurfer, GeminiWriter, Scheduler, or Chat." }
            ]);

            const destination = response.content.toString().trim().replace(/[^a-zA-Z]/g, "");
            console.log(`🧠 Hissab Soul: Routing to ${destination}`);

            return { next: destination };
        };

        // 2. Define Kernel Nodes
        const trendSurferNode = async (state: HissabState) => {
            const lastMessage = state.messages[state.messages.length - 1];
            const result = await trendSurferKernel.invoke({
                region: "EG", // Defaulting to EG for now, ideally extracted from state
                category: "general"
            });

            return {
                messages: [new HumanMessage({ content: `TrendSurfer Report: ${result}` })],
                next: "Supervisor" // Return to supervisor after work
            };
        };

        // Tajer Kernel Node for E-commerce Operations
        const tajerNode = async (state: HissabState) => {
            const lastMessage = state.messages[state.messages.length - 1];

            // Extract product information from the message
            const message = lastMessage.content.toString();

            // Check if this is a pricing or inventory request
            if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost') || message.toLowerCase().includes('quantum')) {
                return {
                    messages: [new HumanMessage({ content: `🔍 Tajer Analysis: Checking competitor pricing for "${message}"` })],
                    next: "Supervisor"
                };
            }

            if (message.toLowerCase().includes('inventory') || message.toLowerCase().includes('stock') || message.toLowerCase().includes('units')) {
                return {
                    messages: [new HumanMessage({ content: `📦 Tajer Analysis: Checking inventory levels for "${message}"` })],
                    next: "Supervisor"
                };
            }

            return {
                messages: [new HumanMessage({ content: `🛒 Tajer Analysis: Processing e-commerce request for "${message}"` })],
                next: "Supervisor"
            };
        };

        // 3. Construct the Graph
        const workflow = new StateGraph<HissabState>({
            channels: {
                messages: {
                    reducer: (a: BaseMessage[], b: BaseMessage[]) => a.concat(b),
                    default: () => []
                },
                next: {
                    reducer: (a: string | undefined, b: string | undefined) => b ?? a,
                    default: () => undefined
                }
            }
        })
            .addNode("Supervisor", supervisorNode)
            .addNode("TrendSurfer", trendSurferNode)
            .addNode("Tajer", tajerNode)
            // .addNode("GeminiWriter", ...) // Future
            // .addNode("Scheduler", ...) // Future

            .addEdge(START, "Supervisor")

            .addConditionalEdges("Supervisor", (state) => state.next || "Chat", {
                TrendSurfer: "TrendSurfer",
                Tajer: "Tajer",
                GeminiWriter: END, // Placeholder
                Scheduler: END, // Placeholder
                Chat: END
            })

            .addEdge("TrendSurfer", "Supervisor") // Loop back
            .addEdge("Tajer", "Supervisor") // Loop back

        return workflow.compile();
    }
}