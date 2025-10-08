import { Strategy } from "../strategy";
import { getStatus } from "./getLogs";

export function getBook(this: Strategy, bookJson: any) {
  if (bookJson.asset_id !== this.asset) return;

  // Update book
  this.book = {
    asks: bookJson.asks.map((ask: any) => ({
      price: ask.price,
      size: ask.size,
    })),
    bids: bookJson.bids.map((bid: any) => ({
      price: bid.price,
      size: bid.size,
    })),
    timestamp: bookJson.timestamp,
  };

  const bestAsk = this.book.asks.at(-1);
  const bestBid = this.book.bids.at(-1);

  this.bestAsk = parseFloat(bestAsk!.price);
  this.bestBid = parseFloat(bestBid!.price);

  this.spread = parseFloat((this.bestAsk - this.bestBid).toFixed(2));
  this.midPrice = parseFloat(((this.bestBid + this.bestAsk) / 2).toFixed(2));

  // Log
  getStatus.call(this);
}
