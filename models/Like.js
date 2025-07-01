const mongoose = require("mongoose");

const likeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
  },
  {
    timestamps: true,
  }
);

// ایجاد ایندکس برای جلوگیری از لایک تکراری
likeSchema.index({ user: 1, product: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

module.exports = Like; 