const mongoose = require('mongoose');

const baseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Base', baseSchema);