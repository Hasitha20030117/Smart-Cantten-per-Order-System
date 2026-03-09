import React, { useState } from "react"; 
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  CreditCard,
  MessageSquare,
  Package,
  Settings,
  Menu,
  X,
  LogOut,
  Layers, // Inventory icon
} from "lucide-react";

import UserManagement from "./userManagemnt/userManagement";

import { useAuthStore } from "../store/user";

const AdminDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  // Navigation Items
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/admin/dashboard" },
    { id: "user-management", label: "User Management", icon: Users, path: "/admin/dashboard/All-user" },
    { id: "payment", label: "Payments", icon: CreditCard, path: "/admin/dashboard/payment" },
    { id: "feedback", label: "Reviews", icon: MessageSquare, path: "/admin/dashboard/feedback" },
    { id: "product-management", label: "Products", icon: Package, path: "/admin/dashboard/products" },
    { id: "customization-management", label: "Customization", icon: Settings, path: "/admin/dashboard/settings" },
    { id: "inventory-management", label: "Inventory", icon: Layers, path: "/admin/dashboard/inventory" }, // Added
  ];

  const handleNavigation = (item) => {
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                >
                  <Icon className="w-4 h-4 mr-2" /> {item.label}
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 ml-4"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-200"
                >
                  <Icon className="w-4 h-4 mr-2" /> {item.label}
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-100"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* Body content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route index element={<div>📊 Admin Dashboard Home</div>} />
          <Route path="All-user" element={<UserManagement />} />
          <Route path="payment" element={<Customization />} />
          <Route path="feedback" element={<div>💬 Reviews Management</div>} />
          <Route path="products" element={<div>📦 Product Management</div>} />
          <Route path="settings" element={<Customization />} />
          <Route path="inventory" element={<div>📦 Inventory Management</div>} /> {/* Added */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
