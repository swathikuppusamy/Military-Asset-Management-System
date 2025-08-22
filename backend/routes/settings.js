const express = require('express');
const router = express.Router();
const Base = require('../models/Base');
const AssetType = require('../models/AssetType');
const mongoose = require('mongoose');

// GET /api/v1/settings/general - Get general settings
router.get('/general', async (req, res) => {
  try {
    // Return default general settings - you can modify this to use a Settings model
    const defaultSettings = {
      systemName: 'Military Asset Management System',
      organizationName: 'Department of Defense',
      contactEmail: 'contact@military.gov',
      lowStockThreshold: 10,
      criticalStockThreshold: 5,
      autoGenerateAssetIds: true,
      assetIdPrefix: 'AST',
      emailNotifications: true,
      lowStockAlerts: true,
      transferApprovalAlerts: true,
      assignmentAlerts: true
    };

    res.status(200).json({
      status: 'success',
      data: defaultSettings
    });
  } catch (error) {
    console.error('Error fetching general settings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching general settings'
    });
  }
});

// PUT /api/v1/settings/general - Update general settings
router.put('/general', async (req, res) => {
  try {
    // Here you would normally update the settings in database
    // For now, just return the updated data
    const updatedSettings = req.body;

    res.status(200).json({
      status: 'success',
      data: updatedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating general settings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating general settings'
    });
  }
});

// GET /api/v1/settings/bases - Get all bases for settings/dropdowns
router.get('/bases', async (req, res) => {
  try {
    // Use actual database query instead of mock data
    const bases = await Base.find({ isActive: true }).sort({ name: 1 });
    
    // If no bases exist, create some sample data
    if (bases.length === 0) {
      const sampleBases = [
        {
          name: 'Headquarters',
          location: 'Central Command',
          code: 'HQ',
          isActive: true
        },
        {
          name: 'North Base',
          location: 'Northern Region',
          code: 'NB',
          isActive: true
        },
        {
          name: 'South Base',
          location: 'Southern Region', 
          code: 'SB',
          isActive: true
        },
        {
          name: 'East Base',
          location: 'Eastern Region',
          code: 'EB',
          isActive: true
        }
      ];

      // Create sample bases
      const createdBases = await Base.create(sampleBases);
      
      return res.status(200).json({
        status: 'success',
        results: createdBases.length,
        data: createdBases
      });
    }

    res.status(200).json({
      status: 'success',
      results: bases.length,
      data: bases
    });
  } catch (error) {
    console.error('Error fetching bases:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching bases'
    });
  }
});

// GET /api/v1/settings/asset-types - Get asset types for settings
router.get('/asset-types', async (req, res) => {
  try {
    const assetTypes = await AssetType.find({ isActive: true }).sort({ name: 1 });
    
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

module.exports = router;