const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "نام کاربر الزامی است"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "ایمیل الزامی است"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "لطفا یک ایمیل معتبر وارد کنید"]
  },
  password: {
    type: String,
    required: [true, "رمز عبور الزامی است"],
    minlength: [6, "رمز عبور باید حداقل ۶ کاراکتر باشد"]
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

// رمزنگاری رمز عبور قبل از ذخیره
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// متد مقایسه رمز عبور
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema); 