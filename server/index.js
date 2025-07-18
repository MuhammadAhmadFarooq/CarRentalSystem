const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car_rental_admin')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/outsourced-vehicles', require('./routes/outsourcedVehicles'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/vendor-transactions', require('./routes/vendorTransactions'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Car Rental Admin API Server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
