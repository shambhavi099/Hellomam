const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getFeaturedProducts,
  getRelatedProducts,
  updateStock,
} = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Public Routes
router.get("/featured", getFeaturedProducts);
router.get("/related/:id", getRelatedProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", authMiddleware, createProduct);
router.put("/:id", updateProduct);
router.patch("/:id/status", toggleProductStatus);
router.patch("/:id/stock", updateStock);
router.delete("/:id", deleteProduct);

module.exports = router;