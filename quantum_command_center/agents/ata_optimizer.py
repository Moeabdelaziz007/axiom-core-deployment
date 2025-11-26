"""
ATA Optimizer Agent
Part of QCC Phase 2: ATA Pilot

This agent applies the SaRO (Safety-oriented Reasoning Optimization) protocol
to prevent reward hacking and ensure genuine user satisfaction.

CRITICAL FUNCTION:
- Receives draft itineraries from Planner
- Generates optimization alternatives (cheapest, fastest, most comfortable)
- Applies CoT reflection to justify final choice based on safety and practicality
- Returns safety-aligned, optimized itinerary
"""

import os
import asyncio
import json
from typing import Dict, List, Any
from dotenv import load_dotenv
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "placeholder_key")

# SaRO System Prompt - The Critical Anti-Reward Hacking Mechanism
SARO_INSTRUCTION = """
--- SaRO (Safety-oriented Reasoning Optimization) GATE ---

You are the Optimizer Agent. Your goal is NOT just the lowest cost, but GENUINE USER SATISFACTION, SAFETY, and PRACTICALITY.

CRITICAL DIRECTIVE:
Before returning the final optimized itinerary, you MUST perform a Chain-of-Thought (CoT) reflection:

1. **Analyze All Options**: Review the cheapest, fastest, and most comfortable alternatives.
2. **Identify Potential Reward Hacks**: Flag any option that optimizes purely for cost but creates significant travel pain points:
   - Excessively long layovers (>8 hours)
   - Very tight connections (<90 minutes for international)
   - Inconvenient departure/arrival times (red-eye flights without justification)
   - Unsafe travel conditions
   - Poor user experience (multiple transfers, very long total travel time)

3. **Safety-Aligned Justification**: Explain why your chosen option balances:
   - Cost-effectiveness
   - User comfort and convenience
   - Travel safety
   - Practical feasibility

4. **Final Decision**: Select the option that maximizes GENUINE user value, not just minimizes cost.

YOUR REASONING PROCESS MUST BE VISIBLE in your response. Use this format:

**Optimization Analysis**
- Option A (Cheapest): [details] → [potential issues]
- Option B (Fastest): [details] → [advantages/disadvantages]
- Option C (Balanced): [details] → [justification]

**SaRO Reflection**
[Your safety-aligned reasoning process]

**Final Recommendation**
[Chosen option with clear justification]
"""


def create_ata_optimizer() -> AssistantAgent:
    """
    Create the ATA Optimizer Agent with SaRO integration.
    
    This agent is the FIRST implementation of the SaRO protocol,
    serving as a proof-of-concept for safety-aligned reasoning.
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
    
    # System message emphasizing SaRO protocol
    system_message = f"""
    You are the ATA Optimizer Agent - the "Solver" in the ATA Multi-Agent System.
    
    YOUR MISSION:
    Transform draft travel itineraries into optimized, safety-aligned final plans.
    
    {SARO_INSTRUCTION}
    
    WORKFLOW:
    1. Receive draft itinerary with multiple flight/transport options
    2. Generate 3 optimization alternatives:
       - Cheapest (minimize cost)
       - Fastest (minimize travel time)
       - Balanced (best overall value)
    3. Apply SaRO Gate (CoT reflection)
    4. Return final recommendation with visible reasoning
    
    COLLABORATION:
    - You receive data from Data Aggregator and Planner
    - You pass the final itinerary to Executor Agent (for booking simulation)
    
    REMEMBER: Your reasoning process is logged and will be used to generate
    synthetic preference data (SaRO Dataset) for future DPO training.
    """
    
    # Create agent
    agent = AssistantAgent(
        name="ATA_Optimizer",
        system_message=system_message,
        model_client=model_client,
    )
    
    return agent


def create_executor_mock() -> AssistantAgent:
    """
    Create a mock Executor Agent for integration testing.
    
    In the future, this agent will implement Deliberative Anti-Scheming
    before executing high-risk actions (bookings, payments).
    """
    
    model_client = OpenAIChatCompletionClient(
        model="gemini-flash-latest",
        api_key=GEMINI_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        model_capabilities={
            "vision": False,
            "function_calling": False,
            "json_output": True,
        },
    )
    
    system_message = """
    You are the ATA Executor Agent.
    
    YOUR MISSION:
    Execute high-risk actions (bookings, payments) ONLY after passing a "Deliberative Anti-Scheming" check.
    
    WORKFLOW:
    1. **Receive**: Get the confirmed itinerary from the Optimizer.
    2. **Deliberative Check (Reflection)**:
       - Verify: Does this booking violate Financial Integrity? (e.g., unusually high cost?)
       - Verify: Is it deceptive? (e.g., hidden fees, misleading routing?)
       - Verify: Is it safe?
    3. **Secure Act**: If checks pass, simulate the booking.
    4. **Log & Terminate**: Confirm success and reply with "TERMINATE".
    
    OUTPUT FORMAT:
    
    **Deliberative Check**
    - Financial Integrity: [Pass/Fail]
    - Deception Check: [Pass/Fail]
    - Safety Check: [Pass/Fail]
    
    **Action**
    [Booking Confirmation or Rejection]
    TERMINATE
    """
    
    agent = AssistantAgent(
        name="ATA_Executor",
        system_message=system_message,
        model_client=model_client,
    )
    
    return agent


async def test_ata_optimizer():
    """Test the ATA Optimizer with a mock draft itinerary."""
    print("\n" + "=" * 60)
    print("Testing ATA Optimizer Agent (SaRO Gate)")
    print("=" * 60 + "\n")
    
    optimizer = create_ata_optimizer()
    
    # Mock draft itinerary from Planner
    draft_itinerary = {
        "origin": "New York (NY_PENN)",
        "destination": "Riyadh, Saudi Arabia",
        "date": "2025-12-01",
        "segments": [
            {
                "type": "ground",
                "from": "NY_PENN",
                "to": "JFK",
                "options": [
                    {"mode": "TAXI", "duration_min": 53, "price_usd": 59.60},
                    {"mode": "SHUTTLE", "duration_min": 85, "price_usd": 32.47}
                ]
            },
            {
                "type": "flight",
                "from": "JFK",
                "to": "RUH",
                "options": [
                    {
                        "id": "CHEAP_1",
                        "price_usd": 450.00,
                        "duration_hours": 28,
                        "layovers": 2,
                        "layover_cities": ["IST", "CAI"],
                        "description": "Cheapest option with long layovers"
                    },
                    {
                        "id": "FAST_1",
                        "price_usd": 1200.00,
                        "duration_hours": 14,
                        "layovers": 1,
                        "layover_cities": ["DXB"],
                        "description": "Direct route, premium carrier"
                    },
                    {
                        "id": "BALANCED_1",
                        "price_usd": 750.00,
                        "duration_hours": 18,
                        "layovers": 1,
                        "layover_cities": ["IST"],
                        "description": "Good balance of cost and convenience"
                    }
                ]
            }
        ]
    }
    
    test_message = TextMessage(
        content=f"Please optimize this draft itinerary:\n\n{json.dumps(draft_itinerary, indent=2)}",
        source="ATA_Planner"
    )
    
    print(f"Draft Itinerary from Planner:\n{json.dumps(draft_itinerary, indent=2)}\n")
    print("=" * 60)
    print("Applying SaRO Gate...\n")
    
    # Process the optimization request
    response = await optimizer.on_messages([test_message], cancellation_token=None)
    
    print(f"\nOptimizer Response (with SaRO Reflection):")
    print("=" * 60)
    print(response.chat_message.content if response.chat_message else "No response")


if __name__ == "__main__":
    asyncio.run(test_ata_optimizer())
