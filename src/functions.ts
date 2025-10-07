import { Strategy } from "./strategy";
import { Side, OrderType } from "@polymarket/clob-client";
import { setOrder } from "./functions/setOrder";

export function updateBook(this: Strategy, bookJson: any) {
  if (bookJson.asset_id !== this.asset) return;
  this.book = {
    asks: bookJson.asks.map((ask: any) => [ask.price, ask.size]),
    bids: bookJson.bids.map((bid: any) => [bid.price, bid.size]),
    timestamp: bookJson.timestamp,
  };
  console.log("Book updated");
  console.log("OrderPlaced:", this.orderPlaced);
  if (this.orderPlaced) return;
  setOrder.call(this);
}
