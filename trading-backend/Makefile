# Makefile for Trading Analytics Backend
# Makes common commands easier to remember

.PHONY: help install dev build start docker-up docker-down docker-logs prisma-studio prisma-migrate prisma-reset test clean

help: ## Show this help message
	@echo "Trading Analytics Backend - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Installation
install: ## Install dependencies
	npm install

# Development
dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm start

# Docker Commands
docker-up: ## Start Docker containers (PostgreSQL + Redis + pgAdmin)
	docker compose up -d

docker-down: ## Stop Docker containers
	docker compose down

docker-down-v: ## Stop Docker containers and remove volumes (⚠️  deletes data)
	docker compose down -v

docker-logs: ## View Docker logs
	docker compose logs -f

docker-logs-db: ## View PostgreSQL logs only
	docker compose logs -f postgres

docker-ps: ## Show running containers
	docker compose ps

docker-restart: ## Restart Docker containers
	docker compose restart

# Database Commands
prisma-studio: ## Open Prisma Studio (Database UI)
	npx prisma studio

prisma-migrate: ## Run database migrations
	npx prisma migrate dev

prisma-generate: ## Generate Prisma Client
	npx prisma generate

prisma-reset: ## Reset database (⚠️  deletes all data)
	npx prisma migrate reset

prisma-format: ## Format schema file
	npx prisma format

db-shell: ## Access PostgreSQL shell
	docker compose exec postgres psql -U trading_user -d trading_analytics

redis-cli: ## Access Redis CLI
	docker compose exec redis redis-cli

# Database Backup/Restore
db-backup: ## Backup database to backup.sql
	docker compose exec postgres pg_dump -U trading_user trading_analytics > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Database backed up!"

db-restore: ## Restore database from backup.sql (specify file with FILE=backup.sql)
	docker compose exec -T postgres psql -U trading_user trading_analytics < $(FILE)

# Setup Commands
setup: ## Complete setup (Docker + Install + Migrate)
	@echo "🚀 Setting up Trading Analytics Backend..."
	@echo ""
	@echo "1️⃣  Starting Docker containers..."
	docker compose up -d
	@echo ""
	@echo "2️⃣  Installing dependencies..."
	npm install
	@echo ""
	@echo "3️⃣  Waiting for database to be ready..."
	@sleep 5
	@echo ""
	@echo "4️⃣  Running migrations..."
	npx prisma migrate dev --name init
	@echo ""
	@echo "✅ Setup complete! Run 'make dev' to start the server"

setup-env: ## Copy .env.example to .env
	cp .env.example .env
	@echo "✅ .env file created! Edit it to set your JWT_SECRET"

# Clean
clean: ## Clean build artifacts
	rm -rf dist/
	rm -rf node_modules/

clean-all: docker-down-v clean ## Clean everything including Docker volumes

# Testing
test: ## Run tests (when implemented)
	npm test

# Health Check
health: ## Check if backend is running
	@curl -s http://localhost:5000/health || echo "❌ Backend not running"

# Complete workflow commands
fresh-start: clean-all setup dev ## Complete fresh start (⚠️  deletes all data)

quick-start: docker-up ## Quick start (assumes already setup)
	@sleep 3
	@echo "✅ Docker containers started"
	@echo "Run 'make dev' to start the backend"
