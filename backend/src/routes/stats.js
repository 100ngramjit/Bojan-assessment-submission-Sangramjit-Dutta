const express = require("express");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// Cache for stats
let cachedStats = null;
let lastModified = null;

// Watch for file changes to invalidate cache
try {
  fs.watch(DATA_PATH, () => {
    cachedStats = null;
    lastModified = null;
  });
} catch (err) {
  console.warn("Could not watch items.json for changes:", err.message);
}

// GET /api/stats - with caching
router.get("/", async (req, res, next) => {
  try {
    const stat = await fsPromises.stat(DATA_PATH);

    // Return cached stats if file hasn't changed
    if (cachedStats && lastModified === stat.mtimeMs) {
      return res.json(cachedStats);
    }

    // Read and calculate stats
    const raw = await fsPromises.readFile(DATA_PATH, "utf8");
    const items = JSON.parse(raw);

    cachedStats = {
      total: items.length,
      averagePrice:
        items.length > 0
          ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length
          : 0,
    };
    lastModified = stat.mtimeMs;

    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
