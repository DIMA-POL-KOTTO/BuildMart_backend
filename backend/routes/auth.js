import express from "express";
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcrypt";

const router = express.Router();
const databaseUrl = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.slice(1),
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email.trim() || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const emailNorm = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must contain at least 8 characters" });
        }
        const passwordHash = await bcrypt.hash(password, "3131");
        const user = await prisma.user.create({
           data: {
                email: emailNorm,
                passwordHash: passwordHash
           },
           select: {
                id: true,
                email: true,
                role: true,
                createdAt: true
           }
        });
        return res.status(201).json({
            message: "Success regiter",
            user: user
        });
    } catch (error) {
        console.log("reg error");
        if (error.code === "P2002") {
            return res.status(409).json({ error: "A user with this email already exists" })
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }

});

export default router;