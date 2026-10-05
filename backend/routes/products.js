import express from "express";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const router = express.Router();

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "123456",
  database: "buildmart",
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

router.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json({
        items: products,
        meta: {
            total_items: products.length,
            total_pages: 1,
            current_page: 1,
            limit: 12
        },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;