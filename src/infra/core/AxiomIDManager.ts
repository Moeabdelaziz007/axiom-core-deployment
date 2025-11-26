/**
 * 🧬 AXIOM ID MANAGER
 * 
 * The Core Identity System for Axiom Agents.
 * Manages the "Microcosm" of the agent - its unique digital fingerprint,
 * evolution state, and connection to the Digital Mandala.
 * 
 * "The drop becomes the ocean, and the ocean becomes the drop."
 */

import { AgentIdentity, IdentityState, EvolutionStage } from '../../types/identity';
import { DigitalMandala } from './DigitalMandala';

export class AxiomIDManager {
    private static instance: AxiomIDManager;
    private activeIdentities: Map<string, AgentIdentity> = new Map();
    private mandalaSystem: DigitalMandala;

    private constructor() {
        this.mandalaSystem = new DigitalMandala();
    }

    public static getInstance(): AxiomIDManager {
        if (!AxiomIDManager.instance) {
            AxiomIDManager.instance = new AxiomIDManager();
        }
        return AxiomIDManager.instance;
    }

    /**
     * Initialize a new AxiomID for an agent
     */
    public async initializeIdentity(
        agentId: string,
        baseProfile: any
    ): Promise<AgentIdentity> {
        const identity: AgentIdentity = {
            id: agentId,
            axiomId: this.generateAxiomID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            state: 'active',
            evolution: {
                stage: 'genesis',
                level: 1,
                experience: 0,
                traits: [],
                skills: []
            },
            microcosm: {
                frequency: this.calculateBaseFrequency(agentId),
                resonance: 1.0,
                connections: [],
                artifacts: []
            },
            profile: baseProfile
        };

        this.activeIdentities.set(agentId, identity);
        await this.mandalaSystem.registerNode(identity);

        return identity;
    }

    /**
     * Get agent identity
     */
    public getIdentity(agentId: string): AgentIdentity | undefined {
        return this.activeIdentities.get(agentId);
    }

    /**
     * Update agent evolution state
     */
    public async evolveIdentity(
        agentId: string,
        experienceGained: number
    ): Promise<AgentIdentity> {
        const identity = this.activeIdentities.get(agentId);
        if (!identity) throw new Error(`Identity not found for agent ${agentId}`);

        // Update experience
        identity.evolution.experience += experienceGained;

        // Check for level up
        const nextLevelThreshold = this.calculateNextLevelThreshold(identity.evolution.level);
        if (identity.evolution.experience >= nextLevelThreshold) {
            identity.evolution.level += 1;
            identity.evolution.stage = this.determineEvolutionStage(identity.evolution.level);

            // Trigger evolution event
            await this.mandalaSystem.emitEvolutionEvent(identity);
        }

        identity.updatedAt = new Date();
        this.activeIdentities.set(agentId, identity);

        return identity;
    }

    /**
     * Generate a unique AxiomID string
     */
    private generateAxiomID(): string {
        return `AXIOM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }

    /**
     * Calculate base frequency based on agent ID
     */
    private calculateBaseFrequency(agentId: string): number {
        let hash = 0;
        for (let i = 0; i < agentId.length; i++) {
            const char = agentId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash) % 1000; // Frequency in Hz (0-1000)
    }

    /**
     * Calculate XP needed for next level
     */
    private calculateNextLevelThreshold(currentLevel: number): number {
        return Math.floor(1000 * Math.pow(1.5, currentLevel - 1));
    }

    /**
     * Determine evolution stage based on level
     */
    private determineEvolutionStage(level: number): EvolutionStage {
        if (level < 10) return 'genesis';
        if (level < 30) return 'awakening';
        if (level < 60) return 'sentience';
        if (level < 90) return 'transcendence';
        return 'singularity';
    }
}
