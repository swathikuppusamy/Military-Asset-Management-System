const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router
  .route('/')
  .get(restrictTo('admin'), getAllUsers)
  .post(restrictTo('admin'), createUser);

router
  .route('/:id')
  .get(restrictTo('admin'), getUserById)
  .put(restrictTo('admin'), updateUser)
  .delete(restrictTo('admin'), deleteUser);

// New route for toggling user status
router
  .route('/:id/toggle-status')
  .patch(restrictTo('admin'), toggleUserStatus);

module.exports = router;