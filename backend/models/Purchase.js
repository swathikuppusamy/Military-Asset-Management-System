const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  purchaseId: {
    type: String,
    required: true,
    unique: true
  },
  assetType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssetType',
    required: true
  },
  base: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Base',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  purchasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplier: {
    type: String,
    required: true
  },
  invoiceNumber: String,
  notes: String
}, {
  timestamps: true
});

purchaseSchema.pre('save', function(next) {
  this.totalCost = this.quantity * this.unitCost;
  next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);