'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '@/types/reset';

interface AboutSectionProps {
    language?: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ language = 'en' }) => {
    const isRTL = language === 'ar';

    return (
        <section id="about" className="py-24 px-4 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background */}
            <div className="absolute inset-0 bg-black" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />

            <div className="max-w-4xl mx-auto relative z-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
                >
                    {language === 'ar' ? 'عن أكسيوم' : 'About Axiom'}
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6 text-lg text-gray-300 leading-relaxed"
                >
                    <p>
                        {language === 'ar'
                            ? 'أكسيوم هي منصة الذكاء الاصطناعي الأولى من نوعها في مصر، تهدف إلى تمكين أصحاب الأعمال الصغيرة والمتوسطة من امتلاك أدوات المستقبل اليوم.'
                            : 'Axiom is Egypt\'s first AI-native platform, dedicated to empowering SMB owners with the tools of the future, today.'}
                    </p>
                    <p>
                        {language === 'ar'
                            ? 'نحن لا نبيع مجرد برمجيات، نحن نبني "قوى عاملة رقمية". وكلاؤنا الأذكياء (سفرة، تاجر، ود. مو) مصممون ليكونوا شركاء نجاحك، يعملون 24 ساعة لزيادة مبيعاتك وتنظيم عملك.'
                            : 'We don\'t just sell software; we build a "Digital Workforce". Our intelligent agents (Sofra, Tajer, and Dr. Moe) are designed to be your success partners, working 24/7 to boost your sales and organize your operations.'}
                    </p>
                    <p className="font-bold text-blue-400">
                        {language === 'ar'
                            ? 'رؤيتنا: أن نجعل التكنولوجيا المتقدمة في متناول الجميع، بأسعار تبدأ من سعر كوب قهوة.'
                            : 'Our Vision: To make advanced technology accessible to everyone, starting at the price of a cup of coffee.'}
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
