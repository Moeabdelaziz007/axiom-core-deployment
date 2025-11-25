import { verifyPaymobHMAC } from '../../../core/ToolLibrary';

/**
 * PAYMENT AGGREGATOR
 * Securely handles payment callbacks and verifications.
 */

export interface D1Database {
    prepare(query: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
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

        // 2. Verify HMAC using Centralized Tool Library
        const isValid = verifyPaymobHMAC(body, hmac, env.PAYMOB_HMAC_SECRET);

        if (!isValid) {
            console.error("Invalid Paymob HMAC Signature!");
            return new Response("Forbidden: Invalid Signature", { status: 403 });
        }

        console.log("✅ Paymob Payment Verified:", body.id);

        // TODO: Update Order Status in D1 Database
        // await env.AXIOM_DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind("paid", body.order.id).run();

        return new Response("OK", { status: 200 });

    } catch (error) {
        console.error("Payment Callback Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
