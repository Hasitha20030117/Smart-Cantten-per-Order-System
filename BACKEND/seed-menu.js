import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';

dotenv.config();

const menuItems = [
  {
    name: 'Harvest Bowl',
    description: 'Fresh greens, quinoa, roasted vegetables, avocado, lemon tahini dressing',
    category: 'vegetarian',
    price: 12.99,
    preparationTime: 10,
    spicyLevel: 'mild',
    dietary: ['vegetarian', 'gluten-free']
  },
  {
    name: 'Bento Box',
    description: 'Grilled chicken, rice, vegetables, miso soup, pickled radish',
    category: 'main',
    price: 15.99,
    preparationTime: 15,
    spicyLevel: 'medium',
    dietary: ['contains soy']
  },
  {
    name: 'Massive Wrap',
    description: 'Grilled chicken, lettuce, tomato, avocado, spicy mayo, wrapped in tortilla',
    category: 'main',
    price: 11.99,
    preparationTime: 8,
    spicyLevel: 'spicy',
    dietary: []
  },
  {
    name: 'Vegan Buddha Bowl',
    description: 'Quinoa, chickpeas, roasted sweet potato, kale, avocado, tahini dressing',
    category: 'vegan',
    price: 13.99,
    preparationTime: 12,
    spicyLevel: 'mild',
    dietary: ['vegan', 'gluten-free']
  },
  {
    name: 'Classic Burger',
    description: 'Beef patty, lettuce, tomato, cheese, special sauce, brioche bun',
    category: 'main',
    price: 14.99,
    preparationTime: 12,
    spicyLevel: 'mild',
    dietary: []
  },
  {
    name: 'Caesar Salad',
    description: 'Romaine lettuce, croutons, parmesan, Caesar dressing, grilled chicken',
    category: 'main',
    price: 13.99,
    preparationTime: 8,
    spicyLevel: 'mild',
    dietary: []
  },
  {
    name: 'Iced Coffee',
    description: 'Fresh brewed coffee, ice, milk, vanilla syrup',
    category: 'beverage',
    price: 4.99,
    preparationTime: 3,
    spicyLevel: 'mild',
    dietary: ['contains dairy']
  },
  {
    name: 'Fresh Juice',
    description: 'Orange, carrot, ginger, apple - freshly squeezed',
    category: 'beverage',
    price: 5.99,
    preparationTime: 5,
    spicyLevel: 'mild',
    dietary: ['vegan']
  },
  {
    name: 'Chicken Wrap',
    description: 'Grilled chicken, lettuce, tomato, ranch dressing',
    category: 'main',
    price: 10.99,
    preparationTime: 7,
    spicyLevel: 'mild',
    dietary: []
  },
  {
    name: 'Vegetable Curry',
    description: 'Mixed vegetables in coconut curry, served with rice',
    category: 'vegetarian',
    price: 12.99,
    preparationTime: 15,
    spicyLevel: 'medium',
    dietary: ['vegetarian']
  }
];

const seedMenu = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing menu items
    const deleted = await MenuItem.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing menu items`);
    
    // Insert new menu items
    const inserted = await MenuItem.insertMany(menuItems);
    console.log(`✅ Added ${inserted.length} menu items to database`);
    
    // List all menu items
    console.log('\n📋 Menu Items in Database:');
    inserted.forEach(item => {
      console.log(`   - ${item.name} ($${item.price}) - ${item.category}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    console.log('\n🎉 Menu seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding menu:', error.message);
    process.exit(1);
  }
};

seedMenu();