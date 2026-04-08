import OrderManagementOrder from "../../models/OrderManagement/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { customerName, canteen, items, totalAmount, timeSlot } = req.body;

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
    const orders = await OrderManagementOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderManagementOrder.findById(id);

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
    const orders = await OrderManagementOrder.find({ canteen, timeSlot });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await OrderManagementOrder.findByIdAndUpdate(id, { status }, { new: true });
    res.json(order);
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
