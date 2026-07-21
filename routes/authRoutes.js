const express = require("express");
const router = express.Router();

const {
  login,
  sendSellerOtp,
  verifySellerOtp,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/login", login);
router.post(
  "/forgot-password",
  forgotPassword
);

router.patch(
  "/reset-password/:token",
  resetPassword
);

router.post("/seller/send-otp", sendSellerOtp);

router.post("/seller/verify-otp", verifySellerOtp);

module.exports = router;