const express = require('express');
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all drivers
router.get('/', auth, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const drivers = await Driver.find(query)
      .populate('assignedVehicle')
      .sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get driver by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('assignedVehicle');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create driver
router.post('/', auth, async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json({ message: 'Driver created successfully', driver });
  } catch (error) {
    console.error('Create driver error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Driver with this CNIC already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update driver
router.put('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedVehicle');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json({ message: 'Driver updated successfully', driver });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete driver
router.delete('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add monthly expense
router.post('/:id/expenses', auth, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const calculatedExpense = driver.calculateMonthlyExpense(req.body);
    const expenseData = {
      ...req.body,
      ...calculatedExpense
    };

    driver.monthlyExpenses.push(expenseData);
    await driver.save();

    res.json({ message: 'Monthly expense added successfully', driver });
  } catch (error) {
    console.error('Add driver expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get driver trip log
router.get('/:id/trips', auth, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const trips = await Booking.find({ driver: req.params.id })
      .populate('vehicle')
      .populate('customer')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Get driver trips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign vehicle to driver
router.patch('/:id/assign-vehicle', auth, async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { assignedVehicle: vehicleId },
      { new: true }
    ).populate('assignedVehicle');
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json({ message: 'Vehicle assigned successfully', driver });
  } catch (error) {
    console.error('Assign vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
