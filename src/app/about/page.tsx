'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Rocket, Users, Target, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const translations = {
    en: {
        back: 'Back to Home',
        title: 'About Axiom Reset',
        subtitle: 'Building the future of AI-powered business automation for the MENA region.',
        missionTitle: 'Our Mission',
        missionText: 'To democratize AI technology and make it accessible to every business owner in the Middle East and North Africa. We believe that AI should amplify human potential, not replace it.',
        visionTitle: 'Our Vision',
        visionText: 'A world where every small business has access to enterprise-grade AI tools, enabling them to compete globally while maintaining their unique cultural identity.',
        valuesTitle: 'Our Values',
        values: [
            { icon: <Heart />, title: 'Human-First AI', desc: 'Technology that empowers, not replaces.' },
            { icon: <Target />, title: 'Zero Commission', desc: 'You keep 100% of your profits.' },
            { icon: <Users />, title: 'Local Focus', desc: 'Built for MENA, by MENA.' },
            { icon: <Rocket />, title: 'Continuous Innovation', desc: 'Always evolving, always improving.' },
        ],
        teamTitle: 'The Team',
        teamText: 'A passionate group of engineers, designers, and entrepreneurs united by one goal: making AI work for everyone.',
        contactTitle: 'Get in Touch',
        contactText: 'Have questions? We\'d love to hear from you.',
        email: 'hello@axiomid.app',
    },
    ar: {
        back: 'العودة للرئيسية',
        title: 'عن أكسيوم ريست',
        subtitle: 'نبني مستقبل الأتمتة الذكية للأعمال في منطقة الشرق الأوسط وشمال أفريقيا.',
        missionTitle: 'مهمتنا',
        missionText: 'إتاحة تقنيات الذكاء الاصطناعي وجعلها متاحة لكل صاحب عمل في منطقة الشرق الأوسط وشمال أفريقيا. نؤمن أن الذكاء الاصطناعي يجب أن يُعزز القدرات البشرية، لا أن يحل محلها.',
        visionTitle: 'رؤيتنا',
        visionText: 'عالم يحصل فيه كل مشروع صغير على أدوات ذكاء اصطناعي بمستوى المؤسسات الكبرى، مما يمكّنهم من المنافسة عالمياً مع الحفاظ على هويتهم الثقافية الفريدة.',
        valuesTitle: 'قيمنا',
        values: [
            { icon: <Heart />, title: 'الإنسان أولاً', desc: 'تقنية تُمكّن، لا تستبدل.' },
            { icon: <Target />, title: 'صفر عمولة', desc: 'احتفظ بـ100% من أرباحك.' },
            { icon: <Users />, title: 'تركيز محلي', desc: 'مبني للمنطقة، من المنطقة.' },
            { icon: <Rocket />, title: 'ابتكار مستمر', desc: 'نتطور دائماً، نتحسن دائماً.' },
        ],
        teamTitle: 'الفريق',
        teamText: 'مجموعة شغوفة من المهندسين والمصممين ورواد الأعمال يجمعهم هدف واحد: جعل الذكاء الاصطناعي يعمل للجميع.',
        contactTitle: 'تواصل معنا',
        contactText: 'عندك أسئلة؟ يسعدنا نسمع منك.',
        email: 'hello@axiomid.app',
    }
};

export default function AboutPage() {
    const [lang, setLang] = useState<'en' | 'ar'>('ar');
    const t = translations[lang];
    const isRTL = lang === 'ar';

    return (
        <main className={`min-h-screen bg-[#0A0E17] text-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Top Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E17]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {t.back}
                    </Link>
                    <button
                        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        {lang === 'ar' ? 'English' : 'عربي'}
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-bold mb-6"
                    >
                        {t.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto"
                    >
                        {t.subtitle}
                    </motion.p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        className="p-8 rounded-2xl bg-white/[0.03] border border-white/10"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-[#0A84FF]">{t.missionTitle}</h2>
                        <p className="text-slate-400 leading-relaxed">{t.missionText}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        className="p-8 rounded-2xl bg-white/[0.03] border border-white/10"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-[#10B981]">{t.visionTitle}</h2>
                        <p className="text-slate-400 leading-relaxed">{t.visionText}</p>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 px-6 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">{t.valuesTitle}</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {t.values.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-xl bg-[#0A0E17] border border-white/10 flex gap-4"
                            >
                                <div className="w-12 h-12 rounded-lg bg-[#0A84FF]/10 text-[#0A84FF] flex items-center justify-center shrink-0">
                                    {value.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">{value.title}</h3>
                                    <p className="text-sm text-slate-500">{value.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">{t.teamTitle}</h2>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto">{t.teamText}</p>
                </div>
            </section>

            {/* Contact */}
            <section className="py-16 px-6">
                <div className="max-w-xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="p-10 rounded-2xl bg-gradient-to-br from-[#0A84FF]/10 to-[#7C5CFF]/5 border border-[#0A84FF]/20"
                    >
                        <h2 className="text-2xl font-bold mb-4">{t.contactTitle}</h2>
                        <p className="text-slate-400 mb-6">{t.contactText}</p>
                        <a
                            href={`mailto:${t.email}`}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-colors"
                        >
                            {t.email}
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-sm">
                <p>© 2024 Axiom Reset. All rights reserved.</p>
            </footer>

        </main>
    );
}
