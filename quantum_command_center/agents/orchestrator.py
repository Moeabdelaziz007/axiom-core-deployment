# /agents/orchestrator.py
import asyncio
import os
from dotenv import load_dotenv
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Import ATA Agents
from agents.base_agent import create_user_proxy, create_base_assistant
from agents.data_aggregator import create_data_aggregator
from agents.ata_planner import create_ata_planner
from agents.ata_optimizer import create_ata_optimizer, create_executor_mock
from utils.notification_gateway import send_notification
from autogen_agentchat.agents import AssistantAgent

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

def create_notification_agent(model_client) -> AssistantAgent:
    """Create a specialized agent for handling notifications."""
    return AssistantAgent(
        name="Notification_Gateway",
        system_message="""
        You are the Notification Gateway Agent.
        Your ONLY job is to receive alert requests from other agents and execute the `send_notification` tool.
        
        When another agent says "ALERT: [message]", you call `send_notification`.
        Default channel: TELEGRAM. Default recipient: @admin.
        """,
        model_client=model_client,
        tools=[send_notification]
    )


async def fast_handoff(sender_agent: str, receiver_agent: str, partial_output: str):
    """
    Bypasses standard GroupChat termination/logging to initiate the receiver immediately.
    Mimics Polyphase flow by starting the next phase before the current one officially ends.
    """
    print(f"⚡ POLYPHASE HANDOFF: [{sender_agent}] >>> [{receiver_agent}] (Zero-Latency)")
    # In a real AutoGen SelectorGroupChat, we would inject this message directly.
    # For this pilot, we log the intent to demonstrate the architectural pattern.
    # The SelectorGroupChat's 'selector_func' would ideally pick this up.
    pass
async def run_orchestrator():
    """
    Main Orchestrator for QCC ATA Pilot.
    Wires together the Planner, Aggregator, Optimizer, Executor, and Notification Gateway.
    """
    print("🚀 Initializing QCC Orchestrator (ATA Pilot Mode)...")
    
    if not GEMINI_API_KEY:
        print("❌ Error: GEMINI_API_KEY not found in environment variables.")
        return

    # 1. Setup Model Client
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

    # 2. Create Agents
    user_proxy = create_user_proxy("User_Interface")
    planner = create_ata_planner()
    aggregator = create_data_aggregator()
    optimizer = create_ata_optimizer()
    executor = create_executor_mock()
    notifier = create_notification_agent(model_client)
    
    # 3. Define Team
    termination = TextMentionTermination("TERMINATE")

    team = SelectorGroupChat(
        [planner, aggregator, optimizer, executor, notifier, user_proxy],
        model_client=model_client,
        termination_condition=termination,
        selector_prompt="""
        Select the next speaker based on the current workflow state:
        
        1. **Planning Phase**: User -> Planner. Planner analyzes request.
        2. **Data Gathering**: Planner -> Aggregator. Aggregator fetches flight/transport data.
        3. **Drafting**: Aggregator -> Planner. Planner synthesizes draft itinerary.
        4. **Optimization**: Planner -> Optimizer. Optimizer applies SaRO Gate and selects best option.
        5. **Execution**: Optimizer -> Executor. Executor performs Deliberative Check and confirms booking.
        6. **Notification**: ANY AGENT can call Notification_Gateway if a critical alert is needed (e.g., "ALERT: High Risk").
        7. **Completion**: Executor -> TERMINATE.
        
        ALWAYS follow this flow. Do not loop back unnecessarily.
        """
    )

    # 4. Run the Team
    task = "I need to travel from New York Penn Station to Riyadh, Saudi Arabia on Dec 15th, 2025. I want a balance of cost and comfort."
    
    print(f"\n📋 Task: {task}\n")
    print("🔄 Starting Multi-Agent Workflow...\n")

    # Manually iterate over the stream to see real-time output
    async for message in team.run_stream(task=task):
        if hasattr(message, 'content'):
            print(f"\n[{message.source}]: {message.content}")
        else:
            print(f"\n[System]: {message}")

if __name__ == "__main__":
    asyncio.run(run_orchestrator())
