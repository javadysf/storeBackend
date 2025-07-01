const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// محافظت از مسیرها
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // دریافت توکن از هدر
      token = req.headers.authorization.split(" ")[1];

      // بررسی اعتبار توکن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // دریافت اطلاعات کاربر بدون رمز عبور
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("دسترسی غیرمجاز، توکن نامعتبر است");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("دسترسی غیرمجاز، توکن یافت نشد");
  }
});

// بررسی دسترسی ادمین
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("دسترسی غیرمجاز، فقط ادمین می‌تواند به این مسیر دسترسی داشته باشد");
  }
});

module.exports = { protect, admin }; 