import { Strategy } from "../strategy";
import { getLog } from "./getLogs";

const red = "\x1b[31m";
const reset = "\x1b[0m";

export function isSafe(this: Strategy) {
  if (true) {
    // getLog.call(this, red + "Testing" + reset);
    return false;
  }
  // Is Safe Price
  if (this.bestAsk! > 1 - this.safePrice || this.bestBid! < this.safePrice) {
    getLog.call(
      this,
      red + "Price out of safe range: " + this.midPrice + reset
    );
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
      red + "Outside safe time range (+/- " + this.safeTime + " mins)" + reset
    );

    return false;
  }

  // Is Not Max Position
  if (
    this.position! >= this.maxPosition ||
    this.position! <= -this.maxPosition
  ) {
    getLog.call(this, red + "At max position: " + this.position + reset);
    return false;
  }

  return true;
}
