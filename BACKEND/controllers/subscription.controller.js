import Subscription from '../models/Subscription.js';

export const getPlans = async (req, res) => {
  res.json({
    monthly: { name: 'Monthly', price: 29, benefits: ['Priority prep', 'Priority tokens', '30% faster pickup'] },
    yearly: { name: 'Yearly', price: 289, benefits: ['All monthly benefits', '15% discount', 'Dedicated support'] }
  });
};

export const createSubscription = async (req, res) => {
  try {
    const { email, name, plan } = req.body;
    const prices = { monthly: 29, yearly: 289 };
    const endDate = new Date();
    plan === 'monthly' ? endDate.setMonth(endDate.getMonth() + 1) : endDate.setFullYear(endDate.getFullYear() + 1);
    
    const subscription = await Subscription.create({
      userEmail: email, userName: name, plan, price: prices[plan], endDate
    });
    
    res.status(201).json({ success: true, message: 'Subscription activated!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userEmail: req.params.email, status: 'active' });
    res.json({ isSubscribed: !!subscription });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};