'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FeatureCardProps } from '@/types/reset';

export const FeatureCard: React.FC<FeatureCardProps> = ({
  type,
  title,
  description,
  icon: Icon,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="h-full"
    >
      <Card className={cn(
        'relative h-full p-6 bg-[#0F111A]/60 backdrop-blur-[20px]',
        'border border-[#9D4EDD]/30 rounded-2xl overflow-hidden',
        'transition-all duration-300',
        'hover:border-[#00F0FF]/40 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]'
      )}>
        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`
        }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#00F0FF]/20 to-[#7000FF]/20 border border-[#00F0FF]/30">
            <Icon className="w-12 h-12 text-[#00F0FF]" />
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-orbitron font-bold text-[#00F0FF] tracking-wider">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-white/60 leading-relaxed">
            {description}
          </p>
          
          {/* Badge */}
          <Badge 
            variant="outline" 
            className="border-[#39FF14]/30 text-[#39FF14] bg-[#39FF14]/10"
          >
            {type}
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
};