'use client';

import React, { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { ValueProposition } from './components/ValueProposition';
import { AgentShowcase } from './components/AgentShowcase';
import { PricingSection } from './components/PricingSection';
import { TelegramMiniApp } from '@/components/reset/TelegramMiniApp';
import { Footer } from './components/Footer';
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
      <HeroSection language={language} />

      {/* Value Proposition */}
      <ValueProposition language={language} />

      {/* Value Proposition */}
      <ValueProposition language={language} />

      {/* Agent Showcase */}
      <AgentShowcase language={language} />

      {/* Pricing Section */}
      <PricingSection language={language} />

      {/* Telegram Mini App Interface */}
      <TelegramMiniApp language={language} onAgentTaskUpdate={(taskId, status) => {
        console.log(`Task ${taskId} updated to ${status}`);
      }} />

      {/* Footer */}
      <Footer language={language} />
    </main>
  );
}