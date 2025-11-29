export enum AgentRole {
  BROKER = 'AQAR',
  HOST = 'SOFRA',
  ORGANIZER = 'MAWID',
  MERCHANT = 'TAJER',
  EXECUTIVE = 'MUDEER',
  CLOSER = 'DALAL',
  SUPPORT = 'KHIDMA',
  COUNSEL = 'MOHAMI',
  BUILDER = 'MUHANDIS',
  CREATOR = 'MUSAWWIM',
  AUDITOR = 'MUHASIB',
  GUARDIAN = 'HARES',
  HEALER = 'TABIB',
  MENTOR = 'MUALEM',
  VISIONARY = 'RAED'
}

export interface AxiomID {
  serialNumber: string;
  generation: string;
  directive: string;
  dnaSequence: string; // Visual hex code or string
  skills: string[];
  tools: string[];
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  status: 'active' | 'idle' | 'training' | 'error';
  cpuUsage: number;
  memoryUsage: number;
  price: number;
  image: string;
  axiomId: AxiomID;
  installedKits?: string[];
  associatedKit?: KitType; // The Kit this agent powers
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  MARKETPLACE = 'MARKETPLACE',
  FORGE = 'FORGE',
  STAKING = 'STAKING',
  WORKSPACE = 'WORKSPACE',
  AGENTS = 'AGENTS',
  PRICING = 'PRICING',
  ENTERPRISE = 'ENTERPRISE',
  ABOUT = 'ABOUT'
}

export interface ForgeState {
  isRecording: boolean;
  transcript: string;
  generatedSpec: string | null;
  isThinking: boolean;
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