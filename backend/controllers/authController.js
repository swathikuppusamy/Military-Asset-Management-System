const User = require('../models/User');
const Base = require('../models/Base');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res) => {
  try {
    console.log('Signup request received:', req.body); // Debug log
    
    const { username, email, password, role, base } = req.body;

    // Check for required fields
    if (!username || !email || !password || !role) {
      console.log('Missing required fields:', { username: !!username, email: !!email, password: !!password, role: !!role });
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username, email, password, and role',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User already exists:', { email, username });
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or username already exists',
      });
    }

    // Verify base exists if role requires it
    if (role !== 'admin') {
      if (!base) {
        console.log('Base is required for role:', role);
        return res.status(400).json({
          status: 'error',
          message: 'Base is required for this role',
        });
      }
      
      const baseExists = await Base.findById(base);
      if (!baseExists) {
        console.log('Base not found:', base);
        return res.status(400).json({
          status: 'error',
          message: 'Base not found',
        });
      }
      console.log('Base found:', baseExists.name);
    }

    console.log('Creating user with data:', { username, email, role, base: role !== 'admin' ? base : undefined });

    const newUser = await User.create({
      username,
      email,
      password,
      role,
      base: role !== 'admin' ? base : undefined,
    });

    console.log('User created successfully:', newUser.username);

    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error('Signup error details:', error); // More detailed error logging
    logger.error(`Signup error: ${error.message}`);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        status: 'error',
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1) Check if username and password exist
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username and password',
      });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ username }).select('+password').populate('base');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect username or password',
      });
    }

    // 3) Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated',
      });
    }

    // 4) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in! Please log in to get access.',
      });
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).populate('base');
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token does no longer exist.',
      });
    }

    // 4) Check if user changed password after the token was issued
    // (We would need to add a passwordChangedAt field to the User model for this)

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    logger.error(`Protect middleware error: ${error.message}`);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
  }
};