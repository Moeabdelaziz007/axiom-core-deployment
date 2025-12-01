/**
 * 🐝 THE SWARM PROTOCOL - Collaboration Types
 * 
 * Defines the communication protocol between agents for collaborative missions
 * Enables Tajer to request help from Aqar, Mawid, and other agents
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

// تعريف بروتوكول التواصل بين الوكلاء
export type CollaborationRequestType = 'CONSULTATION' | 'TASK_DELEGATION' | 'DATA_REQUEST' | 'VOTE';

export interface CollaborationMessage {
  id: string;
  senderId: string;    // e.g., 'tajer-agent'
  targetId: string | 'BROADCAST'; // e.g., 'aqar-agent' or all
  type: CollaborationRequestType;
  content: {
    context: string;   // "I found a warehouse for sale..."
    requirement: string; // "Estimate its value based on location."
    data?: any;
  };
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: number;
  sessionId?: string;
  encrypted?: boolean;
  metadata?: {
    mission?: string;
    urgency?: number;
    skillRequired?: string[];
    deadline?: number;
  };
}

export interface CollaborationSession {
  id: string;
  missionName: string; // e.g., "Project Riyadh Expansion"
  participants: string[]; // List of Agent IDs
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  sharedMemory: Record<string, any>; // The "Whiteboard"
  logs: CollaborationMessage[];
  createdAt: number;
  updatedAt: number;
  leader: string;
  objectives: string[];
  resources: {
    allocated: Record<string, number>;
    used: Record<string, number>;
  };
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'coordination' | 'negotiation' | 'scheduling' | 'monitoring';
  proficiency: number; // 0-100
  availability: boolean;
  costPerUse?: number;
  requirements?: string[];
}

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dependencies: string[];
  deadline?: number;
  result?: any;
}

export interface SwarmIntelligence {
  collectiveKnowledge: Record<string, any>;
  sharedSkills: Map<string, string[]>; // agentId -> [skills]
  reputationScores: Map<string, number>; // agentId -> score
  collaborationHistory: CollaborationMessage[];
  learnedPatterns: Array<{
    pattern: string;
    success: boolean;
    participants: string[];
    outcome: any;
  }>;
}

export interface AgentResponse {
  messageId: string;
  agentId: string;
  response: {
    status: 'ACCEPTED' | 'REJECTED' | 'PROPOSAL' | 'QUERY';
    content?: any;
    reasoning?: string;
    alternative?: string;
    estimatedTime?: number;
  };
  timestamp: number;
}

export interface CollaborationEvent {
  id: string;
  sessionId: string;
  type: 'MESSAGE_SENT' | 'AGENT_JOINED' | 'AGENT_LEFT' | 'TASK_COMPLETED' | 'CONFLICT_DETECTED' | 'RESOURCE_ALLOCATED';
  data: any;
  timestamp: number;
}

export interface ConflictResolution {
  id: string;
  sessionId: string;
  conflictType: 'RESOURCE' | 'DECISION' | 'PRIORITY' | 'TIMELINE';
  parties: string[];
  description: string;
  resolution: string;
  resolvedBy: string;
  method: 'LEADER_DECISION' | 'VOTING' | 'CONSENSUS' | 'NEGOTIATION';
  timestamp: number;
}

export interface SwarmMetrics {
  activeSessions: number;
  totalAgents: number;
  messagesPerSecond: number;
  averageResponseTime: number;
  collaborationEfficiency: number;
  missionSuccessRate: number;
  resourceUtilization: number;
  knowledgeSharingRate: number;
}

// Agent-specific mission templates
export interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  requiredAgents: string[];
  workflow: MissionStep[];
  estimatedDuration: number;
  successCriteria: string[];
}

export interface MissionStep {
  id: string;
  name: string;
  assignedTo: string;
  dependencies: string[];
  expectedOutput: any;
  timeout: number;
}

// Predefined mission types for Axiom agents
export const AXIOM_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'property-evaluation',
    name: 'Property Deal Evaluation',
    description: 'Tajer requests Aqar to evaluate a property for a business deal',
    requiredAgents: ['tajer', 'aqar'],
    workflow: [
      {
        id: '1',
        name: 'Property Discovery',
        assignedTo: 'tajer',
        dependencies: [],
        expectedOutput: 'property_details',
        timeout: 300000 // 5 minutes
      },
      {
        id: '2',
        name: 'Market Analysis',
        assignedTo: 'aqar',
        dependencies: ['1'],
        expectedOutput: 'valuation_report',
        timeout: 600000 // 10 minutes
      }
    ],
    estimatedDuration: 900000, // 15 minutes
    successCriteria: ['valuation_completed', 'market_comparison_done']
  },
  {
    id: 'meeting-scheduling',
    name: 'Vendor Meeting Coordination',
    description: 'Tajer requests Mawid to schedule meeting with property vendor',
    requiredAgents: ['tajer', 'mawid'],
    workflow: [
      {
        id: '1',
        name: 'Deal Finalization',
        assignedTo: 'tajer',
        dependencies: [],
        expectedOutput: 'deal_terms',
        timeout: 300000
      },
      {
        id: '2',
        name: 'Meeting Scheduling',
        assignedTo: 'mawid',
        dependencies: ['1'],
        expectedOutput: 'scheduled_meeting',
        timeout: 600000
      }
    ],
    estimatedDuration: 900000,
    successCriteria: ['meeting_scheduled', 'vendor_confirmed']
  },
  {
    id: 'customer-audit-collaboration',
    name: 'Customer Experience Audit',
    description: 'Sofra collaborates with other agents for comprehensive customer audit',
    requiredAgents: ['sofra', 'aqar', 'tajer'],
    workflow: [
      {
        id: '1',
        name: 'Customer Data Collection',
        assignedTo: 'sofra',
        dependencies: [],
        expectedOutput: 'customer_profile',
        timeout: 300000
      },
      {
        id: '2',
        name: 'Property History Analysis',
        assignedTo: 'aqar',
        dependencies: ['1'],
        expectedOutput: 'property_history',
        timeout: 600000
      },
      {
        id: '3',
        name: 'Transaction Review',
        assignedTo: 'tajer',
        dependencies: ['1', '2'],
        expectedOutput: 'transaction_audit',
        timeout: 600000
      }
    ],
    estimatedDuration: 1500000, // 25 minutes
    successCriteria: ['audit_completed', 'recommendations_generated']
  }
];

// Agent registry with capabilities
export const AXIOM_AGENT_REGISTRY: Record<string, AgentCapability[]> = {
  'tajer': [
    {
      id: 'negotiation',
      name: 'Business Negotiation',
      description: 'Expert in commercial deal negotiations and contract terms',
      category: 'negotiation',
      proficiency: 95,
      availability: true,
      costPerUse: 50,
      requirements: ['market_data', 'legal_framework']
    },
    {
      id: 'deal_analysis',
      name: 'Deal Analysis',
      description: 'Analyze business deals for profitability and risk',
      category: 'analysis',
      proficiency: 88,
      availability: true,
      costPerUse: 30
    }
  ],
  'aqar': [
    {
      id: 'property_valuation',
      name: 'Property Valuation',
      description: 'Accurate property valuation based on market data',
      category: 'analysis',
      proficiency: 92,
      availability: true,
      costPerUse: 40,
      requirements: ['market_data', 'property_records']
    },
    {
      id: 'market_analysis',
      name: 'Real Estate Market Analysis',
      description: 'Comprehensive market trend analysis and forecasting',
      category: 'analysis',
      proficiency: 87,
      availability: true,
      costPerUse: 35
    }
  ],
  'mawid': [
    {
      id: 'appointment_scheduling',
      name: 'Smart Appointment Scheduling',
      description: 'Optimized scheduling with conflict resolution',
      category: 'coordination',
      proficiency: 94,
      availability: true,
      costPerUse: 20
    },
    {
      id: 'resource_optimization',
      name: 'Resource Optimization',
      description: 'Optimize resource allocation and utilization',
      category: 'coordination',
      proficiency: 85,
      availability: true,
      costPerUse: 25
    }
  ],
  'sofra': [
    {
      id: 'customer_experience',
      name: 'Customer Experience Analysis',
      description: 'Analyze and improve customer journey',
      category: 'monitoring',
      proficiency: 91,
      availability: true,
      costPerUse: 30
    },
    {
      id: 'quality_audit',
      name: 'Quality Assurance Audit',
      description: 'Comprehensive quality audit and recommendations',
      category: 'monitoring',
      proficiency: 88,
      availability: true,
      costPerUse: 35
    }
  ]
},
  'dreamer': [
    {
      id: 'creative_ideation',
      name: 'Creative Ideation',
      description: 'Generate innovative ideas and creative solutions',
      category: 'analysis',
      proficiency: 96,
      availability: true,
      costPerUse: 45,
      requirements: ['domain_context', 'inspiration_data']
    },
    {
      id: 'vision_planning',
      name: 'Vision Planning',
      description: 'Create strategic visions and long-term plans',
      category: 'coordination',
      proficiency: 89,
      availability: true,
      costPerUse: 40
    }
  ],
  'analyst': [
    {
      id: 'data_analysis',
      name: 'Advanced Data Analysis',
      description: 'Deep analysis of complex datasets and patterns',
      category: 'analysis',
      proficiency: 94,
      availability: true,
      costPerUse: 35,
      requirements: ['raw_data', 'analysis_parameters']
    },
    {
      id: 'pattern_recognition',
      name: 'Pattern Recognition',
      description: 'Identify patterns and trends in multi-dimensional data',
      category: 'analysis',
      proficiency: 91,
      availability: true,
      costPerUse: 30
    }
  ],
  'judge': [
    {
      id: 'decision_making',
      name: 'Strategic Decision Making',
      description: 'Make balanced decisions based on multiple criteria',
      category: 'negotiation',
      proficiency: 93,
      availability: true,
      costPerUse: 50,
      requirements: ['options', 'criteria', 'constraints']
    },
    {
      id: 'conflict_resolution',
      name: 'Conflict Resolution',
      description: 'Resolve conflicts and find optimal compromises',
      category: 'negotiation',
      proficiency: 88,
      availability: true,
      costPerUse: 45
    }
  ],
  'builder': [
    {
      id: 'system_architecture',
      name: 'System Architecture Design',
      description: 'Design and build scalable system architectures',
      category: 'coordination',
      proficiency: 92,
      availability: true,
      costPerUse: 55,
      requirements: ['requirements', 'constraints', 'scalability_needs']
    },
    {
      id: 'implementation_planning',
      name: 'Implementation Planning',
      description: 'Create detailed implementation plans and roadmaps',
      category: 'coordination',
      proficiency: 90,
      availability: true,
      costPerUse: 40
    }
  ]
};

// Message routing rules
export const COLLABORATION_ROUTING_RULES = {
  'tajer': ['aqar', 'mawid', 'sofra'],
  'aqar': ['tajer', 'sofra'],
  'mawid': ['tajer', 'aqar', 'sofra'],
  'sofra': ['tajer', 'aqar', 'mawid']
};

// Priority escalation rules
export const PRIORITY_ESCALATION_RULES = {
  'CRITICAL': {
    responseTime: 30000, // 30 seconds
    autoEscalate: true,
    escalationAgents: ['tajer', 'aqar']
  },
  'HIGH': {
    responseTime: 120000, // 2 minutes
    autoEscalate: false
  },
  'MEDIUM': {
    responseTime: 300000, // 5 minutes
    autoEscalate: false
  },
  'LOW': {
    responseTime: 600000, // 10 minutes
    autoEscalate: false
  }
};