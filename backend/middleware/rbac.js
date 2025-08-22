exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

exports.checkBaseAccess = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }

  const requestedBaseId = req.params.baseId || req.body.base;
  
  if (requestedBaseId && !requestedBaseId.equals(req.user.base._id)) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have permission to access this base data',
    });
  }

  next();
};