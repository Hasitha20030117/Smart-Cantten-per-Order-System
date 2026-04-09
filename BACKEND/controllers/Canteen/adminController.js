import Order from "../../models/Canteen/Order.js";
import Payment from "../../models/Canteen/Payment.js";

export const getPayments = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      if (!["PENDING", "UNDER_REVIEW", "PAID", "REJECTED", "EXPIRED"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status filter" });
      }
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate("studentId", "firstName lastName email")
      .populate("orderId")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: payments.length,
      payments: payments.map((payment) => ({
        paymentId: payment._id,
        tokenRef: payment.tokenRef,
        studentId: payment.studentId?._id || null,
        studentName:
          payment.studentId
            ? `${payment.studentId.firstName} ${payment.studentId.lastName}`.trim()
            : "Demo Student",
        studentEmail: payment.studentId?.email || "student@demo.com",
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        proofUrl: payment.proofUrl,
        adminNote: payment.adminNote,
        verifiedBy: payment.verifiedBy,
        verifiedAt: payment.verifiedAt,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        orderSummary: payment.orderId
          ? {
              tokenRef: payment.orderId.tokenRef,
              totalAmount: payment.orderId.totalAmount,
              items: payment.orderId.items,
              status: payment.orderId.status,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const approvePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminNote } = req.body;

    const payment = await Payment.findById(paymentId).populate("orderId");
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "PAID") {
      return res.status(400).json({ success: false, message: "Payment is already approved" });
    }

    if (payment.status === "EXPIRED") {
      return res.status(400).json({ success: false, message: "Cannot approve expired payment" });
    }

    payment.status = "PAID";
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    if (adminNote) {
      payment.adminNote = adminNote;
    }
    await payment.save();

    if (payment.orderId) {
      await Order.findByIdAndUpdate(payment.orderId._id, { status: "PAID" });
    }

    res.json({
      success: true,
      message: "Payment approved successfully",
      payment: {
        paymentId: payment._id,
        tokenRef: payment.tokenRef,
        status: payment.status,
        verifiedBy: payment.verifiedBy,
        verifiedAt: payment.verifiedAt,
        adminNote: payment.adminNote,
      },
    });
  } catch (error) {
    console.error("Approve payment error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminNote } = req.body;

    if (!adminNote?.trim()) {
      return res.status(400).json({
        success: false,
        message: "adminNote is required when rejecting payment",
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "REJECTED") {
      return res.status(400).json({ success: false, message: "Payment is already rejected" });
    }

    if (payment.status === "PAID") {
      return res.status(400).json({ success: false, message: "Cannot reject an approved payment" });
    }

    payment.status = "REJECTED";
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    payment.adminNote = adminNote.trim();
    await payment.save();

    res.json({
      success: true,
      message: "Payment rejected",
      payment: {
        paymentId: payment._id,
        tokenRef: payment.tokenRef,
        status: payment.status,
        verifiedBy: payment.verifiedBy,
        verifiedAt: payment.verifiedAt,
        adminNote: payment.adminNote,
      },
    });
  } catch (error) {
    console.error("Reject payment error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
