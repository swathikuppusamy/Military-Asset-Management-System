const Asset = require('../models/Asset');
const AssetType = require('../models/AssetType');
const Base = require('../models/Base');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

exports.getAllAssets = async (req, res) => {
  try {
    const { base, type, status, assetType } = req.query;
    let filter = {};

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

    const assetTypeFilter = type || assetType;
    if (assetTypeFilter && assetTypeFilter.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(assetTypeFilter)) {
        filter.type = assetTypeFilter;
      } else {
        logger.warn(`Invalid asset type ObjectId received: ${assetTypeFilter}`);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid asset type ID provided'
        });
      }
    }

    if (status && status.trim() !== '') {
      filter.status = status;
    }

    console.log('Assets filter:', filter); 

    const assets = await Asset.find(filter)
      .populate('type')
      .populate('base')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: assets.length,
      data: {
        assets,
      },
    });
  } catch (error) {
    logger.error(`Get all assets error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getAsset = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset ID provided'
      });
    }

    const asset = await Asset.findById(req.params.id)
      .populate('type')
      .populate('base');

    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset not found',
      });
    }

    if (req.user.role !== 'admin' && !asset.base._id.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this asset',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        asset,
      },
    });
  } catch (error) {
    logger.error(`Get asset error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const { type, base, currentQuantity, openingBalance, purchaseDate, cost, specifications, notes } = req.body;

    if (!type || !mongoose.Types.ObjectId.isValid(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid asset type ID is required',
      });
    }

    const assetType = await AssetType.findById(type);
    if (!assetType) {
      return res.status(400).json({
        status: 'error',
        message: 'Asset type not found',
      });
    }

    let targetBase;
    if (req.user.role === 'admin') {
      if (!base || !mongoose.Types.ObjectId.isValid(base)) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid base ID is required',
        });
      }
      targetBase = await Base.findById(base);
    } else {
      targetBase = req.user.base;
    }

    if (!targetBase) {
      return res.status(400).json({
        status: 'error',
        message: 'Base not found',
      });
    }

    const assetId = `AST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newAsset = await Asset.create({
      assetId,
      type,
      base: targetBase._id,
      currentQuantity,
      openingBalance: openingBalance || currentQuantity,
      purchaseDate,
      cost,
      specifications,
      notes,
      status: 'available'
    });

    await newAsset.populate(['type', 'base']);

    res.status(201).json({
      status: 'success',
      data: {
        asset: newAsset,
      },
    });
  } catch (error) {
    logger.error(`Create asset error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset ID provided'
      });
    }

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset not found',
      });
    }

    if (req.user.role !== 'admin' && !asset.base.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this asset',
      });
    }

    if (req.body.type && !mongoose.Types.ObjectId.isValid(req.body.type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset type ID provided'
      });
    }

    if (req.body.base && !mongoose.Types.ObjectId.isValid(req.body.base)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid base ID provided'
      });
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('type').populate('base');

    res.status(200).json({
      status: 'success',
      data: {
        asset: updatedAsset,
      },
    });
  } catch (error) {
    logger.error(`Update asset error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset ID provided'
      });
    }

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset not found',
      });
    }

    if (req.user.role !== 'admin' && !asset.base.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this asset',
      });
    }

    await Asset.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    logger.error(`Delete asset error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};