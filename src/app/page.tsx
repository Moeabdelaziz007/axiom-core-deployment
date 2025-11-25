'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Zap,
    Brain,
    TrendingUp,
    Shield,
    Globe,
    ArrowRight,
    Check,
    Building2,
    UtensilsCrossed,
    Calendar,
    ShoppingBag
} from 'lucide-react';
import { BrandingFooter } from '@/components/AxiomUI';

const AGENTS = [
    {
        id: 'aqar',
        name: 'Aqar',
        icon: Building2,
        tagline: 'Your Real Estate Oracle',
        description: 'AI-powered property valuation, market analysis, and investment insights for MENA markets.',
        color: 'from-blue-500 to-cyan-500',
        features: ['Market Predictions', 'Price Analysis', 'Investment Scoring']
    },
    {
        id: 'sofra',
        name: 'Sofra',
        icon: UtensilsCrossed,
        tagline: 'Restaurant Intelligence',
        description: 'Sentiment analysis, menu optimization, and customer insights for F&B businesses.',
        color: 'from-orange-500 to-red-500',
        features: ['Review Analysis', 'Menu Optimization', 'Trend Forecasting']
    },
    {
        id: 'mawid',
        name: 'Mawid',
        icon: Calendar,
        tagline: 'Scheduling Genius',
        description: 'Smart appointment management with predictive scheduling and flow optimization.',
        color: 'from-purple-500 to-pink-500',
        features: ['Smart Booking', 'Flow Prediction', 'No-Show Prevention']
    },
    {
        id: 'tajer',
        name: 'Tajer',
        icon: ShoppingBag,
        tagline: 'E-Commerce Strategist',
        description: 'Pricing intelligence, inventory optimization, and negotiation automation.',
        color: 'from-green-500 to-emerald-500',
        features: ['Dynamic Pricing', 'Stock Forecasting', 'Auto-Negotiation']
    }
];

const BENEFITS = [
    { icon: Brain, title: 'Self-Evolving AI', desc: 'Agents learn and improve from every interaction' },
    { icon: Zap, title: 'Zero Setup', desc: 'Deploy in minutes, not months' },
    { icon: Shield, title: 'MENA-First', desc: 'Built for Arabic dialects and local markets' },
    { icon: TrendingUp, title: 'Real ROI', desc: 'Measurable impact from day one' }
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black -z-10" />
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 -z-10" />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
                            <Sparkles size={16} />
                            <span>Introducing Axiom SAAAAS</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
                            Self-Aware AI Agents
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                That Actually Work
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto">
                            Deploy autonomous AI agents that learn, adapt, and evolve.
                            Built for MENA businesses. Starting at <span className="text-cyan-400 font-bold">$0.99</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.location.href = '/dashboard'}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/50 transition-shadow"
                            >
                                Initialize Your Fleet <ArrowRight size={20} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
                            >
                                Watch Demo
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
                >
                    <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
                        <div className="w-1 h-3 bg-white/40 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Why Axiom?
                        </h2>
                        <p className="text-white/60 text-lg">
                            The first truly autonomous AI workforce
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {BENEFITS.map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                                    <benefit.icon className="text-cyan-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                                <p className="text-white/60 text-sm">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Agents Showcase */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Meet Your New Team
                        </h2>
                        <p className="text-white/60 text-lg">
                            Four specialized agents, one unified platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {AGENTS.map((agent, i) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                                className="bg-black/60 border border-white/10 rounded-2xl p-8 relative overflow-hidden group cursor-pointer"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

                                <div className="flex items-start gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                                        <agent.icon size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1">{agent.name}</h3>
                                        <p className="text-cyan-400 text-sm">{agent.tagline}</p>
                                    </div>
                                </div>

                                <p className="text-white/70 mb-6">
                                    {agent.description}
                                </p>

                                <div className="space-y-2">
                                    {agent.features.map((feature, j) => (
                                        <div key={j} className="flex items-center gap-2 text-sm text-white/60">
                                            <Check size={16} className="text-cyan-400" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-2xl font-bold text-cyan-400">$0.99<span className="text-sm text-white/40">/mo</span></span>
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
                                        Deploy Agent
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Deploy?
                        </h2>
                        <p className="text-xl text-white/60 mb-8">
                            Start with one agent or deploy the full fleet. Scale as you grow.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/dashboard'}
                            className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 mx-auto hover:shadow-lg hover:shadow-cyan-500/50 transition-shadow"
                        >
                            Initialize DSS <Zap size={20} />
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            <BrandingFooter />
        </div>
    );
}
