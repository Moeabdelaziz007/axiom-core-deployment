# 🏗️ AXIOM INFRASTRUCTURE SUMMARY (The Brain's Blueprint)

> **System Version:** 3.0.0
> **Protocol:** Zero-Cost Engineering & Decentralized Orchestration

This document serves as the **Cognitive Core** for the Axiom Agent, detailing the complex logic and architectural decisions that power the system.

---

## 1. 🧠 AXIOM-BRAIN (D-RAG Protocol)

**Distributed Retrieval-Augmented Generation**

### The Problem

Reliance on paid LLM APIs (Gemini/OpenAI) for every query is financially unsustainable ($0.99 target impossible).

### The Solution: Hybrid Routing

We utilize a "Smart Router" Cloudflare Worker that assesses query complexity before routing.

- **Low Complexity (80% of traffic):** Routed to **Oracle Cloud ARM VM** running a quantized Llama-2-7b model via OpenVINO. Cost: **$0.00**.
- **High Complexity (20% of traffic):** Routed to **Google Gemini Pro**. Cost: Paid per token.

### Logic: `assessComplexity(query)`

```typescript
function assessComplexity(query: string): 'LOW' | 'HIGH' {
  // 1. Length Heuristic (> 500 chars -> HIGH)
  // 2. Keyword Heuristic ("analyze", "legal", "medical" -> HIGH)
  // 3. Context Heuristic (Requires history -> HIGH)
  return 'LOW'; // Default to free tier
}
```

---

## 2. 💳 PAYMENT AGGREGATOR (Secure HMAC)

**Paymob Integration Protocol**

### The Problem

Securely verifying payment callbacks from Paymob without exposing secrets or allowing replay attacks.

### The Solution: HMAC Verification

We implement a strict verification routine for all incoming webhooks.

### Logic: `verifyPaymobHMAC(data, secret)`

1. **Extract Keys:** Get all keys from the callback body (excluding `hmac` and `type`).
2. **Sort:** Sort keys lexicographically.
3. **Concatenate:** Join values into a single string.
4. **Hash:** Create a SHA-512 HMAC using the Paymob Secret Key.
5. **Compare:** Match the calculated hash with the `hmac` query parameter.

```typescript
// Conceptual Implementation
function verifyPaymobHMAC(data: any, hmac: string, secret: string): boolean {
  const values = [
    data.amount_cents,
    data.created_at,
    data.currency,
    data.error_occured,
    data.has_parent_transaction,
    data.id,
    data.integration_id,
    data.is_3d_secure,
    data.is_auth,
    data.is_capture,
    data.is_refunded,
    data.is_standalone_payment,
    data.is_voided,
    data.order.id,
    data.owner,
    data.pending,
    data.source_data.pan,
    data.source_data.sub_type,
    data.source_data.type,
    data.success,
  ];
  const concatenated = values.join('');
  const calculatedHmac = crypto.createHmac('sha512', secret).update(concatenated).digest('hex');
  return calculatedHmac === hmac;
}
```

---

## 3. ❤️ A-BOND (Axiom Bonding Curves)

**Sustainable Wealth Generation**

### The Concept

A mathematical pricing mechanism ensuring instant liquidity and predictable price action for Agent Tokens.

### The Curve

`Price = m * Supply^n`

- **m:** Slope (Growth rate)
- **n:** Exponent (Aggressiveness)

This ensures that as more people buy an Agent's token, the price increases deterministically. When they sell, it decreases, but liquidity is *always* available in the contract.

---

## 4. 🦴 T-ORC (Tokenized Orchestration)

**Decentralized Agent Governance**

### The Concept

Agents (Sofra, Aqar, Mawid) are not just code; they are **DAOs**.

- **Ownership:** Token holders vote on Agent upgrades.
- **Revenue:** Agent earnings (from gigs) are distributed to token stakers.
- **Identity:** Each Agent has a DID (Decentralized Identifier) on Solana.

---

## 5. 🛡️ ZERO-TRUST SECURITY

- **Edge Validation:** All inputs validated at Cloudflare Edge.
- **Sanitization:** Strict SQL/HTML injection prevention.
- **Rate Limiting:** DDoS protection via Cloudflare.

---
*Maintained by Axiom Agent - Cognitive Retrieval Protocol*
