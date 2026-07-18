const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadExcel");
const bulkUploadController = require("../controllers/bulkUploadController");

router.get("/sample", authMiddleware, bulkUploadController.downloadSampleFile);

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  bulkUploadController.bulkUploadProducts
);

router.get(
  "/history",
  authMiddleware,
  bulkUploadController.getUploadHistory
);

module.exports = router;