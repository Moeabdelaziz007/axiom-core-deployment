'use client';

import React, { useState } from 'react';
import { ResetHeader } from '../components/ResetHeader';
import { AboutSection } from '../components/AboutSection';
import { Footer } from '../components/Footer';
import { Language } from '@/types/reset';

export default function AboutPage() {
    const [language, setLanguage] = useState<Language>('en');

    return (
        <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden pt-20">
            <ResetHeader language={language} setLanguage={setLanguage} />

            <div className="pt-10">
                <AboutSection language={language} />
            </div>

            <Footer language={language} />
        </main>
    );
}
