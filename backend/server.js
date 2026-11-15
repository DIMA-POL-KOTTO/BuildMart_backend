import express from "express";
import path from "path";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import cartRouter from "./routes/cart.js";
import swaggerUi from "swagger-ui-express";
import openapi from "./openapi.js";

const app = express();
dotenv.config({path: path.resolve(import.meta.dirname, "../.env")});
const port = Number(process.env.PORT);
const FRONTEND_DIR = path.join(import.meta.dirname, "..", 'frontend');

app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/api/auth", authRouter);
app.use("/api", productsRouter);
app.use("/api", cartRouter);
app.use(express.static(FRONTEND_DIR));
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
