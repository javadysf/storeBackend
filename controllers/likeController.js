const Like = require("../models/Like");
const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

// @desc    Toggle like for a product
// @route   POST /api/likes/:productId
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // بررسی وجود محصول
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("محصول مورد نظر یافت نشد");
  }

  // بررسی وجود لایک قبلی
  const existingLike = await Like.findOne({
    user: req.user._id,
    product: productId,
  });

  if (existingLike) {
    // اگر لایک وجود داشت، آن را حذف می‌کنیم
    await existingLike.deleteOne();
    res.json({ message: "لایک با موفقیت حذف شد", liked: false });
  } else {
    // اگر لایک وجود نداشت، یک لایک جدید ایجاد می‌کنیم
    const like = await Like.create({
      user: req.user._id,
      product: productId,
    });
    res.status(201).json({ message: "محصول با موفقیت لایک شد", liked: true, like });
  }
});

// @desc    Get user's liked products
// @route   GET /api/likes
// @access  Private
const getUserLikes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const likes = await Like.find({ user: req.user._id })
    .populate({
      path: "product",
      select: "title price images description",
    })
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Like.countDocuments({ user: req.user._id });

  res.json({
    likes,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalLikes: total,
  });
});

// @desc    Check if user has liked a product
// @route   GET /api/likes/:productId/check
// @access  Private
const checkLikeStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const like = await Like.findOne({
    user: req.user._id,
    product: productId,
  });

  res.json({ liked: !!like });
});

module.exports = {
  toggleLike,
  getUserLikes,
  checkLikeStatus,
}; 