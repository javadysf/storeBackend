const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "عنوان محصول الزامی است"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "توضیحات محصول الزامی است"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "قیمت محصول الزامی است"],
    min: [0, "قیمت نمی‌تواند منفی باشد"]
  },
  images: [{
    type: String,
    required: [true, "حداقل یک تصویر برای محصول الزامی است"]
  }],
  category: {
    type: String,
    required: [true, "دسته‌بندی محصول الزامی است"],
    trim: true
  },
  stock: {
    type: Number,
    required: [true, "موجودی محصول الزامی است"],
    min: [0, "موجودی نمی‌تواند منفی باشد"],
    default: 0
  },
  salesCount: {
    type: Number,
    min: 0,
    default: 0
  },
  rating: {
    rate: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: Map,
    of: String
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: true
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// محاسبه قیمت با تخفیف
productSchema.virtual('finalPrice').get(function() {
  return this.price * (1 - this.discount / 100);
});

// ایندکس‌گذاری برای جستجو
productSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });

module.exports = mongoose.model("Product", productSchema);