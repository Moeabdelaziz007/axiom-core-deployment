try:
    from autogen_agentchat.teams import RoundRobinGroupChat
    print("SUCCESS: Found RoundRobinGroupChat in autogen_agentchat.teams")
except ImportError as e:
    print("FAILURE: autogen_agentchat.teams.RoundRobinGroupChat", e)

try:
    from autogen_agentchat.teams import SelectorGroupChat
    print("SUCCESS: Found SelectorGroupChat in autogen_agentchat.teams")
except ImportError as e:
    print("FAILURE: autogen_agentchat.teams.SelectorGroupChat", e)

try:
    import autogen
    print("SUCCESS: Imported autogen")
    print(dir(autogen))
except ImportError as e:
    print("FAILURE: import autogen", e)
