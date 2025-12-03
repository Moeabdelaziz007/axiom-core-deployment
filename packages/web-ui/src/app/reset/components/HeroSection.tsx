'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FeatureCard } from '@/components/reset/FeatureCard';
import { WaitlistForm } from '@/components/reset/WaitlistForm';
import { AxiomChatbot } from '@/components/reset/AxiomChatbot';
import dynamic from 'next/dynamic';

// Lazy load MatrixRain with no SSR to avoid hydration mismatches
const MatrixRain = dynamic(() => import('@/components/effects/MatrixRain').then(mod => mod.MatrixRain), {
  ssr: false
});
import { Route, Fuel, Download, Scan, Zap } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { Language } from '@/types/reset';

interface HeroSectionProps {
  language?: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language = 'en',
}) => {
  const { t } = useTranslation(language);
  const isRTL = language === 'ar';

  const features = [
    {
      type: 'SHIFT' as const,
      title: t('feature.shift.title'),
      description: t('feature.shift.desc'),
      icon: Route,
    },
    {
      type: 'FUEL' as const,
      title: t('feature.fuel.title'),
      description: t('feature.fuel.desc'),
      icon: Fuel,
    },
    {
      type: 'DROP' as const,
      title: t('feature.drop.title'),
      description: t('feature.drop.desc'),
      icon: Download,
    },
    {
      type: 'SCAN' as const,
      title: t('feature.scan.title'),
      description: t('feature.scan.desc'),
      icon: Scan,
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-black">
        {/* Radial Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-80" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

        {/* Matrix Rain Layer */}
        <div className="absolute inset-0 opacity-10 mix-blend-screen">
          <MatrixRain isActive={true} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md text-cyan-400 text-xs tracking-[0.2em] uppercase font-mono shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <Zap className="w-3 h-3 animate-pulse" />
            {language === 'ar' ? 'نظام التشغيل السيادي' : 'SOVEREIGN OPERATING SYSTEM'}
          </motion.div>

          {/* Main Headline */}
          <h1 className={`text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight ${isRTL ? 'font-sans' : 'font-orbitron'}`}>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              {t('hero.title')}
            </span>
          </h1>

          {/* Subtitle / Offer */}
          <div className="max-w-4xl mx-auto mb-12 space-y-6">
            <p className={`text-xl md:text-2xl text-gray-400 font-light tracking-wide leading-relaxed ${isRTL ? 'font-sans' : 'font-sans'}`}>
              Get Your AI-Powered Mini-Store & Chatbot.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-2xl md:text-3xl font-bold">
              <span className="text-white">Start from</span>
              <span className="px-4 py-1 rounded bg-green-500/10 border border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                $0.99/Month
              </span>
              <span className="hidden md:inline text-gray-600">|</span>
              <span className="text-green-400 flex items-center gap-2">
                0% Commission <span className="text-xs bg-green-500 text-black px-2 py-0.5 rounded-full">FOREVER</span>
              </span>
            </div>
          </div>

          {/* Waitlist Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-20"
          >
            <WaitlistForm />
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
          {features.map((feature, index) => (
            <motion.div
              key={feature.type}
              initial={{ opacity: 0, y: 50, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Chatbot */}
      <AxiomChatbot />
    </section>
  );
};