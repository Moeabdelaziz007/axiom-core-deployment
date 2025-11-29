'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, PenTool } from 'lucide-react';
import bs58 from 'bs58';

export default function SolanaVerifier() {
  const { publicKey, signMessage, connected } = useWallet();
  const [status, setStatus] = useState<'IDLE' | 'SIGNING' | 'VERIFIED' | 'ERROR'>('IDLE');
  const [signature, setSignature] = useState<string | null>(null);

  const handleSign = useCallback(async () => {
    if (!publicKey || !signMessage) return;
    
    setStatus('SIGNING');
    try {
      const message = new TextEncoder().encode(`Verify Axiom Identity: ${publicKey.toBase58()}`);
      const signatureBytes = await signMessage(message);
      const signatureStr = bs58.encode(signatureBytes);
      
      setSignature(signatureStr);
      setStatus('VERIFIED');
    } catch (error) {
      console.error(error);
      setStatus('ERROR');
    }
  }, [publicKey, signMessage]);

  if (!connected) {
    return (
      <div className="p-4 border border-yellow-500/30 bg-yellow-900/10 rounded-lg flex items-center gap-3 text-yellow-500">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-mono">Wallet not connected. Please connect via header.</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-black/40 backdrop-blur-md border border-cyan-900/30 rounded-xl p-6 font-mono">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-cyan-400 font-bold flex items-center gap-2">
          <PenTool className="w-4 h-4" />
          SIGNATURE VERIFIER
        </h3>
        <div className="text-xs text-cyan-800">DEVNET</div>
      </div>

      <div className="space-y-4">
        <div className="text-xs text-cyan-600 break-all bg-black/50 p-2 rounded border border-cyan-900/20">
          <span className="text-cyan-800 block mb-1">CONNECTED KEY:</span>
          {publicKey?.toBase58()}
        </div>

        {status === 'IDLE' && (
          <button
            onClick={handleSign}
            className="w-full py-2 bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-700/50 text-cyan-300 rounded transition-all text-sm font-bold flex items-center justify-center gap-2"
          >
            SIGN VERIFICATION MESSAGE
          </button>
        )}

        {status === 'SIGNING' && (
          <div className="flex items-center justify-center gap-2 text-cyan-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Requesting Signature...</span>
          </div>
        )}

        {status === 'VERIFIED' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
              <CheckCircle className="w-4 h-4" />
              VERIFIED
            </div>
            <div className="text-[10px] text-green-600/70 break-all bg-green-900/10 p-2 rounded border border-green-900/30">
              {signature}
            </div>
          </motion.div>
        )}

        {status === 'ERROR' && (
          <div className="flex items-center gap-2 text-red-400 text-sm font-bold py-2">
            <AlertCircle className="w-4 h-4" />
            SIGNATURE REJECTED
          </div>
        )}
      </div>
    </div>
  );
}
