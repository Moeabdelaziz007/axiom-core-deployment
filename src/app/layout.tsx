import type { Metadata } from 'next';
import { Inter, Orbitron, Rajdhani, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { QuantumGuide } from '@/components/QuantumGuide';
import { VoiceProvider } from '@/context/VoiceContext';
import OmniOrb from '@/components/voice/OmniOrb';

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
});

const orbitron = Orbitron({
    variable: "--font-orbitron",
    subsets: ["latin"],
});

const rajdhani = Rajdhani({
    variable: "--font-rajdhani",
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Axiom RESET - AI Agents for MENA",
    description: "Voice-first AI agents for restaurants, real estate, pharmacy, and more.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl" className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}>
            <body className="min-h-screen bg-[#0A1628] text-white antialiased">
                <VoiceProvider>
                    {children}
                    <OmniOrb />
                    <QuantumGuide />
                </VoiceProvider>
            </body>
        </html>
    );
}