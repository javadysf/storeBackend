const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// تولید توکن JWT
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

// ثبت نام کاربر جدید
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // بررسی وجود تمام فیلدهای الزامی
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "لطفاً تمام فیلدهای الزامی را پر کنید",
        required: { name: !name, email: !email, password: !password }
      });
    }

    // بررسی وجود کاربر با این ایمیل
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "این ایمیل قبلاً ثبت شده است" });
    }

    // بررسی اتصال به دیتابیس
    if (!mongoose.connection.readyState) {
      throw new Error("Database connection is not established");
    }

    // ایجاد کاربر جدید
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address
    });

    // تولید توکن
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token
    });
  } catch (error) {
    console.error("Register Error:", error);
    
    // خطاهای مونگو
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "خطا در اعتبارسنجی داده‌ها",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ 
        message: "این ایمیل قبلاً ثبت شده است"
      });
    }

    // خطاهای اتصال به دیتابیس
    if (error.name === 'MongooseError') {
      return res.status(500).json({ 
        message: "خطا در اتصال به پایگاه داده",
        error: error.message
      });
    }

    res.status(500).json({ 
      message: "خطا در ثبت نام",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ورود کاربر
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // بررسی وجود کاربر
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "ایمیل یا رمز عبور اشتباه است" });
    }

    // بررسی رمز عبور
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "ایمیل یا رمز عبور اشتباه است" });
    }

    // تولید توکن
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: "خطا در ورود", error: error.message });
  }
};

// دریافت اطلاعات کاربر
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت اطلاعات", error: error.message });
  }
};

// ایجاد کاربر ادمین
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // بررسی وجود تمام فیلدهای الزامی
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "لطفاً تمام فیلدهای الزامی را پر کنید",
        required: { name: !name, email: !email, password: !password }
      });
    }

    // بررسی وجود کاربر با این ایمیل
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "این ایمیل قبلاً ثبت شده است" });
    }

    // ایجاد کاربر ادمین جدید
    const admin = await User.create({
      name,
      email,
      password,
      role: "admin" // تنظیم نقش به عنوان ادمین
    });

    // تولید توکن
    const token = generateToken(admin._id);

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token
    });
  } catch (error) {
    console.error("Create Admin Error:", error);
    res.status(500).json({ 
      message: "خطا در ایجاد کاربر ادمین",
      error: error.message 
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  createAdmin
}; 