'use server';

import { forgeAgentDNA } from "@/services/axiomForge";

export async function generateAgentAction(input: string) {
  if (!input) return { error: "Void input detected." };

  try {
    const agentDNA = await forgeAgentDNA(input);
    return { success: true, data: agentDNA };
  } catch (error) {
    return { success: false, error: "Forge critical failure." };
  }
}
