'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Shield, CircleDollarSign } from 'lucide-react';
import { WalletButton } from './WalletButton';
import type { FeatureCard, NavItem } from '@/types/landing';

// Placeholder Logo Component
const AxiomLogo = () => (
  <div className="flex items-center gap-3">
    <div className="relative w-10 h-10">
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00F0FF', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#7000FF', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <polygon
          points="20,5 35,15 35,25 20,35 5,25 5,15"
          fill="none"
          stroke="url(#logo-gradient)"
          strokeWidth="2"
        />
        <text x="20" y="25" textAnchor="middle" fill="url(#logo-gradient)" fontSize="16" fontWeight="bold">
          A
        </text>
        <circle cx="8" cy="12" r="1" fill="#00F0FF" />
        <circle cx="32" cy="12" r="1" fill="#00F0FF" />
        <circle cx="8" cy="28" r="1" fill="#7000FF" />
        <circle cx="32" cy="28" r="1" fill="#7000FF" />
      </svg>
    </div>
    <span className="text-xl font-bold tracking-wider" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      AXIOM ID
    </span>
  </div>
);

// Header Component
const Header = () => {
  const navItems: NavItem[] = [
    { label: 'FEATURES', href: '#features' },
    { label: 'SOLUTIONS', href: '#solutions' },
    { label: 'PRICING', href: '#pricing' },
    { label: 'GIGAFACTORY', href: '#gigafactory' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-full px-8 py-4">
          <div className="flex items-center justify-between">
            <AxiomLogo />
            
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-sm font-medium text-gray-300 hover:text-[#00F0FF] transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00F0FF] to-[#7000FF] group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <WalletButton />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// Background Effects Component
const BackgroundEffects = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Circuit Pattern Grid */}
      <div className="absolute inset-0 circuit-pattern opacity-30" />
      
      {/* Holographic Head Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
      >
        <div className="relative w-full h-full">
          {/* Holographic Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00F0FF]/20 to-[#7000FF]/20 blur-3xl animate-pulse" />
          
          {/* Digital Soul Label */}
          <div className="absolute top-1/4 right-1/4 glass-panel px-4 py-2 rounded-lg">
            <span className="text-sm font-bold text-gradient-cyan-purple">DIGITAL SOUL</span>
          </div>
          
          {/* Binary Code Effect */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="text-[#00F0FF] text-xs font-mono leading-tight">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="whitespace-nowrap">
                  {Array.from({ length: 40 }).map(() => Math.random() > 0.5 ? '1' : '0').join('')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#00F0FF]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
      <BackgroundEffects />
      
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="heading-hero mb-6">
            <span className="text-gradient-cyan-purple">SOVEREIGN AI.</span>{' '}
            <span className="text-gradient-gold">ZERO COMPROMISE.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Forge your digital workforce. Own their minds. Monetize their actions.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-[#7000FF] to-[#00F0FF] text-white font-bold text-lg overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3">
            ENTER THE GIGAFACTORY
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] to-[#7000FF] opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </div>
    </section>
  );
};

// Feature Cards Component
const FeatureCards = () => {
  const features: FeatureCard[] = [
    {
      icon: <Cpu className="w-12 h-12" style={{ color: '#00F0FF' }} />,
      title: 'Digital Soul Protocol',
      description: 'Create and govern autonomous AI entities with full ownership and control over their identity.',
    },
    {
      icon: <Shield className="w-12 h-12" style={{ color: '#00F0FF' }} />,
      title: 'Turnkey MPC Wallets',
      description: 'Secure, multi-party computation wallets for seamless management of digital assets and access.',
    },
    {
      icon: <CircleDollarSign className="w-12 h-12" style={{ color: '#00F0FF' }} />,
      title: '$0.99 Zero-Cost Arch',
      description: 'Leverage cost-effective AI infrastructure with sustainable, near-zero transaction fees.',
    },
  ];

  return (
    <section className="relative px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="glass-panel rounded-2xl p-8 group cursor-pointer"
            >
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-[#00F0FF]/10 to-[#7000FF]/10 w-fit holo-glow">
                {feature.icon}
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {feature.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Component
export default function SovereignLanding() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      <Header />
      <HeroSection />
      <FeatureCards />
    </div>
  );
}