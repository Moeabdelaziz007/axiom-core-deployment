// Minimal fintech client for MVP
export const fintechClient = {
    async getBalance(userId: string): Promise<number> {
        // Mock data for MVP
        return 100.00;
    },

    async claimBonus(userId: string): Promise<{ success: boolean }> {
        return { success: true };
    },

    async chargeUser(userId: string, amount: number, agentName: string): Promise<{ success: boolean }> {
        return { success: true };
    },

    async speak(text: string): Promise<string | null> {
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) throw new Error('TTS API failed');

            const data = await response.json();
            return data.audioContent; // Base64 PCM
        } catch (error) {
            console.error('TTS Client Error:', error);
            return null;
        }
    }
};
