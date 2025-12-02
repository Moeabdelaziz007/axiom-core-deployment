/**
 * Tool Loading Animation
 * Cinematic tool loading effect for agent equipping stage
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolLoadingProps {
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

export const ToolLoading: React.FC<ToolLoadingProps> = ({ isActive, tools, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Create floating tools
    const toolElements = tools.map((tool, index) => {
      const element = document.createElement('div');
      element.innerHTML = TOOL_ICONS[tool as keyof typeof TOOL_ICONS] || '🔧';
      element.className = 'absolute text-2xl animate-bounce';
      element.style.cssText = `
        position: absolute;
        left: ${20 + (index % 3) * 30}%;
        top: ${20 + Math.floor(index / 3) * 30}%;
        animation: bounce 1s infinite;
        animation-delay: ${index * 0.1}s;
        z-index: 1000;
      `;
      
      container.appendChild(element);
      
      // Animate to final position
      setTimeout(() => {
        element.style.cssText = `
          left: ${50 + (index % 2) * 20}%;
          top: ${50 + Math.floor(index / 2) * 20}%;
          transform: scale(1) rotate(360deg);
          opacity: 1;
        `;
      }, 500 + index * 100);
      
      // Fade out
      setTimeout(() => {
        element.style.opacity = '0';
      }, 2000);
      
      // Remove
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 2500);
    });

    // Create orbiting particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse';
      particle.style.cssText = `
        left: ${50 + Math.cos(i * Math.PI * 2 / 20) * 40}%;
        top: ${50 + Math.sin(i * Math.PI * 2 / 20) * 40}%;
        animation: orbit ${10 + i * 0.5}s linear infinite;
        z-index: ${100 - i};
      `;
      
      container.appendChild(particle);
    }

    // Create central glow effect
    const glow = document.createElement('div');
    glow.className = 'absolute inset-0 flex items-center justify-center pointer-events-none';
    glow.innerHTML = `
      <div class="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full animate-pulse opacity-20"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-400 rounded-full animate-ping opacity-10"></div>
    `;
    glow.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 50;
    `;
    
    container.appendChild(glow);

    // Trigger completion callback
    setTimeout(() => {
      onComplete?.();
    }, tools.length * 300 + 2000);

    // Cleanup
    return () => {
      const particles = container.querySelectorAll('.bg-blue-400');
      const glowElements = container.querySelectorAll('.bg-gradient-to-r');
      
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      
      glowElements.forEach(glow => {
        if (glow.parentNode) {
          glow.parentNode.removeChild(glow);
        }
      });
    };
  }, [isActive, tools, onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          >
            {/* Loading text */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-white text-center">
                <div className="text-lg font-bold mb-2">Equipping Agent</div>
                <div className="text-sm text-gray-300">Loading tools...</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};