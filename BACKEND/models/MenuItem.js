import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['main', 'vegetarian', 'vegan', 'beverage', 'snack'], required: true },
  price: { type: Number, required: true },
  preparationTime: { type: Number, default: 15 },
  image: String,
  isAvailable: { type: Boolean, default: true },
  spicyLevel: { type: String, enum: ['mild', 'medium', 'spicy'], default: 'mild' },
  dietary: [String]
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;