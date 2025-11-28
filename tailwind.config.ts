import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#030712', // Very dark blue/black (like landing page)
                foreground: "var(--foreground)",
                // Axiom Blue Theme - Professional & Premium
                surface: '#0f172a',    // Lighter dark for cards

                // This is the blue gradient that impressed you in the "Initialize" button
                primary: {
                    DEFAULT: '#3b82f6', // Blue-500
                    glow: '#60a5fa',    // Blue-400
                    dark: '#1d4ed8',    // Blue-700
                },

                // Border colors instead of glowing green
                border: {
                    DEFAULT: 'rgba(255, 255, 255, 0.1)', // Subtle transparent borders
                    hover: 'rgba(59, 130, 246, 0.5)',    // Blue glow on hover
                },

                // Keep some existing colors for compatibility
                'axiom-dark': '#050505',
                'axiom-panel': '#0F111A',
                'axiom-glass': 'rgba(255, 255, 255, 0.03)',
                'axiom-cyan': '#00F0FF',
                'axiom-purple': '#7000FF',
                'axiom-neon-green': '#39FF14', // Keep for reference but won't use
                'axiom-red': '#FF003C',
                'axiom-success': '#00FF94',
                'axiom-warning': '#FCEE0A',
                'holo-cyan-pulse': '#00F0FF',
                'neon-purple-fade': 'rgba(157, 78, 221, 0.3)',
                'holo-blue-fade': 'rgba(79, 172, 254, 0.7)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Unified with landing page
                orbitron: ['var(--font-orbitron)'], // Keep for reference
                rajdhani: ['var(--font-rajdhani)'], // Keep for reference
                mono: ['var(--font-mono)'],
                display: ['var(--font-display)'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'scan-line': 'scan-line 2s linear infinite',
                'hologram-flicker': 'hologram-flicker 0.1s infinite',
                'spin-slow': 'spin 8s linear infinite',
                'spin-reverse-slow': 'spin-reverse 10s linear infinite',
                'spin-fast': 'spin 1s linear infinite',
                'scan': 'scan 3s linear infinite',
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