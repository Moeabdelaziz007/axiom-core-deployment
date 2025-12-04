'use client';

/**
 * 🚀 AXIOM RESET - Linear-Style Landing Page
 * Inspired by Linear.app with Carbon Fiber + Neon aesthetic
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ChefHat, Building, Pill, Settings, GraduationCap, ArrowRight, Command, Sparkles } from 'lucide-react';

// ============================================================================
// AGENT DATA
// ============================================================================

const AGENTS = [
  {
    id: 'sofra',
    name: 'سفرة',
    nameEn: 'Sofra',
    tagline: 'مدير مطعمك الذكي',
    color: '#FF6B5B',
    icon: ChefHat,
    image: '/agents/sofra.png',
    size: 'large' // spans 2 columns
  },
  {
    id: 'tajer',
    name: 'تاجر',
    nameEn: 'Tajer',
    tagline: 'صائد الصفقات العقارية',
    color: '#FFB347',
    icon: Building,
    image: '/agents/tajer.png',
    size: 'normal'
  },
  {
    id: 'drmoe',
    name: 'د. مو',
    nameEn: 'Dr. Moe',
    tagline: 'الحارس الأمين للصيدلية',
    color: '#00C4B4',
    icon: Pill,
    image: null,
    size: 'normal'
  },
  {
    id: 'tirs',
    name: 'تِرس',
    nameEn: 'Tirs',
    tagline: 'همزة الوصل الصناعية',
    color: '#8B9EB7',
    icon: Settings,
    image: null,
    size: 'normal'
  },
  {
    id: 'ostaz',
    name: 'أستاذ',
    nameEn: 'Ostaz',
    tagline: 'المعلم الخصوصي الذكي',
    color: '#7C5CFF',
    icon: GraduationCap,
    image: null,
    size: 'normal'
  },
];

// ============================================================================
// SPOTLIGHT CARD COMPONENT
// ============================================================================

function SpotlightCard({ children, className = '', glowColor = '#00F0FF' }: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative group ${className}`}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Spotlight Border Effect */}
      <motion.div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${glowColor}20, transparent 40%)`,
        }}
      />

      {/* Border Glow */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${glowColor}40, transparent 50%, ${glowColor}20)`,
        }}
      />

      {/* Card Content */}
      <div className="relative bg-[#0B0E14]/80 backdrop-blur-xl rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors overflow-hidden h-full">
        {children}
      </div>
    </motion.div>
  );
}

// ============================================================================
// PARTICLES BACKGROUND
// ============================================================================

function ParticlesBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Stars */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-px bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#00F0FF]/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#10B981]/5 rounded-full blur-[150px]" />
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setEmail('');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-[#030712] text-white overflow-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <ParticlesBackground />

      {/* Carbon Fiber Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 10px),
            repeating-linear-gradient(-45deg, #fff 0px, #fff 1px, transparent 1px, transparent 10px)
          `,
          backgroundSize: '14px 14px'
        }}
      />

      {/* ================================================================ */}
      {/* NAVBAR */}
      {/* ================================================================ */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl tracking-tight">
              <span className="text-white">Axiom</span>
              <span className="text-[#10B981]">.</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
              <Link href="#agents" className="hover:text-white transition-colors">Agents</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="#waitlist"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ================================================================ */}
      {/* HERO SECTION */}
      {/* ================================================================ */}
      <section className="relative z-10 pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono mb-8"
          >
            <Sparkles className="w-3 h-3 text-[#10B981]" />
            <span className="text-slate-400 uppercase tracking-wider">System Launch</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
              {lang === 'ar' ? 'نظام التشغيل' : 'The Business'}
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#00F0FF] via-[#10B981] to-[#00F0FF] bg-clip-text text-transparent">
              {lang === 'ar' ? 'للأعمال' : 'OS'}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto"
          >
            {lang === 'ar'
              ? 'وكلاء ذكاء اصطناعي يديرون عملك بينما أنت مرتاح. من المطاعم للعقارات للصيدليات.'
              : 'AI agents that run your business while you rest. From restaurants to real estate to pharmacy.'}
          </motion.p>

          {/* CMD+K Waitlist Input */}
          <motion.form
            id="waitlist"
            onSubmit={handleWaitlist}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto"
          >
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00F0FF]/20 via-[#10B981]/20 to-[#00F0FF]/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />

              {/* Input Container */}
              <div className="relative flex items-center bg-[#0B0E14] rounded-xl border border-white/10 group-hover:border-white/20 group-focus-within:border-[#10B981]/50 transition-colors">
                <div className="flex items-center gap-2 px-4 py-4 border-r border-white/10 text-slate-500">
                  <Command className="w-4 h-4" />
                  <span className="text-xs font-mono">K</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === 'ar' ? 'your@email.com' : 'your@email.com'}
                  className="flex-1 bg-transparent px-4 py-4 text-white placeholder-slate-500 focus:outline-none text-sm"
                  dir="ltr"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 m-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? '...' : lang === 'ar' ? 'انضم' : 'Join'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      </section>

      {/* ================================================================ */}
      {/* AGENT BENTO GRID */}
      {/* ================================================================ */}
      <section id="agents" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-[#10B981] uppercase tracking-widest mb-4">
              Neural Fleet
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              {lang === 'ar' ? 'وكلاء الذكاء الاصطناعي' : 'AI Agents'}
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map((agent, index) => {
              const Icon = agent.icon;
              return (
                <Link href={`/agents/${agent.id}`} key={agent.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={agent.size === 'large' ? 'md:col-span-2' : ''}
                  >
                    <SpotlightCard glowColor={agent.color} className="h-full">
                      <div className="p-8 flex flex-col h-full min-h-[200px]">
                        {/* Icon */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                          style={{ backgroundColor: `${agent.color}15` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: agent.color }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                            <span>{agent.name}</span>
                            <span className="text-sm text-slate-500 font-normal">{agent.nameEn}</span>
                          </h3>
                          <p className="text-slate-400">{agent.tagline}</p>
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-end mt-6">
                          <ArrowRight
                            className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all"
                          />
                        </div>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CTA SECTION */}
      {/* ================================================================ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {lang === 'ar' ? 'جاهز تبدأ؟' : 'Ready to start?'}
          </h2>
          <p className="text-slate-400 mb-8">
            {lang === 'ar'
              ? '14 يوم تجربة مجانية. بدون بطاقة ائتمان.'
              : '14-day free trial. No credit card required.'}
          </p>
          <Link
            href="#waitlist"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            {lang === 'ar' ? 'ابدأ الآن' : 'Get Started'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-slate-500">
            © 2024 Axiom RESET. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="https://twitter.com" className="hover:text-white transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>

      {/* ================================================================ */}
      {/* SUCCESS TOAST (Linear Style) */}
      {/* ================================================================ */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 bg-[#0B0E14] border border-[#10B981]/30 rounded-xl shadow-2xl"
        >
          <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {lang === 'ar' ? 'تم التسجيل بنجاح!' : 'Successfully joined!'}
            </p>
            <p className="text-xs text-slate-400">
              {lang === 'ar' ? 'سنتواصل معك قريباً' : "We'll be in touch soon"}
            </p>
          </div>
        </motion.div>
      )}
    </main>
  );
}
