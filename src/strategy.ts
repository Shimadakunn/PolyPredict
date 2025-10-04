import WebSocket from "ws";
import { websocket } from "./utils/url";
import { getClobClient } from "./utils/client";
import { updateBook } from "./functions";

const userWS = new WebSocket(websocket + "/ws/user");
const marketWS = new WebSocket(websocket + "/ws/market");

interface Book {
  asks: [price: string, size: string][];
  bids: [price: string, size: string][];
  timestamp: string;
}

export class Strategy {
  public asset: string;
  // === Market Variables ===
  public marketWS: WebSocket;
  public book: Book | null;
  // === User Variables ===
  public userWS: WebSocket;
  public orderPlaced: boolean = false;

  constructor(asset: string) {
    this.asset = asset;
    // === Market WS ===
    this.marketWS = marketWS;
    this.book = null;
    this.marketWS.on("open", () => this.onMarketWsOpen());
    this.marketWS.on("message", (message: any) =>
      this.onMarketMessage(message)
    );
    // === User WS ===
    this.userWS = userWS;
    // this.userWS.on("open", () => this.onUserWsOpen());
    // this.userWS.on("message", (message: any) => this.onUserMessage(message));
  }

  // === Market Handlers ===
  private onMarketWsOpen() {
    this.marketWS.send(
      JSON.stringify({
        assets_ids: [this.asset],
        type: "market",
      })
    );
  }

  private onMarketMessage(message: string) {
    if (message === "PONG") return;
    const messageJson = JSON.parse(message);
    // console.log("messageJson:", messageJson);
    if (messageJson.event_type === "book") updateBook.call(this, messageJson);
    else console.log("Unhandled message type:", messageJson.event_type);
    // console.log("this .book:", this.book);
  }

  // === User Handlers ===
  private async onUserWsOpen() {
    const auth = await getClobClient();
    console.log("Auth:", auth);
    this.userWS.send(
      JSON.stringify({
        markets: [this.asset],
        type: "user",
        auth: auth.deriveApiKey(),
      })
    );
  }

  private onUserMessage(message: string) {
    if (message === "PONG") return;
    const messageJson = JSON.parse(message);
    console.log("User Message:", messageJson);
  }
}
