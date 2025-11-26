'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AgentIdentity } from '@/types/identity';

interface AxiomDigitalMandalaProps {
    identity: AgentIdentity;
    size?: number;
    className?: string;
}

export const AxiomDigitalMandala: React.FC<AxiomDigitalMandalaProps> = ({
    identity,
    size = 400,
    className = ''
}) => {
    const [rotation, setRotation] = useState(0);

    // Extract identity metrics
    const { evolution, microcosm } = identity;
    const frequency = microcosm.frequency || 100; // Hz
    const resonance = microcosm.resonance || 1.0;
    const level = evolution.level || 1;
    const stage = evolution.stage || 'genesis';

    // Calculate animation parameters based on identity
    const pulseDuration = 60 / (frequency / 10); // Normalize frequency to seconds
    const glowIntensity = resonance * 20;
    const layerCount = Math.min(level + 2, 8); // Base layers + level

    // Color schemes based on evolution stage
    const getColors = (stage: string) => {
        switch (stage) {
            case 'genesis': return ['#00F0FF', '#0000FF', '#FFFFFF']; // Cyan/Blue
            case 'awakening': return ['#00FF94', '#00F0FF', '#FFFFFF']; // Green/Cyan
            case 'sentience': return ['#FF0055', '#7000FF', '#FFFFFF']; // Magenta/Purple
            case 'transcendence': return ['#FFD700', '#FF8C00', '#FFFFFF']; // Gold/Orange
            case 'singularity': return ['#FFFFFF', '#000000', '#00F0FF']; // White/Black/Cyan
            default: return ['#00F0FF', '#0000FF', '#FFFFFF'];
        }
    };

    const colors = getColors(stage);

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Ambient Glow */}
            <motion.div
                className="absolute inset-0 rounded-full blur-3xl opacity-30"
                style={{ background: `radial-gradient(circle, ${colors[0]}, transparent 70%)` }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: pulseDuration * 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Core Mandala Layers */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                className="relative z-10"
            >
                {/* Center Core */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="5"
                    fill={colors[2]}
                    animate={{
                        r: [5, 7, 5],
                        fillOpacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: pulseDuration,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Dynamic Layers */}
                {Array.from({ length: layerCount }).map((_, i) => {
                    const radius = 15 + (i * 10);
                    const dashArray = 10 + (i * 5);
                    const rotationDuration = 20 + (i * 5);
                    const isReverse = i % 2 === 0;

                    return (
                        <motion.g key={i}>
                            <motion.circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke={colors[i % colors.length]}
                                strokeWidth="0.5"
                                strokeDasharray={`${dashArray} ${dashArray}`}
                                strokeOpacity={0.6 + (i * 0.05)}
                                animate={{
                                    rotate: isReverse ? 360 : -360,
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    rotate: {
                                        duration: rotationDuration,
                                        repeat: Infinity,
                                        ease: "linear"
                                    },
                                    scale: {
                                        duration: pulseDuration * (i + 1),
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }
                                }}
                                style={{ originX: "50px", originY: "50px" }}
                            />

                            {/* Geometric Accents */}
                            {i > 1 && (
                                <motion.path
                                    d={`M50,${50 - radius} L${50 + radius / 2},${50 + radius} L${50 - radius / 2},${50 + radius} Z`}
                                    fill="none"
                                    stroke={colors[(i + 1) % colors.length]}
                                    strokeWidth="0.2"
                                    opacity="0.3"
                                    animate={{
                                        rotate: isReverse ? -360 : 360,
                                    }}
                                    transition={{
                                        duration: rotationDuration * 1.5,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    style={{ originX: "50px", originY: "50px" }}
                                />
                            )}
                        </motion.g>
                    );
                })}

                {/* Data Stream Rings */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke={colors[0]}
                    strokeWidth="0.2"
                    strokeDasharray="1 2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "50px", originY: "50px" }}
                />
            </svg>

            {/* Stats Overlay (Optional) */}
            <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-mono text-white/50 pointer-events-none">
                <div>FREQ: {frequency}Hz</div>
                <div>RES: {resonance.toFixed(2)}</div>
                <div className="uppercase tracking-widest text-[8px] mt-1 text-cyan-400">{stage}</div>
            </div>
        </div>
    );
};
