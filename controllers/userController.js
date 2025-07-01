const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Like = require('../models/Like');
const asyncHandler = require('express-async-handler');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.birthDate = req.body.birthDate || user.birthDate;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      birthDate: updatedUser.birthDate,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }

  // دریافت تعداد سفارشات
  const ordersCount = await Order.countDocuments({ user: req.user._id });
  
  // دریافت تعداد نظرات
  const reviewsCount = await Review.countDocuments({ user: req.user._id });
  
  // دریافت تعداد لایک‌ها
  const likesCount = await Like.countDocuments({ user: req.user._id });

  res.json({
    ...user.toObject(),
    stats: {
      ordersCount,
      reviewsCount,
      likesCount,
    },
  });
});

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Order.countDocuments({ user: req.user._id });

  res.json({
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalOrders: total,
  });
});

// @desc    Get user reviews
// @route   GET /api/users/reviews
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const reviews = await Review.find({ user: req.user._id })
    .populate('product', 'title images')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Review.countDocuments({ user: req.user._id });

  res.json({
    reviews,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalReviews: total,
  });
});

// @desc    Get user liked products
// @route   GET /api/users/likes
// @access  Private
const getUserLikes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const likes = await Like.find({ user: req.user._id })
    .populate('product', 'title price images description')
    .sort('-createdAt')
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

// @desc    Get all users (admin)
// @route   GET /api/users/admin
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// @desc    Delete user (admin)
// @route   DELETE /api/users/admin/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }
  await user.deleteOne();
  res.json({ message: 'کاربر با موفقیت حذف شد' });
});

// @desc    Update user by admin
// @route   PUT /api/users/admin/:id
// @access  Private/Admin
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  user.address = req.body.address || user.address;
  user.birthDate = req.body.birthDate || user.birthDate;
  if (req.body.password) {
    user.password = req.body.password;
  }
  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    address: updatedUser.address,
    birthDate: updatedUser.birthDate,
    role: updatedUser.role,
    isActive: updatedUser.isActive
  });
});

// @desc    Change user status (active, inactive, banned)
// @route   PUT /api/users/admin/:id/status
// @access  Private/Admin
const changeUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }
  user.isActive = req.body.isActive;
  await user.save();
  res.json({ message: 'وضعیت کاربر با موفقیت تغییر کرد', isActive: user.isActive });
});

// @desc    Change user role (admin, user)
// @route   PUT /api/users/admin/:id/role
// @access  Private/Admin
const changeUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('کاربر یافت نشد');
  }
  user.role = req.body.role;
  await user.save();
  res.json({ message: 'نقش کاربر با موفقیت تغییر کرد', role: user.role });
});

// @desc    Create user by admin
// @route   POST /api/users/admin
// @access  Private/Admin
const createUserByAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, birthDate, role, isActive } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('نام، ایمیل و رمز عبور الزامی است');
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('کاربری با این ایمیل وجود دارد');
  }
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    birthDate,
    role: role || 'user',
    isActive: typeof isActive === 'boolean' ? isActive : true
  });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    birthDate: user.birthDate,
    role: user.role,
    isActive: user.isActive
  });
});

// @desc    Get dashboard stats (admin)
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, totalRevenue] = await Promise.all([
    User.countDocuments(),
    require('../models/Product').countDocuments(),
    require('../models/Order').countDocuments(),
    require('../models/Order').aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]).then(res => res[0]?.total || 0)
  ]);
  res.json({ totalUsers, totalProducts, totalOrders, totalRevenue });
});

module.exports = {
  updateUserProfile,
  getUserProfile,
  getUserOrders,
  getUserReviews,
  getUserLikes,
  getAllUsers,
  deleteUser,
  updateUserByAdmin,
  changeUserStatus,
  changeUserRole,
  createUserByAdmin,
  getDashboardStats
}; 