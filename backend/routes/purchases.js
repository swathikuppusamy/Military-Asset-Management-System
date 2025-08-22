const express = require('express');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const {
  getAllPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase
} = require('../controllers/purchaseController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAllPurchases)
  .post(restrictTo('admin', 'logistics'), createPurchase);

router
  .route('/:id')
  .get(getPurchase)
  .put(restrictTo('admin', 'logistics'), updatePurchase) 
  .delete(restrictTo('admin'), deletePurchase);

module.exports = router;