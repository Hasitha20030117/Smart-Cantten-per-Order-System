import Subscription from '../models/Subscription.js';
import Group from '../models/Group.js';

export const getPlans = async (req, res) => {
  try {
    res.json({
      base: { name: 'Base', price: 0, benefits: ['Group creation', 'Token generation', 'Standard queue'] },
      monthly: { name: 'Pro Monthly', price: 89, benefits: ['Unlimited bulk events', 'Priority preparation', 'Express token pickup', '30% faster service'] },
      yearly: { name: 'Pro Yearly', price: 889, benefits: ['All Pro benefits', '15% discount', 'Priority support', 'Early access features'] }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { email, name, plan } = req.body;
    
    if (!email || !name || !plan) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({ 
      userEmail: email.toLowerCase(), 
      status: 'active' 
    });
    
    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }
    
    // Deactivate any old subscriptions
    await Subscription.updateMany(
      { userEmail: email.toLowerCase() },
      { status: 'cancelled' }
    );
    
    const prices = { monthly: 89, yearly: 889 };
    const endDate = new Date();
    
    if (plan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    
    const subscription = await Subscription.create({
      userEmail: email.toLowerCase(),
      userName: name,
      plan,
      price: prices[plan],
      endDate,
      status: 'active',
      startDate: new Date(),
      createdAt: new Date()
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Subscription activated successfully!',
      subscription: {
        plan: subscription.plan,
        endDate: subscription.endDate,
        price: subscription.price
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const checkSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userEmail: req.params.email, 
      status: 'active' 
    });
    
    // Check if subscription has expired
    if (subscription && new Date() > subscription.endDate) {
      subscription.status = 'expired';
      await subscription.save();
      return res.json({ isSubscribed: false, plan: null, hasPriority: false });
    }
    
    res.json({ 
      isSubscribed: !!subscription,
      plan: subscription?.plan || null,
      hasPriority: subscription?.plan === 'monthly' || subscription?.plan === 'yearly',
      endDate: subscription?.endDate,
      price: subscription?.price
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCurrentSubscription = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const subscription = await Subscription.findOne({ 
      userEmail: email.toLowerCase(), 
      status: 'active' 
    }).sort({ createdAt: -1 });
    
    if (!subscription) {
      return res.json({ plan: 'base', hasPriority: false });
    }
    
    // Check if expired
    if (new Date() > subscription.endDate) {
      subscription.status = 'expired';
      await subscription.save();
      return res.json({ plan: 'base', hasPriority: false });
    }
    
    res.json({ 
      plan: subscription.plan,
      hasPriority: true,
      endDate: subscription.endDate,
      startDate: subscription.startDate,
      price: subscription.price
    });
  } catch (error) {
    console.error('Error getting current subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const subscription = await Subscription.findOne({ 
      userEmail: email.toLowerCase(), 
      status: 'active' 
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();
    
    res.json({ 
      success: true, 
      message: 'Subscription cancelled successfully' 
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    const userEmail = req.query.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find all groups where user is leader or member
    const groups = await Group.find({
      $or: [
        { leaderEmail: userEmail.toLowerCase() },
        { 'members.email': userEmail.toLowerCase() }
      ],
      status: 'active'
    }).sort({ createdAt: -1 }).limit(10);
    
    // Check if user has priority subscription
    const subscription = await Subscription.findOne({ 
      userEmail: userEmail.toLowerCase(), 
      status: 'active' 
    });
    
    const hasPriority = subscription && (subscription.plan === 'monthly' || subscription.plan === 'yearly');
    
    const events = groups.map(group => ({
      id: group._id,
      name: group.eventName,
      date: group.eventDate,
      participants: group.members.length,
      priority: hasPriority,
      inviteCode: group.inviteCode,
      leader: group.leaderName === userEmail ? true : false
    }));
    
    res.json({ 
      success: true, 
      events,
      hasPriority
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubscriptionHistory = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const subscriptions = await Subscription.find({ 
      userEmail: email.toLowerCase() 
    }).sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      subscriptions: subscriptions.map(sub => ({
        plan: sub.plan,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        price: sub.price,
        cancelledAt: sub.cancelledAt
      }))
    });
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};