import Menu from "../../models/Menu.js";

// Generate unique reference number
const generateRefNumber = async (canteen) => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const canteenCode = canteen.slice(0, 2).toUpperCase();
  
  // Get count of items added today for this canteen
  const count = await Menu.countDocuments({
    canteen: canteen,
    createdAt: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    },
  });

  return `${canteenCode}-${dateStr}-${String(count + 1).padStart(3, '0')}`;
};

// Add new menu item
export const addMenuItem = async (req, res) => {
  try {
    const { canteen, name, description, category, price, preparationTime, image, spicyLevel, dietary, quantity } = req.body;

    // Validation
    if (!canteen || !name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'canteen, name, category, and price are required fields',
      });
    }

    // Check if item name already exists for this canteen
    const existingItem = await Menu.findOne({ canteen, name: { $regex: name, $options: 'i' } });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: `Item "${name}" already exists in ${canteen}`,
      });
    }

    // Generate unique reference number
    const refNumber = await generateRefNumber(canteen);

    const newMenuItem = new Menu({
      refNumber,
      canteen,
      name,
      description,
      category,
      price,
      preparationTime: preparationTime || 15,
      image,
      spicyLevel: spicyLevel || 'none',
      dietary: dietary || [],
      quantity: quantity || 0,
      createdBy: req.user?._id,
    });

    await newMenuItem.save();

    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      data: {
        _id: newMenuItem._id,
        refNumber: newMenuItem.refNumber,
        canteen: newMenuItem.canteen,
        name: newMenuItem.name,
        category: newMenuItem.category,
        price: newMenuItem.price,
        preparationTime: newMenuItem.preparationTime,
        isAvailable: newMenuItem.isAvailable,
        spicyLevel: newMenuItem.spicyLevel,
        dietary: newMenuItem.dietary,
        quantity: newMenuItem.quantity,
        createdAt: newMenuItem.createdAt,
      },
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding menu item',
      error: error.message,
    });
  }
};

// Get menu by canteen
export const getMenuByCanteen = async (req, res) => {
  try {
    const { canteen } = req.params;
    const { category, isAvailable } = req.query;

    const filter = { canteen };

    if (category) {
      filter.category = category;
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    const menuItems = await Menu.find(filter).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: menuItems.length,
      canteen,
      data: menuItems,
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu',
      error: error.message,
    });
  }
};

// Get all menu items (admin view)
export const getAllMenuItems = async (req, res) => {
  try {
    const { canteen, category, isAvailable } = req.query;
    const filter = {};

    if (canteen) {
      filter.canteen = canteen;
    }

    if (category) {
      filter.category = category;
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    const menuItems = await Menu.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ canteen: 1, category: 1, name: 1 });

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    console.error('Get all menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
      error: error.message,
    });
  }
};

// Get menu item by ref number
export const getMenuItemByRef = async (req, res) => {
  try {
    const { refNumber } = req.params;

    const menuItem = await Menu.findOne({ refNumber })
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: `Menu item with ref number ${refNumber} not found`,
      });
    }

    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item',
      error: error.message,
    });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, preparationTime, image, isAvailable, spicyLevel, dietary, quantity } = req.body;

    const menuItem = await Menu.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    // Check if updating name and if it's already taken by another item
    if (name && name !== menuItem.name) {
      const existingItem = await Menu.findOne({
        canteen: menuItem.canteen,
        _id: { $ne: id },
        name: { $regex: name, $options: 'i' },
      });
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: `Item "${name}" already exists in ${menuItem.canteen}`,
        });
      }
    }

    // Update fields
    if (name) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (category) menuItem.category = category;
    if (price) menuItem.price = price;
    if (preparationTime) menuItem.preparationTime = preparationTime;
    if (image !== undefined) menuItem.image = image;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
    if (spicyLevel) menuItem.spicyLevel = spicyLevel;
    if (dietary) menuItem.dietary = dietary;
    if (quantity !== undefined) menuItem.quantity = quantity;
    menuItem.updatedBy = req.user?._id;

    await menuItem.save();

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem,
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message,
    });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await Menu.findByIdAndDelete(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully',
      data: { refNumber: menuItem.refNumber, name: menuItem.name },
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: error.message,
    });
  }
};

// Toggle availability
export const toggleMenuItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await Menu.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    menuItem.updatedBy = req.user?._id;
    await menuItem.save();

    res.json({
      success: true,
      message: `Menu item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`,
      data: {
        _id: menuItem._id,
        refNumber: menuItem.refNumber,
        name: menuItem.name,
        isAvailable: menuItem.isAvailable,
      },
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling menu item availability',
      error: error.message,
    });
  }
};

// Get menu statistics
export const getMenuStatistics = async (req, res) => {
  try {
    const { canteen } = req.query;
    const filter = canteen ? { canteen } : {};

    const stats = await Menu.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$canteen',
          totalItems: { $sum: 1 },
          availableItems: {
            $sum: { $cond: ['$isAvailable', 1, 0] },
          },
          categories: { $addToSet: '$category' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $project: {
          _id: 0,
          canteen: '$_id',
          totalItems: 1,
          availableItems: 1,
          totalCategories: { $size: '$categories' },
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: 1,
          maxPrice: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu statistics',
      error: error.message,
    });
  }
};
