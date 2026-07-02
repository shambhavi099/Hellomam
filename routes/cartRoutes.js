const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const protect = require("../middlewares/authMiddleware");

// Add product to cart
router.post("/add", protect, addToCart);

// Get logged-in customer's cart
router.get("/", protect, getCart);

// Update quantity of a cart item
router.patch("/update/:productId", protect, updateCartItem);

// Remove a single product from cart
router.delete("/remove/:productId", protect, removeCartItem);

// Clear entire cart
router.delete("/clear", protect, clearCart);

module.exports = router;