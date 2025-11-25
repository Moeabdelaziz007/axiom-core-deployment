#!/usr/bin/env ts-node

/**
 * Script to initialize Extra Account Meta List using raw transaction
 * Bypasses Anchor SDK to avoid IDL issues
 */

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, TransactionInstruction, Transaction, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import fs from "fs";
import * as borsh from "borsh";

import path from "path";
const DEPLOYMENT_PATH = path.join(process.cwd(), "deployment-devnet.json");

// Instruction discriminator for initialize_extra_account_meta_list
// This is calculated as the first 8 bytes of sha256("global:initialize_extra_account_meta_list")
import crypto from "crypto";
const INIT_DISCRIMINATOR = Buffer.from(
    crypto.createHash("sha256")
        .update("global:initialize_extra_account_meta_list")
        .digest()
        .slice(0, 8)
);


async function main() {
    console.log("🔗 Initializing Transfer Hook Extra Account Metas (Direct Call)...\n");

    // Setup provider
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const connection = provider.connection;
    const payer = provider.wallet as anchor.Wallet;

    console.log("📍 Payer wallet:", payer.publicKey.toBase58());

    // Load deployment info
    if (!fs.existsSync(DEPLOYMENT_PATH)) {
        throw new Error("Deployment file not found. Run deploy-token.ts first.");
    }
    const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, 'utf-8'));

    const programId = new PublicKey(deployment.programId);
    const mint = new PublicKey(deployment.mint);

    console.log("🪙 Mint:", mint.toBase58());
    console.log("📦 Program ID:", programId.toBase58());

    // Derive Extra Account Meta List PDA
    const [extraAccountMetaListPDA, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("extra-account-metas"), mint.toBuffer()],
        programId
    );

    console.log("🔑 Extra Account Meta List PDA:", extraAccountMetaListPDA.toBase58());
    console.log("🔑 Bump:", bump);

    // Check if already initialized
    try {
        const accountInfo = await connection.getAccountInfo(extraAccountMetaListPDA);
        if (accountInfo && accountInfo.data.length > 0) {
            console.log("✅ Extra Account Meta List already initialized!");
            console.log("   Account size:", accountInfo.data.length, "bytes");
            console.log("   Owner:", accountInfo.owner.toBase58());
            return;
        }
    } catch (e) {
        // Account doesn't exist, continue with initialization
    }

    // Create instruction manually
    console.log("\n🚀 Creating initialization instruction...");

    const ix = new TransactionInstruction({
        programId,
        keys: [
            { pubkey: payer.publicKey, isSigner: true, isWritable: true },
            { pubkey: extraAccountMetaListPDA, isSigner: false, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: INIT_DISCRIMINATOR, // No additional data needed for this instruction
    });

    const tx = new Transaction().add(ix);

    console.log("📤 Sending transaction...");
    try {
        const sig = await provider.sendAndConfirm(tx, [], { commitment: "confirmed" });
        console.log("✅ Extra Account Metas initialized!");
        console.log("📝 Transaction:", sig);
        console.log("🔗 Explorer:", `https://explorer.solana.com/tx/${sig}?cluster=devnet`);

        // Update deployment info
        deployment.extraAccountMetaList = extraAccountMetaListPDA.toBase58();
        deployment.status = "Fully Deployed - Transfer Hook Active";
        fs.writeFileSync(DEPLOYMENT_PATH, JSON.stringify(deployment, null, 4));

        console.log("\n✅ Deployment info updated!");
        console.log("🎉 Transfer Hook is now ready for testing!");
    } catch (error: any) {
        console.error("❌ Failed to initialize:");
        if (error.logs) {
            console.error("Transaction logs:");
            error.logs.forEach((log: string) => console.error("  ", log));
        }
        throw error;
    }
}

main().catch(console.error);
