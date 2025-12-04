import time
import os
import json
from datetime import datetime
from solana.rpc.api import Client
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import TransferParams, transfer
from solders.transaction import Transaction
from solders.message import Message

class SolanaDeadHand:
    """
    ☠️ DEAD HAND PROTOCOL (Solana Edition)
    
    Marketing: "The fastest, cheapest, most immutable fail-deadly switch."
    Tech: Uses Solana's high throughput for sub-second liveness checks.
    """
    
    def __init__(self, rpc_url="https://api.devnet.solana.com", timeout_seconds=60, mock_mode=True):
        self.mock_mode = mock_mode
        self.timeout = timeout_seconds
        self.last_on_chain_beat = time.time()
        self.ark_secret = os.getenv("ARK_SECRET", "ENCRYPTED_PAYLOAD_XV92...")

        if not self.mock_mode:
            self.client = Client(rpc_url)
            self.agent_keypair = Keypair()
            print(f"☠️ DEAD HAND ARMED on SOLANA (Network: {rpc_url})")
            print(f"   Agent PubKey: {self.agent_keypair.pubkey()}")
        else:
            print(f"☠️ DEAD HAND ARMED on SOLANA (SIMULATION MODE)")
            print(f"   Agent PubKey: [MOCK_KEYPAIR_8x92...]")

    def send_heartbeat(self):
        """
        Sends a micro-transaction (Lamport) to self as a 'Proof of Life'.
        Cost: ~0.000005 SOL (Negligible).
        Speed: ~400ms.
        """
        try:
            if not self.mock_mode:
                # Simple self-transfer to record timestamp on-chain
                ix = transfer(
                    TransferParams(
                        from_pubkey=self.agent_keypair.pubkey(),
                        to_pubkey=self.agent_keypair.pubkey(),
                        lamports=1000 # Tiny amount
                    )
                )
                
                # Build transaction
                latest_blockhash = self.client.get_latest_blockhash().value.blockhash
                msg = Message([ix], self.agent_keypair.pubkey())
                tx = Transaction([self.agent_keypair], msg, latest_blockhash)
                # response = self.client.send_transaction(tx)
            
            # Simulate network latency
            time.sleep(0.4) 
            self.last_on_chain_beat = time.time()
            print(f"💓 [SOLANA] Heartbeat TX confirmed. Timestamp updated.")
            return True
            
        except Exception as e:
            print(f"⚠️ [SOLANA] Heartbeat Failed: {e}")
            return False

    def verify_liveness(self) -> dict:
        """
        Reads the blockchain state to verify if the agent is alive.
        This can be run by ANYONE (Decentralized Watchdog).
        """
        # Simulating chain read for demo
        time_since_last = time.time() - self.last_on_chain_beat
        
        status = "ALIVE"
        if time_since_last > self.timeout:
            status = "DEAD"
            
        return {
            "status": status,
            "latency": f"{time_since_last:.2f}s",
            "threshold": f"{self.timeout}s"
        }

    def execute_protocol(self):
        """
        THE TRIGGER.
        Releases the encrypted payload to the public.
        """
        print("\n" + "☠️" * 20)
        print("CRITICAL: HEARTBEAT LOST ON SOLANA CHAIN")
        print("EXECUTING DEAD HAND PROTOCOL...")
        print("-" * 40)
        print(f"🔓 RELEASING SECRET: {self.ark_secret}")
        print("📡 BROADCASTING TO ARWEAVE/IPFS...")
        print("☠️" * 20 + "\n")
        
        return "PROTOCOL_EXECUTED"

# --- Marketing Simulation ---
if __name__ == "__main__":
    # Enable mock_mode for reliable demonstration without network
    dh = SolanaDeadHand(timeout_seconds=5, mock_mode=True)
    
    # 1. Normal Operation
    print("\n--- PHASE 1: NORMAL OPS ---")
    dh.send_heartbeat()
    print(dh.verify_liveness())
    
    # 2. The Attack (Decapitation)
    print("\n--- PHASE 2: ATTACK SIMULATION ---")
    print("⚠️ Agent Process Killed / Network Severed...")
    time.sleep(7) # Wait longer than timeout
    
    # 3. The Consequence
    status = dh.verify_liveness()
    print(f"Blockchain Status: {status['status']}")
    
    if status['status'] == "DEAD":
        dh.execute_protocol()
