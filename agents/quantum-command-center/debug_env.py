import sys
import os

print("Python Executable:", sys.executable)
print("Current Working Directory:", os.getcwd())
print("\nSystem Path:")
for p in sys.path:
    print(p)

print("\nAttempting to import autogen...")
try:
    import autogen
    print("SUCCESS: autogen imported.")
    print("autogen file:", autogen.__file__)
except ImportError as e:
    print("FAILURE: autogen import failed.")
    print(e)

print("\nAttempting to import autogen_agentchat...")
try:
    import autogen_agentchat
    print("SUCCESS: autogen_agentchat imported.")
except ImportError as e:
    print("FAILURE: autogen_agentchat import failed.")
    print(e)
