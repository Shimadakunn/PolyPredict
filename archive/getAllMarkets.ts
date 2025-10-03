import { gamma } from "./url";
import type { EventAPIResponse, Market } from "./type";

async function getEvents(): Promise<EventAPIResponse[]> {
  const events: EventAPIResponse[] = [];
  let offset = 0;
  const limit = 100;

  try {
    while (true) {
      const response = await fetch(
        `${gamma}/events?order=id&ascending=false&closed=false&limit=${limit}&offset=${offset}`
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const batch: EventAPIResponse[] =
        (await response.json()) as EventAPIResponse[];

      if (batch.length === 0) break;

      events.push(...batch);
      offset += limit;

      console.log(`Fetched ${events.length} events so far...`);
    }

    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

function getMarkets(events: EventAPIResponse[]): Market[] {
  const markets: Market[] = [];

  for (const event of events) {
    for (const apiMarket of event.markets) {
      if (apiMarket.closed) continue;
      if (!apiMarket.active) continue;

      const startDate = new Date(apiMarket.startDate);
      const endDate = new Date(apiMarket.endDate);

      markets.push({
        id: apiMarket.id,
        question: apiMarket.question,
        startDate,
        endDate,
        volume: parseFloat(apiMarket.volume) || 0,
        liquidity: parseFloat(apiMarket.liquidity) || 0,
        eventId: event.id,
        eventTitle: event.title,
      });
    }
  }

  return markets;
}

function escapeCSV(field: string | undefined | null): string {
  const str = field?.toString() || "";
  if (str.includes('"') || str.includes(",") || str.includes("\n"))
    return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function marketsToCSV(markets: Market[]): string {
  const headers = [
    "ID",
    "Question",
    "Start Date",
    "End Date",
    "Volume",
    "Liquidity",
    "Event ID",
    "Event Title",
  ];
  const csvRows = [headers.join(",")];

  markets.forEach((market) => {
    const endDateStr =
      market.endDate && !isNaN(market.endDate.getTime())
        ? market.endDate.toISOString()
        : "";

    const row = [
      escapeCSV(market.id),
      escapeCSV(market.question),
      escapeCSV(market.startDate.toISOString()),
      escapeCSV(endDateStr),
      market.volume.toString(),
      market.liquidity.toString(),
      escapeCSV(market.eventId || ""),
      escapeCSV(market.eventTitle || ""),
    ];
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
}

async function getAllMarkets() {
  console.log("Fetching all markets...\n");

  const events = await getEvents();
  console.log(`\nEvents: ${events.length}`);

  const markets = getMarkets(events);
  console.log(`Markets: ${markets.length}\n`);

  const csv = marketsToCSV(markets);
  const filename = "markets.csv";

  await Bun.write(filename, csv);

  console.log(`Markets saved to ${filename}`);
}

getAllMarkets();
