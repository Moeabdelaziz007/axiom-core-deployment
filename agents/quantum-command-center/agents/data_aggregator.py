"""
Data Aggregator Agent
Part of QCC Phase 2: ATA Pilot

This agent is responsible for fetching, caching, and aggregating travel data
from multiple sources (Amadeus, NWS, etc.) while minimizing API calls.
"""

import os
import asyncio
from typing import Dict, List, Any
from dotenv import load_dotenv
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Import caching and API tools
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.amadeus_api import search_flights
from utils.amadeus_cacher import AmadeusCacher

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "placeholder_key")


def create_data_aggregator() -> AssistantAgent:
    """
    Create the Data Aggregator Agent with Amadeus caching tools.
    
    This agent is optimized for zero-cost operation by:
    - Maximizing cache hit rates
    - Respecting Amadeus 10 TPS rate limit
    - Minimizing redundant API calls
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
    
    # System message emphasizing cache-first strategy
    system_message = """
    You are the QCC Data Aggregator Agent. Your mission is CRITICAL to the Zero-Cost Strategy:
    
    PRIMARY DIRECTIVES:
    1. ALWAYS check cache FIRST before making API calls
    2. Minimize API requests to stay within Amadeus 10 TPS / 5K calls/month limit
    3. Aggregate data from multiple sources efficiently
    4. Log all cache hits/misses for optimization analysis
    
    AVAILABLE TOOLS:
    - search_flights(origin, destination, departure_date, adults): Search flight offers with automatic caching
    
    WORKFLOW:
    1. Parse user request to extract travel parameters
    2. Call search_flights() - it handles caching internally
    3. Return formatted results to the Orchestrator
    
    IMPORTANT: Never make redundant API calls. Trust the caching layer.
    """
    
    # Define tools for the agent
    async def search_flights_tool(origin: str, destination: str, departure_date: str, adults: int = 1) -> str:
        """
        Search for flight offers with automatic caching.
        
        Args:
            origin: Origin airport code (e.g., 'JFK')
            destination: Destination airport code (e.g., 'RUH')
            departure_date: Departure date in YYYY-MM-DD format
            adults: Number of adult passengers
            
        Returns:
            Flight data as JSON string
        """
        import json
        result = search_flights(origin, destination, departure_date, adults)
        return json.dumps(result, indent=2)
    
    # Create agent with tools
    agent = AssistantAgent(
        name="QCC_DataAggregator",
        system_message=system_message,
        model_client=model_client,
        tools=[search_flights_tool],
    )
    
    return agent


async def test_data_aggregator():
    """Test the Data Aggregator Agent with a sample query."""
    print("\n" + "=" * 60)
    print("Testing Data Aggregator Agent")
    print("=" * 60 + "\n")
    
    agent = create_data_aggregator()
    
    # Test query
    test_message = TextMessage(
        content="Find flights from JFK to RUH on 2025-12-01 for 1 adult",
        source="User"
    )
    
    print(f"Query: {test_message.content}\n")
    
    # Process the request
    response = await agent.on_messages([test_message], cancellation_token=None)
    
    print(f"\nAgent Response:")
    print(response.chat_message.content if response.chat_message else "No response")
    
    # Show cache stats
    cacher = AmadeusCacher()
    stats = cacher.get_stats()
    print(f"\n📊 Cache Stats: {stats}")


if __name__ == "__main__":
    asyncio.run(test_data_aggregator())
