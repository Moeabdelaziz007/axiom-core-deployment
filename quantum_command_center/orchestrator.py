"""
Orchestrator Service
Part of Multi-Tenant Architecture Propagation

Handles request coordination and tenant context propagation using contextvars.
"""

import logging
import contextvars
from typing import Optional, Dict, Any, Coroutine
import asyncio
from fastapi import FastAPI, BackgroundTasks
from contextlib import asynccontextmanager
from quantum_command_center.security.solana_dead_hand import SolanaDeadHand

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 1. Define the Context Variable for the current Tenant's data
# This variable will hold the tenant's ID, tier, and any relevant limits.
tenant_context: contextvars.ContextVar[Optional[Dict[str, Any]]] = contextvars.ContextVar(
    'tenant_context', 
    default=None
)

def get_current_tenant() -> Optional[Dict[str, Any]]:
    """Retrieves the tenant context for the currently running async task."""
    return tenant_context.get()

def get_tenant_id() -> Optional[str]:
    """Retrieves the tenant_id from the current context."""
    context = tenant_context.get()
    return context.get('tenant_id') if context else None

async def run_agent_workflow(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mock workflow execution.
    In reality, this would call specific agents (OAA, ATA, etc.).
    """
    tenant = get_current_tenant()
    logger.info(f"Executing workflow for Tenant: {tenant['name'] if tenant else 'Unknown'}")
    
    # Simulate async work
    await asyncio.sleep(0.1)
    
    return {
        "status": "success",
        "processed_by": "AgentSwarm",
        "tenant_id": get_tenant_id()
    }

async def handle_request(request_data: Dict[str, Any], tenant_details: Dict[str, Any]):
    """
    Entry point for handling requests with tenant context.
    
    Args:
        request_data: The payload of the request.
        tenant_details: The tenant information extracted from Gateway/Auth.
    """
    # 2. Set the context using .set() method
    token = tenant_context.set(tenant_details)
    logger.info(f"✅ Context set for Tenant: {tenant_details.get('tenant_id')}")

    try:
        # 3. Call the core business logic
        result = await run_agent_workflow(request_data)
        return result
        
    finally:
        tenant_context.reset(token)
        logger.info(f"🛑 Context reset for Tenant: {tenant_details.get('tenant_id')}")

# --- Global Guardian Instance ---
# In production, load RPC and Key from secure env
dead_hand_guardian = SolanaDeadHand(timeout_seconds=60) 

async def heartbeat_loop():
    """
    💓 The Eternal Pulse.
    Runs in the background to prove to the blockchain that the system is alive.
    """
    print("💓 [ORCHESTRATOR] STARTING HEARTBEAT SERVICE...")
    while True:
        try:
            # Send Pulse to Solana
            dead_hand_guardian.send_heartbeat()
            
            # Wait for next beat (e.g., every 30 seconds)
            # Must be less than timeout (60s)
            await asyncio.sleep(30) 
        except asyncio.CancelledError:
            print("💔 [ORCHESTRATOR] HEARTBEAT STOPPED (System Shutdown).")
            break
        except Exception as e:
            print(f"⚠️ [ORCHESTRATOR] HEARTBEAT ERROR: {e}")
            # In a real scenario, we might retry or alert Raqib
            await asyncio.sleep(10)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifecycle Manager.
    Starts the heartbeat when the server starts.
    Stops it when the server shuts down (Graceful Death).
    """
    # 1. Startup: Start the Heartbeat
    task = asyncio.create_task(heartbeat_loop())
    
    yield # Server is running here...
    
    # 2. Shutdown: Stop the Heartbeat
    # Note: If the server crashes hard (Kill -9), this won't run, 
    # and the Dead Hand WILL trigger. This is by design.
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

# --- Initialize App with Lifespan ---
app = FastAPI(
    title="Quantum Command Center",
    version="1.0.0",
    lifespan=lifespan # Inject the heartbeat lifecycle
)

# Example Endpoint to check status
@app.get("/system/status")
def get_system_status():
    return {
        "status": "OPERATIONAL",
        "guardian": "ARMED",
        "last_beat": dead_hand_guardian.last_on_chain_beat
    }

if __name__ == "__main__":
    # Test the context propagation
    async def main():
        tenant_a = {"tenant_id": "uuid-1", "name": "Tenant A", "tier": "FREE"}
        tenant_b = {"tenant_id": "uuid-2", "name": "Tenant B", "tier": "PRO"}
        
        # Run concurrent requests to verify isolation
        task1 = handle_request({"task": "deploy"}, tenant_a)
        task2 = handle_request({"task": "optimize"}, tenant_b)
        
        results = await asyncio.gather(task1, task2)
        print("Results:", results)

    asyncio.run(main())
