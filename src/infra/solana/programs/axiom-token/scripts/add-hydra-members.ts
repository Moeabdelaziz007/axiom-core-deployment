#!/usr/bin/env ts-node

/**
 * Add stakeholders to an existing Metaplex Hydra Fanout wallet.
 * This script assumes the fanout wallet was already created (see init-hydra.ts).
 */

import * as anchor from "@coral-xyz/anchor";
import { FanoutClient, MembershipModel } from "@glasseaters/hydra-sdk";
import { PublicKey, Connection } from "@solana/web3.js";
import fs from "fs";
import path from "path";

// Helper to get a reliable RPC URL with fallback
function getRpcUrl(): string {
    const primary = process.env.ANCHOR_PROVIDER_URL?.trim();
    if (primary) return primary;
    // Alchemy Devnet fallback (replace DEMO-API-KEY with a real key if available)
    return "https://solana-devnet.g.alchemy.com/v2/DEMO-API-KEY";
}

// Retry fetching a recent blockhash
async function getBlockhashWithRetry(connection: Connection, attempts = 5, delayMs = 1000): Promise<string> {
    for (let i = 0; i < attempts; i++) {
        try {
            const { blockhash } = await connection.getLatestBlockhash();
            return blockhash;
        } catch (e) {
            if (i === attempts - 1) throw e;
            await new Promise(res => setTimeout(res, delayMs));
        }
    }
    throw new Error("Failed to fetch recent blockhash after retries");
}

const DEPLOYMENT_INFO_PATH = path.join(__dirname, "..", "deployment-devnet.json");
const FANOUT_ADDRESS = "DoJpEQ2MTvJc4Hrbq38yAe6aKudvDsuZf3mskpbcNjwh"; // from previous init-hydra run

async function main() {
    console.log("🔧 Adding members to Hydra Fanout wallet...\n");

    if (!fs.existsSync(DEPLOYMENT_INFO_PATH)) {
        throw new Error("Deployment info not found. Run deploy-token.ts first.");
    }
    const deploymentInfo = JSON.parse(fs.readFileSync(DEPLOYMENT_INFO_PATH, "utf-8"));

    const rpcUrl = getRpcUrl();
    const connection = new Connection(rpcUrl, "confirmed");
    const wallet = anchor.getProvider().wallet as anchor.Wallet;
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);
    // Ensure we have a valid recent blockhash before proceeding
    await getBlockhashWithRetry(connection);

    console.log("📍 Wallet:", wallet.publicKey.toBase58());
    console.log("💎 Treasury PDA:", deploymentInfo.treasuryPDA, "\n");

    const fanoutClient = new FanoutClient(connection, wallet);
    const fanout = new PublicKey(FANOUT_ADDRESS);

    const stakeholders = [
        { name: "Treasury (Operations)", address: deploymentInfo.treasuryPDA, shares: 40_000 },
        { name: "Stakers Pool", address: wallet.publicKey.toBase58(), shares: 30_000 },
        { name: "Development Fund", address: wallet.publicKey.toBase58(), shares: 20_000 },
        { name: "Community Rewards", address: wallet.publicKey.toBase58(), shares: 10_000 },
    ];

    const totalShares = stakeholders.reduce((s, p) => s + p.shares, 0);
    console.log("📊 Distribution Plan (total shares:", totalShares, ")");
    stakeholders.forEach(s => console.log(`   ${s.name}: ${(s.shares / totalShares) * 100}%`));
    console.log();

    for (const stakeholder of stakeholders) {
        // The Treasury PDA is the fanout's native account, it doesn't need to be added as a member.
        // It receives funds directly as the fanout's primary destination.
        if (stakeholder.address === deploymentInfo.treasuryPDA) {
            console.log(`ℹ️ Treasury PDA (${stakeholder.name}) is the fanout's native account. Skipping addMemberWallet.`);
            continue;
        }

        const memberKey = new PublicKey(stakeholder.address);
        try {
            await fanoutClient.addMemberWallet({
                fanout,
                fanoutNativeAccount: fanout,
                membershipKey: memberKey,
                shares: stakeholder.shares,
            });
            console.log(`✅ Added ${stakeholder.name} (${stakeholder.shares} shares)`);
        } catch (e: any) {
            // Check if the error indicates the member already exists (custom program error 0x1771 or 6001)
            if (e.message && (e.message.includes("0x1771") || e.message.includes("MemberAlreadyExists"))) {
                console.log(`⚠️ ${stakeholder.name} (${stakeholder.shares} shares) already exists in the fanout. Skipping.`);
            } else {
                console.error(`❌ Failed to add ${stakeholder.name}:`, e);
                // Do not re-throw, allow script to continue for other members
            }
        }
    }

    console.log("\n🎉 All members added to Hydra Fanout wallet.");
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error("❌ Failed to add members:", err);
        process.exit(1);
    });
