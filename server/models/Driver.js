const mongoose = require('mongoose');

// Clear the model cache if it exists
if (mongoose.models.Driver) {
  delete mongoose.models.Driver;
}

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
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
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  driverRates: {
    localDailyRate: {
      type: Number,
      default: 1000
    },
    outstationDailyRate: {
      type: Number,
      default: 1500
    },
    overtimeThresholdHours: {
      type: Number,
      default: 12
    },
    overtimeHourlyRate: {
      type: Number,
      default: 200
    }
  },
  allowances: {
    monthlyParkingAllowance: {
      type: Number,
      default: 2000
    },
    nightFoodAllowance: {
      type: Number,
      default: 500
    },
    outstationAllowance: {
      type: Number,
      default: 1000
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  },
  joiningDate: {
    type: Date,
    required: true
  },
  documents: [{
    type: {
      type: String,
      enum: ['License', 'CNIC', 'Contract', 'Other']
    },
    name: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  monthlyExpenses: [{
    month: {
      type: Date,
      required: true
    },
    overtimeHours: {
      type: Number,
      default: 0
    },
    overtimeAmount: {
      type: Number,
      default: 0
    },
    foodAllowanceNights: {
      type: Number,
      default: 0
    },
    foodAllowanceAmount: {
      type: Number,
      default: 0
    },
    outstationNights: {
      type: Number,
      default: 0
    },
    outstationAmount: {
      type: Number,
      default: 0
    },
    parkingAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  }],
  notes: String
}, {
  timestamps: true
});

// Calculate monthly expense totals
driverSchema.methods.calculateMonthlyExpense = function(expenseData) {
  const overtime = (expenseData.overtimeHours || 0) * this.hourlyOvertimeRate;
  const food = (expenseData.foodAllowanceNights || 0) * this.nightFoodAllowance;
  const outstation = (expenseData.outstationNights || 0) * this.outstationAllowance;
  const parking = expenseData.parkingAmount || 0;
  
  return {
    overtimeAmount: overtime,
    foodAllowanceAmount: food,
    outstationAmount: outstation,
    parkingAmount: parking,
    totalAmount: overtime + food + outstation + parking
  };
};

module.exports = mongoose.model('Driver', driverSchema);
