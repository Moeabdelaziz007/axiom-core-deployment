import type { Metadata } from 'next';
import { Inter, Orbitron, Rajdhani, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { QuantumGuide } from '@/components/QuantumGuide';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: 2,
        },
    },
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <html lang="en" className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}>
                <body className="min-h-screen bg-[#030712] text-white antialiased carbon-fiber-bg">
                    {children}
                    <QuantumGuide />
                </body>
            </html>
        </QueryClientProvider>
    );
}