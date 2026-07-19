const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const vendorCommissionController = require("../controllers/vendorCommissionController");

router.post("/", authMiddleware, vendorCommissionController.createVendorCommission);

router.get("/", authMiddleware, vendorCommissionController.getVendorCommissions);

router.get("/:id", authMiddleware, vendorCommissionController.getVendorCommissionById);

router.put("/:id", authMiddleware, vendorCommissionController.updateVendorCommission);

router.patch("/:id/status", authMiddleware, vendorCommissionController.updateVendorCommissionStatus);

router.delete("/:id", authMiddleware, vendorCommissionController.deleteVendorCommission);

module.exports = router;