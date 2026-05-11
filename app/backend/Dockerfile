FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    inotify-tools \
    findutils \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy the rest of the application
COPY backend/ ./backend/
COPY scripts/ ./scripts/

# Set environment variables
ENV PYTHONPATH=/app
ENV SCAN_SCRIPT=/app/scripts/nas_scan.sh

# Expose the port FastAPI runs on
EXPOSE 8000

# Start the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
