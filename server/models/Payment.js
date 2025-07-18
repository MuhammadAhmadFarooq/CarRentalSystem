const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false // Make customer optional for now
  },
  type: {
    type: String,
    enum: ['Receivable', 'Payable'],
    required: true
  },
  category: {
    type: String,
    enum: ['Rental Payment', 'Security Deposit', 'Vendor Payment', 'Driver Salary', 'Expense Reimbursement', 'Other'],
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
  paidAmount: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cash'],
    default: 'cash'
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  bankDetails: {
    accountNumber: String,
    accountTitle: String,
    bankName: String,
    branchCode: String
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'unpaid', 'balance'],
    default: 'pending'
  },
  documents: [{
    name: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String
}, {
  timestamps: true
});

// Calculate balance and update status before saving
paymentSchema.pre('save', function(next) {
  this.balanceAmount = this.amount - this.paidAmount;
  
  // Only auto-update status if it's not explicitly set to 'unpaid' or 'balance'
  if (this.status !== 'unpaid' && this.status !== 'balance') {
    if (this.paidAmount === 0) {
      this.status = 'pending';
    } else if (this.paidAmount >= this.amount) {
      this.status = 'paid';
    } else {
      this.status = 'pending'; // Changed from 'partial' to 'pending'
    }
  }
  
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
