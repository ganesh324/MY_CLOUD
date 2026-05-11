FROM node:18-slim

WORKDIR /app

# Copy package files and install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ ./

# Expose Vite port
EXPOSE 5173

# Start Vite in dev mode
CMD ["npm", "run", "dev"]
