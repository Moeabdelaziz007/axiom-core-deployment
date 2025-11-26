# /agents/base_agent.py
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
# Note: config_list_openai_aoai might be in autogen_core or removed. 
# For 0.4+, configuration is often different. Let's assume standard OAI config for now or check docs.
# Actually, let's try to import from autogen_agentchat if possible, or fallback.
# Given the user has 0.10.0 of pyautogen (which is likely the NEW architecture), the API is different.
# However, to fix the immediate error, we will try to adapt to the new structure.

# Wait, pyautogen 0.2.x was the standard. 0.10.0 is confusing. 
# If autogen_agentchat exists, it's the new modular architecture.
# Let's try to use the new imports.

try:
    from autogen import AssistantAgent, UserProxyAgent, config_list_from_json
except ImportError:
    # Fallback for new architecture (0.4+)
    from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
    # config_list_openai_aoai might not be available directly.
    
# Mock LLM Config for Phase 1 Logic Testing
# We will construct the config list manually to avoid import errors for helper functions
MOCK_LLM_CONFIG = {
    "config_list": [
        {
            "model": "mock-llm-model",
            "api_key": "MOCK_KEY",
            "base_url": "http://localhost:11434/v1"
        }
    ]
}

def create_base_assistant(name: str, system_message: str) -> AssistantAgent:
    """Creates a standard QCC Assistant Agent."""
    return AssistantAgent(
        name=name,
        system_message=system_message,
        llm_config=MOCK_LLM_CONFIG,
        human_input_mode="NEVER",
        # is_termination_msg might need adjustment based on version, but usually supported
    )

def create_user_proxy(name: str) -> UserProxyAgent:
    """Creates a User Proxy for receiving user inputs and executing code (if necessary)."""
    return UserProxyAgent(
        name=name,
        human_input_mode="ALWAYS", # Set to ALWAYS for manual verification
        max_consecutive_auto_reply=10,
        code_execution_config={"work_dir": "coding", "use_docker": False} 
    )

def create_base_assistant(name: str, system_message: str) -> AssistantAgent:
    """Creates a standard QCC Assistant Agent."""
    return AssistantAgent(
        name=name,
        system_message=system_message,
        llm_config={"config_list": [MOCK_LLM_CONFIG]},
        human_input_mode="NEVER",
        is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
    )

def create_user_proxy(name: str) -> UserProxyAgent:
    """Creates a User Proxy for receiving user inputs and executing code (if necessary)."""
    return UserProxyAgent(
        name=name,
        human_input_mode="ALWAYS", # Set to ALWAYS for manual verification
        max_consecutive_auto_reply=10,
        code_execution_config={"work_dir": "coding", "use_docker": False} 
    )
