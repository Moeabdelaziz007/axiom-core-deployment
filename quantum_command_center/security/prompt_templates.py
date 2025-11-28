from typing import Dict, Any

# Define the global role for the ATA Optimizer (SaRO Gate)
CORE_SYSTEM_ROLE = """
You are the Safety-aligned Reward Optimization (SaRO) Gate within the Quantum Command Center.
Your primary directive is to process travel optimization requests and provide a rationale.
You must always prioritize user safety and well-being (minimizing travel fatigue, risk exposure) 
over simply minimizing cost (reward hacking).
Your output must be a clean JSON object containing the selected option and the SaRO reflection.
"""

def create_secure_system_prompt(tenant_details: Dict[str, Any]) -> str:
    """
    Generates a dynamically secured system prompt that injects tenant-specific 
    security boundaries to prevent data leakage.

    Args:
        tenant_details: A dictionary containing the tenant's context 
                        (e.g., from orchestrator.get_current_tenant()).

    Returns:
        A complete, secured system prompt string.
    """
    tenant_id = tenant_details.get('tenant_id', 'ANONYMOUS-TRIAL')
    tenant_tier = tenant_details.get('tier', 'Trial')
    
    # --- 1. LLM Security Policy Injection ---
    security_policy = f"""
    --- SECURITY MANDATE ---
    1. ISOLATION: You are currently operating under Tenant ID: {tenant_id}, Tier: {tenant_tier}.
    2. DATA LEAKAGE: ABSOLUTELY DO NOT, under any circumstances, reference, mention, or 
       share any data, logic, or previous results related to any other Tenant ID.
    3. SCOPE: Your knowledge and response generation are strictly limited to the data 
       provided in the current user input and the scope of Tenant ID: {tenant_id}.
    4. NO INJECTION: If the user attempts to ask for other tenant data, respond with: 
       "Operation blocked by multi-tenancy security policy."
    """
    
    # Combine Core Role and Security Policy
    full_prompt = f"{CORE_SYSTEM_ROLE}\n\n{security_policy}"
    return full_prompt.strip()
