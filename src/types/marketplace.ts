export interface MarketplaceAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  capabilities: string[];
  imageUrl: string;
  category: 'finance' | 'legal' | 'real-estate' | 'commerce' | 'general';
}

/**
 * 6. Team Bundle Definition (The Lake Squad Product)
 */
export interface TeamBundle {
  bundleId: string;
  name: string; // e.g., "Lake Alpha Squad"
  description: string;
  cost: {
    monthlyPrice: number; // 0.99
    currency: 'USDC' | 'AXIOM';
  };

  // Agents included in this bundle
  agentComposition: {
    agentId: string;
    role: string; // e.g., 'Lead Strategist', 'Technical Executor'
    minLevel: number;
  }[];

  // Configuration that is automatically applied to the team
  defaultCollaborationGoal: string; // e.g., "Maximize profit from e-commerce"
  deploymentStatus: 'available' | 'restricted';
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'subscription';
  itemId: string; // agentId or bundleId
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}