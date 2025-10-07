import WebSocket from "ws";
import { websocket } from "./utils/url";
import { getClient } from "./utils/client";
import { updateBook } from "./functions";
import { ClobClient } from "@polymarket/clob-client";
import { getOrders } from "./functions/getOrders";

const userWS = new WebSocket(websocket + "/ws/user");
const marketWS = new WebSocket(websocket + "/ws/market");

interface Book {
  asks: [price: string, size: string][];
  bids: [price: string, size: string][];
  timestamp: string;
}

export class Strategy {
  public asset: string;
  public client: ClobClient | null = null;
  public book: Book | null;
  public orders: any[] = [];
  public orderPlaced: boolean = false;
  // === Market Variables ===
  public marketWS: WebSocket;
  // === User Variables ===
  public userWS: WebSocket;

  constructor(asset: string) {
    this.asset = asset;
    this.book = null;
    // === Market WS ===
    this.marketWS = marketWS;
    this.marketWS.on("open", () => this.onMarketWsOpen());
    this.marketWS.on("message", (message: any) =>
      this.onMarketMessage(message)
    );
    // === User WS ===
    this.userWS = userWS;
    this.userWS.on("open", () => this.onUserWsOpen());
    this.userWS.on("message", (message: any) => this.onUserMessage(message));
  }

  async init() {
    console.log("Initializing Strategy for asset:", this.asset);
    this.client = await getClient();
    console.log("Client initialized", this.client ? "Success" : "Failed");

    // await getOrders.call(this);
    // console.log("Initial Orders:", this.orders);
    return this;
  }

  // === Market Handlers ===
  private onMarketWsOpen() {
    this.marketWS.send(
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
    console.log("Auth:", await this.client!.deriveApiKey());
    this.userWS.send(
      JSON.stringify({
        markets: [this.asset],
        type: "user",
        auth: await this.client!.deriveApiKey(),
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
