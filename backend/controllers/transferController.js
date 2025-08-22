const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');
const Base = require('../models/Base');
const logger = require('../utils/logger');

exports.getAllTransfers = async (req, res) => {
  try {
    const { status, base, fromBase, toBase, assetType, startDate, endDate } = req.query;
    let filter = {};

    // Apply role-based filtering
    if (req.user.role !== 'admin') {
      filter.$or = [
        { fromBase: req.user.base._id },
        { toBase: req.user.base._id }
      ];
    } else {
      // Admin can filter by specific bases
      if (fromBase || toBase) {
        const baseFilters = [];
        if (fromBase) baseFilters.push({ fromBase: fromBase });
        if (toBase) baseFilters.push({ toBase: toBase });
        
        if (baseFilters.length > 0) {
          if (filter.$or) {
            // Combine with existing role-based filter
            filter.$and = [
              { $or: filter.$or },
              { $or: baseFilters }
            ];
            delete filter.$or;
          } else {
            filter.$or = baseFilters;
          }
        }
      } else if (base) {
        // Legacy base filter support
        filter.$or = [
          { fromBase: base },
          { toBase: base }
        ];
      }
    }

    // Status filter
    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to endDate to include the entire end date
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        filter.createdAt.$lt = endDateObj;
      }
    }

    console.log('Transfer filter:', JSON.stringify(filter, null, 2));

    let query = Transfer.find(filter)
      .populate({
        path: 'asset',
        populate: {
          path: 'type',
          model: 'AssetType'
        }
      })
      .populate('fromBase')
      .populate('toBase')
      .populate('initiatedBy')
      .populate('approvedBy')
      .sort({ createdAt: -1 });

    const transfers = await query;

    // Filter by asset type if specified (post-query filtering since it's nested)
    let filteredTransfers = transfers;
    if (assetType) {
      filteredTransfers = transfers.filter(transfer => {
        return transfer.asset && 
               transfer.asset.type && 
               transfer.asset.type._id.toString() === assetType;
      });
    }

    console.log(`Found ${filteredTransfers.length} transfers matching criteria`);

    res.status(200).json({
      status: 'success',
      results: filteredTransfers.length,
      data: {
        transfers: filteredTransfers,
      },
    });
  } catch (error) {
    console.error('Get all transfers error:', error);
    logger.error(`Get all transfers error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate({
        path: 'asset',
        populate: {
          path: 'type',
          model: 'AssetType'
        }
      })
      .populate('fromBase')
      .populate('toBase')
      .populate('initiatedBy')
      .populate('approvedBy');

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found',
      });
    }

    // Check if user has access to this transfer
    if (req.user.role !== 'admin' && 
        !transfer.fromBase._id.equals(req.user.base._id) && 
        !transfer.toBase._id.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this transfer',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        transfer,
      },
    });
  } catch (error) {
    logger.error(`Get transfer error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.createTransfer = async (req, res) => {
  try {
    const { asset, quantity, toBase, notes, priority } = req.body;

    console.log('Received transfer data:', req.body);

    // Validate required fields
    if (!asset || !quantity || !toBase) {
      return res.status(400).json({
        status: 'error',
        message: 'Asset, quantity, and destination base are required',
      });
    }

    // Verify asset exists
    const assetDoc = await Asset.findById(asset).populate('base').populate('type');
    if (!assetDoc) {
      return res.status(400).json({
        status: 'error',
        message: 'Asset not found',
      });
    }

    console.log('Asset found:', assetDoc);

    // Check if user has access to the asset
    if (req.user.role !== 'admin' && !assetDoc.base._id.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to transfer this asset',
      });
    }

    // Check if quantity is available
    if (assetDoc.currentQuantity < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient quantity available for transfer. Available: ${assetDoc.currentQuantity}, Requested: ${quantity}`,
      });
    }

    // Verify target base exists
    const targetBase = await Base.findById(toBase);
    if (!targetBase) {
      return res.status(400).json({
        status: 'error',
        message: 'Target base not found',
      });
    }

    // Check if transferring to same base
    if (assetDoc.base._id.equals(toBase)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot transfer to the same base',
      });
    }

    // Generate transfer ID
    const transferId = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newTransfer = await Transfer.create({
      transferId,
      asset,
      quantity: parseInt(quantity),
      fromBase: assetDoc.base._id,
      toBase,
      initiatedBy: req.user._id,
      notes,
      priority,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    // Use modern populate syntax
    await newTransfer.populate([
      { 
        path: 'asset',
        populate: {
          path: 'type',
          model: 'AssetType'
        }
      },
      { path: 'fromBase' },
      { path: 'toBase' },
      { path: 'initiatedBy' }
    ]);

    console.log('Transfer created:', newTransfer);

    res.status(201).json({
      status: 'success',
      data: {
        transfer: newTransfer,
      },
    });
  } catch (error) {
    console.error('Create transfer error:', error);
    logger.error(`Create transfer error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      details: error.message
    });
  }
};

exports.approveTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate({
        path: 'asset',
        populate: {
          path: 'type',
          model: 'AssetType'
        }
      })
      .populate('fromBase')
      .populate('toBase');

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found',
      });
    }

    // Check if user has permission to approve
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to approve transfers',
      });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Transfer is not in pending status',
      });
    }

    // Check if asset still has sufficient quantity
    if (transfer.asset.currentQuantity < transfer.quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient quantity available for transfer',
      });
    }

    // Update asset quantity
    transfer.asset.currentQuantity -= transfer.quantity;
    await transfer.asset.save();

    // Create or update asset at target base
    let targetAsset = await Asset.findOne({
      type: transfer.asset.type,
      base: transfer.toBase
    });

    if (targetAsset) {
      targetAsset.currentQuantity += transfer.quantity;
      await targetAsset.save();
    } else {
      // Create new asset at target base
      targetAsset = await Asset.create({
        assetId: `AST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: transfer.asset.type,
        base: transfer.toBase,
        currentQuantity: transfer.quantity,
        openingBalance: transfer.quantity,
        purchaseDate: transfer.asset.purchaseDate,
        cost: transfer.asset.cost,
        specifications: transfer.asset.specifications,
        status: 'available'
      });
    }

    // Update transfer status
    transfer.status = 'completed';
    transfer.approvedBy = req.user._id;
    transfer.transferDate = new Date();
    await transfer.save();

    // Use modern populate syntax
    await transfer.populate([
      { 
        path: 'asset',
        populate: {
          path: 'type',
          model: 'AssetType'
        }
      },
      { path: 'fromBase' },
      { path: 'toBase' },
      { path: 'initiatedBy' },
      { path: 'approvedBy' }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        transfer,
      },
    });
  } catch (error) {
    logger.error(`Approve transfer error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.rejectTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found',
      });
    }

    // Check if user has permission to reject
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to reject transfers',
      });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Transfer is not in pending status',
      });
    }

    transfer.status = 'rejected';
    transfer.approvedBy = req.user._id;
    await transfer.save();

    // Use modern populate syntax
    await transfer.populate([
      { 
        path: 'asset',
        populate: {
          path: 'type',
          model: 'AssetType'
        }
      },
      { path: 'fromBase' },
      { path: 'toBase' },
      { path: 'initiatedBy' },
      { path: 'approvedBy' }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        transfer,
      },
    });
  } catch (error) {
    logger.error(`Reject transfer error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// NEW: Cancel Transfer Method
exports.cancelTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found',
      });
    }

    // Check if user has permission to cancel
    // Users can cancel their own pending transfers, or admins can cancel any pending transfer
    if (req.user.role !== 'admin' && !transfer.initiatedBy.equals(req.user._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to cancel this transfer',
      });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Only pending transfers can be cancelled',
      });
    }

    transfer.status = 'cancelled';
    await transfer.save();

    // Use modern populate syntax
    await transfer.populate([
      { 
        path: 'asset',
        populate: {
          path: 'type',
          model: 'AssetType'
        }
      },
      { path: 'fromBase' },
      { path: 'toBase' },
      { path: 'initiatedBy' },
      { path: 'approvedBy' }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        transfer,
      },
    });
  } catch (error) {
    logger.error(`Cancel transfer error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};