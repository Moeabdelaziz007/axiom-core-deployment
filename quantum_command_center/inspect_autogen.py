from autogen_agentchat.agents import AssistantAgent
import inspect

print("Signature of AssistantAgent:")
print(inspect.signature(AssistantAgent.__init__))

print("\nHelp on AssistantAgent:")
help(AssistantAgent)
