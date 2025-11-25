import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                'axiom-dark': '#050505',
                'axiom-panel': '#0F111A',
                'axiom-glass': 'rgba(255, 255, 255, 0.03)',
                'axiom-cyan': '#00F0FF',
                'axiom-purple': '#7000FF',
                'axiom-neon-green': '#39FF14',
                'axiom-red': '#FF003C',
                'axiom-success': '#00FF94',
                'axiom-warning': '#FCEE0A',
                'holo-cyan-pulse': '#00F0FF',
                'neon-purple-fade': 'rgba(157, 78, 221, 0.3)',
                'holo-blue-fade': 'rgba(79, 172, 254, 0.7)',
            },
            fontFamily: {
                sans: ['var(--font-sans)'],
                orbitron: ['var(--font-orbitron)'],
                rajdhani: ['var(--font-rajdhani)'],
                mono: ['var(--font-mono)'],
                display: ['var(--font-display)'],
            },
            animation: {
                'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
            },
            keyframes: {
                'pulse-slow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                fadeInUp: {
                    'from': { opacity: '0', transform: 'translateY(20px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                glowPulse: {
                    '0%, 100%': { 
                        boxShadow: '0 0 10px rgba(57, 255, 20, 0.5), 0 0 20px rgba(57, 255, 20, 0.3)'
                    },
                    '50%': { 
                        boxShadow: '0 0 20px rgba(57, 255, 20, 0.8), 0 0 40px rgba(57, 255, 20, 0.6)'
                    },
                }
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
};
export default config;