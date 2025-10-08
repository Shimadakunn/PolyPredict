import { formatInTimeZone } from "date-fns-tz";
import { Strategy } from "../strategy";

const green = "\x1b[32m";
const magenta = "\x1b[35m";
const blue = "\x1b[34m";
const reset = "\x1b[0m";

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
  //   const ordersTitle = magenta + "===== ORDERS =====" + reset;
  const ordersTitle = magenta + `===== ORDERS ${this.logLine}` + reset;

  const bookTitle = green + "===== BOOK =====" + reset;
  const positionsTitle = blue + "===== POSITIONS =====" + reset;
  const titleLine = formatLogLine(bookTitle, ordersTitle, positionsTitle);

  // Infos
  const ordersMessage = `Orders: ${this.orders.length}`;
  const bookMessage = `Bid: ${this.bestBid} | Ask: ${this.bestAsk} | Mid: ${this.midPrice} | Spread: ${this.spread}`;
  const positionsMessage = `Positions: ${this.positions.length} | Net: ${this.position}`;
  const infoLine = formatLogLine(ordersMessage, bookMessage, positionsMessage);

  // Clear previous logs
  process.stdout.write("\x1b[" + this.logLine + "A"); // Move cursor up by logLine
  process.stdout.write(`\r${titleLine}\n`); // Return to start of line and print titleLine
  process.stdout.write(`\r${infoLine}\n`); // Return to start of line and print infoLine
  process.stdout.write("\x1b[" + this.logLine + "B"); // Move cursor down by logLine
}

export function getLog(this: Strategy, message: string) {
  // Print new log
  getStatus.call(this);
  console.log(message);

  this.logLine += 1; // Increment logLine for each new log
}

function writeLog() {
  const time = formatInTimeZone(
    new Date(),
    "America/New_York",
    "MMMM-d-haa"
  ).toLowerCase();
}
