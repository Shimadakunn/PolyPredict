import { Strategy } from "../strategy";
import { timestamp, day, hour } from "./dates";
import * as fs from "fs";
import * as path from "path";
import { Colors } from "./colors";

function formatLogLine(left: string, center: string, right: string) {
  const terminalWidth = process.stdout.columns || 80;
  const sectionWidth = Math.floor(terminalWidth / 3);

  const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, "");

  // Left aligned
  const leftVisual = stripAnsi(left);
  const leftPadding = Math.max(0, sectionWidth - leftVisual.length);
  const leftPart = left + " ".repeat(leftPadding);

  // Center aligned
  const centerVisual = stripAnsi(center);
  const centerPadding = Math.max(0, sectionWidth - centerVisual.length);
  const leftCenterPad = Math.floor(centerPadding / 2);
  const rightCenterPad = centerPadding - leftCenterPad;
  const centerPart =
    " ".repeat(leftCenterPad) + center + " ".repeat(rightCenterPad);

  // Right aligned
  const rightVisual = stripAnsi(right);
  const rightPadding = Math.max(0, sectionWidth - rightVisual.length);
  const rightPart = " ".repeat(rightPadding) + right;

  return leftPart + centerPart + rightPart;
}

export function getStatus(this: Strategy) {
  // Titles
  const ordersTitle = Colors.magenta + "===== ORDERS =====" + Colors.reset;
  const bookTitle = Colors.yellow + "===== BOOK =====" + Colors.reset;
  const positionsTitle = Colors.cyan + "===== POSITIONS =====" + Colors.reset;
  const titleLine = formatLogLine(bookTitle, ordersTitle, positionsTitle);

  // Infos
  const ordersMessage = `Orders: ${this.orders.length}`;
  const bookMessage = `Bid: ${this.bestBid} | Ask: ${this.bestAsk} | Mid: ${this.midPrice} | Spread: ${this.spread}`;
  const positionsMessage = `Positions: ${this.positions.length} | Net: ${this.position}`;
  const infoLine = formatLogLine(ordersMessage, bookMessage, positionsMessage);

  console.log(titleLine);
  console.log(infoLine);
}

export function getLog(
  this: Strategy,
  message: string,
  level: "info" | "error" | "success" = "info"
) {
  const logDir = path.resolve(__dirname, "../../log", day);
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, `${hour}.log`);

  let color: string;
  if (level === "info") color = Colors.cyan;
  else if (level === "error") color = Colors.red;
  else color = Colors.green;

  // Format the log entry
  const logEntry = `${timestamp} ${level.toUpperCase()} ${message}`;
  const consoleEntry = `${color}${message}${Colors.reset}`;

  // Write in console
  console.log(consoleEntry + "\n");
  // Write in log file
  getStatusInLog.call(this, logPath);
  fs.appendFileSync(logPath, `\n${logEntry} \n`);
  fs.appendFileSync(logPath, "\n" + "-".repeat(75) + "\n\n");
}

function getStatusInLog(this: Strategy, logPath: string) {
  const positionTitle = `${timestamp} POSITIONS: ${this.positions.length} | NET: ${this.position}`;
  const positionsDetails = this.positions
    .map(
      (pos) =>
        `  - Side: ${pos.side} | Price: ${pos.price} | Size: ${
          pos.size
        } | Time: ${new Date(pos.time).toISOString()}`
    )
    .join("\n");

  const ordersTitle = `${timestamp} ORDERS: ${this.orders.length}`;
  const ordersDetails = [...this.orders]
    .sort((a, b) => {
      if (a.side !== b.side) return a.side === "BUY" ? -1 : 1;
      if (a.side === "BUY") return b.price - a.price; // Higher buy prices first
      return a.price - b.price; // Lower sell prices first
    })
    .map(
      (order) =>
        `  - Side: ${order.side} | Price: ${order.price} | Size: ${
          order.size
        } | Time: ${new Date(order.time).toISOString()}`
    )
    .join("\n");

  const bookTitle = `${timestamp} BOOK | BB: ${this.bestBid} | BA: ${this.bestAsk} | M: ${this.midPrice} | SPR: ${this.spread}`;

  const logContent = [
    bookTitle,
    positionTitle,
    positionsDetails,
    ordersTitle,
    ordersDetails,
  ].filter((s) => s !== "");

  fs.appendFileSync(logPath, logContent.join("\n"));
}
