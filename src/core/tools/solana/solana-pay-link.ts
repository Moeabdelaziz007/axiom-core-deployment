/**
 * Solana Pay Link Tool for AxiomID Agents
 * MCP tool for generating Solana Pay payment links
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getAgentWalletAddress } from "@/services/identity-service";
import { createHash } from "crypto";

export const solanaPayLinkTool: Tool = {
  name: "solana_pay_link",
  description: "Generate a Solana Pay payment link for receiving SOL payments",
  inputSchema: {
    type: "object",
    properties: {
      agentId: {
        type: "string",
        description: "The ID of the agent that will receive payment"
      },
      amount: {
        type: "number",
        description: "Amount of SOL to request (optional for open-ended payment)"
      },
      label: {
        type: "string",
        description: "Payment label/description"
      },
      message: {
        type: "string",
        description: "Payment message or memo"
      },
      reference: {
        type: "string",
        description: "Unique reference for the payment (auto-generated if not provided)"
      }
    },
    required: ["agentId"]
  }
};

export async function handleSolanaPayLink(args: any) {
  try {
    const { 
      agentId, 
      amount, 
      label, 
      message, 
      reference 
    } = args;
    
    // Validate inputs
    if (!agentId) {
      throw new Error("agentId is required");
    }

    // Get agent wallet address
    const agentWallet = await getAgentWalletAddress(agentId);
    if (!agentWallet) {
      throw new Error(`Agent wallet not found: ${agentId}`);
    }

    // Generate reference if not provided
    const paymentReference = reference || generatePaymentReference(agentId, amount, label);

    // Build Solana Pay URL
    const solanaPayUrl = buildSolanaPayUrl({
      recipient: agentWallet,
      amount,
      label,
      message,
      reference: paymentReference
    });

    return {
      success: true,
      solanaPayUrl,
      recipient: agentWallet,
      agentId,
      amount,
      label,
      message,
      reference: paymentReference,
      qrCodeData: solanaPayUrl, // QR code would contain this URL
      instructions: {
        scanWithWallet: "Scan this QR code with a Solana Pay compatible wallet",
        orCopyLink: "Or copy this link and paste in your Solana wallet app",
        network: "devnet", // Update based on configuration
        currency: "SOL"
      }
    };
  } catch (error) {
    console.error("Solana Pay link generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Generate unique payment reference
 */
function generatePaymentReference(agentId: string, amount?: number, label?: string): string {
  const timestamp = Date.now();
  const data = `${agentId}-${amount || '0'}-${label || ''}-${timestamp}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Build Solana Pay URL
 */
interface SolanaPayParams {
  recipient: string;
  amount?: number;
  label?: string;
  message?: string;
  reference: string;
}

function buildSolanaPayUrl(params: SolanaPayParams): string {
  const baseUrl = "solana:";
  const recipient = params.recipient;
  
  // Build URL parameters
  const urlParams = new URLSearchParams();
  
  if (params.amount) {
    urlParams.append('amount', params.amount.toString());
  }
  
  if (params.label) {
    urlParams.append('label', encodeURIComponent(params.label));
  }
  
  if (params.message) {
    urlParams.append('message', encodeURIComponent(params.message));
  }
  
  if (params.reference) {
    urlParams.append('reference', params.reference);
  }

  const queryString = urlParams.toString();
  return `${baseUrl}${recipient}${queryString ? '?' + queryString : ''}`;
}

/**
 * Validate Solana Pay URL format
 */
export function validateSolanaPayUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Check protocol
    if (parsedUrl.protocol !== 'solana:') {
      return false;
    }
    
    // Check recipient address format
    const recipient = parsedUrl.pathname.substring(2); // Remove '//'
    if (!recipient.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse Solana Pay URL
 */
export function parseSolanaPayUrl(url: string): {
  recipient: string;
  amount?: number;
  label?: string;
  message?: string;
  reference?: string;
} | null {
  try {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.protocol !== 'solana:') {
      return null;
    }
    
    const recipient = parsedUrl.pathname.substring(2);
    const params = new URLSearchParams(parsedUrl.search);
    
    return {
      recipient,
      amount: params.get('amount') ? parseFloat(params.get('amount')!) : undefined,
      label: params.get('label') ? decodeURIComponent(params.get('label')!) : undefined,
      message: params.get('message') ? decodeURIComponent(params.get('message')!) : undefined,
      reference: params.get('reference') || undefined
    };
  } catch {
    return null;
  }
}