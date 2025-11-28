# 🕸️ AXIOM CONTROL FABRIC (ACF)

**System OS v3.0**

> "The nervous system of the Axiom Network."

---

## 1. 📡 ACF Telemetry Hub (Telegram)

**Goal:** Real-time command and control via a simple chat interface.

### Architecture

- **Channel:** Private Telegram Channel (The "Cockpit").
- **Bot:** `AxiomControllerBot` (Admin privileges).
- **Flow:**
  1. **Alerts:** Agents push critical updates (e.g., "Aqar found a deal", "Server load high") to the channel.
  2. **Commands:** Admin sends commands (e.g., `/deploy sofra`, `/status`, `/mute mawid`).
  3. **Intervention:** Human-in-the-loop override for D-RAG decisions.

### Implementation Plan

- **Token:** BotFather API Token.
- **Webhook:** Cloudflare Worker (`src/infra/agents/telegram-webhook.ts`).
- **Permissions:** Admin Only (Whitelist ID).

---

## 2. 🤖 The Final Fleet (15 Agents)

| ID | Agent | Focus | Status | Superpower (Tool) |
|----|-------|-------|--------|-------------------|
| 01 | **Sofra** | F&B | ✅ Tier 1 | `DealRadar` (Scraper) |
| 02 | **Mawid** | Appointment | ✅ Tier 1 | `CalendarAudit` (.ics Parser) |
| 03 | **Aqar** | Real Estate | ✅ Tier 1 | `MarketScanner` (RAG Lite) |
| 04 | **Tajer** | E-Commerce | ✅ Tier 1 | `ProductSniper` (Price Comp) |
| 05 | **Hissab** | Social Media | 🆕 Tier 2 | `TrendSurfer` (Hashtag Analysis) |
| 06 | **Analyst** | Data | 🆕 Tier 2 | `FinSight` (QLV Analysis) |
| 07 | **Recruiter**| HR | 🆕 Tier 2 | `TalentScout` (LinkedIn Parser) |
| 08 | **Support** | CX | 🆕 Tier 2 | `AutoResponder` (24/7 Chat) |
| 09 | **Writer** | Content | 🆕 Tier 2 | `ViralHook` (Copy Gen) |
| 10 | **Accountant**| FinOps | 🆕 Tier 2 | `ExpenseTracker` (OCR) |
| 11 | **Strategist**| Planning | 🆕 Tier 2 | `BizModeler` (Canvas Gen) |
| 12 | **Health** | Wellness | 🆕 Tier 2 | `BioHacker` (Diet Plan) |
| 13 | **Edu** | Education | 🆕 Tier 2 | `CurriculumBuilder` (Course Gen) |
| 14 | **Travel** | Tourism | 🆕 Tier 2 | `TripPlanner` (Itinerary Gen) |
| 15 | **Legal** | Compliance | 🆕 Tier 2 | `ContractGuard` (Clause Check) |

---

## 3. ⚡ Superpower Registry (The Toolbox)

*Extracted from Legacy Research*

1. **The "Zero-Cost" Scraper:** Browser-based fetcher for Sofra/Tajer.
2. **The "IDE Proxy":** Using local dev tools for heavy batch processing (Analyst).
3. **The "Viral Hook":** GPT-4o template for Writer.
4. **The "BioHacker":** USDA Database connector for Health.

---
*Maintained by Axiom Control Fabric*
