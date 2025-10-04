import { Strategy } from "./strategy";
import { Side, OrderType } from "@polymarket/clob-client";
import { getClobClient } from "./utils/client";

export function updateBook(this: Strategy, bookJson: any) {
  if (bookJson.asset_id !== this.asset) return;
  this.book = {
    asks: bookJson.asks.map((ask: any) => [ask.price, ask.size]),
    bids: bookJson.bids.map((bid: any) => [bid.price, bid.size]),
    timestamp: bookJson.timestamp,
  };
  console.log("Book updated");
  placeBuyOrder.call(this);
}

export async function placeBuyOrder(this: Strategy) {
  console.log("Placing Buy Order", this.orderPlaced);
  if (this.orderPlaced) return;

  try {
    const clobClient = await getClobClient();
    const minutes = 2 * 60000;
    // const expiration = parseInt(
    //   ((new Date().getTime() + minutes - 60000) / 1000).toString()
    // );
    const expiration = parseInt(
      ((new Date().getTime() + minutes) / 1000).toString()
    );

    const order = await clobClient.createOrder({
      tokenID: this.asset,
      price: 0.2,
      side: Side.BUY,
      size: 1,
      feeRateBps: 0,
      nonce: 1,
      // There is a 1 minute of security threshold for the expiration field.
      // If we need the order to expire in 30 seconds the correct expiration value is:
      // now + 1 miute + 30 seconds
      expiration: expiration,
    });
    console.log("Created Order", order);

    // Send it to the server

    // GTD Order
    const resp = await clobClient.postOrder(order, OrderType.GTD);
    console.log(resp);

    // const order = await clobClient.createAndPostOrder(
    //   {
    //     tokenID: this.asset,
    //     price: 0.2,
    //     side: Side.BUY,
    //     size: 1,
    //     feeRateBps: 0,
    //     expiration: expiration,
    //   },
    //   { tickSize: "0.01", negRisk: false }, //You'll need to adjust these based on the market. Get the tickSize and negRisk T/F from the get-markets above
    //   OrderType.GTD
    // );
    // console.log("Order Placed", order);

    this.orderPlaced = true;
  } catch (error) {
    console.error("Failed to place order:", error);
  }
}

export function placeSellOrder() {
  // Logic to place a sell order
}
