/**
 * 📧 Waitlist API Endpoint
 * Stores email signups for early access
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (use D1/database in production)
const waitlist: string[] = [];

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Check if already registered
        if (waitlist.includes(email)) {
            return NextResponse.json(
                { message: 'Already registered', email },
                { status: 200 }
            );
        }

        // Add to waitlist
        waitlist.push(email);

        console.log(`📧 New waitlist signup: ${email}`);
        console.log(`📊 Total signups: ${waitlist.length}`);

        return NextResponse.json({
            success: true,
            message: 'Successfully joined waitlist',
            email,
            position: waitlist.length
        });

    } catch (error) {
        console.error('Waitlist error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        count: waitlist.length,
        message: 'Waitlist API active'
    });
}
