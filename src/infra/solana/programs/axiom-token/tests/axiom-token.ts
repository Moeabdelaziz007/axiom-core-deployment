import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AxiomToken } from "../target/types/axiom_token";
import {
    TOKEN_2022_PROGRAM_ID,
    createInitializeMint2Instruction,
    createInitializeTransferHookInstruction,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
    getMint,
} from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";

describe("axiom-token", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.AxiomToken as Program<AxiomToken>;
    const payer = provider.wallet as anchor.Wallet;

    const mintKeypair = Keypair.generate();
    const decimals = 9;

    it("Initializes the $AXIOM token with transfer hook", async () => {
        const extensions = [
            // Transfer Hook Extension
            { type: "transferHook", authority: program.programId },
        ];

        const mintLen = getMintLen(extensions);
        const lamports = await getMinimumBalanceForRentExemptMint(provider.connection);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMint2Instruction(
                mintKeypair.publicKey,
                decimals,
                payer.publicKey,
                payer.publicKey,
                TOKEN_2022_PROGRAM_ID
            ),
            createInitializeTransferHookInstruction(
                mintKeypair.publicKey,
                payer.publicKey,
                program.programId,
                TOKEN_2022_PROGRAM_ID
            )
        );

        await sendAndConfirmTransaction(provider.connection, transaction, [payer.payer, mintKeypair]);

        const mint = await getMint(
            provider.connection,
            mintKeypair.publicKey,
            undefined,
            TOKEN_2022_PROGRAM_ID
        );

        console.log("✅ $AXIOM Token mint created:", mintKeypair.publicKey.toBase58());
        console.log("   Decimals:", mint.decimals);
        console.log("   Transfer Hook enabled");
    });

    it("Initializes extra account metas for transfer hook", async () => {
        const [extraAccountMetaListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("extra-account-metas"), mintKeypair.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
            .initializeExtraAccountMetaList()
            .accounts({
                payer: payer.publicKey,
                extraAccountMetaList: extraAccountMetaListPDA,
                mint: mintKeypair.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("✅ Extra account metas initialized");
        console.log("   PDA:", extraAccountMetaListPDA.toBase58());
    });

    it("Tests transfer with 1.5% fee deduction", async () => {
        // TODO: Create token accounts, mint tokens, test transfer
        // Verify that 1.5% fee goes to treasury
        console.log("⚠️  Transfer test pending - need to create token accounts");
    });
});

function getMintLen(extensions: any[]): number {
    let len = MINT_SIZE;
    // Add extension sizes (simplified - actual calculation is more complex)
    extensions.forEach(() => {
        len += 64; // Approximate extension size
    });
    return len;
}
