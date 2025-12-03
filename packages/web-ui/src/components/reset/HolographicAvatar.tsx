'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HolographicAvatarProps {
    icon: LucideIcon;
    color: string; // e.g., 'cyan', 'orange', 'green'
    size?: 'sm' | 'md' | 'lg';
}

export const HolographicAvatar: React.FC<HolographicAvatarProps> = ({
    icon: Icon,
    color,
    size = 'md'
}) => {
    const colorMap: Record<string, string> = {
        cyan: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10 shadow-cyan-500/50',
        purple: 'text-purple-400 border-purple-500/50 bg-purple-500/10 shadow-purple-500/50',
        blue: 'text-blue-400 border-blue-500/50 bg-blue-500/10 shadow-blue-500/50',
        pink: 'text-pink-400 border-pink-500/50 bg-pink-500/10 shadow-pink-500/50',
    };

    const sizeMap = {
        sm: 'w-16 h-16',
        md: 'w-32 h-32',
        lg: 'w-48 h-48',
    };

    const iconSizeMap = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
    };

    const themeClass = colorMap[color] || colorMap.cyan;

    return (
        <div className="relative flex items-center justify-center">
            {/* Holographic Base Ring */}
            <motion.div
                animate={{ rotateX: [60, 60], rotateZ: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className={cn(
                    "absolute -bottom-4 w-full h-full rounded-full border-2 border-dashed opacity-30",
                    themeClass.split(' ')[1] // Get border color
                )}
                style={{ transform: 'perspective(500px) rotateX(60deg)' }}
            />

            {/* Main Avatar Container */}
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={cn(
                    "relative rounded-full flex items-center justify-center backdrop-blur-md border-2",
                    sizeMap[size],
                    themeClass
                )}
            >
                {/* Inner Glow */}
                <div className={cn(
                    "absolute inset-0 rounded-full opacity-50 animate-pulse",
                    themeClass.split(' ')[2] // Get bg color
                )} />

                {/* Scanline Effect */}
                <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
                    <div className="w-full h-[200%] bg-gradient-to-b from-transparent via-white/20 to-transparent animate-scan" />
                </div>

                {/* Icon */}
                <Icon className={cn("relative z-10", iconSizeMap[size])} />

                {/* Particles */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={cn("absolute w-1 h-1 rounded-full", themeClass.split(' ')[0])}
                        animate={{
                            x: [0, (Math.random() - 0.5) * 100],
                            y: [0, (Math.random() - 0.5) * 100],
                            opacity: [1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
};
