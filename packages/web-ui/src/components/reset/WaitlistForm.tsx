'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles, CheckCircle2, Trophy } from 'lucide-react';
import { useTranslation } from '@/lib/translations';

export const WaitlistForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [queuePosition, setQueuePosition] = useState(0);
    const [interests, setInterests] = useState({
        website: true,
        chatbot: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);

        try {
            const response = await fetch("https://formspree.io/f/xblqrblj", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    interests: interests,
                    total_price: totalPrice.toFixed(2),
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                // Generate random queue position for gamification
                const randomPosition = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
                setQueuePosition(randomPosition);
                setSubmitted(true);
            } else {
                console.error("Formspree submission failed");
                // Optional: Handle error state in UI
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = (interests.website ? 1.00 : 0) + (interests.chatbot ? 0.99 : 0);

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8 text-center max-w-md mx-auto backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50"
                >
                    <Trophy className="w-10 h-10 text-green-400" />
                </motion.div>

                <h3 className="text-3xl font-bold text-white mb-2 font-orbitron">
                    Welcome to the Future!
                </h3>
                <p className="text-gray-300 mb-6">
                    You are officially on the list.
                </p>

                <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/10">
                    <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Your Position</p>
                    <div className="text-4xl font-black text-green-400 font-mono">
                        #{queuePosition.toLocaleString()}
                    </div>
                </div>

                <p className="text-sm text-gray-400">
                    We'll notify <span className="text-white font-medium">{email}</span> when your agent is ready.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Pricing Selection */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 backdrop-blur-md">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-cyan-500/30 transition-colors cursor-pointer" onClick={() => setInterests(prev => ({ ...prev, website: !prev.website }))}>
                        <div className="flex items-center gap-3">
                            <Checkbox checked={interests.website} onCheckedChange={(c) => setInterests(prev => ({ ...prev, website: !!c }))} />
                            <div className="text-left">
                                <div className="font-bold text-white">Smart Website Listing</div>
                                <div className="text-xs text-gray-400">Your own branded store</div>
                            </div>
                        </div>
                        <div className="font-mono text-cyan-400 font-bold">$1.00/mo</div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-purple-500/30 transition-colors cursor-pointer" onClick={() => setInterests(prev => ({ ...prev, chatbot: !prev.chatbot }))}>
                        <div className="flex items-center gap-3">
                            <Checkbox checked={interests.chatbot} onCheckedChange={(c) => setInterests(prev => ({ ...prev, chatbot: !!c }))} />
                            <div className="text-left">
                                <div className="font-bold text-white">AI Cashier Chatbot</div>
                                <div className="text-xs text-gray-400">Auto-replies & orders</div>
                            </div>
                        </div>
                        <div className="font-mono text-purple-400 font-bold">$0.99/mo</div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total Monthly:</span>
                        <span className="text-2xl font-bold text-white font-mono">${totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                {/* Email Input */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                    <div className="relative flex gap-2">
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-black/90 border-white/10 text-white placeholder:text-gray-500 h-12"
                            required
                        />
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-white text-black hover:bg-cyan-400 hover:text-black font-bold h-12 px-6 transition-all duration-300"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'JOIN'}
                        </Button>
                    </div>
                </div>

                <p className="text-xs text-center text-gray-500">
                    Limited spots available for the Beta program.
                </p>
            </form>
        </div>
    );
};
