const express = require('express');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all bookings
router.get('/', auth, async (req, res) => {
  try {
    const { status, paymentStatus, rentalType, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (rentalType) {
      query.rentalType = rentalType;
    }

    const bookings = await Booking.find(query)
      .populate('customer')
      .populate('vehicle')
      .populate('outsourcedVehicle')
      .populate('driver')
      .sort({ createdAt: -1 });

    if (search) {
      const filteredBookings = bookings.filter(booking =>
        booking.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
        booking.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        booking.vehicle?.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
        booking.outsourcedVehicle?.registrationNumber.toLowerCase().includes(search.toLowerCase())
      );
      return res.json(filteredBookings);
    }

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer')
      .populate('vehicle')
      .populate('outsourcedVehicle')
      .populate('driver');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    // Generate booking number if not provided
    if (!req.body.bookingNumber) {
      const count = await Booking.countDocuments();
      req.body.bookingNumber = `BK${String(count + 1).padStart(6, '0')}`;
    }

    const booking = new Booking(req.body);
    await booking.save();

    // Update vehicle status if it's an own vehicle
    if (booking.vehicle) {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'booked' });
    }

    // Update customer booking count
    await Customer.findByIdAndUpdate(
      booking.customer,
      { $inc: { totalBookings: 1 } }
    );

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer')
      .populate('vehicle')
      .populate('outsourcedVehicle')
      .populate('driver');

    res.status(201).json({ 
      message: 'Booking created successfully', 
      booking: populatedBooking 
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customer')
     .populate('vehicle')
     .populate('outsourcedVehicle')
     .populate('driver');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update vehicle status back to available if it's an own vehicle
    if (booking.vehicle) {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'available' });
    }

    // Update customer booking count
    await Customer.findByIdAndUpdate(
      booking.customer,
      { $inc: { totalBookings: -1 } }
    );

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete booking
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const { actualReturnDate, endMileage, expenses, driverAllowance } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        actualReturnDate,
        'mileage.end': endMileage,
        expenses,
        driverAllowance,
        status: 'completed'
      },
      { new: true }
    ).populate('customer')
     .populate('vehicle')
     .populate('outsourcedVehicle')
     .populate('driver');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update vehicle status and mileage if it's an own vehicle
    if (booking.vehicle) {
      await Vehicle.findByIdAndUpdate(booking.vehicle, {
        status: 'available',
        mileage: endMileage
      });
    }

    res.json({ message: 'Booking completed successfully', booking });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { receivedAmount, taxDeduction } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        'payment.receivedAmount': receivedAmount,
        'payment.taxDeduction': taxDeduction
      },
      { new: true }
    ).populate('customer')
     .populate('vehicle')
     .populate('outsourcedVehicle')
     .populate('driver');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Payment updated successfully', booking });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
