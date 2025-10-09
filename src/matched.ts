import type { Strategy } from "./strategy";
import { Side } from "@polymarket/clob-client";
import { getPositions, computePositions } from "./positions";
import { setOrder, getOrders } from "./orders";
import { getStatus } from "./utils";

export async function matched(this: Strategy, tradeJson: any) {
  // Only Update Positions when a SELL trade is matched
  if (tradeJson.status !== "MATCHED") {
    await getPositions.call(this);
    getStatus.call(this);
    return;
  }

  const { bidPrice, askPrice, skew } = computePositions.call(this);

  // Place orders
  await setOrder.call(this, Side.SELL, askPrice);
  getOrders.call(this);
}
