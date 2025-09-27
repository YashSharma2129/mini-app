#!/bin/bash

# Trading App Kubernetes Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

print_status "Starting Trading App deployment to Kubernetes..."

# Apply namespace
print_status "Creating namespace..."
kubectl apply -f namespace.yaml

# Apply PostgreSQL
print_status "Deploying PostgreSQL..."
kubectl apply -f postgres.yaml

# Apply Redis
print_status "Deploying Redis..."
kubectl apply -f redis.yaml

# Wait for database services to be ready
print_status "Waiting for database services to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n trading-app --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n trading-app --timeout=300s

# Apply Backend
print_status "Deploying Backend..."
kubectl apply -f backend.yaml

# Apply Frontend
print_status "Deploying Frontend..."
kubectl apply -f frontend.yaml

# Wait for backend and frontend to be ready
print_status "Waiting for backend and frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n trading-app --timeout=300s
kubectl wait --for=condition=ready pod -l app=frontend -n trading-app --timeout=300s

# Show deployment status
print_status "Deployment completed! Showing status:"
kubectl get pods -n trading-app
kubectl get services -n trading-app

print_status "To access the application:"
echo "1. Port forward to access locally:"
echo "   kubectl port-forward -n trading-app svc/frontend-service 8080:80"
echo "   kubectl port-forward -n trading-app svc/backend-service 5000:5000"
echo ""
echo "2. Then visit: http://localhost:8080"
echo ""
echo "3. Or set up ingress with proper domain name"

print_status "To view logs:"
echo "   kubectl logs -n trading-app -l app=backend -f"
echo "   kubectl logs -n trading-app -l app=frontend -f"
echo ""
echo "To delete deployment:"
echo "   kubectl delete namespace trading-app"
