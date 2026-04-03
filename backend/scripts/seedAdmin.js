require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const existing = await User.findOne({ email: 'admin@test.com' });

    if (existing) {
      console.log('Admin user already exists. Skipping.');
      return process.exit(0);
    }

    await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      // Password is hashed automatically by the User model's pre-save hook
      password: 'Admin@123',
      role: 'admin',
      status: 'active'
    });

    console.log('✅ Admin user created: admin@test.com / Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();
