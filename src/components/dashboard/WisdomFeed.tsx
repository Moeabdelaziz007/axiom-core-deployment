"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface WisdomEntry {
    id: string;
    type: 'raqib' | 'atid'; // Success or Error
    timestamp: Date;
    message: string;
    wisdom?: string;
}

interface WisdomFeedProps {
    entries?: WisdomEntry[];
    autoScroll?: boolean;
}

export const WisdomFeed: React.FC<WisdomFeedProps> = ({
    entries = [],
    autoScroll = true
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayEntries, setDisplayEntries] = useState<WisdomEntry[]>([]);

    // Sample data if no entries provided
    useEffect(() => {
        if (entries.length === 0) {
            setDisplayEntries([
                {
                    id: '1',
                    type: 'raqib',
                    timestamp: new Date(),
                    message: 'Resource allocation completed successfully',
                    wisdom: 'The system maintained topological integrity (Entropy: 0.65), reflecting Ihsan.'
                },
                {
                    id: '2',
                    type: 'atid',
                    timestamp: new Date(),
                    message: 'Packet Loss - Sector 7 Disconnect',
                    wisdom: 'Topological disconnect detected. Lesson: Increase connectivity to prevent isolation.'
                },
                {
                    id: '3',
                    type: 'raqib',
                    timestamp: new Date(),
                    message: 'Agent swarm reached consensus',
                    wisdom: 'Fractal topology preserved. Small-world property maintained resilience.'
                }
            ]);
        } else {
            setDisplayEntries(entries);
        }
    }, [entries]);

    // Auto-scroll through entries
    useEffect(() => {
        if (!autoScroll || displayEntries.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayEntries.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [autoScroll, displayEntries.length]);

    const currentEntry = displayEntries[currentIndex];

    if (!currentEntry) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm">
                [Awaiting wisdom...]
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 overflow-hidden">

            {/* Background Glow */}
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none"
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 z-10 relative">
                <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-orbitron text-purple-100 tracking-wider">SCROLLS OF WISDOM</h3>
                </div>
                <div className="flex items-center space-x-1">
                    {displayEntries.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-purple-400 w-3' : 'bg-gray-600'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Wisdom Entry */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentEntry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3 relative z-10"
                >
                    {/* Source Badge */}
                    <div className="flex items-center space-x-2">
                        {currentEntry.type === 'raqib' ? (
                            <>
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-mono text-emerald-400 tracking-widest">RAQIB</span>
                                <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-mono text-amber-400 tracking-widest">ATID</span>
                            </>
                        )}
                        <span className="text-[10px] text-gray-500 ml-auto">
                            {currentEntry.timestamp.toLocaleTimeString()}
                        </span>
                    </div>

                    {/* Message */}
                    <div className={`p-3 rounded-lg border ${currentEntry.type === 'raqib'
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-amber-500/5 border-amber-500/20'
                        }`}>
                        <p className="text-sm text-gray-200 leading-relaxed">
                            <span className={`font-bold ${currentEntry.type === 'raqib' ? 'text-emerald-300' : 'text-amber-300'
                                }`}>
                                Event:
                            </span>{' '}
                            {currentEntry.message}
                        </p>
                    </div>

                    {/* Wisdom */}
                    {currentEntry.wisdom && (
                        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <p className="text-xs text-purple-200 leading-relaxed italic">
                                <span className="text-purple-300 font-bold not-italic">Wisdom:</span>{' '}
                                {currentEntry.wisdom}
                            </p>
                        </div>
                    )}

                    {/* Scroll Progress Bar */}
                    <div className="h-0.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full ${currentEntry.type === 'raqib' ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Count Badge */}
            <div className="absolute bottom-2 right-2 text-[10px] text-gray-600 font-mono">
                {currentIndex + 1}/{displayEntries.length}
            </div>
        </div>
    );
};
