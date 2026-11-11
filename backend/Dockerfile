FROM node:24-bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/
WORKDIR /app/backend
RUN npx prisma generate --config ./prisma7.config.ts
EXPOSE 8080
CMD ["sh", "-c", "npx prisma migrate deploy --config ./prisma7.config.ts && npm start"]