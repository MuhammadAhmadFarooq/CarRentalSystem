const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  outsourcedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OutsourcedVehicle'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  showroomPerson: {
    type: String,
    trim: true
  },
  routeName: {
    type: String,
    trim: true
  },
  showroomContactPerson: {
    name: String,
    phone: String
  },
  bookingContactPerson: {
    name: String,
    phone: String
  },
  dutyHours: {
    scheduled: {
      type: Number,
      default: 12
    },
    actual: {
      type: Number,
      default: 0
    },
    overtime: {
      type: Number,
      default: 0
    }
  },
  rentalType: {
    type: String,
    enum: ['Own', 'Outsourced From Vendor', 'Outsourced To Client'],
    required: true
  },
  isOutstation: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date
  },
  rentPerDay: {
    type: Number,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  totalRent: {
    type: Number,
    required: true
  },
  mileage: {
    start: {
      type: Number,
      required: true
    },
    end: {
      type: Number
    },
    total: {
      type: Number,
      default: 0
    }
  },
  expenses: {
    fuel: {
      type: Number,
      default: 0
    },
    toll: {
      type: Number,
      default: 0
    },
    maintenance: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  driverAllowance: {
    overtime: {
      hours: {
        type: Number,
        default: 0
      },
      amount: {
        type: Number,
        default: 0
      }
    },
    food: {
      nights: {
        type: Number,
        default: 0
      },
      amount: {
        type: Number,
        default: 0
      }
    },
    outstation: {
      nights: {
        type: Number,
        default: 0
      },
      amount: {
        type: Number,
        default: 0
      }
    },
    parking: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  payment: {
    totalAmount: {
      type: Number,
      required: true
    },
    receivedAmount: {
      type: Number,
      default: 0
    },
    balanceAmount: {
      type: Number,
      default: 0
    },
    taxDeduction: {
      type: Number,
      default: 0
    },
    securityDeposit: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'partial'],
    default: 'unpaid'
  },
  notes: String,
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

// Auto-generate booking number
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingNumber = `BK${(count + 1).toString().padStart(6, '0')}`;
  }
  
  // Calculate totals
  this.mileage.total = (this.mileage.end || 0) - this.mileage.start;
  this.expenses.total = this.expenses.fuel + this.expenses.toll + this.expenses.maintenance + this.expenses.other;
  this.driverAllowance.total = this.driverAllowance.overtime.amount + this.driverAllowance.food.amount + 
                               this.driverAllowance.outstation.amount + this.driverAllowance.parking;
  this.payment.balanceAmount = this.payment.totalAmount - this.payment.receivedAmount;
  
  // Update payment status
  if (this.payment.receivedAmount === 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.payment.receivedAmount >= this.payment.totalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }
  
  next();
});

// Clear cache to ensure schema updates
delete mongoose.connection.models['Booking'];

module.exports = mongoose.model('Booking', bookingSchema);
