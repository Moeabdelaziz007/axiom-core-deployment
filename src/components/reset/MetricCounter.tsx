'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { MetricCounterProps } from '@/types/reset';

export const MetricCounter: React.FC<MetricCounterProps> = ({
  value,
  label,
  suffix = '',
  prefix = '',
  animationDuration = 2,
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: animationDuration,
      ease: 'easeOut',
    });

    const unsubscribe = rounded.on('change', (latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded, animationDuration]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-5xl md:text-6xl font-orbitron font-bold text-[#39FF14] text-glow-green"
      >
        {prefix}{displayValue}{suffix}
      </motion.div>
      <p className="text-sm md:text-base text-white/70 font-medium">
        {label}
      </p>
    </div>
  );
};