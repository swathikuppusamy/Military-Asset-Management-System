// backend/models/Expenditure.js
const mongoose = require('mongoose');

const expenditureSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset is required']
  },
  base: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Base',
    required: [true, 'Base is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    enum: ['Training', 'Operations', 'Maintenance', 'Emergency', 'Exercise', 'Other']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  expendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Expended by user is required']
  },
  expendedDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Expenditure date is required']
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate
expenditureSchema.virtual('assetDetails', {
  ref: 'Asset',
  localField: 'asset',
  foreignField: '_id',
  justOne: true
});

expenditureSchema.virtual('baseDetails', {
  ref: 'Base',
  localField: 'base',
  foreignField: '_id',
  justOne: true
});

expenditureSchema.virtual('expendedByDetails', {
  ref: 'User',
  localField: 'expendedBy',
  foreignField: '_id',
  justOne: true
});

expenditureSchema.virtual('approvedByDetails', {
  ref: 'User',
  localField: 'approvedBy',
  foreignField: '_id',
  justOne: true
});

// Indexes
expenditureSchema.index({ expendedDate: -1 });
expenditureSchema.index({ asset: 1, expendedDate: -1 });
expenditureSchema.index({ base: 1, expendedDate: -1 });

module.exports = mongoose.model('Expenditure', expenditureSchema);