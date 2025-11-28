import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Activity, GitCommit, AlertTriangle } from 'lucide-react';

interface TohaMonitorProps {
    entropy?: number;        // 0.0 to 1.0 (Persistence Entropy)
    betti_1?: number;        // Number of Loops (Logic Cycles)
    status?: 'GROUNDED' | 'HALLUCINATION' | 'ANALYZING';
}

export const TohaMonitor: React.FC<TohaMonitorProps> = ({
    entropy = 0.65,
    betti_1 = 5,
    status = 'GROUNDED'
}) => {

    // Dynamic color based on status
    const themeColor =
        status === 'GROUNDED' ? '#00e5ff' : // Cyan
            status === 'HALLUCINATION' ? '#ff003c' : // Cyberpunk Red
                '#bbbbbb'; // Grey (Analyzing)

    // Generate Wave Path based on Entropy
    // Higher entropy = Complex structured wave
    // Low entropy = Flat or chaotic noise
    const generateWavePath = (width: number, height: number, offset: number) => {
        const points = [];
        const amplitude = status === 'HALLUCINATION' ? 10 : 30; // Low amplitude for hallucination (collapse)
        const frequency = status === 'HALLUCINATION' ? 0.2 : 0.05;

        for (let x = 0; x <= width; x += 10) {
            // Noise factor based on inverse entropy (Lower entropy = more noise/jitter)
            const noise = (Math.random() - 0.5) * (1 - entropy) * 20;
            const y = height / 2 + Math.sin((x + offset) * frequency) * amplitude * entropy + noise;
            points.push(`${x},${y}`);
        }
        return `M ${points.join(' L ')}`;
    };

    // Animation State
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setOffset(prev => prev + 5);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-full bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl p-4 flex flex-col justify-between overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center z-10 mb-2">
                <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" style={{ color: themeColor }} />
                    <h2 className="text-sm font-orbitron text-gray-300 tracking-wider">TOHA MONITOR</h2>
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 rounded bg-gray-900 border border-gray-700">
                    <div className={`w-2 h-2 rounded-full ${status === 'ANALYZING' ? 'animate-pulse bg-gray-400' : 'bg-current'}`} style={{ color: themeColor }} />
                    <span className="text-[10px] font-mono font-bold" style={{ color: themeColor }}>{status}</span>
                </div>
            </div>

            {/* --- The Oscilloscope (Visualizing Truth) --- */}
            <div className="relative flex-grow w-full bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800/50">
                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

                {/* The Wave */}
                <svg className="absolute inset-0 w-full h-full">
                    <path
                        d={generateWavePath(400, 150, offset)} // Approx width/height
                        fill="none"
                        stroke={themeColor}
                        strokeWidth="2"
                        className="transition-colors duration-500"
                        style={{ filter: `drop-shadow(0 0 5px ${themeColor})` }}
                    />
                </svg>

                {/* Hallucination Warning Overlay */}
                {status === 'HALLUCINATION' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 animate-pulse">
                        <div className="flex flex-col items-center">
                            <AlertTriangle className="w-8 h-8 text-red-500 mb-1" />
                            <span className="text-red-400 font-orbitron text-xs tracking-widest">TOPOLOGY COLLAPSE</span>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Metrics Footer (Betti Numbers) --- */}
            <div className="grid grid-cols-3 gap-2 mt-3 z-10">
                {/* Persistence Entropy */}
                <div className="bg-gray-800/50 rounded p-2 flex flex-col items-center border border-gray-700">
                    <span className="text-[9px] text-gray-500 uppercase flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Entropy
                    </span>
                    <span className="text-lg font-mono text-white">{entropy.toFixed(2)}</span>
                </div>

                {/* Betti-1 (Loops) */}
                <div className="bg-gray-800/50 rounded p-2 flex flex-col items-center border border-gray-700">
                    <span className="text-[9px] text-gray-500 uppercase flex items-center gap-1">
                        <GitCommit className="w-3 h-3" /> Loops (β₁)
                    </span>
                    <span className="text-lg font-mono text-cyan-300">{betti_1}</span>
                </div>

                {/* Topological Stability */}
                <div className="bg-gray-800/50 rounded p-2 flex flex-col items-center border border-gray-700">
                    <span className="text-[9px] text-gray-500 uppercase">Stability</span>
                    <div className="w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: themeColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${entropy * 100}%` }}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};
