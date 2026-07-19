const mongoose = require("mongoose");

const vendorCommissionSchema = new mongoose.Schema(
  {
    commissionId: {
      type: String,
      unique: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    commissionType: {
      type: String,
      enum: ["Percentage", "Fixed"],
      default: "Percentage",
    },

    commissionValue: {
      type: Number,
      required: true,
      min: 0,
    },

    gst: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

vendorCommissionSchema.pre("save", async function (next) {
  if (!this.commissionId) {
    const VendorCommission = mongoose.model("VendorCommission");

    const lastCommission = await VendorCommission.findOne().sort({
      createdAt: -1,
    });

    if (!lastCommission || !lastCommission.commissionId) {
      this.commissionId = "COM001";
    } else {
      const number = parseInt(
        lastCommission.commissionId.replace("COM", "")
      );

      this.commissionId = `COM${String(number + 1).padStart(
        3,
        "0"
      )}`;
    }
  }

  next();
});

module.exports = mongoose.model(
  "VendorCommission",
  vendorCommissionSchema
);