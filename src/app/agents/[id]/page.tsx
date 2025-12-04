'use client';

import React, { useState, useRef, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { agents, getAgentIcon } from '@/lib/agent-configs';
import { Play, Cpu, Activity, Send } from 'lucide-react';
import Link from 'next/link';

// ============================================================================
// 🧬 UNIVERSAL AGENT PAGE - Day 7 (LIVE CHAT)
// ============================================================================

export default function AgentPage({ params }: { params: { id: string } }) {
    const agent = agents[params.id];
    const Icon = getAgentIcon(params.id);
    const [activeCapability, setActiveCapability] = useState(0);

    // Chat state
    const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize with welcome message
    useEffect(() => {
        if (agent) {
            setMessages([{ role: 'ai', text: agent.welcome_message }]);
        }
    }, [agent]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message handler
    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: agent.id,
                    message: userMsg,
                    history: messages
                })
            });

            const data = await res.json();

            if (data.response) {
                setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: 'عذراً، حصل خطأ. جرب تاني.' }]);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', text: 'عذراً، الخادم لا يستجيب.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!agent) return notFound();

    return (
        <main className="min-h-screen bg-[#0A1628] text-white font-sans selection:bg-[#0A84FF]/30">

            {/* NAVBAR */}
            <nav className="border-b border-white/5 bg-[#0A1628]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
                        <span className="text-slate-400 hover:text-white transition-colors">Axiom</span>
                        <span className="text-slate-600">/</span>
                        <span style={{ color: agent.color }}>{agent.agent_name}</span>
                    </Link>
                    <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm border border-white/10 transition-all">
                        Dashboard Login
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative pt-16 pb-20 px-6 overflow-hidden">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[150px] opacity-15 pointer-events-none"
                    style={{ backgroundColor: agent.color }}
                />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono mb-6">
                        <Activity className="w-3 h-3" style={{ color: agent.color }} />
                        <span className="text-slate-400">CORE FREQUENCY:</span>
                        <span style={{ color: agent.color }}>{agent.core_frequency}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">{agent.agent_name}</h1>
                    <p className="text-lg text-slate-400 font-light">{agent.role_title} • AI Powered by Gemini Flash</p>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <section className="max-w-6xl mx-auto px-6 pb-24">
                <div className="grid md:grid-cols-2 gap-8 items-start">

                    {/* LEFT: LIVE CHAT */}
                    <div className="bg-[#112240] rounded-2xl border border-white/10 p-6 h-[550px] flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                            <div className="p-2 rounded-lg bg-white/5" style={{ color: agent.color }}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">Live {agent.agent_name} Interface</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online (Gemini Flash)
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 space-y-4 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : ''}`}
                                        style={{ backgroundColor: msg.role === 'ai' ? agent.color : undefined }}
                                    >
                                        {msg.role === 'ai' ? 'AI' : 'ME'}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[80%] ${msg.role === 'ai'
                                        ? 'bg-[#1E293B] rounded-tl-none text-slate-300 border border-white/5'
                                        : 'bg-[#0A84FF]/20 rounded-tr-none text-white border border-[#0A84FF]/20'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {/* Loading */}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: agent.color }}>AI</div>
                                    <div className="bg-[#1E293B] p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={`تحدث مع ${agent.agent_name}...`}
                                className="flex-1 bg-[#0A1628] rounded-lg border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
                                dir="rtl"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="px-4 rounded-lg transition-colors disabled:opacity-50"
                                style={{ backgroundColor: agent.color }}
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: CAPABILITIES */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Cpu className="w-6 h-6 text-slate-500" />
                            <span>Neural Capabilities</span>
                        </h2>

                        <div className="space-y-3">
                            {agent.opal_config.capabilities.map((cap, idx) => (
                                <div
                                    key={cap.id}
                                    onClick={() => setActiveCapability(idx)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${activeCapability === idx
                                        ? 'bg-[#1E293B] border-white/20 translate-x-2'
                                        : 'bg-transparent border-white/5 hover:bg-white/5'
                                        }`}
                                    style={{ borderColor: activeCapability === idx ? agent.color : undefined }}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold" style={{ color: activeCapability === idx ? agent.color : 'white' }}>
                                            {cap.name}
                                        </h3>
                                        {activeCapability === idx && <Play className="w-4 h-4" style={{ color: agent.color }} />}
                                    </div>

                                    <div className={`grid gap-2 overflow-hidden transition-all duration-300 ${activeCapability === idx ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                        {cap.workflows.map((flow) => (
                                            <div key={flow} className="flex items-center gap-2 text-xs text-slate-400 font-mono pl-2">
                                                <div className="w-1 h-1 rounded-full bg-slate-600" />
                                                {flow}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mt-8">
                            {agent.stats.map((stat, i) => (
                                <div key={i} className="bg-[#112240] p-3 rounded-lg border border-white/5 text-center">
                                    <div className="text-xs text-slate-500 mb-1">Feature</div>
                                    <div className="text-xs font-bold text-white truncate">{stat}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-sm text-slate-500">
                    <span>© 2024 Axiom RESET</span>
                    <Link href="/" className="hover:text-white transition-colors">← Back to Home</Link>
                </div>
            </footer>
        </main>
    );
}
