import { AgentSuperpower } from '@/infra/core/AgentSuperpowersFramework';

export interface AgentState {
    agentId: string;
    level: number;
    experience: number;
    nextLevelXP: number;
    skillPoints: number;
    skills: AgentSuperpower[];
    mastery: Record<string, number>; // skillId -> mastery level (0-100)
}

class AgentDataService {
    private static instance: AgentDataService;
    private subscribers: Map<string, Set<(state: AgentState) => void>> = new Map();
    private cache: Map<string, AgentState> = new Map();

    private constructor() { }

    public static getInstance(): AgentDataService {
        if (!AgentDataService.instance) {
            AgentDataService.instance = new AgentDataService();
        }
        return AgentDataService.instance;
    }

    /**
     * Subscribe to real-time agent state updates
     */
    public subscribe(agentId: string, callback: (state: AgentState) => void): () => void {
        if (!this.subscribers.has(agentId)) {
            this.subscribers.set(agentId, new Set());
            // Start polling or open WebSocket connection here
            this.startPolling(agentId);
        }

        this.subscribers.get(agentId)!.add(callback);

        // Return current cached state immediately if available
        if (this.cache.has(agentId)) {
            callback(this.cache.get(agentId)!);
        }

        // Return unsubscribe function
        return () => {
            const subs = this.subscribers.get(agentId);
            if (subs) {
                subs.delete(callback);
                if (subs.size === 0) {
                    this.subscribers.delete(agentId);
                    this.stopPolling(agentId);
                }
            }
        };
    }

    /**
     * Fetch latest agent state
     */
    public async fetchAgentState(agentId: string): Promise<AgentState> {
        try {
            // In a real app, this would call your API
            // const response = await fetch(`/api/agents/${agentId}/state`);
            // const data = await response.json();

            // Mock data for now
            const mockState: AgentState = this.getMockState(agentId);

            this.updateCache(agentId, mockState);
            return mockState;
        } catch (error) {
            console.error('Failed to fetch agent state:', error);
            throw error;
        }
    }

    /**
     * Update agent state (e.g. unlock skill)
     */
    public async unlockSkill(agentId: string, skillId: string): Promise<boolean> {
        try {
            // const response = await fetch(`/api/agents/${agentId}/skills/unlock`, {
            //   method: 'POST',
            //   body: JSON.stringify({ skillId })
            // });

            // Simulate success
            const currentState = this.cache.get(agentId) || this.getMockState(agentId);

            // Logic to unlock skill would go here
            console.log(`Unlocking skill ${skillId} for agent ${agentId}`);

            // For mock purposes, we just return true
            return true;
        } catch (error) {
            console.error('Failed to unlock skill:', error);
            return false;
        }
    }

    private updateCache(agentId: string, newState: AgentState) {
        this.cache.set(agentId, newState);
        this.notifySubscribers(agentId, newState);
    }

    private notifySubscribers(agentId: string, state: AgentState) {
        const subs = this.subscribers.get(agentId);
        if (subs) {
            subs.forEach(callback => callback(state));
        }
    }

    // Polling simulation
    private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

    private startPolling(agentId: string) {
        if (this.pollingIntervals.has(agentId)) return;

        const interval = setInterval(async () => {
            await this.fetchAgentState(agentId);
        }, 5000); // Poll every 5 seconds

        this.pollingIntervals.set(agentId, interval);
    }

    private stopPolling(agentId: string) {
        const interval = this.pollingIntervals.get(agentId);
        if (interval) {
            clearInterval(interval);
            this.pollingIntervals.delete(agentId);
        }
    }

    private getMockState(agentId: string): AgentState {
        // Return mock data consistent with SkillTree.tsx
        return {
            agentId,
            level: 5,
            experience: 4500,
            nextLevelXP: 5000,
            skillPoints: 3,
            mastery: {
                'neural_learning': 85,
                'api_connector': 100
            },
            skills: [] // We'll populate this with the full list in a real scenario
        };
    }
}

export const agentDataService = AgentDataService.getInstance();
