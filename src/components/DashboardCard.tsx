'use client';

import React from 'react';

interface DashboardCardProps {
    title?: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    glow?: 'cyan' | 'purple' | 'none';
    price?: string | null; // optional price label, e.g. "$0.99"
}

export const DashboardCard = ({
    title,
    icon: Icon,
    children,
    className = '',
    glow = 'none',
    price,
}: DashboardCardProps) => {
    const glowStyles = {
        cyan: 'shadow-[0_0_20px_rgba(0,240,255,0.15)] border-axiom-cyan/30 hover:shadow-[0_0_40px_rgba(0,240,255,0.3)] hover:border-axiom-cyan/50',
        purple: 'shadow-[0_0_20px_rgba(112,0,255,0.15)] border-axiom-purple/30 hover:shadow-[0_0_40px_rgba(112,0,255,0.3)] hover:border-axiom-purple/50',
        none: 'border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]',
    };

    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            className={`group relative bg-[#0F111A]/60 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${glowStyles[glow]} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Quantum Ripple Effect */}
            {isHovered && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
                </div>
            )}

            {/* Enhanced Holographic overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

            {/* Animated border glow */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${glow === 'cyan' ? 'bg-gradient-to-r from-axiom-cyan/20 via-transparent to-axiom-cyan/20' :
                    glow === 'purple' ? 'bg-gradient-to-r from-axiom-purple/20 via-transparent to-axiom-purple/20' : ''
                } blur-xl`} />

            {(title || Icon) && (
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3 relative z-10">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={`transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
                                <Icon className={`w-5 h-5 ${glow === 'cyan' ? 'text-axiom-cyan' : glow === 'purple' ? 'text-axiom-purple' : 'text-white'}`} />
                            </div>
                        )}
                        {title && <h3 className="text-lg font-orbitron font-bold text-white tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-axiom-cyan group-hover:to-axiom-purple transition-all duration-300">{title}</h3>}
                    </div>
                    {price && <span className="text-sm font-mono text-axiom-cyan bg-axiom-cyan/10 px-2 py-0.5 rounded border border-axiom-cyan/30 group-hover:bg-axiom-cyan/20 transition-all">{price}</span>}
                </div>
            )}
            <div className="relative z-10">{children}</div>
        </div>
    );
};
