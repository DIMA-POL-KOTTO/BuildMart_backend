import express from "express";
import path from "path";

const app = express();
const PORT = 8080;
const FRONTEND_DIR = path.join(import.meta.dirname, "..", 'frontend');

app.use(express.static(FRONTEND_DIR));

app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})