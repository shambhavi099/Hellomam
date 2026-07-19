const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const vendorPaymentController = require("../controllers/vendorPaymentController");

router.post(
  "/",
  authMiddleware,
  vendorPaymentController.createVendorPayment
);

router.get(
  "/",
  authMiddleware,
  vendorPaymentController.getVendorPayments
);

router.get(
  "/:id",
  authMiddleware,
  vendorPaymentController.getVendorPaymentById
);

router.put(
  "/:id",
  authMiddleware,
  vendorPaymentController.updateVendorPayment
);

router.patch(
  "/:id/status",
  authMiddleware,
  vendorPaymentController.updateVendorPaymentStatus
);

router.delete(
  "/:id",
  authMiddleware,
  vendorPaymentController.deleteVendorPayment
);

module.exports = router;