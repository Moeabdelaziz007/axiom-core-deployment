'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AgentChat } from '@/components/AgentChat';
import { QuantumCard, NeonButton } from '@/components/AxiomUI';
import { useAxiomVoice } from '@/hooks/useAxiomVoice';
import { ArrowLeft, Mic, Bot, Zap, Shield, Home } from 'lucide-react';

// Agent configurations
const AGENT_CONFIGS = {
    sofra: {
        name: 'Sofra',
        type: 'CX-Auditor',
        role: 'CX Management System',
        description: 'Full-stack customer experience manager. "I turn complaints into loyal customers."',
        avatar: '/agents/sofra.png',
        color: 'green',
        capabilities: ['Sentiment Analysis', 'Customer Support', 'Complaint Resolution', 'Loyalty Management']
    },
    aqar: {
        name: 'Aqar',
        type: 'UnitManager',
        role: 'Full Rental Unit Management',
        description: 'End-to-end property management. "Your property, on autopilot."',
        avatar: '/agents/aqar.png',
        color: 'purple',
        capabilities: ['Property Valuation', 'ROI Analysis', 'Market Trends', 'Tenant Management']
    },
    mawid: {
        name: 'Mawid',
        type: 'FlowOptimizer',
        role: 'Workflow Optimizer',
        description: 'Intelligent scheduling. "Time is money. I save both."',
        avatar: '/agents/mawid.png',
        color: 'yellow',
        capabilities: ['Schedule Optimization', 'Resource Allocation', 'Time Management', 'Workflow Analytics']
    },
    tajer: {
        name: 'Tajer',
        type: 'Negotiator',
        role: 'E-Commerce Negotiator',
        description: 'Automated sales & negotiation. "I close deals while you sleep."',
        avatar: '/agents/tajer.png',
        color: 'blue',
        capabilities: ['Price Optimization', 'Competitor Analysis', 'Inventory Management', 'Blockchain Trading']
    }
};

export default function AgentChatPage() {
    const params = useParams();
    const router = useRouter();
    const { speak, isPlaying } = useAxiomVoice();
    const [agent, setAgent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const agentSlug = params.agent as string;

    useEffect(() => {
        const agentConfig = AGENT_CONFIGS[agentSlug as keyof typeof AGENT_CONFIGS];

        if (agentConfig) {
            setAgent({
                id: Object.keys(AGENT_CONFIGS).indexOf(agentSlug) + 1,
                ...agentConfig,
                slug: agentSlug
            });

            // Welcome message
            setTimeout(() => {
                speak(`Welcome to ${agentConfig.name}. ${agentConfig.description}. How can I assist you today?`);
            }, 1000);
        } else {
            // Agent not found, redirect to dashboard
            router.push('/dashboard');
        }

        setLoading(false);
    }, [agentSlug, router, speak]);

    const handleBackToDashboard = () => {
        speak("Returning to dashboard.");
        router.push('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Agent Not Found</h1>
                    <NeonButton onClick={() => router.push('/dashboard')}>
                        Back to Dashboard
                    </NeonButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <NeonButton
                            icon={ArrowLeft}
                            variant="secondary"
                            onClick={handleBackToDashboard}
                            className="shrink-0"
                        >
                            Back
                        </NeonButton>

                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 overflow-hidden border-${agent.color}-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]`}>
                                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {agent.name}
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                </h1>
                                <p className="text-sm text-gray-400">{agent.role}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NeonButton
                            icon={Mic}
                            variant={isPlaying ? "success" : "secondary"}
                            onClick={() => speak(`${agent.name} is ready to assist. Current capabilities include: ${agent.capabilities.join(', ')}.`)}
                            className={isPlaying ? "animate-pulse" : ""}
                        >
                            {isPlaying ? "Voice Active" : "Voice Guide"}
                        </NeonButton>
                        <NeonButton
                            icon={Home}
                            variant="primary"
                            onClick={handleBackToDashboard}
                        >
                            Dashboard
                        </NeonButton>
                    </div>
                </div>
            </div>

            {/* Agent Capabilities */}
            <div className="p-6">
                <QuantumCard glow={agent.color} className="mb-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                            <Bot className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">Agent Capabilities</h3>
                            <p className="text-sm text-gray-400 mb-4 italic">&ldquo;{agent.description}&rdquo;</p>
                            <div className="grid grid-cols-2 gap-2">
                                {agent.capabilities.map((capability: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 rounded px-2 py-1">
                                        <Zap className="w-3 h-3 text-primary" />
                                        <span className="text-gray-300">{capability}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </QuantumCard>

                {/* Chat Interface */}
                <AgentChat
                    agentId={agent.id.toString()}
                    agentName={agent.name}
                    agentType={agent.type}
                    onClose={() => router.push('/dashboard')}
                />
            </div>
        </div>
    );
}