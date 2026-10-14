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
    const { min_price, max_price, min_rating, category, search, sorted_by, page="1", limit="12" } = req.query;
    const currentPage = Number(page);
    const pageLimit = Number(limit);
    if (!Number.isInteger(currentPage) || currentPage < 1 || !Number.isInteger(pageLimit) || pageLimit < 1 || pageLimit > 100) {
      return res.status(400).json({
        error: "Invalid page or limit"
      })
    }
    const skip = (currentPage - 1) * pageLimit;
    const where = {};
    if (min_price !== undefined || max_price !== undefined) {
      where.price = {};
      if (min_price !== undefined) {
        where.price.gte = Number(min_price);
      }
      if (max_price !== undefined) {
        where.price.lte = Number(max_price);
      }
    }
    if (min_rating !== undefined) {
      const rating = Number(min_rating);
      if (min_rating.trim() === "" || !Number.isFinite(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({error: "Rating must be a number between 0 and 5"});
      }
      where.rating = {gte: rating}
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [{title: { contains: search }}, {description: {contains: search}}];
    }
    let orderBy;
    if (sorted_by === "up") {
      orderBy = { price: "asc" };
    }
    if (sorted_by === "down") {
      orderBy = { price: "desc" };
    }
    
    const [totalItems, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where, orderBy, skip, take: pageLimit
      })  
    ]);
    res.json({
        items: products,
        meta: {
            total_items: totalItems,
            total_pages: Math.ceil(totalItems/pageLimit),
            current_page: currentPage,
            limit: pageLimit
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