const mongoose = require("mongoose");

const ReceiptSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: false,
    },
    receiptId: {
      type: String,
      required: false,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        itemName: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        healthiness: {
          type: Number,
          min: 1,
          max: 100,
          required: false,
        },
      },
    ],
    datePurchased: {
      type: Date,
      required: false,
    },
    total: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Receipt", ReceiptSchema);