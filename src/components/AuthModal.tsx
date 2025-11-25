'use client';

import React from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoogleAuth: () => void;
    onWalletAuth: () => void;
}

export const AuthModal = ({ isOpen, onClose, onGoogleAuth, onWalletAuth }: AuthModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Initialize Fleet</h2>
                    <p className="text-gray-400">Choose your access method to continue</p>
                </div>

                {/* Auth Options */}
                <div className="space-y-3">
                    <button
                        onClick={onGoogleAuth}
                        className="w-full bg-white text-black rounded-xl p-4 font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <button
                        onClick={onWalletAuth}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-4 font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-3"
                    >
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-bold text-xs">S</span>
                        </div>
                        Connect Solana Wallet
                    </button>

                    <div className="text-center pt-4">
                        <p className="text-xs text-gray-500">
                            By continuing, you agree to our Terms and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};