/**
 * 🏭 Axiom Dashboard - Gigafactory-First Experience
 * 
 * Main dashboard with Gigafactory as the hero component
 * Shows real-time agent creation with cinematic effects
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Factory,
  Activity,
  DollarSign,
  Users,
  TrendingUp,
  Zap,
  Cpu,
  Server,
  Wallet,
  Mic,
  BarChart3,
  Database,
  Shield,
  Settings,
  ChevronRight
} from 'lucide-react';

// Import our enhanced Gigafactory
import AxiomGigafactory from '@/components/AxiomGigafactory';

// Import UI components
import { AuthModal } from '@/components/AuthModal';
import { DataLoaderWrapper } from '@/components/DataLoaderWrapper';
import { WisdomFeed } from '@/components/WisdomFeed';
import { MizanGauge } from '@/components/MizanGauge';

// Import real services
import { getAgentWalletBalance } from '@/services/solana-tools';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [totalRevenue, setTotalRevenue] = useState(12450.00);
  const [activeAgents, setActiveAgents] = useState(0);
  const [systemHealth, setSystemHealth] = useState(99.99);

  // Real-time metrics simulation
  const [metrics, setMetrics] = useState({
    uptime: 99.99,
    processingLoad: 45,
    activeConnections: 23,
    totalTransactions: 1247
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'g' && event.ctrlKey) {
        event.preventDefault();
        // Focus on Gigafactory
        const gigafactory = document.querySelector('[data-component="gigafactory"]');
        if (gigafactory) {
          (gigafactory as HTMLElement).focus();
        }
      } else if (event.key === 'c' && event.ctrlKey) {
        event.preventDefault();
        // Create new agent
        const createButton = document.querySelector('[data-action="create-agent"]');
        if (createButton) {
          (createButton as HTMLElement).click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        uptime: 99.90 + Math.random() * 0.09,
        processingLoad: 40 + Math.random() * 20,
        activeConnections: 20 + Math.floor(Math.random() * 10),
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 3)
      }));
      
      setTotalRevenue(prev => prev + (Math.random() - 0.4) * 25);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Load initial data
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setLoading(false);
      } catch (e) {
        setIsError(true);
        setError("Failed to initialize dashboard systems.");
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auth handlers
  const handleGoogleAuth = async () => {
    try {
      console.log('🔗 Initiating Google authentication...');
      setShowAuthModal(false);
    } catch (error) {
      console.error('❌ Google Auth Error:', error);
    }
  };

  const handleWalletAuth = async () => {
    try {
      console.log('🔗 Initiating Solana wallet connection...');
      setShowAuthModal(false);
    } catch (error) {
      console.error('❌ Wallet Auth Error:', error);
    }
  };

  // Navigation handlers
  const navigateToAgents = () => {
    router.push('/dashboard/agents');
  };

  const navigateToAnalytics = () => {
    router.push('/dashboard/analytics');
  };

  const navigateToSettings = () => {
    router.push('/dashboard/settings');
  };

  return (
    <DataLoaderWrapper isLoading={loading} isError={isError} error={error}>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Factory className="w-8 h-8 text-purple-400" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent">
                      Axiom Control Center
                    </h1>
                    <p className="text-sm text-gray-400">Real-time Agent Creation & Management</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{metrics.uptime.toFixed(2)}%</div>
                    <div className="text-xs text-gray-400">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">${totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{metrics.activeConnections}</div>
                    <div className="text-xs text-gray-400">Active Agents</div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={navigateToAnalytics}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </button>

                <button
                  onClick={navigateToSettings}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-6 py-6 space-y-8">
          {/* Hero: Gigafactory Component */}
          <section data-component="gigafactory">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">🏭 Agent Creation Factory</h2>
                  <p className="text-gray-400">Watch your $0.99 investment transform into a sovereign digital being</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                </div>
              </div>
              
              <AxiomGigafactory />
            </div>
          </section>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Infrastructure Health */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Server className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Infrastructure</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Server Uptime</span>
                  <span className="text-blue-400 font-mono">{metrics.uptime.toFixed(3)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Processing Load</span>
                  <span className="text-blue-400 font-mono">{metrics.processingLoad.toFixed(0)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">API Latency</span>
                  <span className="text-blue-400 font-mono">{Math.floor(Math.random() * 20 + 10)}ms</span>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Revenue</h3>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-400">Total Revenue</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Transactions</span>
                  <span className="text-green-400 font-mono">{metrics.totalTransactions}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monthly Growth</span>
                  <span className="text-green-400 font-mono">+12.5%</span>
                </div>
              </div>
            </div>

            {/* Agent Management */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Agents</h3>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{metrics.activeConnections}</div>
                  <div className="text-sm text-gray-400">Active Agents</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">TAJER</span>
                    <span className="text-green-400">8 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">MOSTASHAR</span>
                    <span className="text-blue-400">5 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">MUSAFIR</span>
                    <span className="text-orange-400">6 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">SOFRA</span>
                    <span className="text-yellow-400">4 Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                Recent Activity
              </h3>
              <button
                onClick={navigateToAnalytics}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span className="text-sm">View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Agent Created</span>
                </div>
                <p className="text-xs text-gray-400">TAJER agent deployed with Egyptian dialect</p>
                <div className="text-xs text-gray-500 mt-1">2 minutes ago</div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Wallet Minted</span>
                </div>
                <p className="text-xs text-gray-400">HD-derived address: 7xK9...Ab3F</p>
                <div className="text-xs text-gray-500 mt-1">5 minutes ago</div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">Security Update</span>
                </div>
                <p className="text-xs text-gray-400">Audit completed - All systems secure</p>
                <div className="text-xs text-gray-500 mt-1">12 minutes ago</div>
              </div>
            </div>
          </div>
        </main>

        {/* Keyboard Shortcuts Help */}
        <footer className="border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-6">
                <span>Keyboard Shortcuts:</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl + G</kbd>
                    <span>Focus Gigafactory</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl + C</kbd>
                    <span>Create Agent</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Axiom v3.0.0 • MENA Sovereign AI Platform
              </div>
            </div>
          </div>
        </footer>

        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onGoogleAuth={handleGoogleAuth}
          onWalletAuth={handleWalletAuth}
        />
      </div>
    </DataLoaderWrapper>
  );
}