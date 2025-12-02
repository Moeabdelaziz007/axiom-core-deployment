'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { MetricCounter } from '@/components/reset/MetricCounter';
import { GlassPanel } from '@/components/reset/GlassPanel';
import { Check, X } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { Language } from '@/types/reset';

interface ValuePropositionProps {
  language?: Language;
}

export const ValueProposition: React.FC<ValuePropositionProps> = ({
  language = 'en',
}) => {
  const { t } = useTranslation(language);

  const metrics = [
    { value: 100, label: '100% Revenue Retention', suffix: '%' },
    { value: 0, label: 'Platform Fees', suffix: '%' },
    { value: 1000, label: 'Active Merchants', suffix: '+' },
  ];

  const comparison = [
    { feature: 'Platform Commission', axiom: false, traditional: true },
    { feature: 'Instant Payments', axiom: true, traditional: false },
    { feature: 'Built-in Compliance', axiom: true, traditional: false },
    { feature: 'Free Analytics', axiom: true, traditional: true },
    { feature: 'P2P Transactions', axiom: true, traditional: false },
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-4">
            {t('value.title')}
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Keep 100% of your revenue. No hidden fees, no commissions.
          </p>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {metrics.map((metric, index) => (
            <GlassPanel key={index} variant="premium" animate>
              <div className="p-8">
                <MetricCounter {...metric} />
              </div>
            </GlassPanel>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassPanel variant="premium">
            <div className="p-8">
              <h3 className="text-2xl font-orbitron font-bold text-white mb-6 text-center">
                Axiom RESET vs Traditional Platforms
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 text-white/70 font-medium">Feature</th>
                      <th className="text-center py-4 px-4 text-[#00F0FF] font-orbitron font-bold">Axiom RESET</th>
                      <th className="text-center py-4 px-4 text-white/70 font-medium">Traditional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((item, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-white">{item.feature}</td>
                        <td className="py-4 px-4 text-center">
                          {item.axiom ? (
                            <Check className="w-6 h-6 text-[#39FF14] mx-auto" />
                          ) : (
                            <X className="w-6 h-6 text-[#FF003C] mx-auto" />
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.traditional ? (
                            <Check className="w-6 h-6 text-white/40 mx-auto" />
                          ) : (
                            <X className="w-6 h-6 text-white/40 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </section>
  );
};