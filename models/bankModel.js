const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    bankId: {
      type: String,
      unique: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },

    branches: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

bankSchema.pre("save", async function () {
  if (this.bankId) return;

  const Bank = mongoose.models.Bank;

  const lastBank = await Bank.findOne().sort({ createdAt: -1 });

  if (!lastBank || !lastBank.bankId) {
    this.bankId = "BANK001";
  } else {
    const number = parseInt(lastBank.bankId.replace("BANK", ""), 10);
    this.bankId = `BANK${String(number + 1).padStart(3, "0")}`;
  }
});

module.exports = mongoose.model("Bank", bankSchema);