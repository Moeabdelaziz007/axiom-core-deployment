'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/reset/FeatureCard';
import dynamic from 'next/dynamic';
import { FeatureCard } from '@/components/reset/FeatureCard';
// Lazy load MatrixRain with no SSR to avoid hydration mismatches
const MatrixRain = dynamic(() => import('@/components/effects/MatrixRain').then(mod => mod.MatrixRain), {
  ssr: false
});
import { ArrowRight, Route, Fuel, Download, Scan } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { Language } from '@/types/reset';

interface HeroSectionProps {
  language?: Language;
  onCTAClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language = 'en',
  onCTAClick,
}) => {
  const { t } = useTranslation(language);

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Matrix Rain Background Effect */}
      <div className="absolute inset-0 opacity-20">
        <MatrixRain isActive={true} />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-bold mb-6 text-glow">
            <span className="bg-gradient-to-r from-[#00F0FF] via-white to-[#00F0FF] bg-clip-text text-transparent">
              {t('hero.title')}
            </span>
          </h1>
          <div
            className="text-xl md:text-2xl text-white font-orbitron tracking-wider mb-8"
            dangerouslySetInnerHTML={{ __html: t('hero.subtitle') }}
          />

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              onClick={onCTAClick}
              size="lg"
              className="btn-neon text-lg px-12 py-6 group"
            >
              {t('hero.cta')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.type}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};