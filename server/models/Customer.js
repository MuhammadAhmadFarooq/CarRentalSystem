const mongoose = require('mongoose');

// Clear the model cache if it exists
if (mongoose.models.Customer) {
  delete mongoose.models.Customer;
}

const customerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['individual', 'company'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  cnic: {
    type: String,
    required: function() {
      return this.type === 'individual';
    },
    trim: true
  },
  companyRegistration: {
    type: String,
    required: function() {
      return this.type === 'company';
    },
    trim: true
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.type === 'individual';
    },
    trim: true
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: String,
    address: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['License', 'CNIC', 'Company Registration', 'Other']
    },
    name: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  totalBookings: {
    type: Number,
    default: 0
  },
  totalAmountPaid: {
    type: Number,
    default: 0
  },
  outstandingBalance: {
    type: Number,
    default: 0
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted', 'suspended'],
    default: 'active'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
