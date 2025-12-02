/**
 * Optimized Tool Loading Animation
 * 
 * GPU-accelerated cinematic tool loading with memory-efficient particle system
 * and adaptive quality based on device capabilities
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  detectDeviceCapabilities,
  OptimizedParticleSystem,
  ElementPool,
  globalAnimationScheduler,
  animationPerformanceMonitor,
  type DeviceCapabilities
} from '@/utils/animationUtils';

interface OptimizedToolLoadingProps {
  isActive: boolean;
  tools: string[];
  onComplete?: () => void;
}

const TOOL_ICONS = {
  calculator: '🧮',
  wrench: '🔧',
  plane: '✈️',
  database: '🗄️',
  shield: '🛡️',
  search: '🔍',
  chart: '📊',
  clock: '🕒',
  zap: '⚡',
  settings: '⚙️',
  globe: '🌐',
  bot: '🤖',
  radio: '📻',
  server: '🖥️',
  wallet: '💳',
  mic: '🎤',
  barChart: '📈',
  layers: '📚',
  lock: '🔒'
};

const ORBIT_RADIUS = 40; // pixels
const ORBIT_SPEED = 0.02; // radians per frame
const MAX_PARTICLES = 30; // Reduced from 20 for better performance
const LOADING_DURATION = 3000; // 3 seconds

export const OptimizedToolLoading: React.FC<OptimizedToolLoadingProps> = ({ 
  isActive, 
  tools, 
  onComplete 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleSystemRef = useRef<OptimizedParticleSystem | null>(null);
  const toolElementsRef = useRef<Array<{ element: HTMLElement; angle: number; distance: number }>>([]);
  const deviceCapsRef = useRef<DeviceCapabilities | null>(null);
  const animationIdRef = useRef<string | null>(null);

  // Initialize with performance monitoring
  useEffect(() => {
    if (!isActive || tools.length === 0) return;

    const deviceCaps = detectDeviceCapabilities();
    deviceCapsRef.current = deviceCaps;
    
    // Start performance monitoring
    animationPerformanceMonitor.startMonitoring();
    
    // Initialize particle system
    particleSystemRef.current = new OptimizedParticleSystem(
      containerRef.current!,
      MAX_PARTICLES
    );
    
    // Create tool elements
    createToolElements(tools, deviceCaps);
    
    // Create orbiting particles
    createOrbitingParticles(deviceCaps);
    
    // Add to global scheduler
    const animationId = `tool-loading-${Date.now()}`;
    animationIdRef.current = animationId;
    
    const animate = () => {
      if (toolElementsRef.current.length === 0) return;
      
      // Rotate tools around center
      toolElementsRef.current.forEach((tool, index) => {
        tool.angle += ORBIT_SPEED;
        const x = Math.cos(tool.angle) * tool.distance;
        const y = Math.sin(tool.angle) * tool.distance;
        
        // Apply GPU-accelerated transform
        if (deviceCaps.gpuAcceleration) {
          tool.element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate3d(0, 0, ${tool.angle * 180 / Math.PI}deg)`;
        } else {
          tool.element.style.left = `${50 + x}%`;
          tool.element.style.top = `${50 + y}%`;
          tool.element.style.transform = `rotate(${tool.angle * 180 / Math.PI}deg)`;
        }
      });
      
      globalAnimationScheduler.add(animate);
    };
    
    animate();
    
    // Schedule completion
    const completionTimeout = setTimeout(() => {
      cleanup();
      onComplete?.();
    }, LOADING_DURATION);
    
    const cleanup = useCallback(() => {
      clearTimeout(completionTimeout);
      globalAnimationScheduler.remove(animate);
      
      // Clean up tool elements
      toolElementsRef.current.forEach(tool => {
        if (tool.element.parentNode) {
          tool.element.parentNode.removeChild(tool.element);
        }
      });
      
      particleSystemRef.current?.cleanup();
      animationPerformanceMonitor.stopMonitoring();
    }, []);

    return () => {
      cleanup();
    };
  }, [isActive, tools, onComplete]);

  const createToolElements = useCallback((tools: string[], deviceCaps: DeviceCapabilities) => {
    if (!containerRef.current) return;
    
    const quality = deviceCaps.preferredQuality;
    const toolSize = quality === 'high' ? '3xl' : quality === 'medium' ? '2xl' : 'xl';
    
    tools.forEach((tool, index) => {
      const element = document.createElement('div');
      element.textContent = TOOL_ICONS[tool as keyof typeof TOOL_ICONS] || '🔧';
      element.className = `text-${toolSize} absolute transition-all duration-300`;
      element.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        margin-left: -12px;
        margin-top: -12px;
        z-index: 1001;
        ${deviceCaps.gpuAcceleration ? `
          transform: translate3d(-50%, -50%, 0);
          will-change: transform;
          backface-visibility: hidden;
        ` : `
          transform: translate(-50%, -50%);
        `}
        opacity: 0;
        transition: opacity 0.5s ease-out;
      `;
      
      containerRef.current!.appendChild(element);
      
      // Calculate initial position in orbit
      const angle = (index / tools.length) * Math.PI * 2;
      const distance = ORBIT_RADIUS * (0.8 + Math.random() * 0.4); // Vary distance
      
      toolElementsRef.current.push({
        element,
        angle,
        distance
      });
      
      // Fade in tool
      setTimeout(() => {
        element.style.opacity = '1';
      }, index * 100);
    });
  }, []);

  const createOrbitingParticles = useCallback((deviceCaps: DeviceCapabilities) => {
    if (!particleSystemRef.current) return;
    
    const quality = deviceCaps.preferredQuality;
    const particleCount = quality === 'high' ? MAX_PARTICLES : 
                         quality === 'medium' ? Math.floor(MAX_PARTICLES * 0.7) : 
                         Math.floor(MAX_PARTICLES * 0.5);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = ORBIT_RADIUS * (0.7 + Math.random() * 0.6);
      
      particleSystemRef.current.addParticle({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: Math.cos(angle + Math.PI / 2) * 0.5,
        vy: Math.sin(angle + Math.PI / 2) * 0.5,
        life: 100 + Math.random() * 50,
        className: 'w-1 h-1 bg-blue-400 rounded-full',
        gpuAccelerated: deviceCaps.gpuAcceleration
      });
    }
  }, []);

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
            onAnimationComplete={() => {
              // Cleanup will be handled by useEffect
            }}
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-orange-400 text-4xl font-bold mb-4 animate-pulse">
                  EQUIPPING AGENT
                </div>
                <div className="text-white text-lg mb-2">
                  Loading tools...
                </div>
                <div className="text-gray-400 text-sm">
                  {tools.length} tools being equipped
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OptimizedToolLoading;