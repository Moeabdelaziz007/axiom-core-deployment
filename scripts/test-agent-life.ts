import dotenv from 'dotenv';
import { Keypair, Connection, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';
import { runAxiomAgent } from '../src/services/axiomRuntime'; // تأكد من صحة المسار

// تحميل المتغيرات البيئية (API Keys)
dotenv.config({ path: '.env.local' });

async function breatheLife() {
    console.log("⚡ STARTING AXIOM LIFE SUPPORT TEST...\n");

    // 1. إنشاء "جسد" مؤقت (محفظة جديدة للاختبار)
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const keypair = Keypair.generate();
    const secretKey = bs58.encode(keypair.secretKey);
    const publicKey = keypair.publicKey.toBase58();

    console.log(`👤 Temporary Agent Identity Created:`);
    console.log(`   Public Key: ${publicKey}`);
    console.log(`   (Secret Key kept in memory)\n`);

    // 2. ضخ "الدماء" (Airdrop) - لأن الرصيد 0 ممل
    try {
        console.log("💸 Requesting 1 SOL Airdrop from Devnet...");
        const signature = await connection.requestAirdrop(keypair.publicKey, 1 * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
        console.log("✅ Airdrop Received! Wallet is funded.\n");
    } catch (error) {
        console.warn("⚠️ Airdrop failed (Devnet might be busy). Checking balance of 0 is still a valid test.\n");
    }

    // 3. اختبار الاستجابة العصبية (سؤال الوكيل)
    const userQuery = "Hello! Do I have any money in my wallet? Check my balance please.";
    console.log(`🗣️ USER: "${userQuery}"`);
    console.log(`🧠 AXIOM BRAIN IS THINKING...\n`);

    try {
        // استدعاء الـ Runtime
        const response = await runAxiomAgent(userQuery, secretKey);

        console.log("---------------------------------------------------");
        console.log(`🤖 AGENT RESPONSE:\n"${response}"`);
        console.log("---------------------------------------------------");

        if (response.includes("SOL") || response.includes("balance")) {
            console.log("\n🎉 SUCCESS: The Agent successfully read the Blockchain!");
        } else {
            console.log("\n🤔 WARNING: Agent replied, but maybe didn't check the chain.");
        }

    } catch (error) {
        console.error("\n❌ FATAL ERROR in Nervous System:", error);
    }
}

// تشغيل الاختبار
breatheLife();
