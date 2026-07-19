const mongoose = require("mongoose");

const vendorPaymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    grossAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    commission: {
      type: Number,
      default: 0,
    },

    gst: {
      type: Number,
      default: 0,
    },

    netAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    paymentMode: {
      type: String,
      enum: [
        "Cash",
        "UPI",
        "NEFT",
        "RTGS",
        "IMPS",
        "Bank Transfer",
      ],
      default: "Bank Transfer",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Paid",
        "Failed",
        "Cancelled",
      ],
      default: "Pending",
    },

    transactionId: {
      type: String,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

vendorPaymentSchema.pre("save", async function (next) {
  if (!this.paymentId) {
    const VendorPayment = mongoose.model("VendorPayment");

    const lastPayment = await VendorPayment.findOne().sort({
      createdAt: -1,
    });

    if (!lastPayment || !lastPayment.paymentId) {
      this.paymentId = "PAY001";
    } else {
      const number = parseInt(
        lastPayment.paymentId.replace("PAY", "")
      );

      this.paymentId = `PAY${String(number + 1).padStart(
        3,
        "0"
      )}`;
    }
  }

  next();
});

module.exports = mongoose.model(
  "VendorPayment",
  vendorPaymentSchema
);