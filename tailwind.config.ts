import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
    	extend: {
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			surface: '#0f172a',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				glow: '#60a5fa',
    				dark: '#1d4ed8',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			border: 'hsl(var(--border))',
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
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		fontFamily: {
    			sans: [
    				'Inter',
    				'sans-serif'
    			],
    			orbitron: [
    				'var(--font-orbitron)'
    			],
    			rajdhani: [
    				'var(--font-rajdhani)'
    			],
    			mono: [
    				'var(--font-mono)'
    			],
    			display: [
    				'var(--font-display)'
    			]
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
    			scan: 'scan 3s linear infinite'
    		},
    		keyframes: {
    			'pulse-slow': {
    				'0%, 100%': {
    					opacity: '1'
    				},
    				'50%': {
    					opacity: '0.8'
    				}
    			},
    			fadeInUp: {
    				from: {
    					opacity: '0',
    					transform: 'translateY(20px)'
    				},
    				to: {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			glowPulse: {
    				'0%, 100%': {
    					boxShadow: '0 0 10px rgba(57, 255, 20, 0.5), 0 0 20px rgba(57, 255, 20, 0.3)'
    				},
    				'50%': {
    					boxShadow: '0 0 20px rgba(57, 255, 20, 0.8), 0 0 40px rgba(57, 255, 20, 0.6)'
    				}
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
};
export default config;