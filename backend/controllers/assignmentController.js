const Assignment = require('../models/Assignment');
const Asset = require('../models/Asset');
const Base = require('../models/Base');
const logger = require('../utils/logger');

exports.getAllAssignments = async (req, res) => {
  try {
    const { base, status, assetType, startDate, endDate } = req.query;
    let filter = {};

    // Apply role-based filtering
    if (req.user.role !== 'admin') {
      filter.base = req.user.base._id;
    } else if (base) {
      filter.base = base;
    }

    if (status) filter.status = status;
    
    // Date filtering
    if (startDate || endDate) {
      filter.assignmentDate = {};
      if (startDate) filter.assignmentDate.$gte = new Date(startDate);
      if (endDate) filter.assignmentDate.$lte = new Date(endDate);
    }

    // Asset type filtering
    if (assetType) {
      const assets = await Asset.find({ assetType });
      filter.asset = { $in: assets.map(asset => asset._id) };
    }

    const assignments = await Assignment.find(filter)
      .populate('asset')
      .populate('base')
      .populate('assignedBy')
      .sort({ assignmentDate: -1 });

    res.status(200).json({
      status: 'success',
      results: assignments.length,
      data: assignments,
    });
  } catch (error) {
    logger.error(`Get all assignments error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('asset')
      .populate('base')
      .populate('assignedBy');

    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found',
      });
    }

    // Check if user has access to this assignment
    if (req.user.role !== 'admin' && !assignment.base._id.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this assignment',
      });
    }

    res.status(200).json({
      status: 'success',
      data: assignment,
    });
  } catch (error) {
    logger.error(`Get assignment error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { 
      asset, 
      quantity, 
      assignedTo, 
      rank, 
      unit, 
      base,
      assignmentDate, 
      expectedReturnDate, 
      notes,
      purpose = 'other'
    } = req.body;

    console.log('Creating assignment with data:', req.body);

    // Verify asset exists
    const assetDoc = await Asset.findById(asset);
    if (!assetDoc) {
      return res.status(400).json({
        status: 'error',
        message: 'Asset not found',
      });
    }

    // Verify base exists
    let baseDoc;
    if (base) {
      baseDoc = await Base.findById(base);
      if (!baseDoc) {
        return res.status(400).json({
          status: 'error',
          message: 'Base not found',
        });
      }
    } else {
      baseDoc = await Base.findById(req.user.base._id);
    }

    // Check if user has access to the base
    if (req.user.role !== 'admin' && !baseDoc._id.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to assign assets to this base',
      });
    }

    // Check available quantity
    const availableQuantity = assetDoc.currentQuantity !== undefined ? 
      assetDoc.currentQuantity : assetDoc.quantity;
    
    if (availableQuantity < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient quantity available for assignment. Available: ${availableQuantity}, Requested: ${quantity}`,
      });
    }

    // Generate assignment ID
    const assignmentId = `ASN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newAssignment = await Assignment.create({
      assignmentId,
      asset,
      quantity,
      assignedTo,
      rank,
      unit,
      base: baseDoc._id,
      assignedBy: req.user._id,
      assignmentDate: assignmentDate || new Date(),
      expectedReturnDate,
      notes,
      purpose
    });

    // Update asset quantity
    if (assetDoc.currentQuantity !== undefined) {
      assetDoc.currentQuantity -= quantity;
    } else {
      assetDoc.quantity -= quantity;
    }
    await assetDoc.save();

    // Populate the created assignment
    const populatedAssignment = await Assignment.findById(newAssignment._id)
      .populate('asset')
      .populate('base')
      .populate('assignedBy');

    res.status(201).json({
      status: 'success',
      data: populatedAssignment,
    });
  } catch (error) {
    logger.error(`Create assignment error: ${error.message}`, error);
    console.error('Full error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found',
      });
    }

    // Check if user has access to this assignment
    if (req.user.role !== 'admin' && !assignment.base.equals(req.user.base._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this assignment',
      });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('asset').populate('base').populate('assignedBy');

    res.status(200).json({
      status: 'success',
      data: updatedAssignment,
    });
  } catch (error) {
    logger.error(`Update assignment error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
exports.returnAssignment = async (req, res) => {
  try {
    console.log('=== Return Assignment Debug Start ===');
    console.log('Assignment ID:', req.params.id);
    console.log('User:', {
      id: req.user._id,
      role: req.user.role,
      base: req.user.base
    });

    // Step 1: Find the assignment
    console.log('Step 1: Finding assignment...');
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      console.log('Assignment not found');
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found',
      });
    }

    console.log('Assignment found:', {
      id: assignment._id,
      status: assignment.status,
      base: assignment.base,
      asset: assignment.asset
    });

    // Step 2: Populate the assignment
    console.log('Step 2: Populating assignment...');
    await assignment.populate(['asset', 'base']);
    
    console.log('Assignment after population:', {
      asset: assignment.asset ? { id: assignment.asset._id, name: assignment.asset.name } : null,
      base: assignment.base ? { id: assignment.base._id, name: assignment.base.name } : null
    });

    // Step 3: Check permissions - FIXED to handle missing user.base
    console.log('Step 3: Checking permissions...');
    
    // For admin users or when user.base is undefined, skip base permission check
    if (req.user.role === 'admin') {
      console.log('Admin user - skipping base permission check');
    } else {
      // Check if user has a base assigned
      if (!req.user.base || !req.user.base._id) {
        console.log('Error: User has no base assigned');
        return res.status(403).json({
          status: 'error',
          message: 'User has no base assigned. Cannot perform this operation.',
        });
      }

      // Check if user's base matches assignment's base
      const assignmentBaseId = assignment.base._id.toString();
      const userBaseId = req.user.base._id.toString();
      console.log('Base comparison:', { assignmentBaseId, userBaseId });

      if (assignmentBaseId !== userBaseId) {
        console.log('Permission denied - base mismatch');
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to return this assignment',
        });
      }
    }

    // Step 4: Check status
    console.log('Step 4: Checking assignment status...');
    if (assignment.status !== 'active') {
      console.log('Assignment not active, current status:', assignment.status);
      return res.status(400).json({
        status: 'error',
        message: `Assignment is not active. Current status: ${assignment.status}`,
      });
    }

    // Step 5: Update assignment
    console.log('Step 5: Updating assignment status...');
    assignment.status = 'returned';
    assignment.actualReturnDate = new Date();
    await assignment.save();
    console.log('Assignment status updated successfully');

    // Step 6: Update asset quantity
    console.log('Step 6: Updating asset quantity...');
    const asset = assignment.asset;
    console.log('Asset before update:', {
      id: asset._id,
      currentQuantity: asset.currentQuantity,
      quantity: asset.quantity,
      assignmentQuantity: assignment.quantity
    });

    // Return quantity to asset
    if (typeof asset.currentQuantity === 'number') {
      asset.currentQuantity += assignment.quantity;
      console.log('Updated currentQuantity to:', asset.currentQuantity);
    } else if (typeof asset.quantity === 'number') {
      asset.quantity += assignment.quantity;
      console.log('Updated quantity to:', asset.quantity);
    } else {
      console.log('Warning: Neither currentQuantity nor quantity found on asset');
    }
    
    await asset.save();
    console.log('Asset quantity updated successfully');

    // Step 7: Return populated assignment
    console.log('Step 7: Returning populated assignment...');
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('asset')
      .populate('base')
      .populate('assignedBy');

    console.log('=== Return Assignment Success ===');

    res.status(200).json({
      status: 'success',
      data: populatedAssignment,
    });

  } catch (error) {
    console.error('=== Return Assignment Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    logger.error(`Return assignment error: ${error.message}`, error);
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};

exports.expendAssignment = async (req, res) => {
  try {
    console.log('=== Expend Assignment Debug Start ===');
    console.log('Assignment ID:', req.params.id);
    console.log('User:', {
      id: req.user._id,
      role: req.user.role,
      base: req.user.base
    });

    // Step 1: Find the assignment
    console.log('Step 1: Finding assignment...');
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      console.log('Assignment not found');
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found',
      });
    }

    console.log('Assignment found:', {
      id: assignment._id,
      status: assignment.status,
      base: assignment.base
    });

    // Step 2: Populate the assignment
    console.log('Step 2: Populating assignment...');
    await assignment.populate(['asset', 'base']);

    // Step 3: Check permissions - FIXED to handle missing user.base
    console.log('Step 3: Checking permissions...');
    
    // For admin users or when user.base is undefined, skip base permission check
    if (req.user.role === 'admin') {
      console.log('Admin user - skipping base permission check');
    } else {
      // Check if user has a base assigned
      if (!req.user.base || !req.user.base._id) {
        console.log('Error: User has no base assigned');
        return res.status(403).json({
          status: 'error',
          message: 'User has no base assigned. Cannot perform this operation.',
        });
      }

      // Check if user's base matches assignment's base
      const assignmentBaseId = assignment.base._id.toString();
      const userBaseId = req.user.base._id.toString();
      console.log('Base comparison:', { assignmentBaseId, userBaseId });

      if (assignmentBaseId !== userBaseId) {
        console.log('Permission denied - base mismatch');
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to mark this assignment as expended',
        });
      }
    }

    // Step 4: Check status
    console.log('Step 4: Checking assignment status...');
    if (assignment.status !== 'active') {
      console.log('Assignment not active, current status:', assignment.status);
      return res.status(400).json({
        status: 'error',
        message: `Assignment is not active. Current status: ${assignment.status}`,
      });
    }

    // Step 5: Update assignment (no quantity return for expended items)
    console.log('Step 5: Updating assignment status to expended...');
    assignment.status = 'expended';
    assignment.actualReturnDate = new Date();
    await assignment.save();
    console.log('Assignment status updated successfully');

    // Step 6: Return populated assignment
    console.log('Step 6: Returning populated assignment...');
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('asset')
      .populate('base')
      .populate('assignedBy');

    console.log('=== Expend Assignment Success ===');

    res.status(200).json({
      status: 'success',
      data: populatedAssignment,
    });

  } catch (error) {
    console.error('=== Expend Assignment Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    logger.error(`Expend assignment error: ${error.message}`, error);
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};