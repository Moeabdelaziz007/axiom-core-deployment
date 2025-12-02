'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Zap,
  Shield,
  Cpu,
  Sparkles,
} from 'lucide-react';
import AgentCard from '@/components/marketplace/AgentCard';
import {
  AgentBlueprint,
  MarketplaceApiResponse,
  MarketplaceState,
  AgentRole,
  AGENT_ROLE_CONFIG,
  ApiErrorResponse,
} from '@/types/marketplace';

export default function MarketplacePage() {
  const [state, setState] = useState<MarketplaceState>({
    blueprints: [],
    loading: true,
    error: null,
    filters: {},
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<AgentRole | 'ALL'>('ALL');

  // Check wallet connection status
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    fetchBlueprints();
    checkWalletConnection();
  }, []);

  const fetchBlueprints = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/marketplace/blueprints');
      const data: MarketplaceApiResponse | ApiErrorResponse = await response.json();

      if (!data.success) {
        // Type guard to check if it's an error response
        if ('error' in data) {
          throw new Error(data.error || 'Failed to fetch blueprints');
        } else {
          throw new Error('Failed to fetch blueprints');
        }
      }

      // Type guard to check if it's a success response
      if ('data' in data) {
        setState(prev => ({
          ...prev,
          blueprints: data.data,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching blueprints:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      }));
    }
  };

  const checkWalletConnection = () => {
    // Check if wallet is connected (implement based on your wallet context)
    const walletData = localStorage.getItem('axiom_auth_session');
    if (walletData) {
      try {
        const session = JSON.parse(walletData);
        setIsWalletConnected(session.user && session.expiresAt > Date.now());
      } catch (error) {
        console.error('Error parsing wallet session:', error);
        setIsWalletConnected(false);
      }
    }
  };

  const handleHire = (blueprintId: string) => {
    console.log('🚀 Hiring agent blueprint:', blueprintId);
    // TODO: Implement Solana Pay integration
    alert(`Hire request initiated for blueprint: ${blueprintId}`);
  };

  const handleConnectWallet = () => {
    // TODO: Implement wallet connection
    console.log('🔗 Connect wallet requested');
    alert('Wallet connection will be implemented with Solana integration');
  };

  const filteredBlueprints = state.blueprints.filter((blueprint) => {
    const matchesSearch = blueprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blueprint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blueprint.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'ALL' || blueprint.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="text-center space-y-4">
              <div className="h-12 bg-gray-200 rounded-lg w-96 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-128 mx-auto"></div>
            </div>
            
            {/* Filters skeleton */}
            <div className="flex justify-center gap-4">
              <div className="h-10 bg-gray-200 rounded-full w-48"></div>
              <div className="h-10 bg-gray-200 rounded-full w-32"></div>
            </div>
            
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <Shield className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Marketplace</h2>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <button
            onClick={fetchBlueprints}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Agent Marketplace
              </h1>
              <p className="text-gray-600 mt-2">
                Choose your AI agent and start earning with our zero-cost framework
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Zero Cost</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span>AI Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search and View Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {viewMode === 'grid' ? (
                  <List className="w-5 h-5" />
                ) : (
                  <Grid3X3 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Role Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRole('ALL')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedRole === 'ALL'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Agents
            </button>
            {(Object.keys(AGENT_ROLE_CONFIG) as AgentRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedRole === role
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {AGENT_ROLE_CONFIG[role].label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBlueprints.length} of {state.blueprints.length} agents
          </p>
        </div>

        {/* Agent Grid */}
        {filteredBlueprints.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Sparkles className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredBlueprints.map((blueprint) => (
              <AgentCard
                key={blueprint.id}
                blueprint={blueprint}
                isWalletConnected={isWalletConnected}
                onHire={handleHire}
                onConnectWallet={handleConnectWallet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}