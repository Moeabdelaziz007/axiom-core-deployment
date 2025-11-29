import React, { useState } from 'react';
import { ViewMode, Agent } from './types';
import { NeuralTerminal } from './components/NeuralTerminal';
import { PolyphaseMonitor } from './components/PolyphaseMonitor';
import { ControlHub } from './components/ControlHub';
import { TheForge } from './components/TheForge';
import { CryptoCortex } from './components/CryptoCortex';
import { DeadHandMonitor } from './components/DeadHandMonitor';
import { LandingPage } from './components/LandingPage';
import { AgentsPage } from './components/AgentsPage';
import { PricingPage } from './components/PricingPage';
import { EnterprisePage } from './components/EnterprisePage';
import { AboutPage } from './components/AboutPage';
import { NeuralWorkspace } from './components/NeuralWorkspace';
import { LayoutGrid, ShoppingBag, Hammer, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [activeWorkspaceAgent, setActiveWorkspaceAgent] = useState<Agent | null>(null);

  // Handle deploying from Agents page directly to Workspace
  const handleDeploy = (agent: Agent) => {
    setActiveWorkspaceAgent(agent);
    setCurrentView(ViewMode.DASHBOARD); // This will show the workspace overlay
    setShowLanding(false);
  };

  const handleLandingNavigation = (mode: ViewMode) => {
    setCurrentView(mode);
    setShowLanding(false);
  }

  // If in Landing or Static Pages mode (except Dashboard/App internals)
  if (showLanding) {
    return <LandingPage onNavigate={handleLandingNavigation} />;
  }

  // Render Full Page Views that replace the Dashboard Layout
  if (currentView === ViewMode.AGENTS) {
     return (
       <>
         <LandingPage onNavigate={handleLandingNavigation} /> {/* Re-using Nav from Landing for consistence, or simple back */}
         <div className="fixed inset-0 z-[60] bg-black overflow-y-auto">
            <Navbar onNavigate={handleLandingNavigation} />
            <AgentsPage onDeploy={handleDeploy} />
         </div>
       </>
     )
  }
  if (currentView === ViewMode.PRICING) {
     return (
        <div className="fixed inset-0 z-[60] bg-black overflow-y-auto">
          <Navbar onNavigate={handleLandingNavigation} />
          <PricingPage />
        </div>
     );
  }
  if (currentView === ViewMode.ENTERPRISE) {
     return (
        <div className="fixed inset-0 z-[60] bg-black overflow-y-auto">
          <Navbar onNavigate={handleLandingNavigation} />
          <EnterprisePage />
        </div>
     );
  }
  if (currentView === ViewMode.ABOUT) {
     return (
        <div className="fixed inset-0 z-[60] bg-black overflow-y-auto">
          <Navbar onNavigate={handleLandingNavigation} />
          <AboutPage />
        </div>
     );
  }

  // Nav Button Component for App Internal
  const NavBtn = ({ mode, icon: Icon, label }: { mode: ViewMode; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(mode)}
      className={`relative px-4 py-3 flex items-center gap-2 border-r border-gray-800 transition-all ${
        currentView === mode 
          ? 'bg-gray-900 text-neon border-b-2 border-b-neon' 
          : 'text-gray-500 hover:text-white hover:bg-gray-900/50'
      }`}
    >
      <Icon size={18} />
      <span className="font-display text-xs tracking-widest hidden md:inline">{label}</span>
      {currentView === mode && (
        <div className="absolute inset-0 bg-neon/5 pointer-events-none"></div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-neon/30 selection:text-white flex flex-col overflow-hidden animate-fade-in">
      
      {/* Workspace Overlay Logic */}
      {activeWorkspaceAgent && (
         <div className="fixed inset-0 z-[100] bg-black">
            <NeuralWorkspace agent={activeWorkspaceAgent} onClose={() => setActiveWorkspaceAgent(null)} />
         </div>
      )}

      {/* Top Bar (Status & Navigation) */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between bg-black/90 backdrop-blur-sm z-50">
        <div className="flex h-full">
           <div className="w-16 h-full bg-neon/10 flex items-center justify-center border-r border-gray-800 cursor-pointer" onClick={() => setShowLanding(true)}>
              <span className="font-display font-black text-2xl text-neon tracking-tighter">A</span>
           </div>
           <nav className="flex h-full">
              <NavBtn mode={ViewMode.DASHBOARD} icon={LayoutGrid} label="QCC DASHBOARD" />
              <NavBtn mode={ViewMode.MARKETPLACE} icon={ShoppingBag} label="AGENT SOUQ" />
              <NavBtn mode={ViewMode.FORGE} icon={Hammer} label="THE FORGE" />
              <NavBtn mode={ViewMode.STAKING} icon={Lock} label="STAKING VAULT" />
           </nav>
        </div>

        <div className="flex h-full items-center">
           <DeadHandMonitor />
           <div className="w-px h-8 bg-gray-800 mx-2"></div>
           <CryptoCortex />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:30px_30px] -z-10"></div>
         
         {/* Left Column (Terminal) - Only visible on Dashboard */}
         {currentView === ViewMode.DASHBOARD && (
           <aside className="w-1/4 min-w-[350px] border-r border-gray-800 flex flex-col z-20 bg-black/40 backdrop-blur-sm">
             <NeuralTerminal />
           </aside>
         )}

         {/* Center Viewport */}
         <section className="flex-1 bg-black/50 relative overflow-hidden">
            {currentView === ViewMode.DASHBOARD && <ControlHub />}
            {currentView === ViewMode.FORGE && <TheForge />}
            {currentView === ViewMode.MARKETPLACE && (
               <div className="flex items-center justify-center h-full text-gray-500 font-display text-xl tracking-widest">
                  ACCESSING SOUQ MAINFRAME...
               </div>
            )}
            {currentView === ViewMode.STAKING && (
               <div className="flex items-center justify-center h-full text-gray-500 font-display text-xl tracking-widest">
                  VAULT LOCKED. REQUIRES MULTI-SIG.
               </div>
            )}
         </section>

         {/* Right Column (Monitor) - Always visible for system health */}
         <aside className="w-64 border-l border-gray-800 hidden xl:block z-20 bg-black/40 backdrop-blur-sm">
            <PolyphaseMonitor />
         </aside>

      </main>

      {/* Bottom Status Bar */}
      <footer className="h-6 bg-black border-t border-gray-800 flex items-center justify-between px-4 text-[10px] text-gray-600 font-mono uppercase">
         <div className="flex gap-4">
            <span>AXIOM OS v2.0.45</span>
            <span className="text-green-900">SYSTEM: OPTIMAL</span>
         </div>
         <div className="flex gap-4">
            <span>SOLANA MAINNET: CONNECTED</span>
            <span>GEMINI LINK: ESTABLISHED</span>
         </div>
      </footer>
    </div>
  );
};

// Internal Navbar for Static Pages
const Navbar = ({ onNavigate }: { onNavigate: (mode: ViewMode) => void }) => (
    <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(ViewMode.DASHBOARD)}>
            <div className="w-8 h-8 bg-neon/10 rounded-sm flex items-center justify-center border border-neon/30">
              <span className="font-display font-bold text-neon">A</span>
            </div>
            <span className="font-display font-bold tracking-tight text-xl text-white">AXIOM ID</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
             <button onClick={() => onNavigate(ViewMode.AGENTS)} className="hover:text-white transition-colors">Agents</button>
             <button onClick={() => onNavigate(ViewMode.PRICING)} className="hover:text-white transition-colors">Pricing</button>
             <button onClick={() => onNavigate(ViewMode.ENTERPRISE)} className="hover:text-white transition-colors">Enterprise</button>
             <button onClick={() => onNavigate(ViewMode.ABOUT)} className="hover:text-white transition-colors">About</button>
             <button 
               onClick={() => onNavigate(ViewMode.DASHBOARD)}
               className="bg-neon text-black px-5 py-2 rounded-sm font-bold font-display hover:bg-white transition-colors"
             >
               LAUNCH APP
             </button>
          </div>
        </div>
      </nav>
);

export default App;