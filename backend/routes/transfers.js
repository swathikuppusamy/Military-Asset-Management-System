const express = require('express');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const {
  getAllTransfers,
  getTransfer,
  createTransfer,
  approveTransfer,
  rejectTransfer,
  cancelTransfer  // Make sure this is exported from the controller
} = require('../controllers/transferController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /transfers and POST /transfers
router
  .route('/')
  .get(getAllTransfers)
  .post(restrictTo('admin', 'logistics'), createTransfer);

// GET /transfers/:id
router
  .route('/:id')
  .get(getTransfer);

// PATCH /transfers/:id/approve
router
  .route('/:id/approve')
  .patch(restrictTo('admin'), approveTransfer);

// PATCH /transfers/:id/reject
router
  .route('/:id/reject')
  .patch(restrictTo('admin'), rejectTransfer);

// PATCH /transfers/:id/cancel
router
  .route('/:id/cancel')
  .patch(cancelTransfer); // Users can cancel their own transfers

module.exports = router;