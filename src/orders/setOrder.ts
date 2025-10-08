import { Strategy } from "../strategy";
import { Side, OrderType } from "@polymarket/clob-client";

export async function setOrder(this: Strategy, side: Side, price: number) {
  try {
    // Check if order with same side and price already exists
    const orderExists = this.orders.some(
      (order) => order.side === side && order.price === 0.01
    );
    if (orderExists) {
      console.log("Order already exists at this price and side. Skipping.");
      return;
    }

    const minutes = 2 * 60000;
    const expiration = parseInt(
      ((new Date().getTime() + minutes + 60000) / 1000).toString()
    );

    const order = await this.client!.createOrder({
      tokenID: this.asset!,
      price: 0.1,
      side: side,
      size: this.minSize,
      feeRateBps: 0,
      expiration: expiration,
    });

    const resp = await this.client!.postOrder(order, OrderType.GTD);
    if (resp.errorMessage)
      throw new Error(`Order failed: ${resp.errorMessage}`);
  } catch (error) {
    console.error("Failed setOrder:", error);
  }
}
