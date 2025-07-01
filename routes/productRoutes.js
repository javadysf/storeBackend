const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBestSellers,
  getNewProducts,
  updateSalesCount
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/best-sellers", getBestSellers);
router.get("/new", getNewProducts);
router.get("/:id", getProduct);

// Protected routes (Admin only)
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

// Protected routes (Authenticated users)
router.put("/:id/sales", protect, updateSalesCount);

module.exports = router;
