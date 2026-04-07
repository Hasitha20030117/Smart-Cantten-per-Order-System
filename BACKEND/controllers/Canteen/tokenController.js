import Order from "../../models/Canteen/Order.js";
import Payment from "../../models/Canteen/Payment.js";

export const verifyToken = async (req, res) => {
  try {
    const { tokenRef } = req.params;

    if (!tokenRef) {
      return res.status(400).json({ success: false, message: "tokenRef is required" });
    }

    const order = await Order.findOne({ tokenRef });
    if (!order) {
      return res.json({
        success: false,
        valid: false,
        reason: "Token not found",
        tokenRef,
      });
    }

    const payment = await Payment.findOne({ orderId: order._id }).sort({ createdAt: -1 });
    if (!payment) {
      return res.json({
        success: false,
        valid: false,
        reason: "No payment found for this token",
        tokenRef,
        orderId: order._id,
        orderStatus: order.status,
      });
    }

    const isValid = order.status === "PAID" && payment.status === "PAID";

    let reason = "";
    if (!isValid) {
      if (order.status === "EXPIRED") reason = "Order has expired";
      else if (order.status === "PENDING_PAYMENT") reason = "Payment not completed";
      else if (payment.status === "REJECTED") reason = "Payment was rejected";
      else if (payment.status === "UNDER_REVIEW") reason = "Payment is under review";
      else if (payment.status === "PENDING") reason = "Payment is pending";
      else if (payment.status === "EXPIRED") reason = "Payment has expired";
      else reason = "Payment not verified";
    }

    res.json({
      success: true,
      valid: isValid,
      reason: isValid ? "Token is valid" : reason,
      tokenRef,
      orderId: order._id,
      paymentStatus: payment.status,
      orderStatus: order.status,
      amount: order.totalAmount,
      items: order.items,
      createdAt: order.createdAt,
      paidAt: payment.status === "PAID" ? payment.verifiedAt || payment.updatedAt : null,
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
