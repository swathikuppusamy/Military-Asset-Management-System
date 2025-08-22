const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('base', 'name location')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('base', 'name location')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create new user
exports.createUser = async (req, res, next) => {
  try {
    const { name, username, email, password, role, base, isActive } = req.body;

    // Use name as username if username not provided (for frontend compatibility)
    const finalUsername = username || name;

    if (!finalUsername) {
      return res.status(400).json({
        status: 'error',
        message: 'Name/Username is required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: finalUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or username already exists'
      });
    }

    const newUser = await User.create({
      username: finalUsername,
      email,
      password,
      role,
      base: role === 'admin' ? undefined : base,
      isActive: isActive !== undefined ? isActive : true
    });

    // Remove password from output
    newUser.password = undefined;

    // Populate base information
    await newUser.populate('base', 'name location');

    res.status(201).json({
      status: 'success',
      data: newUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { name, username, password, ...updateData } = req.body;

    if (name && !username) {
      updateData.username = name;
    } else if (username) {
      updateData.username = username;
    }

    if (password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password updates are not allowed through this endpoint'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('base', 'name location')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }

    if (user.role === 'admin' && user.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Admin users cannot be deactivated'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    await user.populate('base', 'name location');
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      data: user,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        status: 'error',
        message: 'Admin users cannot be deleted'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};