const Purchase = require('../models/Purchase');
const Asset = require('../models/Asset');
const AssetType = require('../models/AssetType');
const Base = require('../models/Base');
const logger = require('../utils/logger');

exports.getAllPurchases = async (req, res) => {
  try {
    const { base, assetType, startDate, endDate } = req.query;
    let filter = {};

    // Apply role-based filtering
    if (req.user.role !== 'admin') {
      filter.base = req.user.base._id;
    } else if (base) {
      filter.base = base;
    }

    if (assetType) filter.assetType = assetType;

    // Date filtering
    if (startDate || endDate) {
      filter.purchaseDate = {};
      if (startDate) filter.purchaseDate.$gte = new Date(startDate);
      if (endDate) filter.purchaseDate.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(filter)
      .populate('assetType')
      .populate('base')
      .populate('purchasedBy')
      .sort({ purchaseDate: -1 });

    res.status(200).json({
      status: 'success',
      results: purchases.length,
      data: {
        purchases,
      },
    });
  } catch (error) {
    logger.error(`Get all purchases error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('assetType')
      .populate('base')
      .populate('purchasedBy');

    if (!purchase) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase not found',
      });
    }

    if (req.user.role !== 'admin' && !purchase.base._id.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this purchase',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        purchase,
      },
    });
  } catch (error) {
    logger.error(`Get purchase error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const { 
      assetType, 
      base, 
      quantity, 
      unitCost, 
      purchaseDate, 
      supplier, 
      invoiceNumber, 
      notes 
    } = req.body;

    if (!assetType || !quantity || !unitCost || !purchaseDate || !supplier) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: assetType, quantity, unitCost, purchaseDate, and supplier are required',
      });
    }

    const assetTypeDoc = await AssetType.findById(assetType);
    if (!assetTypeDoc) {
      return res.status(400).json({
        status: 'error',
        message: 'Asset type not found',
      });
    }

    let targetBase;
    if (req.user.role === 'admin') {
      if (!base) {
        return res.status(400).json({
          status: 'error',
          message: 'Base is required for admin users',
        });
      }
      targetBase = await Base.findById(base);
      if (!targetBase) {
        return res.status(400).json({
          status: 'error',
          message: 'Base not found',
        });
      }
    } else {
      targetBase = await Base.findById(req.user.base._id || req.user.base);
      if (!targetBase) {
        return res.status(400).json({
          status: 'error',
          message: 'User base not found',
        });
      }
    }

    const purchaseId = `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const totalCost = quantity * unitCost;

    const newPurchase = await Purchase.create({
      purchaseId,
      assetType,
      base: targetBase._id,
      quantity: parseInt(quantity),
      unitCost: parseFloat(unitCost),
      totalCost,
      purchaseDate: new Date(purchaseDate),
      purchasedBy: req.user._id,
      supplier,
      invoiceNumber: invoiceNumber || '',
      notes: notes || ''
    });

    try {
      let asset = await Asset.findOne({
        type: assetType,
        base: targetBase._id
      });

      if (asset) {
        asset.currentQuantity += parseInt(quantity);
        await asset.save();
      } else {
        const assetId = `AST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        asset = await Asset.create({
          assetId,
          type: assetType,
          base: targetBase._id,
          currentQuantity: parseInt(quantity),
          openingBalance: parseInt(quantity),
          purchaseDate: new Date(purchaseDate),
          cost: parseFloat(unitCost),
          status: 'available'
        });
      }
    } catch (assetError) {
      logger.error(`Asset creation/update error: ${assetError.message}`);
    }

    await newPurchase.populate([
      { path: 'assetType' },
      { path: 'base' },
      { path: 'purchasedBy', select: 'name email' }
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        purchase: newPurchase,
      },
    });
  } catch (error) {
    logger.error(`Create purchase error: ${error.message}`);
    console.error('Full error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error: ' + error.message,
    });
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase not found',
      });
    }

    if (req.user.role !== 'admin' && !purchase.base.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this purchase',
      });
    }

    const updateData = { ...req.body };
    if (updateData.quantity || updateData.unitCost) {
      const newQuantity = updateData.quantity || purchase.quantity;
      const newUnitCost = updateData.unitCost || purchase.unitCost;
      updateData.totalCost = newQuantity * newUnitCost;
    }

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate([
      { path: 'assetType' },
      { path: 'base' },
      { path: 'purchasedBy', select: 'name email' }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        purchase: updatedPurchase,
      },
    });
  } catch (error) {
    logger.error(`Update purchase error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase not found',
      });
    }

    if (req.user.role !== 'admin' && !purchase.base.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this purchase',
      });
    }

    await Purchase.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    logger.error(`Delete purchase error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};