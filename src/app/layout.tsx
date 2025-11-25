import type { Metadata } from 'next';
import { Inter, Orbitron, Rajdhani, JetBrains_Mono } from 'next/font/google';
import './globals.css';

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
    title: "Axiom Quantum Command Center",
    description: "Quantum-powered AI Agent Fleet Management. Neon Green + Carbon Fiber Theme.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}>
            <body className="min-h-screen bg-[#030712] text-white antialiased carbon-fiber-bg">
                {children}
            </body>
        </html>
    );
}