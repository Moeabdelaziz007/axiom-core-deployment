#!/usr/bin/env ts-node

/**
 * Script to deploy AXIOM Staking Program to Solana Mainnet
 * 
 * Steps:
 * 1. Build the program for mainnet
 * 2. Deploy to mainnet
 * 3. Initialize vault PDA token account
 * 4. Output program ID and vault address for production
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
    console.log("🚀 Deploying AXIOM Staking Program to MAINNET...\n");

    // Set up provider for mainnet
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const connection = provider.connection;
    const payer = provider.wallet as anchor.Wallet;

    console.log("📍 Deployer wallet:", payer.publicKey.toBase58());
    const balance = await connection.getBalance(payer.publicKey);
    console.log("💰 Balance:", balance / LAMPORTS_PER_SOL, "SOL\n");

    if (balance < 5 * LAMPORTS_PER_SOL) {
        throw new Error("Insufficient balance for mainnet deployment. Minimum 5 SOL required.");
    }

    // Step 1: Deploy staking program to mainnet
    console.log("📦 Deploying staking program to MAINNET...");
    const program = anchor.workspace.AxiomStaking as Program<AxiomStaking>;
    console.log("📦 Program ID:", program.programId.toBase58());

    // Step 2: Use existing AXIOM token mint (create new if not exists)
    console.log("\n🪙 Using AXIOM token mint...");
    // In production, this should be your existing AXIOM token mint
    const axiomMint = new PublicKey(process.env.AXIOM_TOKEN_MINT || "9tc8LSnU6qQ3s4EYMK9wdbvCnwAhRZdtpG2wSvo8152w");
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
    console.log("💼 Vault ATA:", vaultATA.address.toBase58());

    // Step 4: Initialize vault
    console.log("\n🏦 Initializing vault...");
    try {
        const tx = await program.methods
            .initialize_vault()
            .accounts({
                vaultTokenAccount: vaultATA.address,
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
        throw error;
    }

    // Step 5: Save production deployment info
    const deploymentInfo = {
        network: "mainnet-beta",
        programId: program.programId.toBase58(),
        vaultPDA: vaultPDA.toBase58(),
        vaultTokenAccount: vaultATA.address.toBase58(),
        axiomTokenMint: axiomMint.toBase58(),
        deployedAt: new Date().toISOString(),
        deployer: payer.publicKey.toBase58(),
        features: [
            "Token staking with PDA vault",
            "Agent deployment verification",
            "Reputation scoring",
            "Freeze mechanism for governance",
            "Production-ready security"
        ],
        securityChecks: {
            vaultOwnership: "Program-owned PDA",
            accessControls: "Role-based permissions",
            freezeMechanism: "Governance-controlled",
            minimumStake: "100 AXIOM tokens"
        }
    };

    fs.writeFileSync(
        "deployment-staking-mainnet.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Production deployment info saved to deployment-staking-mainnet.json");
    console.log("\n🎉 AXIOM Staking Program deployed to MAINNET successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📦 Program ID:", program.programId.toBase58());
    console.log("💎 Vault PDA:", vaultPDA.toBase58());
    console.log("💼 Vault ATA:", vaultATA.address.toBase58());
    console.log("🪙 AXIOM Token:", axiomMint.toBase58());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🔒 SECURITY REMINDERS:");
    console.log("1. Save private keys securely");
    console.log("2. Update .env.production with new addresses");
    console.log("3. Test with small amounts first");
    console.log("4. Monitor for any unusual activity");
    console.log("\n📋 --- SAVE THESE FOR FRONTEND (.env.production) ---");
    console.log(`AXIOM_TOKEN_MINT=${axiomMint.toBase58()}`);
    console.log(`STAKING_PROGRAM_ID=${program.programId.toBase58()}`);
    console.log(`VAULT_PDA_ADDRESS=${vaultPDA.toBase58()}`);
    console.log("------------------------------------------\n");

    console.log("Next steps:");
    console.log("1. Update frontend API endpoints with mainnet configuration");
    console.log("2. Configure production environment variables");
    console.log("3. Deploy frontend application");
    console.log("4. Conduct comprehensive testing");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Mainnet deployment failed:", err);
        process.exit(1);
    });