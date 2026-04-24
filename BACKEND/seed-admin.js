import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/UserManagement/User.js';

const seedAdmin = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL || 'mongodb+srv://itpmproject:pMr9fAKeWttSTyct@itpmproject.kseofgi.mongodb.net/smart_canteen?retryWrites=true&w=majority&appName=ITPMProject';
    if (!process.env.MONGODB_URL) {
      console.warn('⚠️ MONGODB_URL not set; falling back to', mongoUrl);
    }
    await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB at', mongoUrl);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartcanteen.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpass123';

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    let admin = await User.findOne({ email: adminEmail }).select('+password');
    if (!admin) {
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        phoneNumber: '9999999999',
        address: 'Admin Address, Smart Canteen',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Admin user created:', admin._id);
    } else {
      let changed = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        changed = true;
      }
      // Update password to hashed admin password to ensure seed credentials work
      if (!admin.password || !(await bcrypt.compare(adminPassword, admin.password))) {
        admin.password = hashedPassword;
        changed = true;
        console.log('🔒 Admin password updated to seeded value (hashed).');
      }
      if (changed) {
        await admin.save();
        console.log('✅ Existing user updated:', admin._id);
      } else {
        console.log('ℹ️ Admin user already exists and is up-to-date:', admin._id);
      }
    }

    console.log('\nAdmin credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('\nTip: set ADMIN_EMAIL and ADMIN_PASSWORD env vars to override defaults before running this script.');
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
