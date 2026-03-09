import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Utensils, ShoppingCart, CreditCard, Truck, Clock, HelpCircle } from 'lucide-react';
import Footer from "./Footer";

const FaqPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'menu', name: 'Menu & Food', icon: Utensils },
    { id: 'payment', name: 'Payments', icon: CreditCard },
    { id: 'delivery', name: 'Pickup / Delivery', icon: Truck },
    { id: 'support', name: 'Support', icon: Clock }
  ];

  const faqs = [
    {
      id: 1,
      category: 'orders',
      question: 'How do I place an order from the canteen?',
      answer:
        'Browse the menu, select your food items, add them to the cart, and proceed to checkout. After confirming your order, the canteen will start preparing your food.'
    },
    {
      id: 2,
      category: 'orders',
      question: 'Can I cancel my order?',
      answer:
        'Yes, you can cancel your order before the canteen starts preparing it. Once preparation begins, the order cannot be cancelled.'
    },
    {
      id: 3,
      category: 'menu',
      question: 'How often is the menu updated?',
      answer:
        'The canteen menu is updated daily depending on available food items and ingredients.'
    },
    {
      id: 4,
      category: 'menu',
      question: 'Can I see food availability in real time?',
      answer:
        'Yes. Items that are out of stock will automatically be marked as unavailable in the system.'
    },
    {
      id: 5,
      category: 'payment',
      question: 'What payment methods are available?',
      answer:
        'You can pay using cash at pickup, debit/credit card, or online payment methods depending on the canteen system settings.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'Will I receive a receipt after payment?',
      answer:
        'Yes. After completing your order, a digital receipt will be generated and stored in your order history.'
    },
    {
      id: 7,
      category: 'delivery',
      question: 'How do I collect my order?',
      answer:
        'Once your order is ready, you will receive a notification. You can collect it from the canteen pickup counter.'
    },
    {
      id: 8,
      category: 'delivery',
      question: 'How long does food preparation take?',
      answer:
        'Preparation time depends on the item ordered, but most orders are ready within 10–20 minutes.'
    },
    {
      id: 9,
      category: 'support',
      question: 'What should I do if I receive the wrong order?',
      answer:
        'Please contact the canteen staff immediately or report the issue through the system support option.'
    },
    {
      id: 10,
      category: 'support',
      question: 'Who can I contact for help?',
      answer:
        'You can contact the canteen support team through the contact page or speak directly with the canteen counter staff.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === 'all' || faq.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-orange-50 to-orange-100 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Canteen Order System FAQ
          </h1>

          <p className="text-xl text-gray-700 mb-8">
            Find answers about ordering food, menu availability, payments, and pickup
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-3 text-orange-500"/>
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <div className="bg-white border-2 border-orange-200 rounded-xl p-6 h-fit">

          <h3 className="font-semibold text-lg mb-4">Categories</h3>

          {categories.map(category=>(
            <button
              key={category.id}
              onClick={()=>setActiveCategory(category.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                activeCategory===category.id
                ? "bg-orange-400 text-white"
                : "hover:bg-orange-50"
              }`}
            >
              <category.icon size={18}/>
              {category.name}
            </button>
          ))}

        </div>

        {/* FAQ Items */}
        <div className="lg:col-span-3 space-y-4">

          {filteredFaqs.map(faq=>(
            <div key={faq.id} className="border-2 border-orange-200 rounded-xl">

              <button
                onClick={()=>toggleItem(faq.id)}
                className="w-full flex justify-between items-center px-6 py-4 text-left"
              >
                <h3 className="font-semibold">{faq.question}</h3>

                {openItems.has(faq.id)
                  ? <ChevronUp className="text-orange-500"/>
                  : <ChevronDown className="text-orange-500"/>
                }

              </button>

              {openItems.has(faq.id) && (
                <div className="px-6 pb-5 text-gray-700 border-t border-orange-100 pt-3">
                  {faq.answer}
                </div>
              )}

            </div>
          ))}

        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-16 text-center">

        <h2 className="text-3xl font-bold text-white mb-3">
          Need Help With Your Order?
        </h2>

        <p className="text-white mb-6">
          Our canteen staff are ready to assist you.
        </p>

        <button className="bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold shadow">
          Contact Canteen Support
        </button>

      </div>

      <Footer/>
    </div>
  );
};

export default FaqPage;