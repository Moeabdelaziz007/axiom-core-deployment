'use client';

import React, { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { ValueProposition } from './components/ValueProposition';
import { SectorShowcase } from './components/SectorShowcase';
import { AgentRecruitment } from './components/AgentRecruitment';
import { TelegramMiniApp } from '@/components/reset/TelegramMiniApp';
import { MerchantOfferCard } from '@/components/reset/MerchantOfferCard';
import { Language } from '@/types/reset';

export default function ResetLandingPage() {
  const [language, setLanguage] = useState<Language>('en');

  const handleCTAClick = () => {
    console.log('CTA clicked');
    // Navigate to signup or show modal
  };

  const handleSignUpClick = () => {
    console.log('Agent signup clicked');
    // Navigate to agent signup
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Language Toggle - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="px-4 py-2 rounded-lg bg-[#0F111A]/80 backdrop-blur-sm border border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-all"
        >
          {language === 'en' ? 'العربية' : 'English'}
        </button>
      </div>

      {/* Hero Section */}
      <HeroSection language={language} onCTAClick={handleCTAClick} />

      {/* Value Proposition */}
      <ValueProposition language={language} />

      {/* Merchant Offer Card */}
      <section className="py-20 px-4">
        <MerchantOfferCard
          language={language}
          onCTAClick={handleCTAClick}
        />
      </section>

      {/* Sector Showcase */}
      <SectorShowcase language={language} />

      {/* Agent Recruitment */}
      <AgentRecruitment language={language} onSignUpClick={handleSignUpClick} />
      
      {/* Telegram Mini App Interface */}
      <TelegramMiniApp language={language} onAgentTaskUpdate={(taskId, status) => {
        console.log(`Task ${taskId} updated to ${status}`);
      }} />

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60">
            © 2025 Axiom RESET. Part of the Axiom ID Ecosystem.
          </p>
        </div>
      </footer>
    </main>
  );
}