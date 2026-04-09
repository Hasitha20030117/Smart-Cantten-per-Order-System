import fs from "fs";
import path from "path";
import Order from "../../models/Canteen/Order.js";
import Payment from "../../models/Canteen/Payment.js";

const normalizeItems = (items = []) =>
  items
    .map((item) => ({
      name: String(item?.name || "").trim(),
      qty: Number(item?.qty || item?.quantity || 1),
      price: Number(item?.price || 0),
    }))
    .filter((item) => item.name && item.qty > 0);

const serializeOrder = (order) => {
  if (!order) {
    return null;
  }

  return {
    id: order._id,
    tokenRef: order.tokenRef,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    sourceOrderId: order.sourceOrderId,
    sourceType: order.sourceType,
    items: order.items,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const buildReceipt = (payment, order) => ({
  receiptNo: `RCP-${payment._id.toString().slice(-8).toUpperCase()}`,
  paymentId: payment._id,
  paidAt: payment.verifiedAt || payment.updatedAt,
  tokenRef: payment.tokenRef,
  customerName: order?.customerName || null,
  customerEmail: order?.customerEmail || null,
  items: order?.items || [],
  totalAmount: payment.amount,
  method: payment.method,
  status: payment.status,
  createdAt: payment.createdAt,
});

export const startPayment = async (req, res) => {
  try {
    const { method, orderData } = req.body;

    if (!method) {
      return res.status(400).json({ success: false, message: "Payment method is required" });
    }

    if (!["ONLINE_SIM", "QR_SIM", "BANK_SLIP_SIM"].includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    const normalizedItems = normalizeItems(orderData?.items || []);

    if (normalizedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Real order items are required to start a payment",
      });
    }

    const normalizedTotal =
      Number.isFinite(orderData?.totalAmount)
        ? orderData.totalAmount
        : normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const tokenRef = orderData?.tokenRef || `TOKEN-${Date.now().toString().slice(-6)}`;

    const order = await Order.create({
      studentId: req.user?._id,
      customerName: orderData?.customerName || null,
      customerEmail: orderData?.customerEmail || null,
      sourceOrderId: orderData?._id || null,
      sourceType: orderData?.source || "canteen-payment",
      items: normalizedItems,
      totalAmount: normalizedTotal,
      tokenRef,
      status: "PENDING_PAYMENT",
    });

    const payment = await Payment.create({
      orderId: order._id,
      studentId: req.user?._id,
      tokenRef,
      amount: normalizedTotal,
      method,
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      payment: {
        paymentId: payment._id,
        orderId: order._id,
        tokenRef: payment.tokenRef,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        order: serializeOrder(order),
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Start payment error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const confirmOnlinePayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ success: false, message: "paymentId is required" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.method !== "ONLINE_SIM") {
      return res
        .status(400)
        .json({ success: false, message: "This endpoint is only for ONLINE_SIM payments" });
    }

    payment.status = "PAID";
    payment.verifiedAt = new Date();
    await payment.save();

    const order = payment.orderId
      ? await Order.findByIdAndUpdate(payment.orderId, { status: "PAID" }, { new: true })
      : null;

    res.json({
      success: true,
      message: "Payment confirmed successfully",
      receipt: buildReceipt(payment, order),
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const uploadProof = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const file = req.file;

    if (!paymentId) {
      return res.status(400).json({ success: false, message: "paymentId is required" });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: "Proof file is required" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.method === "ONLINE_SIM") {
      return res
        .status(400)
        .json({ success: false, message: "ONLINE_SIM payments do not require proof upload" });
    }

    if (payment.proofUrl) {
      const relativePath = payment.proofUrl.replace(/^\//, "");
      const oldPath = path.join(process.cwd(), "BACKEND", relativePath);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    payment.proofUrl = `/uploads/${file.filename}`;
    payment.status = "UNDER_REVIEW";
    await payment.save();

    res.json({
      success: true,
      message: "Proof uploaded successfully. Payment is now under review.",
      payment: {
        paymentId: payment._id,
        tokenRef: payment.tokenRef,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        proofUrl: payment.proofUrl,
        updatedAt: payment.updatedAt,
      },
    });
  } catch (error) {
    console.error("Upload proof error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate("orderId");

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.json({
      success: true,
      payment: {
        paymentId: payment._id,
        orderId: payment.orderId,
        tokenRef: payment.tokenRef,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        proofUrl: payment.proofUrl,
        adminNote: payment.adminNote,
        verifiedAt: payment.verifiedAt,
        order: serializeOrder(payment.orderId),
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const listPayments = async (req, res) => {
  try {
    const filter = req.user?._id ? { studentId: req.user._id } : {};
    const payments = await Payment.find(filter).populate("orderId").sort({ createdAt: -1 }).limit(100);

    res.json({
      success: true,
      payments: payments.map((payment) => ({
        paymentId: payment._id,
        orderId: payment.orderId,
        tokenRef: payment.tokenRef,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        proofUrl: payment.proofUrl,
        adminNote: payment.adminNote,
        verifiedAt: payment.verifiedAt,
        order: serializeOrder(payment.orderId),
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
    });
  } catch (error) {
    console.error("List payments error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status !== "PAID") {
      return res.status(400).json({
        success: false,
        message: "Receipt is only available for paid payments",
        currentStatus: payment.status,
      });
    }

    const order = payment.orderId ? await Order.findById(payment.orderId) : null;

    res.json({
      success: true,
      receipt: buildReceipt(payment, order),
    });
  } catch (error) {
    console.error("Get receipt error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
