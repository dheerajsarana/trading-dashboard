# Quick Setup Guide - Trading Analytics Backend

## ⚡ 5-Minute Setup

### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/WSL:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Step 2: Create Database

```bash
# Login to PostgreSQL (default user: postgres)
psql postgres

# In psql console:
CREATE DATABASE trading_analytics;
\q
```

### Step 3: Setup Project

```bash
cd trading-backend
npm install
cp .env.example .env
```

### Step 4: Configure Environment

Edit `.env` file:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/trading_analytics"
JWT_SECRET="replace-with-random-32-char-string"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

**Generate JWT Secret:**
```bash
# macOS/Linux
openssl rand -base64 32

# Or use this:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 5: Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 6: Start Server

```bash
npm run dev
```

✅ Server running at http://localhost:5000

## 🧪 Test the API

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "securePassword123",
    "name": "John Trader"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "securePassword123"
  }'
```

Save the `token` from response!

### Get Stats (Replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/stats?timePeriod=30days \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 Database Inspection

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

Opens at http://localhost:5555

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
brew services list  # macOS
sudo service postgresql status  # Linux

# Restart if needed
brew services restart postgresql@14  # macOS
sudo service postgresql restart  # Linux
```

### "Database does not exist"
```bash
psql postgres -c "CREATE DATABASE trading_analytics;"
```

### "Prisma Client not generated"
```bash
npx prisma generate
```

### Port 5000 already in use
Change `PORT=5001` in `.env` file

## 📝 Next Steps

1. ✅ Backend running
2. Update frontend API URL (see below)
3. Test Excel upload
4. Build frontend auth UI

## 🔗 Connect Frontend

In your frontend `.env`:
```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Production Checklist

- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Set NODE_ENV=production
- [ ] Use SSL for database connection
- [ ] Enable HTTPS
- [ ] Set secure CORS origin
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Regular database backups

## 💡 Useful Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npx prisma studio       # Open database browser

# Database
npx prisma migrate dev   # Create new migration
npx prisma migrate reset # Reset database (WARNING: deletes data!)
npx prisma db push      # Push schema without migration

# Production
npm run build           # Compile TypeScript
npm start              # Start production server

# Prisma
npx prisma format       # Format schema file
npx prisma validate     # Validate schema
```

## 🎯 Architecture Decisions

**Why PostgreSQL?**
- Best for relational data (trades linked to users)
- Excellent query performance with indexes
- Free tier available on most hosting platforms
- Battle-tested and reliable

**Why Prisma?**
- Type-safe database queries
- Automatic migrations
- Great developer experience
- Visual database browser (Studio)

**Why Backend Calculations?**
- ✅ Consistent across all clients
- ✅ Better performance for large datasets
- ✅ Can generate scheduled reports
- ✅ Easier to add mobile app later

## 🤝 Need Help?

Check the main README.md for detailed documentation!
