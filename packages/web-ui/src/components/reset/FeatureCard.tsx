'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FeatureCardProps } from '@/types/reset';

const TYPE_COLORS = {
  SHIFT: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:border-cyan-400/50', // Cyan
  FUEL: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:border-pink-500/50', // Pink
  DROP: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:border-green-500/50', // Green
  SCAN: 'hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:border-yellow-500/50', // Yellow
  SOFRA: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-purple-500/50', // Purple
  TAJER: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-500/50', // Blue
  'DR. MOE': 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-purple-500/50', // Purple
};

const ICON_COLORS = {
  SHIFT: 'text-cyan-400',
  FUEL: 'text-pink-500',
  DROP: 'text-green-500',
  SCAN: 'text-yellow-500',
  SOFRA: 'text-purple-500',
  TAJER: 'text-blue-500',
  'DR. MOE': 'text-purple-500',
};

const BG_GRADIENTS = {
  SHIFT: 'from-cyan-500/20 to-blue-500/20',
  FUEL: 'from-pink-500/20 to-purple-500/20',
  DROP: 'from-green-500/20 to-emerald-500/20',
  SCAN: 'from-yellow-500/20 to-orange-500/20',
  SOFRA: 'from-purple-500/20 to-pink-500/20',
  TAJER: 'from-blue-500/20 to-cyan-500/20',
  'DR. MOE': 'from-purple-500/20 to-indigo-500/20',
};

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
        'relative h-full p-6 bg-white/5 backdrop-blur-xl',
        'border border-white/10 rounded-2xl overflow-hidden',
        'transition-all duration-500',
        TYPE_COLORS[type] || 'hover:border-white/30'
      )}>
        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className={cn(
            "p-4 rounded-xl bg-gradient-to-br border border-white/10",
            BG_GRADIENTS[type]
          )}>
            <Icon className={cn("w-10 h-10", ICON_COLORS[type])} />
          </div>

          {/* Title */}
          <h3 className={cn("text-2xl font-orbitron font-bold tracking-wider", ICON_COLORS[type])}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-300 leading-relaxed font-light">
            {description}
          </p>

          {/* Badge */}
          <Badge
            variant="outline"
            className={cn(
              "border-white/10 bg-white/5 tracking-widest",
              ICON_COLORS[type]
            )}
          >
            {type}
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
};