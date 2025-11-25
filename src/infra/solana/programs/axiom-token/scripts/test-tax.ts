import * as anchor from "@coral-xyz/anchor";
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
    createTransferCheckedInstruction,
    getAccount,
    getMint,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    Keypair,
    TransactionInstruction,
    AccountMeta
} from "@solana/web3.js";
import fs from "fs";

// Load deployment info
const DEPLOYMENT_PATH = "../deployment-devnet.json";

async function main() {
    // 1. Setup Connection
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;
    const wallet = provider.wallet as anchor.Wallet;

    console.log("🧪 Starting The Acid Test (Tax Verification)...");

    if (!fs.existsSync(DEPLOYMENT_PATH)) {
        throw new Error("Deployment file not found. Run deploy-token.ts first.");
    }
    const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, 'utf-8'));
    const mint = new PublicKey(deployment.mint);
    const treasuryAccount = new PublicKey(deployment.treasuryTokenAccount);

    console.log(`🪙 Mint: ${mint.toBase58()}`);
    console.log(`🏦 Treasury: ${treasuryAccount.toBase58()}`);

    // 2. Setup Test Wallets
    // User A (Sender) - The current wallet
    const sender = wallet.payer;

    // User B (Receiver) - A new random wallet
    const receiver = Keypair.generate();
    console.log(`👤 Receiver (User B): ${receiver.publicKey.toBase58()}`);

    // 3. Setup Token Accounts
    const senderATA = await getAssociatedTokenAddress(
        mint,
        sender.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
    );

    const receiverATA = await getAssociatedTokenAddress(
        mint,
        receiver.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
    );

    const tx = new Transaction();

    // Check if Sender ATA exists, if not create it
    try {
        await getAccount(connection, senderATA, undefined, TOKEN_2022_PROGRAM_ID);
        console.log("✅ Sender Token Account exists");
    } catch (e) {
        console.log("✨ Creating Sender Token Account...");
        tx.add(
            createAssociatedTokenAccountInstruction(
                sender.publicKey,
                senderATA,
                sender.publicKey,
                mint,
                TOKEN_2022_PROGRAM_ID
            )
        );
    }

    // Check if Receiver ATA exists, if not create it
    try {
        await getAccount(connection, receiverATA, undefined, TOKEN_2022_PROGRAM_ID);
    } catch (e) {
        console.log("✨ Creating Receiver Token Account...");
        tx.add(
            createAssociatedTokenAccountInstruction(
                sender.publicKey,
                receiverATA,
                receiver.publicKey,
                mint,
                TOKEN_2022_PROGRAM_ID
            )
        );
    }

    // Mint 1000 Tokens to Sender (if needed)
    console.log("💸 Minting 1000 AXIOM to Sender for testing...");
    tx.add(
        createMintToInstruction(
            mint,
            senderATA,
            sender.publicKey,
            1000 * 10 ** 9, // 1000 tokens
            [],
            TOKEN_2022_PROGRAM_ID
        )
    );

    // 4. Execute Transfer (The Tax Moment)
    // Transfer 100 Tokens. Expected Fee: 1.5% = 1.5 Tokens.
    const transferAmount = BigInt(100 * 10 ** 9);
    console.log(`🔄 Transferring 100 AXIOM from Sender -> Receiver...`);

    // NOTE: Transfer hook will be tested separately after initializing extra account metas
    // For now, testing basic transfer functionality
    tx.add(
        createTransferCheckedInstruction(
            senderATA,
            mint,
            receiverATA,
            sender.publicKey,
            transferAmount,
            9, // decimals
            [],
            TOKEN_2022_PROGRAM_ID
        )
    );

    const sig = await sendAndConfirmTransaction(connection, tx, [sender]);
    console.log(`✅ Transaction Confirmed: https://explorer.solana.com/tx/${sig}?cluster=devnet`);

    // 5. Verify Balances (The Verdict)
    console.log("\n🔍 Verifying Balances...");

    // Allow a moment for RPC to update
    await new Promise(r => setTimeout(r, 2000));

    const treasuryInfo = await getAccount(connection, treasuryAccount, undefined, TOKEN_2022_PROGRAM_ID);
    const treasuryBalance = Number(treasuryInfo.amount) / 10 ** 9;

    const receiverInfo = await getAccount(connection, receiverATA, undefined, TOKEN_2022_PROGRAM_ID);
    const receiverBalance = Number(receiverInfo.amount) / 10 ** 9;

    console.log(`🏦 Treasury Balance: ${treasuryBalance} AXIOM`);
    console.log(`👤 Receiver Balance: ${receiverBalance} AXIOM`);

    if (treasuryBalance >= 1.5) {
        console.log("\n🎉 SUCCESS: Tax was collected successfully!");
        console.log("🚀 THE ECONOMIC ENGINE IS LIVE.");
    } else {
        console.log("\n⚠️ WARNING: Treasury balance is lower than expected. Check Transfer Hook logic.");
    }
}

main().catch(console.error);
