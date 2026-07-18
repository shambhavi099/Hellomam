const mongoose = require("mongoose");

const userBankSchema = new mongoose.Schema(
  {
    userBankId: {
      type: String,
      unique: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: true,
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    branchName: {
      type: String,
      trim: true,
    },

    accountType: {
      type: String,
      enum: ["Savings", "Current"],
      default: "Savings",
    },

    isPrimary: {
      type: Boolean,
      default: false,
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

userBankSchema.pre("save", async function (next) {
  if (!this.userBankId) {
    const UserBank = mongoose.model("UserBank");

    const lastBank = await UserBank.findOne().sort({
      createdAt: -1,
    });

    if (!lastBank || !lastBank.userBankId) {
      this.userBankId = "UB001";
    } else {
      const number = parseInt(
        lastBank.userBankId.replace("UB", "")
      );

      this.userBankId = `UB${String(number + 1).padStart(
        3,
        "0"
      )}`;
    }
  }

  next();
});

module.exports = mongoose.model(
  "UserBank",
  userBankSchema
);