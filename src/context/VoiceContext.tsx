'use client';

/**
 * 🎙️ Voice Context - Global Voice State Manager
 * Supports Chrome (native) + Safari/Firefox (Whisper fallback)
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { agents } from '@/lib/agent-configs';

interface VoiceContextType {
    isListening: boolean;
    isSpeaking: boolean;
    transcript: string;
    aiResponse: string;
    activeAgentId: string;
    agentColor: string;
    toggleMic: () => void;
    setActiveAgentId: (id: string) => void;
    speak: (text: string) => void;
    hasNativeSupport: boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [activeAgentId, setActiveAgentId] = useState('sofra');

    const recognitionRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const currentAgent = agents[activeAgentId] || agents['sofra'];

    // Check browser support
    const hasNativeSupport = typeof window !== 'undefined' &&
        (!!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition);

    // =========================================================================
    // NATIVE SPEECH RECOGNITION (Chrome/Edge)
    // =========================================================================
    useEffect(() => {
        if (typeof window === 'undefined' || !hasNativeSupport) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'ar-EG';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Speech error:', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const result = event.results[event.results.length - 1];
            const text = result[0].transcript;
            setTranscript(text);

            if (result.isFinal) {
                handleAIRequest(text);
            }
        };

        recognitionRef.current = recognition;

        return () => recognition.abort();
    }, [activeAgentId, hasNativeSupport]);

    // =========================================================================
    // FALLBACK: MediaRecorder + Whisper (Safari/Firefox)
    // =========================================================================
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await processAudioWithWhisper(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
            setTranscript('جاري التسجيل...');
        } catch (err) {
            console.error("Mic Error:", err);
            speak("الرجاء السماح بصلاحية الميكروفون");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
            setTranscript('جاري المعالجة...');
        }
    };

    // Send audio to Cloudflare Whisper
    const processAudioWithWhisper = async (audioBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice.webm');

            const res = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.text && data.text.trim().length > 0) {
                setTranscript(data.text);
                handleAIRequest(data.text);
            } else {
                speak("لم أسمع شيئاً، جرب تاني.");
            }
        } catch (e) {
            console.error('Whisper error:', e);
            speak("حصل خطأ في معالجة الصوت.");
        }
    };

    // =========================================================================
    // TEXT-TO-SPEECH
    // =========================================================================
    const speak = useCallback((text: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-EG';
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    // =========================================================================
    // AI REQUEST HANDLER
    // =========================================================================
    const handleAIRequest = async (text: string) => {
        try {
            setAiResponse('جاري المعالجة...');

            const res = await fetch('/api/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: activeAgentId,
                    message: text,
                    history: []
                })
            });

            const data = await res.json();
            const reply = data.response || 'عذراً، لم أفهم. جرب تاني.';

            setAiResponse(reply);
            speak(reply);

        } catch (error) {
            console.error('AI Error:', error);
            const errorMsg = 'حصل خطأ في الاتصال.';
            setAiResponse(errorMsg);
            speak(errorMsg);
        }
    };

    // =========================================================================
    // SMART TOGGLE (Auto-detect browser)
    // =========================================================================
    const toggleMic = useCallback(() => {
        if (hasNativeSupport) {
            // Chrome/Edge: Use native
            if (isListening) {
                recognitionRef.current?.stop();
            } else {
                window.speechSynthesis?.cancel();
                setTranscript('');
                setAiResponse('');
                try {
                    recognitionRef.current?.start();
                } catch (e) {
                    console.error('Start error:', e);
                }
            }
        } else {
            // Safari/Firefox: Use MediaRecorder + Whisper
            if (isListening) {
                stopRecording();
            } else {
                window.speechSynthesis?.cancel();
                setAiResponse('');
                startRecording();
            }
        }
    }, [isListening, hasNativeSupport]);

    return (
        <VoiceContext.Provider value={{
            isListening,
            isSpeaking,
            transcript,
            aiResponse,
            activeAgentId,
            agentColor: currentAgent.color,
            toggleMic,
            setActiveAgentId,
            speak,
            hasNativeSupport
        }}>
            {children}
        </VoiceContext.Provider>
    );
}

export const useVoice = () => {
    const context = useContext(VoiceContext);
    if (!context) {
        throw new Error('useVoice must be used within VoiceProvider');
    }
    return context;
};
