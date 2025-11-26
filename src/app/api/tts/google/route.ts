import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { message: 'Zero-Cost Launch Protocol Active: Use Client-Side TTS' },
        { status: 200 }
    );
}

export async function GET() {
    return NextResponse.json({
        status: 'disabled',
        message: 'Zero-Cost Launch Protocol Active'
    });
}