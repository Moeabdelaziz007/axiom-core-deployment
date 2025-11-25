'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    QuantumCard, NeonButton, StatBar, StatusBadge,
    BrandingFooter, TechBadge, FeatureRow, SynthChart
} from '@/components/AxiomUI';
import {
    Wallet, MessageCircle, Cpu, Shield, Zap,
    Globe, ArrowLeft, Share2, Activity, Lock
} from 'lucide-react';
import Link from 'next/link';

// Mock Data (In production, this comes from ToolLibrary/DB)
const AGENTS: Record<string, any> = {
    'sofra': {
        name: 'Sofra',
        role: 'CX Management System',
        tier: 'Tier 1 ($0.99)',
        status: 'active',
        description: 'Comprehensive Customer Experience manager. Sofra monitors feedback across Facebook and WhatsApp, analyzes sentiment, and automatically drafts responses to turn negative experiences into loyalty opportunities.',
        superpower: 'CX-Auditor Engine',
        stats: {
            savings: 85, // Retention Rate
            accuracy: 98,
            speed: 95
        }
    },
    'mawid': {
        name: 'Mawid',
        role: 'Workflow Optimizer',
        tier: 'Tier 1 ($0.99)',
        status: 'active',
        description: 'Intelligent time architect. Mawid optimizes your entire daily flow, sending multi-channel reminders (WhatsApp/SMS) and restructuring your calendar for maximum deep work efficiency.',
        superpower: 'FlowOptimizer Core',
        stats: {
            savings: 40, // Hours saved/mo
            accuracy: 92,
            speed: 99
        }
    },
    'aqar': {
        name: 'Aqar',
        role: 'Full Rental Unit Management',
        tier: 'Tier 1 ($0.99)',
        status: 'active',
        description: 'Complete autopilot for your rental units. Aqar handles booking coordination, schedules cleaning crews, and manages maintenance requests so you never have to visit the property.',
        superpower: 'UnitManager Protocol',
        stats: {
            savings: 90, // Occupancy Rate
            accuracy: 88,
            speed: 94
        }
    },
    'tajer': {
        name: 'Tajer',
        role: 'E-Commerce Negotiator',
        tier: 'Tier 1 ($0.99)',
        status: 'active',
        description: 'Your tireless sales representative. Tajer engages customers on social media, negotiates prices within your set limits, and automatically generates Paymob or Vodafone Cash payment links to close the sale instantly.',
        superpower: 'Negotiator Protocol',
        stats: {
            savings: 120, // ROI %
            accuracy: 95,
            speed: 99
        }
    }
};

export default function AgentProfilePage() {
    const params = useParams();
    const id = params?.id as string;
    const agent = AGENTS[id] || AGENTS['sofra']; // Fallback to Sofra

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-axiom-cyan/30">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative max-w-5xl mx-auto px-4 py-8 md:py-12">
                {/* Header Nav */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-mono">Back to Fleet</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={agent.status} />
                        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                            <Share2 className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Identity Card */}
                    <div className="md:col-span-1">
                        <QuantumCard glow="cyan" className="h-full flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-axiom-cyan/20 to-axiom-purple/20 border-2 border-axiom-cyan/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                                <span className="text-4xl">🤖</span>
                            </div>
                            <h1 className="text-3xl font-bold font-orbitron mb-2">{agent.name}</h1>
                            <p className="text-axiom-cyan font-mono text-sm mb-4">{agent.role}</p>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-6">
                                {agent.tier}
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                {agent.description}
                            </p>
                            <NeonButton className="w-full">
                                Deploy Agent
                            </NeonButton>
                        </QuantumCard>
                    </div>

                    {/* Stats & Superpower */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        <QuantumCard title="System Vitals" icon={Activity}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="space-y-2">
                                    <StatBar label="Efficiency" value={agent.stats.savings} />
                                    <p className="text-[10px] text-gray-500 text-right">Resource Optimization</p>
                                </div>
                                <div className="space-y-2">
                                    <StatBar label="Accuracy" value={agent.stats.accuracy} />
                                    <p className="text-[10px] text-gray-500 text-right">Model Confidence</p>
                                </div>
                                <div className="space-y-2">
                                    <StatBar label="Latency" value={agent.stats.speed} />
                                    <p className="text-[10px] text-gray-500 text-right">Response Time</p>
                                </div>
                            </div>
                            <div className="h-32">
                                <SynthChart data={[40, 65, 55, 80, 70, 90, 85]} color="#00F0FF" />
                            </div>
                        </QuantumCard>

                        <QuantumCard title="Core Superpower" icon={Zap} glow="purple">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-axiom-purple/10 border border-axiom-purple/30">
                                    <Zap className="w-6 h-6 text-axiom-purple" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{agent.superpower}</h3>
                                    <p className="text-sm text-gray-400 mb-3">
                                        Specialized neural pathway optimized for this specific domain.
                                        Operates with 99.9% uptime on the Axiom Control Fabric.
                                    </p>
                                    <TechBadge label="Zero-Cost Engineering Protocol" />
                                </div>
                            </div>
                        </QuantumCard>
                    </div>
                </div>

                {/* The Premium Experience Protocol (Features) */}
                <h2 className="text-2xl font-orbitron font-bold mb-6 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-axiom-cyan" />
                    Premium Capabilities
                </h2>

                <div className="grid grid-cols-1 gap-4 mb-12">
                    <FeatureRow
                        icon={Wallet}
                        title="DSS Wallet (Digital Sovereign Safe)"
                        value="Owns a dedicated crypto wallet. Can hold assets, NFTs, and execute gasless transactions."
                        tech="pgsodium Encrypted • Solana Keypair"
                    />
                    <FeatureRow
                        icon={MessageCircle}
                        title="A-C-N (Axiom Neural Channel)"
                        value="Direct neural link to your WhatsApp/Email. No app login required for urgent updates."
                        tech="Webhook Relay • End-to-End Encrypted"
                    />
                    <FeatureRow
                        icon={Cpu}
                        title="AX-SYN (Adaptive Synthesis)"
                        value="Smartly routes complex queries to Gemini and simple ones to free Oracle VMs."
                        tech="D-RAG Router • Hybrid Compute"
                    />
                    <FeatureRow
                        icon={Lock}
                        title="AAU (Axiom Audit Unit)"
                        value="Every action is logged in a double-entry ledger. Mathematical proof of work."
                        tech="Immutable Ledger • Audit Trail"
                    />
                </div>

                <BrandingFooter />
            </div>
        </div>
    );
}
