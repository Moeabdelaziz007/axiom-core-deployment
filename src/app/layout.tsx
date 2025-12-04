import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    variable: "--font-sans",
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
        <html lang="ar" dir="rtl" className={inter.variable}>
            <body className="min-h-screen bg-[#0A1628] text-white antialiased">
                {children}
            </body>
        </html>
    );
}