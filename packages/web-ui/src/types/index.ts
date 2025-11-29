export type ViewMode = 'grid' | 'list';

export enum AgentRole {
  HOST = 'host',
  BROKER = 'broker',
  CLOSER = 'closer',
  GUARDIAN = 'guardian',
  MENTOR = 'mentor',
  GENERIC = 'generic'
}

export enum KitType {
  VOX = 'vox',
  GROWTH = 'growth',
  DEFENSE = 'defense',
  ANALYTICS = 'analytics',
  ENGAGEMENT = 'engagement',
  BASIC = 'basic'
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  capabilities: string[];
  image?: string;
  description?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  price?: number;
  associatedKit?: KitType;
  axiomId?: {
    generation: string;
    serialNumber: string;
    directive?: string;
    skills?: string[];
    tools?: string[];
    dnaSequence?: string;
  };
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
