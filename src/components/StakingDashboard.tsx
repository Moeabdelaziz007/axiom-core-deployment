import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useStaking } from '../hooks/useStaking';

interface Agent {
  id: string;
  name: string;
  type: 'basic' | 'advanced' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'frozen';
  deployedAt: string;
  performance: number;
}

const StakingDashboard: React.FC = () => {
  const { publicKey } = useWallet();
  const { stakeInfo, loading, stakeTokens, unstakeTokens, deployAgent, undeployAgent } = useStaking();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'stake' | 'agents'>('overview');

  // Mock agent data
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent_001',
      name: 'Aqar Assistant',
      type: 'basic',
      status: 'active',
      deployedAt: '2024-01-15T10:30:00Z',
      performance: 95,
    },
    {
      id: 'agent_002',
      name: 'Mawid Scheduler',
      type: 'advanced',
      status: 'active',
      deployedAt: '2024-01-10T14:20:00Z',
      performance: 88,
    },
  ]);

  const formatBalance = (lamports: number) => {
    return (lamports / 1e9).toFixed(2);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const result = await stakeTokens(amount);
    if (result.success) {
      setStakeAmount('');
      alert(`Successfully staked ${amount} AXIOM tokens!`);
    } else {
      alert(`Staking failed: ${result.message}`);
    }
  };

  const handleUnstake = async () => {
    const amount = parseFloat(unstakeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const result = await unstakeTokens(amount);
    if (result.success) {
      setUnstakeAmount('');
      alert(`Successfully unstaked ${amount} AXIOM tokens!`);
    } else {
      alert(`Unstaking failed: ${result.message}`);
    }
  };

  const handleDeployAgent = async () => {
    const result = await deployAgent();
    if (result.success) {
      alert(`Agent deployed successfully! ID: ${result.agentId}`);
      // Update agents list
      const newAgent: Agent = {
        id: result.agentId!,
        name: `New Agent ${agents.length + 1}`,
        type: 'basic',
        status: 'active',
        deployedAt: new Date().toISOString(),
        performance: 100,
      };
      setAgents([...agents, newAgent]);
    } else {
      alert(`Agent deployment failed: ${result.message}`);
    }
  };

  const handleUndeployAgent = async (agentId: string) => {
    const result = await undeployAgent();
    if (result.success) {
      alert(`Agent undeployed successfully!`);
      // Update agents list
      setAgents(agents.filter(agent => agent.id !== agentId));
    } else {
      alert(`Agent undeployment failed: ${result.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">AXIOM Staking Dashboard</h1>
            <p className="text-blue-100 mt-1">Stake tokens to deploy AI agents</p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('stake')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stake'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Stake
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'agents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Agents
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Wallet Connection */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-blue-800 mb-4">Wallet Status</h2>
                  {publicKey ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Connected:</span> {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Network:</span> Devnet
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-600">Please connect your wallet</p>
                  )}
                </div>

                {/* Staking Overview */}
                {stakeInfo && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-green-800 mb-4">Staking Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Staked Amount</h3>
                        <p className="text-2xl font-bold text-green-600">
                          {formatBalance(stakeInfo.stakedAmount)} AXIOM
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Reputation Score</h3>
                        <p className="text-2xl font-bold text-blue-600">{stakeInfo.reputationScore}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Active Agents</h3>
                        <p className="text-2xl font-bold text-purple-600">{stakeInfo.activeAgents}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <p className={`text-lg font-semibold ${
                          stakeInfo.isFrozen ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {stakeInfo.isFrozen ? 'Frozen' : 'Active'}
                        </p>
                      </div>
                    </div>
                    
                    {stakeInfo.isFrozen && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>⚠️ Stake Frozen:</strong> Your stake is currently under review. 
                          Please contact support for more information.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setActiveTab('stake')}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Stake More Tokens
                  </button>
                  <button
                    onClick={() => setActiveTab('agents')}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Manage Agents
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'stake' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Stake AXIOM Tokens</h2>
                
                {/* Stake Form */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (AXIOM)
                      </label>
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="Enter amount to stake"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="100"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum: 100 AXIOM tokens
                      </p>
                    </div>
                    
                    <button
                      onClick={handleStake}
                      disabled={!publicKey || loading}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Processing...' : 'Stake Tokens'}
                    </button>
                  </div>
                </div>

                {/* Unstake Form */}
                {stakeInfo && stakeInfo.stakedAmount > 0 && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Unstake Tokens</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount (AXIOM)
                        </label>
                        <input
                          type="number"
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                          placeholder="Enter amount to unstake"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          max={formatBalance(stakeInfo.stakedAmount)}
                          step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Available: {formatBalance(stakeInfo.stakedAmount)} AXIOM
                        </p>
                      </div>
                      
                      <button
                        onClick={handleUnstake}
                        disabled={!publicKey || loading || stakeInfo.isFrozen}
                        className="w-full bg-red-600 text-white px-4 py-3 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Processing...' : 'Unstake Tokens'}
                      </button>
                      
                      {stakeInfo.isFrozen && (
                        <p className="text-sm text-red-600 mt-2">
                          ⚠️ Cannot unstake while stake is frozen
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">My Agents</h2>
                
                {/* Deploy New Agent */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Deploy New Agent</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter agent name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <button
                      onClick={handleDeployAgent}
                      disabled={!publicKey || loading || !stakeInfo || stakeInfo.stakedAmount < stakeInfo.minStakeRequired || stakeInfo.isFrozen}
                      className="w-full bg-green-600 text-white px-4 py-3 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Deploying...' : 'Deploy Agent'}
                    </button>
                    
                    {!stakeInfo && (
                      <p className="text-sm text-gray-500 mt-2">
                        Connect wallet and stake tokens to deploy agents
                      </p>
                    )}
                    
                    {stakeInfo && stakeInfo.stakedAmount < stakeInfo.minStakeRequired && (
                      <p className="text-sm text-red-600 mt-2">
                        Minimum {formatBalance(stakeInfo.minStakeRequired)} AXIOM tokens required to deploy agents
                      </p>
                    )}
                  </div>
                </div>

                {/* Active Agents List */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Active Agents</h3>
                  {agents.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No agents deployed yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Agent ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Performance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Deployed
                            </th>
                            <th className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {agents.map((agent) => (
                            <tr key={agent.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {agent.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {agent.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  agent.type === 'basic' ? 'bg-green-100 text-green-800' :
                                  agent.type === 'advanced' ? 'bg-blue-100 text-blue-800' :
                                  agent.type === 'premium' ? 'bg-purple-100 text-purple-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {agent.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  agent.status === 'active' ? 'bg-green-100 text-green-800' :
                                  agent.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {agent.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm text-gray-900">{agent.performance}%</div>
                                  <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${agent.performance}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatTimestamp(agent.deployedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleUndeployAgent(agent.id)}
                                  disabled={agent.status === 'inactive'}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  Undeploy
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingDashboard;