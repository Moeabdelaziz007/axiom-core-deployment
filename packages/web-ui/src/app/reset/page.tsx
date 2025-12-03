'use client';

import React, { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { ValueProposition } from './components/ValueProposition';
import { AgentShowcase } from './components/AgentShowcase';
import { PricingSection } from './components/PricingSection';
import { Footer } from './components/Footer';
import { Language } from '@/types/reset';
import { ResetHeader } from './components/ResetHeader';
import { AboutSection } from './components/AboutSection';

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
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden pt-20">
      {/* Header */}
      <ResetHeader language={language} setLanguage={setLanguage} />

      {/* Hero Section */}
      <HeroSection language={language} />

      {/* Value Proposition */}
      <ValueProposition language={language} />

      {/* Agent Showcase */}
      <div id="agents">
        <AgentShowcase language={language} />
      </div>

      {/* Pricing Section */}
      <div id="pricing">
        <PricingSection language={language} />
      </div>

      {/* About Section */}
      <AboutSection language={language} />

      {/* Footer */}
      <Footer language={language} />
    </main>
  );
}