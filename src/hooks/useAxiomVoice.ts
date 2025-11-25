import { useState, useCallback, useEffect } from 'react';
import { fintechClient } from '@/lib/fintech-client';

export function useAxiomVoice() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);

    // 🛠️ تحويل PCM إلى WAV (لأن المتصفحات لا تشغل PCM خام مباشرة)
    const convertPCMToWav = (pcmData: Float32Array, sampleRate: number = 24000) => {
        const buffer = new ArrayBuffer(44 + pcmData.length * 2);
        const view = new DataView(buffer);

        // RIFF chunk descriptor
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + pcmData.length * 2, true);
        writeString(view, 8, 'WAVE');

        // fmt sub-chunk
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM format
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);

        // data sub-chunk
        writeString(view, 36, 'data');
        view.setUint32(40, pcmData.length * 2, true);

        // Write PCM samples
        let offset = 44;
        for (let i = 0; i < pcmData.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, pcmData[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        return buffer;
    };

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    const speak = useCallback(async (text: string) => {
        if (isPlaying) return;

        try {
            setIsPlaying(true);
            console.log('🎤 AVA: Requesting speech...');

            // 1. طلب الصوت من الخادم
            const audioData = await fintechClient.speak(text);

            if (!audioData) {
                console.error('❌ AVA: No audio data received');
                return;
            }

            // 2. تحويل Base64 إلى Float32Array
            const binaryString = atob(audioData);
            const pcmData = new Float32Array(binaryString.length / 4);
            const dataView = new DataView(new Uint8Array(binaryString.split('').map(c => c.charCodeAt(0))).buffer);

            for (let i = 0; i < pcmData.length; i++) {
                pcmData[i] = dataView.getFloat32(i * 4, true); // Little Endian
            }

            // 3. تحويل PCM إلى WAV
            const wavBuffer = convertPCMToWav(pcmData);
            const blob = new Blob([wavBuffer], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);

            // 4. تشغيل الصوت
            const audio = new Audio(url);
            audio.onended = () => {
                setIsPlaying(false);
                setHasPlayed(true);
                URL.revokeObjectURL(url);
            };

            await audio.play();
            console.log('🔊 AVA: Speaking...');

        } catch (error) {
            console.error('❌ AVA Error:', error);
            setIsPlaying(false);
        }
    }, [isPlaying]);

    // تشغيل ترحيب تلقائي مرة واحدة
    const playWelcome = useCallback(() => {
        if (!hasPlayed) {
            speak("Welcome to Axiom SAAAAS. I am AVA, your quantum assistant. All systems are operational.");
        }
    }, [hasPlayed, speak]);

    return { speak, playWelcome, isPlaying };
}
