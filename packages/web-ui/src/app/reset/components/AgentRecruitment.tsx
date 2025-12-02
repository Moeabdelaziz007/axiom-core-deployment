'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BenefitCard } from '@/components/reset/BenefitCard';
import { Zap, TrendingUp, Clock, Wallet } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { Language } from '@/types/reset';

interface AgentRecruitmentProps {
  language?: Language;
  onSignUpClick?: () => void;
}

export const AgentRecruitment: React.FC<AgentRecruitmentProps> = ({
  language = 'en',
  onSignUpClick,
}) => {
  const { t } = useTranslation(language);

  const benefits = [
    {
      title: t('agent.microPayments'),
      description: 'Earn instantly for every task completed. Micro-payments directly to your wallet.',
      icon: Wallet,
    },
    {
      title: t('agent.career'),
      description: 'Level up your skills and unlock higher-paying opportunities.',
      icon: TrendingUp,
    },
    {
      title: t('agent.flexible'),
      description: 'Work on your own schedule. Choose tasks that fit your availability.',
      icon: Clock,
    },
    {
      title: t('agent.revenue'),
      description: 'Earn passive income from merchant success and platform growth.',
      icon: Zap,
    },
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background with glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(57,255,20,0.1)_0%,_transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-4">
            {t('agent.title')}
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
            Join our network of field agents. Earn while you learn.
          </p>
          
          <Button
            onClick={onSignUpClick}
            size="lg"
            className="bg-gradient-to-r from-[#39FF14] to-[#00F0FF] text-black font-bold hover:shadow-[0_0_30px_rgba(57,255,20,0.6)] transition-all"
          >
            {t('cta.signUpAgent')}
          </Button>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
};