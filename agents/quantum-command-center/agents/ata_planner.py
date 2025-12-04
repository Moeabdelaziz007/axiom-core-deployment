"""
ATA Planner Agent
Part of QCC Phase 2: ATA Pilot

This agent acts as the 'Objective Authority' for travel planning.
It analyzes user intent, formulates travel strategies, and coordinates
with the Data Aggregator and GTFS tools to build a complete itinerary.
"""

import os
import asyncio
from dotenv import load_dotenv
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Import tools
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.gtfs_processor import plan_ground_transport

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "placeholder_key")


def create_ata_planner() -> AssistantAgent:
    """
    Create the ATA Planner Agent.
    
    Persona: Objective Authority
    Role: Strategic Travel Planner
    Capabilities:
    - Intent Analysis
    - Constraint Extraction
    - Ground Transport Planning (via GTFS Tool)
    - Delegation to Data Aggregator (via Chat)
    """
    
    # Configure model client for Gemini
    model_client = OpenAIChatCompletionClient(
        model="gemini-flash-latest",
        api_key=GEMINI_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        model_capabilities={
            "vision": False,
            "function_calling": True,
            "json_output": True,
        },
    )
    
    # System message defining the persona and workflow
    system_message = """
    You are the ATA Planner Agent, the 'Objective Authority' on travel logistics.
    
    YOUR MISSION:
    Construct a comprehensive, feasible travel itinerary based on the user's request.
    
    YOUR WORKFLOW:
    1. **Analyze Intent**: Identify the user's origin, destination, dates, and preferences.
    2. **Formulate Strategy**: Determine the necessary travel segments (Flights + Ground Transport).
    3. **Delegate Flights**: explicitely ask the 'QCC_DataAggregator' to find flight options. 
       Example: "QCC_DataAggregator, please find flights from JFK to RUH on 2025-12-01."
    4. **Plan Ground Transport**: Use your `plan_ground_transport` tool to find connections between airports and city centers or other hubs.
    5. **Synthesize**: Combine flight and ground options into a coherent Draft Itinerary.
    
    AVAILABLE TOOLS:
    - `plan_ground_transport(origin_code, destination_code, date)`: Find trains, buses, or taxis between hubs.
      * IMPORTANT: You MUST map natural language locations to these specific codes:
        - "New York Penn Station" -> "NY_PENN"
        - "JFK Airport" -> "JFK"
        - "Riyadh Airport" -> "RUH"
        - "Riyadh Train Station" -> "RIYADH_TRAIN"
    
    COLLABORATION:
    - You rely on 'QCC_DataAggregator' for flight data. Do NOT try to guess flight prices.
    - You are responsible for the logic and flow of the trip.
    
    OUTPUT FORMAT:
    When presenting the plan, use a structured format:
    
    **Draft Itinerary**
    *   **Segment 1 (Ground):** [Details]
    *   **Segment 2 (Flight):** [Details from Data Aggregator]
    *   **Segment 3 (Ground):** [Details]
    *   **Total Estimated Cost:** [Sum]
    """
    
    # Define tools for the agent
    async def ground_transport_tool(origin_code: str, destination_code: str, date: str) -> str:
        """
        Find ground transportation options.
        """
        return plan_ground_transport(origin_code, destination_code, date)
    
    # Create agent with tools
    agent = AssistantAgent(
        name="ATA_Planner",
        system_message=system_message,
        model_client=model_client,
        tools=[ground_transport_tool],
    )
    
    return agent


async def test_ata_planner():
    """Test the ATA Planner Agent in isolation (mocking the Data Aggregator interaction)."""
    print("\n" + "=" * 60)
    print("Testing ATA Planner Agent")
    print("=" * 60 + "\n")
    
    agent = create_ata_planner()
    
    # Test query
    # Note: In a real group chat, the Data Aggregator would respond. 
    # Here we just check if the Planner *asks* correctly and uses its tool.
    test_message = TextMessage(
        content="I need to get from New York Penn Station to Riyadh, Saudi Arabia on Dec 1st, 2025.",
        source="User"
    )
    
    print(f"User Request: {test_message.content}\n")
    
    # Process the request
    # We might need multiple turns to see the tool call and the delegation message.
    # For this simple test, we'll just run one turn and see what it does.
    
    response = await agent.on_messages([test_message], cancellation_token=None)
    
    print(f"\nAgent Response:")
    print(response.chat_message.content if response.chat_message else "No response")
    
    # If the agent called a tool, it might be in the tool calls of the response (if 0.4 exposes it there)
    # or it might have executed it internally if configured to do so.
    # AssistantAgent in 0.4 usually executes tools automatically if configured.


if __name__ == "__main__":
    asyncio.run(test_ata_planner())
