const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    ایجاد سفارش جدید
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("سفارش باید حداقل یک محصول داشته باشد");
  }

  // بررسی موجودی محصولات و محاسبه قیمت کل
  let totalPrice = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`محصول با شناسه ${item.product} یافت نشد`);
    }
    if (product.countInStock < item.quantity) {
      res.status(400);
      throw new Error(`موجودی محصول ${product.title} کافی نیست`);
    }
    totalPrice += product.price * item.quantity;
  }

  const order = await Order.create({
    user: req.user._id,
    items: items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
    })),
    totalPrice,
    shippingAddress,
    paymentMethod,
    notes,
  });

  // کاهش موجودی محصولات
  for (const item of items) {
    const product = await Product.findById(item.product);
    product.countInStock -= item.quantity;
    await product.save();
  }

  res.status(201).json(order);
});

// @desc    دریافت سفارشات کاربر
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "title images price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ user: req.user._id });

  res.json({
    orders,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    دریافت جزئیات یک سفارش
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  ).populate("items.product", "title images price");

  if (!order) {
    res.status(404);
    throw new Error("سفارش یافت نشد");
  }

  // بررسی دسترسی کاربر به سفارش
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("شما دسترسی به این سفارش ندارید");
  }

  res.json(order);
});

// @desc    به‌روزرسانی وضعیت سفارش
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("سفارش یافت نشد");
  }

  if (!["pending", "processing", "delivered", "cancelled"].includes(status)) {
    res.status(400);
    throw new Error("وضعیت سفارش نامعتبر است");
  }

  order.status = status;
  await order.save();

  res.json(order);
});

// @desc    به‌روزرسانی وضعیت پرداخت
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("سفارش یافت نشد");
  }

  if (!["pending", "completed", "failed"].includes(paymentStatus)) {
    res.status(400);
    throw new Error("وضعیت پرداخت نامعتبر است");
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  res.json(order);
});

// @desc    دریافت تمام سفارشات (برای ادمین)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const status = req.query.status;
  const query = status ? { status } : {};

  const orders = await Order.find(query)
    .populate("user", "name email")
    .populate("items.product", "title images price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  res.json({
    orders,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
}; 