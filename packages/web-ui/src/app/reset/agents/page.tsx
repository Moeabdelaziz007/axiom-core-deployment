'use client';

import React, { useState } from 'react';
import { ResetHeader } from '../components/ResetHeader';
import { AgentShowcase } from '../components/AgentShowcase';
import { Footer } from '../components/Footer';
import { Language } from '@/types/reset';

export default function AgentsPage() {
    const [language, setLanguage] = useState<Language>('en');

    return (
        <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden pt-20">
            <ResetHeader language={language} setLanguage={setLanguage} />

            <div className="pt-10">
                <AgentShowcase language={language} />
            </div>

            <Footer language={language} />
        </main>
    );
}
