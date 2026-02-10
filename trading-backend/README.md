# Trading Analytics Backend

Professional Node.js backend for the Trading Analytics Dashboard with PostgreSQL, Prisma ORM, and JWT authentication.

## 🏗️ Architecture

```
Backend calculates ALL statistics
Frontend just displays pre-computed results
Database caches results for fast retrieval
```

## 📁 Project Structure

```
trading-backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts # Authentication logic
│   │   ├── trades.controller.ts # Trade CRUD operations
│   │   └── stats.controller.ts  # Statistics calculation (to be created)
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication middleware
│   ├── services/
│   │   ├── statistics.service.ts # All calculation logic
│   │   └── filter.service.ts    # Trade filtering logic
│   ├── routes/
│   │   ├── auth.routes.ts      # /api/auth routes
│   │   ├── trades.routes.ts    # /api/trades routes
│   │   └── stats.routes.ts     # /api/stats routes
│   └── server.ts               # Express server entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)

### 2. Database Setup

**Install PostgreSQL:**
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Create Database:**
```bash
# Login to PostgreSQL
psql postgres

# Create database
CREATE DATABASE trading_analytics;

# Create user (optional)
CREATE USER trading_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE trading_analytics TO trading_user;
```

### 3. Install Dependencies
```bash
cd trading-backend
npm install
```

### 4. Environment Setup
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/trading_analytics"
JWT_SECRET="your-super-secret-key-min-32-characters"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### 5. Run Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Start Development Server
```bash
npm run dev
```

Server runs at `http://localhost:5000`

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login
POST   /api/auth/logout      # Logout
GET    /api/auth/me          # Get current user
```

### Trades
```
GET    /api/trades           # Get all trades
POST   /api/trades           # Create manual trade
PUT    /api/trades/:id       # Update trade
DELETE /api/trades/:id       # Delete trade
DELETE /api/trades           # Delete all trades
POST   /api/trades/upload    # Upload Excel file
GET    /api/trades/symbols   # Get unique symbols
```

### Statistics (Computed by Backend)
```
GET    /api/stats            # Get all stats for filters
GET    /api/stats/basic      # Basic stats (P&L, win rate, etc.)
GET    /api/stats/drawdown   # Drawdown analysis
GET    /api/stats/duration   # Duration analysis
GET    /api/stats/sessions   # Session performance
GET    /api/stats/equity     # Equity curve data
GET    /api/stats/calendar   # Calendar heatmap data
```

### Query Parameters for Stats
```
?timePeriod=30days    # today, 7days, 30days, 3months, 1year, all
?assetFilter=EURUSD   # all, or specific symbol
?tradeFilter=winners  # all, winners, losers
```

## 🔧 API Usage Examples

### Register/Login
```javascript
// Register
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'trader@example.com',
    password: 'securePassword123',
    name: 'John Trader'
  })
});
const { user, token } = await response.json();

// Save token for future requests
localStorage.setItem('token', token);
```

### Upload Excel
```javascript
const formData = new FormData();
formData.append('file', excelFile);

const response = await fetch('http://localhost:5000/api/trades/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Get Statistics
```javascript
const response = await fetch(
  'http://localhost:5000/api/stats?timePeriod=30days&assetFilter=XAUUSD&tradeFilter=all',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
const stats = await response.json();

// Returns:
// {
//   basic: { totalPnL, winRate, profitFactor, ... },
//   drawdown: { maxDrawdown, recoveryFactor, ... },
//   duration: { avgHoldTimeWinners, ... },
//   sessions: [{ session: 'London', pnl, winRate, ... }],
//   equity: [{ date, equity }, ...],
//   calendar: { '2024-01-15': { trades: 5, pnl: 150 }, ... }
// }
```

### Create Manual Trade
```javascript
const trade = {
  symbol: 'EURUSD',
  type: 'buy',
  volume: 0.1,
  openPrice: 1.0850,
  closePrice: 1.0900,
  stopLoss: 1.0800,
  takeProfit: 1.0950,
  openTime: new Date('2024-01-15T08:00:00Z'),
  closeTime: new Date('2024-01-15T14:30:00Z'),
  commission: -5,
  swap: -2,
  profit: 50,
  position: 'MANUAL-001'
};

const response = await fetch('http://localhost:5000/api/trades', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(trade)
});
```

## 🗄️ Database Schema

### Users Table
- id, email, password (hashed), name, timestamps

### Trades Table
- All trade data from MT5
- Indexed by userId, symbol, closeTime
- Supports both uploaded and manual trades

### UserStats Table (Cached Results)
- Pre-computed statistics for each filter combination
- TTL-based expiration
- Automatically invalidated on trade changes

### SessionStats Table (Cached Results)
- Session-specific performance metrics
- Linked to filter parameters

## 🎯 Performance Optimizations

1. **Database Indexing**
   - Composite indexes on (userId, symbol)
   - Index on (userId, closeTime)
   - Faster queries for filtered data

2. **Caching Strategy**
   - Pre-compute stats on upload
   - Cache results in database
   - TTL-based invalidation
   - Optional Redis for hot data

3. **Query Optimization**
   - Prisma query optimization
   - Select only needed fields
   - Batch operations where possible

## 🔒 Security

- Bcrypt password hashing (10 rounds)
- JWT tokens with expiration
- HTTP-only cookies
- CORS protection
- Input validation (express-validator)
- SQL injection protection (Prisma)

## 📊 Statistics Calculation Flow

```
1. User uploads Excel → Trades stored in DB
2. Background job calculates stats
3. Stats cached in UserStats table
4. Frontend requests stats
5. Backend checks cache → Returns cached results
6. If cache miss → Calculate → Cache → Return
7. On trade edit/delete → Invalidate cache
```

## 🧪 Testing

```bash
# Run tests (to be added)
npm test

# Database inspection
npx prisma studio
```

## 🚢 Production Deployment

### Environment Variables
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
JWT_SECRET="long-random-string-min-32-chars"
NODE_ENV="production"
FRONTEND_URL="https://your-domain.com"
```

### Deploy to Railway/Render/Heroku
```bash
# Build
npm run build

# Start
npm start
```

### Database Migrations
```bash
npx prisma migrate deploy
```

## 📈 Monitoring

- Log all API requests
- Track slow queries
- Monitor cache hit rate
- Alert on errors

## 🔄 Data Flow

```
Frontend                Backend                 Database
   │                      │                        │
   ├─ Upload Excel ──────►│                        │
   │                      ├─ Parse & Validate     │
   │                      ├─ Store Trades ────────►│
   │                      ├─ Calculate Stats       │
   │                      ├─ Cache Results ────────►│
   │◄─ Success ───────────┤                        │
   │                      │                        │
   ├─ Get Stats ─────────►│                        │
   │                      ├─ Check Cache ──────────►│
   │                      │◄─ Cached Results ──────┤
   │◄─ Statistics ────────┤                        │
```

## 💡 Best Practices

1. Always invalidate cache on data changes
2. Use transactions for bulk operations
3. Implement rate limiting for uploads
4. Validate Excel format before processing
5. Log errors for debugging
6. Use database migrations for schema changes

## 📝 Next Steps

1. Complete stats.controller.ts implementation
2. Add stats.routes.ts
3. Implement caching logic
4. Add input validation
5. Set up error handling
6. Add API documentation (Swagger)
7. Write unit tests
8. Set up CI/CD

## 🤝 Contributing

See CONTRIBUTING.md for guidelines

## 📄 License

MIT
