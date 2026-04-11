import OrderManagementOrder from "../../models/OrderManagement/Order.js";
import User from "../../models/UserManagement/User.js";

export const createOrder = async (req, res) => {
  try {
    const { customerName, canteen, items, totalAmount, timeSlot, userId } = req.body;

    const lastOrder = await OrderManagementOrder.findOne({
      canteen,
      timeSlot,
    }).sort({ tokenNumber: -1 });

    let tokenNumber = 1;
    if (lastOrder?.tokenNumber) {
      tokenNumber = lastOrder.tokenNumber + 1;
    }

    const order = await OrderManagementOrder.create({
      customerName,
      canteen,
      items,
      totalAmount,
      timeSlot,
      tokenNumber,
      ...(userId && { userId }),
    });

    res.status(201).json({
      message: "Order placed successfully",
      tokenNumber,
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (_req, res) => {
  try {
    const orders = await OrderManagementOrder.find().sort({ createdAt: -1 }).populate('userId', 'firstName lastName email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderManagementOrder.findById(id).populate('userId', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersBySlot = async (req, res) => {
  try {
    const { canteen, timeSlot } = req.query;
    const orders = await OrderManagementOrder.find({ canteen, timeSlot }).populate('userId', 'firstName lastName email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await OrderManagementOrder.findByIdAndUpdate(id, { status }, { new: true }).populate('userId', 'firstName lastName email');
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const completeOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    
    // Verify order exists and set status
    const order = await OrderManagementOrder.findByIdAndUpdate(
      orderId,
      { status: 'completed', completedAt: new Date() },
      { new: true, populate: 'userId' }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const targetUserId = order.userId || userId;
    if (!targetUserId) {
      return res.status(400).json({ error: 'userId required for rewards' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const canteenKey = order.canteen;
    const orderCount = await OrderManagementOrder.countDocuments({
      userId: targetUserId,
      canteen: canteenKey,
      status: 'completed'
    });

    // 1 point per 5 orders
    const pointsToAdd = Math.floor(orderCount / 5);
    const currentPoints = user.rewardPoints.get(canteenKey) || 0;
    user.rewardPoints.set(canteenKey, currentPoints + pointsToAdd);
    await user.save();

    res.json({
      success: true,
      message: `Order completed. Awarded ${pointsToAdd} points for ${canteenKey} (total ${orderCount} orders). Total points: ${user.totalRewardPoints}`,
      order,
      rewards: {
        canteen: canteenKey,
        pointsAdded: pointsToAdd,
        totalForCanteen: user.rewardPoints.get(canteenKey),
        grandTotal: user.totalRewardPoints
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserRewards = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('rewardPoints totalRewardPoints firstName email');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const rewards = Array.from(user.rewardPoints.entries()).map(([canteen, points]) => ({
      canteen,
      points,
    })).sort((a, b) => b.points - a.points);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName || ''}`,
        email: user.email,
        totalRewardPoints: user.totalRewardPoints
      },
      rewardsByCanteen: rewards,
      rawRewardPoints: Object.fromEntries(user.rewardPoints)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, canteen, items, totalAmount, timeSlot } = req.body;

    const order = await OrderManagementOrder.findByIdAndUpdate(
      id,
      { customerName, canteen, items, totalAmount, timeSlot },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderManagementOrder.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Order deleted successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
