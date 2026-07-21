const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const sellerController = require("../controllers/sellerController");
const productController = require("../controllers/productController");

router.post("/register", sellerController.registerSeller);

router.get("/profile", authMiddleware, sellerController.getProfile);

router.put("/profile", authMiddleware, sellerController.updateProfile);

router.put(
  "/change-password",
  authMiddleware,
  sellerController.changePassword
);

router.get(
  "/dashboard",
  sellerController.dashboard
);

router.put(
  "/deactivate",
  authMiddleware,
  sellerController.deactivateSeller
);


router.post(
  "/products",
  authMiddleware,
  productController.createProduct
);

router.get(
  "/products",
  authMiddleware,
  productController.getMyProducts
);

router.get(
  "/products/:id",
  authMiddleware,
  productController.getProductById
);

router.put(
  "/products/:id",
  authMiddleware,
  productController.updateProduct
);

router.delete(
  "/products/:id",
  authMiddleware,
  productController.deleteProduct
);

router.patch(
  "/products/:id/status",
  authMiddleware,
  productController.toggleProductStatus
);

router.patch(
  "/products/:id/stock",
  authMiddleware,
  productController.updateStock
);

module.exports = router;