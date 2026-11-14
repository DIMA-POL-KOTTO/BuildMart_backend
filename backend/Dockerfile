FROM node:24-bookworm-slim AS build
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
COPY frontend/ ../frontend/
RUN npx prisma generate --config ./prisma7.config.ts
RUN npm prune --omit=dev

FROM node:24-bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates memcached \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
COPY --from=build --chown=node:node /app/backend ./
COPY --from=build --chown=node:node /app/frontend ../frontend
USER node
ENV MEMCACHED_SERVERS=127.0.0.1:11211
EXPOSE 8080
CMD ["sh", "-c", "memcached -m 64 -l 127.0.0.1 -p 11211 & npx prisma migrate deploy --config ./prisma7.config.ts && node scripts/create-admin.js && node scripts/create-promo.js && exec npm start"]
