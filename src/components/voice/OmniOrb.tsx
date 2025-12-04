'use client';

/**
 * 🔮 Omni-Orb - Floating Voice Assistant
 * Holographic design that floats across all pages
 */

import React from 'react';
import { useVoice } from '@/context/VoiceContext';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export default function OmniOrb() {
    const {
        isListening,
        isSpeaking,
        toggleMic,
        agentColor,
        transcript,
        aiResponse
    } = useVoice();

    const isActive = isListening || isSpeaking;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

            {/* Transcript/Response Bubble */}
            {isActive && (transcript || aiResponse) && (
                <div
                    className="max-w-[280px] p-4 rounded-2xl rounded-br-none shadow-2xl border backdrop-blur-xl animate-fade-in"
                    style={{
                        background: 'rgba(10, 22, 40, 0.95)',
                        borderColor: `${agentColor}30`
                    }}
                >
                    {/* Status indicator */}
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: agentColor }}
                        />
                        <span className="text-xs text-slate-400">
                            {isSpeaking ? 'يتحدث...' : 'يستمع...'}
                        </span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-white leading-relaxed" dir="rtl">
                        {isSpeaking ? aiResponse : transcript || 'أستمع إليك...'}
                    </p>
                </div>
            )}

            {/* The Orb Button */}
            <button
                onClick={toggleMic}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'
                    }`}
                style={{
                    background: `conic-gradient(from 180deg, #0A1628 0deg, ${agentColor} 180deg, #0A1628 360deg)`,
                    boxShadow: isActive
                        ? `0 0 40px ${agentColor}60, 0 0 80px ${agentColor}30`
                        : `0 0 20px ${agentColor}30`
                }}
                aria-label={isListening ? 'إيقاف الاستماع' : 'بدء التحدث'}
            >
                {/* Inner Core */}
                <div className="absolute inset-[3px] rounded-full bg-[#0A1628] flex items-center justify-center z-10">
                    {isSpeaking ? (
                        // Voice Waveform Animation
                        <div className="flex gap-[3px] items-center h-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="w-[3px] rounded-full animate-voice-bar"
                                    style={{
                                        backgroundColor: agentColor,
                                        animationDelay: `${i * 0.1}s`
                                    }}
                                />
                            ))}
                        </div>
                    ) : isListening ? (
                        <div className="relative">
                            <Mic className="w-6 h-6 text-white animate-pulse" />
                            <div
                                className="absolute inset-0 rounded-full animate-ping opacity-30"
                                style={{ backgroundColor: agentColor }}
                            />
                        </div>
                    ) : (
                        // Idle State - Glowing dot
                        <div
                            className="w-6 h-6 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                            style={{
                                backgroundColor: agentColor,
                                boxShadow: `0 0 10px ${agentColor}`
                            }}
                        />
                    )}
                </div>

                {/* Breathing Ring */}
                {isListening && (
                    <>
                        <div
                            className="absolute inset-0 rounded-full border-2 animate-ping"
                            style={{
                                borderColor: `${agentColor}40`,
                                animationDuration: '2s'
                            }}
                        />
                        <div
                            className="absolute inset-[-4px] rounded-full border animate-pulse"
                            style={{ borderColor: `${agentColor}20` }}
                        />
                    </>
                )}

                {/* Speaking Ring */}
                {isSpeaking && (
                    <div
                        className="absolute inset-[-6px] rounded-full border-2 animate-spin-slow"
                        style={{
                            borderColor: 'transparent',
                            borderTopColor: agentColor,
                            borderRightColor: `${agentColor}50`
                        }}
                    />
                )}
            </button>

            {/* Helper Text (on first visit) */}
            {!isActive && (
                <p className="text-[10px] text-slate-500 text-center">
                    اضغط للتحدث
                </p>
            )}
        </div>
    );
}
