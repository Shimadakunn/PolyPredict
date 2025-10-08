import { Strategy } from "../strategy";

/**
 * Calculate total position and detailed positions for a specific asset
 */

export function computePositions(this: Strategy): {
  bidPrice: number;
  askPrice: number;
  skew: number;
} {
  // Calculate inventory skew
  // If long (position > 0), skew prices up (harder to buy, easier to sell)
  // If short (position < 0), skew prices down (easier to buy, harder to sell)
  const skew = this.position! * this.skewFactor;

  // Calculate bid and ask prices with skewing
  const bidPrice =
    Math.round((this.midPrice! - this.halfSpread + skew) * 100) / 100;
  const askPrice =
    Math.round((this.midPrice! + this.halfSpread + skew) * 100) / 100;

  // Log computed positions
  // console.log("\x1b[33m===== COMPUTED POSITIONS =====\x1b[0m");
  // console.log("Bid:", bidPrice, "| Ask:", askPrice, "| Skew:", skew);
  // console.log("");
  return { bidPrice, askPrice, skew };
}
