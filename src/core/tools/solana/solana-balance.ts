/**
 * Solana Balance Tool for AxiomID Agents
 * MCP tool for checking SOL balance and account information
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getAgentBalance, getAgentAccountInfo } from "@/services/solana-tools";
import { getAgentWalletAddress } from "@/services/identity-service";

export const solanaBalanceTool: Tool = {
  name: "solana_balance",
  description: "Check SOL balance for an agent wallet or any Solana address",
  inputSchema: {
    type: "object",
    properties: {
      agentId: {
        type: "string",
        description: "The ID of the agent to check balance for (optional if address is provided)"
      },
      address: {
        type: "string",
        description: "Specific Solana address to check balance for (optional if agentId is provided)"
      },
      detailed: {
        type: "boolean",
        description: "Whether to return detailed account information (default: false)"
      }
    }
  }
};

export async function handleSolanaBalance(args: any) {
  try {
    const { agentId, address, detailed = false } = args;
    
    let targetAddress: string;
    let agentWallet: string | null = null;

    // Determine which address to check
    if (agentId) {
      agentWallet = await getAgentWalletAddress(agentId);
      if (!agentWallet) {
        throw new Error(`Agent wallet not found: ${agentId}`);
      }
      targetAddress = agentWallet;
    } else if (address) {
      targetAddress = address;
    } else {
      throw new Error("Either agentId or address must be provided");
    }

    // Validate address format
    if (!targetAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      throw new Error("Invalid Solana address format");
    }

    if (detailed) {
      // Get detailed account information
      const accountInfo = await getAgentAccountInfo(targetAddress);
      
      if (!accountInfo) {
        throw new Error("Account not found or invalid");
      }

      return {
        success: true,
        address: accountInfo.address,
        balance: accountInfo.balance,
        balanceSol: accountInfo.balanceSol,
        executable: accountInfo.executable,
        owner: accountInfo.owner,
        lamports: accountInfo.lamports,
        agentId: agentId || null,
        isAgentWallet: agentWallet === targetAddress
      };
    } else {
      // Get just the balance
      const balanceResult = await getAgentBalance(agentId || targetAddress);
      
      if (!balanceResult.success) {
        throw new Error(balanceResult.error || "Failed to get balance");
      }

      return {
        success: true,
        address: targetAddress,
        balance: balanceResult.balance,
        balanceSol: balanceResult.balanceSol,
        agentId: agentId || null,
        isAgentWallet: agentWallet === targetAddress
      };
    }
  } catch (error) {
    console.error("Solana balance check error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}