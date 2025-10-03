import WebSocket from "ws";
import { websocket } from "../src/utils/url";
import { clobClient } from "../src/utils/client";

const ws = new WebSocket(websocket + "/ws/user");

class User {
  // Settings
  private ws: WebSocket;
  private asset: string;
  private yesBalance: number;
  private noBalance: number;

  constructor(asset: string) {
    this.ws = ws;
    this.asset = asset;
    this.yesBalance = 0;
    this.noBalance = 0;

    this.ws.on("open", () => this.onOpen());
  }

  private async onOpen() {
    const apiKey = await clobClient.deriveApiKey();
    this.ws.send(
      JSON.stringify({
        markets: [this.asset],
        type: "user",
        auth: apiKey,
      })
    );
  }
}
