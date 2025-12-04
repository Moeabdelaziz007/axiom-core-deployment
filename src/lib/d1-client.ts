/**
 * 🗄️ Cloudflare D1 Client for Next.js
 * Uses D1 HTTP API since we're on Vercel, not Cloudflare Workers
 */

const D1_API_BASE = 'https://api.cloudflare.com/client/v4';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const DATABASE_ID = process.env.D1_DATABASE_ID || '64c6f62f-0df0-455f-ba4f-c63a572e6663';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

interface D1Result<T = Record<string, unknown>> {
    success: boolean;
    results: T[];
    meta?: {
        changes: number;
        last_row_id: number;
        duration: number;
    };
    error?: string;
}

/**
 * Execute a D1 query
 */
export async function d1Query<T = Record<string, unknown>>(
    sql: string,
    params: (string | number | null)[] = []
): Promise<D1Result<T>> {
    // If no API token, use mock mode for development
    if (!API_TOKEN || !ACCOUNT_ID) {
        console.warn('⚠️ D1: No API credentials, using mock mode');
        return { success: true, results: [] };
    }

    try {
        const response = await fetch(
            `${D1_API_BASE}/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sql,
                    params,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('D1 Error:', error);
            return { success: false, results: [], error };
        }

        const data = await response.json();
        return {
            success: data.success,
            results: data.result?.[0]?.results || [],
            meta: data.result?.[0]?.meta,
        };
    } catch (error) {
        console.error('D1 Query Error:', error);
        return { success: false, results: [], error: String(error) };
    }
}

// ============================================================================
// ORDER OPERATIONS (Sofra)
// ============================================================================

export async function createOrder(data: {
    id: string;
    items: string;
    total: number;
    notes?: string;
}) {
    return d1Query(
        `INSERT INTO orders (id, items, total, status, notes, created_at) 
     VALUES (?, ?, ?, 'pending', ?, ?)`,
        [data.id, data.items, data.total, data.notes || null, Date.now()]
    );
}

export async function getOrders(limit = 20) {
    return d1Query(
        `SELECT * FROM orders ORDER BY created_at DESC LIMIT ?`,
        [limit]
    );
}

// ============================================================================
// BOOKING OPERATIONS (Tajer)
// ============================================================================

export async function createBooking(data: {
    id: string;
    property_type: string;
    location: string;
    budget?: string;
    preferred_date?: string;
    customer_phone?: string;
}) {
    return d1Query(
        `INSERT INTO bookings (id, property_type, location, budget, preferred_date, customer_phone, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
            data.id,
            data.property_type,
            data.location,
            data.budget || null,
            data.preferred_date || null,
            data.customer_phone || null,
            Date.now()
        ]
    );
}

// ============================================================================
// RFQ OPERATIONS (Tirs)
// ============================================================================

export async function createRFQ(data: {
    id: string;
    part_name: string;
    quantity: number;
    machine_model?: string;
    urgency?: string;
    specs?: string;
}) {
    return d1Query(
        `INSERT INTO rfqs (id, material_name, quantity, specs, status, created_at)
     VALUES (?, ?, ?, ?, 'open', ?)`,
        [
            data.id,
            data.part_name,
            data.quantity,
            data.specs || null,
            Date.now()
        ]
    );
}

// ============================================================================
// SESSION OPERATIONS (Ostaz)
// ============================================================================

export async function createSession(data: {
    id: string;
    subject: string;
    grade_level?: string;
    preferred_time?: string;
    session_type?: string;
}) {
    return d1Query(
        `INSERT INTO sessions (id, subject, grade_level, preferred_time, session_type, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'scheduled', ?)`,
        [
            data.id,
            data.subject,
            data.grade_level || null,
            data.preferred_time || null,
            data.session_type || 'online',
            Date.now()
        ]
    );
}

// ============================================================================
// MEDICINE OPERATIONS (Dr. Moe)
// ============================================================================

export async function checkMedicineAvailability(medicineName: string) {
    return d1Query<{ name: string; quantity: number; price: number }>(
        `SELECT name, quantity, price FROM medicines WHERE name LIKE ? LIMIT 5`,
        [`%${medicineName}%`]
    );
}

export default {
    query: d1Query,
    createOrder,
    getOrders,
    createBooking,
    createRFQ,
    createSession,
    checkMedicineAvailability,
};
