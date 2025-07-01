const express = require("express");
const router = express.Router();
const {
  toggleLike,
  getUserLikes,
  checkLikeStatus,
} = require("../controllers/likeController");
const { protect } = require("../middleware/authMiddleware");

// مسیرهای محافظت شده
router.use(protect);

// مسیرهای لایک
router.post("/:productId", toggleLike);
router.get("/user", getUserLikes);
router.get("/check/:productId", checkLikeStatus);

module.exports = router; 