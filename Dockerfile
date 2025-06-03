FROM node:18-slim

RUN apt-get update && apt-get install -y \
    libnss3 libxss1 libatk-bridge2.0-0 libgtk-3-0 libasound2 libdrm2 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
