'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Palmtree, Activity, ArrowRight, Smartphone, Globe } from 'lucide-react';
import { HolographicAvatar } from './HolographicAvatar';
import { useTranslation } from '@/lib/translations';
import { Language } from '@/types/reset';
import { Button } from '@/components/ui/button';

interface AgentShowcaseProps {
    language?: Language;
}

export const AgentShowcase: React.FC<AgentShowcaseProps> = ({ language = 'en' }) => {
    const isRTL = language === 'ar';

    const agents = [
        {
            id: 'sofra',
            name: language === 'ar' ? 'سفرة (Sofra)' : 'Sofra',
            role: language === 'ar' ? 'مدير المطعم الذكي' : 'Smart Restaurant Manager',
            desc: language === 'ar'
                ? 'استقبل طلبات الأكل 24 ساعة. منيو إلكتروني ذكي. والأهم: سواقينك بياخدوا 100% من التوصيل.'
                : 'Take orders 24/7. Smart digital menu. And most importantly: Your drivers keep 100% of delivery fees.',
            color: 'orange',
            icon: ChefHat,
            features: [
                language === 'ar' ? '0% عمولة توصيل' : '0% Delivery Commission',
                language === 'ar' ? 'منيو ذكي QR' : 'Smart QR Menu',
                language === 'ar' ? 'كاشير آلي' : 'Auto-Cashier',
            ]
        },
        {
            id: 'tajer',
            name: language === 'ar' ? 'تاجر (Tajer)' : 'Tajer',
            role: language === 'ar' ? 'مُضيفك في الساحل' : 'Your Host in Sahel',
            desc: language === 'ar'
                ? 'أجّر شاليهك في الساحل أو الجونة مباشرة. موقع حجز خاص بيك من غير سماسرة.'
                : 'Rent your chalet in Sahel or Gouna directly. Your own booking site with zero brokers.',
            color: 'blue',
            icon: Palmtree,
            features: [
                language === 'ar' ? 'حجز مباشر' : 'Direct Booking',
                language === 'ar' ? 'إدارة حجوزات' : 'Booking Management',
                language === 'ar' ? 'تسويق آلي' : 'Auto-Marketing',
            ]
        },
        {
            id: 'drmoe',
            name: language === 'ar' ? 'د. مو (Dr. Moe)' : 'Dr. Moe',
            role: language === 'ar' ? 'مساعدك الصيدلي' : 'Your Pharma Assistant',
            desc: language === 'ar'
                ? 'نظام إدارة صيدلية كامل. بيعرف النواقص ويطلبها، وبيجاوب على أسئلة المرضى.'
                : 'Complete pharmacy management. Tracks shortages, orders stock, and answers patient queries.',
            color: 'green',
            icon: Activity,
            features: [
                language === 'ar' ? 'إدارة نواقص' : 'Shortage Management',
                language === 'ar' ? 'روشتة إلكترونية' : 'E-Prescription',
                language === 'ar' ? 'ربط مع المخازن' : 'Warehouse Sync',
            ]
        }
    ];

    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-32">
                {agents.map((agent, index) => (
                    <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
                    >
                        {/* Agent Avatar Side */}
                        <div className="flex-1 text-center lg:text-left relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl -z-10" />

                            <div className="mb-8 flex justify-center lg:justify-start">
                                <HolographicAvatar icon={agent.icon} color={agent.color} size="lg" />
                            </div>

                            <h3 className={`text-4xl font-bold mb-2 ${agent.color === 'orange' ? 'text-orange-400' :
                                    agent.color === 'blue' ? 'text-blue-400' : 'text-green-400'
                                }`}>
                                {agent.name}
                            </h3>
                            <p className="text-xl text-gray-400 mb-6 font-mono">{agent.role}</p>

                            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                                {agent.desc}
                            </p>

                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                                {agent.features.map((feat, i) => (
                                    <span key={i} className={`px-4 py-2 rounded-full border bg-opacity-10 text-sm font-bold ${agent.color === 'orange' ? 'border-orange-500/30 bg-orange-500 text-orange-400' :
                                            agent.color === 'blue' ? 'border-blue-500/30 bg-blue-500 text-blue-400' : 'border-green-500/30 bg-green-500 text-green-400'
                                        }`}>
                                        {feat}
                                    </span>
                                ))}
                            </div>

                            <Button className={`w-full sm:w-auto ${agent.color === 'orange' ? 'bg-orange-600 hover:bg-orange-500' :
                                    agent.color === 'blue' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
                                }`}>
                                {language === 'ar' ? 'وظف ' + agent.name : 'Hire ' + agent.name}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>

                        {/* Platform Mockup Side */}
                        <div className="flex-1 w-full">
                            <div className={`relative rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden shadow-2xl group ${agent.color === 'orange' ? 'shadow-orange-500/20' :
                                    agent.color === 'blue' ? 'shadow-blue-500/20' : 'shadow-green-500/20'
                                }`}>
                                {/* Browser Bar */}
                                <div className="h-8 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    <div className="ml-4 flex-1 h-5 rounded bg-black/50 flex items-center px-3 text-[10px] text-gray-500 font-mono">
                                        axiom.id/{agent.id}
                                    </div>
                                </div>

                                {/* Platform Content Mockup */}
                                <div className="aspect-video relative p-6 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700">
                                    {/* Background Grid */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                    {/* UI Elements */}
                                    <div className="w-full max-w-xs space-y-4 relative z-10">
                                        <div className={`h-8 w-3/4 rounded mx-auto ${agent.color === 'orange' ? 'bg-orange-500/20' :
                                                agent.color === 'blue' ? 'bg-blue-500/20' : 'bg-green-500/20'
                                            }`} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-24 rounded bg-white/5 border border-white/10" />
                                            <div className="h-24 rounded bg-white/5 border border-white/10" />
                                        </div>
                                        <div className="h-4 w-1/2 rounded mx-auto bg-white/10" />
                                    </div>

                                    {/* Floating Icon */}
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center blur-xl opacity-20 ${agent.color === 'orange' ? 'bg-orange-500' :
                                            agent.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                                        }`} />
                                </div>

                                {/* Overlay Text */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white font-bold tracking-widest uppercase">View Live Demo</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
