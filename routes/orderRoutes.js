const express = require("express");
const router = express.Router();

const controller = require("../controllers/ordersController");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
  getSellerOrderById,
  updateOrderStatus,
  updateTracking,
} = controller;

const authMiddleware  = require("../middlewares/authMiddleware");

// ===========================
// Customer Routes
// ===========================

// Place Order
router.post("/", authMiddleware, createOrder);

// Get My Orders
router.get("/my-orders", authMiddleware, getMyOrders);

// Cancel Order
router.patch("/:id/cancel", authMiddleware, cancelOrder);

// ===========================
// Seller Routes
// ===========================

// Get All Seller Orders
router.get("/seller", authMiddleware, getSellerOrders);

// Get Seller Order Details
router.get("/seller/:id", authMiddleware, getSellerOrderById);

// Update Order Status
router.patch("/:id/status", authMiddleware, updateOrderStatus);

// Update Tracking Details
router.patch("/:id/tracking", authMiddleware, updateTracking);

// ===========================
// Common Route
// ===========================

// Get Single Order
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;