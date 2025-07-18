const express = require('express');
const moment = require('moment');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// Get dashboard summary
router.get('/summary', auth, async (req, res) => {
  try {
    const currentMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');

    // Monthly Income
    const monthlyIncome = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth.toDate(), $lte: endOfMonth.toDate() },
          paymentStatus: { $in: ['Paid', 'Partial'] }
        }
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$payment.receivedAmount' }
        }
      }
    ]);

    // Total Trips This Month
    const totalTrips = await Booking.countDocuments({
      createdAt: { $gte: currentMonth.toDate(), $lte: endOfMonth.toDate() }
    });

    // Outstanding Receivables
    const outstandingReceivables = await Payment.aggregate([
      { $match: { type: 'Receivable', status: { $in: ['Pending', 'Partial'] } } },
      { $group: { _id: null, total: { $sum: '$balanceAmount' } } }
    ]);

    // Outstanding Payables
    const outstandingPayables = await Payment.aggregate([
      { $match: { type: 'Payable', status: { $in: ['Pending', 'Partial'] } } },
      { $group: { _id: null, total: { $sum: '$balanceAmount' } } }
    ]);

    // Fuel & Toll Expenses (Monthly)
    const fuelTollExpenses = await Expense.aggregate([
      {
        $match: {
          date: { $gte: currentMonth.toDate(), $lte: endOfMonth.toDate() },
          category: { $in: ['Fuel', 'Toll'] }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Driver Expense Summary
    const driverExpenses = await Expense.aggregate([
      {
        $match: {
          date: { $gte: currentMonth.toDate(), $lte: endOfMonth.toDate() },
          category: { $in: ['Food', 'Parking'] }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Vehicle Status Summary
    const vehicleStatus = await Vehicle.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      monthlyIncome: monthlyIncome[0]?.totalIncome || 0,
      totalTrips,
      outstandingReceivables: outstandingReceivables[0]?.total || 0,
      outstandingPayables: outstandingPayables[0]?.total || 0,
      fuelTollExpenses,
      driverExpenses,
      vehicleStatus,
      month: currentMonth.format('MMMM YYYY')
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly revenue chart data
router.get('/revenue-chart', auth, async (req, res) => {
  try {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, 'months').startOf('month');
      last6Months.push({
        start: month.toDate(),
        end: moment(month).endOf('month').toDate(),
        label: month.format('MMM YYYY')
      });
    }

    const revenueData = await Promise.all(
      last6Months.map(async (month) => {
        const revenue = await Booking.aggregate([
          {
            $match: {
              createdAt: { $gte: month.start, $lte: month.end },
              paymentStatus: { $in: ['Paid', 'Partial'] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$payment.receivedAmount' }
            }
          }
        ]);

        return {
          month: month.label,
          revenue: revenue[0]?.total || 0
        };
      })
    );

    res.json(revenueData);
  } catch (error) {
    console.error('Get revenue chart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activities
router.get('/recent-activities', auth, async (req, res) => {
  try {
    const recentBookings = await Booking.find()
      .populate('customer', 'name')
      .populate('vehicle', 'registrationNumber')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('bookingNumber customer vehicle status createdAt');

    const recentExpenses = await Expense.find()
      .populate('vehicle', 'registrationNumber')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('description category amount date');

    res.json({
      recentBookings,
      recentExpenses
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top customers
router.get('/top-customers', auth, async (req, res) => {
  try {
    const topCustomers = await Booking.aggregate([
      {
        $group: {
          _id: '$customer',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$payment.receivedAmount' }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          name: '$customer.name',
          totalBookings: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json(topCustomers);
  } catch (error) {
    console.error('Get top customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
