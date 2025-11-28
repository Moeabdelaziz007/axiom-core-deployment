"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { PolyphaseProgress } from "@/components/quantum-notebook/PolyphaseProgress";
import { motion } from "framer-motion";

export default function QuantumNotebookPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat", // We will create this next
    } as any) as any;

    // Mock phases for visualization (in real app, this comes from agent state)
    const [phases] = useState([
        { id: "1", name: "ATA Planner", status: "completed", progress: 100, color: "bg-blue-500" },
        { id: "2", name: "Data Aggregator", status: "completed", progress: 100, color: "bg-purple-500" },
        { id: "3", name: "ATA Optimizer", status: "active", progress: 65, color: "bg-cyan-500" },
        { id: "4", name: "ATA Executor", status: "pending", progress: 0, color: "bg-gray-700" },
    ]);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
            {/* Background Grid (Cyberpunk Aesthetic) */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <main className="relative max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 pt-20">

                {/* Left Column: Chat Interface */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6 min-h-[600px] flex flex-col backdrop-blur-sm">
                        {/* Logo Section */}
                        <div className="mb-8">
                            <style>{`
                                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
                            `}</style>
                            <div className="flex items-center gap-3">
                                <div className="text-3xl font-black tracking-widest text-white" style={{ fontFamily: "'Orbitron', sans-serif", textShadow: "0 0 20px rgba(0, 255, 255, 0.6)" }}>
                                    AXIOM<span className="text-cyan-400">ID</span>
                                </div>
                                <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent mx-2"></div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-cyan-400 font-bold tracking-[0.2em] uppercase">Quantum</span>
                                    <span className="text-[10px] text-gray-500 tracking-widest uppercase">Command Center</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-500 mt-20">
                                    <p className="text-sm uppercase tracking-widest mb-2">System Ready</p>
                                    <p className="text-xs">Initialize ATA Workflow...</p>
                                </div>
                            )}

                            {messages.map((m: any) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === "user"
                                        ? "bg-cyan-900/30 border border-cyan-500/30 text-cyan-100"
                                        : "bg-gray-800/50 border border-white/5 text-gray-300"
                                        }`}>
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800/50 border border-white/5 p-3 rounded-lg text-xs text-gray-400 animate-pulse">
                                        Thinking...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Enter command..."
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                            >
                                EXECUTE
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Polyphase Visualization & Metrics */}
                <div className="space-y-6">
                    {/* Tesla-Inspired Polyphase Monitor */}
                    <PolyphaseProgress phases={phases as any} />

                    {/* System Status Card */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">
                            System Metrics
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">CPU Load</span>
                                <span className="text-green-400">12%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Memory</span>
                                <span className="text-cyan-400">4.2GB</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Network Latency</span>
                                <span className="text-purple-400">24ms</span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
