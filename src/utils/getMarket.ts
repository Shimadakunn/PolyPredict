import { formatInTimeZone } from "date-fns-tz";

const gamma = "https://gamma-api.polymarket.com";

export async function getMarket(): Promise<any> {
  const time = formatInTimeZone(
    new Date(),
    "America/New_York",
    "MMMM-d-haa"
  ).toLowerCase();
  const slug = `bitcoin-up-or-down-${time}-et`;

  const response = await fetch(`${gamma}/markets/slug/${slug}`);
  const market = await response.json();
  return market;
}
