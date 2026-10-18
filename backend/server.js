import express from "express";
import path from "path";
import "dotenv/config";
import productsRouter from "./routes/products.js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 8080;
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
}
const FRONTEND_DIR = path.join(import.meta.dirname, "..", 'frontend');

app.use("/api", productsRouter);
app.use(express.static(FRONTEND_DIR));
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
