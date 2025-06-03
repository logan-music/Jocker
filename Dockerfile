# Base image with all needed dependencies for Puppeteer
FROM node:18-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    tesseract-ocr \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libxss1 \
    libasound2 \
    curl \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Avoid sandbox errors in Render & Railway
ENV PUPPETEER_DISABLE_SANDBOX=true

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy source files
COPY index.js .
COPY cookies.json .

# Dummy port for platform compatibility
ENV PORT=3000

# Start the bot
CMD ["node", "index.js"]
