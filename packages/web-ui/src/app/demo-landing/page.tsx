'use client';

import React, { useState } from 'react';
import { RootProviders } from '@/providers/RootProviders';
import SovereignLanding from '@/components/kombai-drafts/SovereignLanding';
import IndustrialDashboardConnected from '@/components/kombai-drafts/IndustrialDashboardConnected';

export default function DemoLandingPage() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  return (
    <RootProviders>
      <div className="relative">
      {/* View Toggle */}
      <div className="fixed top-4 right-4 z-[100] flex gap-2">
        <button
          onClick={() => setView('landing')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            view === 'landing'
              ? 'bg-gradient-to-r from-[#00F0FF] to-[#7000FF] text-white'
              : 'bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          Landing
        </button>
        <button
          onClick={() => setView('dashboard')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            view === 'dashboard'
              ? 'bg-gradient-to-r from-[#00F0FF] to-[#7000FF] text-white'
              : 'bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
      </div>

        {/* Component Display */}
        {view === 'landing' ? <SovereignLanding /> : <IndustrialDashboardConnected />}
      </div>
    </RootProviders>
  );
}