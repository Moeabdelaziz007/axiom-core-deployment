'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Flame,
    Target,
    CheckCircle,
    Clock,
    Brain,
    Coins,
    Zap,
    TrendingUp,
    Award
} from 'lucide-react';
import { BrandingFooter } from '@/components/AxiomUI';

// --- Mock Data ---
const USER_STATS = {
    aauBalance: 1250,
    streak: 5,
    rank: 42,
    dailyXP: 450,
    dailyGoal: 1000,
};

const LEADERBOARD = [
    { id: 1, name: 'Ahmed_Cairo', score: 12500, badge: '👑' },
    { id: 2, name: 'Layla_Alex', score: 10300, badge: '🥈' },
    { id: 3, name: 'Omar_Tunis', score: 9800, badge: '🥉' },
    { id: 4, name: 'Sarah_Tech', score: 8500, badge: '🚀' },
    { id: 5, name: 'You', score: 1250, badge: '🦅' },
];

const BOUNTIES = [
    {
        id: 1,
        agent: 'Sofra',
        type: 'Sentiment Analysis',
        title: 'Egyptian Dialect Review',
        description: 'Classify restaurant reviews as Positive, Negative, or Neutral.',
        reward: 50,
        difficulty: 'Easy',
        timeLeft: '2h 15m',
        tags: ['Arabic', 'Food'],
        color: 'from-orange-500 to-red-500'
    },
    {
        id: 2,
        agent: 'Aqar',
        type: 'Price Estimation',
        title: 'Nasr City Valuation',
        description: 'Estimate the price range for 3-bedroom apartments in Zone 8.',
        reward: 120,
        difficulty: 'Medium',
        timeLeft: '5h 30m',
        tags: ['Real Estate', 'Cairo'],
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 3,
        agent: 'Mawid',
        type: 'Intent Recognition',
        title: 'Booking Requests',
        description: 'Identify if the user wants to "Book", "Cancel", or "Reschedule".',
        reward: 75,
        difficulty: 'Easy',
        timeLeft: '1h 00m',
        tags: ['NLP', 'Scheduling'],
        color: 'from-purple-500 to-pink-500'
    }
];

// --- Components ---

const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
        <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg bg-white/5 ${color.replace('from-', 'text-').split(' ')[0]}`}>
                <Icon size={20} />
            </div>
            {subtext && <span className="text-xs text-white/40">{subtext}</span>}
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-white/60 uppercase tracking-wider">{label}</div>
    </motion.div>
);

const BountyCard = ({ bounty }: { bounty: any }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-black/60 border border-white/10 rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
    >
        {/* Gradient Border Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${bounty.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${bounty.color}`} />

        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${bounty.color} flex items-center justify-center text-white font-bold`}>
                    {bounty.agent[0]}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {bounty.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>{bounty.agent}</span>
                        <span>•</span>
                        <span>{bounty.type}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded-lg border border-yellow-400/20">
                    <Coins size={14} />
                    <span>+{bounty.reward} AAU</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                    <Clock size={12} />
                    <span>{bounty.timeLeft}</span>
                </div>
            </div>
        </div>

        <p className="text-sm text-white/70 mb-4 line-clamp-2">
            {bounty.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
            <div className="flex gap-2">
                {bounty.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/5">
                        {tag}
                    </span>
                ))}
            </div>
            <button className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2">
                Start Task <Zap size={14} />
            </button>
        </div>
    </motion.div>
);

const LeaderboardRow = ({ rank, name, score, badge, isUser }: any) => (
    <div className={`flex items-center justify-between p-3 rounded-xl mb-2 ${isUser ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-white/5 border border-white/5'}`}>
        <div className="flex items-center gap-4">
            <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${rank <= 3 ? 'bg-yellow-500/20 text-yellow-500' : 'text-white/50'}`}>
                {rank}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-white font-medium">{name}</span>
                <span>{badge}</span>
            </div>
        </div>
        <div className="font-mono text-cyan-400 font-bold">
            {score.toLocaleString()} AAU
        </div>
    </div>
);

export default function EarnPage() {
    const [activeTab, setActiveTab] = useState('bounties');

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black -z-10" />
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-400 mb-2">
                            <Brain className="w-5 h-5" />
                            <span className="text-sm font-mono tracking-wider uppercase">Agent School</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 mb-4">
                            Teach AI. <br />
                            <span className="text-cyan-400">Earn Capital.</span>
                        </h1>
                        <p className="text-white/60 max-w-xl">
                            Complete micro-tasks to train our autonomous agents. Earn AAU credits and stake them in the AI Hedge Fund for real yield.
                        </p>
                    </div>

                    {/* User Quick Stats */}
                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Your Balance</div>
                            <div className="text-3xl font-mono font-bold text-yellow-400 flex items-center justify-end gap-2">
                                {USER_STATS.aauBalance.toLocaleString()} <span className="text-sm text-yellow-400/50">AAU</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <StatCard
                        icon={Flame}
                        label="Daily Streak"
                        value={`${USER_STATS.streak} Days`}
                        color="from-orange-500 to-red-500"
                    />
                    <StatCard
                        icon={Target}
                        label="Daily Goal"
                        value={`${USER_STATS.dailyXP}/${USER_STATS.dailyGoal}`}
                        subtext="45% Complete"
                        color="from-blue-500 to-cyan-500"
                    />
                    <StatCard
                        icon={Trophy}
                        label="Global Rank"
                        value={`#${USER_STATS.rank}`}
                        subtext="Top 5%"
                        color="from-yellow-500 to-amber-500"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Accuracy"
                        value="98.5%"
                        subtext="Elite Tier"
                        color="from-green-500 to-emerald-500"
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Bounties (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Target className="text-cyan-400" />
                                Active Bounties
                            </h2>
                            <div className="flex gap-2">
                                {['All', 'Easy', 'Medium', 'Hard'].map((filter) => (
                                    <button
                                        key={filter}
                                        className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {BOUNTIES.map((bounty) => (
                                <BountyCard key={bounty.id} bounty={bounty} />
                            ))}
                        </div>

                        {/* Daily Challenge Banner */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Award size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-yellow-400 mb-2 font-bold">
                                    <Flame size={18} /> DAILY CHALLENGE
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">The Cairo Pricing Master</h3>
                                <p className="text-white/70 mb-4 max-w-md">
                                    Complete 10 "Price Estimation" tasks for Agent Aqar with {'>'}90% accuracy to unlock the "Market Maker" badge.
                                </p>
                                <button className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">
                                    Accept Challenge
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Leaderboard (1/3 width) */}
                    <div className="space-y-6">
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Trophy className="text-yellow-500" />
                                    Top Trainers
                                </h2>
                                <span className="text-xs text-white/40">This Week</span>
                            </div>

                            <div className="space-y-2">
                                {LEADERBOARD.map((user) => (
                                    <LeaderboardRow
                                        key={user.id}
                                        rank={user.id}
                                        name={user.name}
                                        score={user.score}
                                        badge={user.badge}
                                        isUser={user.name === 'You'}
                                    />
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                <p className="text-xs text-white/40 mb-2">Next Reward Distribution in</p>
                                <div className="text-xl font-mono font-bold text-cyan-400">14:22:05</div>
                            </div>
                        </div>

                        {/* Referral Mini-Card */}
                        <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-2xl p-6">
                            <h3 className="font-bold text-white mb-2">Invite a Friend</h3>
                            <p className="text-sm text-white/60 mb-4">
                                Earn 200 AAU for every friend who completes their first 5 tasks.
                            </p>
                            <button className="w-full py-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 rounded-lg text-sm font-bold hover:bg-cyan-500/20 transition-colors">
                                Copy Invite Link
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <BrandingFooter />
        </div>
    );
}
