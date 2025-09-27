# Multi-stage build for the entire application
FROM node:18-alpine as backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
RUN mkdir -p uploads

FROM node:18-alpine as frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine as production

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Copy backend
COPY --from=backend-build /app/backend /app/backend

WORKDIR /app/backend

# Install production dependencies for backend
RUN npm ci --only=production

EXPOSE 80 5000

# Start both services
CMD nginx -g 'daemon off;' & node src/server.js
