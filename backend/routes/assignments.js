const express = require('express');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const {
  getAllAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  returnAssignment,
  expendAssignment
} = require('../controllers/assignmentController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAllAssignments)
  .post(restrictTo('admin', 'commander'), createAssignment);

router
  .route('/:id')
  .get(getAssignment)
  .patch(restrictTo('admin', 'commander'), updateAssignment);

router
  .route('/:id/return')
  .patch(restrictTo('admin', 'commander'), returnAssignment);

router
  .route('/:id/expend')
  .patch(restrictTo('admin', 'commander'), expendAssignment);

module.exports = router;