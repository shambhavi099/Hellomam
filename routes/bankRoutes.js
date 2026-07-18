const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const bankController = require("../controllers/bankController");

router.post("/", authMiddleware, bankController.createBank);

router.get("/", authMiddleware, bankController.getBanks);

router.get("/:id", authMiddleware, bankController.getBankById);

router.put("/:id", authMiddleware, bankController.updateBank);

router.patch("/:id/status", authMiddleware, bankController.updateBankStatus);

router.delete("/:id", authMiddleware, bankController.deleteBank);

module.exports = router;