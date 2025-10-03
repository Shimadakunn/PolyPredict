import { websocket } from "./utils/url";
import WebSocket from "ws";
import { Strategy } from "./strat";

const ws = new WebSocket(websocket + "/ws/market");

export class Socket {
  private ws: WebSocket;
  private asset: string;
  private strategy: Strategy;
  private pingInterval?: NodeJS.Timeout;

  constructor(asset: string) {
    this.ws = ws;
    this.asset = asset;
    this.strategy = new Strategy(asset);

    this.ws.on("open", () => this.onOpen());
    this.ws.on("message", (message: any) => this.onMessage(message));
    this.ws.on("error", (error) => this.onError(error));
    this.ws.on("close", (code, reason) =>
      this.onClose(code, reason.toString())
    );
  }

  private onOpen() {
    this.ws.send(
      JSON.stringify({
        assets_ids: [this.asset],
        type: "market",
      })
    );
  }

  private onMessage(message: string) {
    if (message === "PONG") return;
    const messageJson = JSON.parse(message);
    if (messageJson.event_type === "price_change")
      this.strategy.onPriceChange(messageJson);
    if (messageJson.event_type === "book")
      this.strategy.onBookChange(messageJson);
    if (messageJson.event_type === "last_trade_price")
      this.strategy.onTrade(messageJson);
  }

  private onError(error: Error) {
    console.error("Error:", error);
    process.exit(1);
  }

  private onClose(code: number, reason: string) {
    console.log(`Closing: ${code} ${reason}`);
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    process.exit(0);
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) this.ws.send("PING");
    }, 10000);
  }
}
