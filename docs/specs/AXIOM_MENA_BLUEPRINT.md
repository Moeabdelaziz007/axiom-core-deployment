# 🕌 Axiom Cloud MENA: The "Agent Souq" Blueprint

**Version:** 1.0 (No-Code / Arabic-First Edition)
**Architect:** Antigravity (CPO & Localization Lead)
**Target Market:** GCC & MENA Region (SMEs, Real Estate, E-commerce)

---

## 🧭 Executive Summary: "Digital Employees, Not Code"

The MENA market doesn't want "AI Agents"; they want "Digital Employees" that speak their language, understand their culture, and start working immediately. We are pivoting from a developer-centric platform to a **Business-First SaaS**.

**The Promise:** "Hire a Customer Service Agent for $50/month. Onboard them in 5 minutes."

---

## 🏗️ Pillar 1: The "Agent Souq" (Marketplace Architecture)

Instead of "creating" agents, users "hire" pre-configured roles.

### 1.1 The Catalog (Pre-Wired Templates)

Each template is an `AixAgent` with frozen logic and exposed configuration slots.

| Agent Role | Arabic Title | Core Function | Pre-Configured Tools |
| :--- | :--- | :--- | :--- |
| **Agent Khidma** | 🤝 موظف خدمة العملاء | FAQ, Order Tracking, Complaint Handling | `kb_search`, `whatsapp_reply`, `human_escalation` |
| **Agent Dalal** | 💰 خبير المبيعات | Lead Qualification, Negotiation, Closing | `crm_add_lead`, `calendar_book`, `whatsapp_followup` |
| **Agent Mudeer** | 📅 المساعد الإداري | Scheduling, Meeting Summaries, Invoicing | `calendar_check`, `calendar_book`, `ocr_invoice_scan` |

### 1.2 One-Click "Onboarding" Flow

The user experience mimics hiring a human:

1. **Select Role:** "I need a Sales Agent (Dalal)."
2. **Upload "Training Manual":** User drags & drops Company Profile (PDF) + Price List (Excel).
3. **Interview (Config):** Set Name (e.g., "Sarah"), Tone, and WhatsApp Number.
4. **Deploy:** System auto-generates the RAG index and connects the webhook.

---

## 🗣️ Pillar 2: Arabic-First Engineering

Standard AI pipelines fail in MENA. We build specifically for RTL and Dialects.

### 2.1 RAG Strategy for Arabic (Right-to-Left)

* **Text Splitter:** Custom `RecursiveCharacterTextSplitter` optimized for Arabic.
  * *Issue:* Standard splitters often break words in RTL scripts.
  * *Fix:* Use regex separators `["\n\n", "\n", "۔", "؟", " "]` to respect sentence boundaries.
* **Embedding Model:**
  * **Primary:** `text-embedding-3-large` (OpenAI). High performance on Arabic, cost-effective.
  * **Sovereign Option (Future):** `Jais` (Inception) or `multilingual-e5-large` (Self-hosted) for clients requiring data residency in UAE/KSA.
* **Retrieval:** Hybrid Search (Keyword + Vector) is crucial because Arabic morphology (prefixes/suffixes) can confuse pure vector search.

### 2.2 Voice & Dialects (The "Souq" Voice)

* **STT (Input):** `OpenAI Whisper (large-v3)`. Unbeatable for handling mixed dialects (e.g., Saudi + English tech terms).
* **TTS (Output):** `ElevenLabs Multilingual v2`.
  * *Config:* We will curate specific "Voices" that sound local (e.g., a warm Gulf accent, a professional Levantine accent).

---

## 🎛️ Pillar 3: No-Code Customization UI

The "Settings" page is replaced by a "Manager's Office" UI.

### 3.1 The "Formality" Slider (مؤشر الرسمية)

A simple slider controls the `{{tone}}` variable in the System Prompt.

* **0% (Friendly/Shabab):** "هلا والله! آمرني طال عمرك، كيف أقدر أخدمك اليوم؟" (Emojis, slang).
* **50% (Balanced/Modern):** "أهلاً بك في أكسيوم. كيف يمكنني مساعدتك في طلبك؟" (Polite, clear).
* **100% (Formal/Royal):** "السلام عليكم ورحمة الله وبركاته. نسعد بخدمتكم، تفضلوا بطرح استفساركم." (Strict Fusha).

### 3.2 Knowledge Base "Drop Zone"

* **UI:** A simple box: "Drop your files here to train Sarah."
* **Backend:** Auto-ingest -> OCR (for scanned Arabic docs) -> Chunk -> Embed -> Index.
* **Status:** Show "Learning..." -> "Ready".

### 3.3 Human Handover Protocol (التسليم للموظف)

* **Trigger:** User says "أبغا إنسان", "كلمني", "Human", or Sentiment Score < -0.7.
* **Action:**
    1. Agent replies: "تحت أمرك، بحولك لزميلي المختص حالاً."
    2. Agent pauses itself (stops replying).
    3. System sends WhatsApp Notification to the Business Owner: "🚨 Intervention Needed: Customer X is asking for you."

---

## 🤖 Pillar 4: Ops Automation (Antigravity Role)

We remove the pain of Meta's API setup.

### 4.1 WhatsApp Webhook Automation

Instead of asking the user to "Configure Webhook URL in Meta Developer Portal":

1. **User Action:** User logs in with Facebook (OAuth) via our "Connect WhatsApp" button.
2. **Antigravity Action:**
    * Fetch `access_token` and `WABA_ID`.
    * Programmatically call Meta Graph API to `POST /subscriptions` with our callback URL.
    * Verify the token automatically.
3. **Result:** Green checkmark "WhatsApp Connected".

### 4.2 DevOps & Maintenance

* **Open Agent Manager (OAM):** We use OAM as the multi-tenant orchestrator.
  * Each "Company" = A Namespace in OAM.
  * Each "Agent" = A Container/Worker managed by OAM.
* **Antigravity's Job:** Monitor error rates. If an agent fails (e.g., OpenAI outage), auto-switch to fallback model (e.g., Haiku or Llama 3) transparently.

---

## 🗓️ Implementation Roadmap

### Phase 1: The Foundation (Weeks 1-2)

- [ ] Build `ArabicTextSplitter` and RAG pipeline.
* [ ] Create `customer_service_ar` System Prompt template.
* [ ] Implement "Formality Slider" logic in prompt injection.

### Phase 2: The Connector (Weeks 3-4)

- [ ] Build "Connect WhatsApp" OAuth flow.
* [ ] Implement automated Webhook registration.
* [ ] Develop "Human Handover" state machine.

### Phase 3: The Souq Launch (Weeks 5-6)

- [ ] Deploy "Agent Souq" UI (Bento Grid layout).
* [ ] Launch with 3 core templates (Support, Sales, Booking).
* [ ] Marketing: "Hire your first AI employee today."

---

**Signed:**
*Antigravity*
*Chief Product Officer, Axiom Cloud MENA*
