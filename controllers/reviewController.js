const Review = require("../models/Review");
const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;

  // بررسی وجود محصول
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("محصول مورد نظر یافت نشد");
  }

  // بررسی وجود نظر قبلی
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("شما قبلاً برای این محصول نظر ثبت کرده‌اید");
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    title,
    comment,
    isVerified: true // در صورت نیاز به تأیید خرید، این مقدار باید false باشد
  });

  res.status(201).json(review);
});

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort || "-createdAt";

  const reviews = await Review.find({
    product: req.params.productId,
    isApproved: true
  })
    .populate("user", "name")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Review.countDocuments({
    product: req.params.productId,
    isApproved: true
  });

  res.json({
    reviews,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalReviews: total
  });
});

// @desc    Get user reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate("product", "title images")
    .sort("-createdAt");

  res.json(reviews);
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("نظر مورد نظر یافت نشد");
  }

  // بررسی مالکیت نظر
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("شما مجاز به ویرایش این نظر نیستید");
  }

  // بررسی تأیید نشدن نظر
  if (review.isApproved) {
    res.status(400);
    throw new Error("نظر تأیید شده قابل ویرایش نیست");
  }

  const { rating, title, comment } = req.body;

  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.comment = comment || review.comment;

  const updatedReview = await review.save();
  res.json(updatedReview);
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("نظر مورد نظر یافت نشد");
  }

  // بررسی مالکیت نظر یا دسترسی ادمین
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("شما مجاز به حذف این نظر نیستید");
  }

  await review.deleteOne();
  res.json({ message: "نظر با موفقیت حذف شد" });
});

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status; // pending, approved, rejected

  let query = {};
  if (status === "pending") {
    query.isApproved = false;
  } else if (status === "approved") {
    query.isApproved = true;
  }

  const reviews = await Review.find(query)
    .populate("user", "name email")
    .populate("product", "title images")
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Review.countDocuments(query);

  res.json({
    reviews,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalReviews: total
  });
});

// @desc    Update review status (Admin)
// @route   PUT /api/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("نظر مورد نظر یافت نشد");
  }

  review.isApproved = isApproved;
  const updatedReview = await review.save();

  res.json(updatedReview);
});

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus
}; 