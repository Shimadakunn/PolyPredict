import { Strategy } from "../strategy";
import { Side, OrderType } from "@polymarket/clob-client";
import { getOrders } from "./getOrders";

export async function setOrder(this: Strategy) {
  try {
    const minutes = 1 * 60000;
    const expiration = parseInt(
      ((new Date().getTime() + minutes + 60000) / 1000).toString()
    );
    const order = await this.client!.createOrder({
      tokenID: this.asset,
      price: 0.1,
      side: Side.BUY,
      size: 5,
      feeRateBps: 0,
      expiration: expiration,
    });
    const resp = await this.client!.postOrder(order, OrderType.GTD);
    console.log("setOrder response:", resp);
    if (resp.errorMessage)
      throw new Error(`Order failed: ${resp.errorMessage}`);
    this.orderPlaced = true;
    getOrders.call(this);
    console.log("setOrder order:", order);
  } catch (error) {
    console.error("Failed setOrder:", error);
  }
}
