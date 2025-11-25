import { useState, useCallback, useEffect } from 'react';

export function useAxiomVoice() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    // Check if speech synthesis is supported
    useEffect(() => {
        setIsSupported('speechSynthesis' in window);
    }, []);

    const speak = useCallback(async (text: string) => {
        if (isPlaying || !isSupported) {
            console.log('🎤 AVA: Speech not available or already playing');
            return;
        }

        try {
            setIsPlaying(true);
            console.log('🎤 AVA: Starting speech synthesis...');

            // Cancel any existing speech
            window.speechSynthesis.cancel();

            // Create new utterance
            const utterance = new SpeechSynthesisUtterance(text);

            // Configure voice settings
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Try to use a female voice if available
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice =>
                voice.name.includes('Female') ||
                voice.name.includes('Samantha') ||
                voice.name.includes('Karen') ||
                voice.name.includes('Google US English Female')
            );

            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }

            // Event handlers
            utterance.onstart = () => {
                console.log('🔊 AVA: Started speaking...');
            };

            utterance.onend = () => {
                console.log('✅ AVA: Finished speaking');
                setIsPlaying(false);
                setHasPlayed(true);
            };

            utterance.onerror = (event) => {
                console.error('❌ AVA Speech Error:', event);
                setIsPlaying(false);
            };

            // Speak the text
            window.speechSynthesis.speak(utterance);

            // Add visual feedback for debugging
            console.log('🎤 AVA Speaking:', text);
            console.log('🔊 Voice:', utterance.voice ? utterance.voice.name : 'Default');
            console.log('📝 Rate:', utterance.rate);
            console.log('🎚 Pitch:', utterance.pitch);
            console.log('🔊 Volume:', utterance.volume);

        } catch (error) {
            console.error('❌ AVA Error:', error);
            setIsPlaying(false);
        }
    }, [isPlaying, isSupported]);

    // تشغيل ترحيب تلقائي مرة واحدة
    const playWelcome = useCallback(() => {
        if (!hasPlayed && isSupported) {
            // Small delay to ensure voices are loaded
            setTimeout(() => {
                speak("Welcome to Axiom Control. I am AVA, your assistant. All systems are operational.");
            }, 500);
        }
    }, [hasPlayed, isSupported, speak]);

    return { speak, playWelcome, isPlaying, isSupported };
}
