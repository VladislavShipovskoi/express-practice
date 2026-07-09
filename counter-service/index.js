const express = require("express");
const redis = require("redis");

const PORT = process.env.PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost";

const redisClient = redis.createClient({
  url: REDIS_URL,
});

(async () => {
  await redisClient.connect();
})();

const app = express();

app.get("/counter/:bookId", async (req, res) => {
  const bookId = req.params.bookId;
  const count = (await redisClient.get(bookId)) || 1;
  res.json({ bookId, count });
});

app.post("/counter/:bookId/incr", async (req, res) => {
  const bookId = req.params.bookId;
  const count = await redisClient.incr(bookId);
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Counter service listening on port ${PORT}`);
});
