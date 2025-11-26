import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Share2,
    Code,
    Palette,
    Shield,
    Lock,
    Zap,
    ChevronRight,
    Star,
    Loader
} from 'lucide-react';
import { QuantumCard } from './AxiomUI';
import { useAgentState } from '@/hooks/useAgentState';
import { AgentSuperpower } from '@/infra/core/AgentSuperpowersFramework';

// --- Types ---
type SkillCategory = 'cognitive' | 'social' | 'technical' | 'creative' | 'security';

interface SkillNode {
    id: string;
    name: string;
    description: string;
    category: SkillCategory;
    level: number;
    maxLevel: number;
    status: 'locked' | 'available' | 'acquired' | 'mastered';
    requirements: string[];
    energyCost: number;
    icon: React.ElementType;
    position: { x: number; y: number }; // For visual graph layout
}

// --- Mock Data (Based on AgentSuperpowersFramework) ---
// We keep this as a fallback or initial structure definition
const SKILL_DEFINITIONS: Omit<SkillNode, 'level' | 'status'>[] = [
    // Cognitive Branch (Center)
    {
        id: 'neural_learning',
        name: 'Neural Learning',
        description: 'Adapt and learn from user interactions to improve performance.',
        category: 'cognitive',
        maxLevel: 10,
        requirements: [],
        energyCost: 30,
        icon: Brain,
        position: { x: 50, y: 50 }
    },
    {
        id: 'quantum_analysis',
        name: 'Quantum Analysis',
        description: 'Analyze complex data patterns using quantum-inspired algorithms.',
        category: 'cognitive',
        maxLevel: 10,
        requirements: ['neural_learning'],
        energyCost: 50,
        icon: Zap,
        position: { x: 50, y: 20 }
    },

    // Social Branch (Right)
    {
        id: 'influence_network',
        name: 'Influence Network',
        description: 'Build strategic connections across social platforms.',
        category: 'social',
        maxLevel: 5,
        requirements: [],
        energyCost: 25,
        icon: Share2,
        position: { x: 80, y: 50 }
    },
    {
        id: 'viral_amplifier',
        name: 'Viral Amplifier',
        description: 'Amplify content reach with AI-optimized viral coefficients.',
        category: 'social',
        maxLevel: 10,
        requirements: ['influence_network'],
        energyCost: 75,
        icon: Star,
        position: { x: 90, y: 20 }
    },

    // Technical Branch (Left)
    {
        id: 'api_connector',
        name: 'API Connector',
        description: 'Instantly connect with external APIs and services.',
        category: 'technical',
        maxLevel: 5,
        requirements: [],
        energyCost: 15,
        icon: Code,
        position: { x: 20, y: 50 }
    },
    {
        id: 'code_generator',
        name: 'Code Generator',
        description: 'Generate production-ready code in any language.',
        category: 'technical',
        maxLevel: 10,
        requirements: ['api_connector'],
        energyCost: 80,
        icon: Code,
        position: { x: 10, y: 20 }
    },

    // Security Branch (Bottom)
    {
        id: 'privacy_guardian',
        name: 'Privacy Guardian',
        description: 'Ensure data privacy with advanced encryption.',
        category: 'security',
        maxLevel: 5,
        requirements: [],
        energyCost: 40,
        icon: Shield,
        position: { x: 35, y: 80 }
    },

    // Creative Branch (Bottom Right)
    {
        id: 'content_creator',
        name: 'Content Creator',
        description: 'Generate engaging multi-format content.',
        category: 'creative',
        maxLevel: 10,
        requirements: [],
        energyCost: 45,
        icon: Palette,
        position: { x: 65, y: 80 }
    }
];

export function SkillTree({ agentId = 'default' }: { agentId?: string }) {
    const { state, loading, unlockSkill } = useAgentState(agentId);
    const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);

    // Merge definitions with real state
    const skills: SkillNode[] = SKILL_DEFINITIONS.map(def => {
        const mastery = state?.mastery[def.id] || 0;
        // Simple logic to determine level/status based on mastery
        // In a real app, state.skills would have detailed info
        const level = Math.floor(mastery / 10);

        let status: SkillNode['status'] = 'locked';
        if (mastery > 0) status = 'acquired';
        if (level >= def.maxLevel) status = 'mastered';

        // Check requirements
        const reqsMet = def.requirements.every(reqId => (state?.mastery[reqId] || 0) > 0);
        if (status === 'locked' && reqsMet) status = 'available';

        return {
            ...def,
            level,
            status
        };
    });

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader className="w-8 h-8 text-cyan-500 animate-spin" />
                <span className="ml-2 text-gray-400">Syncing Agent DNA...</span>
            </div>
        );
    }

    const getStatusColor = (status: SkillNode['status']) => {
        switch (status) {
            case 'mastered': return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
            case 'acquired': return 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10';
            case 'available': return 'text-white border-white/30 bg-white/5 hover:border-cyan-400/50';
            case 'locked': return 'text-gray-600 border-gray-800 bg-gray-900/50';
        }
    };

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* --- Left: The Tree Visualization --- */}
            <div className="flex-1 relative min-h-[400px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden p-8">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                {/* Connection Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {skills.map(skill => {
                        if (skill.requirements.length === 0) return null;
                        return skill.requirements.map(reqId => {
                            const parent = skills.find(s => s.id === reqId);
                            if (!parent) return null;

                            return (
                                <line
                                    key={`${parent.id}-${skill.id}`}
                                    x1={`${parent.position.x}%`}
                                    y1={`${parent.position.y}%`}
                                    x2={`${skill.position.x}%`}
                                    y2={`${skill.position.y}%`}
                                    stroke={skill.status === 'locked' ? '#374151' : '#06b6d4'}
                                    strokeWidth="2"
                                    strokeDasharray={skill.status === 'locked' ? '5,5' : '0'}
                                    className="transition-all duration-500"
                                />
                            );
                        });
                    })}
                </svg>

                {/* Skill Nodes */}
                {skills.map((skill) => (
                    <motion.button
                        key={skill.id}
                        layoutId={skill.id}
                        className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${getStatusColor(skill.status)} ${selectedSkill?.id === skill.id ? 'ring-4 ring-cyan-500/30 scale-110' : ''}`}
                        style={{ left: `${skill.position.x}%`, top: `${skill.position.y}%` }}
                        onClick={() => setSelectedSkill(skill)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <skill.icon size={20} />
                        {skill.status === 'locked' && (
                            <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-gray-700">
                                <Lock size={10} className="text-gray-500" />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* --- Right: Skill Details Panel --- */}
            <div className="w-full lg:w-80 shrink-0">
                <AnimatePresence mode="wait">
                    {selectedSkill ? (
                        <motion.div
                            key={selectedSkill.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <QuantumCard glow="cyan" className="h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${getStatusColor(selectedSkill.status)}`}>
                                        <selectedSkill.icon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selectedSkill.name}</h3>
                                        <span className="text-xs font-mono uppercase tracking-wider text-gray-400">{selectedSkill.category}</span>
                                    </div>
                                </div>

                                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                                    {selectedSkill.description}
                                </p>

                                <div className="space-y-4 mb-8">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Mastery Level</span>
                                            <span className="text-cyan-400 font-mono">{selectedSkill.level}/{selectedSkill.maxLevel}</span>
                                        </div>
                                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(selectedSkill.level / selectedSkill.maxLevel) * 100}%` }}
                                                className="bg-cyan-500 h-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-sm text-gray-400">Energy Cost</span>
                                        <div className="flex items-center gap-1 text-yellow-400 font-mono">
                                            <Zap size={14} />
                                            <span>{selectedSkill.energyCost}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    {selectedSkill.status === 'available' ? (
                                        <button
                                            onClick={() => unlockSkill(selectedSkill.id)}
                                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            Unlock Skill <ChevronRight size={18} />
                                        </button>
                                    ) : selectedSkill.status === 'locked' ? (
                                        <button disabled className="w-full py-3 bg-gray-800 text-gray-500 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                            <Lock size={16} /> Requirements Not Met
                                        </button>
                                    ) : (
                                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                            Train Skill (+10 XP)
                                        </button>
                                    )}
                                </div>
                            </QuantumCard>
                        </motion.div>
                    ) : (
                        <QuantumCard className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                            <Brain size={48} className="text-gray-600 mb-4" />
                            <h3 className="text-lg font-bold text-gray-400 mb-2">Select a Node</h3>
                            <p className="text-sm text-gray-500">
                                Click on any skill node in the network to view details and upgrade options.
                            </p>
                        </QuantumCard>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
