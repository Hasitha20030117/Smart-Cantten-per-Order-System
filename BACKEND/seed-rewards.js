import mongoose from 'mongoose';
import OrderManagementOrder from './models/OrderManagement/Order.js';
import User from './models/UserManagement/User.js';

const CANTEENS = ['Juice Bar', 'Basement Canteen', 'New Canteen', 'Anohana Canteen'];

const seedRewards = async () => {
  try {
    // Connect to DB (use your .env MONGODB_URL)
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Clean existing data
    await OrderManagementOrder.deleteMany({});
    await User.deleteMany({});

    // Create demo user for profile (10 reward points across 4 canteens)
    let demoUser = await User.findOne({ email: 'demo@smartcanteen.com' });
    if (!demoUser) {
      demoUser = await User.create({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@smartcanteen.com',
        phoneNumber: '9876543210',
        address: 'Demo Address, Smart Canteen Campus',
        password: 'demopass123', // dummy hash not needed for demo
        role: 'customer',
        rewardPoints: { 
          'NewCanteen': 4,           // 4 points = ₹40
          'Juice Bar': 3,            // 3 points = ₹30
          'Basement Canteen': 2,     // 2 points = ₹20
          'Anohana Canteen': 1       // 1 point = ₹10
        }, // Total 10 points = ₹100
      });
      console.log('✅ Demo user created for profile:', demoUser._id);
    } else {
      // Ensure demo has exactly 10 points across canteens
      demoUser.rewardPoints.set('NewCanteen', 4);
      demoUser.rewardPoints.set('Juice Bar', 3);
      demoUser.rewardPoints.set('Basement Canteen', 2);
      demoUser.rewardPoints.set('Anohana Canteen', 1);
      await demoUser.save();
      console.log('✅ Demo user updated with 10 points:', demoUser._id);
    }

    // Create test user (separate from demo)
    let testUser = await User.findOne({ email: 'test@smartcanteen.com' });
    if (!testUser) {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@smartcanteen.com',
        phoneNumber: '1234567890',
        address: 'Test Address',
        password: 'hashedpassword',
        role: 'customer',
      });
      console.log('✅ Test user created:', testUser._id);
    }

    // Create 25 orders across canteens (5-7 per canteen to test points)
    const orders = [];
    for (let i = 0; i < 25; i++) {
      const canteen = CANTEENS[i % CANTEENS.length];
      const timeSlot = `Lunch ${Math.floor(i / 4) + 1}`;
      const status = i % 3 === 0 ? 'completed' : 'ready'; // ~33% completed

      const order = await OrderManagementOrder.create({
        customerName: 'Test User',
        canteen,
        userId: testUser._id,
        items: [
          {
            name: `${canteen} - Item ${i + 1}`,
            quantity: 1,
            price: 50,
          },
        ],
        totalAmount: 50,
        timeSlot,
        status,
      });
      orders.push(order);
    }

    console.log('✅ Created 25 orders across canteens');

    // Test complete one more to trigger points
    const lastOrder = orders[orders.length - 1];
    const completedOrder = await OrderManagementOrder.findByIdAndUpdate(
      lastOrder._id,
      { status: 'completed' },
      { new: true }
    );

    console.log('✅ Final order completed to trigger rewards');

    // Show results
    const user = await User.findById(testUser._id);
    console.log('\n🎯 Reward Points Summary (Demo User):');
    console.log('Total Points:', user.totalRewardPoints);
    console.log('Rupee Value: ₹' + (user.totalRewardPoints * 10));
    console.log('Per Canteen:');
    for (const [canteen, points] of user.rewardPoints) {
      console.log(`  ${canteen}: ${points} points (₹${points * 10})`);
    }

    console.log('\n✅ Seeding complete!');
    console.log('Test endpoints:');
    console.log('GET http://localhost:5000/api/orders/rewards/' + testUser._id);
    console.log('All orders: http://localhost:5000/api/orders');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedRewards();
