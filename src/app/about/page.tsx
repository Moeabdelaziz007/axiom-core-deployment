'use client';

/**
 * 🏢 About Us - Axiom RESET
 * Our vision, mission, and the team behind the revolution
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MessageCircle, Github, Linkedin, Sparkles, Rocket, Users, TrendingUp } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#030712] text-white" dir="rtl">
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

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>العودة للرئيسية</span>
                    </Link>
                    <span className="font-bold text-xl">
                        Axiom<span className="text-[#10B981]">.</span>
                    </span>
                </div>
            </nav>

            <div className="relative z-10 pt-24 pb-20 px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-[#00F0FF] to-[#10B981] bg-clip-text text-transparent">
                                من نحن؟
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Axiom RESET - منصة الذكاء الاصطناعي التي تُعيد تعريف كيف تُدار الأعمال في الشرق الأوسط
                        </p>
                    </motion.div>

                    {/* The Big Statement */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-[#10B981]/10 to-[#00F0FF]/5 border border-[#10B981]/20"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-[#10B981]/20">
                                <Sparkles className="w-8 h-8 text-[#10B981]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    الناس يقولون: "الذكاء الاصطناعي سيأخذ وظائفنا!"
                                </h2>
                                <p className="text-lg text-slate-300 leading-relaxed">
                                    نحن في <strong className="text-[#10B981]">Axiom RESET</strong> نقول: <strong>لا!</strong>
                                    <br /><br />
                                    الذكاء الاصطناعي <strong className="text-white">سيساعدك</strong> تشتغل أكثر، تكسب أكتر، وتحقق نجاح ما كنت تتخيله.
                                    <br /><br />
                                    <span className="text-[#00F0FF]">مش هيحل محلك... هيشتغل جنبك.</span>
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Vision & Mission */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid md:grid-cols-2 gap-6 mb-16"
                    >
                        {/* Vision */}
                        <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-[#7C5CFF]/20">
                                    <Rocket className="w-5 h-5 text-[#7C5CFF]" />
                                </div>
                                <h3 className="text-xl font-bold">رؤيتنا</h3>
                            </div>
                            <p className="text-slate-400 leading-relaxed">
                                نطمح أن نكون <strong className="text-white">نظام التشغيل الأول للأعمال</strong> في منطقة الشرق الأوسط وشمال أفريقيا.
                                <br /><br />
                                وكلاء ذكاء اصطناعي يفهمون لغتك، ثقافتك، وطريقة شغلك.
                            </p>
                        </div>

                        {/* Mission */}
                        <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-[#FF6B5B]/20">
                                    <TrendingUp className="w-5 h-5 text-[#FF6B5B]" />
                                </div>
                                <h3 className="text-xl font-bold">مهمتنا</h3>
                            </div>
                            <p className="text-slate-400 leading-relaxed">
                                نُمكّن كل صاحب مشروع صغير من إدارة عمله بكفاءة الشركات الكبيرة.
                                <br /><br />
                                من <strong className="text-[#FF6B5B]">المطاعم</strong> إلى <strong className="text-[#FFB347]">العقارات</strong> إلى <strong className="text-[#00C4B4]">الصيدليات</strong>.
                            </p>
                        </div>
                    </motion.section>

                    {/* What We Believe */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl font-bold text-center mb-8">ما نؤمن به</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { icon: '🤝', title: 'AI + Human = ∞', desc: 'الذكاء الاصطناعي مش بديل، هو شريك' },
                                { icon: '🌍', title: 'MENA First', desc: 'مصممين للعربي أولاً، للمصري، للخليجي' },
                                { icon: '💰', title: 'أرباح أكثر', desc: 'هدفنا مش نوفر فلوس، هدفنا تكسب أكتر' },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-xl bg-[#0B0E14]/50 border border-white/5 text-center">
                                    <div className="text-4xl mb-4">{item.icon}</div>
                                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                    <p className="text-slate-400 text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Founder Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl font-bold text-center mb-8">المؤسس</h2>
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0B0E14] to-[#0B0E14]/50 border border-white/10">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Avatar */}
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#10B981] to-[#00F0FF] p-1">
                                    <div className="w-full h-full rounded-full bg-[#0B0E14] flex items-center justify-center">
                                        <span className="text-4xl font-bold text-[#10B981]">M</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-right">
                                    <h3 className="text-2xl font-bold mb-2">Mohamed Hossameldin Abdelaziz</h3>
                                    <p className="text-[#10B981] font-medium mb-4">Solo FullStack Developer & AI Agent Architect</p>
                                    <p className="text-slate-400 mb-6">
                                        مهندس برمجيات متخصص في بناء أنظمة الذكاء الاصطناعي والـ AI Agents.
                                        بنيت Axiom RESET من الصفر لحد ما وصلت لمنصة متكاملة.
                                    </p>

                                    {/* Contact Links */}
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3" dir="ltr">
                                        <a href="mailto:amrikyy@gmail.com" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                                            <Mail className="w-4 h-4" />
                                            <span>amrikyy@gmail.com</span>
                                        </a>
                                        <a href="mailto:mabdela1@students.kennesaw.edu" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                                            <Mail className="w-4 h-4" />
                                            <span>Kennesaw State U</span>
                                        </a>
                                        <a href="https://wa.me/17706160211" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors text-sm">
                                            <MessageCircle className="w-4 h-4" />
                                            <span>+1 770 616 0211</span>
                                        </a>
                                        <a href="tel:+201094228044" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                                            <Phone className="w-4 h-4" />
                                            <span>+20 109 422 8044</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Tech Stack */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl font-bold text-center mb-8">Built With ⚡</h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {[
                                'Next.js 16', 'TypeScript', 'Tailwind CSS', 'Framer Motion',
                                'Gemini 2.0', 'Cloudflare Workers', 'Web Speech API',
                                'Turso D1', 'Vercel Edge'
                            ].map((tech, i) => (
                                <span key={i} className="px-4 py-2 rounded-full bg-white/5 text-slate-300 text-sm border border-white/10">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.section>

                    {/* CTA */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-center"
                    >
                        <h2 className="text-2xl font-bold mb-4">جاهز تبدأ رحلتك؟</h2>
                        <p className="text-slate-400 mb-8">انضم للـ waitlist واحصل على وصول مبكر للمنصة</p>
                        <Link
                            href="/#waitlist"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-medium hover:bg-slate-200 transition-colors"
                        >
                            انضم الآن
                            <Sparkles className="w-5 h-5" />
                        </Link>
                    </motion.section>

                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-500 text-sm">
                © 2024 Axiom RESET. Made with ❤️ in Egypt & USA
            </footer>
        </main>
    );
}
