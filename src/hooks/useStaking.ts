import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface StakeInfo {
  user: string;
  stakedAmount: number;
  reputationScore: number;
  activeAgents: number;
  isFrozen: boolean;
  canDeploy: boolean;
  minStakeRequired: number;
}

interface StakingResponse {
  success: boolean;
  message?: string;
  transactionSignature?: string;
  newStakedAmount?: number;
  remainingStake?: number;
}

interface AgentDeploymentResponse {
  success: boolean;
  message?: string;
  agentId?: string;
  activeAgents: number;
  requiresStake: number;
}

export const useStaking = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch stake info on component mount
  useEffect(() => {
    if (!publicKey) return;

    fetchStakeInfo(publicKey.toString());
  }, [publicKey]);

  const fetchStakeInfo = async (userPubkey: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/staking/route.ts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getStakeInfo',
          userPubkey,
        }),
      });

      const data = await response.json();
      setStakeInfo(data);
    } catch (error) {
      console.error('Failed to fetch stake info:', error);
    } finally {
      setLoading(false);
    }
  };

  const stakeTokens = async (amount: number): Promise<StakingResponse> => {
    if (!publicKey) {
      return { success: false, message: 'Wallet not connected' };
    }

    try {
      setLoading(true);
      const response = await fetch('/api/staking/route.ts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stake',
          amount: amount * 1e9, // Convert to lamports
          userPubkey: publicKey.toString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local stake info
        setStakeInfo(prev => prev ? {
          ...prev,
          stakedAmount: prev.stakedAmount + amount,
        } : null);
        
        return { 
          success: true, 
          message: data.message,
          transactionSignature: data.transactionSignature,
          newStakedAmount: amount
        };
      } else {
        return { success: false, message: data.error };
      }
    } catch (error) {
      console.error('Staking error:', error);
      return { success: false, message: 'Staking failed' };
    } finally {
      setLoading(false);
    }
  };

  const unstakeTokens = async (amount: number): Promise<StakingResponse> => {
    if (!publicKey) {
      return { success: false, message: 'Wallet not connected' };
    }

    try {
      setLoading(true);
      const response = await fetch('/api/staking/route.ts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unstake',
          amount: amount * 1e9, // Convert to lamports
          userPubkey: publicKey.toString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local stake info
        setStakeInfo(prev => prev ? {
          ...prev,
          stakedAmount: prev.stakedAmount - amount,
        } : null);
        
        return { 
          success: true, 
          message: data.message,
          transactionSignature: data.transactionSignature,
          remainingStake: data.remainingStake
        };
      } else {
        return { success: false, message: data.error };
      }
    } catch (error) {
      console.error('Unstaking error:', error);
      return { success: false, message: 'Unstaking failed' };
    } finally {
      setLoading(false);
    }
  };

  const deployAgent = async (): Promise<AgentDeploymentResponse> => {
    if (!publicKey) {
      return { success: false, message: 'Wallet not connected' };
    }

    try {
      setLoading(true);
      const response = await fetch('/api/staking/route.ts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deployAgent',
          userPubkey: publicKey.toString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local stake info
        setStakeInfo(prev => prev ? {
          ...prev,
          activeAgents: prev.activeAgents + 1,
        } : null);
        
        return { 
          success: true, 
          message: data.message,
          agentId: data.agentId,
          activeAgents: data.activeAgents,
          requiresStake: data.requiresStake
        };
      } else {
        return { success: false, message: data.error };
      }
    } catch (error) {
      console.error('Agent deployment error:', error);
      return { success: false, message: 'Agent deployment failed' };
    } finally {
      setLoading(false);
    }
  };

  const undeployAgent = async (): Promise<AgentDeploymentResponse> => {
    if (!publicKey) {
      return { success: false, message: 'Wallet not connected' };
    }

    try {
      setLoading(true);
      const response = await fetch('/api/staking/route.ts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'undeployAgent',
          userPubkey: publicKey.toString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local stake info
        setStakeInfo(prev => prev ? {
          ...prev,
          activeAgents: prev.activeAgents - 1,
        } : null);
        
        return { 
          success: true, 
          message: data.message,
          activeAgents: data.activeAgents
        };
      } else {
        return { success: false, message: data.error };
      }
    } catch (error) {
      console.error('Agent undeployment error:', error);
      return { success: false, message: 'Agent undeployment failed' };
    } finally {
      setLoading(false);
    }
  };

  return {
    stakeInfo,
    loading,
    stakeTokens,
    unstakeTokens,
    deployAgent,
    undeployAgent,
  };
};