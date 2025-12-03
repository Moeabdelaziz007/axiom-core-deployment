'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/reset';
import { useTranslation } from '@/lib/translations';

interface ResetHeaderProps {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const ResetHeader: React.FC<ResetHeaderProps> = ({ language, setLanguage }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t } = useTranslation(language);
    const isRTL = language === 'ar';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: language === 'ar' ? 'الرئيسية' : 'Home', href: '/reset' },
        { name: language === 'ar' ? 'الوكلاء' : 'Agents', href: '/reset/agents' },
        { name: language === 'ar' ? 'الأسعار' : 'Pricing', href: '/reset/pricing' },
        { name: language === 'ar' ? 'عن أكسيوم' : 'About Us', href: '/reset/about' },
    ];

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xl text-white">
                        AX
                    </div>
                    <span className="text-2xl font-bold tracking-wider font-orbitron text-white">
                        AXIOM <span className="text-blue-500">RESET</span>
                    </span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors uppercase tracking-widest"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-xs text-gray-400"
                    >
                        <Globe size={14} />
                        {language === 'en' ? 'العربية' : 'English'}
                    </button>

                    <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6">
                        {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black border-b border-white/10 overflow-hidden"
                    >
                        <div className="p-4 space-y-4 flex flex-col items-center">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-lg font-medium text-gray-300 hover:text-blue-400 transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="pt-4 border-t border-white/10 w-full flex flex-col gap-4 items-center">
                                <button
                                    onClick={() => {
                                        setLanguage(language === 'en' ? 'ar' : 'en');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 text-gray-400"
                                >
                                    <Globe size={16} />
                                    {language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
                                </button>
                                <Button className="w-full bg-blue-600 hover:bg-blue-500">
                                    {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};
