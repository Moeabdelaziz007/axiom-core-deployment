

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Zap, Star, Truck, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { Language } from '@/types/reset';
import Image from 'next/image';

interface MerchantOfferCardProps {
  language?: Language;
  onCTAClick?: () => void;
}

export const MerchantOfferCard: React.FC<MerchantOfferCardProps> = ({
  language = 'en',
  onCTAClick,
}) => {
  const { t } = useTranslation(language);
  const isRTL = language === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl mx-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

        {/* Left Side: The Offer Text */}
        <div className={`space-y-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-sm font-mono">
            <Zap size={16} className="animate-pulse" />
            <span>LIMITED TIME OFFER // GENESIS BATCH</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight font-orbitron">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-white">
              {t('merchant.title')}
            </span>
          </h2>

          <div className="space-y-4">
            {[
              { icon: Star, text: t('merchant.feature1') },
              { icon: Zap, text: t('merchant.feature2') },
              { icon: Truck, text: t('merchant.feature3') },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-4 text-gray-300 text-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/10 flex items-center justify-center text-[#00F0FF] border border-[#00F0FF]/20">
                  <item.icon size={20} />
                </div>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={onCTAClick}
            size="lg"
            className="w-full md:w-auto px-8 py-6 bg-[#00F0FF] text-black hover:bg-white transition-all font-bold text-xl rounded-none clip-path-polygon shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.6)]"
          >
            {t('merchant.cta')}
          </Button>
        </div>

        {/* Right Side: The Smart Shop Visual (Nano Banana) */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/20 to-purple-500/20 blur-3xl rounded-full opacity-50 animate-pulse" />

          <GlassPanel
            variant="premium"
            className="relative p-6 border border-[#00F0FF]/30 overflow-hidden group"
          >
            {/* Shop Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black">
                  NB
                </div>
                <div>
                  <h3 className="font-bold text-white">Nano Banana Store</h3>
                  <p className="text-xs text-[#00F0FF]">Powered by Axiom Agent</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded bg-green-500/20 text-green-400 text-xs font-mono flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                ONLINE
              </div>
            </div>

            {/* Product Showcase */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/10 mb-6 group-hover:border-[#00F0FF]/50 transition-colors">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,0,0.1),transparent_70%)]" />

              {/* "Nano Banana" Visual Representation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Glowing Banana Shape (CSS Art or Placeholder) */}
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">
                    <path d="M20,80 Q10,70 15,50 Q25,20 60,10 Q80,10 90,20 Q70,30 50,50 Q30,70 20,80 Z" fill="#FFD700" />
                    <path d="M20,80 Q10,70 15,50 Q25,20 60,10" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
                    {/* Tech Circuit Overlay */}
                    <path d="M30,60 L40,50 L45,55" fill="none" stroke="#00F0FF" strokeWidth="1" opacity="0.8" />
                    <circle cx="45" cy="55" r="2" fill="#00F0FF" />
                  </svg>

                  {/* Floating Stats */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-4 -right-4 bg-black/80 backdrop-blur border border-[#00F0FF]/50 p-2 rounded text-xs text-[#00F0FF] font-mono shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  >
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={12} />
                      VERIFIED ORGANIC
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Price Tag */}
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-4 py-2 rounded-lg border border-yellow-500/50">
                <p className="text-xs text-gray-400">Price per unit</p>
                <p className="text-xl font-bold text-yellow-400">0.05 SOL</p>
              </div>
            </div>

            {/* AI Chat Preview */}
            <div className="bg-white/5 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[#00F0FF]/20 flex-shrink-0" />
                <div className="bg-[#00F0FF]/10 rounded-r-lg rounded-bl-lg p-2 text-xs text-gray-300">
                  Hello! I'm the Nano Banana Agent. Fresh stock just arrived from the hydroponic labs. Want to try a sample? 🍌✨
                </div>
              </div>
              <div className="flex gap-2 flex-row-reverse">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex-shrink-0" />
                <div className="bg-white/10 rounded-l-lg rounded-br-lg p-2 text-xs text-white">
                  Yes, add 5 to my cart please!
                </div>
              </div>
            </div>

          </GlassPanel>
        </div>
      </div>
    </motion.div>
  );
};