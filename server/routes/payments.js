const express = require('express');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all payments
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, category, search } = req.query;
    let query = {};

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const payments = await Payment.find(query)
      .populate('booking')
      .populate('customer')
      .sort({ createdAt: -1 });

    if (search) {
      const filteredPayments = payments.filter(payment =>
        payment.description.toLowerCase().includes(search.toLowerCase()) ||
        payment.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        payment.customer?.name.toLowerCase().includes(search.toLowerCase())
      );
      return res.json(filteredPayments);
    }

    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('customer');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating payment with data:', req.body);
    
    const payment = new Payment(req.body);
    await payment.save();

    const populatedPayment = await Payment.findById(payment._id)
      .populate('booking')
      .populate('customer');

    res.status(201).json({ 
      message: 'Payment created successfully', 
      payment: populatedPayment 
    });
  } catch (error) {
    console.error('Create payment error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors,
        details: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payment
router.put('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('booking')
     .populate('customer');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment updated successfully', payment });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete payment
router.delete('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Record payment
router.patch('/:id/record', auth, async (req, res) => {
  try {
    const { paidAmount, paymentDate, paymentMethod, referenceNumber } = req.body;
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { paidAmount: paidAmount },
        paymentDate,
        paymentMethod,
        referenceNumber
      },
      { new: true }
    ).populate('booking')
     .populate('customer');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment recorded successfully', payment });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get receivables summary
router.get('/summary/receivables', auth, async (req, res) => {
  try {
    const receivables = await Payment.aggregate([
      { $match: { type: 'Receivable' } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(receivables);
  } catch (error) {
    console.error('Get receivables summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payables summary
router.get('/summary/payables', auth, async (req, res) => {
  try {
    const payables = await Payment.aggregate([
      { $match: { type: 'Payable' } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(payables);
  } catch (error) {
    console.error('Get payables summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer payment balances
router.get('/balances', auth, async (req, res) => {
  try {
    const Customer = require('../models/Customer');
    const Booking = require('../models/Booking');
    
    // Get all customers
    const customers = await Customer.find({});
    const balances = [];
    
    for (const customer of customers) {
      // Get customer's bookings
      const bookings = await Booking.find({ customer: customer._id });
      
      // Get customer's payments
      const payments = await Payment.find({ customer: customer._id });
      
      // Calculate totals
      const totalBookings = bookings.length;
      const totalAmount = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      const paidAmount = payments.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0);
      const pendingAmount = totalAmount - paidAmount;
      
      balances.push({
        customerId: customer._id,
        customerName: customer.name,
        totalBookings,
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount: 0 // For now, we'll set this to 0
      });
    }
    
    res.json(balances);
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
