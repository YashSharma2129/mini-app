# Trading App Docker Makefile

.PHONY: help build up down logs restart clean dev test

# Default target
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Production commands
build: ## Build all Docker images
	docker-compose build

up: ## Start all services in production mode
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-db: ## View database logs
	docker-compose logs -f postgres

# Development commands
dev-up: ## Start development databases only
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development databases
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## View development database logs
	docker-compose -f docker-compose.dev.yml logs -f

# Testing commands
test: ## Run tests in Docker containers
	docker-compose exec backend npm test
	docker-compose exec frontend npm run test:run

test-backend: ## Run backend tests
	docker-compose exec backend npm test

test-frontend: ## Run frontend tests
	docker-compose exec frontend npm run test:run

# Utility commands
clean: ## Remove all containers, networks, and volumes
	docker-compose down -v
	docker system prune -f

clean-all: ## Remove everything including images
	docker-compose down -v
	docker system prune -af

seed: ## Seed the database
	docker-compose exec backend npm run seed

shell-backend: ## Open shell in backend container
	docker-compose exec backend sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d trading_app

# Health checks
health: ## Check health of all services
	@echo "Checking service health..."
	@curl -s http://localhost:5000/health | jq . || echo "Backend not responding"
	@curl -s http://localhost:80/health || echo "Frontend not responding"
	@docker-compose exec postgres pg_isready -U postgres || echo "Database not ready"
	@docker-compose exec redis redis-cli ping || echo "Redis not responding"

# Status
status: ## Show status of all services
	docker-compose ps

# Rebuild commands
rebuild: ## Rebuild and restart all services
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

rebuild-backend: ## Rebuild backend only
	docker-compose build backend
	docker-compose up -d backend

rebuild-frontend: ## Rebuild frontend only
	docker-compose build frontend
	docker-compose up -d frontend
