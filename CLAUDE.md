# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**PolyPredict** - Polymarket trading bot/strategy implementation that monitors real-time market data via WebSockets and executes automated trading strategies on Polygon (Chain ID: 137).

## Development Commands

### Core Commands
- `bun install` - Install all dependencies
- `bun run src/index.ts` or `bun start` - Start the trading bot
- `bun test` - Run test suite

### Verification
- **ALWAYS verify TypeScript compilation** with `bun --check src/index.ts` after code changes
- **CRITICAL**: Test WebSocket connections before deploying changes to strategy logic

## Architecture Overview

### Tech Stack
- **Runtime**: Bun (JavaScript runtime, NOT Node.js)
- **Language**: TypeScript with strict mode enabled
- **Blockchain**: Polygon (Chain ID: 137)
- **Main Dependencies**:
  - `@polymarket/clob-client` - CLOB (Central Limit Order Book) client for order management
  - `@polymarket/real-time-data-client` - Real-time market data
  - `ws` - WebSocket client for market/user connections
  - `viem` - Ethereum library for wallet operations
  - `date-fns-tz` - Timezone-aware date formatting

### Key Files
- **@src/index.ts** - Entry point, initializes Strategy with market token ID
- **@src/strategy.ts** - Main Strategy class with WebSocket handlers
- **@src/utils/client.ts** - ClobClient singleton initialization
- **@src/utils/getMarket.ts** - Fetches market data from Gamma API
- **@src/utils/url.ts** - API endpoint constants (gamma, clob, websocket)
- **@src/functions.ts** - Core strategy functions (updateBook)
- **@src/functions/setOrder.ts** - Order creation and posting logic
- **@src/functions/getOrders.ts** - Fetch user orders

### Architecture Patterns
- **Strategy Pattern**: Main logic encapsulated in Strategy class
- **Lazy Initialization**: ClobClient initialized once via `getClient()`
- **Context Binding**: Strategy methods use `.call(this)` pattern
- **Dual WebSocket**: Separate connections for market data and user events

## Code Style & Conventions

### TypeScript Configuration
- **Module System**: ESNext with bundler resolution
- **Strict Mode**: Enabled (strict: true)
- **noUncheckedIndexedAccess**: Enabled - ALWAYS check array access with `!` or optional chaining
- **Target**: ESNext
- **NEVER use CommonJS** - This is ESNext module project

### Import Patterns
- Use `@src/` prefix for absolute imports from src folder
- **ALWAYS import types** from @polymarket/clob-client: `Side`, `OrderType`, `SignedOrder`
- Standard imports:
  ```typescript
  import { Strategy } from "./strategy";
  import { ClobClient, Side, OrderType } from "@polymarket/clob-client";
  ```

### Naming Conventions
- **Classes**: PascalCase (e.g., `Strategy`)
- **Functions**: camelCase (e.g., `getMarket`, `updateBook`)
- **Files**: camelCase for utils/functions (e.g., `getMarket.ts`, `setOrder.ts`)
- **WebSocket variables**: Suffix with `WS` (e.g., `marketWS`, `userWS`)

### Code Organization
- **Utility functions**: Place in `src/utils/`
- **Strategy functions**: Place in `src/functions/` (for complex logic) or `src/functions.ts` (for simple logic)
- **ALWAYS use context binding** for strategy methods: `functionName.call(this)` when calling from Strategy class

## Environment & Configuration

### Required Environment Variables
- **CRITICAL**: `PRIVATE_KEY` - Ethereum wallet private key (MUST be in `.env` file)
- **NEVER commit `.env` file** to version control

### Hardcoded Configuration
- **Funder Address**: `0x6c778108c3e556e522019ED0c001192c6c72F99D` in @src/utils/client.ts:5
- **Chain ID**: 137 (Polygon) in @src/utils/client.ts:14,16
- **API Endpoints**: Defined in @src/utils/url.ts
  - Gamma API: `https://gamma-api.polymarket.com`
  - CLOB API: `https://clob.polymarket.com`
  - WebSocket: `wss://ws-subscriptions-clob.polymarket.com`

## Strategy Implementation Patterns

### WebSocket Management
- **Market WebSocket** (`/ws/market`): Subscribes to order book updates
  - Sends: `{ assets_ids: [tokenId], type: "market" }`
  - Receives: Book updates with `event_type: "book"`
- **User WebSocket** (`/ws/user`): Subscribes to user-specific events
  - **CRITICAL**: MUST authenticate with API key from `client.deriveApiKey()`
  - Sends: `{ markets: [tokenId], type: "user", auth: apiKey }`

### Order Management
- **Order Creation**: Use `client.createOrder()` with required fields:
  - `tokenID`: Asset token ID (string)
  - `price`: Order price (number, e.g., 0.1 for 10%)
  - `side`: `Side.BUY` or `Side.SELL`
  - `size`: Order size (number)
  - `feeRateBps`: Fee rate in basis points (number)
  - `expiration`: Unix timestamp (number)
- **Order Posting**: Use `client.postOrder(order, OrderType.GTD)` for Good-Till-Date orders
- **ALWAYS check** `resp.errorMessage` after posting orders

### Book Updates
- Book structure: `{ asks: [price, size][], bids: [price, size][], timestamp: string }`
- **ALWAYS filter** by `asset_id` before processing book updates
- Book updates trigger in @src/functions.ts:updateBook

### Market Selection
- **CRITICAL**: Market slugs follow pattern `bitcoin-up-or-down-{time}-et`
- Time format: `MMMM-d-haa` in America/New_York timezone (e.g., `january-7-9am`)
- Market data fetched from Gamma API: `${gamma}/markets/slug/${slug}`

## Development Workflow

### Before Starting
1. **REQUIRED**: Create `.env` file with `PRIVATE_KEY=<your-private-key>`
2. Run `bun install` to install dependencies
3. **CRITICAL**: Ensure wallet has sufficient funds on Polygon

### Making Changes to Strategy
1. Modify strategy logic in @src/strategy.ts or functions
2. **ALWAYS verify** WebSocket message handlers for breaking changes
3. Test with `bun run src/index.ts`
4. Monitor console output for "Market WS connected" and "User WS connected"

### Adding New Strategy Functions
1. Create file in `src/functions/` (e.g., `cancelOrder.ts`)
2. **MUST use** `this: Strategy` as first parameter for context binding
3. Import and call with `.call(this)` from Strategy class
4. Export as named export, NOT default

### Debugging
- WebSocket PONG messages are filtered (return early)
- **ALWAYS log** user messages to understand event flow
- Check `orderPlaced` flag to prevent duplicate orders
- Verify `client` is initialized before calling ClobClient methods

## Critical Rules

- **NEVER hardcode private keys** in source code
- **ALWAYS use lazy initialization** for ClobClient (via getClient())
- **NEVER call `setOrder()` twice** - Check `orderPlaced` flag
- **CRITICAL**: Order expiration MUST be future timestamp in seconds
- **ALWAYS handle** WebSocket errors and reconnection logic
- **BEFORE committing**: Verify no `.env` or sensitive data is staged

## Common Pitfalls

1. **Forgetting to authenticate User WebSocket** - MUST call `client.deriveApiKey()` and send in auth field
2. **Not checking `asset_id` in book updates** - Always filter by `this.asset`
3. **Using milliseconds for expiration** - Convert to seconds: `Math.floor(Date.now() / 1000) + duration`
4. **Not handling PONG messages** - Always early return on "PONG" messages
5. **Accessing array without null check** - Use `clobTokenIds[0]!` due to noUncheckedIndexedAccess

## Testing Strategy Changes

1. Use small order sizes (e.g., `size: 5`) for testing
2. Use low prices (e.g., `price: 0.1`) to minimize risk
3. Short expiration times (e.g., 1-2 minutes) for test orders
4. Monitor both WebSocket connections for proper message flow
5. **ALWAYS verify** orders appear in user WebSocket messages after posting
