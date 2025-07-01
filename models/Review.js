const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product"
  },
  rating: {
    type: Number,
    required: [true, "امتیاز الزامی است"],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, "عنوان نظر الزامی است"],
    trim: true,
    maxlength: [100, "عنوان نظر نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"]
  },
  comment: {
    type: String,
    required: [true, "متن نظر الزامی است"],
    trim: true,
    maxlength: [1000, "متن نظر نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد"]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// جلوگیری از ثبت نظر تکراری برای یک محصول توسط یک کاربر
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// به‌روزرسانی امتیاز محصول پس از ثبت یا حذف نظر
reviewSchema.post("save", async function() {
  await this.constructor.calculateProductRating(this.product);
});

reviewSchema.post("remove", async function() {
  await this.constructor.calculateProductRating(this.product);
});

// متد محاسبه میانگین امتیاز محصول
reviewSchema.statics.calculateProductRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, isApproved: true }
    },
    {
      $group: {
        _id: "$product",
        ratingCount: { $sum: 1 },
        ratingAverage: { $avg: "$rating" }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      rating: {
        rate: Math.round(stats[0].ratingAverage * 10) / 10,
        count: stats[0].ratingCount
      }
    });
  } else {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      rating: { rate: 0, count: 0 }
    });
  }
};

module.exports = mongoose.model("Review", reviewSchema); 