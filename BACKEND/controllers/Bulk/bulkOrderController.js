import Group from "../../models/Bulk/Group.js";
import Order from "../../models/Bulk/Order.js";
import MenuItem from "../../models/Bulk/MenuItem.js";

const DEFAULT_MENU = [
  {
    name: "Chicken Rice Bowl",
    description: "Steamed rice, grilled chicken, sauteed vegetables",
    category: "main",
    price: 850,
    preparationTime: 15,
    spicyLevel: "mild",
    dietary: ["high-protein"],
  },
  {
    name: "Veggie Pasta",
    description: "Creamy pasta with roasted vegetables",
    category: "vegetarian",
    price: 780,
    preparationTime: 12,
    spicyLevel: "mild",
    dietary: ["vegetarian"],
  },
  {
    name: "Iced Coffee",
    description: "Chilled coffee with milk",
    category: "beverage",
    price: 320,
    preparationTime: 5,
    spicyLevel: "mild",
    dietary: [],
  },
  {
    name: "Spicy Noodles",
    description: "Hot noodles with egg and vegetables",
    category: "main",
    price: 690,
    preparationTime: 10,
    spicyLevel: "spicy",
    dietary: [],
  },
];

const ensureDefaultMenu = async () => {
  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany(DEFAULT_MENU);
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      eventDate,
      eventTime,
      leaderName,
      leaderEmail,
      maxMembers,
      numberOfGroups,
      description,
      members = [],
    } = req.body;

    const formattedMembers = members.map((member) => ({
      name: member.name,
      email: member.email.toLowerCase(),
      isPriority: false,
      orderStatus: "pending",
    }));

    const leaderExists = formattedMembers.some(
      (member) => member.email === leaderEmail.toLowerCase()
    );
    if (!leaderExists && leaderName && leaderEmail) {
      formattedMembers.unshift({
        name: leaderName,
        email: leaderEmail.toLowerCase(),
        isPriority: false,
        orderStatus: "pending",
      });
    }

    const group = await Group.create({
      eventName,
      eventDate,
      eventTime: eventTime || "12:00",
      leaderName,
      leaderEmail,
      maxMembersPerGroup: maxMembers || 12,
      numberOfGroups: numberOfGroups || 1,
      description: description || "",
      members: formattedMembers,
      status: "active",
    });

    for (const member of group.members) {
      const order = await Order.create({
        groupId: group._id,
        groupName: eventName,
        eventName,
        memberName: member.name,
        memberEmail: member.email,
        isPriority: member.isPriority,
        status: "pending",
      });
      member.token = order.tokenNumber;
    }

    await group.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully!",
      group: {
        _id: group._id,
        eventName: group.eventName,
        eventDate: group.eventDate,
        inviteCode: group.inviteCode,
        totalMembers: group.members.length,
      },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getGroupOrders = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const orders = await Order.find({ groupId: req.params.groupId });

    const membersWithDetails = group.members.map((member) => {
      const order = orders.find((item) => item.memberEmail === member.email);
      return {
        name: member.name,
        email: member.email,
        meal: member.mealName || "Not selected",
        token: member.token || order?.tokenNumber || "Pending",
        isPriority: member.isPriority,
      };
    });

    res.json({
      success: true,
      group: {
        _id: group._id,
        name: group.eventName,
        eventDate: group.eventDate,
        leader: group.leaderName,
        inviteCode: group.inviteCode,
      },
      members: membersWithDetails,
      statistics: {
        totalMembers: group.members.length,
        selectedMeals: membersWithDetails.filter((member) => member.meal !== "Not selected")
          .length,
        pending: membersWithDetails.filter((member) => member.meal === "Not selected").length,
      },
    });
  } catch (error) {
    console.error("Error fetching group orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMenu = async (_req, res) => {
  try {
    await ensureDefaultMenu();
    const menu = await MenuItem.find({ isAvailable: true });
    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const selectMeal = async (req, res) => {
  try {
    const { groupId, memberEmail, mealId, specialInstructions } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const member = group.members.find((item) => item.email === memberEmail);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const meal = await MenuItem.findById(mealId);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    member.mealChoice = mealId;
    member.mealName = meal.name;
    member.selectedAt = new Date();
    member.orderStatus = "confirmed";
    await group.save();

    const order = await Order.findOne({ groupId, memberEmail });
    if (order) {
      order.meal = mealId;
      order.mealName = meal.name;
      order.mealPrice = meal.price;
      order.specialInstructions = specialInstructions || "";
      order.status = "confirmed";
      await order.save();
    }

    res.json({
      success: true,
      message: "Meal selected successfully!",
      token: member.token || order?.tokenNumber,
      mealName: meal.name,
      price: meal.price,
    });
  } catch (error) {
    console.error("Error selecting meal:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderByToken = async (req, res) => {
  try {
    const order = await Order.findOne({ tokenNumber: req.params.token }).populate("groupId");
    if (!order) return res.status(404).json({ message: "Token not found" });

    res.json({
      success: true,
      token: order.tokenNumber,
      isPriority: order.isPriority,
      memberName: order.memberName,
      meal: order.mealName,
      status: order.status,
      eventName: order.eventName,
    });
  } catch (error) {
    console.error("Error fetching order by token:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { inviteCode, name, email } = req.body;

    const group = await Group.findOne({ inviteCode, status: "active" });
    if (!group) return res.status(404).json({ message: "Invalid invite code" });

    if (group.members.length >= group.maxMembersPerGroup) {
      return res.status(400).json({ message: "Group is full" });
    }

    const newMember = {
      name,
      email: email.toLowerCase(),
      isPriority: false,
      orderStatus: "pending",
    };

    group.members.push(newMember);
    await group.save();

    const order = await Order.create({
      groupId: group._id,
      groupName: group.eventName,
      eventName: group.eventName,
      memberName: name,
      memberEmail: email.toLowerCase(),
      status: "pending",
    });

    group.members[group.members.length - 1].token = order.tokenNumber;
    await group.save();

    res.json({ success: true, message: "Joined successfully!", token: order.tokenNumber });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Server error" });
  }
};
