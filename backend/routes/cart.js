import express from "express";
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { authMiddleware } from "../middleware/auth.js";
import { readFileSync } from "node:fs";
import { deleteCache, getCache, getCatalogVersion, setCache } from "../services/cache.js";

const router = express.Router();
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

async function getUserCartCacheKey(userId) {
    const catalogVersion = await getCatalogVersion();
    return `cart:${catalogVersion}:${userId}`;
}

async function invalidateUserCartCache(userId) {
    try {
        const cacheKey = await getUserCartCacheKey(userId);
        const success = await deleteCache(cacheKey);
        if (!success) {
            console.warn("Could not invalidate cart cache");
        }
    } catch (error) {
        console.warn("Cart cache invalidation error:", error?.message || error);
    }
}

router.get("/cart", authMiddleware, async (req, res) =>{
    try {
        const userId = req.user.userId;
        const cacheKey = await getUserCartCacheKey(userId);
        const cachedCart = await getCache(cacheKey);
        if (cachedCart !== null) {
            res.setHeader("X-Cache", "HIT");
            return res.json(cachedCart);
        }
        res.setHeader("X-Cache", "MISS");

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!cart) {
            const emptyCart = {
                items: [],
                total: 0
            };
            await setCache(cacheKey, emptyCart, 90);
            return res.status(200).json(emptyCart);
        }
        const items = cart.items.map(item => ({
            id: item.id,
            productId: item.productId,
            title: item.product.title,
            price: Number(item.product.price),
            quantity: item.quantity,
            category: item.product.category,
            images: item.product.images,
            stockQuantity: item.product.stockQuantity
        }));
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const responseData = { items, total };
        await setCache(cacheKey, responseData, 90);
        return res.json(responseData);

    } catch(error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/cart/items", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;
        if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ error: "Invalid quantity" });
        }
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            return res.status(404).json({ error: "Product no found" });
        }
        const cart = await prisma.cart.upsert({
            where: { userId },
            update: {},
            create: { userId }
        });
        const itemInCart = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        });
        const newQuantity = (itemInCart?.quantity ?? 0) + quantity;
        if (newQuantity > product.stockQuantity) {
            return res.status(400).json({ error: "Not enough stock" });
        }
        let item;
        if (itemInCart) {
            item = await prisma.cartItem.update({
                where: { id: itemInCart.id },
                data: { quantity: newQuantity }
            });
        } else {
            item = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: productId,
                    quantity: quantity
                }
            });
        }
        await invalidateUserCartCache(userId);
        return res.status(200).json({
            message: "Product added to cart",
            item: item
        });
    } catch(error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.patch("/cart/items/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const itemId = Number(req.params.id);
        const { quantity } = req.body;
        if (!Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({ error: "Invalid quantity" });
        }
        const item = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cart: {
                    userId: userId
                }
            },
            include: {
                product: true
            }
        });

        if (!item) {
            return res.status(404).json({ error: "Cart product not found" });
        }
        if (quantity > item.product.stockQuantity) {
            return res.status(400).json({ error: "Not enough stock" });
        }
        const itemNew = await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity }
        });
        await invalidateUserCartCache(userId);
        return res.status(200).json({
            message: "Cart item upsated",
            item: itemNew
        }) 
    } catch(error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/cart/items/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const itemId = Number(req.params.id);
        const item = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cart: {
                    userId: userId
                }
            }
        });
        if (!item) {
            return res.status(404).json({ error: "Cart item not found" });
        }
        await prisma.cartItem.delete({
            where: { 
                id: itemId
            }
        });
        await invalidateUserCartCache(userId);
        return res.status(200).json({ message: "Product removed from cart" });
    } catch(error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/cart/apply-promo", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { code } = req.body;
        if (!code || typeof code !== "string") {
            return res.status(400).json({
                error: "Promo code is required"
            });
        }
        const promo = await prisma.promocode.findUnique({
            where: {
                code: code.trim()
            }
        });
        if (!promo || !promo.isActive) {
            return res.status(400).json({ error: "Invalid promo code" });
        }
        const cart = await prisma.cart.findUnique({
            where: {
                userId: userId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (cart.items.length === 0) {
            return res.status(400).json({ error: "Your cart is empty" });
        }
        const subtotal = cart.items.reduce((sum, item) => {
            return sum + Number(item.product.price) * item.quantity;
        }, 0);
        const discount = subtotal * promo.discountPercent / 100;
        const tax = subtotal * 0.08;
        const total = subtotal + tax - discount;
        return res.status(200).json ({
            success: true,
            promoCode: promo.code,
            discountPercent: promo.discountPercent,
            subtotal: Number(subtotal.toFixed(2)),
            discount: Number(discount.toFixed(2)),
            tax: Number(tax.toFixed(2)),
            total: Number(total.toFixed(2))
        });
    } catch(error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
