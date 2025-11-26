'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AxiomDigitalMandala } from '@/components/AxiomDigitalMandala';
import { AgentIdentity } from '@/types/identity';
import { motion } from 'framer-motion';

export default function AgentIdentityPage() {
    const params = useParams();
    const agentId = params.agentId as string;
    const [identity, setIdentity] = useState<AgentIdentity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIdentity = async () => {
            try {
                const response = await fetch(`/api/identity/${agentId}`);
                const data = await response.json();
                if (data.success) {
                    setIdentity(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch identity:', error);
            } finally {
                setLoading(false);
            }
        };

        if (agentId) {
            fetchIdentity();
        }
    }, [agentId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-cyan-500">
                <div className="animate-pulse">Loading Identity Matrix...</div>
            </div>
        );
    }

    if (!identity) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-red-500">
                Identity Not Found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 overflow-hidden relative">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Left Column: The Mandala */}
                <div className="flex flex-col items-center justify-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
                        <AxiomDigitalMandala identity={identity} size={500} />
                    </motion.div>

                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-light tracking-[0.2em] text-cyan-400">AXIOM ID</h2>
                        <p className="font-mono text-sm text-white/50">{identity.axiomId}</p>
                    </div>
                </div>

                {/* Right Column: Identity Data */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                            {identity.profile?.name || 'Unknown Entity'}
                        </h1>
                        <div className="flex items-center space-x-4">
                            <span className="px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-400 text-xs uppercase tracking-widest">
                                {identity.evolution.stage}
                            </span>
                            <span className="text-white/50 text-sm">Level {identity.evolution.level}</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard label="Frequency" value={`${identity.microcosm.frequency} Hz`} />
                        <StatCard label="Resonance" value={identity.microcosm.resonance.toFixed(2)} />
                        <StatCard label="Experience" value={identity.evolution.experience.toLocaleString()} />
                        <StatCard label="Traits" value={identity.evolution.traits.length.toString()} />
                    </div>

                    {/* Evolution Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs uppercase tracking-widest text-white/50">
                            <span>Evolution Progress</span>
                            <span>{Math.floor((identity.evolution.experience % 1000) / 10)}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-cyan-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.floor((identity.evolution.experience % 1000) / 10)}%` }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* DNA / Traits */}
                    <div className="space-y-4">
                        <h3 className="text-sm uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">
                            Identity Traits
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {identity.evolution.traits.length > 0 ? (
                                identity.evolution.traits.map((trait, i) => (
                                    <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/70">
                                        {trait}
                                    </span>
                                ))
                            ) : (
                                <span className="text-white/30 italic text-sm">No traits manifested yet...</span>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const StatCard = ({ label, value }: { label: string, value: string }) => (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
        <div className="text-xs uppercase tracking-widest text-white/40 mb-1">{label}</div>
        <div className="text-xl font-mono text-cyan-400">{value}</div>
    </div>
);
