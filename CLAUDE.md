# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PolyPredict is a Bun-based TypeScript application for real-time market making on Polymarket. It connects to Polymarket's CLOB (Central Limit Order Book) and real-time WebSocket APIs to monitor market data and execute trading strategies.

## Development Commands

```bash
# Install dependencies
bun install

# Run main application (starts WebSocket connections)
bun run start

# Run tests
bun test
```

## Environment Setup

Requires `.env` file with:

- `PRIVATE_KEY`: Ethereum wallet private key for signing Polymarket transactions

## Architecture

### Core Components

1. **Main Entry Point** ([src/index.ts](src/index.ts))

   - Initializes the application by fetching the current hourly Bitcoin price up and down market's YES tokenID
   - Creates Strategy instance initialized with the tokenID

2. **Strategy Class** ([src/strategy.ts](src/strategy.ts))

   - `Strategy` class manages two separate WebSocket connections:
     - **Market WebSocket**: Receives order book updates, price changes, and trade events
     - **User WebSocket**: Authenticated connection for user-specific order updates and positions
   - Both connections share the same asset/token being monitored
   - The variables of the class will manage the active orderblock, the user open orders...

3. **functions** ([src/functions.ts](src/functions.ts))

   - File where will define the main functions of the strategy.
   - Functions will be called in order to modify `Strategy` class variables in function of market order blocks and user placed orders

4. **Market Data Utilities** ([src/utils/](src/utils/))
   - `getMarket.ts`: Fetches market data by constructing time-based slugs (e.g., "bitcoin-up-or-down-october-2-1pm-et")
   - `client.ts`: Initializes Polymarket CLOB client with wallet signer
   - `url.ts`: API endpoints (gamma API, CLOB, WebSocket)

### Data Flow

1. Application starts → Fetches current Bitcoin market via slug-based API call
2. Extracts CLOB token ID from market data
3. Establishes market WebSocket → Subscribes to order book updates
4. Establishes user WebSocket → Authenticates with derived API key
5. Market events flow through strategy handlers
6. Functions will be called update states and execute orders

### Key Design Patterns

- **Shared helpers via `this` context**: `updateBook` in [src/functions.ts](src/functions.ts) uses `.call(this, ...)` to modify Main instance state
- **Time-based market resolution**: Markets identified by formatted timestamps in ET timezone
- **Event-driven architecture**: WebSocket messages route to specific handlers based on `event_type`

## TypeScript Configuration

- Target: ESNext with bundler module resolution
- Strict mode enabled with `noUncheckedIndexedAccess`
- Allows importing `.ts` extensions (Bun-specific)
- No emit (runtime via Bun)
