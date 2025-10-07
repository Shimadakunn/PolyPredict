import WebSocket from "ws";
import { websocket } from "./utils/url";
import { getClient } from "./utils/client";
import { updateBook } from "./functions";
import { ClobClient } from "@polymarket/clob-client";
import { getOrders } from "./functions/getOrders";

interface Book {
  asks: [price: string, size: string][];
  bids: [price: string, size: string][];
  timestamp: string;
}

export class Strategy {
  // === Config ===
  public asset: string;
  public client: ClobClient | null = null;
  // === Market Variables ===
  public marketWS: WebSocket | null = null;
  // === User Variables ===
  public userWS: WebSocket | null = null;
  // === Strategy Variables ===
  public book: Book | null = null;
  public orders: any[] = [];
  public orderPlaced: boolean = false;

  constructor(asset: string) {
    this.asset = asset;
  }

  async init() {
    this.client = await getClient();

    this.marketWS = new WebSocket(websocket + "/ws/market");
    this.marketWS.on("open", () => this.onMarketWsOpen());
    this.marketWS.on("message", (message: any) =>
      this.onMarketMessage(message)
    );

    this.userWS = new WebSocket(websocket + "/ws/user");
    this.userWS.on("open", () => this.onUserWsOpen());
    this.userWS.on("message", (message: any) => this.onUserMessage(message));

    // await getOrders.call(this);
    // console.log("Initial Orders:", this.orders);
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
    console.log("Market WS connected");
  }

  private onMarketMessage(message: string) {
    if (message === "PONG") return;
    const messageJson = JSON.parse(message);
    if (messageJson.event_type === "book") updateBook.call(this, messageJson);
  }

  // === User Handlers ===
  private async onUserWsOpen() {
    console.log("User WS Open");
    const apiKey = await this.client!.deriveApiKey();
    console.log("Auth:", apiKey);
    this.userWS!.send(
      JSON.stringify({
        markets: [this.asset],
        type: "user",
        auth: apiKey,
      })
    );
    console.log("User WS connected");
  }

  private onUserMessage(message: string) {
    if (message === "PONG") return;
    const messageJson = JSON.parse(message);
    console.log("User Message:", messageJson);
  }
}
