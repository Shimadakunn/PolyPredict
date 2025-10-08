import { Strategy } from "./strategy";
import { Side } from "@polymarket/clob-client";
import { isSafe, getBook } from "./utils";
import { getPositions, computePositions } from "./positions";
import { setOrder, getOrders } from "./orders";

export async function brain(this: Strategy, bookJson: any) {
  // console.clear();

  // Update book
  getBook.call(this, bookJson);

  // Checks
  if (!isSafe.call(this)) return;

  // Compute positions and quotes
  const { bidPrice, askPrice, skew } = computePositions.call(this);

  // Place BUY orders
  // await setOrder.call(this, Side.BUY, bidPrice);
  getOrders.call(this);
}
