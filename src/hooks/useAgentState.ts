import { useState, useEffect } from 'react';
import { agentDataService, AgentState } from '@/lib/AgentDataService';

export function useAgentState(agentId: string) {
    const [state, setState] = useState<AgentState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!agentId) return;

        setLoading(true);

        const unsubscribe = agentDataService.subscribe(agentId, (newState) => {
            setState(newState);
            setLoading(false);
        });

        // Initial fetch
        agentDataService.fetchAgentState(agentId).catch(err => {
            console.error(err);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, [agentId]);

    const unlockSkill = async (skillId: string) => {
        if (!agentId) return false;
        return await agentDataService.unlockSkill(agentId, skillId);
    };

    return {
        state,
        loading,
        unlockSkill
    };
}
