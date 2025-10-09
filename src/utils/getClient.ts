import { ClobClient } from "@polymarket/clob-client";
import { Wallet } from "@ethersproject/wallet";

const clob = "https://clob.polymarket.com";
export const funder = "0x6c778108c3e556e522019ED0c001192c6c72F99D";
const signer = new Wallet(process.env.PRIVATE_KEY!);

// Initialize the clob client with lazy initialization
let _clobClient: ClobClient | null = null;
let _creds: any = null;

export async function getClient(): Promise<{ client: ClobClient; creds: any }> {
  if (_clobClient && _creds) return { client: _clobClient, creds: _creds };

  console.log("Creating new ClobClient instance...");
  const tempClient = new ClobClient(clob, 137, signer);

  // Try to derive existing API key first, then create if needed
  try {
    _creds = await tempClient.deriveApiKey();
  } catch (error) {
    _creds = await tempClient.createApiKey();
  }

  _clobClient = new ClobClient(clob, 137, signer, _creds, 1, funder);
  console.log("ClobClient initialized.");
  return { client: _clobClient, creds: _creds };
}
