const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getDashboardMetrics,
  getNetMovementDetails,
  getChartsData // Add this import
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect);

router
  .route('/metrics')
  .get(getDashboardMetrics);

router
  .route('/net-movement')
  .get(getNetMovementDetails);

// Update this route to use the controller function
router
  .route('/charts')
  .get(getChartsData);

module.exports = router;