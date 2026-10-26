FROM node:24-bookworm-slim
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