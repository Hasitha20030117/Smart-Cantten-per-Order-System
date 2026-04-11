import mongoose from 'mongoose';
import User from './models/UserManagement/User.js';

const addDemoRewards = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Find or create demo user
    let demoUser = await User.findOne({ email: 'demo@smartcanteen.com' });
    
    if (!demoUser) {
      console.log('📌 Demo user not found. Creating...');
      demoUser = await User.create({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@smartcanteen.com',
        phoneNumber: '9876543210',
        address: 'Demo Address, Smart Canteen Campus',
        password: 'demopass123',
        role: 'customer',
        rewardPoints: {}
      });
      console.log('✅ Demo user created:', demoUser._id);
    }

    // Add reward points across canteens
    console.log('\n📝 Adding reward points...');
    
    const rewardsToAdd = [
      { canteen: 'NewCanteen', points: 4 },
      { canteen: 'Juice Bar', points: 3 },
      { canteen: 'Basement Canteen', points: 2 },
      { canteen: 'Anohana Canteen', points: 1 }
    ];

    for (const reward of rewardsToAdd) {
      const currentPoints = demoUser.rewardPoints.get(reward.canteen) || 0;
      demoUser.rewardPoints.set(reward.canteen, currentPoints + reward.points);
      console.log(`  ✓ ${reward.canteen}: +${reward.points} points (Total: ${currentPoints + reward.points})`);
    }

    await demoUser.save();
    console.log('✅ Saved to database');

    // Show summary
    console.log('\n🎯 REWARD POINTS SUMMARY:');
    console.log('=====================================');
    console.log(`Total Points: ${demoUser.totalRewardPoints}`);
    console.log(`Total Value: ₹${demoUser.totalRewardPoints * 10}`);
    console.log('\nBreakdown by Canteen:');
    for (const [canteen, points] of demoUser.rewardPoints) {
      console.log(`  ${canteen}: ${points} points (₹${points * 10})`);
    }
    console.log('=====================================\n');

    console.log('📊 Test API Endpoints:');
    console.log(`GET  http://localhost:5000/api/user/selectUser/${demoUser._id}`);
    console.log(`POST http://localhost:5000/api/user/award-points`);
    console.log('   Body: {"userId":"' + demoUser._id + '","canteenId":"TestCanteen","pointsToAdd":5}');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Done!');
  }
};

addDemoRewards();
