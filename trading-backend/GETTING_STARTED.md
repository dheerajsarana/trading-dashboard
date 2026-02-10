# 🚀 Getting Started - Docker Edition

The **easiest** way to run the Trading Analytics Backend locally using Docker.

## Prerequisites

✅ Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
✅ Node.js 18+ installed

## 3-Step Setup

### Step 1: Start Docker Containers

```bash
cd trading-backend

# Start PostgreSQL + Redis + pgAdmin
docker compose up -d

# Verify containers are running
docker compose ps
```

You should see 3 containers running with "healthy" status.

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it into `.env` file for `JWT_SECRET`.

The `.env` file is already configured for Docker with:
```env
DATABASE_URL="postgresql://trading_user:trading_password@localhost:5432/trading_analytics"
```

### Step 3: Setup Database & Start Server

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev
```

## ✅ Verify Everything Works

**Backend API:**
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","timestamp":"..."}
```

**Database UI (pgAdmin):**
- Open http://localhost:5050
- Login: `admin@trading.com` / `admin`

**Prisma Studio:**
```bash
npx prisma studio
# Opens at http://localhost:5555
```

## 🎯 What's Running?

| Service | URL | Credentials |
|---------|-----|-------------|
| Backend API | http://localhost:5000 | - |
| pgAdmin | http://localhost:5050 | admin@trading.com / admin |
| PostgreSQL | localhost:5432 | trading_user / trading_password |
| Redis | localhost:6379 | - |

## 🎨 Using Makefile (Optional)

We included a Makefile for convenience:

```bash
# Setup everything (first time)
make setup

# Start development server
make dev

# Open Prisma Studio
make prisma-studio

# View Docker logs
make docker-logs

# Stop Docker containers
make docker-down

# See all commands
make help
```

## 🔧 Common Commands

```bash
# Start Docker
docker compose up -d

# Stop Docker
docker compose down

# View logs
docker compose logs -f

# Restart everything
docker compose restart

# Remove everything (including data)
docker compose down -v
```

## 🐛 Troubleshooting

**Port 5432 already in use?**
```bash
# Stop local PostgreSQL
brew services stop postgresql  # macOS
sudo service postgresql stop   # Linux
```

**Containers won't start?**
```bash
# Check logs
docker compose logs postgres

# Recreate containers
docker compose down -v
docker compose up -d
```

**Can't connect to database?**
```bash
# Wait a few seconds for database to initialize
# Check health status
docker compose ps
```

## 📚 Full Documentation

- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Complete Docker guide
- **[README.md](./README.md)** - Full API documentation
- **[SETUP.md](./SETUP.md)** - Alternative setup methods

## 🎉 You're Ready!

Your backend is now running with:
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ All analytics calculations
- ✅ JWT authentication
- ✅ Excel upload support

**Next:** Update your frontend to connect to http://localhost:5000
