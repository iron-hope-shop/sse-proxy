import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { corsOriginCallback } from "./corsConfig.js";
import {
  fetchUpstreamPosts,
  processPosts,
  paginate,
  PAGE_SIZE,
} from "./lib.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ERROR_LOG = path.join(__dirname, "..", "error.log");
const TTL_MS = 30_000;

let cache = {
  processed: null,
  expiresAt: 0,
};

function logError(err) {
  const line = `${new Date().toISOString()} ${err.stack || err.message}\n`;
  try {
    fs.appendFileSync(ERROR_LOG, line, "utf8");
  } catch (e) {
    console.error("Failed to write error.log:", e.message);
  }
}

function getProcessedPosts(cacheStatusRef) {
  const now = Date.now();
  if (cache.processed && now < cache.expiresAt) {
    cacheStatusRef.value = "HIT";
    return cache.processed;
  }
  cacheStatusRef.value = "MISS";
  return null;
}

function setCache(processed) {
  cache = {
    processed,
    expiresAt: Date.now() + TTL_MS,
  };
}

const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: corsOriginCallback,
    exposedHeaders: ["X-Cache-Status"],
    maxAge: 86400,
  }),
);

app.get("/api/posts", async (req, res) => {
  const cacheRef = { value: "MISS" };
  try {
    let processed = getProcessedPosts(cacheRef);
    if (!processed) {
      const raw = await fetchUpstreamPosts();
      processed = processPosts(raw);
      setCache(processed);
    }
    const { page, posts, totalFiltered } = paginate(processed, req.query.page);
    res.setHeader("X-Cache-Status", cacheRef.value);
    res.json({
      page,
      pageSize: PAGE_SIZE,
      totalFiltered,
      posts,
    });
  } catch (err) {
    logError(err);
    res.status(502).json({ error: "Failed to load posts" });
  }
});

app.use((err, _req, res, _next) => {
  logError(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Proxy listening on http://localhost:${PORT}`);
});
