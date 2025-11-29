import type { Metadata } from "next";
import "./globals.css";
import { WalletContextProvider } from "../components/WalletContextProvider";

export const metadata: Metadata = {
  title: "Axiom ID | Quantum Agentic OS",
  description: "The world's first SAAAAS (Software as an Autonomous Agentic Service) platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white selection:bg-neon/30">
        <WalletContextProvider>
          <AuthProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
