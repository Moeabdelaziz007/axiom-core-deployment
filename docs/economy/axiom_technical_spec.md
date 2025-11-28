# ⚙️ Axiom Technical Specification: Dual-Engine Economy

**Version:** 1.0  
**Status:** DRAFT  
**Date:** November 2024

---

## 1. System Architecture Overview

The Axiom Dual-Engine Economy is built on a hybrid architecture combining serverless edge computing, relational databases, and multi-chain blockchain interaction.

### 1.1 High-Level Diagram

```mermaid
graph TD
    User[User / Teacher] -->|Solves Bounty| AgentSchool[Engine 1: Agent School]
    AgentSchool -->|Verifies Work| AAULedger[AAU Ledger (Supabase)]
    
    User -->|Stakes AAU| InvestmentVault[Engine 2: Investment Vaults]
    InvestmentVault -->|Allocates Capital| AI_Agents[AI Trading Agents]
    
    AI_Agents -->|Flash Loan Arb| EVM[EVM Chains (Base, Arb, Opt)]
    AI_Agents -->|Airdrop Farming| Testnets[Testnets (Berachain, Monad)]
    
    EVM -->|Returns Profit| Treasury[Protocol Treasury]
    Treasury -->|Distributes Yield| User
```

---

## 2. Engine 1: Agent School (The Data Mine)

### 2.1 Bounty System (RLHF)

- **Frontend:** Next.js components for task rendering (Text Classification, Sentiment Analysis, Image Bounding Box).
- **Backend:** Cloudflare Worker (`agent-school-worker`).
- **Validation:** Consensus algorithm (3 users must agree) + "Gold Standard" injection (10% of tasks are known answers to test user accuracy).

### 2.2 AAU Ledger (Supabase)

- **Table:** `public.users` (aau_balance, reputation_score)
- **Table:** `public.bounties` (task_data, consensus_result)
- **Logic:**
  - `on_task_complete`: Trigger `calculate_reward(difficulty, user_reputation)`.
  - `reputation_decay`: Cron job runs weekly to decrease inactive users' scores.

---

## 3. Engine 2: AI-Fi Hedge Fund (The Capital Forge)

### 3.1 Investment Vaults (Supabase + Smart Contract Proxy)

- **Database Schema:**
  - `investment_vaults`: Stores vault metadata, APY, TVL.
  - `user_stakes`: Tracks user deposits (AAU) and claimable yield.
- **Staking Logic:**
  - Users "stake" AAU off-chain (in Supabase) initially.
  - This stake grants "virtual shares" in the vault's profit pool.

### 3.2 AI Agent Architecture (The Traders)

#### 3.2.1 Airdrop Hunter Agent

- **Stack:** Python (Web3.py) or TypeScript (Ethers.js) running on Cloudflare Workers (via Durable Objects for state).
- **Strategy:**
  - Monitor `new_contract_deployment` events.
  - Execute interaction sequence: `Faucet -> Swap -> Liquidity -> Vote`.
- **Sybil Resistance:**
  - Randomized timing (Gaussian distribution).
  - Gitcoin Passport integration for wallet health.

#### 3.2.2 TWLA Agent (Flash Loan Arbitrage)

- **Stack:** Rust/Solidity (Smart Contract) + Off-chain Python Solver.
- **Components:**
  - **Flash Loan Controller (Solidity):**
    - `borrow(asset, amount)`
    - `execute_strategy(target, data)`
    - `repay()`
    - `check_profit()`: Revert if profit < 0.
  - **AX-SYN Solver (Python):**
    - Predicts price drift using LSTM models.
    - Identifies JIT liquidity opportunities on Uniswap V3.

#### 3.2.3 DMH Agent (Lending Arbitrage)

- **Strategy:** Loop `Deposit (Aave) -> Borrow (Aave) -> Bridge (Stargate) -> Deposit (Radiant)`.
- **Safety:**
  - `HealthFactorMonitor`: Checks LTV every block.
  - `AutoDeleverage`: Unwinds position if HF < 1.05.

---

## 4. The Bridge: Profit Distribution

### 4.1 Merkle Drop System

To save gas, profits are distributed via Merkle Drops.

1. **Snapshot:** Backend calculates user shares based on staked AAU.
2. **Tree Generation:** Generate Merkle Tree of `(address, amount)`.
3. **Root Publication:** Publish Merkle Root to `Distributor` smart contract.
4. **Claim:** Users provide proof to claim USDC on-chain.

### 4.2 Yield Flow

1. **Harvest:** Agents send profits to `Treasury` wallet.
2. **Split:**
   - 70% -> `Distributor` Contract (for Users).
   - 20% -> `Dev` Wallet.
   - 10% -> `Growth` Wallet.

---

## 5. Security & Risk Management

### 5.1 Flash Loan Atomicity

- **Rule:** All arbitrage trades MUST be atomic.
- **Implementation:** Custom Solidity middleware that wraps every trade. If `end_balance < start_balance`, transaction reverts.

### 5.2 Trusted Execution Environment (TEE)

- Future upgrade: Run agent logic inside SGX enclaves (e.g., Phala Network) to prove code integrity and prevent front-running by the operator.

### 5.3 Emergency Pause

- **Guardian:** Multi-sig wallet (3/5) can pause all trading and staking.
- **Triggers:**
  - Sharp drawdown (>10% in 1 hour).
  - Oracle failure.
  - Bridge hack detection.

---

## 6. Technology Stack Summary

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14, TailwindCSS, Framer Motion |
| **Auth** | Supabase Auth (Wallet + Email) |
| **Database** | Supabase (PostgreSQL) |
| **Edge Compute** | Cloudflare Workers |
| **AI Models** | OpenAI GPT-4o (Reasoning), Llama 3 (Local) |
| **Blockchain** | Solana (User Payments), Base/Arb (DeFi) |
| **Orchestration** | LangGraph |
| **Prompt Eng** | DSPy |

---

**Architect:** Mohamed H Abdelaziz
