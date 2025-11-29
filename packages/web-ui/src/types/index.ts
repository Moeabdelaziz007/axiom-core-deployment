export type ViewMode = 'grid' | 'list';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  capabilities: string[];
  image?: string;
  axiomId?: {
    generation: string;
    serialNumber: string;
    directive?: string;
  };
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
