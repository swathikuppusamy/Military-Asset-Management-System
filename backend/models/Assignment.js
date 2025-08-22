const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  assignmentId: {
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
  assignedTo: {
    type: String,
    required: true
  },
  rank: String,
  unit: String,
  base: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Base',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignmentDate: {
    type: Date,
    required: true
  },
  expectedReturnDate: Date,
  actualReturnDate: Date,
purpose: {
    type: String,
    required: function() {
      return this.status === 'active';
    }
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'pending', 'cancelled'], 
    default: 'pending'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);