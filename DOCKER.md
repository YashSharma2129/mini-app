# Docker Setup for Trading App

This document provides instructions for running the trading application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### Production Environment

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd mini-app
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

### Development Environment

1. **Start only the database services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Update your environment variables:**
   ```bash
   # Backend .env
   DB_HOST=localhost
   DB_PORT=5433
   REDIS_URL=redis://localhost:6380
   ```

3. **Run the applications locally:**
   ```bash
   # Backend (in one terminal)
   cd backend && npm run dev

   # Frontend (in another terminal)
   cd frontend && npm run dev
   ```

## Services

### Production Stack

- **Frontend**: React app served by Nginx (port 80)
- **Backend**: Node.js API server (port 5000)
- **PostgreSQL**: Database (port 5432)
- **Redis**: Caching and session storage (port 6379)

### Development Stack

- **PostgreSQL**: Database (port 5433)
- **Redis**: Caching (port 6380)

## Environment Variables

### Backend Environment Variables

```env
NODE_ENV=production
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=trading_app
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d
REDIS_URL=redis://redis:6379
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

## Docker Commands

### Basic Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Remove all containers and volumes
docker-compose down -v
```

### Service-Specific Commands

```bash
# View backend logs
docker-compose logs -f backend

# Restart a specific service
docker-compose restart backend

# Execute commands in running containers
docker-compose exec backend npm run seed
docker-compose exec postgres psql -U postgres -d trading_app
```

### Development Commands

```bash
# Start development databases
docker-compose -f docker-compose.dev.yml up -d

# Stop development databases
docker-compose -f docker-compose.dev.yml down

# View development logs
docker-compose -f docker-compose.dev.yml logs -f
```

## Health Checks

All services include health checks:

- **Backend**: `GET /health`
- **Frontend**: `GET /health`
- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`

## Data Persistence

Data is persisted using Docker volumes:

- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis data files
- `backend_uploads`: File uploads

## Building Images Manually

```bash
# Build backend image
docker build -t trading-app-backend ./backend

# Build frontend image
docker build -t trading-app-frontend ./frontend

# Build all images
docker-compose build
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   lsof -i :80
   lsof -i :5000
   lsof -i :5432
   ```

2. **Permission issues:**
   ```bash
   # Fix upload directory permissions
   docker-compose exec backend chmod 755 uploads
   ```

3. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test database connection
   docker-compose exec postgres psql -U postgres -d trading_app -c "SELECT 1;"
   ```

4. **Clear everything and start fresh:**
   ```bash
   docker-compose down -v
   docker system prune -f
   docker-compose up --build -d
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View logs for specific service
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend

# View container status
docker-compose ps

# Inspect container
docker inspect trading-app-backend
```

## Security Considerations

1. **Change default passwords** in production
2. **Use environment files** for sensitive data
3. **Enable SSL/TLS** for production deployments
4. **Regular security updates** of base images
5. **Network isolation** using Docker networks

## Production Deployment

For production deployment, consider:

1. **Using a reverse proxy** (Nginx, Traefik)
2. **SSL certificates** (Let's Encrypt)
3. **Container orchestration** (Kubernetes, Docker Swarm)
4. **Monitoring and logging** (Prometheus, Grafana)
5. **Backup strategies** for persistent data

## CI/CD Integration

The project includes GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that:

1. Runs tests on push/PR
2. Builds Docker images
3. Pushes to GitHub Container Registry
4. Deploys to production (customize as needed)

## Performance Optimization

1. **Multi-stage builds** for smaller images
2. **Layer caching** for faster builds
3. **Health checks** for better container management
4. **Resource limits** for production stability
5. **Connection pooling** for database efficiency
