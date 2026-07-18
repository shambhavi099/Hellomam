const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware")

const {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getSellerReviews,
  getReviewById
} = require("../controllers/reviewController");

//Seller Routes
router.get("/seller",authMiddleware,roleMiddleware("seller"),getSellerReviews);
router.get("/seller/:id",authMiddleware,roleMiddleware("seller"),getReviewById);

// Customer Routes
router.post("/", authMiddleware, addReview);
router.get("/:productId", getProductReviews);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;