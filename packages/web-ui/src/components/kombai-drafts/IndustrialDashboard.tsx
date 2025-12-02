'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Factory, Wallet, Settings, X } from 'lucide-react';
import type { DashboardMetrics, AssemblyStage, SidebarNavItem } from '@/types/landing';

// Sidebar Component
const Sidebar = ({ activeItem, onItemClick }: { activeItem: string; onItemClick: (label: 'My Agents' | 'Factory' | 'Wallet' | 'Settings') => void }) => {
  const navItems: SidebarNavItem[] = [
    { icon: <Users className="w-6 h-6" />, label: 'My Agents', href: '#agents' },
    { icon: <Factory className="w-6 h-6" />, label: 'Factory', href: '#factory', active: true },
    { icon: <Wallet className="w-6 h-6" />, label: 'Wallet', href: '#wallet' },
    { icon: <Settings className="w-6 h-6" />, label: 'Settings', href: '#settings' },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-20 md:w-64 h-screen fixed left-0 top-0 glass-panel border-r border-[#00F0FF]/20 flex flex-col items-center md:items-start p-4 md:p-6"
    >
      {/* Logo Area */}
      <div className="mb-12 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#7000FF] flex items-center justify-center">
          <Factory className="w-6 h-6 text-white" />
        </div>
        <span className="hidden md:block text-sm font-bold text-[#00F0FF]">GIGAFACTORY</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 w-full space-y-2">
        {navItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onItemClick(item.label as 'My Agents' | 'Factory' | 'Wallet' | 'Settings')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeItem === item.label
                ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#7000FF]/20 text-[#00F0FF] border border-[#00F0FF]/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span style={{ color: activeItem === item.label ? '#00F0FF' : 'inherit' }}>
              {item.icon}
            </span>
            <span className="hidden md:block font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>
    </motion.aside>
  );
};

// Dashboard Header Component
const DashboardHeader = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: 'SOUL FORGE' | 'IDENTITY MINT' | 'EQUIPPING' | 'DELIVERY DOCK') => void }) => {
  const tabs = ['SOUL FORGE', 'IDENTITY MINT', 'EQUIPPING', 'DELIVERY DOCK'];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-section text-gradient-cyan-purple">AI AGENT GIGAFACTORY</h1>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onTabChange(tab as 'SOUL FORGE' | 'IDENTITY MINT' | 'EQUIPPING' | 'DELIVERY DOCK')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#7000FF]/20 text-[#00F0FF] border border-[#00F0FF]/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
            {tab === 'SOUL FORGE' && <span className="ml-2 text-xs opacity-70">DREAM IT</span>}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// Assembly Line Component
const AssemblyLine = ({ stages: propStages }: { stages?: AssemblyStage[] }) => {
  const defaultStages: AssemblyStage[] = [
    {
      id: 'stage-1',
      title: 'GENERATING CORE ESSENCE...',
      subtitle: 'PROGRESS: 65%',
      progress: 65,
      status: 'generating',
    },
    {
      id: 'stage-2',
      title: 'MINTING ON-CHAIN IDENTITY...',
      subtitle: '89% COMPLETE',
      progress: 89,
      status: 'minting',
    },
    {
      id: 'stage-3',
      title: 'LOADING MENA TOOLSET...',
      subtitle: 'INTEGRATING MODULES...',
      progress: 45,
      status: 'loading',
    },
    {
      id: 'stage-4',
      title: 'AGENT AX-9982',
      subtitle: 'READY FOR DEPLOYMENT',
      progress: 100,
      status: 'ready',
    },
  ];

  const stages = propStages ?? defaultStages;

  return (
    <div className="relative mb-8">
      {/* Assembly Line Visualization */}
      <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
        {/* Conveyor Belt Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00F0FF]/20 to-[#7000FF]/20" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Stage Container */}
              <div className="glass-panel rounded-xl p-6 h-full border border-[#00F0FF]/20 hover:border-[#00F0FF]/40 transition-all">
                {/* Stage Icon/Visual */}
                <div className="mb-4 h-32 rounded-lg bg-gradient-to-br from-[#00F0FF]/10 to-[#7000FF]/10 flex items-center justify-center relative overflow-hidden">
                  {stage.status === 'ready' ? (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#7000FF] flex items-center justify-center">
                        <span className="text-2xl font-bold">✓</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                        READY FOR DEPLOYMENT
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-[#00F0FF]/20 border-t-[#00F0FF] rounded-full"
                      />
                    </div>
                  )}
                  
                  {/* Scanline Effect */}
                  {stage.status !== 'ready' && (
                    <motion.div
                      animate={{ y: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent"
                    />
                  )}
                </div>

                {/* Stage Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#00F0FF]">{stage.title}</h3>
                  <p className="text-xs text-gray-400">{stage.subtitle}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className="h-full bg-gradient-to-r from-[#00F0FF] to-[#7000FF]"
                    />
                  </div>
                </div>
              </div>

              {/* Connection Line */}
              {index < stages.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[#00F0FF]/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Chain Info Badge */}
        <div className="absolute top-4 right-4 glass-panel px-4 py-2 rounded-lg">
          <div className="text-xs text-gray-400">CHAIN: <span className="text-[#00F0FF] font-bold">SOLANA (SOL)</span></div>
          <div className="text-xs text-gray-400">STATUS: <span className="text-green-400 font-bold">VERIFIED</span></div>
        </div>
      </div>
    </div>
  );
};

// Status Panel Component
const StatusPanel = ({ metrics }: { metrics: DashboardMetrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel rounded-xl p-6 border border-[#00F0FF]/20"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">SYSTEM STATUS:</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-bold">{metrics.systemStatus.toUpperCase()}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel rounded-xl p-6 border border-[#00F0FF]/20"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">THROUGHPUT:</span>
          <span className="text-[#00F0FF] font-bold text-xl">{metrics.throughputPercentage}%</span>
        </div>
      </motion.div>
    </div>
  );
};

// Bottom Stats Component
const BottomStats = ({ metrics }: { metrics: DashboardMetrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel rounded-xl p-6 border border-[#00F0FF]/20"
      >
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-5 h-5" style={{ color: '#00F0FF' }} />
          <span className="text-sm text-gray-400">ACTIVE WALLETS:</span>
        </div>
        <span className="text-3xl font-bold text-white">{metrics.activeWallets.toLocaleString()}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-panel rounded-xl p-6 border border-[#00F0FF]/20"
      >
        <div className="flex items-center gap-3 mb-2">
          <Factory className="w-5 h-5" style={{ color: '#00F0FF' }} />
          <span className="text-sm text-gray-400">CURRENT QUEUE:</span>
        </div>
        <span className="text-3xl font-bold text-white">{metrics.currentQueue} AGENTS</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-panel rounded-xl p-6 border border-[#00F0FF]/20"
      >
        <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#7000FF] text-white font-bold hover:shadow-lg hover:shadow-[#00F0FF]/30 transition-all">
          DEPLOY AGENT
        </button>
      </motion.div>
    </div>
  );
};

// Main Component
export interface IndustrialDashboardProps {
  metrics?: DashboardMetrics;
  stages?: AssemblyStage[];
  activeTab?: 'SOUL FORGE' | 'IDENTITY MINT' | 'EQUIPPING' | 'DELIVERY DOCK';
  activeSidebarItem?: 'My Agents' | 'Factory' | 'Wallet' | 'Settings';
  onTabChange?: (tab: 'SOUL FORGE' | 'IDENTITY MINT' | 'EQUIPPING' | 'DELIVERY DOCK') => void;
  onSidebarItemChange?: (item: 'My Agents' | 'Factory' | 'Wallet' | 'Settings') => void;
}

export default function IndustrialDashboard({
  metrics: propMetrics,
  stages: propStages,
  activeTab: propActiveTab,
  activeSidebarItem: propActiveSidebarItem,
  onTabChange: propOnTabChange,
  onSidebarItemChange: propOnSidebarItemChange,
}: IndustrialDashboardProps = {}) {
  const [localActiveTab, setLocalActiveTab] = useState('SOUL FORGE');
  const [localActiveSidebarItem, setLocalActiveSidebarItem] = useState('Factory');

  const activeTab = propActiveTab ?? localActiveTab;
  const activeSidebarItem = propActiveSidebarItem ?? localActiveSidebarItem;
  const setActiveTab = propOnTabChange ?? setLocalActiveTab;
  const setActiveSidebarItem = propOnSidebarItemChange ?? setLocalActiveSidebarItem;

  const defaultMetrics: DashboardMetrics = {
    systemStatus: 'Online',
    throughputPercentage: 96,
    activeWallets: 1402,
    currentQueue: 3,
  };

  const metrics = propMetrics ?? defaultMetrics;

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Sidebar activeItem={activeSidebarItem} onItemClick={setActiveSidebarItem} />
      
      <main className="ml-20 md:ml-64 p-6 md:p-10">
        <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <AssemblyLine stages={propStages} />
        <StatusPanel metrics={metrics} />
        <BottomStats metrics={metrics} />
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 circuit-pattern opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#00F0FF]/5 to-[#7000FF]/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}