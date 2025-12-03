'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/reset';

interface PricingSectionProps {
    language?: Language;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ language = 'en' }) => {
    const isRTL = language === 'ar';

    const tiers = [
        {
            id: 'presence',
            name: language === 'ar' ? 'الوجود' : 'The Presence',
            nameEn: 'The Presence Tier',
            price: '1.99',
            tagline: language === 'ar' ? 'خليك موجود وسط الكبار' : 'Be present among the big players',
            icon: Sparkles,
            color: 'cyan',
            features: [
                language === 'ar' ? 'إدراج في دليل الوكيل (ظهور داخل التطبيق)' : 'Agent Directory Listing (In-app visibility)',
                language === 'ar' ? 'شات بوت أساسي لاستقبال الطلبات' : 'Basic Chatbot for orders',
                language === 'ar' ? '0% عمولة توصيل' : '0% Delivery Commission',
            ]
        },
        {
            id: 'sovereign',
            name: language === 'ar' ? 'السيادة' : 'The Sovereign',
            nameEn: 'The Sovereign Tier',
            price: '9.99',
            tagline: language === 'ar' ? 'امتلك متجرك الخاص واستقل بنفسك' : 'Own your store and be independent',
            icon: Zap,
            color: 'purple',
            popular: true,
            features: [
                language === 'ar' ? 'موقع خاص (مثل: sofra.app/koshary-tahrir)' : 'Custom Website (e.g., sofra.app/koshary-tahrir)',
                language === 'ar' ? 'شات بوت متقدم' : 'Advanced Chatbot',
                language === 'ar' ? 'تحليلات مبيعات' : 'Sales Analytics',
                language === 'ar' ? '0% عمولة توصيل' : '0% Delivery Commission',
                language === 'ar' ? 'دومين خاص (اختياري)' : 'Custom Domain (Optional)',
            ]
        }
    ];

    return (
        <section className="py-24 px-4 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        {language === 'ar' ? 'اختر باقتك' : 'Choose Your Plan'}
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {language === 'ar'
                            ? 'ابدأ بـ $1.99 وكبّر شغلك على راحتك. ⚡'
                            : 'Start at $1.99 and scale at your own pace. ⚡'}
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative"
                        >
                            {/* Popular Badge */}
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                                        {language === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
                                    </span>
                                </div>
                            )}

                            {/* Card */}
                            <div className={`relative h-full p-8 rounded-2xl border backdrop-blur-xl transition-all duration-500 ${tier.popular
                                    ? 'border-purple-500/50 bg-gradient-to-b from-purple-900/20 to-black shadow-[0_0_50px_rgba(168,85,247,0.3)] hover:shadow-[0_0_80px_rgba(168,85,247,0.5)]'
                                    : 'border-white/10 bg-black/50 hover:border-cyan-500/50 hover:shadow-[0_0_50px_rgba(6,182,212,0.3)]'
                                }`}>
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${tier.color === 'cyan' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-purple-500/10 border border-purple-500/30'
                                    }`}>
                                    <tier.icon className={`w-7 h-7 ${tier.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`} />
                                </div>

                                {/* Name & Price */}
                                <h3 className={`text-3xl font-bold mb-2 ${tier.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`}>
                                    {tier.name}
                                </h3>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-5xl font-black text-white">${tier.price}</span>
                                    <span className="text-gray-400">{language === 'ar' ? '/ شهر' : '/ month'}</span>
                                </div>

                                {/* Tagline */}
                                <p className="text-gray-300 mb-8 leading-relaxed">
                                    {tier.tagline}
                                </p>

                                {/* Features */}
                                <ul className="space-y-4 mb-8">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className={`w-5 h-5 mt-0.5 shrink-0 ${tier.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`} />
                                            <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <Button
                                    className={`w-full text-lg font-bold ${tier.popular
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                                            : 'bg-cyan-600 hover:bg-cyan-500'
                                        }`}
                                >
                                    {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <p className="text-gray-500">
                        {language === 'ar'
                            ? '💡 جميع الباقات بدون عمولات توصيل. السواق يأخذ 100% من رسوم التوصيل.'
                            : '💡 All plans include 0% delivery commission. Drivers keep 100% of fees.'}
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
