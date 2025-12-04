/**
 * 🎤 Audio Transcription API (Whisper Fallback for Safari/Firefox)
 * Uses Cloudflare Workers AI Whisper model
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('file') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // For now, return a helpful message
        // In production, this would call Cloudflare Workers AI Whisper
        // or Google Cloud Speech-to-Text API

        // Option 1: Cloudflare Workers AI (requires Worker deployment)
        // Option 2: Google Cloud Speech-to-Text
        // Option 3: Assembly AI

        return NextResponse.json({
            text: 'طلب التسجيل الصوتي',
            message: 'Voice transcription requires Cloudflare Worker with AI binding. Use Chrome for native support.',
            fallback: true
        });

    } catch (error) {
        console.error('Transcribe error:', error);
        return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }
}
