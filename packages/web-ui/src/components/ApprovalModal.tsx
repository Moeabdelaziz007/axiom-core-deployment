'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  actionType: string;
  details: string;
  onApprove: () => void;
  onReject: () => void;
}

export default function ApprovalModal({ isOpen, actionType, details, onApprove, onReject }: ApprovalModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-red-500/50 rounded-xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(255,0,0,0.3)]"
        >
          <div className="flex items-center gap-3 text-red-500 mb-4 border-b border-red-900/50 pb-2">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
            <h2 className="text-xl font-bold tracking-wider">HUMAN APPROVAL REQUIRED</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-black/50 p-3 rounded border border-white/10">
              <div className="text-xs text-gray-500 mb-1">ACTION TYPE</div>
              <div className="text-lg font-mono text-white">{actionType}</div>
            </div>
            <div className="bg-black/50 p-3 rounded border border-white/10">
              <div className="text-xs text-gray-500 mb-1">DETAILS</div>
              <div className="text-sm font-mono text-gray-300">{details}</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-red-900/20 text-red-400 border border-red-500/30 hover:bg-red-900/40 transition-all font-bold"
            >
              <XCircle className="w-5 h-5" />
              REJECT
            </button>
            <button 
              onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-green-900/20 text-green-400 border border-green-500/30 hover:bg-green-900/40 transition-all font-bold"
            >
              <CheckCircle className="w-5 h-5" />
              APPROVE EXECUTION
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
