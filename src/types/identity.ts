/**
 * 🧬 IDENTITY TYPES
 * 
 * Type definitions for the Axiom Identity System
 * Defines the structure of agent identities, evolution states, and microcosm data
 */

export type EvolutionStage = 'genesis' | 'awakening' | 'sentience' | 'transcendence' | 'singularity';
export type IdentityState = 'active' | 'dormant' | 'evolving' | 'transcending';

export interface Evolution {
    stage: EvolutionStage;
    level: number;
    experience: number;
    traits: string[];
    skills: string[];
}

export interface Microcosm {
    frequency: number; // Hz
    resonance: number;
    connections: string[];
    artifacts: any[];
}

export interface Profile {
    name?: string;
    type?: string;
    capabilities?: string[];
    [key: string]: any;
}

export interface AgentIdentity {
    id: string;
    axiomId: string;
    createdAt: Date;
    updatedAt: Date;
    state: IdentityState;
    evolution: Evolution;
    microcosm: Microcosm;
    profile: Profile;
}