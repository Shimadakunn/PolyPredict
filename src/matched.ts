import type { Strategy } from "./strategy";
import { getPositions } from "./positions";
import { computePositions } from "./positions";
import { setOrder } from "./orders";
import { getOrders } from "./orders";
import { Side } from "@polymarket/clob-client";

export async function matched(this: Strategy, tradeJson: any) {
  // Only Update Positions when a SELL trade is matched
  if (
    tradeJson.status !== "MATCHED" ||
    tradeJson.type !== "TRADE" ||
    tradeJson.side !== "BUY"
  ) {
    await getPositions.call(this);
    return;
  }

  const { bidPrice, askPrice, skew } = computePositions.call(this);

  // Place orders
  await setOrder.call(this, Side.SELL, askPrice);
  getOrders.call(this);
}
