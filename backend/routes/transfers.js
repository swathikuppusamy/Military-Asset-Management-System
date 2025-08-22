const express = require('express');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const {
  getAllTransfers,
  getTransfer,
  createTransfer,
  approveTransfer,
  rejectTransfer,
  cancelTransfer  
} = require('../controllers/transferController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAllTransfers)
  .post(restrictTo('admin', 'logistics'), createTransfer);

router
  .route('/:id')
  .get(getTransfer);

router
  .route('/:id/approve')
  .patch(restrictTo('admin'), approveTransfer);

router
  .route('/:id/reject')
  .patch(restrictTo('admin'), rejectTransfer);

router
  .route('/:id/cancel')
  .patch(cancelTransfer); 

module.exports = router;