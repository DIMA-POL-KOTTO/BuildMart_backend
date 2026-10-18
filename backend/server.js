import express from "express";
import path from "path";
import "dotenv/config";
import productsRouter from "./routes/products.js";

const app = express();
app.use(express.json());
const port = Number(process.env.PORT);
const FRONTEND_DIR = path.join(import.meta.dirname, "..", 'frontend');

app.use("/api", productsRouter);
app.use(express.static(FRONTEND_DIR));
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
