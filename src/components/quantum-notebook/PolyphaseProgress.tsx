"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AgentPhase {
    id: string;
    name: string;
    status: "pending" | "active" | "completed";
    progress: number; // 0 to 100
    color: string;
}

interface PolyphaseProgressProps {
    phases: AgentPhase[];
    className?: string;
}

export const PolyphaseProgress: React.FC<PolyphaseProgressProps> = ({
    phases,
    className,
}) => {
    return (
        <div className={cn("w-full space-y-4 p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md", className)}>
            <h3 className="text-sm font-mono text-cyan-400/80 uppercase tracking-widest mb-6">
                Quantum Polyphase Execution
            </h3>

            <div className="relative space-y-6">
                {phases.map((phase, index) => (
                    <div key={phase.id} className="relative">
                        {/* Agent Label & Status */}
                        <div className="flex justify-between items-center mb-2 text-xs font-mono">
                            <span className={cn(
                                "transition-colors duration-300",
                                phase.status === "active" ? "text-white font-bold" : "text-gray-500"
                            )}>
                                {phase.name}
                            </span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full",
                                phase.status === "active" && "bg-cyan-500/20 text-cyan-300 animate-pulse",
                                phase.status === "completed" && "text-green-400",
                                phase.status === "pending" && "text-gray-600"
                            )}>
                                {phase.status === "active" ? "RESONATING..." : phase.status}
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-2 w-full bg-gray-900/50 rounded-full overflow-hidden relative">
                            {/* Background Glow for Active Phase */}
                            {phase.status === "active" && (
                                <motion.div
                                    layoutId="activeGlow"
                                    className="absolute inset-0 bg-cyan-500/20 blur-md"
                                    transition={{ duration: 0.5 }}
                                />
                            )}

                            {/* Actual Progress Bar */}
                            <motion.div
                                className={cn(
                                    "h-full rounded-full relative z-10",
                                    phase.color
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${phase.progress}%` }}
                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                            >
                                {/* Leading Edge Glow (Tesla Spark Effect) */}
                                {phase.status === "active" && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-white blur-[2px] shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" />
                                )}
                            </motion.div>
                        </div>

                        {/* Polyphase Overlap Indicator (Visual connection to next phase) */}
                        {index < phases.length - 1 && (
                            <div className="absolute left-4 -bottom-4 w-0.5 h-4 bg-gradient-to-b from-gray-800 to-transparent z-0" />
                        )}
                    </div>
                ))}
            </div>

            {/* Resonance Metric (PsySafe) */}
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-gray-500">CoT Resonance</span>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-gray-900 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 to-green-500"
                            initial={{ width: "95%" }}
                            animate={{
                                width: ["94%", "96%", "95%"],
                                opacity: [0.8, 1, 0.8]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    </div>
                    <span className="text-xs font-mono text-green-400">0.95</span>
                </div>
            </div>
        </div>
    );
};
