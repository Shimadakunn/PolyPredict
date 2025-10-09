import { Strategy } from "../strategy";
import { getLog } from "./getLogs";

export function isSafe(this: Strategy) {
  // Is Safe Price
  if (this.bestAsk! > 1 - this.safePrice || this.bestBid! < this.safePrice) {
    getLog.call(this, "Price out of safe range: " + this.midPrice, "error");
    return false;
  }

  // Is Safe Time
  const now = new Date();
  if (
    now.getMinutes() >= 60 - this.safeTime ||
    now.getMinutes() <= this.safeTime
  ) {
    getLog.call(
      this,
      "Outside safe time range (+/- " + this.safeTime + " mins)",
      "error"
    );

    return false;
  }

  // Is Not Max Position
  if (
    this.position! >= this.maxPosition ||
    this.position! <= -this.maxPosition
  ) {
    getLog.call(this, "At max position: " + this.position, "error");
    return false;
  }

  return true;
}
