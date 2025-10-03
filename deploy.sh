#!/bin/bash

# School Management System - Deployment Script
# This script helps deploy the application using Docker

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Creating from template..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_warning "Please edit .env file with your production values before deploying!"
            log_warning "Especially change: DB_PASSWORD and JWT_SECRET"
            read -p "Press Enter after editing .env file..."
        else
            log_error ".env.example not found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Validate environment variables
validate_env() {
    log_info "Validating environment variables..."

    # Check if required variables are set
    required_vars=("DB_PASSWORD" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env; then
            log_error "Required environment variable ${var} not found in .env"
            exit 1
        fi

        value=$(grep "^${var}=" .env | cut -d '=' -f2-)
        if [ -z "$value" ] || [ "$value" = "your_password_here" ] || [ "$value" = "your_jwt_secret_here" ]; then
            log_error "${var} is not properly configured. Please update .env file."
            exit 1
        fi
    done

    log_success "Environment validation passed."
}

# Deploy the application
deploy() {
    log_info "Starting deployment..."

    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose pull

    # Start services
    log_info "Starting services..."
    docker-compose up -d

    # Wait for services to be healthy
    log_info "Waiting for services to start..."
    sleep 10

    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_success "Deployment completed successfully!"
        echo ""
        log_info "Application URLs:"
        echo "  API: http://localhost:3000"
        echo "  Swagger Docs: http://localhost:3000/api"
        echo ""
        log_info "To view logs: docker-compose logs -f"
        log_info "To stop: docker-compose down"
    else
        log_error "Deployment failed. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Stop the application
stop() {
    log_info "Stopping services..."
    docker-compose down
    log_success "Services stopped."
}

# Show logs
logs() {
    docker-compose logs -f
}

# Backup database
backup() {
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="backup_${timestamp}.sql"

    log_info "Creating database backup..."
    docker-compose exec -T database pg_dump -U postgres schoolweb_db > "$backup_file"

    if [ $? -eq 0 ]; then
        log_success "Backup created: $backup_file"
    else
        log_error "Backup failed"
        exit 1
    fi
}

# Update deployment
update() {
    log_info "Updating deployment..."
    docker-compose pull
    docker-compose up -d
    log_success "Update completed."
}

# Show usage
usage() {
    echo "School Management System - Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy the application"
    echo "  stop      Stop the application"
    echo "  logs      Show application logs"
    echo "  backup    Create database backup"
    echo "  update    Update to latest images"
    echo "  status    Show service status"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Deploy the application"
    echo "  $0 logs      # View logs"
    echo "  $0 backup    # Backup database"
}

# Show status
status() {
    echo "Service Status:"
    docker-compose ps
    echo ""
    echo "Disk Usage:"
    docker system df
}

# Main script
case "${1:-deploy}" in
    "deploy")
        check_docker
        check_env
        validate_env
        deploy
        ;;
    "stop")
        stop
        ;;
    "logs")
        logs
        ;;
    "backup")
        backup
        ;;
    "update")
        update
        ;;
    "status")
        status
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        usage
        exit 1
        ;;
esac