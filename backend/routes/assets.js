const express = require('express');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const {
  getAllAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset
} = require('../controllers/assetController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAllAssets)
  .post(restrictTo('admin', 'logistics'), createAsset);

router
  .route('/:id')
  .get(getAsset)
  .put(updateAsset)  // Changed from .patch() to .put()
  .patch(updateAsset) // Keep both for compatibility
  .delete(restrictTo('admin'), deleteAsset);

module.exports = router;