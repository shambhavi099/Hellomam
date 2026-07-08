const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    transactionId: {
      type: String,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "card",
        "upi",
        "netbanking",
        "wallet",
        "cod",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "success",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    paidAt: Date,
  },
  { timestamps: true }
);


module.exports = mongoose.model(
  "Payment",
  paymentSchema
);