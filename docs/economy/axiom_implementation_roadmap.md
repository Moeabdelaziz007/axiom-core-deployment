# 🗺️ Axiom Implementation Roadmap: Dual-Engine Economy

**Target:** MVP Launch before Jan 1, 2026
**Current Date:** Nov 25, 2025
**Duration:** ~5 Weeks (Aggressive Sprint)

---

## 📅 Phase 1: The Foundation (Week 1: Nov 25 - Dec 2)

**Focus:** Database, Auth, and Basic "Earn" UI.

- [ ] **Database Schema (Supabase):**
  - Deploy `investment_vaults`, `user_stakes`, `bounties` tables.
  - Set up RLS policies.
- [ ] **Agent School UI (Frontend):**
  - Build `/earn` page.
  - Create "Bounty Card" component.
  - Implement basic "Text Classification" task interface.
- [ ] **AAU Logic (Backend):**
  - Create `agent-school-worker` to handle task submission.
  - Implement `calculate_reward` logic.

**Milestone:** Users can log in, solve a dummy task, and see their AAU balance increase.

---

## 📅 Phase 2: The Simulation (Week 2: Dec 3 - Dec 9)

**Focus:** "Invest" UI and Paper Trading Agents.

- [ ] **Investment UI (Frontend):**
  - Build `/invest` page.
  - Create "Vault Card" component (showing APY, Risk).
  - Implement "Stake AAU" modal.
- [ ] **Staking Logic (Backend):**
  - Implement `stake_aau` and `unstake_aau` endpoints.
  - Update `investment_vaults` TVL in real-time.
- [ ] **Agent Simulation (AI-Fi):**
  - Deploy `Airdrop Hunter` agent in "Simulation Mode" (logs actions but doesn't spend gas).
  - Create a script to update Vault APY based on simulated performance.

**Milestone:** Users can stake AAU in vaults and see simulated APY changes.

---

## 📅 Phase 3: The Agents (Week 3: Dec 10 - Dec 16)

**Focus:** Building the actual AI Trading Bots (Testnet).

- [ ] **Airdrop Hunter (Testnet):**
  - Connect agent to Base Sepolia testnet.
  - Implement Faucet -> Swap sequence.
- [ ] **TWLA Flash Bot (Testnet):**
  - Write `FlashLoanController.sol`.
  - Deploy to Arbitrum Sepolia.
  - Test atomic execution (borrow -> no-op -> repay).
- [ ] **Agent Mentor:**
  - Implement basic "Performance Monitor" cron job.
  - Alert system if agent fails > 3 times.

**Milestone:** Agents are running on testnets and reporting real on-chain data to the dashboard.

---

## 📅 Phase 4: The Economy (Week 4: Dec 17 - Dec 23)

**Focus:** Profit Distribution and Gamification.

- [ ] **Profit Logic:**
  - Implement `distribute_yield` script (calculates user share).
  - Create "Claim Yield" UI (mock USDC for now).
- [ ] **Gamification:**
  - Implement "Leaderboard" page.
  - Add "Badges" for top stakers/teachers.
  - Launch "Agent Battles" (voting interface).

**Milestone:** The full loop is complete: Earn -> Stake -> Claim (Simulated USDC).

---

## 📅 Phase 5: Production & Polish (Week 5: Dec 24 - Dec 31)

**Focus:** Security, Testing, and Launch.

- [ ] **Security Audit:**
  - Internal review of Smart Contracts and RLS.
  - Stress test the "Stake" button (concurrency).
- [ ] **Mainnet Prep:**
  - Fund Treasury wallets.
  - Deploy Contracts to Mainnet (if ready) or keep on Testnet for "Beta".
- [ ] **Marketing Launch:**
  - Release Whitepaper v2.0.
  - Announce "Genesis Teacher Program" (Early adopters get 2x AAU).

**🚀 GOAL:** Live MVP by New Year's Eve 2026.

---

## 🛠️ Resource Allocation

- **Architect (You):** Core Logic, Smart Contracts, AI Strategy.
- **Agent (Me):** Frontend UI, Worker Implementation, Database Management, Testing.

---

**Status:** ACTIVE  
**Next Checkpoint:** Dec 2 (Phase 1 Completion)
