import { Strategy } from "../strategy";
import { funder } from "../utils";

export async function getPositions(this: Strategy) {
  try {
    const url = `https://data-api.polymarket.com/positions?user=${funder}&limit=100`;
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch positions: ${response.statusText}`);
    const positions = (await response.json()) as any[];

    // Filter positions for this asset
    const assetPositions = positions.filter((p: any) => p.asset === this.asset);

    // Calculate total position (sum of sizes)
    this.position = assetPositions.reduce(
      (sum: number, p: any) => sum + p.size,
      0
    );

    // Store position details (price and size)
    this.positions = assetPositions.map((p: any) => ({
      price: p.avgPrice,
      size: p.size,
    }));
  } catch (error) {
    console.error("Failed to load positions:", error);
  }
}
