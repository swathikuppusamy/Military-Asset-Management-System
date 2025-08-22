const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'commander', 'logistics', 'unit_leader'], // Make sure unit_leader is included
    required: true
  },
  base: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Base',
    required: function() {
      return this.role === 'commander'|| this.role === 'logistics' || this.role === 'unit_leader';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for name (maps to username for frontend compatibility)
userSchema.virtual('name').get(function() {
  return this.username;
});

userSchema.virtual('name').set(function(value) {
  this.username = value;
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);