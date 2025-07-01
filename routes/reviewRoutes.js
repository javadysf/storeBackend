const express = require("express");
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus
} = require("../controllers/reviewController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes (Authenticated users)
router.post("/", protect, createReview);
router.get("/user", protect, getUserReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

// Protected routes (Admin only)
router.get("/", protect, admin, getAllReviews);
router.put("/:id/status", protect, admin, updateReviewStatus);

module.exports = router; 