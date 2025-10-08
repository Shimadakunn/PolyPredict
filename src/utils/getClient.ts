import { ClobClient } from "@polymarket/clob-client";
import { Wallet } from "@ethersproject/wallet";

const clob = "https://clob.polymarket.com";
export const funder = "0x6c778108c3e556e522019ED0c001192c6c72F99D";
const signer = new Wallet(process.env.PRIVATE_KEY!);

// Initialize the clob client with lazy initialization
let _clobClient: ClobClient | null = null;

export async function getClient(): Promise<ClobClient> {
  if (_clobClient) return _clobClient;

  const creds = new ClobClient(clob, 137, signer).createOrDeriveApiKey();

  _clobClient = new ClobClient(clob, 137, signer, await creds, 1, funder);
  return _clobClient;
}
