import { Strategy } from "../strategy";
import { getOrders } from "./getOrders";

export async function cancelOrders(this: Strategy) {
  try {
    const response = await this.client!.cancelAll();
    console.log("Cancel Orders:", response);
    await getOrders.call(this);
  } catch (error) {
    console.error("Failed to cancel orders:", error);
  }
}
