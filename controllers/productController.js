const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const category = req.query.category;
  const search = req.query.search;
  const sort = req.query.sort || '-createdAt';
  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;

  let query = {};

  // فیلتر بر اساس دسته‌بندی
  if (category) {
    query.category = category;
  }

  // جستجو در عنوان و توضیحات
  if (search) {
    query.$text = { $search: search };
  }

  // فیلتر بر اساس قیمت
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    products,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalProducts: total
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error("محصول مورد نظر یافت نشد");
  }

  res.json(product);
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    images,
    category,
    stock,
    features,
    specifications,
    isBestSeller,
    isNew,
    discount,
    tags
  } = req.body;

  const product = await Product.create({
    title,
    description,
    price,
    images,
    category,
    stock,
    features,
    specifications,
    isBestSeller,
    isNew,
    discount,
    tags
  });

  res.status(201).json(product);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("محصول مورد نظر یافت نشد");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedProduct);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("محصول مورد نظر یافت نشد");
  }

  await product.deleteOne();
  res.json({ message: "محصول با موفقیت حذف شد" });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .sort('-salesCount')
    .limit(8);
  res.json(products);
});

// @desc    Get new products
// @route   GET /api/products/new
// @access  Public
const getNewProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isNew: true })
    .sort('-createdAt')
    .limit(8);
  res.json(products);
});

// @desc    Update product sales count
// @route   PUT /api/products/:id/sales
// @access  Private
const updateSalesCount = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  
  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("تعداد فروش باید بیشتر از صفر باشد");
  }

  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error("محصول مورد نظر یافت نشد");
  }

  product.salesCount += quantity;
  await product.save();

  res.json(product);
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBestSellers,
  getNewProducts,
  updateSalesCount
};
