// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).populate('base');
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact administrator.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array like ['admin', 'commander']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Additional middleware for specific role checks
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

exports.requireCommanderOrAdmin = (req, res, next) => {
  if (!['admin', 'commander'].includes(req.user.role)) {
    return next(new AppError('Commander or Admin access required', 403));
  }
  next();
};

exports.requireSameBaseOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Check if the user belongs to the same base as the resource
  // This would need to be customized based on your specific use case
  if (req.body.base && req.user.base && req.body.base.toString() !== req.user.base._id.toString()) {
    return next(new AppError('You can only access resources from your assigned base', 403));
  }
  
  next();
};