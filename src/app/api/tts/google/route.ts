import { NextRequest, NextResponse } from 'next/server';

// Google Cloud TTS Configuration
const GOOGLE_TTS_CONFIG = {
    endpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
    voices: {
        'ar-SA': {
            name: 'ar-XA-Wavenet-A', // Arabic female voice
            languageCode: 'ar-SA',
            ssmlGender: 'FEMALE'
        },
        'ar-MA': {
            name: 'ar-XA-Wavenet-B', // Arabic male voice  
            languageCode: 'ar-SA',
            ssmlGender: 'MALE'
        },
        'en-US': {
            name: 'en-US-Wavenet-F', // English female voice
            languageCode: 'en-US',
            ssmlGender: 'FEMALE'
        }
    }
};

export async function POST(request: NextRequest) {
    try {
        const { text, language = 'ar-SA', voiceGender = 'FEMALE' } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        // Get API key from environment
        const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
        if (!apiKey) {
            console.error('❌ GOOGLE_CLOUD_API_KEY not found in environment');
            return NextResponse.json(
                { error: 'Google Cloud TTS not configured' },
                { status: 500 }
            );
        }

        // Select voice based on language and gender
        const voiceKey = language === 'ar-SA'
            ? (voiceGender === 'MALE' ? 'ar-MA' : 'ar-SA')
            : 'en-US';

        const voice = GOOGLE_TTS_CONFIG.voices[voiceKey as keyof typeof GOOGLE_TTS_CONFIG.voices];

        // Prepare request body for Google Cloud TTS
        const requestBody = {
            input: {
                text: text
            },
            voice: {
                languageCode: voice.languageCode,
                name: voice.name,
                ssmlGender: voice.ssmlGender
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.9,
                pitch: 0,
                volumeGainDb: 2.0,
                sampleRateHertz: 24000,
                effectsProfileId: 'small-bluetooth-speaker-class-device'
            }
        };

        console.log(`🎤 Generating TTS for language: ${language}, gender: ${voiceGender}`);

        // Call Google Cloud TTS API
        const response = await fetch(`${GOOGLE_TTS_CONFIG.endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('❌ Google TTS API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to generate speech', details: errorData },
                { status: 500 }
            );
        }

        const data = await response.json();

        if (!data.audioContent) {
            console.error('❌ No audio content in response');
            return NextResponse.json(
                { error: 'No audio content generated' },
                { status: 500 }
            );
        }

        // Convert base64 audio to buffer
        const audioBuffer = Buffer.from(data.audioContent, 'base64');

        // Return audio file
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `inline; filename="speech-${Date.now()}.mp3"`,
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });

    } catch (error) {
        console.error('❌ TTS Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// GET endpoint for voice information
export async function GET() {
    return NextResponse.json({
        available_voices: Object.keys(GOOGLE_TTS_CONFIG.voices).map(key => ({
            id: key,
            ...GOOGLE_TTS_CONFIG.voices[key as keyof typeof GOOGLE_TTS_CONFIG.voices]
        })),
        supported_languages: ['ar-SA', 'en-US'],
        features: [
            'High-quality Arabic voices',
            'Natural speech synthesis',
            'Adjustable speaking rate',
            'Multiple voice genders',
            'Bluetooth optimized audio'
        ],
        usage: 'POST /api/tts/google with { text, language?, voiceGender? }'
    });
}