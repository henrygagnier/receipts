const multer = require("multer");
const { createWorker } = require("tesseract.js");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const difflib = require("difflib");

const conf = {
  language: "eng",
  sum_keys: [
    "total",
    "grand total",
    "total amount",
    "amount",
    "final total",
    "subtotal",
    "balance due",
  ],
  ignore_keys: ["tax", "change", "cash", "credit card", "surcharge"],
};

// Helper function to normalize text
function normalize(lines) {
  return lines
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0);
}

function fuzzyFind(lines, keyword, accuracy = 0.6) {
  for (let line of lines) {
    const matches = difflib.getCloseMatches(
      keyword,
      line.split(" "),
      1,
      accuracy
    );
    if (matches.length > 0) {
      return line;
    }
  }
  return null;
}

// Function to parse sum from receipt
function parseSum(lines, sumKeys, sumFormat) {
  for (let sumKey of sumKeys) {
    const line = fuzzyFind(lines, sumKey);
    if (line) {
      const match = line.match(sumFormat);
      if (match) {
        return match[0];
      }
    }
  }
  return null;
}

// Function to parse date from receipt
function parseDate(lines, dateFormat) {
  for (let line of lines) {
    const match = line.match(dateFormat);
    if (match) {
      return match[0];
    }
  }
  return null;
}

// Function to parse items from receipt
function parseItems(lines, config) {
  const items = [];
  const itemFormat = /\b([A-Za-z][\w\s]*) (\d+[\.,]\d{2})\b/; // Item format (name + price)

  for (let line of lines) {
    if (config.ignore_keys.some((keyword) => line.includes(keyword))) {
      continue;
    }

    const match = line.match(itemFormat);
    if (match) {
      const articleName = match[1].trim();
      const articleSum = match[2].replace(",", ".");
      items.push({ article: articleName, sum: articleSum });
    }
  }

  return items;
}

async function processReceiptImage(imagePath) {
  const worker = await createWorker(conf.language);
  const ret = await worker.recognize(imagePath);
  console.log(ret.data.text);
  await worker.terminate();
  return parseReceipt(conf, ret.data.text);
}

// Function to parse receipt from raw OCR text
function parseReceipt(config, raw) {
  const lines = normalize(raw);
  const date = parseDate(lines, /(\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4})/);
  const totalSum = parseSum(lines, config.sum_keys, /(\d+(?:\.\d{2})?)/);
  const items = parseItems(lines, config);

  return {
    market: "Unknown", // You can implement the market parsing if needed
    date: date,
    sum: totalSum,
    items: items,
  };
}

const storage = multer.memoryStorage(); // Store files in memory for serverless function

const upload = multer({ storage: storage });

module.exports = async (req, res) => {
  // Check if the method is POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Handle file upload via multer
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: "Error during file upload" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Save the file to the tmp folder (Vercel's writable directory)
    const tmpPath = path.join("/tmp", req.file.originalname);
    try {
      fs.writeFileSync(tmpPath, req.file.buffer);

      const receiptData = await processReceiptImage(tmpPath);

      // Clean up temporary file
      fs.unlinkSync(tmpPath);

      res.json(receiptData);
    } catch (error) {
      console.error(error);
      // Clean up temporary file in case of error
      fs.unlinkSync(tmpPath);
      res
        .status(500)
        .json({ error: "Error processing receipt: " + error.message });
    }
  });
};