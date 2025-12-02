'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Wallet, ChevronDown, LogOut, Copy, Check } from 'lucide-react';

export function WalletButton() {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!connected && !connecting) {
    return (
      <WalletMultiButton className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#7000FF] to-[#00F0FF] text-white font-semibold text-sm">
        <Lock className="w-4 h-4" />
        CONNECT WALLET
      </WalletMultiButton>
    );
  }

  if (connecting) {
    return (
      <button disabled className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#7000FF] to-[#00F0FF] text-white font-semibold text-sm opacity-70">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        CONNECTING...
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#00F0FF]/20 to-[#7000FF]/20 border border-[#00F0FF]/30 text-white font-semibold text-sm"
      >
        <Wallet className="w-4 h-4" style={{ color: '#00F0FF' }} />
        <span>{publicKey ? shortenAddress(publicKey.toString()) : 'Connected'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isDropdownOpen && (
        <>
          <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl border border-[#00F0FF]/20 z-50">
            <div className="p-4 border-b border-white/10">
              <p className="text-xs text-gray-400 mb-2">Wallet Address</p>
              <div className="flex items-center justify-between">
                <code className="text-sm text-white font-mono">
                  {publicKey ? shortenAddress(publicKey.toString()) : ''}
                </code>
                <button onClick={copyAddress} className="p-2 hover:bg-white/5 rounded-lg">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={() => { disconnect(); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Disconnect</span>
              </button>
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
        </>
      )}
    </div>
  );
}