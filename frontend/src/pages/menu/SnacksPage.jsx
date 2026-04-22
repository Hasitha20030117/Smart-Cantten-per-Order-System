import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../lib/axios";
import toast from "react-hot-toast";
import { ShoppingCart, Clock, MapPin } from "lucide-react";
import MenuNavigation from "../../components/MenuNavigation";

const SnacksPage = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchSnackItems = async () => {
      try {
        setLoading(true);
        // Fetch from Anohana Canteen (snacks items typically here)
        const response = await axios.get("/api/menu/canteen/Anohana%20Canteen");
        setMenuItems(response.data.data || []);
      } catch (error) {
        console.error("Error fetching snack items:", error);
        toast.error("Failed to load snacks menu");
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSnackItems();
  }, []);

  const addToCart = (item) => {
    setSelectedItems([...selectedItems, item]);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 dark:from-slate-900 dark:to-slate-800">
      <MenuNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
                🥨 Snacks Menu
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Quick and tasty snack options for any time of day
              </p>
            </div>
            <div className="hidden md:block text-6xl opacity-20">🍿</div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm border border-pink-200 dark:border-pink-900/30">
              <Clock className="w-6 h-6 text-pink-600" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Serving Time</p>
                <p className="font-bold text-slate-900 dark:text-white">2:00 PM - 5:00 PM</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm border border-pink-200 dark:border-pink-900/30">
              <ShoppingCart className="w-6 h-6 text-pink-600" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cart Items</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedItems.length} items</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm border border-pink-200 dark:border-pink-900/30">
              <MapPin className="w-6 h-6 text-pink-600" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                <p className="font-bold text-slate-900 dark:text-white">Juice Bar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : menuItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-pink-100 dark:border-pink-900/30 group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-pink-200 to-rose-200 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🥨</div>
                  )}
                  <div className="absolute top-2 right-2 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    ⭐ {item.rating || "4.6"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {item.description || "Delicious snack item"}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-black text-pink-600">₹{item.price}</p>
                    {item.discount && (
                      <p className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded font-bold">
                        {item.discount}% OFF
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
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
            <p className="text-2xl text-slate-600 dark:text-slate-400 mb-4">No snacks available</p>
            <button
              onClick={() => navigate("/menu")}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              View Today's Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnacksPage;
