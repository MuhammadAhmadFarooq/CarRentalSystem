const express = require('express');
const XLSX = require('xlsx');
const moment = require('moment');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Export monthly rental report
router.get('/monthly-rental', auth, async (req, res) => {
  try {
    const { startDate, endDate, vehicleId, customerId } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (vehicleId) query.vehicle = vehicleId;
    if (customerId) query.customer = customerId;

    const bookings = await Booking.find(query)
      .populate('customer', 'name type')
      .populate('vehicle', 'registrationNumber make model')
      .populate('driver', 'name')
      .sort({ startDate: -1 });

    const reportData = bookings.map(booking => ({
      'Booking Number': booking.bookingNumber,
      'Customer Name': booking.customer?.name || 'N/A',
      'Customer Type': booking.customer?.type || 'N/A',
      'Vehicle': booking.vehicle?.registrationNumber || booking.outsourcedVehicle?.registrationNumber || 'N/A',
      'Driver': booking.driver?.name || 'N/A',
      'Start Date': moment(booking.startDate).format('DD/MM/YYYY'),
      'End Date': moment(booking.endDate).format('DD/MM/YYYY'),
      'Total Days': booking.totalDays,
      'Rent Per Day': booking.rentPerDay,
      'Total Rent': booking.totalRent,
      'Received Amount': booking.payment.receivedAmount,
      'Balance Amount': booking.payment.balanceAmount,
      'Payment Status': booking.paymentStatus,
      'Status': booking.status,
      'Rental Type': booking.rentalType,
      'Outstation': booking.isOutstation ? 'Yes' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Rental Report');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=monthly-rental-report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Export monthly rental report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export vehicle summary report
router.get('/vehicle-summary', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    
    const reportData = await Promise.all(vehicles.map(async (vehicle) => {
      const bookings = await Booking.find({ vehicle: vehicle._id });
      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum, booking) => sum + booking.payment.receivedAmount, 0);
      const totalMaintenance = vehicle.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);

      return {
        'Registration Number': vehicle.registrationNumber,
        'Make': vehicle.make,
        'Model': vehicle.model,
        'Year': vehicle.year,
        'Status': vehicle.status,
        'Current Mileage': vehicle.mileage,
        'Daily Rate': vehicle.dailyRate,
        'Total Bookings': totalBookings,
        'Total Revenue': totalRevenue,
        'Total Maintenance Cost': totalMaintenance,
        'Profit': totalRevenue - totalMaintenance
      };
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Summary');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=vehicle-summary-report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Export vehicle summary report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export driver report
router.get('/driver-report', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const drivers = await Driver.find().populate('assignedVehicle', 'registrationNumber');
    
    const reportData = await Promise.all(drivers.map(async (driver) => {
      let query = { driver: driver._id };
      if (startDate && endDate) {
        query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      
      const trips = await Booking.find(query);
      const totalTrips = trips.length;
      const totalOvertimeHours = trips.reduce((sum, trip) => sum + trip.driverAllowance.overtime.hours, 0);
      const totalOvertimeAmount = trips.reduce((sum, trip) => sum + trip.driverAllowance.overtime.amount, 0);
      const totalFoodAllowance = trips.reduce((sum, trip) => sum + trip.driverAllowance.food.amount, 0);
      const totalOutstationAllowance = trips.reduce((sum, trip) => sum + trip.driverAllowance.outstation.amount, 0);
      const totalParkingAllowance = trips.reduce((sum, trip) => sum + trip.driverAllowance.parking, 0);

      return {
        'Driver Name': driver.name,
        'CNIC': driver.cnic,
        'License Number': driver.licenseNumber,
        'Assigned Vehicle': driver.assignedVehicle?.registrationNumber || 'None',
        'Status': driver.status,
        'Total Trips': totalTrips,
        'Total Overtime Hours': totalOvertimeHours,
        'Overtime Amount': totalOvertimeAmount,
        'Food Allowance': totalFoodAllowance,
        'Outstation Allowance': totalOutstationAllowance,
        'Parking Allowance': totalParkingAllowance,
        'Total Allowances': totalOvertimeAmount + totalFoodAllowance + totalOutstationAllowance + totalParkingAllowance
      };
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Driver Report');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=driver-report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Export driver report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export income vs expenses report
router.get('/income-expenses', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Income from bookings
    const income = await Booking.aggregate([
      { $match: startDate && endDate ? { startDate: dateQuery } : {} },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$startDate" } },
          totalIncome: { $sum: "$payment.receivedAmount" },
          totalBookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Expenses
    const expenses = await Expense.aggregate([
      { $match: startDate && endDate ? { date: dateQuery } : {} },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          totalExpenses: { $sum: "$amount" },
          categories: {
            $push: {
              category: "$category",
              amount: "$amount"
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const reportData = [];
    const allMonths = new Set([...income.map(i => i._id), ...expenses.map(e => e._id)]);

    allMonths.forEach(month => {
      const monthIncome = income.find(i => i._id === month);
      const monthExpenses = expenses.find(e => e._id === month);

      reportData.push({
        'Month': month,
        'Total Income': monthIncome?.totalIncome || 0,
        'Total Bookings': monthIncome?.totalBookings || 0,
        'Total Expenses': monthExpenses?.totalExpenses || 0,
        'Net Profit': (monthIncome?.totalIncome || 0) - (monthExpenses?.totalExpenses || 0),
        'Profit Margin %': monthIncome?.totalIncome ? 
          (((monthIncome.totalIncome - (monthExpenses?.totalExpenses || 0)) / monthIncome.totalIncome) * 100).toFixed(2) : 0
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Income vs Expenses');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=income-expenses-report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Export income vs expenses report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export mileage summary report
router.get('/mileage-summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const bookings = await Booking.find(query)
      .populate('vehicle', 'registrationNumber make model')
      .populate('customer', 'name')
      .sort({ startDate: -1 });

    const reportData = bookings.map(booking => ({
      'Booking Number': booking.bookingNumber,
      'Vehicle': booking.vehicle?.registrationNumber || 'N/A',
      'Customer': booking.customer?.name || 'N/A',
      'Start Date': moment(booking.startDate).format('DD/MM/YYYY'),
      'End Date': moment(booking.endDate).format('DD/MM/YYYY'),
      'Start Mileage': booking.mileage.start,
      'End Mileage': booking.mileage.end || 'N/A',
      'Total Mileage': booking.mileage.total,
      'Duration (Days)': booking.totalDays,
      'Mileage Per Day': booking.totalDays > 0 ? (booking.mileage.total / booking.totalDays).toFixed(2) : 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mileage Summary');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=mileage-summary-report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Export mileage summary report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly report data for dashboard
router.get('/monthly', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const bookings = await Booking.find({
      startDate: { $gte: start, $lte: end }
    }).populate('vehicle').populate('outsourcedVehicle');

    // Group by month
    const monthlyData = {};
    bookings.forEach(booking => {
      const month = moment(booking.startDate).format('YYYY-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month: moment(booking.startDate).format('MMM YYYY'),
          totalBookings: 0,
          totalRevenue: 0,
          ownFleetRevenue: 0,
          outsourcedRevenue: 0
        };
      }
      monthlyData[month].totalBookings++;
      monthlyData[month].totalRevenue += booking.totalRent;
      if (booking.vehicle) {
        monthlyData[month].ownFleetRevenue += booking.totalRent;
      } else {
        monthlyData[month].outsourcedRevenue += booking.totalRent;
      }
    });

    res.json({
      monthlyRentals: Object.values(monthlyData),
      financialSummary: {
        totalRevenue: bookings.reduce((sum, b) => sum + b.totalRent, 0),
        totalExpenses: 0, // Would need to calculate from expenses
        netProfit: bookings.reduce((sum, b) => sum + b.totalRent, 0),
        ownFleetProfit: bookings.filter(b => b.vehicle).reduce((sum, b) => sum + b.totalRent, 0),
        outsourcedProfit: bookings.filter(b => b.outsourcedVehicle).reduce((sum, b) => sum + b.totalRent, 0)
      }
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vehicle performance report
router.get('/vehicles', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const vehicles = await Vehicle.find();
    const vehiclePerformance = [];

    for (const vehicle of vehicles) {
      const bookings = await Booking.find({
        vehicle: vehicle._id,
        startDate: { $gte: start, $lte: end }
      });

      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum, b) => sum + b.totalRent, 0);
      const totalDays = bookings.reduce((sum, b) => sum + b.totalDays, 0);
      const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const utilizationRate = totalDays / daysInPeriod;

      vehiclePerformance.push({
        vehicleId: vehicle._id,
        make: vehicle.make,
        model: vehicle.model,
        licensePlate: vehicle.registrationNumber,
        totalBookings,
        totalRevenue,
        utilizationRate: Math.min(utilizationRate, 1)
      });
    }

    res.json({ vehiclePerformance });
  } catch (error) {
    console.error('Error generating vehicle report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get driver performance report
router.get('/drivers', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const drivers = await Driver.find();
    const driverPerformance = [];

    for (const driver of drivers) {
      const assignments = await Booking.find({
        driver: driver._id,
        startDate: { $gte: start, $lte: end }
      });

      const expenses = await Expense.find({
        driverId: driver._id,
        date: { $gte: start, $lte: end }
      });

      driverPerformance.push({
        driverId: driver._id,
        name: driver.name,
        totalAssignments: assignments.length,
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        avgRating: driver.rating || 4.0
      });
    }

    res.json({ driverPerformance });
  } catch (error) {
    console.error('Error generating driver report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get financial summary report
router.get('/financial', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const bookings = await Booking.find({
      startDate: { $gte: start, $lte: end }
    }).populate('vehicle').populate('outsourcedVehicle');

    const expenses = await Expense.find({
      date: { $gte: start, $lte: end }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalRent, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const ownFleetRevenue = bookings.filter(b => b.vehicle).reduce((sum, b) => sum + b.totalRent, 0);
    const outsourcedRevenue = bookings.filter(b => b.outsourcedVehicle).reduce((sum, b) => sum + b.totalRent, 0);

    res.json({
      financialSummary: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        ownFleetProfit: ownFleetRevenue,
        outsourcedProfit: outsourcedRevenue
      }
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export reports to Excel
router.get('/export/:reportType', auth, async (req, res) => {
  try {
    const { reportType } = req.params;
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    let reportData = [];
    let filename = `${reportType}-report`;

    switch (reportType) {
      case 'monthly': {
        const bookings = await Booking.find({
          startDate: { $gte: start, $lte: end }
        }).populate('vehicle').populate('outsourcedVehicle');

        const monthlyData = {};
        bookings.forEach(booking => {
          const month = moment(booking.startDate).format('YYYY-MM');
          if (!monthlyData[month]) {
            monthlyData[month] = {
              month: moment(booking.startDate).format('MMM YYYY'),
              totalBookings: 0,
              totalRevenue: 0,
              ownFleetRevenue: 0,
              outsourcedRevenue: 0
            };
          }
          monthlyData[month].totalBookings++;
          monthlyData[month].totalRevenue += booking.totalRent;
          if (booking.vehicle) {
            monthlyData[month].ownFleetRevenue += booking.totalRent;
          } else {
            monthlyData[month].outsourcedRevenue += booking.totalRent;
          }
        });
        reportData = Object.values(monthlyData);
        break;
      }
      case 'vehicles': {
        const vehicles = await Vehicle.find();
        for (const vehicle of vehicles) {
          const bookings = await Booking.find({
            vehicle: vehicle._id,
            startDate: { $gte: start, $lte: end }
          });
          const totalRevenue = bookings.reduce((sum, b) => sum + b.totalRent, 0);
          reportData.push({
            make: vehicle.make,
            model: vehicle.model,
            licensePlate: vehicle.registrationNumber,
            totalBookings: bookings.length,
            totalRevenue
          });
        }
        break;
      }
      case 'drivers': {
        const drivers = await Driver.find();
        for (const driver of drivers) {
          const assignments = await Booking.find({
            driver: driver._id,
            startDate: { $gte: start, $lte: end }
          });
          const expenses = await Expense.find({
            driverId: driver._id,
            date: { $gte: start, $lte: end }
          });
          reportData.push({
            name: driver.name,
            totalAssignments: assignments.length,
            totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0)
          });
        }
        break;
      }
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportType);

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
