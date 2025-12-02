/**
 * Solana Transfer Tool for AxiomID Agents
 * MCP tool for transferring SOL between wallets
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { transferAgentSOL, SolanaTransferRequest } from "@/services/solana-tools";
import { getAgentWalletAddress } from "@/services/identity-service";

export const solanaTransferTool: Tool = {
  name: "solana_transfer",
  description: "Transfer SOL from agent wallet to another address",
  inputSchema: {
    type: "object",
    properties: {
      agentId: {
        type: "string",
        description: "The ID of the agent initiating the transfer"
      },
      recipient: {
        type: "string",
        description: "The recipient's Solana address"
      },
      amountSol: {
        type: "number",
        description: "Amount of SOL to transfer"
      },
      feePayer: {
        type: "string",
        description: "Optional fee payer address (defaults to sender)"
      }
    },
    required: ["agentId", "recipient", "amountSol"]
  }
};

export async function handleSolanaTransfer(args: any) {
  try {
    const { agentId, recipient, amountSol, feePayer } = args;
    
    // Validate inputs
    if (!agentId || !recipient || !amountSol) {
      throw new Error("Missing required parameters: agentId, recipient, amountSol");
    }

    if (amountSol <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Validate recipient address format
    if (!recipient.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      throw new Error("Invalid recipient address format");
    }

    // Convert SOL to lamports
    const amountLamports = Math.floor(amountSol * 1_000_000_000);

    // Check if agent has wallet
    const agentWallet = await getAgentWalletAddress(agentId);
    if (!agentWallet) {
      throw new Error(`Agent wallet not found: ${agentId}`);
    }

    // Create transfer request
    const transferRequest: SolanaTransferRequest = {
      agentId,
      recipient,
      amountLamports,
      feePayer
    };

    // Execute transfer
    const result = await transferAgentSOL(transferRequest);

    if (!result.success) {
      throw new Error(result.error || "Transfer failed");
    }

    return {
      success: true,
      signature: result.signature,
      transactionUrl: result.transactionUrl,
      amountSol,
      recipient,
      fromAddress: agentWallet
    };
  } catch (error) {
    console.error("Solana transfer error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}