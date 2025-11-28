'use server';

import { forgeTeslaAgent } from '@/services/axiomForge';

export async function generateAgentAction(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const vibe = formData.get('vibe') as string;

    if (!name || !role || !vibe) {
        return { error: "Missing required frequency data (Name, Role, or Vibe)." };
    }

    try {
        // استدعاء المسبك (The Forge)
        const agentDNA = await forgeTeslaAgent({ name, role, vibe });

        // إعادة الـ DNA للواجهة
        return { success: true, data: agentDNA };

    } catch (error) {
        console.error("Forge Error:", error);
        return { error: "Failed to establish etheric connection." };
    }
}
