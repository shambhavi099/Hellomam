const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: false,
    },
    price: {
      type: Number,
      required: false,
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    mrp: {
      type: Number,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    gst: {
      type: Number,
      default: 0,
    },

    taxType: {
      type: String,
      enum: ["Inclusive", "Exclusive"],
      default: "Inclusive",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
    barcode: {
      type: String,
      trim: true,
      default: "",
    },

    minimumStockAlert: {
      type: Number,
      default: 5,
    },

    warehouse: {
      type: String,
      trim: true,
      default: "",
    },

    stockStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock"],
      default: "In Stock",
    },
    sku: {
      type: String,
      unique: true,
      required: false,
      trim: true,
    },
    images: [
      {
        url: {
          type: String,
          required: false,
        },
        public_id: {
          type: String,
          required: false,
        },
      },
    ],
    thumbnail: {
      url: String,
      public_id: String,
    },
    shipping: {
      weight: {
        type: Number,
        default: 0,
      },

      length: {
        type: Number,
        default: 0,
      },

      width: {
        type: Number,
        default: 0,
      },

      height: {
        type: Number,
        default: 0,
      },

      shippingCharge: {
        type: Number,
        default: 0,
      },

      deliveryTime: {
        type: String,
        default: "",
      },
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    variants: {
      colors: [String],
      sizes: [String],
    },
    tags: [String],
    seo: {
      metaTitle: {
        type: String,
        default: "",
      },

      metaDescription: {
        type: String,
        default: "",
      },

      keywords: [String],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }

  
);

module.exports = mongoose.model("Product", productSchema);