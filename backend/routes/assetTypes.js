const express = require('express');
const router = express.Router();
const AssetType = require('../models/AssetType');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  try {
    const assetTypes = await AssetType.find({ isActive: true }).sort({ name: 1 });
    
    if (assetTypes.length === 0) {
      const sampleAssetTypes = [
        {
          name: 'Laptop',
          category: 'equipment',
          description: 'Portable computers',
          unit: 'piece',
          isConsumable: false,
          isActive: true
        },
        {
          name: 'Desktop',
          category: 'equipment', 
          description: 'Desktop computers',
          unit: 'piece',
          isConsumable: false,
          isActive: true
        },
        {
          name: 'Monitor',
          category: 'equipment',
          description: 'Computer monitors',
          unit: 'piece', 
          isConsumable: false,
          isActive: true
        },
        {
          name: 'Ammunition',
          category: 'ammunition',
          description: 'Rifle ammunition',
          unit: 'rounds',
          isConsumable: true,
          isActive: true
        }
      ];

      const createdAssetTypes = await AssetType.create(sampleAssetTypes);
      
      return res.status(200).json({
        status: 'success',
        results: createdAssetTypes.length,
        data: createdAssetTypes
      });
    }

    res.status(200).json({
      status: 'success',
      results: assetTypes.length,
      data: assetTypes
    });
  } catch (error) {
    console.error('Error fetching asset types:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching asset types'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const newAssetType = await AssetType.create(req.body);

    res.status(201).json({
      status: 'success',
      data: newAssetType
    });
  } catch (error) {
    console.error('Error creating asset type:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating asset type',
      details: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset type ID'
      });
    }

    const assetType = await AssetType.findById(req.params.id);

    if (!assetType) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset type not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: assetType
    });
  } catch (error) {
    console.error('Error fetching asset type:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching asset type'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset type ID'
      });
    }

    const updatedAssetType = await AssetType.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!updatedAssetType) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset type not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: updatedAssetType
    });
  } catch (error) {
    console.error('Error updating asset type:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating asset type'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
 
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset type ID'
      });
    }

    const deletedAssetType = await AssetType.findByIdAndDelete(req.params.id);

    if (!deletedAssetType) {
      return res.status(404).json({
        status: 'error',
        message: 'Asset type not found'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting asset type:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting asset type'
    });
  }
});

module.exports = router;