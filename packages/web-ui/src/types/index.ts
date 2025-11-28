import { LucideIcon } from 'lucide-react';

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  MARKETPLACE = 'MARKETPLACE',
  FORGE = 'FORGE',
  STAKING = 'STAKING',
  AGENTS = 'AGENTS',
  PRICING = 'PRICING',
  ENTERPRISE = 'ENTERPRISE',
  ABOUT = 'ABOUT'
}

export enum AgentRole {
  HOST = 'HOST',
  NEGOTIATOR = 'NEGOTIATOR',
  ANALYST = 'ANALYST',
  GUARDIAN = 'GUARDIAN',
  CREATOR = 'CREATOR'
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  color: string;
  stats: {
    intelligence: number;
    speed: number;
    creativity: number;
  };
  price: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
}

// --- NEW PAAS TYPES ---

export enum KitType {
  VOX = 'VOX',      // Voice Interface
  LENS = 'LENS',    // Highlight Explain
  FORM = 'FORM',    // Form Autofill
  TAJER = 'TAJER',  // Smart Recommend
  HAGGLE = 'HAGGLE',// Negotiation
  GUARD = 'GUARD',  // Moderation
  LOCAL = 'LOCAL',  // Dialect Rewrite
  BRIEF = 'BRIEF',  // TL;DR
  GIFT = 'GIFT',    // Social Gifting
  COD = 'COD',      // Cash on Delivery Verify
  SOCIAL = 'SOCIAL',// Social Proof
  RAMADAN = 'RAMADAN' // Seasonal
}

export interface ExpansionKit {
  id: KitType;
  name: string;
  description: string;
  price: number;
  icon: string; // lucide icon name
  installed: boolean;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'PDF' | 'IMAGE' | 'URL';
  size: string;
  status: 'synced' | 'syncing';
}

export interface WorkspaceState {
  activeTab: 'CORTEX' | 'CORE' | 'SYNAPSE' | 'KITS';
  knowledgeBase: KnowledgeSource[];
  simulationLog: ChatMessage[];
  synapseCode: string | null;
}
