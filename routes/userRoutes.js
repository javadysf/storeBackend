const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// مسیرهای محافظت شده
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/orders', getUserOrders);
router.get('/reviews', getUserReviews);
router.get('/likes', getUserLikes);

// مسیرهای مدیریت کاربران فقط برای ادمین
router.get('/admin', getAllUsers);
router.delete('/admin/:id', deleteUser);
router.put('/admin/:id', updateUserByAdmin);
router.put('/admin/:id/status', changeUserStatus);
router.put('/admin/:id/role', changeUserRole);
router.post('/admin', createUserByAdmin);

router.get('/dashboard/stats', getDashboardStats);

module.exports = router; 