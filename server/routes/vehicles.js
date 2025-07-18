const express = require('express');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all vehicles
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
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vehicle by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create vehicle
router.post('/', auth, async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json({ message: 'Vehicle created successfully', vehicle });
  } catch (error) {
    console.error('Create vehicle error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Vehicle with this registration number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vehicle
router.put('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete vehicle
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add maintenance log
router.post('/:id/maintenance', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    vehicle.maintenanceLogs.push(req.body);
    await vehicle.save();

    res.json({ message: 'Maintenance log added successfully', vehicle });
  } catch (error) {
    console.error('Add maintenance log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vehicle status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle status updated successfully', vehicle });
  } catch (error) {
    console.error('Update vehicle status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
