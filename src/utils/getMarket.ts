import { time } from "./dates";

const gamma = "https://gamma-api.polymarket.com";

export async function getMarket(): Promise<any> {
  const slug = `bitcoin-up-or-down-${time}-et`;

  const response = await fetch(`${gamma}/markets/slug/${slug}`);
  const market = await response.json();
  return market;
}
