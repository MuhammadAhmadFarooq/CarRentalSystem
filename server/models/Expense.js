const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  category: {
    type: String,
    enum: ['Fuel', 'Toll', 'Maintenance', 'Parking', 'Food', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  receiptNumber: {
    type: String,
    trim: true
  },
  vendor: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'Cheque'],
    default: 'Cash'
  },
  documents: [{
    name: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: String
  },
  approvalDate: {
    type: Date
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
