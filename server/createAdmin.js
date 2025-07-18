const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@carrental.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@carrental.com');
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@carrental.com',
      password: 'admin123',
      role: 'Owner'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('=================================');
    console.log('LOGIN CREDENTIALS:');
    console.log('Email: admin@carrental.com');
    console.log('Password: admin123');
    console.log('=================================');
    console.log('Please change these credentials after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser();
