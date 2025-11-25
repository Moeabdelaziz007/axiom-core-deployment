'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Activity, Wallet, MessageCircle, Shield, Cpu, Globe,
    Menu, X, Bell, Search, ChevronRight, Terminal, User,
    LogOut, Settings, LayoutDashboard, CreditCard, Bot,
    Phone, Mail
} from 'lucide-react';
import Link from 'next/link';

// --- BRANDING FOOTER ---
export const BrandingFooter = ({ className = "" }: { className?: string }) => (
    <div className={`mt-auto pt-6 border-t border-white/5 ${className}`}>
        <div className="flex items-center justify-center gap-2 mb-2 opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-gray-400 tracking-widest uppercase">Powered by</span>
            <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
                    Axiom AI Engine
                </span>
            </div>
        </div>
        <div className="text-center mb-4">
            <p className="text-[9px] text-gray-500 font-mono">
                Architected by <span className="text-primary font-bold">Mohamed H Abdelaziz</span>
            </p>
            <p className="text-[8px] text-gray-600 font-mono mt-1">Premium Business Intelligence</p>
        </div>
        {/* Contact Block */}
        <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono hover:text-primary transition-colors">
                    <MessageCircle className="w-3 h-3 text-green-500" />
                    <span>+17706160211</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono hover:text-primary transition-colors">
                    <Phone className="w-3 h-3 text-blue-500" />
                    <span>+201094228044</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono hover:text-primary transition-colors truncate">
                    <Mail className="w-3 h-3 text-purple-500" />
                    <span className="truncate">mabdela1@students.kennesaw.edu</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono hover:text-primary transition-colors">
                    <Mail className="w-3 h-3 text-pink-500" />
                    <span>amrikyy@gmail.com</span>
                </div>
            </div>
        </div>
    </div>
);

// --- QUANTUM CARD ---
interface QuantumCardProps {
    children: React.ReactNode;
    className?: string;
    glow?: 'cyan' | 'purple' | 'green' | 'none';
    title?: string;
    icon?: React.ElementType;
}

export const QuantumCard = ({ children, className = "", glow = 'none', title, icon: Icon }: QuantumCardProps) => {
    const glowStyles = {
        cyan: 'shadow-[0_0_20px_rgba(59,130,246,0.15)] border-primary/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]',
        purple: 'shadow-[0_0_20px_rgba(112,0,255,0.15)] border-axiom-purple/30 hover:shadow-[0_0_30px_rgba(112,0,255,0.25)]',
        green: 'shadow-[0_0_20px_rgba(59,130,246,0.15)] border-primary/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]', // Changed to blue
        none: 'border-white/10 hover:border-white/20'
    };
    return (
        <div className={`relative bg-white/5 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${glowStyles[glow]} ${className}`}>
            {/* Subtle shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            {(title || Icon) && (
                <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                    {Icon && <Icon className={`w-5 h-5 ${glow === 'green' || glow === 'cyan' ? 'text-primary' : glow === 'purple' ? 'text-axiom-purple' : 'text-white'}`} />}
                    {title && <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>}
                </div>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

// --- NEON BUTTON ---
interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    icon?: React.ElementType;
    loading?: boolean;
}

export const NeonButton = ({ children, variant = 'primary', icon: Icon, loading, className = "", ...props }: NeonButtonProps) => {
    const variants = {
        primary: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent hover:from-blue-700 hover:to-cyan-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
        secondary: 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/30',
        danger: 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(255,0,60,0.4)]',
        success: 'bg-axiom-success/10 text-axiom-success border-axiom-success/50 hover:bg-axiom-success/20 hover:shadow-[0_0_20px_rgba(0,255,148,0.4)]'
    };
    return (
        <button
            className={`relative px-6 py-3 rounded-xl font-bold tracking-wider border transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {Icon && <Icon className="w-5 h-5" />}
                    {children}
                </>
            )}
        </button>
    );
};

// --- STAT BAR ---
interface StatBarProps {
    label: string;
    value: number; // 0-100
    color?: string;
    suffix?: string;
}

export const StatBar = ({ label, value, color = "bg-primary", suffix = "%" }: StatBarProps) => (
    <div className="w-full">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{label}</span>
            <span className="text-white font-mono">{value}{suffix}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${color}`}
            />
        </div>
    </div>
);

// --- STATUS BADGE ---
export const StatusBadge = ({ status }: { status: 'active' | 'idle' | 'flagged' | 'offline' }) => {
    const styles = {
        active: 'bg-primary/10 text-primary border-primary/30',
        idle: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
        flagged: 'bg-red-500/10 text-red-500 border-red-500/30',
        offline: 'bg-gray-500/10 text-gray-500 border-gray-500/30'
    };
    return (
        <div className={`px-2 py-1 rounded-full border text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 ${styles[status]}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'animate-pulse bg-current' : 'bg-current'}`} />
            {status}
        </div>
    );
};

// --- CHAT WIDGET ---
export const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-16 right-0 w-80 md:w-96 h-[500px] glass-panel-premium backdrop-blur-xl border border-axiom-neon-green/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-axiom-neon-green/20 flex items-center justify-center border border-axiom-neon-green/50">
                                    <Bot className="w-5 h-5 text-axiom-neon-green" />
                                </div>
                                <div>
                                    <h3 className="font-orbitron text-sm text-white">Quantum Assistant</h3>
                                    <span className="text-[10px] text-axiom-success flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-axiom-success animate-pulse" />
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Chat Area */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-axiom-neon-green/20 flex-shrink-0 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-axiom-neon-green" />
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 text-sm text-gray-300">
                                    Greetings, Commander. How can I assist you with your quantum agent fleet today?
                                </div>
                            </div>
                        </div>
                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type a quantum command..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-4 pr-10 text-sm text-white focus:outline-none focus:border-axiom-neon-green/50 transition-colors"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-axiom-neon-green hover:text-white transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isOpen ? 'bg-red-500/20 text-red-500 border border-red-500/50 rotate-90' : 'bg-axiom-neon-green/20 text-axiom-neon-green border border-axiom-neon-green/50 hover:bg-axiom-neon-green/30 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)]'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>
        </div>
    );
};
// --- HEALTH INDICATOR ---
export const HealthIndicator = ({ label, value, status }: { label: string, value: string, status: 'stable' | 'warning' | 'critical' }) => {
    const colors = {
        stable: 'text-primary',
        warning: 'text-yellow-500',
        critical: 'text-red-500'
    };
    const bgColors = {
        stable: 'bg-primary',
        warning: 'bg-yellow-500',
        critical: 'bg-red-500'
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${bgColors[status]} animate-pulse`} />
                <span className="text-xs font-mono text-gray-400">{label}</span>
            </div>
            <span className={`text-sm font-bold font-mono ${colors[status]}`}>{value}</span>
        </div>
    );
};

// --- SYNTH CHART (SVG VISUALIZATION) ---
export const SynthChart = ({ data, color = '#3b82f6' }: { data: number[], color?: string }) => {
    const max = Math.max(...data);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-24 relative overflow-hidden rounded-lg bg-black/20 border border-white/10">
            <svg className="w-full h-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />

                {/* Area Fill */}
                <path
                    d={`M0,100 ${points} 100,100 Z`}
                    fill={color}
                    fillOpacity="0.1"
                />
                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scanline pointer-events-none" />
        </div>
    );
};
// --- TECH BADGE ---
export const TechBadge = ({ label }: { label: string }) => (
    <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 flex items-center gap-1 hover:border-primary/30 hover:text-primary transition-colors cursor-help">
        <Terminal className="w-3 h-3" />
        {label}
    </div>
);

// --- FEATURE ROW ---
export const FeatureRow = ({ icon: Icon, title, value, tech }: { icon: any, title: string, value: string, tech: string }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-white">{title}</h4>
                <p className="text-xs text-gray-400">{value}</p>
            </div>
        </div>
        <div className="hidden md:block">
            <TechBadge label={tech} />
        </div>
    </div>
);