const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const userBankController = require("../controllers/userBankController");

router.post("/", authMiddleware, userBankController.createUserBank);
router.get("/", authMiddleware, userBankController.getUserBanks);
router.get("/:id", authMiddleware, userBankController.getUserBankById);
router.put("/:id", authMiddleware, userBankController.updateUserBank);
router.patch(
  "/:id/status",
  authMiddleware,
  userBankController.updateUserBankStatus
);
router.patch(
  "/:id/primary",
  authMiddleware,
  userBankController.makePrimaryBank
);
router.delete("/:id", authMiddleware, userBankController.deleteUserBank);

module.exports = router;