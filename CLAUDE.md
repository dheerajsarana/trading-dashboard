# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Trading Analytics Dashboard for analyzing MT5 (MetaTrader 5) trading data. Monorepo with two independent npm projects:

- **`trading-dashboard/`** — React 18 + TypeScript frontend (Vite)
- **`trading-backend/`** — Express + TypeScript API (Prisma + PostgreSQL)

## Commands

### Frontend (`trading-dashboard/`)
```bash
npm run dev        # Vite dev server on port 5173
npm run build      # tsc && vite build
npm run preview    # Preview production build
```

### Backend (`trading-backend/`)
```bash
npm run dev              # tsx watch mode (auto-reload)
npm run build            # tsc → dist/
npm start                # node dist/server.js
npm run prisma:generate  # Generate Prisma Client after schema changes
npm run prisma:migrate   # Run database migrations (interactive)
npm run prisma:studio    # Open Prisma Studio GUI
```

### Infrastructure
```bash
# From trading-backend/
docker compose up -d     # Start PostgreSQL (5432), Redis (6379), pgAdmin (5050)
```

### No test runner or linter is configured yet.

## Architecture

### Frontend

**State management**: Redux Toolkit with slices in `src/store/` — `authSlice`, `tradingSlice`, `journalSlice`, `mt5Slice`. Typed hooks (`useAppDispatch`, `useAppSelector`) in `src/store/hooks.ts`. All API calls go through async thunks (`createAsyncThunk`).

**API layer**: Singleton HTTP client in `src/api/client.ts` wrapping fetch. Auto-injects JWT Bearer token from localStorage. 401 responses redirect to `/login`. Domain-specific modules: `auth.api.ts`, `trades.api.ts`, `stats.api.ts`, `journal.api.ts`, `mt5.api.ts`.

**Routing**: React Router v7. Protected routes via `ProtectedRoute` wrapper. Layout via `DashboardLayout` with sidebar. Routes: `/dashboard/overview` (summary dashboard), `/dashboard/analytics` (combined analytics for regular + MT5 trades), `/dashboard/trades` (unified trades table + MT5 account management), `/dashboard/journal`.

**Styling**: Tailwind CSS with class-based dark mode. UI primitives from shadcn/ui (Radix). Charts via Recharts.

**Path alias**: `@` maps to `./src` (configured in both `vite.config.ts` and `tsconfig.json`).

### Backend

**Layer pattern**: Routes → Controllers → Services → Prisma ORM.

- Controllers: `auth`, `trades`, `stats`, `journal`, `mt5` — handle HTTP request/response
- Services: `statistics.service.ts` (metric calculations), `filter.service.ts` (trade filtering), `mt5.service.ts` (MT5 API integration), `tradeNormalizer.service.ts` (converts MT5Trade → Trade-compatible shape)
- Middleware: JWT auth in `src/middleware/auth.ts`

**Unified data model**: `TradeNormalizerService` converts MT5Trade records into Trade-compatible objects (mapping `time`→`openTime`/`closeTime`, `price`→`openPrice`/`closePrice`, `BUY`/`SELL`→`buy`/`sell`, `source: 'mt5'`). Stats and trades endpoints fetch both regular trades and normalized MT5 trades, merge them, and process as one dataset. The `TradeRecord` interface in `statistics.service.ts` is the structural type both sources satisfy.

**Database**: PostgreSQL via Prisma. Schema at `prisma/schema.prisma`. Key tables: `users`, `trades`, `trade_journals`, `user_stats` (cached calculations), `mt5_accounts`, `mt5_trades`, `mt5_positions`. Multi-column indexes on trades for query performance.

**Caching**: Statistics are cached in the `user_stats` DB table with TTL (default 1 hour). Cache invalidated when trades are modified or MT5 data is synced.

**Auth flow**: JWT issued on login/register, stored in localStorage on frontend, sent as Bearer token, validated by `authenticateToken` middleware.

## Environment Variables

Frontend uses `VITE_` prefix (`.env` in `trading-dashboard/`):
- `VITE_API_BASE_URL` (default: `http://localhost:5000`)
- `VITE_API_TIMEOUT` (default: `30000`)

Backend `.env` in `trading-backend/`:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Min 32 chars
- `PORT` — API port (default: `5000`)
- `FRONTEND_URL` — CORS origin (default: `http://localhost:5173`)
- `CACHE_TTL` — Stats cache TTL in seconds
- `MT5_ENCRYPTION_KEY` — For encrypting stored MT5 credentials
- `REDIS_ENABLED` — Optional Redis caching (`false` by default)
