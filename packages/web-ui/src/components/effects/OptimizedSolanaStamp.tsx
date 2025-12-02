/**
 * Optimized Solana Stamp Effect
 * 
 * GPU-accelerated 3D rotation and scaling with memory optimization
 * and adaptive quality based on device capabilities
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  detectDeviceCapabilities,
  createOptimizedAnimation,
  globalAnimationScheduler,
  animationPerformanceMonitor,
  type DeviceCapabilities,
  type AnimationConfig
} from '@/utils/animationUtils';

interface OptimizedSolanaStampProps {
  isActive: boolean;
  onComplete?: () => void;
}

const STAMP_DURATION = 2000; // 2 seconds
const ROTATION_DEGREES = 720; // 2 full rotations

export const OptimizedSolanaStamp: React.FC<OptimizedSolanaStampProps> = ({ 
  isActive, 
  onComplete 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const deviceCapsRef = useRef<DeviceCapabilities | null>(null);
  const animationRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  // Initialize with performance monitoring
  useEffect(() => {
    if (!isActive) return;

    const deviceCaps = detectDeviceCapabilities();
    deviceCapsRef.current = deviceCaps;
    
    // Start performance monitoring
    animationPerformanceMonitor.startMonitoring();
    
    // Create stamp element with GPU acceleration
    const stamp = document.createElement('div');
    stamp.innerHTML = `
      <svg viewBox="0 0 100 100" width="100" height="100" style="display: block;">
        <defs>
          <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#14F195;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#512BD4;stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="glow"/>
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="glow"/>
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
    
    // Apply optimized styles
    stamp.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      margin-left: -50px;
      margin-top: -50px;
      z-index: 10000;
      pointer-events: none;
      ${deviceCaps.gpuAcceleration ? `
        transform: translate3d(-50%, -50%, 0) scale(0);
        will-change: transform;
        backface-visibility: hidden;
        perspective: 1000px;
      ` : `
        transform: translate(-50%, -50%) scale(0);
      `}
      opacity: 0;
      transition: none;
    `;
    
    stampRef.current = stamp;
    containerRef.current?.appendChild(stamp);
    
    // Create optimized animation
    const animation = createOptimizedAnimation(stamp, [
      { transform: 'translate3d(-50%, -50%, 0) scale(0)', opacity: 0 },
      { transform: `translate3d(-50%, -50%, 0) scale(1.5) rotate3d(0, 0, ${ROTATION_DEGREES}deg)`, opacity: 1 },
      { transform: `translate3d(-50%, -50%, 0) scale(1.2) rotate3d(0, 0, ${ROTATION_DEGREES}deg)`, opacity: 0.8 },
      { transform: `translate3d(-50%, -50%, 0) scale(0.8) rotate3d(0, 0, ${ROTATION_DEGREES}deg)`, opacity: 0.6 },
      { transform: `translate3d(-50%, -50%, 0) scale(0.5) rotate3d(0, 0, ${ROTATION_DEGREES}deg)`, opacity: 0.3 },
      { transform: `translate3d(-50%, -50%, 0) scale(0.2) rotate3d(0, 0, ${ROTATION_DEGREES}deg)`, opacity: 0 }
    ], {
      duration: STAMP_DURATION,
      easing: 'ease-out',
      gpuAccelerated: deviceCaps.gpuAcceleration,
      quality: deviceCaps.preferredQuality,
      onComplete: () => {
        // Schedule cleanup
        setTimeout(() => {
          cleanup();
          onComplete?.();
        }, 500);
      }
    });
    
    animationRef.current = animation;
    
    // Add to global scheduler for better performance
    const animationId = `solana-stamp-${Date.now()}`;
    globalAnimationScheduler.add(() => {
      animation.start();
    });
    
    const cleanup = useCallback(() => {
      globalAnimationScheduler.remove(() => {
        animation.start();
      });
      
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      if (stampRef.current && stampRef.current.parentNode) {
        stampRef.current.parentNode.removeChild(stampRef.current);
      }
      
      animationPerformanceMonitor.stopMonitoring();
    }, []);
    
    return () => {
      cleanup();
    };
  }, [isActive, onComplete]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-50"
      style={{ zIndex: 9999 }}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onAnimationComplete={cleanup}
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-cyan-400 text-6xl font-bold animate-pulse">
                IDENTITY MINTING ACTIVE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OptimizedSolanaStamp;