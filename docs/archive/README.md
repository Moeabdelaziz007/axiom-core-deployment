# ⚡ AXIOM ID: The Quantum Command Center

> **"Built by One Human. Powered by Google. Designed for the Future."**

---

### 👨‍💻 The Architect & Visionary

This entire platform—from the Quantum Ether backend to the Holographic UI—was architected, coded, and deployed by **Mohamed H. Abdelaziz**.

By leveraging the immense power of **Google Gemini** and **Cloudflare**, a single developer was able to build what typically requires a team of 20 engineers. This project stands as a testament to the power of AI-augmented engineering.

**Connect with the Architect:**

* 📧 **Email:** [mabdela1@students.kennesaw.edu](mailto:mabdela1@students.kennesaw.edu) | [Amrikyy@gmail.com](mailto:Amrikyy@gmail.com)
* 📱 **Mobile (EG):** +20 109 422 8044
* 📱 **Mobile (US):** +1 770 616 0211

---

### 🛠️ Tech Stack & Credits

* **Core Intelligence:** Google Gemini 1.5 Flash & Pro
* **Infrastructure:** Google Cloud & Cloudflare
* **Architecture:** Mohamed H. Abdelaziz

---

# Axiom ID – Quantum Command Center 🚀

**Axiom ID** is a next‑generation AI‑first platform that lets users create, deploy, and manage autonomous agents (AIX) with a sleek cyber‑punk holographic UI.  It combines:

* **Dynamic Bento‑grid dashboard** with glass‑morphism and animated backgrounds.
* **Voice & Text agent creation** (VoiceFactory, Text fallback).
* **NFT‑minted AIX DNA** and on‑chain marketplace for renting agent squads.
* **Real‑time crypto pricing** via CoinGecko.
* **Google ADK toolbox** (Phase 8) for modular, structured tool integration.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/yourorg/axiom-id.git
cd axiom-id

# Install dependencies (workspace uses pnpm)
pnpm install

# Build & preview the web UI
npm run dev   # runs Next.js dev server (http://localhost:3000)
```

> The UI is fully static‑export ready for Cloudflare Pages. See `DEPLOYMENT_GUIDE.md` for production deployment.

---

## Core Architecture

| Layer | Description |
|------|-------------|
| **Frontend** (`packages/web-ui`) | Next.js (static export) + cyber‑punk design system. |
| **Agent Factory** (`packages/workers/agent-factory`) | Nano‑Banana architecture; spawns agents, validates AIX DNA, integrates Gemini. |
| **Tool Executor** (`packages/workers/tool-executor`) | Executes structured **Toolbox** calls (ADK‑style). |
| **Blockchain** (`packages/programs/*`) | Solana on‑chain NFT minting & marketplace contracts. |
| **Cloud Services** | Cloudflare Workers, Cloudflare Pages, Google Cloud (ADK, Gemini). |

---

## Features

* **Agent Creation Wizard** – Identity → Toolbox → Constitution → Mint.
* **Toolbox Standardization** – `AixSchema.ts` defines `AixToolFunction` & `AixToolboxEntry`; `ToolRegistry.ts` lists built‑in tools (Binance, Google Search, …).
* **Voice Factory** – Speech‑to‑text with fallback to manual input.
* **Squad Mode** – Rent a group of agents that coordinate via the Quantum Synchronizer.
* **Helios Talent Agent** – Real‑time recommendation chat powered by Gemini.
* **Holographic UI** – Animated grid, glass cards, neon gradients.

---

## Development & Contribution

1. **Run lint & tests**

   ```bash
   npm run lint
   npm test
   ```

2. **Add a new tool**
   * Extend `AixToolFunction` in `packages/core/src/schema/AixSchema.ts`.
   * Register it in `packages/workers/tool-executor/src/ToolRegistry.ts`.
   * Update `ToolboxStep.tsx` – it now reads the registry automatically.
3. **Submit PRs** – Follow the conventional commits style; CI will run the full build and deployment checklist.

---

## Deployment

See `DEPLOYMENT_GUIDE.md` for step‑by‑step Cloudflare Pages + Workers deployment. The project is configured for static export (`output: 'export'`).

---

## License

MIT © 2025 Axiom ID Team

---

*For any questions, open an issue or join the Discord community linked from the website.*
