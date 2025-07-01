const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

// مسیرهای عمومی (نیاز به احراز هویت دارند)
router.route("/").post(protect, createOrder);
router.route("/myorders").get(protect, getMyOrders);
router.route("/:id").get(protect, getOrderById);

// مسیرهای ادمین
router.route("/").get(protect, admin, getAllOrders);
router.route("/:id/status").put(protect, admin, updateOrderStatus);
router.route("/:id/payment").put(protect, admin, updatePaymentStatus);

module.exports = router; 