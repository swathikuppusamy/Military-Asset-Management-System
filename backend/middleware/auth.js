const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.protect = catchAsync(async (req, res, next) => {
  
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

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).populate('base');
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact administrator.', 401));
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

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
  
  if (req.body.base && req.user.base && req.body.base.toString() !== req.user.base._id.toString()) {
    return next(new AppError('You can only access resources from your assigned base', 403));
  }
  
  next();
};