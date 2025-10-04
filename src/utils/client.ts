//npm install @polymarket/clob-client
//npm install ethers
//Client initialization example and dumping API Keys
import { ClobClient, type ApiKeyCreds } from "@polymarket/clob-client";
import { Wallet } from "@ethersproject/wallet";
import { clob } from "./url";

const funder = "0x4a3D01a1c8b19B88bAaa5114b013f865df7A6A3a";
const signer = new Wallet(process.env.PRIVATE_KEY!); //This is your Private Key. If using email login export from https://reveal.magic.link/polymarket otherwise export from your Web3 Application

// Initialize the clob client with lazy initialization
let _clobClient: ClobClient | null = null;
let _clobClientPromise: Promise<ClobClient> | null = null;

async function initClobClient(): Promise<ClobClient> {
  if (_clobClient) return _clobClient;
  if (_clobClientPromise) return _clobClientPromise;

  _clobClientPromise = (async () => {
    try {
      // Create a temporary client to derive API key
      const tempClient = new ClobClient(clob, 137, signer);
      const creds = await tempClient.createOrDeriveApiKey();

      // Create the actual client with credentials
      _clobClient = new ClobClient(clob, 137, signer, creds, 1, funder);
      return _clobClient;
    } catch (error) {
      _clobClientPromise = null; // Reset on error to allow retry
      throw error;
    }
  })();

  return _clobClientPromise;
}

export async function getClobClient(): Promise<ClobClient> {
  return initClobClient();
}
