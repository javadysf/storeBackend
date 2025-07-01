const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["online", "cash"],
      default: "online",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    trackingCode: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// متد برای محاسبه قیمت کل سفارش
orderSchema.methods.calculateTotalPrice = function () {
  this.totalPrice = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  return this.totalPrice;
};

// متد برای بررسی وضعیت پرداخت
orderSchema.methods.isPaid = function () {
  return this.paymentStatus === "completed";
};

// متد برای بررسی وضعیت تحویل
orderSchema.methods.isDelivered = function () {
  return this.status === "delivered";
};

// متد برای لغو سفارش
orderSchema.methods.cancel = function () {
  if (this.status === "delivered") {
    throw new Error("سفارش تحویل داده شده قابل لغو نیست");
  }
  this.status = "cancelled";
  return this.save();
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order; 