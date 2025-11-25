import { NextRequest, NextResponse } from 'next/server';

// Simple TTS API endpoint for MVP
export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // For MVP, we'll use Web Speech API simulation
        // In production, you'd integrate with a real TTS service like Eleven Labs, OpenAI TTS, etc.

        // Return a mock audio response for now
        // This prevents the voice feature from breaking the UI
        const mockAudioData = generateMockAudioData();

        return NextResponse.json({
            audioContent: mockAudioData,
            message: 'TTS endpoint working (mock data)'
        });

    } catch (error) {
        console.error('TTS API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Generate mock audio data (silent audio) for MVP
function generateMockAudioData(): string {
    // Create 1 second of silent audio data (Float32Array -> Base64)
    const sampleRate = 24000;
    const duration = 1; // 1 second
    const samples = sampleRate * duration;
    const pcmData = new Float32Array(samples);

    // Fill with silence (zeros)
    pcmData.fill(0);

    // Convert to WAV format
    const wavBuffer = convertPCMToWav(pcmData, sampleRate);

    // Convert to Base64
    const base64 = Buffer.from(wavBuffer).toString('base64');
    return base64;
}

// Convert PCM to WAV (same as in the hook)
function convertPCMToWav(pcmData: Float32Array, sampleRate: number = 24000): ArrayBuffer {
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
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}