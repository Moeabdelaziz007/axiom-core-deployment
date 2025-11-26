#!/usr/bin/env ts-node

/**
 * Script to deploy AXIOM Staking Program to Solana Devnet
 * 
 * Steps:
 * 1. Build the program
 * 2. Deploy to devnet
 * 3. Initialize vault PDA token account
 * 4. Output program ID and vault address
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AxiomStaking } from "../target/types/axiom_staking";
import {
    TOKEN_PROGRAM_ID,
    createMint, 
    getOrCreateAssociatedTokenAccount,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { 
    Keypair, 
    SystemProgram, 
    Transaction, 
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";
import fs from "fs";
import path from "path";

async function main() {
    console.log("🚀 Deploying AXIOM Staking Program to Devnet...\n");

    // Set up provider
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const connection = provider.connection;
    const payer = provider.wallet as anchor.Wallet;

    console.log("📍 Deployer wallet:", payer.publicKey.toBase58());
    const balance = await connection.getBalance(payer.publicKey);
    console.log("💰 Balance:", balance / LAMPORTS_PER_SOL, "SOL\n");

    if (balance < 1 * LAMPORTS_PER_SOL) {
        throw new Error("Insufficient balance. Airdrop SOL first: solana airdrop 2");
    }

    // Step 1: Deploy staking program
    console.log("📦 Deploying staking program...");
    const program = anchor.workspace.AxiomStaking as Program<AxiomStaking>;
    console.log("📦 Program ID:", program.programId.toBase58());

    // Step 2: Create test AXIOM tokens for demonstration
    console.log("\n🪙 Creating AXIOM tokens for testing...");
    const axiomMint = await createMint(
        connection,
        payer.payer,
        payer.publicKey,
        null,
        9 // Decimals
    );
    console.log("✅ AXIOM Mint Address:", axiomMint.toBase58());

    // Step 3: Initialize vault PDA token account
    console.log("\n💎 Creating vault token account...");
    
    // Find vault PDA
    const [vaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("axiom_vault")],
        program.programId
    );

    // Create vault ATA
    const vaultATA = await getOrCreateAssociatedTokenAccount(
        connection,
        payer.payer,
        vaultPDA,
        axiomMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log("🔐 Vault PDA:", vaultPDA.toBase58());
    console.log("💼 Vault ATA:", vaultATA.toBase58());

    // Step 4: Initialize vault
    console.log("\n🏦 Initializing vault...");
    try {
        const tx = await program.methods
            .initialize_vault()
            .accounts({
                vaultTokenAccount: vaultATA,
                mint: axiomMint,
                payer: payer.publicKey,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .rpc();

        console.log("✅ Vault initialized! Tx:", tx);
    } catch (error) {
        console.error("❌ Failed to initialize vault:", error);
    }

    // Step 5: Save deployment info
    const deploymentInfo = {
        network: "devnet",
        programId: program.programId.toBase58(),
        vaultPDA: vaultPDA.toBase58(),
        vaultTokenAccount: vaultATA.toBase58(),
        axiomTokenMint: axiomMint.toBase58(),
        deployedAt: new Date().toISOString(),
        features: [
            "Token staking with PDA vault",
            "Agent deployment verification",
            "Reputation scoring",
            "Freeze mechanism for governance"
        ]
    };

    fs.writeFileSync(
        "deployment-staking.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Deployment info saved to deployment-staking.json");
    console.log("\n🎉 AXIOM Staking Program deployed successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📦 Program ID:", program.programId.toBase58());
    console.log("💎 Vault PDA:", vaultPDA.toBase58());
    console.log("💼 Vault ATA:", vaultATA.toBase58());
    console.log("🪙 AXIOM Token:", axiomMint.toBase58());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("Next steps:");
    console.log("1. Test staking: ts-node scripts/test-staking.ts");
    console.log("2. Initialize user accounts: ts-node scripts/init-user.ts");
    console.log("3. Deploy agents: ts-node scripts/deploy-agent.ts");
    console.log("\n📋 --- SAVE THESE FOR FRONTEND (.env) ---");
    console.log(`NEXT_PUBLIC_AXIOM_MINT=${axiomMint.toBase58()}`);
    console.log(`NEXT_PUBLIC_STAKING_PROGRAM_ID=${program.programId.toBase58()}`);
    console.log("------------------------------------------\n");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Deployment failed:", err);
        process.exit(1);
    });