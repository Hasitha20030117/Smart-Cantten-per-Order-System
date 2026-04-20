import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/UserManagement/User.js';

dotenv.config();

const setupAdminUser = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB!');

    const adminEmail = 'it23754416@my.sliit.lk';
    const adminPassword = '123456789';

    // Check if user exists
    let user = await User.findOne({ email: adminEmail });

    if (user) {
      // Update existing user to admin
      console.log(`👤 Found existing user: ${adminEmail}`);
      console.log(`🔄 Updating role to 'admin'...`);
      
      user.role = 'admin';
      user.isVerified = true;
      
      await user.save();
      console.log(`✅ User role updated to admin successfully!`);
    } else {
      // Create new admin user
      console.log(`👤 User ${adminEmail} not found. Creating new admin user...`);
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const newUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        phoneNumber: '0123456789',
        address: 'Admin Address',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      });

      await newUser.save();
      console.log(`✅ Admin user created successfully!`);
    }

    console.log('\n📋 Admin User Details:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: admin`);
    console.log(`   Status: Ready for login`);

    await mongoose.disconnect();
    console.log('\n✅ Setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setupAdminUser();
