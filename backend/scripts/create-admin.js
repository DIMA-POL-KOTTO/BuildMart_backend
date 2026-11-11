import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { readFileSync } from "node:fs";

const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "ADMIN123";

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Set ADMIN_EMAIL to a valid email address.");
}

if (!password || password.length < 8) {
  throw new Error("Set ADMIN_PASSWORD to a password of at least 8 characters.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.slice(1),
  allowPublicKeyRetrieval: true,
  connectTimeout: 5000,
  ssl: {
    ca: readFileSync(new URL("../certs/isrgrootx1.pem", import.meta.url), "utf8")
  }
});

const prisma = new PrismaClient({ adapter });

try {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "admin" },
    select: { id: true },
  });

  if (existingAdmin) {
    console.log("An admin account already exists; no changes made.");
  } else {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: "admin" },
      });
      console.log("Existing account promoted to admin; its password was not changed.");
    } else {
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.create({
        data: { email, passwordHash, role: "admin" },
      });
      console.log("Initial admin account created.");
    }
  }
} finally {
  await prisma.$disconnect();
}
