'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AgentBenefitProps } from '@/types/reset';

export const BenefitCard: React.FC<AgentBenefitProps> = ({
  title,
  description,
  icon: Icon,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className={cn(
        'relative h-full p-6',
        'bg-[#0F111A]/60 backdrop-blur-[20px]',
        'border border-white/10 rounded-xl',
        'transition-all duration-300',
        'hover:border-[#39FF14]/50',
        'hover:shadow-[0_0_25px_rgba(57,255,20,0.3)]',
        'group'
      )}>
        {/* Icon */}
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-[#39FF14]/20 to-[#00F0FF]/20 border border-[#39FF14]/30 w-fit group-hover:scale-110 transition-transform">
          <Icon className="w-8 h-8 text-[#39FF14]" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-orbitron font-bold text-white mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/60 leading-relaxed">
          {description}
        </p>
      </Card>
    </motion.div>
  );
};