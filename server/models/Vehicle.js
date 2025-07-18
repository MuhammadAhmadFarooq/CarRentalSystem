const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
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
  color: {
    type: String,
    trim: true
  },
  mileage: {
    type: Number,
    default: 0
  },
  vehicleType: {
    type: String,
    enum: ['Company-owned', 'Outsourced-in', 'Outsourced-out'],
    default: 'Company-owned',
    required: true
  },
  vendorInfo: {
    vendorName: String,
    vendorContact: String,
    contractStartDate: Date,
    contractEndDate: Date,
    dailyVendorRate: Number
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'under_maintenance'],
    default: 'available'
  },
  dailyRate: {
    type: Number,
    required: true
  },
  maintenanceLogs: [{
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true
    },
    performedBy: String
  }],
  documents: [{
    name: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
