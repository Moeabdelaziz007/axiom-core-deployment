'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Fingerprint, Package, Truck, Zap, Shield, Activity, Settings } from 'lucide-react';
import { AxiomIDCard } from './AxiomIDCard';

const STEPS = [
    { id: 'SOUL', label: 'SOUL FORGE', sub: 'DREAM IT', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { id: 'MINT', label: 'IDENTITY MINT', sub: 'MINT IT', icon: Fingerprint, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    { id: 'EQUIP', label: 'EQUIPPING', sub: 'TRAIN IT', icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { id: 'DOCK', label: 'DELIVERY DOCK', sub: 'DEPLOY IT', icon: Truck, color: 'text-green-400', bg: 'bg-green-500/20' },
];

export default function Gigafactory() {
    const [activeStep, setActiveStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isProducing, setIsProducing] = useState(false);

    useEffect(() => {
        if (isProducing) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        if (activeStep < 3) {
                            setActiveStep(s => s + 1);
                            return 0;
                        } else {
                            setIsProducing(false);
                            return 100;
                        }
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isProducing, activeStep]);

    const startProduction = () => {
        setActiveStep(0);
        setProgress(0);
        setIsProducing(true);
    };

    return (
        <div className="w-full h-full bg-black/80 border border-cyan-900/50 rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-cyan-900/50 bg-black/50 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-cyan-400 animate-spin-slow" />
                    <h2 className="text-xl font-bold text-white tracking-widest font-display">AI AGENT GIGAFACTORY</h2>
                </div>
                <div className="flex gap-6 text-xs font-mono">
                    <div className="flex items-center gap-2 text-green-400">
                        <Activity className="w-4 h-4" />
                        <span>SYSTEM STATUS: ONLINE</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Zap className="w-4 h-4" />
                        <span>THROUGHPUT: 98%</span>
                    </div>
                </div>
            </div>

            {/* Main Production Area */}
            <div className="flex-1 relative p-8 flex flex-col items-center justify-center">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                {/* Steps Visualization */}
                <div className="w-full max-w-5xl grid grid-cols-4 gap-4 mb-12 relative z-10">
                    {STEPS.map((step, index) => {
                        const isActive = index === activeStep;
                        const isCompleted = index < activeStep;

                        return (
                            <div key={step.id} className={`relative flex flex-col items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${isActive ? 'border-cyan-400 bg-cyan-900/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-white/5 bg-black/40 opacity-50'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.bg} ${step.color}`}>
                                    <step.icon className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <h3 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}>{step.label}</h3>
                                    <p className="text-[0.6rem] text-cyan-600 tracking-widest uppercase">{step.sub}</p>
                                </div>

                                {isActive && isProducing && (
                                    <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-cyan-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}

                                {/* Connector Line */}
                                {index < 3 && (
                                    <div className="absolute top-10 -right-6 w-8 h-[2px] bg-cyan-900/50" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Central Stage (Conveyor Belt) */}
                <div className="w-full max-w-4xl h-64 border-t border-b border-cyan-900/30 bg-black/20 relative flex items-center justify-center overflow-hidden">
                    {/* Moving Floor Effect */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_49px,rgba(0,255,255,0.1)_50px)] animate-scanline opacity-30" />

                    <AnimatePresence mode="wait">
                        {activeStep === 0 && (
                            <motion.div
                                key="SOUL"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.5 }}
                                className="relative"
                            >
                                <div className="w-32 h-32 rounded-full bg-purple-500/20 blur-xl animate-pulse absolute inset-0" />
                                <Brain className="w-32 h-32 text-purple-400 relative z-10 animate-float" />
                                <p className="text-center text-purple-300 mt-4 font-mono text-sm">GENERATING CORE ESSENCE...</p>
                            </motion.div>
                        )}

                        {activeStep === 1 && (
                            <motion.div
                                key="MINT"
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 100, opacity: 0 }}
                                className="relative"
                            >
                                <AxiomIDCard
                                    agentName="PROTOTYPE-X"
                                    agentClass="Unassigned"
                                    origin="The Forge"
                                    idHash="Minting..."
                                />
                                <p className="text-center text-cyan-300 mt-4 font-mono text-sm">MINTING ON-CHAIN IDENTITY...</p>
                            </motion.div>
                        )}

                        {activeStep === 2 && (
                            <motion.div
                                key="EQUIP"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-8"
                            >
                                {[1, 2, 3].map(i => (
                                    <motion.div
                                        key={i}
                                        initial={{ y: -50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.2 }}
                                        className="w-24 h-24 border border-yellow-500/30 bg-yellow-900/10 rounded-lg flex flex-col items-center justify-center gap-2"
                                    >
                                        <Package className="w-8 h-8 text-yellow-400" />
                                        <span className="text-[0.6rem] text-yellow-200">MODULE {i}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {activeStep === 3 && (
                            <motion.div
                                key="DOCK"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center"
                            >
                                <div className="w-full max-w-md p-6 border border-green-500/50 bg-green-900/10 rounded-xl">
                                    <h3 className="text-2xl font-bold text-green-400 mb-2">READY FOR DEPLOYMENT</h3>
                                    <p className="text-green-200/60 mb-6">Agent AX-9982 successfully forged, minted, and equipped.</p>
                                    <button className="px-8 py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
                                        DEPLOY AGENT
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Controls */}
            <div className="h-20 border-t border-cyan-900/50 bg-black/50 px-8 flex items-center justify-between">
                <div className="flex gap-8">
                    <div>
                        <p className="text-[0.6rem] text-cyan-600 uppercase">ACTIVE WALLETS</p>
                        <p className="text-xl font-bold text-white font-mono">1,402</p>
                    </div>
                    <div>
                        <p className="text-[0.6rem] text-cyan-600 uppercase">CURRENT QUEUE</p>
                        <p className="text-xl font-bold text-white font-mono">3 AGENTS</p>
                    </div>
                </div>

                {!isProducing && activeStep !== 3 && (
                    <button
                        onClick={startProduction}
                        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4" />
                        START PRODUCTION
                    </button>
                )}

                {activeStep === 3 && (
                    <button
                        onClick={() => { setActiveStep(0); setIsProducing(false); }}
                        className="px-8 py-3 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/20 rounded transition-all"
                    >
                        RESET FACTORY
                    </button>
                )}
            </div>
        </div>
    );
}
