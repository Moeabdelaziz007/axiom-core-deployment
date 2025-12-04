'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, ShieldCheck, ChefHat, Building, Activity, Settings, BookOpen, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

// Translations
const t = {
  en: {
    tagline: 'THE SOVEREIGN BUSINESS OS',
    title1: 'Your AI Team.',
    title2: 'Zero Commission.',
    subtitle: 'Deploy 5 specialized AI agents to automate your business. Keep 100% of your profits.',
    emailPlaceholder: 'Enter your email to join...',
    joinButton: 'Join Waitlist',
    agentsTitle: 'Meet Your AI Workforce',
    valueTitle: "AI Won't Replace You",
    valueSubtitle: 'AI will amplify your capabilities and multiply your income.',
    agents: 'Agents',
    about: 'About',
    footer: 'System Status: Operational • MENA Region',
  },
  ar: {
    tagline: 'نظام التشغيل السيادي للأعمال',
    title1: 'فريقك الذكي.',
    title2: 'صفر عمولة.',
    subtitle: 'خمس وكلاء ذكاء اصطناعي متخصصين لتشغيل عملك. احتفظ بـ100% من أرباحك.',
    emailPlaceholder: 'أدخل بريدك الإلكتروني...',
    joinButton: 'انضم للقائمة',
    agentsTitle: 'تعرّف على فريقك الذكي',
    valueTitle: 'الذكاء الاصطناعي مش بديلك',
    valueSubtitle: 'هيضاعف قدراتك، يزوّد دخلك، ويفتحلك أبواب نجاح ما كنت تتخيلها.',
    agents: 'الوكلاء',
    about: 'عنّا',
    footer: 'حالة النظام: يعمل • منطقة الشرق الأوسط',
  }
};

// Agents
const agents = [
  { id: 'sofra', name: 'Sofra', nameAr: 'سفرة', role: 'Restaurant OS', roleAr: 'نظام المطاعم', icon: <ChefHat className="w-6 h-6" />, color: '#FF6B5B' },
  { id: 'tajer', name: 'Tajer', nameAr: 'تاجر', role: 'Real Estate', roleAr: 'العقارات', icon: <Building className="w-6 h-6" />, color: '#FFB347' },
  { id: 'drmoe', name: 'Dr. Moe', nameAr: 'د. مو', role: 'Pharmacy AI', roleAr: 'الصيدلية الذكية', icon: <Activity className="w-6 h-6" />, color: '#00C4B4' },
  { id: 'tirs', name: 'Tirs', nameAr: 'تِرس', role: 'Industrial B2B', roleAr: 'الصناعة والجملة', icon: <Settings className="w-6 h-6" />, color: '#8B9EB7' },
  { id: 'ostaz', name: 'Ostaz', nameAr: 'أستاذ', role: 'Education', roleAr: 'التعليم', icon: <BookOpen className="w-6 h-6" />, color: '#7C5CFF' },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const tr = t[lang];
  const isRTL = lang === 'ar';

  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) setSuccess(true);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0E17]" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-[#0A0E17]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">A</div>
            <span className="text-white font-bold text-lg">Axiom Reset</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#agents" className="text-gray-400 hover:text-white text-sm hidden md:block">{tr.agents}</a>
            <Link href="/about" className="text-gray-400 hover:text-white text-sm hidden md:block">{tr.about}</Link>
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10"
            >
              <Globe className="w-4 h-4" />
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-wider mb-8">
              <Sparkles className="w-4 h-4" />
              {tr.tagline}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
              {tr.title1}
            </h1>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              {tr.title2}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              {tr.subtitle}
            </p>

            {/* Waitlist Form */}
            <form onSubmit={joinWaitlist} className="max-w-md mx-auto" id="waitlist">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30" />
                <div className="relative flex bg-[#0A0E17] border border-white/20 rounded-xl p-1.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={tr.emailPlaceholder}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-3 text-sm focus:outline-none"
                    dir="ltr"
                    disabled={loading || success}
                  />
                  <button
                    type="submit"
                    disabled={loading || success}
                    className={`px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${success ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-gray-200'
                      }`}
                  >
                    {loading ? <Zap className="w-4 h-4 animate-spin" /> : success ? <ShieldCheck className="w-4 h-4" /> : tr.joinButton}
                    {!loading && !success && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </form>

            {/* Stats */}
            <div className="flex justify-center gap-12 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">5</div>
                <div className="text-sm text-gray-500">{isRTL ? 'وكيل ذكي' : 'AI Agents'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">0%</div>
                <div className="text-sm text-gray-500">{isRTL ? 'عمولة' : 'Commission'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-500">{isRTL ? 'متاح دائماً' : 'Always On'}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AGENTS GRID */}
      <section id="agents" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">{tr.agentsTitle}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, idx) => (
              <Link href={`/agents/${agent.id}`} key={agent.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
                    >
                      {agent.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {isRTL ? agent.nameAr : agent.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isRTL ? agent.roleAr : agent.role}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROP */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border border-emerald-500/20 text-center"
          >
            <span className="text-4xl mb-4 block">🚀</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{tr.valueTitle}</h2>
            <p className="text-lg text-gray-400">{tr.valueSubtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">{tr.footer}</p>
          <div className="mt-4">
            <Link href="/about" className="text-gray-500 hover:text-white text-sm">{tr.about}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
