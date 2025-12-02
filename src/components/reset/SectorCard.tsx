'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectorCardProps } from '@/types/reset';
import Image from 'next/image';

export const SectorCard: React.FC<SectorCardProps> = ({
  sector,
  name,
  description,
  benefits,
  icon: Icon,
}) => {
  const illustrationMap = {
    juice_shop: '/illustrations/juice-shop.svg',
    mobile_repair: '/illustrations/mobile-repair.svg',
    pharmacy: '/illustrations/pharmacy.svg',
    general_retail: '/illustrations/factory.svg',
    food_service: '/illustrations/juice-shop.svg',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
      className="h-full"
    >
      <Card className={cn(
        'relative h-full overflow-hidden',
        'bg-[#0F111A]/60 backdrop-blur-[20px]',
        'border border-white/10 rounded-2xl',
        'transition-all duration-300',
        'hover:border-[#00F0FF]/50 hover:shadow-[0_0_40px_rgba(0,240,255,0.2)]',
        'group'
      )}>
        {/* Illustration */}
        <div className="relative h-48 bg-gradient-to-br from-[#00F0FF]/10 to-[#7000FF]/10 overflow-hidden">
          <Image
            src={illustrationMap[sector]}
            alt={name}
            fill
            className="object-contain p-8 opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute top-4 right-4">
            <div className="p-2 rounded-lg bg-[#0F111A]/80 backdrop-blur-sm border border-[#00F0FF]/30">
              <Icon className="w-6 h-6 text-[#00F0FF]" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-2">
              {name}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[#39FF14] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/70">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Badge */}
          <Badge 
            variant="outline"
            className="border-[#7000FF]/30 text-[#7000FF] bg-[#7000FF]/10"
          >
            {sector.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
};