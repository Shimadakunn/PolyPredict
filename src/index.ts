import { Strategy } from "./strategy";
import { getMarket } from "./utils/getMarket";

async function main() {
  const market = await getMarket();
  const clobTokenIds: string[] = JSON.parse(market.clobTokenIds);
  await new Strategy(clobTokenIds[0]!).init();
}

main();
