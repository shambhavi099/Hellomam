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
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/upload");

const router = express.Router();

// Public Routes
router.get("/featured", getFeaturedProducts);
router.get("/related/:id", getRelatedProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", authMiddleware, roleMiddleware("seller"), upload.array("images", 5), createProduct);
router.put("/:id", authMiddleware, roleMiddleware("seller"), updateProduct);
router.patch("/:id/status", authMiddleware, roleMiddleware("seller"), toggleProductStatus);
router.patch("/:id/stock", authMiddleware, roleMiddleware("seller"), updateStock);
router.delete("/:id", authMiddleware, roleMiddleware("seller"), deleteProduct);

module.exports = router;