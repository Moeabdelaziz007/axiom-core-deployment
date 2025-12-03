'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Github, Linkedin, Mail, Globe } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { Language } from '@/types/reset';

interface FooterProps {
    language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
    const { t } = useTranslation(language);
    const isRTL = language === 'ar';

    return (
        <footer className="relative bg-black border-t border-[#00F0FF]/20 pt-16 pb-8 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className={`grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>

                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-4 tracking-wider font-orbitron">
                            AXIOM <span className="text-[#00F0FF]">RESET</span>
                        </h2>
                        <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                            {t('footer.tagline')}
                        </p>
                        <div className={`flex gap-4 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                            {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-[#00F0FF]/10 flex items-center justify-center text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black transition-all duration-300"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h3 className="text-white font-bold mb-6 font-orbitron tracking-wide">{t('footer.about')}</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-[#00F0FF] transition-colors">{t('footer.features')}</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-[#00F0FF] transition-colors">{t('footer.contact')}</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h3 className="text-white font-bold mb-6 font-orbitron tracking-wide">{t('footer.privacy')}</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-[#00F0FF] transition-colors">{t('footer.terms')}</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-[#00F0FF] transition-colors">{t('footer.privacy')}</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        {t('footer.rights')}
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Globe size={14} />
                        <span>Cairo, Egypt</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
