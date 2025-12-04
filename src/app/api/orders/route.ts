/**
 * 📦 Orders API - View agent actions
 */

import { NextRequest, NextResponse } from 'next/server';

// Shared stores (in production, use D1)
export const ordersStore: Array<{ id: string; items: string; total: number; status: string; createdAt: number }> = [];

export async function GET(request: NextRequest) {
    return NextResponse.json({
        count: ordersStore.length,
        orders: ordersStore.slice(-20) // Last 20 orders
    });
}
