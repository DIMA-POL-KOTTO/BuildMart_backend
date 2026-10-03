import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({
    message: "BuildMart is running!",
    status: 'ok',
  });
});

app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
})