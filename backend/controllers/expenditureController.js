const Expenditure = require('../models/Expenditure');
const Asset = require('../models/Asset');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllExpenditures = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, asset, base, reason, startDate, endDate, approved } = req.query;
  
  let filter = {};
  
  if (asset) filter.asset = asset;
  if (base) filter.base = base;
  if (reason) filter.reason = reason;
  if (approved !== undefined) filter.approved = approved === 'true';
  
  if (startDate || endDate) {
    filter.expendedDate = {};
    if (startDate) filter.expendedDate.$gte = new Date(startDate);
    if (endDate) filter.expendedDate.$lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const expenditures = await Expenditure.find(filter)
    .populate({
      path: 'asset',
      select: 'name assetId serialNumber currentQuantity',
      populate: {
        path: 'type',
        select: 'name category unit'
      }
    })
    .populate('base', 'name code location')
    .populate('expendedBy', 'name username email rank')
    .populate('approvedBy', 'name username email')
    .sort({ expendedDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Expenditure.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: expenditures.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    data: expenditures
  });
});

exports.getExpenditure = catchAsync(async (req, res, next) => {
  const expenditure = await Expenditure.findById(req.params.id)
    .populate({
      path: 'asset',
      select: 'name assetId serialNumber currentQuantity',
      populate: {
        path: 'type',
        select: 'name category unit'
      }
    })
    .populate('base', 'name code location')
    .populate('expendedBy', 'name username email rank')
    .populate('approvedBy', 'name username email');
  
  if (!expenditure) {
    return next(new AppError('No expenditure found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: expenditure
  });
});

exports.createExpenditure = catchAsync(async (req, res, next) => {
  const { asset, quantity } = req.body;
  
  const assetDoc = await Asset.findById(asset);
  if (!assetDoc) {
    return next(new AppError('Asset not found', 404));
  }
  
  if (assetDoc.currentQuantity < quantity) {
    return next(new AppError('Insufficient asset quantity available', 400));
  }
  
  // Create expenditure
  const expenditure = await Expenditure.create({
    ...req.body,
    expendedBy: req.user.id
  });
  
  // Update asset quantity
  assetDoc.currentQuantity -= quantity;
  await assetDoc.save();
  
  await expenditure.populate([
    { 
      path: 'asset',
      select: 'name assetId serialNumber currentQuantity',
      populate: {
        path: 'type',
        select: 'name category unit'
      }
    },
    { path: 'base', select: 'name code location' },
    { path: 'expendedBy', select: 'name username email rank' }
  ]);
  
  res.status(201).json({
    status: 'success',
    data: expenditure
  });
});

// Update expenditure
exports.updateExpenditure = catchAsync(async (req, res, next) => {
  const expenditure = await Expenditure.findById(req.params.id);
  
  if (!expenditure) {
    return next(new AppError('No expenditure found with that ID', 404));
  }
  
  if (expenditure.approved && req.user.role !== 'admin') {
    return next(new AppError('Cannot update approved expenditure', 403));
  }
  
  const updatedExpenditure = await Expenditure.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate([
    { 
      path: 'asset',
      select: 'name assetId serialNumber currentQuantity',
      populate: {
        path: 'type',
        select: 'name category unit'
      }
    },
    { path: 'base', select: 'name code location' },
    { path: 'expendedBy', select: 'name username email rank' },
    { path: 'approvedBy', select: 'name username email' }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: updatedExpenditure
  });
});

// Approve expenditure
exports.approveExpenditure = catchAsync(async (req, res, next) => {
  const expenditure = await Expenditure.findByIdAndUpdate(
    req.params.id,
    {
      approved: true,
      approvedBy: req.user.id,
      approvedDate: new Date()
    },
    { new: true, runValidators: true }
  ).populate([
    { 
      path: 'asset',
      select: 'name assetId serialNumber currentQuantity',
      populate: {
        path: 'type',
        select: 'name category unit'
      }
    },
    { path: 'base', select: 'name code location' },
    { path: 'expendedBy', select: 'name username email rank' },
    { path: 'approvedBy', select: 'name username email' }
  ]);
  
  if (!expenditure) {
    return next(new AppError('No expenditure found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: expenditure
  });
});

// Delete expenditure
exports.deleteExpenditure = catchAsync(async (req, res, next) => {
  const expenditure = await Expenditure.findById(req.params.id);
  
  if (!expenditure) {
    return next(new AppError('No expenditure found with that ID', 404));
  }
  
  if (expenditure.approved && req.user.role !== 'admin') {
    return next(new AppError('Cannot delete approved expenditure', 403));
  }
  
  const asset = await Asset.findById(expenditure.asset);
  if (asset) {
    asset.currentQuantity += expenditure.quantity;
    await asset.save();
  }
  
  await Expenditure.findByIdAndDelete(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getExpenditureStats = catchAsync(async (req, res, next) => {
  const stats = await Expenditure.aggregate([
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  const monthlyStats = await Expenditure.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$expendedDate' },
          month: { $month: '$expendedDate' }
        },
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }
    },
    {
      $limit: 12
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      byReason: stats,
      monthly: monthlyStats
    }
  });
});