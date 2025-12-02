/**
 * Solana Logo Stamping Effect
 * 3D rotating Solana logo that stamps down during wallet minting
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SolanaStampProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const SolanaStamp: React.FC<SolanaStampProps> = ({ isActive, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Create stamping effect
    const stamp = document.createElement('div');
    stamp.innerHTML = `
      <svg viewBox="0 0 100 100" width="100" height="100" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
        <defs>
          <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#14F195;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#512BD4;stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="glow"/>
            <feMerge>
              <feMergeNode in="glow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#glow)">
          <circle cx="50" cy="50" r="40" fill="none" stroke="url(#solanaGradient)" stroke-width="3"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="url(#solanaGradient)" stroke-width="2" opacity="0.8"/>
          <circle cx="50" cy="50" r="30" fill="none" stroke="url(#solanaGradient)" stroke-width="1" opacity="0.6"/>
          
          <!-- Solana S -->
          <path d="M30 50 L50 20 L70 50" fill="none" stroke="url(#solanaGradient)" stroke-width="4" stroke-linecap="round"/>
          <path d="M30 50 L50 80 L70 50" fill="none" stroke="url(#solanaGradient)" stroke-width="4" stroke-linecap="round"/>
          
          <!-- Inner circle -->
          <circle cx="50" cy="50" r="20" fill="none" stroke="url(#solanaGradient)" stroke-width="2"/>
        </g>
      </svg>
    `;

    stamp.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      z-index: 10000;
      opacity: 0;
      pointer-events: none;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    document.body.appendChild(stamp);

    // Animate stamping
    setTimeout(() => {
      stamp.style.transform = 'translate(-50%, -50%) scale(1.5) rotate(720deg)';
      stamp.style.opacity = '1';
    }, 500);

    // Stamp down animation
    setTimeout(() => {
      stamp.style.transform = 'translate(-50%, -50%) scale(1.2) rotate(720deg)';
      stamp.style.opacity = '0.8';
    }, 800);

    setTimeout(() => {
      stamp.style.transform = 'translate(-50%, -50%) scale(0.8) rotate(720deg)';
      stamp.style.opacity = '0.6';
    }, 1200);

    setTimeout(() => {
      stamp.style.transform = 'translate(-50%, -50%) scale(0.5) rotate(720deg)';
      stamp.style.opacity = '0.3';
    }, 1600);

    setTimeout(() => {
      stamp.style.transform = 'translate(-50%, -50%) scale(0.2) rotate(720deg)';
      stamp.style.opacity = '0';
    }, 2000);

    // Cleanup
    setTimeout(() => {
      if (stamp.parentNode) {
        stamp.parentNode.removeChild(stamp);
      }
      onComplete?.();
    }, 2500);

  }, [isActive]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" style={{ zIndex: 9999 }}>
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {stamp}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};