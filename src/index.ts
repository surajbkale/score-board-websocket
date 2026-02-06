import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is healthy");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`app is running on http://localhost:${PORT}`);
});
