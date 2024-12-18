const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");

const { hostname } = require("os");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const cors = require("cors");
const { join } = require("path");
app.use(
  cors({
    origin: [
      `${process.env.FRONTEND_URL}`,
      "http://localhost:4173",
      `http://localhost:${PORT}`,
      `http://${hostname()}:${PORT}`,
    ],
    credentials: true,
  })
);

const limiter = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const limit = process.env.NODE_ENV == "production" ? 10 : 100;

  // Create a new ratelimiter, that allows 10 requests per 10 seconds
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv({ url: process.env.REDIS_URL }),
    limiter: Ratelimit.slidingWindow(limit, "1 d"),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });

  const identifier = ip;
  const { success } = await ratelimit.limit(identifier);

  if (success) return next();

  res.status(429).send("Rate limit exceeded");
};

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const redis = Redis.fromEnv();

app.use("/", express.static(join(process.cwd(), "frontend/dist")));

app.post("/api/create_url", limiter, async (req, res) => {
  try {
    let url = req.body.url.trim();

    url = /^(https?|ftp):\/\//i.test(url) ? url : "https://" + url;
    if (!/^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/[^\s]*)?$/.test(url))
      return res.status(400).send("Invalid url");

    const shortUrl = generateRandomString(4);
    const expireTime = 60 * 60 * 24; // 1 day
    await redis.set(shortUrl, url, { ex: expireTime });
    return res.send(shortUrl);
  } catch (err) {
    return res.status(400).send("Internal server error");
  }
});

app.get("/:name", async (req, res) => {
  const name = req.params.name;
  const url = await redis.get(name);
  if (url) {
    return res.redirect(url);
  }

  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
