import {Strategy} from "./strategy";
import {getMarket} from "./utils/getMarket";

async function main (){
    const market = await getMarket();
    console.log("Market:", market);
    const clobTokenIds: string[] = JSON.parse(market.clobTokenIds);
    new Strategy(clobTokenIds[0]!);
}

main();