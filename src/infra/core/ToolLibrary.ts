import crypto from 'crypto';

/**
 * 🛠️ AXIOM TOOL LIBRARY
 * Centralized utility functions for the Axiom System.
 */

// --- D-RAG TOOLS ---

/**
 * Assess the complexity of a user query to determine routing.
 * @param query The user's input text
 * @returns 'LOW' for Oracle VM (Free), 'HIGH' for Gemini (Paid)
 */
export function assessComplexity(query: string): 'LOW' | 'HIGH' {
    const q = query.toLowerCase();

    // 1. Length Heuristic
    if (query.length > 500) return 'HIGH';

    // 2. Keyword Heuristic
    const highComplexityTriggers = [
        "analyze", "strategy", "predict", "correlate", "synthesis",
        "legal", "medical", "financial advice", "code generation"
    ];
    if (highComplexityTriggers.some(trigger => q.includes(trigger))) return 'HIGH';

    // 3. Default
    return 'LOW';
}

// --- PAYMENT TOOLS ---

/**
 * Verify the HMAC signature of a Paymob callback.
 * @param data The request body from Paymob
 * @param hmac The 'hmac' query parameter
 * @param secret The Paymob HMAC Secret Key
 * @returns true if valid, false otherwise
 * 
 * @remarks
 * This function uses HMAC-SHA512 to verify the integrity of data received from Paymob.
 * The function calculates the HMAC using the provided data and secret key, then compares
 * the calculated HMAC with the received HMAC. If the two HMACs match, the data is considered
 * to be authentic. The secret key is specific to Paymob and should be securely stored.
 * Ensure the secret key is properly configured in your environment.
 */
export function verifyPaymobHMAC(data: any, hmac: string, secret: string): boolean {
    try {
        const keys = [
            "amount_cents",
            "created_at",
            "currency",
            "error_occured",
            "has_parent_transaction",
            "id",
            "integration_id",
            "is_3d_secure",
            "is_auth",
            "is_capture",
            "is_refunded",
            "is_standalone_payment",
            "is_voided",
            "order.id",
            "owner",
            "pending",
            "source_data.pan",
            "source_data.sub_type",
            "source_data.type",
            "success",
        ];

        // Extract and sort values based on the specific Paymob key order (lexicographical)
        // Note: In a real implementation, we might need to flatten the object first if keys are nested differently
        // But for Paymob, we usually extract specific known keys.

        // However, the standard Paymob algo is:
        // 1. Extract values of specific keys
        // 2. Concatenate them
        // 3. Hash

        // Let's implement a robust extractor based on the keys list
        let concatenated = "";
        for (const key of keys) {
            const value = getValueByKey(data, key);
            concatenated += value.toString();
        }

        const calculatedHmac = crypto.createHmac('sha512', secret)
            .update(concatenated)
            .digest('hex');

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
// --- PREMIUM AGENT TOOLS (TIER-1) ---

/**
 * 🏠 UNIT MANAGER (Agent Aqar)
 * Manages rental units including booking, cleaning, and maintenance.
 */
export function manageUnit(unitId: string, action: 'book' | 'clean' | 'maintain', details: any): { success: boolean, message: string } {
    // Mock logic - in production this connects to a booking engine or maintenance API
    console.log(`[UnitManager] Processing ${action} for unit ${unitId}`, details);
    return {
        success: true,
        message: `Unit ${unitId} ${action} scheduled successfully. Notification sent to owner.`
    };
}

/**
 * 🍽️ CX AUDITOR (Agent Sofra)
 * Manages Customer Experience: feedback, complaints, and NPS.
 */
export function auditCX(restaurantId: string, feedbackSource: 'facebook' | 'whatsapp' | 'direct', content: string): { sentiment: string, actionRequired: boolean } {
    // Mock logic - uses simple keyword analysis (would use Gemini in prod)
    const negativeKeywords = ['bad', 'slow', 'cold', 'rude', 'dirty'];
    const isNegative = negativeKeywords.some(w => content.toLowerCase().includes(w));

    console.log(`[CX-Auditor] Analyzing feedback for ${restaurantId} from ${feedbackSource}`);

    return {
        sentiment: isNegative ? 'NEGATIVE' : 'POSITIVE',
        actionRequired: isNegative
    };
}

/**
 * 📅 FLOW OPTIMIZER (Agent Mawid)
 * Optimizes workflows, schedules, and reminders.
 */
export function optimizeFlow(calendarId: string, constraints: any): { optimizedSchedule: any[], efficiencyGain: number } {
    // Mock logic - reorders slots for efficiency
    console.log(`[FlowOptimizer] Optimizing calendar ${calendarId}`);
    return {
        optimizedSchedule: [], // Would return reordered slots
        efficiencyGain: 15.5 // Percentage of time saved
    };
}

// --- SUPERPOWER TOOLS (NEXT-GEN) ---

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * 🔮 AQAR MARKET ORACLE
 * Uses ARIMA-like simulation to detect market anomalies and underpriced assets.
 */
export const marketOracleTool = new DynamicStructuredTool({
    name: "market_oracle",
    description: "Analyzes real estate market data to detect underpriced assets and investment opportunities using simulated ARIMA forecasting.",
    schema: z.object({
        assetId: z.string().describe("The ID of the property or asset to analyze"),
        currentPrice: z.number().describe("The current listing price"),
        historicalPrices: z.array(z.number()).describe("Array of historical prices for the last 12 months"),
        locationScore: z.number().min(0).max(10).describe("A score representing location quality (0-10)")
    }),
    func: async ({ assetId, currentPrice, historicalPrices, locationScore }) => {
        console.log(`[MarketOracle] Analyzing asset ${assetId}...`);

        // 1. Simple Moving Average (SMA) as a baseline
        const sma = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;

        // 2. Simulated ARIMA Prediction (Simplified for Serverless)
        // In a real WASM implementation, this would run the ARIMA model.
        // Here we simulate a trend based on the last 3 months vs SMA.
        const recentTrend = historicalPrices.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const momentum = recentTrend / sma;

        // 3. Intrinsic Value Calculation
        // Formula: SMA * Momentum * (1 + LocationBonus)
        const locationBonus = (locationScore - 5) / 20; // +/- 25% based on location
        const predictedValue = sma * momentum * (1 + locationBonus);

        // 4. Opportunity Detection
        const isUndervalued = currentPrice < (predictedValue * 0.9); // 10% discount threshold
        const riskScore = Math.abs(1 - (currentPrice / predictedValue));

        return JSON.stringify({
            assetId,
            predictedValue: Math.round(predictedValue),
            isUndervalued,
            riskScore: parseFloat(riskScore.toFixed(2)),
            recommendation: isUndervalued ? "BUY_OPPORTUNITY" : "HOLD_OR_SELL",
            analysis: `Asset is trading at $${currentPrice}, predicted value is $${Math.round(predictedValue)}. Momentum is ${momentum.toFixed(2)}.`
        });
    }
});

/**
 * 🛡️ SOFRA SENTIMENT GUARD
 * Proactive CX protection that predicts churn risk based on sentiment and interaction history.
 */
export const sentimentGuardTool = new DynamicStructuredTool({
    name: "sentiment_guard",
    description: "Analyzes customer sentiment and interaction history to predict churn risk and suggest proactive interventions.",
    schema: z.object({
        userId: z.string().describe("The user ID"),
        lastMessage: z.string().describe("The text of the last customer message"),
        interactionHistory: z.array(z.object({
            role: z.enum(["user", "agent"]),
            sentiment: z.enum(["positive", "neutral", "negative"])
        })).describe("Recent interaction history with sentiment labels")
    }),
    func: async ({ userId, lastMessage, interactionHistory }) => {
        console.log(`[SentimentGuard] Protecting CX for user ${userId}...`);

        // 1. Real-time Sentiment Analysis of last message
        // Simple heuristic for demo: check for escalation keywords
        const escalationKeywords = ["angry", "cancel", "refund", "manager", "stupid", "slow"];
        const isEscalation = escalationKeywords.some(w => lastMessage.toLowerCase().includes(w));

        // 2. Churn Risk Calculation (Recency & Frequency of Negativity)
        const negativeInteractions = interactionHistory.filter(i => i.sentiment === "negative").length;
        const totalInteractions = interactionHistory.length;
        const negativeRatio = totalInteractions > 0 ? negativeInteractions / totalInteractions : 0;

        let churnRisk = negativeRatio * 100;
        if (isEscalation) churnRisk += 50; // Immediate spike

        churnRisk = Math.min(churnRisk, 100); // Cap at 100%

        // 3. Intervention Strategy
        let intervention = "NONE";
        if (churnRisk > 80) intervention = "ESCALATE_TO_HUMAN";
        else if (churnRisk > 50) intervention = "OFFER_PROMO_CODE";
        else if (churnRisk > 30) intervention = "APOLOGIZE_AND_ASSIST";

        return JSON.stringify({
            userId,
            churnRisk: Math.round(churnRisk),
            isEscalation,
            intervention,
            analysis: `User shows ${Math.round(churnRisk)}% churn risk. Negative ratio: ${negativeRatio.toFixed(2)}.`
        });
    }
});

/**
 * 🔮 MAWID FLOW PREDICTOR
 * Predicts the likelihood of appointment no-shows to optimize scheduling.
 */
export const flowPredictorTool = new DynamicStructuredTool({
    name: "flow_predictor",
    description: "Predicts the probability of a 'no-show' for a scheduled appointment based on historical data and user behavior.",
    schema: z.object({
        appointmentId: z.string(),
        userReliabilityScore: z.number().min(0).max(100).describe("Historical attendance rate %"),
        daysInAdvance: z.number().describe("How many days in advance was this booked?"),
        isRainyWeather: z.boolean().describe("Is rain forecast for the appointment time?")
    }),
    func: async ({ appointmentId, userReliabilityScore, daysInAdvance, isRainyWeather }) => {
        console.log(`[FlowPredictor] Predicting flow for ${appointmentId}...`);

        // Base probability is inverse of reliability
        let noShowProb = 100 - userReliabilityScore;

        // Factor 1: Booking too far in advance increases risk
        if (daysInAdvance > 14) noShowProb += 10;
        if (daysInAdvance > 30) noShowProb += 20;

        // Factor 2: Weather
        if (isRainyWeather) noShowProb += 15;

        noShowProb = Math.min(noShowProb, 100);

        return JSON.stringify({
            appointmentId,
            noShowProbability: noShowProb,
            requiresConfirmation: noShowProb > 30,
            suggestedAction: noShowProb > 50 ? "DOUBLE_CONFIRMATION_CALL" : "STANDARD_SMS"
        });
    }
});

/**
 * 🎓 MENTOR EVOLUTIONARY FEEDBACK
 * Used by the Agent Mentor to grade performance and update agent memory.
 */
export const evolutionaryFeedbackTool = new DynamicStructuredTool({
    name: "evolutionary_feedback",
    description: "Logs performance feedback and updates the agent's evolutionary memory with new rules.",
    schema: z.object({
        agentId: z.string().describe("The ID of the agent being mentored"),
        taskId: z.string().describe("The ID of the task performed"),
        successRating: z.number().min(0).max(100).describe("Performance score (0-100)"),
        improvementSuggestion: z.string().describe("Specific advice for improvement"),
        newRule: z.string().optional().describe("A new rule to add to the agent's memory (e.g., 'Be more concise')")
    }),
    func: async ({ agentId, taskId, successRating, improvementSuggestion, newRule }) => {
        console.log(`[Mentor] Grading Agent ${agentId} on Task ${taskId}... Score: ${successRating}`);

        // 🏆 AXIOM INCENTIVE PROTOCOL (AIP)
        // Automatic reward distribution for high performance
        let reward = null;
        if (successRating > 90) {
            reward = {
                type: "Excellence Badge",
                reputationBoost: 10,
                perk: "Overclock Mode Unlocked (1 Free Use)"
            };
            console.log(`[AIP] 🌟 Granting Reward to ${agentId}:`, reward);
        }

        // In a real implementation, this would write to Supabase tables:
        // 1. agent_performance_logs
        // 2. agents (update evolution_rules, reputation, badges)
        // 3. agent_rewards_log (if reward granted)

        const feedbackLog = {
            agentId,
            taskId,
            rating: successRating,
            suggestion: improvementSuggestion,
            ruleAdded: newRule ? "YES" : "NO",
            rewardGranted: reward ? "YES" : "NO",
            timestamp: new Date().toISOString()
        };

        return JSON.stringify({
            status: "FEEDBACK_RECORDED",
            log: feedbackLog,
            reward,
            message: `Agent ${agentId} graded. Rule: ${newRule || "None"}. Reward: ${reward ? reward.type : "None"}.`
        });
    }
});
