import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  refNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  canteen: {
    type: String,
    required: true,
    enum: ['Main Canteen', 'Juice Bar', 'New canteen', 'Anohana canteen'],
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['main', 'vegetarian', 'vegan', 'beverage', 'snack', 'dessert'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: 1,
  },
  image: {
    type: String,
    default: null,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  spicyLevel: {
    type: String,
    enum: ['mild', 'medium', 'spicy', 'none'],
    default: 'none',
  },
  dietary: [
    {
      type: String,
      enum: ['gluten-free', 'dairy-free', 'nut-free', 'vegan', 'vegetarian'],
    },
  ],
  quantity: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Index for querying by canteen
menuItemSchema.index({ canteen: 1, isAvailable: 1 });
menuItemSchema.index({ canteen: 1, refNumber: 1 });

const Menu = mongoose.model('Menu', menuItemSchema);
export default Menu;
