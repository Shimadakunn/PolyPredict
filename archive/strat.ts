interface Price {
  price: string;
  size: string;
  best_bid: string;
  best_ask: string;
  timestamp: string;
}

interface Book {
  asks: [price: string, size: string][];
  bids: [price: string, size: string][];
  timestamp: string;
}

export class Strategy {
  // Settings
  private token: string;

  // State
  private book: Book | null;
  private price: Price | null;
  private last_trade: any | null;

  // Configuration

  constructor(token: string) {
    this.token = token;
    this.book = null;
    this.price = null;
  }

  public onBookChange(bookJson: any) {
    this.book = getBook(bookJson, this.token);
    console.log("Book Changed", this.book);
    console.log(this.book?.asks.at(-1));
    console.log(this.book?.bids.at(-1));
  }

  public onPriceChange(priceJson: any) {
    this.price = getPrice(priceJson, this.token);
    // console.log("Price Changed", this.price);
  }
  public onTrade(tradeJson: any) {
    this.last_trade = getLastTrade(tradeJson, this.token);
    // console.log("Trade Changed", this.last_trade);
  }
}

function getPrice(priceJson: any, token: string): Price {
  const price_changes = priceJson.price_changes.find(
    (change: any) => change.asset_id === token
  );
  return {
    price: price_changes.price,
    size: price_changes.size,
    best_bid: price_changes.best_bid,
    best_ask: price_changes.best_ask,
    timestamp: priceJson.timestamp,
  };
}

function getBook(bookJson: any, token: string): Book | null {
  if (bookJson.asset_id !== token) return null;
  return {
    asks: bookJson.asks.map((ask: any) => [ask.price, ask.size]),
    bids: bookJson.bids.map((bid: any) => [bid.price, bid.size]),
    timestamp: bookJson.timestamp,
  };
}

function getLastTrade(tradeJson: any, token: string): any | null {
  if (tradeJson.asset_id !== token) return null;
  return {
    price: tradeJson.price,
    size: tradeJson.size,
    side: tradeJson.side,
    timestamp: tradeJson.timestamp,
  };
}
