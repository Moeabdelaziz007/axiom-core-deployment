# 🦄 Axiom Unicorn Plan: The Data Refinery Strategy

**Version:** 1.0 (Unicorn Edition)
**Role:** Chief Technology Officer (CTO) & Data Strategist
**Mission:** Transform the $0.99 Agent into a Data Acquisition Engine for MENA.

---

## 🗺️ Executive Strategy: "The Google & Grok Gambit"

We are not just selling AI agents; we are building the **definitive structured directory of MENA SMEs**.
By offering an irresistible $0.99/month "Digital Employee," we incentivize business owners to upload their raw data (PDFs, Menus, Price Lists). We then "refine" this raw ore into structured JSON gold, ready for integration with Google Maps and other platforms.

**The Value Equation:**

* **For the User:** An AI agent that sells for them.
* **For Us:** A verified, real-time database of 50,000+ businesses (Data Asset).
* **For Google:** The missing link to MENA's unorganized SME sector.

---

## 🏭 1. The "Data Refinery" Pipeline

**Goal:** Turn every PDF upload into a structured database entry.

### 1.1 The Extraction Worker (`data-refinery.ts`)

Instead of just "chunking" text for RAG, we perform a parallel **Extraction Pass**.

1. **Input:** User uploads `menu.pdf` or `company_profile.pdf`.
2. **Processing:**
    * **Gemini 1.5 Flash** is called with a specific `Extraction Schema`.
    * *Prompt:* "Extract the following business details into JSON: Business Name, Address, Phone, Opening Hours, Services List, Price Range, Cuisine Type (if restaurant)."
3. **Output (The Gold):**
    * Save structured JSON to **Cloudflare D1** (`business_registry` table).
    * *Schema:* Compatible with **Schema.org/LocalBusiness**.

### 1.2 The Verification Loop

* **Agent Challenge:** If data is missing (e.g., no opening hours found), the Agent *asks* the user during onboarding: "I noticed your menu doesn't have opening hours. When are you open?"
* **Result:** Data completeness improves automatically through conversation.

---

## 🏎️ 2. The "Hybrid Engine" (Gemini + Grok)

**Goal:** Lowest possible inference cost without sacrificing quality.

### 2.1 The Router Logic (`inference-router.ts`)

We dynamically select the model based on the *nature* of the request.

| Trigger | Model | Why? | Cost |
| :--- | :--- | :--- | :--- |
| **Heavy Context** (RAG, PDF Reading) | **Gemini 1.5 Flash** | Massive context window (1M tokens), cheap input. | Low |
| **Quick Chat** (Sales, Chit-chat) | **Grok (xAI)** | Fast, "witty" personality, very low cost API. | Very Low |
| **Complex Reasoning** (Strategy) | **Gemini 1.5 Pro** | Only used for "Premium" tier ($19/mo). | High |

### 2.2 Grok Integration

* **Use xAI API** for the "Sales Agent" persona.
* *Advantage:* Grok's "fun mode" fits the friendly/informal culture of MENA commerce better than the robotic GPT-4.

---

## 📍 3. Google Maps Integration (The Bait)

**Goal:** Provide immediate tangible value to the user while verifying our data.

### 3.1 "Sync with Maps" Feature

* **UI:** A button in the dashboard: "Publish to Google Maps".
* **Tech:**
  * Use **Google Business Profile API**.
  * Push the structured data from our D1 `business_registry` to their GMB listing.
  * *Benefit:* User gets SEO boost; We get "Verified by Google" status for our data.

---

## 📊 4. SaaS Profitability Schema

**Goal:** Track Unit Economics per Tenant.

### 4.1 D1 Database Schema (`schema.sql`)

```sql
-- The Data Goldmine
CREATE TABLE business_registry (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  location_lat_long TEXT,
  structured_data JSON, -- The extracted Schema.org JSON
  data_quality_score INTEGER, -- 0-100 (Completeness)
  google_sync_status TEXT
);

-- The Unit Economics
CREATE TABLE tenant_metrics (
  tenant_id TEXT PRIMARY KEY,
  subscription_tier TEXT, -- 'DOLLAR' or 'PREMIUM'
  tokens_input INTEGER,
  tokens_output INTEGER,
  model_usage_gemini INTEGER,
  model_usage_grok INTEGER,
  total_cost_usd REAL,
  revenue_usd REAL,
  margin_percent REAL GENERATED ALWAYS AS ((revenue_usd - total_cost_usd) / revenue_usd) STORED
);
```

---

## 🗓️ Implementation Roadmap (The Unicorn Path)

### Phase 1: The Refinery (Week 1)

- [ ] Implement `data-refinery` Worker (Gemini Extraction).
* [ ] Define D1 Schema for `business_registry`.

### Phase 2: The Hybrid Engine (Week 2)

- [ ] Integrate **xAI API** (Grok) into `tool-executor`.
* [ ] Build `InferenceRouter` logic.

### Phase 3: The Integration (Week 3)

- [ ] Build "Sync to Google Maps" prototype.
* [ ] Launch "Dollar Agent" with Data Extraction enabled.

---

**Signed:**
*Antigravity*
*CTO & Data Strategist, Axiom Cloud MENA*
