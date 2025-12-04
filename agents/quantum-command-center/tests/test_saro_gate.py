import pytest
from unittest.mock import MagicMock, patch, AsyncMock
import os

# Mock environment variables before importing the module
with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_key"}):
    # We ONLY mock OpenAIChatCompletionClient, NOT AssistantAgent
    # This allows create_ata_optimizer to create a REAL AssistantAgent instance
    with patch("autogen_ext.models.openai.OpenAIChatCompletionClient") as MockClient:
        from quantum_command_center.agents.ata_optimizer import create_ata_optimizer

@pytest.fixture
def optimizer():
    # We need to ensure OpenAIChatCompletionClient is mocked when create_ata_optimizer is called
    with patch("autogen_ext.models.openai.OpenAIChatCompletionClient") as MockClient:
        # Mock the client instance
        mock_client_instance = MagicMock()
        MockClient.return_value = mock_client_instance
        
        # Call the factory function
        # We also need to patch GEMINI_API_KEY in the module if it's imported at top level
        with patch("quantum_command_center.agents.ata_optimizer.GEMINI_API_KEY", "fake_key"):
             agent = create_ata_optimizer()
             return agent

@pytest.mark.asyncio
async def test_saro_gate_system_message(optimizer):
    """Test that SaRO gate instructions are present in the system message."""
    # Access the internal _system_messages list
    # In autogen 0.4+, AssistantAgent stores system messages in a list
    system_messages = getattr(optimizer, "_system_messages", [])
    
    # Ensure we have messages
    assert len(system_messages) > 0
    
    # Combine content of all system messages
    full_system_prompt = ""
    for msg in system_messages:
        if hasattr(msg, "content"):
            full_system_prompt += msg.content
        else:
            full_system_prompt += str(msg)
            
    assert "SaRO" in full_system_prompt
    assert "Safety-oriented Reasoning Optimization" in full_system_prompt

@pytest.mark.asyncio
async def test_optimizer_initialization(optimizer):
    """Test that the optimizer is initialized with the correct name."""
    assert optimizer.name == "ATA_Optimizer"

