const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  transferId: {
    type: String,
    required: true,
    unique: true
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  fromBase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Base',
    required: true
  },
  toBase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Base',
    required: true
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'], // Added 'cancelled'
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  transferDate: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true
});

// Index for better query performance
transferSchema.index({ status: 1 });
transferSchema.index({ fromBase: 1 });
transferSchema.index({ toBase: 1 });
transferSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transfer', transferSchema);