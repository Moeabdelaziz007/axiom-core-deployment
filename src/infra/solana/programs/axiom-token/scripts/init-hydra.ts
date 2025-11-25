#!/usr/bin/env ts-node

/**
 * Initialize Metaplex Hydra Fanout Wallet
 * 
 * This script creates a "fanout wallet" that distributes collected fees
 * from $AXIOM token transfers to stakeholders proportionally.
 * 
 * Distribution model:
 * - 40% → Treasury (operations)
 * - 30% → Stakers (token holders)
 * - 20% → Development fund
 * - 10% → Community rewards
 */

import * as anchor from "@coral-xyz/anchor";
import {
    Fanout,
    FanoutClient,
    MembershipModel,
} from "@glasseaters/hydra-sdk";
import { PublicKey } from "@solana/web3.js";
import fs from "fs";

const DEPLOYMENT_INFO_PATH = "deployment-devnet.json";

async function main() {
    console.log("💎 Initializing Metaplex Hydra Fanout...\n");

    // Load deployment info
    if (!fs.existsSync(DEPLOYMENT_INFO_PATH)) {
        throw new Error(`Deployment info not found. Run deploy-token.ts first.`);
    }

    const deploymentInfo = JSON.parse(
        fs.readFileSync(DEPLOYMENT_INFO_PATH, "utf-8")
    );

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const connection = provider.connection;
    const wallet = provider.wallet as anchor.Wallet;

    console.log("📍 Wallet:", wallet.publicKey.toBase58());
    console.log("🪙 Mint:", deploymentInfo.mint);
    console.log("💎 Treasury:", deploymentInfo.treasuryPDA, "\n");

    // Initialize Hydra client
    const fanoutClient = new FanoutClient(connection, wallet);

    // Define stakeholders and their shares
    const stakeholders = [
        {
            name: "Treasury (Operations)",
            address: deploymentInfo.treasuryPDA,
            shares: 40_000, // 40%
        },
        {
            name: "Stakers Pool",
            address: wallet.publicKey.toBase58(), // Placeholder - should be staking program
            shares: 30_000, // 30%
        },
        {
            name: "Development Fund",
            address: wallet.publicKey.toBase58(), // Placeholder
            shares: 20_000, // 20%
        },
        {
            name: "Community Rewards",
            address: wallet.publicKey.toBase58(), // Placeholder
            shares: 10_000, // 10%
        },
    ];

    const totalShares = stakeholders.reduce((sum, s) => sum + s.shares, 0);

    console.log("📊 Distribution Plan:");
    stakeholders.forEach((s) => {
        console.log(`   ${s.name}: ${(s.shares / totalShares) * 100}%`);
    });
    console.log();

    // Create fanout
    console.log("🔨 Creating fanout wallet...");

    const fanoutName = "axiom-treasury-fanout";

    const { fanout } = await fanoutClient.initializeFanout({
        totalShares,
        name: fanoutName,
        membershipModel: MembershipModel.Wallet, // Each wallet gets shares
    });

    console.log("✅ Fanout created:", fanout.toBase58());

    // Add members
    console.log("\n👥 Adding stakeholders...");
    for (const stakeholder of stakeholders) {
        const memberKey = new PublicKey(stakeholder.address);

        await fanoutClient.addMemberWallet({
            fanout,
            fanoutNativeAccount: fanout, // For native SOL distribution
            membershipKey: memberKey,
            shares: stakeholder.shares,
        });

        console.log(`   ✅ ${stakeholder.name}: ${stakeholder.shares} shares`);
    }

    // Save Hydra info
    const hydraInfo = {
        fanout: fanout.toBase58(),
        name: fanoutName,
        totalShares,
        stakeholders: stakeholders.map((s) => ({
            name: s.name,
            address: s.address,
            shares: s.shares,
            percentage: (s.shares / totalShares) * 100,
        })),
        createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(
        "hydra-fanout-devnet.json",
        JSON.stringify(hydraInfo, null, 2)
    );

    console.log("\n📄 Hydra info saved to hydra-fanout-devnet.json");
    console.log("\n🎉 Metaplex Hydra Fanout initialized!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💎 Fanout Wallet:", fanout.toBase58());
    console.log("📊 Total Shares:", totalShares.toLocaleString());
    console.log("👥 Stakeholders:", stakeholders.length);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("Next step:");
    console.log("→ Configure treasury to forward fees to fanout wallet");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Hydra initialization failed:", err);
        process.exit(1);
    });
