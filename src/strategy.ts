import WebSocket from "ws";
import { ClobClient } from "@polymarket/clob-client";
import { getClient, getMarket } from "./utils";
import { getOrders } from "./orders";
import { brain } from "./brain";
import { matched } from "./matched";
import { getPositions } from "./positions/getPositions";

const websocket = "wss://ws-subscriptions-clob.polymarket.com";

export class Strategy {
  // === Config ===
  public asset: string | null = null;
  public client: ClobClient | null = null;

  // === Market Variables ===
  public marketWS: WebSocket | null = null;
  public book: { asks: any[]; bids: any[]; timestamp: string } | null = null;
  public spread: number | null = null;
  public bestBid: number | null = null;
  public bestAsk: number | null = null;
  public midPrice: number | null = null;

  // === User Variables ===
  public userWS: WebSocket | null = null;
  public orders: {
    id: string;
    side: string;
    price: number;
    size: number;
    time: number;
  }[] = [];
  public position: number | null = null; // Net position in shares (positive = long, negative = short)
  public positions: any[] = [];

  // === Market Making Config ===
  public readonly safeTime: number = 5; // Minutes to stop before and after hour
  public readonly safePrice: number = 0.05; // 5% - don't trade if price outside this range
  public readonly skewFactor: number = 0.002; // Skew per share of inventory (0.2%)
  public readonly halfSpread: number = 0.01; // 1 tick (1% in probability)
  public readonly minSize: number = 5; // Minimum order size
  public readonly maxPosition: number = 100; // Max inventory in shares

  // === Other Config ===
  public logLine: number = 3; // Number of lines used by logs in terminal (for cursor positioning)

  constructor() {}

  async init() {
    const market = await getMarket();
    const clobTokenIds: string[] = JSON.parse(market.clobTokenIds);
    this.asset = clobTokenIds[0]!;
    this.client = await getClient();

    this.marketWS = new WebSocket(websocket + "/ws/market");
    this.marketWS.on("open", () => this.onMarketWsOpen());
    this.marketWS.on("message", (message: any) =>
      this.onMarketMessage(message)
    );

    this.userWS = new WebSocket(websocket + "/ws/user");
    this.userWS.on("open", () => this.onUserWsOpen());
    this.userWS.on("message", (message: any) => this.onUserMessage(message));

    console.clear();
    await Promise.all([getOrders.call(this), getPositions.call(this)]);
    return this;
  }

  // === Market Handlers ===
  private onMarketWsOpen() {
    this.marketWS!.send(
      JSON.stringify({
        assets_ids: [this.asset],
        type: "market",
      })
    );
  }

  private async onMarketMessage(message: string) {
    if (message === "PONG") return;
    const messageJson = JSON.parse(message);
    // if (messageJson.event_type === "book") await brain.call(this, messageJson);
    await brain.call(this, messageJson);
  }

  // === User Handlers ===
  private async onUserWsOpen() {
    const apiKey = await this.client!.deriveApiKey();
    this.userWS!.send(
      JSON.stringify({
        markets: [this.asset],
        type: "user",
        auth: apiKey,
      })
    );
  }

  private async onUserMessage(message: string) {
    if (message === "PONG") return;
    const messageJson = JSON.parse(message);
    console.log("User Message:", messageJson);
    if (messageJson.event_type === "trade")
      await matched.call(this, messageJson);
  }
}

new Strategy().init();
