#!/bin/bash

# Build images
echo "Building images..."
docker build -t mycloud_backend -f app/backend/Dockerfile app

# Build Frontend (Production Build)
echo "Building Frontend..."
cd app/frontend && npm install && npm run build && cd ../..

# Stop and remove existing containers
echo "Stopping existing containers..."
docker stop mycloud_backend mycloud_watcher 2>/dev/null
docker rm mycloud_backend mycloud_watcher 2>/dev/null

# Run Backend
echo "Starting Backend..."
docker run -d \
  --name mycloud_backend \
  -p 8001:8000 \
  -e MOUNT_POINT=/mnt/Drive1 \
  -e SCAN_SCRIPT=/app/scripts/nas_scan.sh \
  -e DATABASE_URL=sqlite:////app/data/nas_metadata.db \
  -v "$(pwd)/app/data:/app/data" \
  -v "$(pwd)/app/backend:/app/backend" \
  -v "$(pwd)/app/scripts:/app/scripts" \
  -v "$(pwd)/app/frontend:/app/frontend" \
  -v "/mnt/Drive1:/mnt/Drive1" \
  --restart unless-stopped \
  mycloud_backend

# Run Watcher
echo "Starting Watcher..."
docker run -d \
  --name mycloud_watcher \
  -e MOUNT_POINT=/mnt/Drive1 \
  -e DATABASE_URL=sqlite:////app/data/nas_metadata.db \
  -v "$(pwd)/app/data:/app/data" \
  -v "$(pwd)/app/scripts:/app/scripts" \
  -v "/mnt/Drive1:/mnt/Drive1" \
  --restart unless-stopped \
  mycloud_backend \
  bash /app/scripts/nas_watch.sh

echo "Deployment complete!"
echo "Access App at: http://localhost:8001"
echo "Backend API at: http://localhost:8001/files"
