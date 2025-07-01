const express = require("express");
const router = express.Router();
const { register, login, getProfile, createAdmin } = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

// مسیرهای عمومی
router.post("/register", register);
router.post("/login", login);

// مسیرهای محافظت شده
router.get("/profile", protect, getProfile);

// مسیر ایجاد ادمین (فقط برای توسعه)
router.post("/create-admin", createAdmin);

module.exports = router; 