import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { readFileSync } from "node:fs";

const databaseUrl = new URL(process.env.DATABASE_URL);
const isLocalDatabase = ["db", "localhost", "127.0.0.1"].includes(databaseUrl.hostname);
const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.slice(1),
  allowPublicKeyRetrieval: true,
  connectTimeout: 5000,
  ...(isLocalDatabase ? {} : {
    ssl: {
      ca: readFileSync(new URL("../certs/isrgrootx1.pem", import.meta.url), "utf8"),
    },
  }),
});

const prisma = new PrismaClient({ adapter });

try {
  const existingPromo = await prisma.promocode.findUnique({
    where: { code: "SAVE10" },
  });

  if (existingPromo) {
    console.log("SAVE10 already exists; no changes made.");
  } else {
    await prisma.promocode.create({
      data: {
        code: "SAVE10",
        discountPercent: 10,
        isActive: true,
      },
    });
    console.log("SAVE10 promo code created.");
  }
} finally {
  await prisma.$disconnect();
}
