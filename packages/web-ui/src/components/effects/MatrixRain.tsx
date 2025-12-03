'use client';
/**
 * Matrix - style text rain effect for Soul injection
 * Creates falling green characters like in The Matrix
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatrixRainProps {
  isActive: boolean;
  onComplete?: () => void;
}

const MATRIX_CHARS = ['0', '1', '日', '本', '文', 'あ', 'ア', '한', '🌟', '📊', '⚖️', '🔨'];
const FALL_DURATION = 3;
const CHAR_SIZE = 20;

export const MatrixRain: React.FC<MatrixRainProps> = ({ isActive, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const columns = Math.floor(window.innerWidth / 100);
    const drops: Array<{ id: number; char: string; x: number; y: number; delay: number }> = [];

    // Create initial drops
    for (let i = 0; i < 50; i++) {
      drops.push({
        id: i,
        char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
        x: Math.random() * 100,
        y: -20,
        delay: Math.random() * 2,
      });
    }

    const animationDuration = FALL_DURATION * 1000; // 3 seconds

    // Animate drops falling
    drops.forEach((dropItem, index) => {
      const drop = document.createElement('div');
      drop.textContent = dropItem.char;
      drop.style.cssText = `
        position: fixed;
        left: ${dropItem.x}%;
        top: ${dropItem.y}px;
        font-family: 'Courier New, monospace';
        font-size: ${CHAR_SIZE}px;
        color: #00ff41;
        text-shadow: 0 0 10px #00ff41;
        opacity: 0;
        pointer-events: none;
        z-index: 1000;
      `;

      document.body.appendChild(drop);

      // Animate falling
      setTimeout(() => {
        drop.style.transition = `all ${FALL_DURATION}s linear`;
        drop.style.opacity = '1';
        drop.style.transform = `translateY(${window.innerHeight + 100}px)`;
      }, dropItem.delay * 1000);

      // Remove after animation
      setTimeout(() => {
        if (drop.parentNode) {
          drop.parentNode.removeChild(drop);
        }
      }, (dropItem.delay * 1000) + animationDuration);
    });

    // Cleanup
    return () => {
      drops.forEach(dropItem => {
        const element = document.querySelector(`[data-matrix-drop="${dropItem.id}"]`);
        if (element) {
          element.remove();
        }
      });
    };
  }, [isActive]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" style={{ zIndex: 9999 }}>
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onAnimationComplete={onComplete}
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-green-400 text-6xl font-bold animate-pulse">
                {/* SOUL INJECTION ACTIVE */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};