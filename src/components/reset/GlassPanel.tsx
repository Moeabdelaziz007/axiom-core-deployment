'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'premium';
  hover?: boolean;
  animate?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  animate = false,
}) => {
  const baseClasses = variant === 'premium' 
    ? 'glass-panel-premium' 
    : 'glass-panel';

  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  } : {};

  return (
    <Component
      className={cn(
        baseClasses,
        hover && 'transition-all duration-300',
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  );
};