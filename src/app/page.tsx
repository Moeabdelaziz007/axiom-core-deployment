'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Sparkles, Zap, ShieldCheck,
  ChefHat, Building, Activity, Settings, BookOpen, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Translations ---
const translations = {
  en: {
    tagline: 'THE SOVEREIGN BUSINESS OS',
    heroTitle1: 'Your AI Team.',
    heroTitle2: 'Zero Commission.',
    heroSubtitle: 'Deploy 5 specialized AI agents to automate your business. Keep 100% of your profits.',
    emailPlaceholder: 'Enter your email to join...',
    joinButton: 'Join Waitlist',
    agentsTitle: 'Meet Your AI Workforce',
    valueTitle: "AI Won't Replace You",
    valueSubtitle: 'AI will amplify your capabilities, multiply your income, and unlock success beyond imagination.',
    valueArabic: 'الذكاء الاصطناعي مش هياخد مكانك... هيشتغل جنبك.',
    statusOnline: 'System Status: Operational',
    region: 'MENA Region',
    agents: 'Agents',
    about: 'About',
    login: 'Login',
  },
  ar: {
    tagline: 'نظام التشغيل السيادي للأعمال',
    heroTitle1: 'فريقك الذكي.',
    heroTitle2: 'صفر عمولة.',
    heroSubtitle: 'خمس وكلاء ذكاء اصطناعي متخصصين لتشغيل عملك. احتفظ بـ100% من أرباحك.',
    emailPlaceholder: 'أدخل بريدك الإلكتروني...',
    joinButton: 'انضم للقائمة',
    agentsTitle: 'تعرّف على فريقك الذكي',
    valueTitle: 'الذكاء الاصطناعي مش بديلك',
    valueSubtitle: 'هيضاعف قدراتك، يزوّد دخلك، ويفتحلك أبواب نجاح ما كنت تتخيلها.',
    valueArabic: 'مش هياخد مكانك... هيشتغل جنبك ويساعدك تكبر.',
    statusOnline: 'حالة النظام: يعمل',
    region: 'منطقة الشرق الأوسط',
    agents: 'الوكلاء',
    about: 'عنّا',
    login: 'تسجيل',
  }
};

// --- Agent Data ---
const agents = [
  { id: 'sofra', name: 'Sofra', nameAr: 'سفرة', role: 'Restaurant OS', roleAr: 'نظام المطاعم', icon: <ChefHat />, color: '#FF6B5B', size: 'col-span-2' },
  { id: 'tajer', name: 'Tajer', nameAr: 'تاجر', role: 'Real Estate', roleAr: 'العقارات', icon: <Building />, color: '#FFB347', size: 'col-span-1' },
  { id: 'drmoe', name: 'Dr. Moe', nameAr: 'د. مو', role: 'Pharmacy AI', roleAr: 'الصيدلية الذكية', icon: <Activity />, color: '#00C4B4', size: 'col-span-1' },
  { id: 'tirs', name: 'Tirs', nameAr: 'تِرس', role: 'Industrial B2B', roleAr: 'الصناعة والجملة', icon: <Settings />, color: '#8B9EB7', size: 'col-span-2' },
  { id: 'ostaz', name: 'Ostaz', nameAr: 'أستاذ', role: 'Education', roleAr: 'التعليم', icon: <BookOpen />, color: '#7C5CFF', size: 'col-span-3' },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const t = translations[lang];
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
    } catch (err) {
      console.error('Waitlist error:', err);
    }
    setLoading(false);
  };

  return (
    <main className={`min-h-screen bg-[#0A0E17] text-white font-sans selection:bg-[#0A84FF]/30 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* === NAVBAR === */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 bg-[#0A0E17]/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#7C5CFF] flex items-center justify-center font-bold text-lg">A</div>
          <span className="font-bold text-lg tracking-tight">Axiom Reset</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm text-slate-400 font-medium">
          <a href="#agents" className="hover:text-white transition-colors">{t.agents}</a>
          <Link href="/about" className="hover:text-white transition-colors">{t.about}</Link>
        </div>
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 transition-all"
        >
          <Globe className="w-4 h-4" />
          {lang === 'ar' ? 'English' : 'عربي'}
        </button>
      </nav>

      {/* === HERO SECTION (IMPROVED) === */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#0A84FF]/20 via-[#7C5CFF]/10 to-transparent blur-[100px] rounded-full" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A84FF]/5 via-transparent to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0A84FF]/30 bg-[#0A84FF]/10 text-[#0A84FF] text-xs font-bold tracking-wider mb-8"
          >
            <Sparkles className="w-4 h-4" />
            {t.tagline}
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-6 leading-[1.1]"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
              {t.heroTitle1}
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#0A84FF] to-[#7C5CFF]">
              {t.heroTitle2}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {t.heroSubtitle}
          </motion.p>

          {/* Waitlist Form */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={joinWaitlist}
            className="max-w-lg mx-auto relative group"
            id="waitlist"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0A84FF] via-[#7C5CFF] to-[#10B981] rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500" />
            <div className="relative flex bg-[#0A0E17] border border-white/20 rounded-2xl p-2 items-center shadow-2xl gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-slate-500 text-base px-4 py-3"
                disabled={loading || success}
                dir="ltr"
              />
              <button
                disabled={loading || success}
                className={`px-8 py-3 rounded-xl font-bold text-base transition-all flex items-center gap-2 ${success
                  ? 'bg-[#10B981] text-white'
                  : 'bg-gradient-to-r from-[#0A84FF] to-[#7C5CFF] text-white hover:opacity-90'
                  }`}
              >
                {loading ? <Zap className="w-5 h-5 animate-spin" /> : success ? <ShieldCheck className="w-5 h-5" /> : t.joinButton}
                {!loading && !success && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </motion.form>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-12 flex justify-center gap-8 md:gap-16 text-center"
          >
            <div>
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-sm text-slate-500">{lang === 'ar' ? 'وكيل ذكي' : 'AI Agents'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#10B981]">0%</div>
              <div className="text-sm text-slate-500">{lang === 'ar' ? 'عمولة' : 'Commission'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-slate-500">{lang === 'ar' ? 'يعمل دائماً' : 'Always On'}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === AGENTS BENTO GRID === */}
      <section id="agents" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-lg font-bold text-white">{t.agentsTitle}</h2>
          <div className="h-[1px] flex-1 bg-white/10 mx-6" />
          <span className="text-sm text-slate-500 font-mono">5 AGENTS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agents.map((agent, idx) => (
            <Link href={`/agents/${agent.id}`} key={agent.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 relative flex flex-col justify-between min-h-[220px] cursor-pointer transition-all hover:bg-white/[0.05] ${agent.size}`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="p-3 rounded-xl bg-white/5 border border-white/5 transition-all group-hover:scale-110"
                    style={{ color: agent.color }}
                  >
                    {agent.icon}
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-1">
                    {isRTL ? agent.nameAr : agent.name}
                  </h3>
                  <p className="text-sm text-slate-500">{isRTL ? agent.roleAr : agent.role}</p>
                </div>

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at bottom right, ${agent.color}, transparent 60%)` }}
                />
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* === VALUE PROPOSITION === */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-10 md:p-16 rounded-3xl bg-gradient-to-br from-[#10B981]/10 via-[#0A84FF]/5 to-transparent border border-[#10B981]/20 text-center"
        >
          <span className="text-5xl mb-6 block">🚀</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.valueTitle}
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-6">
            {t.valueSubtitle}
          </p>
          <p className="text-xl text-white font-bold">
            {t.valueArabic}
          </p>
        </motion.div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-white/5 py-12 text-center">
        <p className="text-slate-600 text-sm mb-4">{t.statusOnline} • {t.region}</p>
        <div className="flex justify-center gap-6 text-sm text-slate-500">
          <Link href="/about" className="hover:text-white transition-colors">{t.about}</Link>
        </div>
      </footer>

    </main>
  );
}
