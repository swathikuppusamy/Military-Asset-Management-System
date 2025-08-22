const mongoose = require('mongoose');

const assetTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['weapon', 'vehicle', 'equipment', 'ammunition', 'other']
  },
  description: String,
  isConsumable: {
    type: Boolean,
    default: false
  },
  unit: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssetType', assetTypeSchema);