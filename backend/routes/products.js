import express from "express";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import { authMiddleware } from "../middleware/auth.js";
import { roleMiddleware } from "../middleware/role.js";

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
    switch (sorted_by) {
      case "up":
        orderBy = {price: "asc"};
        break;
      case "down":
        orderBy = {price: "desc"};
        break;
      case "name-az":
        orderBy = {title: "asc"};
        break;
      case "name-za":
        orderBy = {title:"desc"};
        break;
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

router.post("/products", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const { title, description, price, images, stockQuantity, category } = req.body;
    if (!title.trim() || !description.trim() || price === null || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) < 0 || !Array.isArray(images)) {
      return res.status(400).json({ error: "Invalid product data" });
    }
    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        images: images,
        stockQuantity: Number(stockQuantity),
        category: category || null
      }
    });
    return res.status(201).json(product);
  } catch(error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;