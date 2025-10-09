import { Strategy } from "../strategy";
import { Side, OrderType } from "@polymarket/clob-client";
import { getLog } from "../utils";

export async function setOrder(this: Strategy, side: Side, price: number) {
  try {
    // Check if order with same side and price already exists
    const orderExists = this.orders.some(
      (order) => order.side === side && order.price === price
    );
    if (orderExists) {
      getLog.call(
        this,
        "Order already exists at this price and side. Skipping.",
        "error"
      );
      return;
    }

    const minutes = 2 * 60000;
    const expiration = parseInt(
      ((new Date().getTime() + minutes + 60000) / 1000).toString()
    );

    const order = await this.client!.createOrder({
      tokenID: this.asset!,
      price: price,
      side: side,
      size: this.minSize,
      feeRateBps: 0,
      expiration: expiration,
    });
    console.log("Order created");

    const resp = await this.client!.postOrder(order, OrderType.GTD);

    console.log("Order response:", resp);

    // Check for various error formats
    if (resp.error) throw new Error(resp.error);
    if (resp.success !== true) throw new Error("Order failed");

    getLog.call(
      this,
      `Placed ${side} order: ${this.minSize} @ ${price}`,
      "info"
    );
  } catch (error: any) {
    const errorMsg = error?.response?.data?.error || error?.message || error;
    getLog.call(
      this,
      `Failed to place order ${side} @ ${price} : ${errorMsg}`,
      "error"
    );
  }
}
