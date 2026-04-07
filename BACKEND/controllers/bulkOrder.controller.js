import Group from '../models/Group.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

// Create event with members
export const createEvent = async (req, res) => {
  try {
    const { 
      eventName, eventDate, eventTime, leaderName, leaderEmail, 
      maxMembers, numberOfGroups, description, members 
    } = req.body;

    // Format members
    const formattedMembers = members.map(member => ({
      name: member.name,
      email: member.email.toLowerCase(),
      isPriority: false,
      orderStatus: 'pending'
    }));

    // Add leader if not already included
    const leaderExists = formattedMembers.some(m => m.email === leaderEmail.toLowerCase());
    if (!leaderExists && leaderName && leaderEmail) {
      formattedMembers.unshift({
        name: leaderName,
        email: leaderEmail.toLowerCase(),
        isPriority: false,
        orderStatus: 'pending'
      });
    }

    // Create group
    const group = await Group.create({
      eventName, eventDate, eventTime: eventTime || '12:00',
      leaderName, leaderEmail, maxMembersPerGroup: maxMembers || 12,
      numberOfGroups: numberOfGroups || 1, description: description || '',
      members: formattedMembers, status: 'active'
    });

    // Create orders for each member
    for (const member of formattedMembers) {
      const order = await Order.create({
        groupId: group._id, groupName: eventName, eventName,
        memberName: member.name, memberEmail: member.email,
        isPriority: member.isPriority, status: 'pending'
      });
      member.token = order.tokenNumber;
    }
    
    await group.save();

    res.status(201).json({ 
      success: true, 
      message: 'Event created successfully!', 
      group: {
        _id: group._id, eventName: group.eventName,
        eventDate: group.eventDate, inviteCode: group.inviteCode,
        totalMembers: group.members.length
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get group details
export const getGroupOrders = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const orders = await Order.find({ groupId: req.params.groupId });
    
    const membersWithDetails = group.members.map(member => {
      const order = orders.find(o => o.memberEmail === member.email);
      return {
        name: member.name, email: member.email,
        meal: member.mealName || 'Not selected',
        token: member.token || order?.tokenNumber || 'Pending',
        isPriority: member.isPriority
      };
    });
    
    res.json({ 
      success: true,
      group: { 
        _id: group._id, name: group.eventName, 
        eventDate: group.eventDate, leader: group.leaderName,
        inviteCode: group.inviteCode
      }, 
      members: membersWithDetails,
      statistics: {
        totalMembers: group.members.length,
        selectedMeals: membersWithDetails.filter(m => m.meal !== 'Not selected').length,
        pending: membersWithDetails.filter(m => m.meal === 'Not selected').length
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get menu items
export const getMenu = async (req, res) => {
  try {
    const menu = await MenuItem.find({ isAvailable: true });
    res.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Select meal for a member
export const selectMeal = async (req, res) => {
  try {
    const { groupId, memberEmail, mealId, specialInstructions } = req.body;
    
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    const member = group.members.find(m => m.email === memberEmail);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    
    const meal = await MenuItem.findById(mealId);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    
    // Update member
    member.mealChoice = mealId;
    member.mealName = meal.name;
    member.selectedAt = new Date();
    member.orderStatus = 'confirmed';
    await group.save();
    
    // Update order
    let order = await Order.findOne({ groupId, memberEmail });
    if (order) {
      order.meal = mealId;
      order.mealName = meal.name;
      order.mealPrice = meal.price;
      order.status = 'confirmed';
      await order.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Meal selected successfully!',
      token: member.token || order?.tokenNumber,
      mealName: meal.name, price: meal.price
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get order by token
export const getOrderByToken = async (req, res) => {
  try {
    const order = await Order.findOne({ tokenNumber: req.params.token }).populate('groupId');
    if (!order) return res.status(404).json({ message: 'Token not found' });
    
    res.json({ 
      success: true, token: order.tokenNumber, isPriority: order.isPriority,
      memberName: order.memberName, meal: order.mealName,
      status: order.status, eventName: order.eventName
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join group with invite code
export const joinGroup = async (req, res) => {
  try {
    const { inviteCode, name, email } = req.body;
    
    const group = await Group.findOne({ inviteCode, status: 'active' });
    if (!group) return res.status(404).json({ message: 'Invalid invite code' });
    
    if (group.members.length >= group.maxMembersPerGroup) {
      return res.status(400).json({ message: 'Group is full' });
    }
    
    const newMember = { name, email: email.toLowerCase(), isPriority: false, orderStatus: 'pending' };
    group.members.push(newMember);
    await group.save();
    
    const order = await Order.create({
      groupId: group._id, groupName: group.eventName,
      memberName: name, memberEmail: email.toLowerCase(), status: 'pending'
    });
    
    newMember.token = order.tokenNumber;
    await group.save();
    
    res.json({ success: true, message: 'Joined successfully!', token: order.tokenNumber });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};