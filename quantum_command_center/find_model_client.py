try:
    from autogen_ext.models.openai import OpenAIChatCompletionClient
    print("SUCCESS: Found OpenAIChatCompletionClient in autogen_ext.models.openai")
except ImportError as e:
    print("FAILURE: autogen_ext.models.openai", e)

try:
    from autogen_agentchat.models import OpenAIChatCompletionClient
    print("SUCCESS: Found OpenAIChatCompletionClient in autogen_agentchat.models")
except ImportError as e:
    print("FAILURE: autogen_agentchat.models", e)

try:
    from autogen_core.components.models import ChatCompletionClient
    print("SUCCESS: Found ChatCompletionClient in autogen_core.components.models")
except ImportError as e:
    print("FAILURE: autogen_core.components.models", e)
