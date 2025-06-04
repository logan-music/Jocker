# Tunatumia Puppeteer image tayari yenye Chromium
FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

# Nakili files zote
COPY . .

# Install dependencies
RUN npm install

# Run script moja kwa moja
CMD ["node", "index.js"]