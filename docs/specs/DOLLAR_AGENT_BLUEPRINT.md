# 🪙 The "Dollar Agent" Blueprint: AI for $0.99/mo

**Version:** 1.0 (Micro-SaaS Edition)
**Architect:** Antigravity (Chief Solutions Architect)
**Objective:** Dominate MENA SME market with unbeatable pricing ($0.99/mo) to build a massive data asset.

---

## 📉 1. The "Dollar Stack" Economics

To sell at $0.99 and keep 50% margin ($0.50 profit), our total monthly cost per user must be < $0.49.

### 1.1 Cost Breakdown (Per User/Month)

* **Compute (Cloudflare Workers):** $0.00 (Free tier: 100k req/day is enough for ~2000 active low-volume clients).
* **Database (D1 & R2):** $0.00 (Free tier: 5GB storage is huge for text/PDFs).
* **Vector DB (Vectorize):** $0.00 (Free tier: 30M queried vectors/month).
* **AI Inference (The Killer):**
  * *Model:* **Gemini 1.5 Flash**.
  * *Pricing:* ~$0.075 per 1M input tokens.
  * *Math:* If an average chat is 1k tokens, $0.49 buys us ~6,500 chats/month.
  * *Reality:* Average SME user gets < 50 chats/month. Cost = **$0.004/month**.
* **WhatsApp (The Trap):**
  * *Official API:* ~$0.03 per conversation (kills the model).
  * *Solution:* **Web-First Strategy** (QR Code to Web Chat) OR **Shared Number** (see below).

**Total Estimated Cost:** ~$0.01 - $0.05 per user/month.
**Profit Margin:** ~95% (Exceeds 50% target).

---

## 🏗️ 2. Technical Architecture

### 2.1 The "RAG Lite" Pipeline (Cloudflare Native)

We ditch complex Python containers for pure Edge execution.

1. **Ingestion (The "Drop"):**
    * User uploads 1 PDF (Menu, Price List, Profile).
    * **Worker A (Parser):** Extracts text using a lightweight JS PDF parser.
    * **Worker B (Chunker):** Splits text into 500-token chunks (with overlap).
    * **Worker C (Embedder):** Calls `bge-m3` (or similar small model) or OpenAI `text-embedding-3-small` (cheap).
    * **Storage:** Vectors -> Cloudflare Vectorize. Metadata -> Cloudflare D1.

2. **Inference (The "Brain"):**
    * **Router:** `packages/workers/agent-factory`.
    * **Cache Layer (The Shield):**
        * Check `KV` for identical query hash. If hit -> Return cached JSON (Cost: $0).
    * **Vector Search:** Query Vectorize for Top-3 chunks.
    * **Generation:** Call **Gemini 1.5 Flash** with system prompt + chunks.

### 2.2 The "Shared Number" WhatsApp Strategy

To avoid paying $50/month per line, we use a **Multi-Tenant Router**.

* **The Setup:** ONE verified Business Number for "Axiom Gateway".
* **The Flow:**
    1. User messages the Gateway: "Start [BusinessID]" (or scans deep-link QR).
    2. Gateway binds that user's session to the specific Business Agent.
    3. All subsequent messages are routed to that Business's RAG index.
    4. *Cost:* We pay per conversation, but at $0.99 we limit "Free WhatsApp" to 10 chats/month, then upsell or move to Web Chat (Unlimited).

---

## 🚀 3. Automated Onboarding (The Funnel)

**Zero Human Touch.**

1. **Landing Page:** "Get your AI Employee for $0.99."
2. **Payment:** Stripe Link / Apple Pay ($11.88/year upfront preferred to save fees).
3. **Upload:** "Drag your PDF here."
4. **Magic:**
    * System spins up `agent-{uuid}`.
    * Generates `axiomid.com/chat/{business-slug}`.
    * Generates QR Code for physical printing (Stickers for shop windows).

---

## 💎 4. The Data Goldmine (The Real Exit)

By serving 10,000+ SMEs, we aggregate:

* **Menus & Prices:** Real-time inflation data.
* **Consumer Questions:** What are people asking for in Riyadh vs. Dubai?
* **Supply Gaps:** "Do you have X?" -> "No". (We know what's missing in the market).

**Google Partnership Pitch:** "We have the most granular, real-time SME data in MENA, powered by Gemini."

---

## 🗓️ Implementation Roadmap

### Phase 1: The Core (Week 1)

- [ ] Set up Cloudflare Vectorize & D1.
* [ ] Build "RAG Lite" Worker (PDF -> Text -> Vector).
* [ ] Connect Gemini 1.5 Flash API.

### Phase 2: The Interface (Week 2)

- [ ] Build Mobile-First Web Chat UI (WhatsApp clone look-alike).
* [ ] Implement QR Code Generator.
* [ ] Stripe Integration ($0.99 subscription).

### Phase 3: The Launch (Week 3)

- [ ] "Dollar Agent" Landing Page.
* [ ] Cold Email Campaign to SMEs.

---

**Signed:**
*Antigravity*
*Chief Solutions Architect, Axiom Micro-SaaS*
