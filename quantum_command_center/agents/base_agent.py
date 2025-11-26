# /agents/base_agent.py
import os
from dotenv import load_dotenv
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Load environment variables from .env file
load_dotenv()

# Load config from environment or yaml (mocked for now, but structure is ready)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "placeholder_key")

def create_base_assistant(name: str, system_message: str) -> AssistantAgent:
    """Creates a standard QCC Assistant Agent using Gemini."""
    
    # Configure the model client for Gemini
    model_client = OpenAIChatCompletionClient(
        model="gemini-flash-latest",
        api_key=GEMINI_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        model_capabilities={
            "vision": True,
            "function_calling": True,
            "json_output": True,
        },
    )

    return AssistantAgent(
        name=name,
        system_message=system_message,
        model_client=model_client, # Correct argument for 0.4+
        # human_input_mode="NEVER", # Not a direct arg in AssistantAgent init anymore, handled by runtime/team
    )

def create_user_proxy(name: str) -> UserProxyAgent:
    """Creates a User Proxy for receiving user inputs."""
    return UserProxyAgent(
        name=name,
        # human_input_mode="ALWAYS", 
        # code_execution_config={"work_dir": "coding", "use_docker": False}
    )


