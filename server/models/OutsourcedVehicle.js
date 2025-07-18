const mongoose = require('mongoose');

const outsourcedVehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    trim: true
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  vendorContact: {
    phone: String,
    email: String,
    address: String
  },
  dailyRate: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  contractStartDate: {
    type: Date,
    required: true
  },
  contractEndDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'extended'],
    default: 'active'
  },
  totalUsageDays: {
    type: Number,
    default: 0
  },
  totalPayable: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

// Calculate balance amount before saving
outsourcedVehicleSchema.pre('save', function(next) {
  this.balanceAmount = this.totalPayable - this.paidAmount;
  next();
});

module.exports = mongoose.model('OutsourcedVehicle', outsourcedVehicleSchema);
