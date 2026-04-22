import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Coffee, Sun, UtensilsCrossed, Zap } from "lucide-react";

const MenuNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("today");

  const menuCategories = [
    {
      id: "today",
      label: "Today's Menu",
      icon: <Sun className="w-5 h-5" />,
      path: "/menu",
      color: "from-orange-400 to-red-500",
    },
    {
      id: "breakfast",
      label: "Breakfast",
      icon: <Coffee className="w-5 h-5" />,
      path: "/breakfast",
      color: "from-yellow-400 to-orange-500",
    },
    {
      id: "lunch",
      label: "Lunch",
      icon: <UtensilsCrossed className="w-5 h-5" />,
      path: "/lunch",
      color: "from-green-400 to-emerald-500",
    },
    {
      id: "snacks",
      label: "Snacks",
      icon: <Zap className="w-5 h-5" />,
      path: "/snacks",
      color: "from-pink-400 to-rose-500",
    },
  ];

  // Determine active tab based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const category = menuCategories.find((cat) => cat.path === currentPath);
    if (category) {
      setActiveTab(category.id);
    }
  }, [location.pathname]);

  const handleTabClick = (category) => {
    setActiveTab(category.id);
    navigate(category.path);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-24 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide">
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleTabClick(category)}
              className={`flex-shrink-0 px-6 py-4 font-bold text-lg transition-all duration-300 flex items-center gap-2 relative group whitespace-nowrap ${
                activeTab === category.id
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
            >
              {/* Icon */}
              <span
                className={`transition-transform duration-300 ${
                  activeTab === category.id ? "scale-110" : "group-hover:scale-105"
                }`}
              >
                {category.icon}
              </span>

              {/* Label */}
              {category.label}

              {/* Active Indicator */}
              {activeTab === category.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-full"></div>
              )}

              {/* Hover Effect */}
              {activeTab !== category.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuNavigation;
