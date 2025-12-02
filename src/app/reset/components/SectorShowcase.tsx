'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectorCard } from '@/components/reset/SectorCard';
import { ShoppingCart, Wrench, Pill, UtensilsCrossed } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { Language } from '@/types/reset';

interface SectorShowcaseProps {
  language?: Language;
}

export const SectorShowcase: React.FC<SectorShowcaseProps> = ({
  language = 'en',
}) => {
  const { t } = useTranslation(language);

  const sectors = [
    {
      sector: 'juice_shop' as const,
      name: t('sector.juice'),
      description: 'Fresh juice bars and beverage shops. Zero-fee delivery with instant payments.',
      benefits: [
        '100% revenue retention',
        'Real-time order tracking',
        'Customer analytics',
      ],
      icon: UtensilsCrossed,
    },
    {
      sector: 'mobile_repair' as const,
      name: t('sector.repair'),
      description: 'Mobile phone repair and technical services. On-demand field agents.',
      benefits: [
        'Instant service requests',
        'Quality verification',
        'Warranty tracking',
      ],
      icon: Wrench,
    },
    {
      sector: 'pharmacy' as const,
      name: t('sector.pharmacy'),
      description: 'Pharmacies and healthcare providers. Compliant delivery with verification.',
      benefits: [
        'Prescription verification',
        'Compliance built-in',
        'Secure delivery',
      ],
      icon: Pill,
    },
  ];

  return (
    <section className="relative py-20 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[#050505]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-4">
            {t('sector.title')}
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Empowering Egyptian micro-SMEs across multiple sectors
          </p>
        </motion.div>

        {/* Sector Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sectors.map((sector, index) => (
            <SectorCard key={sector.sector} {...sector} />
          ))}
        </div>
      </div>
    </section>
  );
};