import { Strategy } from "../strategy";
import { getStatus } from "../utils";

export async function getOrders(this: Strategy) {
  try {
    const response = await this.client!.getOpenOrders({
      asset_id: this.asset!,
    });
    this.orders = response.map((order: any) => ({
      id: order.id,
      side: order.side,
      price: parseFloat(order.price),
      size: parseFloat(order.original_size),
      time: order.created_at,
    }));

    // Log
    getStatus.call(this);
  } catch (error) {
    console.error("Failed getOrders:", error);
  }
}
