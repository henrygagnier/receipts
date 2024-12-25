const express = require("express");
const { createWorker } = require("tesseract.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var difflib = require("difflib");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const conf = {
  language: "eng",
  sum_keys: [
    "total",
    "total amount",
    "grand total",
    "amount",
    "final total",
    "subtotal",
    "sum",
    "balance due",
    "amount due",
    "due",
    "paid",
    "total cost",
    "total price",
    "total value",
    "total payment",
    "total paid",
    "total charge",
    "bill total",
    "outstanding balance",
    "final amount",
    "total due",
    "final sum",
    "net total",
    "overall total",
    "total value",
    "full amount",
    "grand total amount",
    "charge",
    "total bill",
    "total to pay",
    "amount to pay",
    "payment due",
    "payment total",
    "balance",
    "total charges",
    "final balance",
    "total payable",
    "total outstanding",
    "amount payable",
    "payable total",
    "total receipt",
    "total sale",
    "net amount",
    "gross total",
    "amount to be paid",
    "total payable amount",
    "outstanding amount",
    "remaining balance",
    "final cost",
    "final payment",
    "total expense",
    "total fee",
    "amount remaining",
    "total after tax",
    "cost total",
    "final cost",
  ],
  ignore_keys: [
    "tax",
    "change",
    "cash",
    "credit card",
    "total",
    "total amount",
    "grand total",
    "amount",
    "final total",
    "subtotal",
    "sum",
    "balance due",
    "amount due",
    "due",
    "paid",
    "total cost",
    "total price",
    "total value",
    "total payment",
    "total paid",
    "total charge",
    "bill total",
    "outstanding balance",
    "final amount",
    "total due",
    "final sum",
    "net total",
    "overall total",
    "total value",
    "full amount",
    "grand total amount",
    "charge",
    "total bill",
    "total to pay",
    "amount to pay",
    "payment due",
    "payment total",
    "balance",
    "total charges",
    "final balance",
    "total payable",
    "total outstanding",
    "amount payable",
    "payable total",
    "total receipt",
    "total sale",
    "net amount",
    "gross total",
    "amount to be paid",
    "total payable amount",
    "outstanding amount",
    "remaining balance",
    "final cost",
    "final payment",
    "total expense",
    "total fee",
    "amount remaining",
    "total after tax",
    "cost total",
    "final cost",
    "surcharge",
    "surchrg",
  ],
};

app.get("/", (req, res) => {
  res.send("I love receipts");
});

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

function parseItems(lines, config) {
  const items = [];
  const itemFormat = /\b([A-Za-z][\w\s]*) (\d+[\.,]\d{2})\b/;

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
  const worker = await createWorker(conf.language, {
    options: {
      corePath: "/public/"
    }
  });
  const ret = await worker.recognize(imagePath);
  console.log(ret.data.text);
  await worker.terminate();
  return parseReceipt(conf, ret.data.text);
}

// Function to parse receipt from raw OCR text
function parseReceipt(config, raw) {
  const lines = normalize(raw);
  const date = parseDate(
    lines,
    /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/
  );
  const totalSum = parseSum(lines, config.sum_keys, /(\d+(?:\.\d{2})?)/);
  const items = parseItems(lines, config);

  return {
    market: "Unknown", // You can implement the market parsing if needed
    date: date,
    sum: totalSum,
    items: items,
  };
}

// Route to process uploaded receipt image
app.post("/process-receipt", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imagePath = path.join("/tmp", req.file.filename);

  try {
    const receiptData = await processReceiptImage(imagePath);

    // Clean up the uploaded file after processing
    fs.unlinkSync(imagePath);

    res.json(receiptData);
  } catch (error) {
    // Clean up the uploaded file in case of an error
    fs.unlinkSync(imagePath);
    res
      .status(500)
      .json({ error: "Error processing receipt: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});