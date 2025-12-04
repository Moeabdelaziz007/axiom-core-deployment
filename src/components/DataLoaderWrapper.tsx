'use client';

/**
 * DataLoaderWrapper - Handles data loading states
 */

import React, { ReactNode } from 'react';

interface DataLoaderWrapperProps {
    children: ReactNode;
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

export function DataLoaderWrapper({
    children,
    isLoading = false,
    error = null,
    onRetry
}: DataLoaderWrapperProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-cyan-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-6">
                <div className="text-red-400 text-lg mb-2">⚠️ خطأ في التحميل</div>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                )}
            </div>
        );
    }

    return <>{children}</>;
}

export default DataLoaderWrapper;
