const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
  
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  wallet_balance: {
    type: Number,
    default: 100000,
    min: 0
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date
  }
}, {
  timestamps: true, 
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.verifyPassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

userSchema.statics.createUser = async function(userData) {
  const user = new this(userData);
  await user.save();
  return user;
};

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByIdSafe = function(id) {
  return this.findById(id).select('-password');
};

userSchema.statics.updateWalletBalance = async function(userId, newBalance) {
  return this.findByIdAndUpdate(
    userId,
    { wallet_balance: newBalance },
    { new: true, select: 'wallet_balance' }
  );
};

userSchema.statics.updateProfile = async function(userId, updateData) {
  const allowedUpdates = ['name', 'phone'];
  const updates = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedUpdates.includes(key) && updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  });
  
  return this.findByIdAndUpdate(
    userId,
    updates,
    { new: true, select: 'name email phone role wallet_balance' }
  );
};

userSchema.statics.changePassword = async function(userId, currentPassword, newPassword) {
  const user = await this.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect');
  }
  
  user.password = newPassword;
  await user.save();
  
  return this.findById(userId).select('name email phone role wallet_balance');
};

userSchema.statics.getAllUsers = function() {
  return this.find({}, 'name email role wallet_balance createdAt')
    .sort({ createdAt: -1 });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
