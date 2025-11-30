import type { NextConfig } from "next";
import path from "path";
import { withAxiom } from 'next-axiom';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  distDir: '../../.next',
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
  transpilePackages: ['@solana/web3.js', 'ai', '@langchain/langgraph', '@langchain/core', 'zod'],
};

export default withAxiom(nextConfig);
