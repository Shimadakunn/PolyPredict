//npm install @polymarket/clob-client
//npm install ethers
//Client initialization example and dumping API Keys
import { ClobClient, type ApiKeyCreds } from "@polymarket/clob-client";
import { Wallet } from "@ethersproject/wallet";
import { clob } from "./url";

const funder = "0x4a3D01a1c8b19B88bAaa5114b013f865df7A6A3a";
const signer = new Wallet(process.env.PRIVATE_KEY!); //This is your Private Key. If using email login export from https://reveal.magic.link/polymarket otherwise export from your Web3 Application

// Initialize the clob client
// NOTE: the signer must be approved on the CTFExchange contract
export const creds = new ClobClient(clob, 137, signer).createOrDeriveApiKey();
export const clobClient = new ClobClient(
  clob,
  137,
  signer,
  await creds,
  1,
  funder
);
