import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataLoaderWrapperProps {
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    children: ReactNode;
    loadingMessage?: string;
    errorTitle?: string;
}

export const DataLoaderWrapper: React.FC<DataLoaderWrapperProps> = ({
    isLoading,
    isError,
    error,
    children,
    loadingMessage = "Initializing Quantum Systems...",
    errorTitle = "System Malfunction Detected"
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] w-full bg-black/50 backdrop-blur-sm rounded-xl border border-cyan-500/30">
                <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-magenta-500/50 rounded-full animate-ping"></div>
                </div>
                <p className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">
                    {loadingMessage}
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] w-full bg-red-900/10 backdrop-blur-md rounded-xl border border-red-500/50 p-6">
                <div className="text-red-500 text-4xl mb-2">⚠️</div>
                <h3 className="text-red-400 font-bold text-lg mb-2 tracking-wide uppercase">
                    {errorTitle}
                </h3>
                <p className="text-red-300/80 text-center font-mono text-sm max-w-md">
                    {error || "Unknown error occurred during quantum processing."}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 rounded transition-all duration-300 text-xs uppercase tracking-wider"
                >
                    Re-initialize System
                </button>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
