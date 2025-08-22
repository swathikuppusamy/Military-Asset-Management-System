const Asset = require('../models/Asset');
const Purchase = require('../models/Purchase');
const Transfer = require('../models/Transfer');
const Assignment = require('../models/Assignment');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const { startDate, endDate, base, assetType } = req.query;
    let filter = {};
    let dateFilter = {};

    // Apply role-based filtering
    if (req.user.role !== 'admin') {
      filter.base = req.user.base._id;
    } else if (base && base.trim() !== '') {
      // Validate base ObjectId before using it
      if (mongoose.Types.ObjectId.isValid(base)) {
        filter.base = base;
      } else {
        logger.warn(`Invalid base ObjectId received: ${base}`);
        // Skip invalid base filter or return error
        return res.status(400).json({
          status: 'error',
          message: 'Invalid base ID provided'
        });
      }
    }

    // Validate assetType ObjectId before using it
    if (assetType && assetType.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(assetType)) {
        filter.type = assetType;
      } else {
        logger.warn(`Invalid assetType ObjectId received: ${assetType}`);
        // Skip invalid assetType filter or return error
        return res.status(400).json({
          status: 'error',
          message: 'Invalid asset type ID provided'
        });
      }
    }

    // Date filtering
    if (startDate || endDate) {
      dateFilter = {
        createdAt: {}
      };
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    console.log('Dashboard metrics filter:', filter); // Debug log

    // Get assets with current quantities
    const assets = await Asset.find(filter)
      .populate('type')
      .populate('base');

    // Calculate opening and closing balances
    let openingBalance = 0;
    let closingBalance = 0;

    assets.forEach(asset => {
      openingBalance += asset.openingBalance;
      closingBalance += asset.currentQuantity;
    });

    // Get purchases within date range
    const purchaseFilter = { ...filter };
    if (startDate || endDate) {
      purchaseFilter.purchaseDate = {};
      if (startDate) purchaseFilter.purchaseDate.$gte = new Date(startDate);
      if (endDate) purchaseFilter.purchaseDate.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(purchaseFilter);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);

    // Get transfers - Apply same ObjectId validation
    let transferFilter = {};
    if (req.user.role !== 'admin') {
      transferFilter.$or = [
        { fromBase: req.user.base._id },
        { toBase: req.user.base._id }
      ];
    } else if (base && base.trim() !== '' && mongoose.Types.ObjectId.isValid(base)) {
      transferFilter.$or = [
        { fromBase: base },
        { toBase: base }
      ];
    }

    if (startDate || endDate) {
      transferFilter.transferDate = {};
      if (startDate) transferFilter.transferDate.$gte = new Date(startDate);
      if (endDate) transferFilter.transferDate.$lte = new Date(endDate);
    }

    const transfers = await Transfer.find(transferFilter)
      .populate('fromBase')
      .populate('toBase');

    let transfersIn = 0;
    let transfersOut = 0;

    transfers.forEach(transfer => {
      if (req.user.role !== 'admin') {
        if (transfer.toBase._id.equals(req.user.base._id)) {
          transfersIn += transfer.quantity;
        } else if (transfer.fromBase._id.equals(req.user.base._id)) {
          transfersOut += transfer.quantity;
        }
      } else if (base && mongoose.Types.ObjectId.isValid(base)) {
        if (transfer.toBase._id.equals(base)) {
          transfersIn += transfer.quantity;
        } else if (transfer.fromBase._id.equals(base)) {
          transfersOut += transfer.quantity;
        }
      } else {
        // For admin without base filter, we need a different approach
        // This is a simplified version
        transfersIn += transfer.quantity;
      }
    });

    // Get assignments - Apply same ObjectId validation
    const assignmentFilter = { ...filter };
    if (startDate || endDate) {
      assignmentFilter.assignmentDate = {};
      if (startDate) assignmentFilter.assignmentDate.$gte = new Date(startDate);
      if (endDate) assignmentFilter.assignmentDate.$lte = new Date(endDate);
    }

    const assignments = await Assignment.find(assignmentFilter);
    const totalAssigned = assignments.reduce((sum, assignment) => sum + assignment.quantity, 0);

    // Calculate net movement
    const netMovement = totalPurchases + transfersIn - transfersOut;

    res.status(200).json({
      status: 'success',
      data: {
        openingBalance,
        closingBalance,
        netMovement,
        assigned: totalAssigned,
        movementDetails: {
          purchased: totalPurchases,
          transfersIn,
          transfersOut
        }
      }
    });
  } catch (error) {
    logger.error(`Get dashboard metrics error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getNetMovementDetails = async (req, res) => {
  try {
    const { startDate, endDate, base } = req.query;
    let filter = {};

    // Apply role-based filtering with ObjectId validation
    if (req.user.role !== 'admin') {
      filter.base = req.user.base._id;
    } else if (base && base.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(base)) {
        filter.base = base;
      } else {
        logger.warn(`Invalid base ObjectId received: ${base}`);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid base ID provided'
        });
      }
    }

    // Date filtering for purchases
    let purchaseDateFilter = {};
    if (startDate || endDate) {
      purchaseDateFilter.purchaseDate = {};
      if (startDate) purchaseDateFilter.purchaseDate.$gte = new Date(startDate);
      if (endDate) purchaseDateFilter.purchaseDate.$lte = new Date(endDate);
    }

    // Get purchases with details
    const purchases = await Purchase.find({ ...filter, ...purchaseDateFilter })
      .populate('assetType')
      .populate('base')
      .sort({ purchaseDate: -1 });

    // Get transfers with details - Apply same ObjectId validation
    let transferFilter = {};
    if (req.user.role !== 'admin') {
      transferFilter.$or = [
        { fromBase: req.user.base._id },
        { toBase: req.user.base._id }
      ];
    } else if (base && base.trim() !== '' && mongoose.Types.ObjectId.isValid(base)) {
      transferFilter.$or = [
        { fromBase: base },
        { toBase: base }
      ];
    }

    if (startDate || endDate) {
      transferFilter.transferDate = {};
      if (startDate) transferFilter.transferDate.$gte = new Date(startDate);
      if (endDate) transferFilter.transferDate.$lte = new Date(endDate);
    }

    const transfers = await Transfer.find(transferFilter)
      .populate('asset')
      .populate('fromBase')
      .populate('toBase')
      .sort({ transferDate: -1 });

    // Separate transfers in and out
    const transfersIn = transfers.filter(transfer => {
      if (req.user.role !== 'admin') {
        return transfer.toBase._id.equals(req.user.base._id);
      } else if (base && mongoose.Types.ObjectId.isValid(base)) {
        return transfer.toBase._id.equals(base);
      }
      return true;
    });

    const transfersOut = transfers.filter(transfer => {
      if (req.user.role !== 'admin') {
        return transfer.fromBase._id.equals(req.user.base._id);
      } else if (base && mongoose.Types.ObjectId.isValid(base)) {
        return transfer.fromBase._id.equals(base);
      }
      return true;
    });

    res.status(200).json({
      status: 'success',
      data: {
        purchases,
        transfersIn,
        transfersOut
      },
    });
  } catch (error) {
    logger.error(`Get net movement details error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
exports.getChartsData = async (req, res) => {
  try {
    const { startDate, endDate, base, assetType } = req.query;
    let filter = {};

    // Apply role-based filtering
    if (req.user.role !== 'admin') {
      filter.base = req.user.base._id;
    } else if (base && base.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(base)) {
        filter.base = new mongoose.Types.ObjectId(base);
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid base ID provided'
        });
      }
    }

    // Validate assetType ObjectId
    if (assetType && assetType.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(assetType)) {
        filter.type = new mongoose.Types.ObjectId(assetType);
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid asset type ID provided'
        });
      }
    }

    console.log('Charts filter:', filter); // Debug log

    // 1. Asset Distribution by Type
    const assetDistribution = await Asset.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          totalQuantity: { $sum: '$currentQuantity' }
        }
      },
      {
        $lookup: {
          from: 'assettypes',
          localField: '_id',
          foreignField: '_id',
          as: 'assetType'
        }
      },
      { $unwind: '$assetType' },
      {
        $project: {
          name: '$assetType.name',
          value: '$totalQuantity'
        }
      }
    ]);

    // 2. Monthly Movement Data
    const start = new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = new Date(endDate || Date.now());

    // Get purchases
    const purchaseFilter = { ...filter };
    purchaseFilter.purchaseDate = { $gte: start, $lte: end };

    const purchasesByMonth = await Purchase.aggregate([
      { $match: purchaseFilter },
      {
        $group: {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' }
          },
          purchases: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get transfers - Fixed the aggregation pipeline
    let transferFilter = {};
    let userBaseId = null;
    let selectedBaseId = null;

    if (req.user.role !== 'admin') {
      userBaseId = req.user.base._id;
      transferFilter.$or = [
        { fromBase: userBaseId },
        { toBase: userBaseId }
      ];
    } else if (base && mongoose.Types.ObjectId.isValid(base)) {
      selectedBaseId = new mongoose.Types.ObjectId(base);
      transferFilter.$or = [
        { fromBase: selectedBaseId },
        { toBase: selectedBaseId }
      ];
    }
    transferFilter.transferDate = { $gte: start, $lte: end };

    const transfersByMonth = await Transfer.aggregate([
      { $match: transferFilter },
      {
        $group: {
          _id: {
            year: { $year: '$transferDate' },
            month: { $month: '$transferDate' }
          },
          transfers: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 1,
          transfersIn: {
            $sum: {
              $map: {
                input: '$transfers',
                as: 'transfer',
                in: {
                  $cond: [
                    {
                      $eq: [
                        '$$transfer.toBase',
                        req.user.role !== 'admin' ? userBaseId : selectedBaseId
                      ]
                    },
                    '$$transfer.quantity',
                    0
                  ]
                }
              }
            }
          },
          transfersOut: {
            $sum: {
              $map: {
                input: '$transfers',
                as: 'transfer',
                in: {
                  $cond: [
                    {
                      $eq: [
                        '$$transfer.fromBase',
                        req.user.role !== 'admin' ? userBaseId : selectedBaseId
                      ]
                    },
                    '$$transfer.quantity',
                    0
                  ]
                }
              }
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Create a complete monthly data set by merging purchase and transfer data
    const monthlyMovementMap = new Map();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Add purchase data
    purchasesByMonth.forEach(purchase => {
      const key = `${purchase._id.year}-${purchase._id.month}`;
      const monthLabel = `${monthNames[purchase._id.month - 1]} ${purchase._id.year}`;
      monthlyMovementMap.set(key, {
        month: monthLabel,
        purchases: purchase.purchases || 0,
        transfersIn: 0,
        transfersOut: 0
      });
    });

    // Add transfer data
    transfersByMonth.forEach(transfer => {
      const key = `${transfer._id.year}-${transfer._id.month}`;
      const monthLabel = `${monthNames[transfer._id.month - 1]} ${transfer._id.year}`;
      
      if (monthlyMovementMap.has(key)) {
        const existing = monthlyMovementMap.get(key);
        existing.transfersIn = transfer.transfersIn || 0;
        existing.transfersOut = transfer.transfersOut || 0;
      } else {
        monthlyMovementMap.set(key, {
          month: monthLabel,
          purchases: 0,
          transfersIn: transfer.transfersIn || 0,
          transfersOut: transfer.transfersOut || 0
        });
      }
    });

    // Convert map to sorted array
    const monthlyMovement = Array.from(monthlyMovementMap.values())
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split(' ');
        const [monthB, yearB] = b.month.split(' ');
        const yearDiff = parseInt(yearA) - parseInt(yearB);
        if (yearDiff !== 0) return yearDiff;
        return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
      });

    // 3. Status Distribution
    const statusDistribution = await Asset.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        assetDistribution,
        monthlyMovement,
        statusDistribution
      },
      filters: {
        startDate,
        endDate,
        base: base || '',
        assetType: assetType || ''
      }
    });

  } catch (error) {
    console.error('Charts data error details:', error);
    logger.error(`Get charts data error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch chart data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};