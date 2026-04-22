import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../lib/axios";
import toast from "react-hot-toast";
import { ShoppingCart, Clock, MapPin } from "lucide-react";
import MenuNavigation from "../../components/MenuNavigation";

const BreakfastPage = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchBreakfastItems = async () => {
      try {
        setLoading(true);
        // Fetch from Juice Bar (breakfast items typically here)
        const response = await axios.get("/api/menu/canteen/Juice%20Bar");
        setMenuItems(response.data.data || []);
      } catch (error) {
        console.error("Error fetching breakfast items:", error);
        toast.error("Failed to load breakfast menu");
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakfastItems();
  }, []);

  const addToCart = (item) => {
    setSelectedItems([...selectedItems, item]);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <MenuNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
                🌅 Breakfast Menu
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Fresh breakfast items to start your day
              </p>
            </div>
            <div className="hidden md:block text-6xl opacity-20">☕</div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm border border-yellow-200 dark:border-yellow-900/30">
              <Clock className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Serving Time</p>
                <p className="font-bold text-slate-900 dark:text-white">6:30 AM - 10:00 AM</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm border border-yellow-200 dark:border-yellow-900/30">
              <ShoppingCart className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cart Items</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedItems.length} items</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm border border-yellow-200 dark:border-yellow-900/30">
              <MapPin className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                <p className="font-bold text-slate-900 dark:text-white">Main Canteen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : menuItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-yellow-100 dark:border-yellow-900/30 group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-yellow-200 to-orange-200 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">☕</div>
                  )}
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    ⭐ {item.rating || "4.5"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {item.description || "Freshly prepared breakfast item"}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-black text-yellow-600">₹{item.price}</p>
                    {item.discount && (
                      <p className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded font-bold">
                        {item.discount}% OFF
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-600 dark:text-slate-400 mb-4">No breakfast items available</p>
            <button
              onClick={() => navigate("/menu")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              View Today's Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakfastPage;
