const express = require("express");
const router = express.Router();

const {
  registerCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  deleteCustomer,
  changePassword
} = require("../controllers/customerController");

const authMiddleware = require("../middlewares/authMiddleware");

// Public Routes
router.post("/register", registerCustomer);

// Protected Routes
router.get("/profile", authMiddleware, getCustomerProfile);
router.put("/profile", authMiddleware, updateCustomerProfile);
router.delete("/profile", authMiddleware, deleteCustomer);

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;