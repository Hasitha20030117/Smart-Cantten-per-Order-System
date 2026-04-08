import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Clock, Utensils, History, Bell } from "lucide-react";
import { useAuthStore } from "../store/user";

const NavigationBar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const profileRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();

  const iconHoverClass =
    "p-3 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 hover:scale-105 relative";

  const navigationItems = [
    { name: "Today's Menu", href: "/menu" },
    { name: "Breakfast", href: "/breakfast" },
    { name: "Lunch", href: "/lunch" },
    { name: "Snacks", href: "/snacks" },
    { name: "Bulk Events", href: "/bulk-order" },
    { name: "Token Pay", href: "/canteen" },
    { name: "Pre-Order Special", href: "/preorder", special: true },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      {/* Dynamic Meal Status Bar */}
      <div className="bg-orange-600 text-white relative">
        <div className="max-w-7xl mx-auto py-2 px-4 text-sm font-bold flex justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>LUNCH ORDERS CLOSING IN: <span className="text-yellow-300">24 MINS</span></span>
          </div>
          <span className="hidden md:inline text-orange-200">|</span>
          <div className="hidden md:flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-300 animate-bounce" />
            <span>Collect your breakfast orders at Counter 04</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`bg-white transition-all duration-300 ${
          isScrolled ? "shadow-lg py-1" : "py-3"
        } sticky top-0 z-50 border-b border-slate-100`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Canteen Logo */}
            <div className="flex-shrink-0 group">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-orange-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-black text-slate-900 tracking-tight">SMART</span>
                  <span className="text-orange-600 font-bold text-sm">CANTEEN</span>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    location.pathname === item.href
                      ? "text-orange-600 bg-orange-50"
                      : item.special
                      ? "bg-slate-900 text-white hover:bg-orange-600 mx-2"
                      : "text-slate-600 hover:text-orange-600 hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-2">
              {/* Order Status/History Link */}
              <Link to="/orders" className={iconHoverClass} title="My Orders">
                <History className="h-6 w-6" />
              </Link>

              {/* Cart */}
              <Link to="/cart" className={iconHoverClass}>
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-orange-600 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={iconHoverClass}
                >
                  <User className="h-6 w-6" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-slate-50">
                          <p className="text-xs text-slate-400 font-bold">STUDENT ACCOUNT</p>
                          <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                          <p className="text-xs text-orange-600 font-bold mt-1">Balance: $45.50</p>
                        </div>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600">Wallet & Payments</Link>
                        <Link to="/orders" className="block px-4 py-2 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600">Order History</Link>
                        <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-bold">Sign Out</button>
                      </>
                    ) : (
                      <div className="p-4 text-center">
                        <Link to="/register" className="block w-full bg-orange-600 text-white py-2 rounded-lg font-bold">Login to Order</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-4 py-3 rounded-lg font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};

export default NavigationBar;
