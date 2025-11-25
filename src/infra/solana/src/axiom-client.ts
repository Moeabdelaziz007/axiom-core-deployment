import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Program, Provider, Idl, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { AXIOM_ID_PROGRAM_ID, SEEDS } from './constants';

// Placeholder IDL - In a real scenario, this would be imported from the JSON file
const AxiomIdIDL: Idl = {
    version: "0.1.0",
    name: "axiom_id",
    instructions: [
        {
            name: "createIdentity",
            discriminator: [0, 0, 0, 0, 0, 0, 0, 0],
            accounts: [
                { name: "identityAccount", isMut: true, isSigner: false },
                { name: "user", isMut: true, isSigner: true },
                { name: "systemProgram", isMut: false, isSigner: false }
            ] as any,
            args: [
                { name: "persona", type: "string" },
                { name: "stakeAmount", type: "u64" }
            ]
        }
    ],
    accounts: [
        {
            name: "IdentityAccount",
            type: {
                kind: "struct",
                fields: [
                    { name: "authority", type: "publicKey" },
                    { name: "persona", type: "string" },
                    { name: "reputation", type: "u64" },
                    { name: "createdAt", type: "i64" },
                    { name: "stakeAmount", type: "u64" },
                    { name: "isSoulBound", type: "bool" }
                ]
            }
        }
    ],
    metadata: {
        address: AXIOM_ID_PROGRAM_ID.toBase58()
    }
} as any;

export class AxiomClient {
    private connection: Connection;
    private provider: AnchorProvider;
    private program: Program;

    constructor(connection: Connection, wallet: any) {
        this.connection = connection;
        this.provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
        });
        this.program = new Program(AxiomIdIDL, this.provider);
    }

    /**
     * Create a new Agent Identity
     * @param persona The persona/name of the agent
     * @param stakeAmount Amount of tokens to stake (in lamports/smallest unit)
     */
    async createIdentity(persona: string, stakeAmount: number): Promise<string> {
        const [identityPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(SEEDS.IDENTITY), this.provider.wallet.publicKey.toBuffer()],
            AXIOM_ID_PROGRAM_ID
        );

        try {
            const tx = await this.program.methods
                .createIdentity(persona, new (require('bn.js'))(stakeAmount))
                .accounts({
                    identityAccount: identityPda,
                    user: this.provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            return tx;
        } catch (error) {
            console.error("Error creating identity:", error);
            throw error;
        }
    }

    /**
     * Get Identity Account Data
     * @param authority The authority public key (wallet address)
     */
    async getIdentity(authority: PublicKey) {
        const [identityPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(SEEDS.IDENTITY), authority.toBuffer()],
            AXIOM_ID_PROGRAM_ID
        );

        try {
            const account = await (this.program as any).account.identityAccount.fetch(identityPda);
            return account;
        } catch (error) {
            console.error("Error fetching identity:", error);
            return null;
        }
    }

    /**
     * Derive the Identity PDA for a given wallet
     */
    getIdentityPda(authority: PublicKey): PublicKey {
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from(SEEDS.IDENTITY), authority.toBuffer()],
            AXIOM_ID_PROGRAM_ID
        );
        return pda;
    }
}
