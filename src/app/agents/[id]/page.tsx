'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, MessageCircle, Phone, Mail, Star, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChefHat, Building, Activity, Settings, BookOpen } from 'lucide-react';

// Agent Data
const agentsData: Record<string, {
    name: string;
    nameAr: string;
    role: string;
    roleAr: string;
    color: string;
    icon: React.ReactNode;
    description: string;
    descriptionAr: string;
    features: string[];
    featuresAr: string[];
}> = {
    sofra: {
        name: 'Sofra',
        nameAr: 'سفرة',
        role: 'Restaurant OS',
        roleAr: 'نظام المطاعم',
        color: '#FF6B5B',
        icon: <ChefHat className="w-8 h-8" />,
        description: 'Your AI-powered restaurant assistant. Handle orders, manage reservations, and delight customers 24/7.',
        descriptionAr: 'مساعد مطعمك الذكي. يستقبل الطلبات، يدير الحجوزات، ويخدم الزبائن على مدار الساعة.',
        features: ['Order Taking', 'Menu Recommendations', 'Reservation Management', 'Customer Support'],
        featuresAr: ['استقبال الطلبات', 'توصيات القائمة', 'إدارة الحجوزات', 'دعم العملاء'],
    },
    tajer: {
        name: 'Tajer',
        nameAr: 'تاجر',
        role: 'Real Estate',
        roleAr: 'العقارات',
        color: '#FFB347',
        icon: <Building className="w-8 h-8" />,
        description: 'Your AI real estate agent. Show properties, book viewings, and close deals automatically.',
        descriptionAr: 'وكيلك العقاري الذكي. يعرض العقارات، يحجز المعاينات، ويغلق الصفقات تلقائياً.',
        features: ['Property Listings', 'Virtual Tours', 'Booking Viewings', 'Price Negotiation'],
        featuresAr: ['عرض العقارات', 'جولات افتراضية', 'حجز المعاينات', 'التفاوض على الأسعار'],
    },
    drmoe: {
        name: 'Dr. Moe',
        nameAr: 'د. مو',
        role: 'Pharmacy AI',
        roleAr: 'الصيدلية الذكية',
        color: '#00C4B4',
        icon: <Activity className="w-8 h-8" />,
        description: 'Your AI pharmacy assistant. Check drug interactions, manage prescriptions, and serve customers.',
        descriptionAr: 'مساعد صيدليتك الذكي. يفحص تفاعلات الأدوية، يدير الوصفات، ويخدم الزبائن.',
        features: ['Drug Interaction Check', 'Prescription Management', 'Inventory Alerts', 'Customer Guidance'],
        featuresAr: ['فحص تفاعلات الأدوية', 'إدارة الوصفات', 'تنبيهات المخزون', 'إرشاد العملاء'],
    },
    tirs: {
        name: 'Tirs',
        nameAr: 'تِرس',
        role: 'Industrial B2B',
        roleAr: 'الصناعة والجملة',
        color: '#8B9EB7',
        icon: <Settings className="w-8 h-8" />,
        description: 'Your B2B sales agent. Handle wholesale inquiries, generate quotes, and manage orders.',
        descriptionAr: 'وكيل مبيعات الجملة. يستقبل استفسارات الجملة، يولد عروض الأسعار، ويدير الطلبات.',
        features: ['Quote Generation', 'Bulk Orders', 'Supplier Matching', 'Inventory Sync'],
        featuresAr: ['توليد عروض الأسعار', 'طلبات الجملة', 'مطابقة الموردين', 'مزامنة المخزون'],
    },
    ostaz: {
        name: 'Ostaz',
        nameAr: 'أستاذ',
        role: 'Education',
        roleAr: 'التعليم',
        color: '#7C5CFF',
        icon: <BookOpen className="w-8 h-8" />,
        description: 'Your AI tutor. Teach, assess, and guide students with personalized learning paths.',
        descriptionAr: 'معلمك الذكي. يعلّم، يقيّم، ويرشد الطلاب بمسارات تعليمية مخصصة.',
        features: ['Personalized Lessons', 'Progress Tracking', 'Quiz Generation', 'Parent Reports'],
        featuresAr: ['دروس مخصصة', 'تتبع التقدم', 'توليد الاختبارات', 'تقارير الوالدين'],
    },
};

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [lang, setLang] = useState<'en' | 'ar'>('ar');
    const isRTL = lang === 'ar';

    const agent = agentsData[id];

    if (!agent) {
        return (
            <div className="min-h-screen bg-[#0A0E17] text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Agent Not Found</h1>
                    <Link href="/" className="text-[#0A84FF] hover:underline">Back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <main className={`min-h-screen bg-[#0A0E17] text-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Top Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E17]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {isRTL ? 'العودة' : 'Back'}
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
            <section className="pt-32 pb-16 px-6 relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top, ${agent.color}, transparent 50%)` }}
                />
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-6 mb-8"
                    >
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
                        >
                            {agent.icon}
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                {isRTL ? agent.nameAr : agent.name}
                            </h1>
                            <p className="text-lg text-slate-400">{isRTL ? agent.roleAr : agent.role}</p>
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-xl text-slate-300 max-w-2xl leading-relaxed"
                    >
                        {isRTL ? agent.descriptionAr : agent.description}
                    </motion.p>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8">{isRTL ? 'المميزات' : 'Features'}</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {(isRTL ? agent.featuresAr : agent.features).map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10"
                            >
                                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                                <span>{feature}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6">
                <div className="max-w-xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="p-10 rounded-2xl border border-white/10"
                        style={{ background: `linear-gradient(135deg, ${agent.color}10, transparent)` }}
                    >
                        <h2 className="text-2xl font-bold mb-4">
                            {isRTL ? `ابدأ مع ${agent.nameAr}` : `Get Started with ${agent.name}`}
                        </h2>
                        <p className="text-slate-400 mb-6">
                            {isRTL ? 'انضم لقائمة الانتظار واحصل على وصول مبكر.' : 'Join the waitlist and get early access.'}
                        </p>
                        <Link
                            href="/#waitlist"
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all"
                            style={{ backgroundColor: agent.color }}
                        >
                            {isRTL ? 'انضم الآن' : 'Join Now'}
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-sm">
                <p>© 2024 Axiom Reset</p>
            </footer>

        </main>
    );
}
