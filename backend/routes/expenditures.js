// backend/routes/expenditures.js
const express = require('express');
const expenditureController = require('../controllers/expenditureController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router
  .route('/')
  .get(expenditureController.getAllExpenditures)
  .post(expenditureController.createExpenditure);

router.get('/stats', expenditureController.getExpenditureStats);

router
  .route('/:id')
  .get(expenditureController.getExpenditure)
  .patch(expenditureController.updateExpenditure)
  .delete(expenditureController.deleteExpenditure);

// Admin only routes
router.patch('/:id/approve', restrictTo('admin'), expenditureController.approveExpenditure);

module.exports = router;