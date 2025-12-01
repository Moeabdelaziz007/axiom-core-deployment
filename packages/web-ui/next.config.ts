import type { NextConfig } from "next";
import path from "path";
import { withAxiom } from 'next-axiom';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // distDir removed to fix Vercel path issue
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
  transpilePackages: ['@solana/web3.js', '@solana/wallet-adapter-react-ui', '@solana/wallet-adapter-react', '@solana/wallet-adapter-base', '@solana/wallet-adapter-wallets', 'ai', '@langchain/langgraph', '@langchain/core', 'zod', '@noble/curves', '@noble/hashes'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default withAxiom(nextConfig);
