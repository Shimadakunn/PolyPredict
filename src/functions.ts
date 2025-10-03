import { Strategy } from "./strategy";
import { Side, OrderType } from "@polymarket/clob-client";
import { clobClient } from "./utils/client";

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
  const minutes = 2 * 60000;
  const expiration = parseInt(
    ((new Date().getTime() + minutes - 60000) / 1000).toString()
  );

  const order = await clobClient.createAndPostOrder(
    {
      tokenID: this.asset,
      price: 0.2,
      side: Side.BUY,
      size: 1,
      feeRateBps: 0,
      expiration: expiration,
    },
    { tickSize: "0.01", negRisk: false }, //You'll need to adjust these based on the market. Get the tickSize and negRisk T/F from the get-markets above
    OrderType.GTC
  );
  console.log("Order Placed", order);

  this.orderPlaced = true;
}

export function placeSellOrder() {
  // Logic to place a sell order
}
