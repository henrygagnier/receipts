const Receipt = require("../models/Receipt");
const express = require("express");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { storeName, receiptId, userId, items, datePurchased, total } =
      req.body;

      if (!userId) {
        return res.status(400).json({ message: "All fields are required." });
      }

    const newReceipt = new Receipt({
      storeName,
      receiptId,
      userId,
      items,
      datePurchased,
      total,
    });

    const savedReceipt = await newReceipt.save();

    res
      .status(201)
      .json({
        message: "Receipt created successfully.",
        receipt: savedReceipt,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to create receipt.", error: error.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from URL parameter

    // Find all receipts that match the userId
    const receipts = await Receipt.find({ userId });

    if (receipts.length === 0) {
      return res
        .status(404)
        .json({ message: "No receipts found for this user." });
    }

    res.status(200).json({
      message: "Receipts retrieved successfully.",
      receipts,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to retrieve receipts.", error: error.message });
  }
});


module.exports = router;
