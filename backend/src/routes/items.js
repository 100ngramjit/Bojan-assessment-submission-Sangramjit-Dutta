const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// Utility to read data (async - non-blocking)
async function readData() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

// Utility to write data (async - non-blocking)
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/items - with pagination and search support
router.get("/", async (req, res, next) => {
  try {
    const data = await readData();
    const { page = 1, limit = 10, q } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    let results = data;

    // Filter by search query
    if (q) {
      results = results.filter((item) =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    const total = results.length;
    const start = (pageNum - 1) * limitNum;
    const paginatedResults = results.slice(start, start + limitNum);

    res.json({
      items: paginatedResults,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get("/:id", async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find((i) => i.id === parseInt(req.params.id, 10));
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post("/", async (req, res, next) => {
  try {
    // TODO: Validate payload
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
