import Subscription from "../../models/Bulk/Subscription.js";

export const getPlans = async (_req, res) => {
  res.json({
    monthly: {
      name: "Monthly",
      price: 29,
      benefits: ["Priority prep", "Priority tokens", "30% faster pickup"],
    },
    yearly: {
      name: "Yearly",
      price: 289,
      benefits: ["All monthly benefits", "15% discount", "Dedicated support"],
    },
  });
};

export const createSubscription = async (req, res) => {
  try {
    const { email, name, plan } = req.body;
    const prices = { monthly: 29, yearly: 289 };
    const endDate = new Date();

    if (plan === "monthly") endDate.setMonth(endDate.getMonth() + 1);
    else endDate.setFullYear(endDate.getFullYear() + 1);

    const subscription = await Subscription.findOneAndUpdate(
      { userEmail: email.toLowerCase() },
      {
        userEmail: email.toLowerCase(),
        userName: name,
        plan,
        price: prices[plan],
        endDate,
        status: "active",
        priorityAccess: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      message: "Subscription activated!",
      subscription,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userEmail: req.params.email.toLowerCase(),
      status: "active",
      endDate: { $gt: new Date() },
    });

    res.json({
      isSubscribed: !!subscription,
      hasPriority: !!subscription?.priorityAccess,
      plan: subscription?.plan || "base",
      subscription,
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
