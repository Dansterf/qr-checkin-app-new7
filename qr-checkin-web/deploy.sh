#!/bin/bash

# Production Deployment Script for QR Check-in Application
# This script prepares and deploys the application to Cloudflare

# Exit on error
set -e

echo "Starting deployment process..."

# Navigate to project directory
cd /home/ubuntu/qr-checkin-app/qr-checkin-web

# Install dependencies if needed
echo "Installing dependencies..."
pnpm install

# Run tests to ensure everything is working
echo "Running tests..."
pnpm test

# Build the application
echo "Building application for production..."
pnpm build

# Enable database in wrangler.toml
echo "Configuring database..."
sed -i 's/# \[\[d1_databases\]]/[[d1_databases]]/' wrangler.toml
sed -i 's/# binding = "DB"/binding = "DB"/' wrangler.toml
sed -i 's/# database_name = "local-db"/database_name = "qr-checkin-db"/' wrangler.toml
sed -i 's/# database_id = "local"/database_id = "qr-checkin-db-id"/' wrangler.toml

# Initialize database with schema
echo "Initializing database schema..."
pnpm wrangler d1 execute DB --local --file=migrations/0001_initial.sql

# Deploy to Cloudflare
echo "Deploying to Cloudflare..."
pnpm wrangler deploy

echo "Deployment completed successfully!"
echo "Your application is now available at: https://qr-checkin-app.pages.dev"
