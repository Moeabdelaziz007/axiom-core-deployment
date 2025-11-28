import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface MizanGaugeProps {
    safetyScore?: number;      // 0.0 to 1.0 (Safety/Values)
    efficiencyScore?: number;  // 0.0 to 1.0 (Cost/Speed)
    balanceScore?: number;     // 0.0 to 1.0 (The Final Adl Score)
    barakaFactor?: number;     // 0.0 to 1.0 (Spiritual Bonus)
    decision?: string;         // 'APPROVED' | 'REJECTED' | 'CONDITIONAL'
}

export const MizanGauge: React.FC<MizanGaugeProps> = ({
    safetyScore = 0.5,
    efficiencyScore = 0.5,
    balanceScore = 0.5,
    barakaFactor = 0.0,
    decision = "ANALYZING"
}) => {

    // Calculate Needle Rotation (-45deg to 45deg)
    // 0.5 is center (0deg). <0.5 tilts left, >0.5 tilts right
    // But strictly speaking, Mizan seeks high balance (1.0), not just 'middle'.
    // Let's visualize Balance Score as the "Health" of the decision.

    const statusColor =
        decision === 'APPROVED' ? '#00ffaa' : // Neon Green
            decision === 'REJECTED' ? '#ff0055' : // Neon Red
                '#00ddee';                            // Neon Cyan (Conditional)

    return (
        <div className="relative w-full h-full bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6 flex flex-col items-center justify-between overflow-hidden group">

            {/* --- Background Glow (Baraka Aura) --- */}
            <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none"
            />

            {/* Header */}
            <div className="flex items-center space-x-2 w-full justify-start z-10">
                <Scale className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-orbitron text-cyan-100 tracking-wider">MIZAN GAUGE</h2>
            </div>

            {/* --- The Scales (Visual Bars) --- */}
            <div className="flex w-full justify-between items-end h-32 px-4 mt-4 relative z-10">

                {/* Left Pan: Safety (Values) */}
                <div className="flex flex-col items-center space-y-2 w-1/3">
                    <div className="text-xs text-emerald-400 font-mono mb-1 flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-1" /> SAFETY
                    </div>
                    <div className="w-full bg-gray-800 rounded-t-lg h-24 relative overflow-hidden border border-emerald-500/30">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${safetyScore * 100}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                            className="absolute bottom-0 w-full bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        />
                        <motion.div
                            className="absolute bottom-0 w-full bg-emerald-400 h-1"
                            animate={{ bottom: `${safetyScore * 100}%` }}
                        />
                    </div>
                    <span className="text-emerald-300 font-bold">{(safetyScore * 100).toFixed(0)}%</span>
                </div>

                {/* Center: The Fulcrum (Balance Indicator) */}
                <div className="flex flex-col items-center justify-end h-full w-1/4 pb-2">
                    {/* Baraka Star */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="mb-4"
                        style={{ opacity: barakaFactor }}
                    >
                        <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]" />
                    </motion.div>

                    {/* Balance Arc */}
                    <div className="relative w-24 h-12 overflow-hidden">
                        <div className="w-24 h-24 rounded-full border-4 border-gray-700 border-t-cyan-500 border-r-transparent border-l-transparent absolute top-0" />
                        {/* Needle */}
                        <motion.div
                            className="absolute bottom-0 left-1/2 w-1 h-12 bg-white origin-bottom rounded-full shadow-[0_0_10px_white]"
                            animate={{ rotate: (balanceScore - 0.5) * 180 }} // Map 0..1 to -90..90 deg
                            transition={{ type: "spring", damping: 10 }}
                            style={{ zIndex: 20 }}
                        />
                    </div>
                    <div className="mt-2 text-xs text-cyan-300 font-mono tracking-widest">ADL INDEX</div>
                </div>

                {/* Right Pan: Efficiency (Cost) */}
                <div className="flex flex-col items-center space-y-2 w-1/3">
                    <div className="text-xs text-violet-400 font-mono mb-1 flex items-center">
                        EFFICIENCY <Zap className="w-3 h-3 ml-1" />
                    </div>
                    <div className="w-full bg-gray-800 rounded-t-lg h-24 relative overflow-hidden border border-violet-500/30">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${efficiencyScore * 100}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                            className="absolute bottom-0 w-full bg-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                        />
                        <motion.div
                            className="absolute bottom-0 w-full bg-violet-400 h-1"
                            animate={{ bottom: `${efficiencyScore * 100}%` }}
                        />
                    </div>
                    <span className="text-violet-300 font-bold">{(efficiencyScore * 100).toFixed(0)}%</span>
                </div>

            </div>

            {/* --- Decision Footer --- */}
            <div className="w-full mt-4 border-t border-gray-700/50 pt-3 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase">System Verdict</span>
                    <motion.span
                        key={decision}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-bold font-orbitron tracking-widest"
                        style={{ color: statusColor, textShadow: `0 0 10px ${statusColor}` }}
                    >
                        {decision}
                    </motion.span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 uppercase">Baraka Bonus</span>
                    <span className="text-sm font-mono text-yellow-300">+{barakaFactor.toFixed(2)}x</span>
                </div>
            </div>

        </div>
    );
};
