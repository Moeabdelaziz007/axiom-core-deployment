import { NextRequest, NextResponse } from 'next/server';
import { AxiomIDManager } from '@/infra/core/AxiomIDManager';

/**
 * GET /api/identity/[userId]
 * 
 * Retrieves the AxiomID identity for a specific entity (agent or user).
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const axiomManager = AxiomIDManager.getInstance();

        // Try to get existing identity
        let identity = axiomManager.getIdentity(userId);

        // If not found, we might want to initialize it (for demo purposes)
        // In a real scenario, this might return 404 or auto-initialize based on policy
        if (!identity) {
            // Auto-initialize for demo/testing if not found
            // This ensures the UI always has something to show
            identity = await axiomManager.initializeIdentity(userId, {
                name: 'Unknown Entity',
                type: 'agent',
                capabilities: []
            });
        }

        return NextResponse.json({
            success: true,
            data: identity
        });

    } catch (error) {
        console.error('❌ Error fetching identity:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch identity',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * POST /api/identity/[userId]/evolve
 * 
 * Trigger evolution for an identity (e.g. add XP)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const body = await request.json();
        const { experience } = body;

        if (!experience || typeof experience !== 'number') {
            return NextResponse.json({
                success: false,
                error: 'Invalid experience value'
            }, { status: 400 });
        }

        const axiomManager = AxiomIDManager.getInstance();
        const identity = await axiomManager.evolveIdentity(userId, experience);

        return NextResponse.json({
            success: true,
            data: identity
        });

    } catch (error) {
        console.error('❌ Error evolving identity:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to evolve identity',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
