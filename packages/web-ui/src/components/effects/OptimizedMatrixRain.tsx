/**
 * Optimized Matrix Rain Effect
 * 
 * GPU-accelerated, memory-efficient implementation for smooth 60fps performance
 * with adaptive quality based on device capabilities
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  detectDeviceCapabilities, 
  OptimizedParticleSystem,
  ElementPool,
  globalAnimationScheduler,
  animationPerformanceMonitor,
  type DeviceCapabilities,
  type AnimationConfig
} from '@/utils/animationUtils';

interface OptimizedMatrixRainProps {
  isActive: boolean;
  onComplete?: () => void;
}

const MATRIX_CHARS = ['0', '1', '日', '本', '文', 'あ', 'ア', '한', '🌟', '📊', '⚖️', '🔨'];
const FALL_SPEED = 2; // pixels per frame
const MAX_DROPS = 100; // Reduced from 50 for better performance

export const OptimizedMatrixRain: React.FC<OptimizedMatrixRainProps> = ({ 
  isActive, 
  onComplete 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleSystemRef = useRef<OptimizedParticleSystem | null>(null);
  const elementPoolRef = useRef<ElementPool | null>(null);
  const deviceCapsRef = useRef<DeviceCapabilities | null>(null);
  const animationIdRef = useRef<string | null>(null);

  // Initialize with performance monitoring
  useEffect(() => {
    if (!isActive) return;

    const deviceCaps = detectDeviceCapabilities();
    deviceCapsRef.current = deviceCaps;
    
    // Adjust particle count based on device capabilities
    const maxDrops = Math.min(
      MAX_DROPS,
      deviceCaps.maxConcurrentAnimations
    );
    
    // Initialize particle system
    particleSystemRef.current = new OptimizedParticleSystem(
      containerRef.current!,
      maxDrops
    );
    
    // Initialize element pool
    elementPoolRef.current = new ElementPool('div', maxDrops * 2);
    
    // Start performance monitoring
    animationPerformanceMonitor.startMonitoring();
    
    // Subscribe to performance updates
    const unsubscribe = animationPerformanceMonitor.subscribe((metrics) => {
      if (metrics.frameRate < 30) {
        console.warn('[Matrix Rain] Performance degraded, reducing quality');
        // Dynamically adjust quality if needed
        if (deviceCaps.preferredQuality !== 'low') {
          deviceCaps.preferredQuality = 'medium';
        }
      }
    });
    
    // Create matrix drops
    createMatrixDrops(maxDrops, deviceCaps);
    
    // Start animation
    particleSystemRef.current.start();
    
    // Set unique animation ID for cleanup
    animationIdRef.current = `matrix-rain-${Date.now()}`;
    
    return () => {
      unsubscribe();
      particleSystemRef.current?.cleanup();
      elementPoolRef.current?.cleanup();
      animationPerformanceMonitor.stopMonitoring();
    };
  }, [isActive]);

  const createMatrixDrops = useCallback((maxDrops: number, deviceCaps: DeviceCapabilities) => {
    if (!containerRef.current || !particleSystemRef.current || !elementPoolRef.current) return;
    
    const quality = deviceCaps.preferredQuality;
    const dropInterval = quality === 'high' ? 3 : quality === 'medium' ? 5 : 8;
    
    for (let i = 0; i < maxDrops; i++) {
      setTimeout(() => {
        const element = elementPoolRef.current!.acquire();
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        
        element.textContent = char;
        element.style.cssText = `
          position: fixed;
          left: ${Math.random() * 100}%;
          top: -20px;
          font-family: 'Courier New, monospace';
          font-size: ${quality === 'high' ? '20px' : quality === 'medium' ? '16px' : '12px'};
          color: #00ff41;
          text-shadow: 0 0 10px #00ff41;
          opacity: 0;
          pointer-events: none;
          z-index: 1000;
          ${deviceCaps.gpuAcceleration ? `
            transform: translate3d(0, 0, 0);
            will-change: transform;
            backface-visibility: hidden;
          ` : ''}
        `;
        
        containerRef.current!.appendChild(element);
        
        // Add to particle system
        particleSystemRef.current!.addParticle({
          x: parseFloat(element.style.left),
          y: -20,
          vy: FALL_SPEED,
          life: Math.ceil((window.innerHeight + 40) / FALL_SPEED),
          className: 'matrix-drop',
          gpuAccelerated: deviceCaps.gpuAcceleration,
          innerHTML: char
        });
      }, i * dropInterval);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (animationIdRef.current) {
      globalAnimationScheduler.remove(animationIdRef.current);
      animationIdRef.current = null;
    }
    
    particleSystemRef.current?.cleanup();
    elementPoolRef.current?.cleanup();
  }, []);

  // Handle completion
  useEffect(() => {
    if (isActive && particleSystemRef.current) {
      const checkCompletion = () => {
        if (particleSystemRef.current!.getParticleCount() === 0) {
          onComplete?.();
        } else {
          setTimeout(checkCompletion, 1000);
        }
      };
      
      const timeoutId = setTimeout(checkCompletion, 20000); // Max 20 seconds
      return () => clearTimeout(timeoutId);
    }
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
              <div className="text-green-400 text-6xl font-bold animate-pulse">
                SOUL INJECTION ACTIVE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OptimizedMatrixRain;