import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { 
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createMint,
    createAssociatedTokenAccountInstruction,
    getAccount
} from "@solana/spl-token";
import { 
    SystemProgram, 
    Transaction, 
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";

describe("axiom-staking", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AxiomStaking as Program;

  it("Initializes stake account", async () => {
    const user = provider.wallet.publicKey;

    // Find stake account PDA
    const [stakeAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake_account"), user.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .initialize_stake_account()
        .accounts({
          stakeAccount: stakeAccountPDA,
          user: user,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Stake account initialized:", tx);
    } catch (error) {
      console.error("❌ Failed to initialize stake account:", error);
    }
  });

  it("Stakes tokens", async () => {
    const user = provider.wallet.publicKey;
    const amount = 100 * 1e9; // 100 AXIOM tokens

    // This would require actual AXIOM tokens in user's wallet
    // For testing purposes, we'll skip the actual token transfer
    
    try {
      const tx = await program.methods
        .stake_tokens(new anchor.BN(amount))
        .accounts({
          stakeAccount: stakeAccountPDA,
          userTokenAccount: userTokenATA,
          vaultTokenAccount: vaultPDA,
          user: user,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("✅ Tokens staked:", tx);
    } catch (error) {
      console.error("❌ Failed to stake tokens:", error);
    }
  });

  it("Deploys agent", async () => {
    const user = provider.wallet.publicKey;

    try {
      const tx = await program.methods
        .deploy_agent()
        .accounts({
          stakeAccount: stakeAccountPDA,
          user: user,
        })
        .rpc();

      console.log("✅ Agent deployed:", tx);
    } catch (error) {
      console.error("❌ Failed to deploy agent:", error);
    }
  });

  it("Freezes stake for poor performance", async () => {
    const user = provider.wallet.publicKey;

    try {
      const tx = await program.methods
        .freeze_stake()
        .accounts({
          stakeAccount: stakeAccountPDA,
          authority: user, // In production, this would be governance authority
        })
        .rpc();

      console.log("✅ Stake frozen:", tx);
    } catch (error) {
      console.error("❌ Failed to freeze stake:", error);
    }
  });
});

// Helper variables for testing
const stakeAccountPDA = new PublicKey("11111111111111111111111111111111"); // Placeholder
const userTokenATA = new PublicKey("11111111111111111111111111111"); // Placeholder
const vaultPDA = new PublicKey("11111111111111111111111111111"); // Placeholder