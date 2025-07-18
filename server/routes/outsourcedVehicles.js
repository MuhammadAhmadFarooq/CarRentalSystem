const express = require('express');
const OutsourcedVehicle = require('../models/OutsourcedVehicle');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all outsourced vehicles
router.get('/', auth, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } }
      ];
    }

    const vehicles = await OutsourcedVehicle.find(query).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Get outsourced vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get outsourced vehicle by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await OutsourcedVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Outsourced vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Get outsourced vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create outsourced vehicle
router.post('/', auth, async (req, res) => {
  try {
    const vehicle = new OutsourcedVehicle(req.body);
    await vehicle.save();
    res.status(201).json({ message: 'Outsourced vehicle created successfully', vehicle });
  } catch (error) {
    console.error('Create outsourced vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update outsourced vehicle
router.put('/:id', auth, async (req, res) => {
  try {
    const vehicle = await OutsourcedVehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!vehicle) {
      return res.status(404).json({ message: 'Outsourced vehicle not found' });
    }
    res.json({ message: 'Outsourced vehicle updated successfully', vehicle });
  } catch (error) {
    console.error('Update outsourced vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete outsourced vehicle
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await OutsourcedVehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Outsourced vehicle not found' });
    }
    res.json({ message: 'Outsourced vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete outsourced vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment status
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { paidAmount } = req.body;
    const vehicle = await OutsourcedVehicle.findByIdAndUpdate(
      req.params.id,
      { paidAmount },
      { new: true }
    );
    if (!vehicle) {
      return res.status(404).json({ message: 'Outsourced vehicle not found' });
    }
    res.json({ message: 'Payment updated successfully', vehicle });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
