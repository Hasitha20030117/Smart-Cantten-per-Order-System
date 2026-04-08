
// COMPLETE NEW CANTEEN CONTEXT FOR AI
export const companyInfo = {
  name: "Smart Canteen Per-Order System",
  owner: "Campus Food Services",
  description: "Smart Canteen is a pre-order system for campus food. Skip the queue - order ahead from multiple canteen locations and pickup when ready. Features bulk orders for groups, subscriptions, and QR token pickup.",

  canteens: [
    {
      name: "Juice Bar",
      description: "Freshly prepared juices and smoothies",
      location: "Main Campus",
      menuExamples: "Orange Juice, Mango Lassi, Watermelon Cooler"
    },
    {
      name: "Basement Canteen", 
      description: "Grab & Go fast food",
      location: "Basement Level",
      menuExamples: "Sandwiches, Burgers, Fries"
    },
    {
      name: "New Canteen",
      description: "Cold & Hot meals",
      location: "New Building",
      menuExamples: "Rice bowls, Noodles, Salads"
    },
    {
      name: "Anohana Canteen",
      description: "Healthy salads & veggie options", 
      location: "Garden Area",
      menuExamples: "Veggie wraps, Salads, Smoothies"
    }
  ],

  features: {
    preOrder: "Order ahead and pickup without queueing",
    bulkOrder: "Group orders for events/classes (generate tokens)",
    subscription: "Weekly meal plans",
    tokenGeneration: "QR codes for quick pickup",
    payment: "Online secure payments",
    userAuth: "Register/Login/Profile management"
  },

  howItWorks: [
    "1. Browse menus from all canteens",
    "2. Add items to cart and pay online", 
    "3. Generate QR token for pickup",
    "4. Scan at counter - food ready!"
  ],

  contact: {
    phone: "Call campus food services",
    email: "canteen@campus.edu",
    support: "Live chat or contact page"
  },

  businessHours: {
    mondayToFriday: "8AM - 8PM",
    weekend: "9AM - 5PM"
  },

  systemInfo: {
    webApp: "Works on desktop/mobile",
    routes: "/ (home), /bulk-order, /tokens, /subscription",
    tech: "React frontend, Node.js backend"
  }
};

