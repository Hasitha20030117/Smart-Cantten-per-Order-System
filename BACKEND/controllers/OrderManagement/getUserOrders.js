import OrderManagementOrder from "../../models/OrderManagement/Order.js";

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await OrderManagementOrder.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email');
    
    // Add pointsEarned dummy/logic (1 point per completed order for history)
    const history = orders.map(order => ({
      ...order._doc,
      pointsEarned: order.status === 'completed' ? 1 : 0,
      pointsValue: order.status === 'completed' ? 10 : 0  // ₹10 per point
    }));

    res.json({
      success: true,
      count: orders.length,
      history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

