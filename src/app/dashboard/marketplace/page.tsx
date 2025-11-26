'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  TrendingUp, 
  Star, 
  Users, 
  DollarSign,
  Shield,
  ArrowRight,
  Filter,
  Search,
  Plus,
  Zap
} from 'lucide-react';
import { MarketplaceAgent, MarketplaceSearchFilters, SearchSorting } from '@/types/marketplace';
import MarketplaceGrid from '@/components/marketplace/MarketplaceGrid';
import AgentMarketplaceEngine from '@/infra/core/AgentMarketplaceEngine';

// Mock marketplace engine - in real app this would be initialized with proper dependencies
const marketplaceEngine = new AgentMarketplaceEngine({} as any, {} as any);

export default function MarketplacePage() {
  const [agents, setAgents] = useState<MarketplaceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MarketplaceSearchFilters>({});
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featuredAgents, setFeaturedAgents] = useState<MarketplaceAgent[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number; icon: string }[]>([]);

  // Load initial data
  useEffect(() => {
    loadMarketplaceData();
  }, []);

  // Load marketplace data when filters change
  useEffect(() => {
    if (filters.query || filters.category || filters.pricing || filters.rating) {
      searchAgents();
    }
  }, [filters]);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Load featured agents
      const featuredResults = await marketplaceEngine.searchAgents({
        featured: true,
        pagination: { page: 1, limit: 6 }
      });
      setFeaturedAgents(featuredResults.agents);
      
      // Load all agents with initial filters
      const results = await marketplaceEngine.searchAgents({
        pagination: { page: currentPage, limit: 20 },
        sorting: 'relevance'
      });
      
      setAgents(results.agents);
      setTotalCount(results.total);
      setTotalPages(results.totalPages);
      
      // Generate category stats
      const categoryStats = Object.entries(results.facets.categories || {}).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        icon: getCategoryIcon(name)
      }));
      setCategories(categoryStats);
      
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchAgents = async () => {
    try {
      setLoading(true);
      const results = await marketplaceEngine.searchAgents({
        ...filters,
        pagination: { page: currentPage, limit: 20 }
      });
      
      setAgents(results.agents);
      setTotalCount(results.total);
      setTotalPages(results.totalPages);
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      business: '💼',
      creative: '🎨',
      technical: '⚙️',
      analytical: '📊',
      communication: '💬',
      security: '🔒',
      education: '📚',
      entertainment: '🎮'
    };
    return icons[category] || '🤖';
  };

  const handleAgentSelect = (agent: MarketplaceAgent) => {
    // Navigate to agent details page
    window.location.href = `/agents/${agent.id}`;
  };

  const handleAgentDeploy = async (agent: MarketplaceAgent) => {
    try {
      // Create deployment configuration
      const deployment = await marketplaceEngine.deployAgent(
        agent.id,
        {
          target: {
            type: 'cloud',
            platform: 'AWS',
            environment: 'production'
          },
          resources: {
            cpu: 2,
            memory: 4,
            storage: 20
          },
          configuration: {
            environmentVariables: {},
            secrets: {},
            configFiles: []
          },
          scaling: {
            minInstances: 1,
            maxInstances: 5,
            autoScaling: true,
            metrics: ['cpu', 'memory', 'response_time']
          },
          monitoring: {
            enabled: true,
            metrics: ['uptime', 'error_rate', 'response_time'],
            alerts: [],
            logs: {
              level: 'info',
              retention: 30,
              destinations: ['cloudwatch'],
              structured: true
            }
          },
          security: {
            encryption: true,
            accessControl: {
              authentication: true,
              authorization: true,
              roles: ['admin', 'user'],
              permissions: {
                admin: ['all'],
                user: ['read', 'execute']
              }
            },
            compliance: ['SOC2', 'GDPR']
          },
          owner: {
            id: 'current-user', // Would get from auth context
            wallet: 'user-wallet-address'
          }
        },
        'current-user' // Would get from auth context
      );
      
      console.log('Agent deployed:', deployment);
      // Show success message or redirect to deployment page
      
    } catch (error) {
      console.error('Deployment failed:', error);
      // Show error message
    }
  };

  const handleAgentCompare = (agent: MarketplaceAgent) => {
    // Add to comparison list
    console.log('Compare agent:', agent.name);
  };

  const handleAgentFavorite = (agent: MarketplaceAgent) => {
    // Toggle favorite status
    console.log('Favorite agent:', agent.name);
  };

  const handleFiltersChange = (newFilters: MarketplaceSearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const marketplaceStats = marketplaceEngine.getAnalytics().overview;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10" />
        <div className="relative container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Agent Marketplace
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Discover, deploy, and manage AI agents with advanced capabilities. 
              From business automation to creative solutions, find the perfect agent for your needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/dashboard/marketplace/list'}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                List Your Agent
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-white hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Filter size={20} />
                Browse Categories
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white/5 border-y border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-cyan-500/20 rounded-xl">
                <Store className="text-cyan-400" size={24} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {marketplaceStats.totalAgents.toLocaleString()}
              </div>
              <div className="text-sm text-white/60">Total Agents</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-xl">
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {marketplaceStats.activeAgents.toLocaleString()}
              </div>
              <div className="text-sm text-white/60">Active Deployments</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-xl">
                <Users className="text-purple-400" size={24} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {marketplaceStats.activeUsers.toLocaleString()}
              </div>
              <div className="text-sm text-white/60">Active Users</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-orange-500/20 rounded-xl">
                <DollarSign className="text-orange-400" size={24} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${marketplaceStats.totalVolume.toLocaleString()}
              </div>
              <div className="text-sm text-white/60">Total Volume</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      {featuredAgents.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Featured Agents</h2>
              <p className="text-white/60 mb-8">Top-performing agents trusted by our community</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AgentListingCard
                    agent={agent}
                    onView={handleAgentSelect}
                    onDeploy={handleAgentDeploy}
                    onCompare={handleAgentCompare}
                    onFavorite={handleAgentFavorite}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Browse by Category</h2>
            <p className="text-white/60 mb-8">Find agents specialized for your specific needs</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setFilters({ ...filters, category: category.name.toLowerCase() as any })}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all text-left group"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-white mb-2">{category.name}</h3>
                <p className="text-sm text-white/60 mb-3">{category.count} agents available</p>
                <div className="flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
                  <span className="text-sm">Browse</span>
                  <ArrowRight size={16} className="ml-1" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Marketplace Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <MarketplaceGrid
            agents={agents}
            loading={loading}
            onAgentSelect={handleAgentSelect}
            onAgentDeploy={handleAgentDeploy}
            onAgentCompare={handleAgentCompare}
            onAgentFavorite={handleAgentFavorite}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-500/10 to-blue-500/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Deploy Your First Agent?
              </h2>
              <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                Join thousands of businesses already using AI agents to automate workflows, 
                increase efficiency, and drive growth. Get started in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/dashboard/marketplace/guide'}
                  className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-white hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Search size={20} />
                  Browse Marketplace
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/dashboard/marketplace/list'}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
                >
                  <Zap size={20} />
                  List Your Agent
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}