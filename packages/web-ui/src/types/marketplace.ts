// Agent Blueprint Types
export interface AgentBlueprint {
  id: string;
  name: string;
  role: 'TAJER' | 'MUSAFIR' | 'SOFRA' | 'MOSTASHAR';
  description: string;
  priceMonthlyUsd: number; // Stored in cents (e.g., 99 = $0.99)
  capabilities: AgentCapabilities;
  imageUrl: string;
  modelProvider: 'groq' | 'google';
  modelName: string;
  temperature: number;
  tools: string[];
  systemPrompt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields from API
  priceDisplay?: string;
}

export interface AgentCapabilities {
  specialties: string[];
  languages: string[];
  response_speed?: string;
  max_tokens?: number;
  real_time_search?: boolean;
  vision_capabilities?: boolean;
  context_window?: number;
}

// API Response Types
export interface MarketplaceApiResponse {
  success: boolean;
  data: AgentBlueprint[];
  count: number;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
}

// Component Props
export interface AgentCardProps {
  blueprint: AgentBlueprint;
  isWalletConnected: boolean;
  onHire: (blueprintId: string) => void;
  onConnectWallet: () => void;
}

export interface MarketplacePageProps {
  // Future props for filtering/sorting
}

// Role-specific styling and metadata
export const AGENT_ROLE_CONFIG = {
  TAJER: {
    label: 'Sales & Support',
    icon: 'ShoppingCart',
    color: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    description: 'Expert sales and customer support agent',
  },
  MUSAFIR: {
    label: 'Travel Planning',
    icon: 'MapPin',
    color: 'from-green-500 to-teal-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    description: 'Professional travel agent with real-time access',
  },
  SOFRA: {
    label: 'Vision & Data',
    icon: 'Utensils',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    description: 'Vision-powered data extraction agent',
  },
  MOSTASHAR: {
    label: 'Legal & Financial',
    icon: 'Scale',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    description: 'Legal and financial advisor with deep analysis',
  },
} as const;

export type AgentRole = keyof typeof AGENT_ROLE_CONFIG;

// Subscription management
export interface Subscription {
  id: string;
  userWallet: string;
  blueprintId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: Date;
  endDate: Date;
  txHash: string;
  amountPaid: number; // in lamports
  createdAt: Date;
  updatedAt: Date;
}

// Marketplace state management
export interface MarketplaceState {
  blueprints: AgentBlueprint[];
  loading: boolean;
  error: string | null;
  filters: {
    role?: AgentRole;
    maxPrice?: number;
    searchTerm?: string;
  };
}