const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssetType',
    required: true
  },
  base: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Base',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'maintenance', 'retired', 'expended'],
    default: 'available'
  },
  currentQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  openingBalance: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  cost: {
    type: Number,
    min: 0
  },
  specifications: mongoose.Schema.Types.Mixed,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);