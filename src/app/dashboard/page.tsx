'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  QuantumCard, StatBar, StatusBadge, NeonButton,
  BrandingFooter, HealthIndicator, SynthChart
} from '@/components/AxiomUI';
import { AuthModal } from '@/components/AuthModal';
import { AgentChat } from '@/components/AgentChat';
import { fintechClient } from '@/lib/fintech-client';
import { useAxiomVoice } from '@/hooks/useAxiomVoice';
import { useFleetMonitor } from '@/hooks/useFleetMonitor';
import {
  Activity, DollarSign, Users, TrendingUp,
  Zap, Cpu, Bot, Globe, Shield, Radio, Server, Wallet, Mic,
  BarChart3, Layers, Database, Lock
} from 'lucide-react';

import { DataLoaderWrapper } from '@/components/ui/DataLoaderWrapper';
import { FractalNetworkGraph } from '@/components/ui/topology/FractalNetworkGraph';
import { MizanGauge } from '@/components/dashboard/MizanGauge';
import { WisdomFeed } from '@/components/dashboard/WisdomFeed';
import { TohaMonitor } from '@/components/dashboard/TohaMonitor';
import topologyData from '@/data/topology_viz.json';

export default function DashboardPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number>(12450.00);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const { playWelcome, speak, isPlaying } = useAxiomVoice();

  // --- LIVE SIMULATION STATE ---
  const [networkLoad, setNetworkLoad] = useState([20, 35, 25, 45, 30, 55, 40, 60, 50, 65]);
  const [txVolume, setTxVolume] = useState([45, 52, 49, 62, 58, 71, 68, 84, 80, 92]);
  const [uptime, setUptime] = useState(99.99);
  const [securityLevel, setSecurityLevel] = useState<'stable' | 'warning' | 'critical'>('stable');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [liveAgents, setLiveAgents] = useState<any[]>([]);

  // Authentication Handlers
  const handleInitializeFleet = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      speak("Fleet already initialized. Ready to deploy new agents.");
    }
  };

  const handleDeployAgent = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      speak("Deploying new agent. Please specify agent type.");
      // TODO: Open agent selection modal
    }
  };

  const handleGoogleAuth = async () => {
    try {
      console.log('🔗 Initiating Google authentication...');
      // TODO: Implement Google OAuth with Clerk/Dynamic
      speak("Google authentication initiated. Please complete the sign-in process.");
      setShowAuthModal(false);
    } catch (error) {
      console.error('❌ Google Auth Error:', error);
      speak("Authentication failed. Please try again.");
    }
  };

  const handleWalletAuth = async () => {
    try {
      console.log('🔗 Initiating Solana wallet connection...');
      // TODO: Implement Solana wallet connection
      speak("Wallet connection initiated. Please approve the connection request.");
      setShowAuthModal(false);
    } catch (error) {
      console.error('❌ Wallet Auth Error:', error);
      speak("Wallet connection failed. Please try again.");
    }
  };

  // Agent Chat Navigation Handler
  const handleAgentChat = (agent: any) => {
    // Navigate to agent-specific chat page
    router.push(`/dashboard/chat/${agent.name.toLowerCase()}`);
    speak(`Opening chat with ${agent.name}. ${agent.description}`);
  };

  // Initial Load
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        playWelcome();
        setLoading(false);
      } catch (e) {
        setIsError(true);
        setError("Failed to initialize quantum core systems.");
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [playWelcome]);

  // --- QUANTUM PULSE ENGINE (Simulation Logic) ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Simulate Network Load Fluctuations
      setNetworkLoad(prev => {
        const newValue = Math.floor(Math.random() * 40) + 30; // Random 30-70
        return [...prev.slice(1), newValue];
      });

      // 2. Simulate Transaction Volume & Balance
      setTxVolume(prev => {
        const newValue = Math.floor(Math.random() * 50) + 40; // Random 40-90
        return [...prev.slice(1), newValue];
      });

      setBalance(prev => prev + (Math.random() - 0.4) * 15); // Fluctuating Balance

      // 3. Simulate Micro-Uptime fluctuations
      setUptime(prev => 99.90 + (Math.random() * 0.09));

      // 4. Random Security Events (Rare)
      if (Math.random() > 0.95) {
        setSecurityLevel('warning');
        setTimeout(() => setSecurityLevel('stable'), 2000);
      }

    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const agents = [
    {
      id: 1,
      name: 'Sofra',
      slug: 'sofra',
      role: 'CX Management System',
      status: 'active',
      health: 98,
      cpu: 45,
      type: 'CX-Auditor',
      avatar: '/agents/sofra.png',
      description: 'Full-stack customer experience manager. "I turn complaints into loyal customers."',
      superpower: 'Sentiment Guard',
      predictionStatus: '🛡️ Protecting 12 Users',
      predictionColor: 'text-axiom-success'
    },
    {
      id: 2,
      name: 'Aqar',
      slug: 'aqar',
      role: 'Full Rental Unit Management',
      status: 'idle',
      health: 100,
      cpu: 12,
      type: 'UnitManager',
      avatar: '/agents/aqar.png',
      description: 'End-to-end property management. "Your property, on autopilot."',
      superpower: 'Market Oracle',
      predictionStatus: '🔮 3 Opportunities Found',
      predictionColor: 'text-axiom-purple'
    },
    {
      id: 3,
      name: 'Mawid',
      slug: 'mawid',
      role: 'Workflow Optimizer',
      status: 'flagged',
      health: 45,
      cpu: 89,
      type: 'FlowOptimizer',
      avatar: '/agents/mawid.png',
      description: 'Intelligent scheduling. "Time is money. I save both."',
      superpower: 'Flow Predictor',
      predictionStatus: '⚠️ High No-Show Risk',
      predictionColor: 'text-red-400'
    },
    {
      id: 4,
      name: 'Tajer',
      slug: 'tajer',
      role: 'E-Commerce Negotiator',
      status: 'active',
      health: 96,
      cpu: 60,
      type: 'Negotiator',
      avatar: '/agents/tajer.png',
      description: 'Automated sales & negotiation. "I close deals while you sleep."',
      superpower: 'Auto-Haggler',
      predictionStatus: '💰 15 Deals Closed',
      predictionColor: 'text-axiom-neon-green'
    },
  ];

  return (
    <DataLoaderWrapper isLoading={loading} isError={isError} error={error}>
      <div className="min-h-screen pb-20 space-y-8 animate-fade-in-up">
        {/* --- HEADER: AXIOM COMMAND CENTER STATUS --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 p-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary text-[10px] font-mono tracking-widest uppercase">
                Axiom System v3.0.0
              </span>
              <span className="flex items-center gap-1 text-[10px] text-primary font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                System Online
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Axiom <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">Control</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Managing <span className="text-white font-bold">3 Active Layers</span> across the Axiom Network.
            </p>
          </div>
          <div className="flex gap-3">
            {/* مؤشر الاتصال الحي (لمسة احترافية) */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
              <span className="text-xs text-gray-400 font-mono">
                {connectionStatus === 'connected' ? 'LIVE UPLINK' :
                  connectionStatus === 'connecting' ? 'CONNECTING...' :
                    'UPLINK LOST'}
              </span>
            </div>

            <NeonButton
              icon={Mic}
              variant={isPlaying ? "success" : "secondary"}
              onClick={() => speak("Axiom system diagnostic complete. All layers operational. Business intelligence protocols active.")}
              className={isPlaying ? "animate-pulse" : ""}
            >
              {isPlaying ? "Voice Assistant Active..." : "Voice Report"}
            </NeonButton>
            <NeonButton
              icon={Zap}
              variant="primary"
              onClick={handleInitializeFleet}
            >
              Initialize Fleet
            </NeonButton>
            <NeonButton
              icon={Activity}
              variant="secondary"
              onClick={() => router.push('/dashboard/diagnostics')}
            >
              Diagnostics
            </NeonButton>
          </div>
        </div>

        {/* --- SECTION 1: SYSTEM VITALS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Layer 1: Cloud Infrastructure */}
          <QuantumCard title="Infrastructure" icon={Server} glow="green" className="h-full">
            <div className="space-y-4">
              <HealthIndicator label="Server Uptime" value={`${uptime.toFixed(3)}%`} status="stable" />
              <HealthIndicator label="API Latency" value={`${Math.floor(networkLoad[9] / 2)}ms`} status="stable" />
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2 font-mono flex justify-between">
                  <span>Network Load</span>
                  <span className="text-primary animate-pulse">{networkLoad[9]}%</span>
                </p>
                <SynthChart data={networkLoad} color="#3b82f6" />
              </div>
            </div>
          </QuantumCard>

          {/* Layer 2: Blockchain (T-ORC & A-BOND) */}
          <QuantumCard title="Blockchain" icon={Database} glow="cyan" className="h-full">
            <div className="space-y-4">
              <HealthIndicator label="Protocol Status" value="Synced" status="stable" />
              <HealthIndicator label="Yield Rate" value="+4.2% APY" status="stable" />
              <div className="mt-4">
                <div className="h-full space-y-6">
                  {/* Mizan Gauge */}
                  <div className="h-1/2">
                    <MizanGauge
                      safetyScore={0.85}
                      efficiencyScore={0.70}
                      balanceScore={0.78}
                      barakaFactor={0.15}
                      decision="APPROVED"
                    />
                  </div>

                  {/* Scrolls of Wisdom */}
                  <div className="h-[calc(50%-1.5rem)]">
                    <WisdomFeed />
                  </div>
                </div>
              </div>
            </div>
          </QuantumCard>

          {/* Layer 3: Security & Identity */}
          <QuantumCard title="Security" icon={Shield} glow="purple" className="h-full">
            <div className="space-y-4">
              <div className="h-48">
                <TohaMonitor
                  entropy={0.65}
                  betti_1={10}
                  status="GROUNDED"
                />
              </div>
              <HealthIndicator
                label="Threat Level"
                value={securityLevel === 'stable' ? 'Low' : 'ELEVATED'}
                status={securityLevel}
              />
              <HealthIndicator label="Identity Anchors" value="3 Active" status={securityLevel === 'critical' ? 'warning' : 'stable'} />
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2 font-mono flex justify-between">
                  <span>Threat Analysis</span>
                  <span className={securityLevel === 'stable' ? 'text-green-400' : 'text-red-400'}>
                    {securityLevel === 'stable' ? 'Secure' : 'Active Threats'}
                  </span>
                </p>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${securityLevel === 'stable' ? 'bg-purple-500' : 'bg-red-500'} animate-pulse`}
                    style={{ width: securityLevel === 'stable' ? '15%' : '85%' }}
                  />
                </div>
              </div>
              {securityLevel === 'warning' ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/40 mt-4 bg-white/5 animate-pulse">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold">Security Alert</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">
                    Firewall protocol engaged successfully.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mt-4 bg-white/5">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold">System Secure</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">
                    No threats detected in the last 24 hours.
                  </p>
                </div>
              )}
            </div>
          </QuantumCard>
        </div>

        {/* --- SECTION 2: ACTIVE AGENTS & ANALYTICS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-6 h-6 text-primary" /> Active Agents
              </h2>
              <span className="text-xs font-mono text-gray-400">3/15 Slots Used</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* نستخدم liveAgents إذا كانت موجودة، وإلا نستخدم البيانات الافتراضية للتحميل */}
              {(liveAgents.length > 0 ? liveAgents : agents).map(agent => (
                <QuantumCard
                  key={agent.id}
                  className="hover:bg-white/5 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                  glow={agent.status === 'active' ? 'green' : agent.status === 'flagged' ? 'none' : 'cyan'}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 overflow-hidden ${agent.status === 'active' ? 'border-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-white/10'}`}>
                        <img src={`/agents/${agent.id}.png`} alt={agent.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">{agent.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{agent.type}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">{agent.type}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={agent.status as any} />
                  </div>

                  {/* Navigation Links */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/agent/${agent.id}/identity`);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 font-mono transition-colors"
                    >
                      View Identity
                    </button>
                  </div>

                  {/* Prediction Status */}
                  <div className="mb-3 flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-mono text-gray-300 uppercase tracking-wider">Live Status</span>
                    </div>
                    <span className={`text-[9px] font-bold ${agent.predictionColor || 'text-primary'} animate-pulse flex items-center gap-1`}>
                      <Activity className="w-2 h-2" />
                      {agent.predictionStatus || `${agent.activeConnections || 0} Connections`}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <StatBar label="System Health" value={agent.health} color={agent.health < 50 ? 'bg-red-500' : 'bg-primary'} />
                    <StatBar label="Processing Load" value={agent.cpu} color="bg-primary" />
                  </div>
                  {/* Live Metrics */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Response Time</span>
                      <span className="font-mono">{agent.responseTime || 0}ms</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Tasks Processed</span>
                      <span className="font-mono">{agent.tasksProcessed || 0}</span>
                    </div>
                  </div>
                </QuantumCard>
              ))}

              {/* Add New Agent Placeholder */}
              <button
                className="h-full min-h-[180px] rounded-2xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all flex flex-col items-center justify-center gap-3 group"
                onClick={handleDeployAgent}
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                </div>
                <span className="text-sm font-mono text-gray-400 group-hover:text-primary">Deploy New Agent</span>
              </button>
            </div>
          </div>

          {/* Financial Analytics */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" /> Analytics
            </h2>

            <QuantumCard glow="green" className="h-full">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-mono mb-1">Total Liquidity</p>
                  <div className="text-4xl font-mono font-bold text-white tracking-tighter mb-4">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary font-mono mb-6">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12.5% vs last cycle</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Projected Revenue</span>
                      <span className="text-white font-bold">${(balance * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[65%]" />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Operational Costs</span>
                      <span className="text-white font-bold">$145.20</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[15%]" />
                    </div>
                  </div>
                </div>

                <NeonButton variant="primary" className="w-full mt-6" icon={Wallet}>
                  Manage Wallet
                </NeonButton>
              </div>
            </QuantumCard>
          </div>
        </div>

        <BrandingFooter />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onGoogleAuth={handleGoogleAuth}
          onWalletAuth={handleWalletAuth}
        />

        {/* Agent Chat Modal */}
        {selectedAgent && (
          <AgentChat
            agentId={selectedAgent.id.toString()}
            agentName={selectedAgent.name}
            agentType={selectedAgent.type}
            onClose={() => {
              setShowChatModal(false);
              setSelectedAgent(null);
            }}
          />
        )}
      </div>
    </DataLoaderWrapper>
  );
}