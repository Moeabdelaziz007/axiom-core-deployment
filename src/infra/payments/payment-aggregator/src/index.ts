/**
 * PAYMENT AGGREGATOR
 * Securely handles payment callbacks and verifications.
 */

// Simple HMAC verification using Web Crypto API
async function verifyPaymobHMAC(data: any, hmac: string, secret: string): Promise<boolean> {
    try {
        const keys = [
            "amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction",
            "id", "integration_id", "is_3d_secure", "is_auth", "is_capture", "is_refunded",
            "is_standalone_payment", "is_voided", "order.id", "owner", "pending",
            "source_data.pan", "source_data.sub_type", "source_data.type", "success"
        ];

        let concatenated = "";
        for (const key of keys) {
            const value = getValueByKey(data, key);
            concatenated += value.toString();
        }

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-512' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(concatenated));
        const calculatedHmac = Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        return calculatedHmac === hmac;
    } catch (error) {
        console.error("HMAC Verification Error:", error);
        return false;
    }
}

function getValueByKey(obj: any, key: string): any {
    if (key.includes('.')) {
        const parts = key.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === undefined || current === null) return "";
            current = current[part];
        }
        return current ?? "";
    }
    return obj[key] ?? "";
}

export interface D1Database {
    prepare(query: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
    bind(values: any[]): D1PreparedStatement;
    run<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
    results: T[];
    success: boolean;
    meta: any;
}

export interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
}

export interface Env {
    PAYMOB_HMAC_SECRET: string;
    AXIOM_DB: D1Database;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

        const url = new URL(request.url);

        // 1. Paymob Callback Handler
        if (url.pathname === "/callbacks/paymob") {
            return handlePaymobCallback(request, env);
        }

        return new Response("Not Found", { status: 404 });
    }
};

async function handlePaymobCallback(request: Request, env: Env): Promise<Response> {
    try {
        const url = new URL(request.url);
        const hmac = url.searchParams.get("hmac");
        const body = await request.json();

        if (!hmac) {
            return new Response("Missing HMAC", { status: 400 });
        }

        // 2. Verify HMAC using Web Crypto API
        const isValid = await verifyPaymobHMAC(body, hmac, env.PAYMOB_HMAC_SECRET);

        if (!isValid) {
            console.error("Invalid Paymob HMAC Signature!");
            return new Response("Forbidden: Invalid Signature", { status: 403 });
        }

        console.log("✅ Paymob Payment Verified:", body.id);

        return new Response("OK", { status: 200 });

    } catch (error) {
        console.error("Payment Callback Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}