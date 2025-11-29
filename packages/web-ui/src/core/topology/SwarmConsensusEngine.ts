import { ToricLattice } from './ToricLattice';
import { TOHADetector } from './TOHADetector';

export interface Proposal {
  id: string;
  agentId: string;
  actionType: 'TRANSACTION' | 'DATA_UPDATE' | 'SECURITY_ALERT' | 'BUY' | 'SELL' | 'DEPLOY';
  payload: any; // e.g., { amount: 5, currency: 'SOL', target: '...' }
  timestamp: number;
}

export interface ConsensusResult {
  approved: boolean;
  score: number; // 0.0 to 1.0
  approvals: number;
  rejections: number;
  note: string;
  actionId?: string; // For backward compatibility with UI
  approvalRate?: number; // For backward compatibility
  participatingAgents?: number; // For backward compatibility
}

export class SwarmConsensusEngine {
  private lattice: ToricLattice;
  private toha: TOHADetector;
  private minConsensusThreshold: number = 0.66; // Byzantine Fault Tolerance (2/3)
  private listeners: ((proposalId: string) => void)[] = [];
  private lastResult: Map<string, ConsensusResult> = new Map();

  constructor(width: number = 10, height: number = 10) {
    this.lattice = new ToricLattice(width, height);
    this.toha = new TOHADetector();
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

  // Compatibility method for existing UI
  proposeAction(action: any): string {
    const proposal: Proposal = {
      id: action.id,
      agentId: action.proposerId,
      actionType: action.type,
      payload: action.payload,
      timestamp: action.timestamp
    };
    
    // Register agent if not exists (mock registration)
    this.lattice.registerAgent(proposal.agentId);
    
    // Populate neighbors for simulation
    const neighbors = ['Agent_Beta', 'Agent_Gamma', 'Agent_Delta', 'Agent_Epsilon'];
    neighbors.forEach(n => this.lattice.registerAgent(n));

    this.submitProposal(proposal).then(result => {
      this.lastResult.set(proposal.id, result);
      this.notify(proposal.id);
    });

    return proposal.id;
  }

  // Compatibility method for existing UI
  checkConsensus(proposalId: string): ConsensusResult | null {
    return this.lastResult.get(proposalId) || null;
  }
  
  // Compatibility method for existing UI
  simulateSwarmReaction(proposalId: string, swarmSize: number) {
    // No-op, logic is now inside submitProposal
  }

  /**
   * The Core Process: An agent submits a proposal to the Swarm.
   */
  public async submitProposal(proposal: Proposal): Promise<ConsensusResult> {
    console.log(`🗳️ New Proposal from Agent ${proposal.agentId}: ${proposal.actionType}`);

    // 1. Identify Neighbors (The "Jury")
    // Using Toric Lattice to find immediate neighbors to validate the proposal
    let neighbors = this.lattice.getNeighbors(proposal.agentId);
    
    // Fallback for simulation if neighbors are empty (isolated agent)
    if (neighbors.length === 0) {
       // Force some neighbors for the demo to work
       neighbors = ['Agent_Beta', 'Agent_Gamma', 'Agent_Delta'];
    }

    // 2. Voting Round (Simulated Logic Check)
    let approvals = 0;
    let rejections = 0;

    for (const neighbor of neighbors) {
      const vote = await this.validateWithNeighbor(neighbor, proposal);
      if (vote) approvals++;
      else rejections++;
    }
    
    // Auto-approve by proposer
    approvals++;

    // 3. Topological Check (The "Veto")
    // Even if agents agree, if the logic has a "hole", TOHA rejects it.
    const topologyCheck = await this.toha.validateReasoning([{ 
      id: proposal.id, 
      concept: proposal.actionType, 
      vector: [], 
      connections: neighbors 
    }]); 

    if (!topologyCheck.isValid) {
      const result = { 
        approved: false, 
        score: 0, 
        approvals, 
        rejections, 
        note: `⛔ VETO: Topological Hallucination Detected by Mainframe.`,
        actionId: proposal.id,
        approvalRate: 0,
        participatingAgents: approvals + rejections
      };
      this.lastResult.set(proposal.id, result);
      return result;
    }

    // 4. Final Decision
    const totalVotes = approvals + rejections;
    const score = totalVotes > 0 ? approvals / totalVotes : 0;
    const isApproved = score >= this.minConsensusThreshold;

    const result = {
      approved: isApproved,
      score,
      approvals,
      rejections,
      note: isApproved ? "✅ Consensus Reached: Action Authorized." : "❌ Consensus Failed: Insufficient Trust.",
      actionId: proposal.id,
      approvalRate: score,
      participatingAgents: totalVotes
    };
    
    this.lastResult.set(proposal.id, result);
    return result;
  }

  // --- Helper: Simulate Neighbor Validation ---
  private async validateWithNeighbor(neighborId: string, proposal: Proposal): Promise<boolean> {
    // In a real system, this would ask another LLM instance.
    // Here, we simulate trust based on "alignment" (random for simulation + bias).
    const alignment = Math.random(); 
    return alignment > 0.3; // 70% chance of agreement if logic is sound
  }
}

export const swarmEngine = new SwarmConsensusEngine();
