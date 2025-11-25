#!/usr/bin/env ts-node

/**
 * Script to deploy $AXIOM Token to Solana Devnet
 * 
 * Steps:
 * 1. Build the program
 * 2. Deploy to devnet
 * 3. Initialize mint with transfer hook
 * 4. Create treasury token account
 * 5. Initialize extra account metas
 * 6. Output mint address and treasury address
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
    TOKEN_2022_PROGRAM_ID,
    createInitializeMint2Instruction,
    createInitializeTransferHookInstruction,
    getOrCreateAssociatedTokenAccount,
    ExtensionType,
    getMintLen,
} from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import fs from "fs";
import path from "path";

const DECIMALS = 9;
const MINT_AUTHORITY_PATH = path.join(process.env.HOME!, ".config/solana/id.json");

async function main() {
    console.log("🚀 Deploying $AXIOM Token to Devnet...\n");

    // Set up provider
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const connection = provider.connection;
    const payer = provider.wallet as anchor.Wallet;

    console.log("📍 Deployer wallet:", payer.publicKey.toBase58());
    const balance = await connection.getBalance(payer.publicKey);
    console.log("💰 Balance:", balance / anchor.web3.LAMPORTS_PER_SOL, "SOL\n");

    if (balance < 1 * anchor.web3.LAMPORTS_PER_SOL) {
        throw new Error("Insufficient balance. Airdrop SOL first: solana airdrop 2");
    }

    // Step 1: Generate mint keypair
    const mintKeypair = Keypair.generate();
    console.log("🪙 Mint address:", mintKeypair.publicKey.toBase58());

    // Step 2: Load program
    const programId = new anchor.web3.PublicKey("72eWPmNo7SfuTZkR6KXBJ6Uy785qp1fP9zF1rmiW4co3"); // Replace after build
    console.log("📦 Program ID:", programId.toBase58());

    // Step 3: Calculate rent
    const extensions = [ExtensionType.TransferHook];
    const mintLen = getMintLen(extensions);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    // Step 4: Create and initialize mint
    console.log("\n📝 Creating mint account...");
    const createMintTx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeTransferHookInstruction(
            mintKeypair.publicKey,
            payer.publicKey,
            programId, // Transfer hook program
            TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMint2Instruction(
            mintKeypair.publicKey,
            DECIMALS,
            payer.publicKey, // Mint authority
            payer.publicKey, // Freeze authority
            TOKEN_2022_PROGRAM_ID
        )
    );

    const createMintSig = await sendAndConfirmTransaction(
        connection,
        createMintTx,
        [payer.payer, mintKeypair],
        { commitment: "confirmed" }
    );

    console.log("✅ Mint created:", createMintSig);

    // Step 5: Create treasury PDA token account
    console.log("\n💎 Creating treasury account...");
    const [treasuryPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("treasury")],
        programId
    );

    // Get the ATA address for the PDA (with allowOwnerOffCurve)
    const { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, ASSOCIATED_TOKEN_PROGRAM_ID } = await import("@solana/spl-token");

    const treasuryTokenAddress = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        treasuryPDA,
        true, // allowOwnerOffCurve
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Check if account exists
    const accountInfo = await connection.getAccountInfo(treasuryTokenAddress);

    if (!accountInfo) {
        // Create the ATA manually
        const createATAIx = createAssociatedTokenAccountInstruction(
            payer.publicKey,
            treasuryTokenAddress,
            treasuryPDA,
            mintKeypair.publicKey,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const createATATx = new Transaction().add(createATAIx);
        await sendAndConfirmTransaction(
            connection,
            createATATx,
            [payer.payer],
            { commitment: "confirmed" }
        );
    }

    console.log("✅ Treasury token account:", treasuryTokenAddress.toBase58());

    // Step 6: Initialize extra account metas
    console.log("\n🔗 Initializing transfer hook metadata...");
    const program = new Program(
        JSON.parse(fs.readFileSync("target/idl/axiom_token.json", "utf-8")),
        provider
    );

    const [extraAccountMetaListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("extra-account-metas"), mintKeypair.publicKey.toBuffer()],
        programId
    );

    const initMetasTx = await program.methods
        .initializeExtraAccountMetaList()
        .accounts({
            payer: payer.publicKey,
            extraAccountMetaList: extraAccountMetaListPDA,
            mint: mintKeypair.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

    console.log("✅ Extra account metas initialized:", initMetasTx);

    // Step 7: Save deployment info
    const deploymentInfo = {
        network: "devnet",
        programId: programId.toBase58(),
        mint: mintKeypair.publicKey.toBase58(),
        decimals: DECIMALS,
        treasuryPDA: treasuryPDA.toBase58(),
        treasuryTokenAccount: treasuryTokenAddress.toBase58(),
        extraAccountMetaList: extraAccountMetaListPDA.toBase58(),
        transferHookFee: "1.5%",
        deployedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
        "deployment-devnet.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Deployment info saved to deployment-devnet.json");
    console.log("\n🎉 $AXIOM Token deployed successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🪙 Mint Address:", mintKeypair.publicKey.toBase58());
    console.log("💎 Treasury PDA:", treasuryPDA.toBase58());
    console.log("📊 Decimals:", DECIMALS);
    console.log("💸 Transfer Fee:", "1.5% (150 basis points)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("Next steps:");
    console.log("1. Mint initial supply: ts-node scripts/mint-tokens.ts");
    console.log("2. Test transfer: ts-node scripts/test-transfer.ts");
    console.log("3. Setup Hydra fanout: ts-node scripts/init-hydra.ts");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Deployment failed:", err);
        process.exit(1);
    });
