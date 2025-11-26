#!/usr/bin/env ts-node

import * as anchor from "@coral-xyz/anchor";
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";

async function main() {
  console.log("🚀 Starting Axiom Staking Deployment...");

  // 1. Setup Provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  // 2. Get program with type assertion
  const program = anchor.workspace.AxiomStaking as any;
  const wallet = provider.wallet as anchor.Wallet;

  console.log("📍 Deployer wallet:", wallet.publicKey.toString());
  const balance = await provider.connection.getBalance(wallet.publicKey);
  console.log("💰 Balance:", balance / 1e9, "SOL");

  if (balance < 1 * 1e9) {
    throw new Error("Insufficient balance. Need at least 1 SOL for deployment.");
  }

  // 3. Create AXIOM Token Mint
  console.log("\n🪙 Creating AXIOM Token Mint...");
  try {
    const axiomMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      9 
    );
    console.log("✅ AXIOM Mint Address:", axiomMint.toString());

    // 4. Derive Vault PDA
    const [vaultPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("axiom_vault")],
      program.programId
    );
    console.log("🏦 Vault PDA derived:", vaultPda.toString());

    // 5. Create vault token account
    console.log("\n💎 Creating vault token account...");
    const vaultATA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      vaultPda,
      axiomMint,
      wallet.payer,
      false
    );
    console.log("💼 Vault ATA:", vaultATA.address.toString());

    // 6. Initialize vault with program
    console.log("\n🏦 Initializing vault...");
    const tx = await (program as any).methods
      .initialize_vault()
      .accounts({
        vault_token_account: vaultATA.address,
        mint: axiomMint,
        payer: wallet.publicKey,
        system_program: anchor.web3.SystemProgram.programId,
        token_program: anchor.utils.token.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
      
    console.log("✅ Vault initialized! Transaction:", tx);
    console.log("🔍 View on Solana Explorer:");
    console.log(`https://solscan.io/tx/${tx}`);

    // 7. Save deployment info
    const deploymentInfo = {
      network: "devnet",
      programId: program.programId.toString(),
      vaultPDA: vaultPda.toString(),
      vaultTokenAccount: vaultATA.address.toString(),
      axiomTokenMint: axiomMint.toString(),
      deployedAt: new Date().toISOString(),
      deployer: wallet.publicKey.toString(),
      features: [
        "Token staking with PDA vault",
        "Agent deployment verification", 
        "Reputation scoring",
        "Freeze mechanism for governance"
      ]
    };

    // Write to file
    const fs = require('fs');
    fs.writeFileSync(
      "deployment-staking-devnet.json",
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Deployment info saved to deployment-staking-devnet.json");
    console.log("\n🎉 AXIOM Staking Program deployed successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📦 Program ID:", program.programId.toString());
    console.log("💎 Vault PDA:", vaultPda.toString());
    console.log("💼 Vault ATA:", vaultATA.address.toString());
    console.log("🪙 AXIOM Token:", axiomMint.toString());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("\n📋 --- SAVE THESE FOR FRONTEND (.env) ---");
    console.log(`AXIOM_TOKEN_MINT=${axiomMint.toString()}`);
    console.log(`STAKING_PROGRAM_ID=${program.programId.toString()}`);
    console.log(`VAULT_PDA_ADDRESS=${vaultPda.toString()}`);
    console.log("------------------------------------------\n");

  } catch (error) {
    console.error("❌ Deployment Error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Unexpected error:", err);
    process.exit(-1);
  });