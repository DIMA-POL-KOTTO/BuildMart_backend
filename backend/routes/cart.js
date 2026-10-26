import express from "express";
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { authMiddleware } from "../middleware/auth.js";

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

router.get("/cart", authMiddleware, async (req, res) =>{
    try {
        const userId = req.user.userId;
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
            return res.status(200).json({
                items: [],
                total: 0
            })
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
        res.json({ items, total });

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
        return res.status(200).json({ message: "Product removed from cart" });
    } catch(error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;