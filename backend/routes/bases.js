const express = require('express');
const router = express.Router();
const Base = require('../models/Base');
const mongoose = require('mongoose');

// GET /api/v1/bases - Get all bases
router.get('/', async (req, res) => {
  try {
    const bases = await Base.find({ isActive: true }).sort({ name: 1 });
    
    // If no bases exist, create some sample data
    if (bases.length === 0) {
      const sampleBases = [
        {
          name: 'Headquarters',
          location: 'Central Command',
          code: 'HQ',
          commander: 'General Smith',
          contactEmail: 'hq@military.gov',
          contactPhone: '+1-555-0100',
          isActive: true
        },
        {
          name: 'North Base',
          location: 'Northern Region',
          code: 'NB',
          commander: 'Colonel Johnson',
          contactEmail: 'north@military.gov',
          contactPhone: '+1-555-0101',
          isActive: true
        },
        {
          name: 'South Base',
          location: 'Southern Region', 
          code: 'SB',
          commander: 'Colonel Davis',
          contactEmail: 'south@military.gov',
          contactPhone: '+1-555-0102',
          isActive: true
        },
        {
          name: 'East Base',
          location: 'Eastern Region',
          code: 'EB',
          commander: 'Colonel Wilson',
          contactEmail: 'east@military.gov',
          contactPhone: '+1-555-0103',
          isActive: true
        }
      ];

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

// POST /api/v1/bases - Create a new base
router.post('/', async (req, res) => {
  try {
    const newBase = await Base.create(req.body);

    res.status(201).json({
      status: 'success',
      data: newBase
    });
  } catch (error) {
    console.error('Error creating base:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating base',
      details: error.message
    });
  }
});

// GET /api/v1/bases/:id - Get a specific base
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid base ID'
      });
    }

    const base = await Base.findById(req.params.id);

    if (!base) {
      return res.status(404).json({
        status: 'error',
        message: 'Base not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: base
    });
  } catch (error) {
    console.error('Error fetching base:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching base'
    });
  }
});

// PUT /api/v1/bases/:id - Update a base
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid base ID'
      });
    }

    const updatedBase = await Base.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!updatedBase) {
      return res.status(404).json({
        status: 'error',
        message: 'Base not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: updatedBase
    });
  } catch (error) {
    console.error('Error updating base:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating base'
    });
  }
});

// DELETE /api/v1/bases/:id - Delete a base (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid base ID'
      });
    }

    // Soft delete by setting isActive to false
    const deletedBase = await Base.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );

    if (!deletedBase) {
      return res.status(404).json({
        status: 'error',
        message: 'Base not found'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting base:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting base'
    });
  }
});

module.exports = router;