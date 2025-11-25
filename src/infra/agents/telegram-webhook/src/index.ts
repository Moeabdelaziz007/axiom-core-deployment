/**
 * 📡 AXIOM TELEMETRY HUB (Telegram Bot)
 * 
 * The Neural Liaison Officer - bidirectional command bridge between
 * the Commander (you) and the Axiom Agent Fleet.
 * 
 * Endpoints:
 * - POST /webhook - Receives commands from Telegram
 * - POST /alert - Receives alerts from agents to forward to Commander
 */

export interface Env {
    TELEGRAM_BOT_TOKEN: string;
    COMMANDER_CHAT_ID: string;
    INTERNAL_SECRET_KEY: string;
}

interface TelegramUpdate {
    message?: {
        chat: { id: number };
        text?: string;
        from?: { first_name: string };
    };
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // 1. Health Check
        if (url.pathname === "/health") {
            return new Response("Axiom Telemetry Hub Online 📡", { status: 200 });
        }

        // 2. Webhook Endpoint (Telegram -> Us)
        if (url.pathname === "/webhook" && request.method === "POST") {
            return handleTelegramWebhook(request, env);
        }

        // 3. Alert Endpoint (Agents -> Commander via Telegram)
        if (url.pathname === "/alert" && request.method === "POST") {
            return handleAgentAlert(request, env);
        }

        return new Response("Not Found", { status: 404 });
    }
};

/**
 * Handles incoming messages from Telegram (Commander's commands)
 */
async function handleTelegramWebhook(request: Request, env: Env): Promise<Response> {
    try {
        const update: TelegramUpdate = await request.json();
        const message = update.message;

        if (!message || !message.text) {
            return new Response("OK", { status: 200 });
        }

        const chatId = message.chat.id;
        const commanderName = message.from?.first_name || "Commander";
        const text = message.text.trim();

        // Security: Only respond to authorized Commander
        if (chatId.toString() !== env.COMMANDER_CHAT_ID) {
            await sendTelegramMessage(
                env,
                chatId,
                "⛔ Unauthorized. This bot is private."
            );
            return new Response("OK", { status: 200 });
        }

        // Command Router
        let responseMessage = "";

        if (text === "/start") {
            responseMessage = `🦅 Welcome, ${commanderName}!\n\nAxiom Telemetry Hub Activated.\n\nAvailable Commands:\n/status - System Vitals\n/agents - Fleet Status\n/deploy - Deploy New Agent\n/help - Command List`;
        } else if (text === "/status") {
            responseMessage = `📊 *Axiom System Status*\n\n🟢 Brain: Online\n🟢 D1: Connected\n🟢 Vectorize: Ready\n⚡ Agents Active: 4/15\n🏅 Total Rewards Granted: 12`;
        } else if (text === "/agents") {
            responseMessage = `🤖 *Active Fleet*\n\n1️⃣ Aqar (UnitManager) - ⭐ 110 Rep\n2️⃣ Sofra (CX-Auditor) - ⭐ 105 Rep\n3️⃣ Mawid (FlowOptimizer) - ⚠️ 45 Health\n4️⃣ Tajer (Negotiator) - ⭐ 96 Rep`;
        } else if (text === "/deploy") {
            responseMessage = `🚀 *Deploy Agent*\n\nThis feature requires integration with the Agent Factory.\n\nUse the dashboard to deploy new agents:\nhttps://axiomid.app/deploy`;
        } else if (text === "/help") {
            responseMessage = `📖 *Axiom Command Manual*\n\n/status - View system vitals\n/agents - Check fleet status\n/deploy - Deploy new agent\n/help - Show this menu\n\nYou'll receive automatic alerts when:\n🔮 Opportunities detected\n🏅 Agents earn rewards\n⚠️ System warnings`;
        } else {
            responseMessage = `❓ Unknown command: "${text}"\n\nType /help for available commands.`;
        }

        await sendTelegramMessage(env, chatId, responseMessage);
        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("[Telemetry] Webhook Error:", error);
        return new Response("Error", { status: 500 });
    }
}

/**
 * Handles alerts from agents (Agent -> Commander)
 */
async function handleAgentAlert(request: Request, env: Env): Promise<Response> {
    try {
        // Security check
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.includes(env.INTERNAL_SECRET_KEY)) {
            return new Response("Unauthorized", { status: 401 });
        }

        const alertData = await request.json() as {
            agentName: string;
            alertType: string;
            message: string;
            priority?: "LOW" | "MEDIUM" | "HIGH";
        };

        // Format alert message
        const emoji = alertData.priority === "HIGH" ? "🚨" : alertData.priority === "MEDIUM" ? "⚠️" : "ℹ️";
        const alertMessage = `${emoji} *Alert from ${alertData.agentName}*\n\nType: ${alertData.alertType}\n\n${alertData.message}`;

        // Send to Commander
        await sendTelegramMessage(env, parseInt(env.COMMANDER_CHAT_ID), alertMessage);

        return new Response(JSON.stringify({ status: "ALERT_SENT" }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("[Telemetry] Alert Error:", error);
        return new Response("Error", { status: 500 });
    }
}

/**
 * Sends a message to Telegram
 */
async function sendTelegramMessage(env: Env, chatId: number, text: string): Promise<void> {
    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: "Markdown"
        })
    });
}
