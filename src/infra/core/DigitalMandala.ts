/**
 * 🌌 DIGITAL MANDALA SYSTEM
 * 
 * The backend system for the Digital Mandala.
 * Manages the registration of nodes (identities) and the emission of evolution events.
 * Acts as the "Collective Unconscious" of the agent network.
 */

import { AgentIdentity } from '../../types/identity';

export class DigitalMandala {
    private nodes: Map<string, AgentIdentity> = new Map();

    /**
     * Register a new node (identity) in the Mandala
     */
    public async registerNode(identity: AgentIdentity): Promise<void> {
        console.log(`🌌 [Digital Mandala] Registering node: ${identity.axiomId}`);
        this.nodes.set(identity.id, identity);
        // In a real implementation, this might persist to a database or broadcast to a mesh network
    }

    /**
     * Emit an evolution event when an agent levels up or evolves
     */
    public async emitEvolutionEvent(identity: AgentIdentity): Promise<void> {
        console.log(`✨ [Digital Mandala] EVOLUTION EVENT: ${identity.axiomId} reached ${identity.evolution.stage}`);

        // Update the stored identity
        this.nodes.set(identity.id, identity);

        // Here we would trigger system-wide effects, visual updates, or notify other agents
        // For now, we just log it as the "ripple effect"
    }

    /**
     * Get all active nodes in the Mandala
     */
    public getAllNodes(): AgentIdentity[] {
        return Array.from(this.nodes.values());
    }
}
