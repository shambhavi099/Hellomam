const express = require("express");

const router = express.Router();

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory
} = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", authMiddleware, updateCategory);

module.exports = router;