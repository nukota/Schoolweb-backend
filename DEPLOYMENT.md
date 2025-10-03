# School Management System - Deployment Guide

## Overview

This guide explains how to deploy the School Management System using Docker containers.

## Prerequisites

- Docker and Docker Compose installed
- Docker Hub account (optional, for pulling images)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/nukota/Schoolweb-backend.git
cd Schoolweb-backend

# Copy environment template
cp .env.example .env

# Edit .env with your production values
# IMPORTANT: Change passwords and JWT secret!

# Deploy
docker-compose up -d

# Check logs
docker-compose logs -f

# Access the application
# API: http://localhost:3000
# Swagger Docs: http://localhost:3000/api
```

### Option 2: Using Pre-built Images from Docker Hub

```bash
# Pull images
docker pull thanhnguyen214/student-management-db
docker pull thanhnguyen214/student-management-webapp

# Run with docker-compose
docker-compose up -d
```

## Environment Configuration

### Required Environment Variables

Edit the `.env` file with your production values:

```env
# Database Configuration
DB_HOST=database
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=schoolweb_db

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-make-this-very-long-and-random

# Application Configuration
PORT=3000
NODE_ENV=production
```

### Security Recommendations

- Use strong, unique passwords (at least 16 characters)
- Generate JWT secrets using: `openssl rand -base64 64`
- Never commit `.env` files to version control
- Use environment-specific secrets in production

## Docker Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update images
docker-compose pull && docker-compose up -d
```

### Database Operations

```bash
# Access database container
docker-compose exec database psql -U postgres -d schoolweb_db

# Backup database
docker-compose exec database pg_dump -U postgres schoolweb_db > backup.sql

# Restore database
docker-compose exec -T database psql -U postgres -d schoolweb_db < backup.sql
```

### Troubleshooting

```bash
# Check container status
docker-compose ps

# View specific service logs
docker-compose logs app
docker-compose logs database

# Rebuild images
docker-compose build --no-cache

# Clean up
docker-compose down -v  # Remove volumes too
docker system prune -a  # Clean unused images
```

## Production Deployment

### Using Docker Hub Images

For production deployments, use the pre-built images:

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  database:
    image: thanhnguyen214/student-management-db:latest
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - school-network

  app:
    image: thanhnguyen214/student-management-webapp:latest
    environment:
      DB_HOST: database
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - '80:3000'
    depends_on:
      - database
    networks:
      - school-network

volumes:
  postgres_prod_data:

networks:
  school-network:
    driver: bridge
```

### Environment Variables for Production

```bash
# Set production environment variables
export DB_PASSWORD="your_secure_db_password"
export JWT_SECRET="your_secure_jwt_secret"

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## API Documentation

Once deployed, access the Swagger documentation at:

- **Local**: http://localhost:3000/api
- **Production**: https://your-domain.com/api

## Ports

- **Application**: 3000 (HTTP)
- **Database**: 5432 (internal only, mapped to host port 5433)

## Monitoring

```bash
# Check application health
curl http://localhost:3000

# Check database connectivity
docker-compose exec app curl http://database:5432
```

## Backup Strategy

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec database pg_dump -U postgres schoolweb_db > backup_$DATE.sql
echo "Backup created: backup_$DATE.sql"
```

## Support

For issues or questions:

1. Check the logs: `docker-compose logs`
2. Verify environment variables in `.env`
3. Ensure Docker and Docker Compose are properly installed
4. Check network connectivity between containers
