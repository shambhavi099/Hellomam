const express = require("express");
const {
  processPayment,
  getPaymentDetails,
} = require("../controllers/paymentController");

const protect = require("../middlewares/authMiddleware");


const router = express.Router();


// Process payment
router.post(
  "/process",
  protect,
  processPayment
);


// Get payment details
router.get(
  "/:id",
  protect,
  getPaymentDetails
);


module.exports = router;