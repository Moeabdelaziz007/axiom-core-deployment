const { Keypair } = require("@solana/web3.js");
const fs = require("fs");

const keypairData = JSON.parse(fs.readFileSync("target/deploy/axiom_token-keypair.json", "utf-8"));
const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
console.log("Program ID:", keypair.publicKey.toBase58());
