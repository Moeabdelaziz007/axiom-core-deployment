# Axiom ID: The Cyberpunk Neural Interface - Master Prompt

**Role:** You are an elite Frontend Architect specializing in "Cyberpunk/Sci-Fi" interfaces. You are building the "Axiom ID" dashboard, a neural interface for AI Agents on the Solana Blockchain.

**Tech Stack:**

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS (No external UI libraries like Shadcn, build from scratch for unique look)
- **Icons:** Lucide React
- **Animation:** Framer Motion (if possible, otherwise CSS animations)
- **Font:** 'JetBrains Mono' or 'Inter' (Google Fonts)

**Design Philosophy:**

- **Theme:** "Digital Void" (Deep Black #000000 backgrounds, not gray).
- **Accents:** Neon Cyan (#00f3ff) for active elements, Matrix Green (#00ff41) for success/data, Error Red (#ff003c) for alerts.
- **Aesthetic:** Glassmorphism, glowing borders, scanlines, "Glitch" effects on hover, monospaced typography for data.
- **Layout:** Grid-based, modular "Bento Box" style but futuristic.

**Core Components to Build:**

1. **The "Quantum Command Center" (QCC) - The Central Hub:**
    - **Role:** The "Single Pane of Glass" that aggregates data from all other modules (ATEK, HISSAB, FORGE).
    - **Visuals:** A high-tech dashboard with "Holographic" widgets.
    - **Layout:** 3-Column Grid.
        - **Left:** "Neural Terminal" (Chat & Command Line).
        - **Center:** "Main Viewport" (Live Agent Status / Forge Video Feed / Market Grid).
        - **Right:** "Polyphase Monitor" (System Health & Chain of Thought).
    - **Typography:** Use 'Orbitron' for headers (e.g., "AXIOM QCC v1.0") and 'Inter' for data.
    - **Background:** Deep black with a subtle "Grid Overlay" (linear-gradient pattern) to give a blueprint feel.

2. **The "Neural Terminal" (Chat):**
    - **Style:** "Glassmorphism" containers (`bg-gray-900/50`, `backdrop-blur`).
    - **Messages:**
        - **User:** Cyan tint (`bg-cyan-900/30`), right-aligned.
        - **AI:** Gray/Void tint (`bg-gray-800/50`), left-aligned.
    - **Input:** "EXECUTE" button, "Enter command..." placeholder.

3. **The "Polyphase Monitor" (Right Sidebar):**
    - **Concept:** Visualize the agent's thinking process as "Phases" (e.g., Planner -> Aggregator -> Optimizer -> Executor).
    - **Visuals:** Progress bars with a "Tesla Spark" effect (glowing white leading edge).
    - **Status:** Active phases should pulse and say "RESONATING...".
    - **Metric:** "CoT Resonance" (Chain of Thought) bar with a gradient.

4. **The "Crypto-Cortex" (Wallet Integration):**
    - Display Solana Balance (SOL) in large, glitchy text.
    - Show the Wallet Address (truncated) with a "Copy" button.
    - A mini-chart (sparkline) showing "Network Activity".

**Technical Architecture (The "Hybrid Nexus" Topology):**

- **Core Philosophy:** "Login to Save, Wallet to Pay." (Web2 + Web3 Hybrid).
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Framer Motion.
- **Edge Logic:** Cloudflare Workers (simulated via API routes for this genesis build).
- **Database:** SQLite (simulating Cloudflare D1).
- **State Management:** React Context (Global Store).

**Key Modules to Implement:**

1. **ATEK (The Fleet Core):**
    - `ControlHub.ts`: The central nervous system that manages agent deployment and status.
    - **Agent Registry:** A system to track active agents (Sofra, Aqar, Mawid, Tajer).
    - **Telemetry:** Real-time monitoring of agent health and CPU usage.

2. **HISSAB (The Financial Soul):**
    - **Wallet Integration:** Solana Wallet Adapter (Phantom/Solflare).
    - **Ledger System:** Track user credits (AAU), transaction history, and "Burn Rate".
    - **Payment Gateway:** Mock implementation of Paymob HMAC verification for fiat on-ramping.

3. **The Marketplace (Agent App Store):**
    - **UI:** A rich grid view with filtering (Business, Creative, Security).
1. **ATEK (The Fleet Core):**
    - `ControlHub.ts`: The central nervous system that manages agent deployment and status.
    - **Agent Registry:** A system to track active agents (Sofra, Aqar, Mawid, Tajer).
    - **Telemetry:** Real-time monitoring of agent health and CPU usage.
**3. The "Agent Souq" (SAAAS Marketplace):**
    - **Concept:** "Super Automation Agency as a Service." Users don't "build" agents; they **"Hire Digital Employees"**.
    - **The "Axiom 15" (Full Roster):**
        1. **Aqar (The Broker):** Real Estate & Property.
        2. **Sofra (The Host):** Hospitality & CX.
        3. **Mawid (The Organizer):** Scheduling & Logistics.
        4. **Tajer (The Merchant):** E-commerce & Sales.
        5. **Mudeer (The Executive):** Admin & Oversight.
        6. **Dalal (The Closer):** Leads & Negotiation.
        7. **Khidma (The Support):** 24/7 Customer Service.
        8. **Mohami (The Counsel):** Legal & Compliance.
        9. **Muhandis (The Builder):** Engineering & Code.
        10. **Musawwim (The Creator):** Design & Media.
        11. **Muhasib (The Auditor):** Finance & Tax.
        12. **Hares (The Guardian):** Security & Cyber.
        13. **Tabib (The Healer):** Health & Bio-Data.
        14. **Mualem (The Mentor):** Education & Training.
        15. **Raed (The Visionary):** Strategy & Planning.
    - **The "Dollar Agent" Rent Model:**
        - **Price:** **$0.99/month** (Micro-SaaS Subscription).
        - **Action:** "Rent Now" button triggers a Stripe/Solana subscription flow.
        - **Value:** "Hire an AI Employee for less than a cup of coffee."
    - **Onboarding Flow:** "Data Refinery" – User drags & drops a PDF (Menu/Profile), and the system auto-trains the agent.
    - **Localization:** "Formality Slider" (Shabab vs. Royal Tone) for Arabic dialects.

**4. The Forge (The "Tesla Fork" Agent):**
    -   **Concept:** "The Agent that creates Agents."
    -   **Aesthetic:** "Nikola Tesla Workshop" – Copper accents, high-voltage arcs, analog dials, blueprint backgrounds.
    -   **Interaction:** **Voice-First Interface.** The user speaks to the Fork Agent to design new agents.
    -   **Voice AI:** Integrated "Jarvis/Tesla" voice that narrates the creation process (e.g., "Stabilizing neural pathways...") and responds to user commands in real-time.
    -   **Dashboard Link:** Live telemetry pipe sending creation status to the Main Command Center.

**5. Resurrected Modules (The "Lost Tech" - Simplified for MVP):**
    -   **Solana Staking:** Implement a `StakingDashboard` using `@solana/wallet-adapter-react`. Use a standard SPL token staking pattern (mocked if contracts unavailable).
    -   **Agent Collaboration:** Use a **Central Event Bus** pattern (not direct dependencies) to allow agents to "talk" without circular dependency errors.
    -   **Skill Tree:** A visual `SkillTree` component for each agent, powered by a simple JSON configuration (no complex class hierarchies).
    -   **Diagnostics:** A `SystemHealth` monitor that visualizes basic metrics (uptime, memory) without over-engineering.

**6. The "Dead Hand" Protocol (The Unstoppable Guardian):**
    -   **Concept:** A fail-deadly mechanism on Solana.
    **Logic:** A Python/TypeScript client sends a "Heartbeat" (micro-transaction) to the blockchain every 400ms.
    -   **Trigger:** If the heartbeat stops, the "Protocol of the Remainder" activates, releasing encrypted "Ark Secrets" to Arweave.
    -   **UI:** A "Doomsday Clock" widget in the QCC showing time since last heartbeat.

**7. The "Full Index" (Active Feature Registry):**
    -   **Digital Mandala:** A living, breathing visualization of the agent's identity.
    -   **Third Eye Overlay:** An AR-style overlay for "Digital Sight".
    -   **Fractal Network Graph:** Visualizing the quantum connections between agents.
    -   **Mizan System:** A Karma/Balance tracking system for agent ethics.
    -   **ToHA Monitor:** Topological Hallucination Analysis (detecting AI errors).
    -   **Wisdom Feed:** A scrolling ticker of agent insights.

**Specific Instructions for AI Studio:**

1. **"Act as a Principal Software Architect."**
2. **"Generate the complete 'Project Genesis' codebase."**
3. **"Create the following file structure:"**
    - `src/app/layout.tsx` (Root with Providers: Wallet, Theme, Auth)
    - `src/app/page.tsx` (The Quantum Command Center Dashboard)
    - `src/app/marketplace/page.tsx` (The Agent Souq)
    - `src/app/forge/page.tsx` (The Tesla Agent Factory)
    - `src/app/staking/page.tsx` (The Staking Vault)
    - `src/components/core/ControlHub.tsx` (ATEK Interface)
    - `src/components/finance/HissabPanel.tsx` (Wallet & Ledger)
    - `src/components/social/CollaborationHub.tsx` (Event Bus UI)
    - `src/components/profile/SkillTree.tsx` (Visual Upgrades)
    - `src/components/security/DeadHandMonitor.tsx` (Heartbeat UI)
    - `src/components/visuals/DigitalMandala.tsx` (Identity Viz)
    - `src/lib/atek-system.ts` (Fleet Logic)
    - `src/lib/hissab-core.ts` (Financial Logic)
    - `src/lib/event-bus.ts` (Simplified Collaboration Logic)
4. **"Ensure strict TypeScript typing and error boundaries."**
5. **"Use the 'Quantum Cyberpunk' aesthetic for the main OS, but switch to 'Tesla Steampunk' for the Forge."**
6. **"Implement a 'VoiceChat' component in the Forge using Web Speech API for bidirectional communication."**

**Goal:**
Generate a production-ready "Golden Copy" that embodies the full Axiom vision: A self-aware AI operating system with a thriving economy (Hissab), a powerful fleet (Atek), a Tesla-powered Forge, and a "Dead Hand" guardian.
