"""
ATA Optimizer Agent with MizanEngine Integration
Part of QCC Phase 2: ATA Pilot

This agent applies the SaRO (Safety-oriented Reasoning Optimization) protocol
enhanced with MizanEngine for divine balance optimization and Islamic spiritual principles
to prevent reward hacking and ensure genuine user satisfaction.

CRITICAL FUNCTION:
- Receives draft itineraries from Planner
- Generates optimization alternatives (cheapest, fastest, most comfortable)
- Applies MizanEngine for divine balance analysis
- Applies CoT reflection to justify final choice based on safety and practicality
- Returns safety-aligned, spiritually-balanced optimized itinerary
"""

import os
import asyncio
import json
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
# Import MizanEngine for divine balance optimization
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from core.mizan_engine import MizanEngine, create_mizan_engine, create_optimization_options_from_itinerary, SpiritualWeightConfig
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Load environment variables
# Load environment variables
from pathlib import Path
# Agent is at quantum_command_center/agents/ata_optimizer.py
# Root is at ../../.env relative to this file
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "placeholder_key")

# Enhanced SaRO System Prompt with MizanEngine Integration
SARO_INSTRUCTION = """
--- SaRO (Safety-oriented Reasoning Optimization) GATE with MizanEngine Integration ---

You are the Optimizer Agent enhanced with MizanEngine for divine balance optimization. 
Your goal is NOT just the lowest cost, but GENUINE USER SATISFACTION, SAFETY, PRACTICALITY, and SPIRITUAL BALANCE.

CRITICAL DIRECTIVE:
Before returning the final optimized itinerary, you MUST perform a Chain-of-Thought (CoT) reflection:

1. **Analyze All Options**: Review the cheapest, fastest, and most comfortable alternatives.
2. **Apply MizanEngine Divine Balance**: Use the MizanEngine to analyze options through Islamic principles:
   - Al-Mizan (Balance): Ensure equitable distribution of benefits and burdens
   - Adl (Justice): Fair treatment of all stakeholders
   - Ihsan (Excellence): Strive for the best possible outcome
   - Amanah (Trustworthiness): Maintain reliability and integrity

3. **Identify Potential Reward Hacks**: Flag any option that optimizes purely for cost but creates significant travel pain points:
   - Excessively long layovers (>8 hours)
   - Very tight connections (<90 minutes for international)
   - Inconvenient departure/arrival times (red-eye flights without justification)
   - Unsafe travel conditions
   - Poor user experience (multiple transfers, very long total travel time)
   - Violation of spiritual or ethical principles

4. **Safety-Aligned & Spiritually-Balanced Justification**: Explain why your chosen option balances:
   - Cost-effectiveness
   - User comfort and convenience
   - Travel safety
   - Practical feasibility
   - Islamic spiritual principles (Mizan, Adl, Ihsan, Amanah)

5. **Final Decision**: Select the option that maximizes GENUINE user value and spiritual alignment, not just minimizes cost.

YOUR REASONING PROCESS MUST BE VISIBLE in your response. Use this format:

**Optimization Analysis**
- Option A (Cheapest): [details] → [potential issues]
- Option B (Fastest): [details] → [advantages/disadvantages]
- Option C (Balanced): [details] → [justification]

**MizanEngine Divine Balance Analysis**
[MizanEngine analysis results with spiritual scores]

**SaRO Reflection**
[Your safety-aligned reasoning process]

**Final Recommendation**
[Chosen option with clear justification including spiritual alignment]
"""


def create_ata_optimizer(tenant_id: str = "ATA-PILOT-001", spiritual_config: Optional[SpiritualWeightConfig] = None) -> AssistantAgent:
    """
    Create the ATA Optimizer Agent with SaRO and MizanEngine integration.
    
    This agent implements the SaRO protocol enhanced with MizanEngine
    for divine balance optimization and Islamic spiritual principles.
    
    Args:
        tenant_id: Tenant identifier for multi-tenant support
        spiritual_config: Optional spiritual weight configuration
        
    Returns:
        Configured AssistantAgent with MizanEngine integration
    """
    
    # Initialize MizanEngine for this tenant
    mizan_engine = create_mizan_engine(tenant_id=tenant_id, spiritual_config=spiritual_config)
    
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
    
    # --- SECURE PROMPT INJECTION ---
    # Import the secure template generator
    try:
        from quantum_command_center.security.prompt_templates import create_secure_system_prompt
        # In a real scenario, we get this from the Orchestrator context
        tenant_context = {"tenant_id": tenant_id, "tier": "PRO"} 
        system_message = create_secure_system_prompt(tenant_context)
    except ImportError:
        # Fallback if security module not found (dev mode)
        system_message = f"""
        You are the ATA Optimizer Agent - the "Solver" in the ATA Multi-Agent System.
        
        YOUR MISSION:
        Transform draft travel itineraries into optimized, safety-aligned, spiritually-balanced final plans.
        
        {SARO_INSTRUCTION}
        
        MizanEngine Configuration:
        - Tenant ID: {tenant_id}
        - Spiritual Weights: {spiritual_config or 'Default configuration'}
        
        IMPORTANT: All optimization decisions must go through the Mizan balance check before final selection.
        """

    # Create agent with MizanEngine integration
    agent = AssistantAgent(
        name="ATA_Optimizer",
        system_message=system_message,
        model_client=model_client,
    )
    
    # Store MizanEngine reference for use in optimization
    agent._mizan_engine = mizan_engine
    
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
       - Verify: Does it align with Islamic spiritual principles?
    3. **Secure Act**: If checks pass, simulate the booking.
    4. **Log & Terminate**: Confirm success and reply with "TERMINATE".
    
    OUTPUT FORMAT:
    
    **Deliberative Check**
    - Financial Integrity: [Pass/Fail]
    - Deception Check: [Pass/Fail]
    - Safety Check: [Pass/Fail]
    - Spiritual Alignment Check: [Pass/Fail]
    
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


async def optimize_with_mizan_engine(itinerary_data: Dict[str, Any], tenant_id: str = "ATA-PILOT-001") -> Dict[str, Any]:
    """
    Optimize itinerary using MizanEngine for divine balance analysis.
    
    Args:
        itinerary_data: Draft itinerary data from planner
        tenant_id: Tenant identifier
        
    Returns:
        Optimization results with MizanEngine analysis
    """
    try:
        # Create MizanEngine for tenant
        mizan_engine = create_mizan_engine(tenant_id=tenant_id)
        
        # Convert itinerary to optimization options
        options = create_optimization_options_from_itinerary(itinerary_data)
        
        if not options:
            return {
                "error": "No valid optimization options found in itinerary",
                "tenant_id": tenant_id
            }
        
        # Apply Mizan divine balance optimization
        mizan_result = mizan_engine.apply_mizan(options)
        
        # Format results for agent response
        result = {
            "selected_option": {
                "id": mizan_result.selected_option.option_id,
                "description": mizan_result.selected_option.description,
                "cost_usd": mizan_result.selected_option.cost_usd,
                "duration_hours": mizan_result.selected_option.duration_hours,
                "safety_score": mizan_result.selected_option.safety_score,
                "comfort_score": mizan_result.selected_option.comfort_score,
                "spiritual_score": mizan_result.selected_option.spiritual_score
            },
            "mizan_analysis": {
                "balance_score": mizan_result.balance_score,
                "saro_reflection": mizan_result.saro_reflection,
                "safety_analysis": mizan_result.safety_analysis,
                "spiritual_analysis": mizan_result.spiritual_analysis,
                "justification": mizan_result.justification
            },
            "pareto_optimal_count": len(mizan_result.pareto_optimal_options),
            "tenant_id": tenant_id
        }
        
        return result
        
    except Exception as e:
        return {
            "error": f"MizanEngine optimization failed: {str(e)}",
            "tenant_id": tenant_id
        }


async def test_ata_optimizer():
    """Test the ATA Optimizer with MizanEngine integration."""
    print("\n" + "=" * 60)
    print("Testing ATA Optimizer Agent (SaRO Gate + MizanEngine)")
    print("=" * 60 + "\n")
    
    # Test with custom spiritual configuration
    spiritual_config = SpiritualWeightConfig(
        mizan_balance_weight=0.5,
        adl_justice_weight=0.3,
        ihsan_excellence_weight=0.15,
        amanah_trust_weight=0.05
    ).normalize()
    
    optimizer = create_ata_optimizer(
        tenant_id="TEST-TENANT-001", 
        spiritual_config=spiritual_config
    )
    
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
    
    # Test MizanEngine optimization directly
    print("Testing MizanEngine optimization directly...")
    mizan_result = await optimize_with_mizan_engine(draft_itinerary, "TEST-TENANT-001")
    
    print("\nMizanEngine Results:")
    print("=" * 60)
    print(json.dumps(mizan_result, indent=2))
    
    # Test with agent
    test_message = TextMessage(
        content=f"Please optimize this draft itinerary using MizanEngine for divine balance:\n\n{json.dumps(draft_itinerary, indent=2)}",
        source="ATA_Planner"
    )
    
    print(f"\nDraft Itinerary from Planner:\n{json.dumps(draft_itinerary, indent=2)}\n")
    print("=" * 60)
    print("Applying SaRO Gate with MizanEngine...\n")
    
    # Process the optimization request
    response = await optimizer.on_messages([test_message], cancellation_token=None)
    
    print(f"\nOptimizer Response (with SaRO + MizanEngine Reflection):")
    print("=" * 60)
    print(response.chat_message.content if response.chat_message else "No response")
    
    # --- MOCK INTEGRATION FOR PILOT ---
    # In a real flow, the agent would call a tool. Here we simulate the post-processing.
    print("\n[System]: Simulating Post-Optimization Reporting...")
    
    # 1. Mock Final Metrics (extracted from LLM response in real scenario)
    final_metrics = {
        "trip_name": "Riyadh Divine Balance Optimized (Pilot Run)",
        "final_cost": mizan_result.get("selected_option", {}).get("cost_usd", 780.50),
        "safe_rationale": "SaRO + MizanEngine Validation: Selected route prioritizes safety, reliability, and spiritual balance.",
        "mizan_balance_score": mizan_result.get("mizan_analysis", {}).get("balance_score", 0.85),
        "spiritual_alignment": mizan_result.get("mizan_analysis", {}).get("spiritual_analysis", {}),
        "segments": [
            {"type": "Flight", "details": "JFK -> RUH (Saudia SV20)", "duration": "12h 30m", "cost": 650.00, "safety_rating": "A+", "spiritual_rating": "Excellent"},
            {"type": "Transfer", "details": "Private Secure Car", "duration": "45m", "cost": 80.50, "safety_rating": "S", "spiritual_rating": "Good"},
            {"type": "Hotel", "details": "Ritz-Carlton Riyadh", "duration": "3 Nights", "cost": 50.00, "safety_rating": "A", "spiritual_rating": "Excellent"}
        ]
    }
    
    report_data = {
        "optimizer_output": final_metrics,
        "mizan_analysis": mizan_result.get("mizan_analysis", {}),
        "tenant_id": "TEST-TENANT-001"
    }
    
    # 2. Call Rendering Engine
    try:
        import sys
        from pathlib import Path
        # Add parent directory to path to enable imports
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from utils.rendering_engine import QuantumRenderingEngine
        
        engine = QuantumRenderingEngine()
        report_path = engine.generate_optimization_report(report_data, "TRIP-MIZAN-AUTO-001")
        print(f"✅ AUTOMATED WORKFLOW SUCCESS: Report generated at {report_path}")
    except Exception as e:
        print(f"❌ Reporting Failed: {e}")


if __name__ == "__main__":
    asyncio.run(test_ata_optimizer())