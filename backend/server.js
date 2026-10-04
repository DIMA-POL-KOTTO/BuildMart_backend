import express from "express";
import path from "path";
import productsRouter from "./routes/products.js";

const app = express();
const PORT = 8080;
const FRONTEND_DIR = path.join(import.meta.dirname, "..", 'frontend');

app.use("/api", productsRouter);
app.use(express.static(FRONTEND_DIR));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})