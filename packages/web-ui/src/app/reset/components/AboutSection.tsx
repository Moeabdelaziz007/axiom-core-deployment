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

                {/* Founder Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-20 pt-10 border-t border-white/10"
                >
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 inline-block text-left relative overflow-hidden group hover:border-cyan-500/30 transition-colors duration-500">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-2xl rounded-full -mr-10 -mt-10" />

                        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-2 font-orbitron">
                            {language === 'ar' ? 'المؤسس & المطور' : 'Founder & Lead Engineer'}
                        </h3>
                        <h4 className="text-2xl font-bold text-white mb-4">
                            Mohamed Hossameldin
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-lg mb-6">
                            {language === 'ar'
                                ? 'مهندس برمجيات مصري شغوف ببناء الأنظمة الذكية. أؤمن بأن الكود هو اللغة التي ستعيد تشكيل اقتصادنا.'
                                : 'An Egyptian Full Stack Engineer passionate about building intelligent systems. I believe code is the language that will reshape our economy.'}
                        </p>

                        <div className="flex gap-4 text-sm text-gray-500">
                            <a href="mailto:amrikyy@gmail.com" className="hover:text-white transition-colors flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                amrikyy@gmail.com
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
