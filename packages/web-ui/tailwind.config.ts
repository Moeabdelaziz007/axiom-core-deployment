import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        neon: '#00f3ff', // Cyan
        neonBlue: '#3b82f6',
        neonPurple: '#a855f7',
        matrix: '#00ff41',
        alert: '#ff003c',
        tesla: '#cd7f32', // Copper
        glass: 'rgba(17, 24, 39, 0.7)',
        surface: '#050505', // Darker surface
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.neon"), 0 0 20px theme("colors.neon")',
        'neon-strong': '0 0 10px theme("colors.neon"), 0 0 40px theme("colors.neon"), 0 0 80px theme("colors.neon")',
        'alert': '0 0 5px theme("colors.alert"), 0 0 20px theme("colors.alert")',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'hologram': 'hologram-flicker 3s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'orb-spin': 'spin 10s linear infinite',
        'orb-breathe': 'breathe 4s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'hologram-flicker': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1) blur(0px)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2) blur(1px)' },
          '52%': { opacity: '0.4', filter: 'brightness(0.8) blur(2px)' },
          '54%': { opacity: '0.9', filter: 'brightness(1.1) blur(0px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
