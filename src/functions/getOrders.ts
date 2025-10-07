import { Strategy } from "../strategy";
import { Side, OrderType } from "@polymarket/clob-client";

export async function getOrders(this: Strategy) {
  try {
    this.orders = await this.client!.getOpenOrders({
      asset_id: this.asset,
    });
  } catch (error) {
    console.error("Failed getOrders:", error);
  }
}
