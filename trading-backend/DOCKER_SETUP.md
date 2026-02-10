# Docker Setup Guide - Trading Analytics Backend

Complete guide to run PostgreSQL and Redis using Docker for local development.

## 📋 Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

Check if installed:
```bash
docker --version
docker compose version
```

## 🚀 Quick Start (3 Steps)

### Step 1: Start Docker Containers

```bash
cd trading-backend

# Start PostgreSQL + Redis + pgAdmin
docker compose up -d

# Check if containers are running
docker compose ps
```

You should see:
- ✅ `trading_postgres` - PostgreSQL database
- ✅ `trading_redis` - Redis cache
- ✅ `trading_pgadmin` - Database UI

### Step 2: Setup Environment

```bash
# Copy environment file
cp .env.example .env

# The default .env is already configured for Docker!
# DATABASE_URL is set to: postgresql://trading_user:trading_password@localhost:5432/trading_analytics
```

**Important:** Generate a secure JWT secret:
```bash
# Run this and copy the output to JWT_SECRET in .env
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 3: Run Prisma Migrations

```bash
# Install dependencies (if not done)
npm install

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Step 4: Start Backend Server

```bash
npm run dev
```

✅ **Backend running at http://localhost:5000**

## 🎯 What's Running?

| Service | Port | URL | Credentials |
|---------|------|-----|-------------|
| **Backend API** | 5000 | http://localhost:5000 | - |
| **PostgreSQL** | 5432 | localhost:5432 | User: `trading_user`<br>Pass: `trading_password`<br>DB: `trading_analytics` |
| **Redis** | 6379 | localhost:6379 | No auth (local only) |
| **pgAdmin** | 5050 | http://localhost:5050 | Email: `admin@trading.com`<br>Pass: `admin` |
| **Prisma Studio** | 5555 | http://localhost:5555 | Run: `npx prisma studio` |

## 🔧 Docker Commands

### Basic Operations
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f postgres
docker compose logs -f redis

# Restart services
docker compose restart

# Stop and remove everything (including volumes)
docker compose down -v
```

### Container Management
```bash
# List running containers
docker compose ps

# Access PostgreSQL shell
docker compose exec postgres psql -U trading_user -d trading_analytics

# Access Redis CLI
docker compose exec redis redis-cli

# Check container health
docker compose ps
```

## 🗄️ Database Access

### Using pgAdmin (Web UI)

1. Open http://localhost:5050
2. Login with:
   - Email: `admin@trading.com`
   - Password: `admin`
3. Add Server:
   - **General > Name:** Trading Analytics
   - **Connection > Host:** `postgres` (container name)
   - **Connection > Port:** `5432`
   - **Connection > Database:** `trading_analytics`
   - **Connection > Username:** `trading_user`
   - **Connection > Password:** `trading_password`
4. Click Save

### Using Prisma Studio (Recommended)

```bash
npx prisma studio
```
Opens at http://localhost:5555 - Best for viewing/editing data!

### Using psql (Command Line)

```bash
# From your machine
docker compose exec postgres psql -U trading_user -d trading_analytics

# Inside psql:
\dt                    # List tables
\d users              # Describe users table
SELECT * FROM users;  # Query users
\q                    # Quit
```

### Using Database Client (TablePlus, DBeaver, etc.)

**Connection Details:**
- Host: `localhost`
- Port: `5432`
- Database: `trading_analytics`
- Username: `trading_user`
- Password: `trading_password`

## 🔍 Verify Setup

### 1. Check Database Connection
```bash
docker compose exec postgres pg_isready -U trading_user
# Should output: postgres:5432 - accepting connections
```

### 2. Check Tables Created
```bash
docker compose exec postgres psql -U trading_user -d trading_analytics -c "\dt"
# Should show: users, trades, user_stats, session_stats tables
```

### 3. Test API
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","timestamp":"..."}
```

## 🛠️ Troubleshooting

### Port Already in Use

**Problem:** Port 5432 already in use

**Solution 1:** Stop existing PostgreSQL
```bash
# macOS
brew services stop postgresql

# Linux
sudo service postgresql stop

# Windows
# Stop PostgreSQL service in Services app
```

**Solution 2:** Change port in docker-compose.yml
```yaml
postgres:
  ports:
    - "5433:5432"  # Use port 5433 instead
```
Then update DATABASE_URL in .env:
```env
DATABASE_URL="postgresql://trading_user:trading_password@localhost:5433/trading_analytics"
```

### Container Won't Start

```bash
# Check logs
docker compose logs postgres

# Remove and recreate
docker compose down -v
docker compose up -d
```

### Database Connection Refused

```bash
# Wait for database to be ready (takes ~10 seconds on first start)
docker compose logs postgres | grep "ready to accept connections"

# Check health
docker compose ps
# Should show "healthy" status
```

### Permission Denied

```bash
# Fix volume permissions
docker compose down -v
docker volume prune
docker compose up -d
```

### Lost Database Data

**Don't worry!** Data is stored in Docker volumes.

```bash
# Check volumes
docker volume ls | grep trading

# Backup database
docker compose exec postgres pg_dump -U trading_user trading_analytics > backup.sql

# Restore database
docker compose exec -T postgres psql -U trading_user trading_analytics < backup.sql
```

## 🧹 Clean Up

### Remove Containers Only (Keep Data)
```bash
docker compose down
```

### Remove Everything (Including Data)
```bash
docker compose down -v
docker volume prune
```

### Remove Images
```bash
docker rmi postgres:15-alpine redis:7-alpine dpage/pgadmin4
```

## 🔄 Reset Everything

If you want to start fresh:

```bash
# 1. Stop and remove everything
docker compose down -v

# 2. Remove Prisma migrations
rm -rf prisma/migrations

# 3. Start fresh
docker compose up -d
npm install
npx prisma migrate dev --name init
npm run dev
```

## 📦 Data Persistence

Your data is stored in Docker volumes:
- `postgres_data` - Database files
- `redis_data` - Redis cache
- `pgadmin_data` - pgAdmin settings

Even if you stop containers, data persists!

To backup:
```bash
# Export database
docker compose exec postgres pg_dump -U trading_user trading_analytics > backup_$(date +%Y%m%d).sql

# Import database
docker compose exec -T postgres psql -U trading_user trading_analytics < backup.sql
```

## 🎯 Production Deployment

For production, you'll want:
1. **Managed Database** (AWS RDS, Railway, Supabase)
2. **Managed Redis** (Redis Cloud, Upstash)
3. **Don't use Docker Compose** in production
4. **Use Docker for backend app only**

This Docker setup is **perfect for local development!**

## 💡 Pro Tips

1. **Use Prisma Studio** - Best way to view/edit data
   ```bash
   npx prisma studio
   ```

2. **Keep containers running** - No need to stop/start constantly
   ```bash
   docker compose up -d  # Run once, forget about it
   ```

3. **Monitor resources** - Docker Desktop has built-in monitoring

4. **Backup regularly**
   ```bash
   # Add to your daily workflow
   docker compose exec postgres pg_dump -U trading_user trading_analytics > backup.sql
   ```

5. **Use .env for credentials** - Never commit real credentials to Git!

## 🆘 Need Help?

```bash
# Check if Docker is running
docker info

# Check container logs
docker compose logs -f postgres

# Access container shell
docker compose exec postgres sh

# Test database connection
docker compose exec postgres psql -U trading_user -d trading_analytics -c "SELECT version();"
```

## ✅ Checklist

- [ ] Docker Desktop installed and running
- [ ] `docker compose up -d` successful
- [ ] All containers showing "healthy"
- [ ] `.env` file configured
- [ ] `npx prisma migrate dev` completed
- [ ] `npm run dev` backend running
- [ ] http://localhost:5000/health returns OK
- [ ] pgAdmin accessible (optional)
- [ ] Prisma Studio works

**You're all set!** 🚀
