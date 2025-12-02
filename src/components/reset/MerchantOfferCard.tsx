'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { Language } from '@/types/reset';

interface MerchantOfferCardProps {
  language?: Language;
  onCTAClick?: () => void;
}

export const MerchantOfferCard: React.FC<MerchantOfferCardProps> = ({
  language = 'en',
  onCTAClick,
}) => {
  const { t } = useTranslation(language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassPanel 
        variant="premium" 
        className="p-8 text-center space-y-6"
        hover={true}
        animate={true}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00F0FF]/20 to-[#7000FF]/20 border border-[#00F0FF]/30 flex items-center justify-center"
        >
          <ShoppingBag className="w-10 h-10 text-[#00F0FF]" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl md:text-4xl font-orbitron font-bold text-[#00F0FF] tracking-wider"
        >
          {t('merchant.title')}
        </motion.h2>

        {/* Features */}
        <div className="space-y-4">
          {[
            t('merchant.feature1'),
            t('merchant.feature2'),
            t('merchant.feature3'),
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              className="flex items-center justify-center space-x-3 text-white/80"
            >
              <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              <span className="text-lg">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onCTAClick}
            size="lg"
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#00F0FF] to-[#00F0FF]/80 text-white font-orbitron font-bold text-lg rounded-xl border-2 border-[#00F0FF]/50 hover:border-[#00F0FF] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all duration-300"
          >
            {t('merchant.cta')}
          </Button>
        </motion.div>
      </GlassPanel>
    </motion.div>
  );
};