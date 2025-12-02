'use client';

import React, { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useFactoryMetrics, useAssemblyStages } from '@/hooks/useFactoryData';
import { useFactoryRealtime } from '@/hooks/useFactoryRealtime';
import IndustrialDashboard from './IndustrialDashboard';
import type { DashboardMetrics, AssemblyStage } from '@/types/landing';

export default function IndustrialDashboardConnected() {
  const { activeDashboardTab, activeSidebarItem, setActiveDashboardTab, setActiveSidebarItem } = useUIStore();
  
  const { data: metricsData, isLoading: metricsLoading } = useFactoryMetrics();
  const { data: stagesData, isLoading: stagesLoading } = useAssemblyStages();

  const { isConnected, lastUpdate } = useFactoryRealtime({
    enabled: true,
    onUpdate: (update) => {
      console.log('[Factory Realtime]', update.type, update.data);
    },
  });

  const mockMetrics: DashboardMetrics = {
    systemStatus: 'Online',
    throughputPercentage: 96,
    activeWallets: 1402,
    currentQueue: 3,
  };

  const mockStages: AssemblyStage[] = [
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

  const metrics = metricsData || mockMetrics;
  const stages = stagesData || mockStages;

  return (
    <div className="relative">
      {!isConnected && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-panel px-4 py-2 rounded-lg border border-yellow-500/30">
          <span className="text-xs text-yellow-400">⚠️ Realtime updates disconnected</span>
        </div>
      )}
      
      <IndustrialDashboard
        metrics={metrics}
        stages={stages}
        activeTab={activeDashboardTab}
        activeSidebarItem={activeSidebarItem}
        onTabChange={setActiveDashboardTab}
        onSidebarItemChange={setActiveSidebarItem}
      />
    </div>
  );
}