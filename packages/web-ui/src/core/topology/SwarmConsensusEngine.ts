import { ToricLattice } from './ToricLattice';

export interface AgentAction {
  id: string;
  type: 'BUY' | 'SELL' | 'DEPLOY' | 'ALERT';
  payload: any;
  proposerId: string;
  timestamp: number;
}

export interface ConsensusResult {
  actionId: string;
  approved: boolean;
  approvalRate: number;
  participatingAgents: number;
}

export class SwarmConsensusEngine {
  private lattice: ToricLattice;
  private activeProposals: Map<string, AgentAction> = new Map();
  private votes: Map<string, Map<string, boolean>> = new Map(); // ProposalID -> AgentID -> Vote
  private listeners: ((proposalId: string) => void)[] = [];

  constructor(width: number = 10, height: number = 10) {
    this.lattice = new ToricLattice(width, height);
  }

  subscribe(listener: (proposalId: string) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(proposalId: string) {
    this.listeners.forEach(l => l(proposalId));
  }

  // Register an agent to a specific node in the lattice
  registerAgent(agentId: string, x: number, y: number) {
    // In a real implementation, we would bind the agent ID to the lattice node
    // For now, we assume the lattice tracks state abstractly
    console.log(`🤖 Agent ${agentId} registered at [${x}, ${y}]`);
  }

  // Agent proposes an action
  proposeAction(action: AgentAction): string {
    this.activeProposals.set(action.id, action);
    this.votes.set(action.id, new Map());
    console.log(`📢 Action Proposed: ${action.type} by ${action.proposerId}`);
    
    // Auto-vote YES by proposer
    this.castVote(action.id, action.proposerId, true);
    this.notify(action.id);
    
    return action.id;
  }

  // Agents cast votes
  castVote(proposalId: string, agentId: string, vote: boolean) {
    if (!this.activeProposals.has(proposalId)) return;
    
    const proposalVotes = this.votes.get(proposalId);
    if (proposalVotes) {
      proposalVotes.set(agentId, vote);
      this.notify(proposalId);
    }
  }

  // Check if consensus is reached
  checkConsensus(proposalId: string): ConsensusResult | null {
    const proposal = this.activeProposals.get(proposalId);
    const proposalVotes = this.votes.get(proposalId);
    
    if (!proposal || !proposalVotes) return null;

    const totalVotes = proposalVotes.size;
    let yesVotes = 0;
    
    proposalVotes.forEach((vote) => {
      if (vote) yesVotes++;
    });

    const approvalRate = totalVotes > 0 ? yesVotes / totalVotes : 0;
    
    // Simple Majority Consensus for now
    // In advanced versions, we use Toric Code stabilizer measurements here
    const approved = approvalRate > 0.66; // Supermajority

    return {
      actionId: proposalId,
      approved,
      approvalRate,
      participatingAgents: totalVotes
    };
  }

  // Simulate a swarm reaction (for demo purposes)
  simulateSwarmReaction(proposalId: string, swarmSize: number) {
    for (let i = 0; i < swarmSize; i++) {
      const randomAgentId = `agent_${Math.floor(Math.random() * 1000)}`;
      // 80% chance to agree if it's a good action (mock logic)
      const vote = Math.random() > 0.2; 
      this.castVote(proposalId, randomAgentId, vote);
    }
  }
}

export const swarmEngine = new SwarmConsensusEngine();
