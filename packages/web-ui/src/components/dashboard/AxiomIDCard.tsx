'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Scale, CheckCircle } from 'lucide-react';

interface AxiomIDCardProps {
    agentName: string;
    agentClass: string;
    origin: string;
    idHash: string;
    imageUrl?: string;
}

export const AxiomIDCard: React.FC<AxiomIDCardProps> = ({
    agentName = "TAJER (تاجر)",
    agentClass = "Merchant Bot / Level 5",
    origin = "Cairo, Egypt (Masri Dialect)",
    idHash = "0x7f9a...b2c4",
    imageUrl = "/agents/tajer.jpg" // Placeholder
}) => {
    return (
        <div className="relative w-[400px] h-[250px] group perspective-1000">
            {/* Holographic Container */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.2)] group-hover:shadow-[0_0_50px_rgba(0,243,255,0.4)] transition-all duration-500">

                {/* Scanlines & Glare */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.05)_50%)] bg-[size:100%_4px] pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none z-10" />

                {/* Header */}
                <div className="flex items-center justify-center gap-3 py-3 border-b border-cyan-500/30 bg-black/50 relative z-20">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                        <span className="font-bold text-cyan-400 text-lg">A</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-widest font-display">AXIOM ID</h3>
                        <p className="text-[0.6rem] text-cyan-400 uppercase tracking-wider">Sovereign Digital Soul // AIX Standard</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-3 gap-4 p-4 relative z-20">
                    {/* Portrait */}
                    <div className="col-span-1">
                        <div className="w-full h-24 rounded-lg bg-cyan-900/20 border border-cyan-500/30 overflow-hidden relative">
                            {/* Placeholder for Agent Image */}
                            <div className="absolute inset-0 flex items-center justify-center text-cyan-700">
                                <Shield className="w-8 h-8 opacity-50" />
                            </div>
                            {/* Scanline overlay on image */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,255,255,0.2),transparent)] animate-scanline" />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="col-span-2 space-y-2">
                        <div className="flex justify-between border-b border-cyan-500/20 pb-1">
                            <span className="text-[0.6rem] text-cyan-600 uppercase">AGENT NAME:</span>
                            <span className="text-xs text-white font-bold">{agentName}</span>
                        </div>
                        <div className="flex justify-between border-b border-cyan-500/20 pb-1">
                            <span className="text-[0.6rem] text-cyan-600 uppercase">CLASS:</span>
                            <span className="text-xs text-cyan-100">{agentClass}</span>
                        </div>
                        <div className="flex justify-between border-b border-cyan-500/20 pb-1">
                            <span className="text-[0.6rem] text-cyan-600 uppercase">ORIGIN:</span>
                            <span className="text-xs text-cyan-100">{origin}</span>
                        </div>
                        <div className="flex justify-between border-b border-cyan-500/20 pb-1">
                            <span className="text-[0.6rem] text-cyan-600 uppercase">ID HASH:</span>
                            <span className="text-xs text-cyan-400 font-mono">{idHash}</span>
                        </div>
                    </div>
                </div>

                {/* Capabilities */}
                <div className="px-4 pb-2 relative z-20">
                    <p className="text-[0.6rem] text-cyan-600 uppercase mb-1">ACTIVE CAPABILITIES</p>
                    <div className="flex gap-2">
                        {[
                            { icon: Shield, label: "Localized Dialect Engine" },
                            { icon: Zap, label: "Solana Pay Terminal" },
                            { icon: Scale, label: "Mizan Risk Guardrail" }
                        ].map((cap, i) => (
                            <div key={i} className="flex-1 bg-cyan-900/20 border border-cyan-500/30 rounded p-1 flex flex-col items-center gap-1">
                                <cap.icon className="w-3 h-3 text-cyan-400" />
                                <span className="text-[0.5rem] text-cyan-200 text-center leading-tight">{cap.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 w-full py-1 bg-cyan-950/50 border-t border-cyan-500/30 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" />
                    <span className="text-[0.6rem] text-green-400 font-bold tracking-wider">STATUS: VERIFIED ACTIVE // AIX INTEGRITY CHECK PASSED</span>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-8 border-l-2 border-t-2 border-cyan-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-2 h-8 border-r-2 border-t-2 border-cyan-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-2 h-8 border-l-2 border-b-2 border-cyan-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-2 h-8 border-r-2 border-b-2 border-cyan-400 rounded-br-lg" />

            </div>
        </div>
    );
};
