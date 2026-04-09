import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Home,
  Camera,
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle,
  Package,
  Clock,
  CheckSquare,
  Trash2,
  Edit,
  ShoppingBag,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "../../store/user";
import { useNavigate } from "react-router-dom";
import axios, { API_BASE_URL } from "../../lib/axios";

const UserProfile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [customOrders, setCustomOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderFormData, setOrderFormData] = useState({});
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    profilePic: null,
  });

  const [errors, setErrors] = useState({});

  // Fetch user data
  const fetchUserData = async () => {
    if (!user || !user._id) {
      setLoading(false);
      setOrdersLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);

      // Fetch user data
      const userRes = await axios.get(`/user/SelectUser/${user._id}`);

      if (userRes.data && userRes.data.user) {
        setUserData(userRes.data.user);
        setFormData({
          firstName: userRes.data.user.firstName || "",
          lastName: userRes.data.user.lastName || "",
          email: userRes.data.user.email || "",
          phoneNumber: userRes.data.user.phoneNumber || "",
          address: userRes.data.user.address || "",
          profilePic: null,
        });
      } else {
        throw new Error("User data not found");
      }
    } catch (err) {
      console.error("Error fetching user data", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch custom orders separately
  const fetchCustomOrders = async () => {
    if (!user || !user._id) {
      setOrdersLoading(false);
      return;
    }

    try {
      setOrdersLoading(true);
      const ordersRes = await axios.get(`/customization/user/${user._id}`);
      setCustomOrders(ordersRes.data || []);
    } catch (err) {
      console.warn("Could not fetch custom orders:", err.message);
      // If it's a 404, the route might not exist yet - set empty array
      setCustomOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchCustomOrders();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-blue-100 text-blue-800";
      case "Finished":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Accepted":
        return <CheckSquare className="h-4 w-4" />;
      case "Finished":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Profile update functions
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.put(`/user/updateUser/${user._id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });

      setUserData({
        ...userData,
        ...formData,
      });

      setEditMode(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile", err);
      setError("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || "",
        profilePic: null,
      });
    }
    setErrors({});
  };

  // Custom Orders Functions
  const handleEditOrder = (order) => {
    if (order.status !== "Pending") return;
    
    setEditingOrder(order._id);
    setOrderFormData({
      fabric: order.fabric || "",
      fabricColor: order.fabricColor || "",
      size: order.size || "",
      measurements: { ...(order.measurements || {}) },
    });
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("measurements.")) {
      const field = name.split(".")[1];
      setOrderFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [field]: value
        }
      }));
    } else {
      setOrderFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateOrder = async (orderId) => {
    try {
      const response = await axios.put(`/customization/${orderId}`, orderFormData);

      setCustomOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, ...orderFormData }
          : order
      ));

      setEditingOrder(null);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating order", err);
      setError("Error updating order. Please try again.");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await axios.delete(`/customization/${orderId}`);

      setCustomOrders(prev => prev.filter(order => order._id !== orderId));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Error canceling order", err);
      setError("Error canceling order. Please try again.");
    }
  };

  const cancelEditOrder = () => {
    setEditingOrder(null);
    setOrderFormData({});
  };

  const retryFetchOrders = () => {
    fetchCustomOrders();
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-800 text-lg">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 text-lg">Failed to load user data.</p>
          <button 
            onClick={fetchUserData}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-1 shadow-lg z-10"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </button>

      {updateSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Operation completed successfully!</span>
        </div>
      )}

{error && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button 
            onClick={() => setError("")}
            className="ml-4 hover:bg-red-600 rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-4">
                This action cannot be undone. This will permanently delete your account and all data.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleteLoading(true);
                  try {
                    await axios.delete(`/user/deleteUser/${user._id}`, { withCredentials: true });
                    useAuthStore.getState().logout();
                    navigate('/');
                  } catch (err) {
                    setError('Delete failed. Try again.');
                  } finally {
                    setDeleteLoading(false);
                    setShowDeleteModal(false);
                  }
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and custom orders</p>
        </div>

        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="inline mr-2 h-5 w-5" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <ShoppingBag className="inline mr-2 h-5 w-5" />
            Custom Orders ({customOrders.length})
          </button>
        </div>

        {activeTab === "profile" && userData && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="relative h-32 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>

            <div className="relative px-8 pb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center overflow-hidden">
                    {userData?.profilePic ? (
                      <img
                        src={userData.profilePic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {userData.firstName} {userData.lastName}
                  </h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-gray-800">
                      <Shield className="h-4 w-4 mr-1" />
                      {userData.role || "User"}
                    </span>
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Member since {formatDate(userData.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {!editMode ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-yellow-600" />
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="text-gray-800 font-medium">{userData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-yellow-600" />
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="text-gray-800 font-medium">{userData.phoneNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-yellow-600" />
                      <div>
                        <label className="text-sm text-gray-600">Address</label>
                        <p className="text-gray-800 font-medium">{userData.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Shield className="h-5 w-5 text-yellow-600" />
                      <div>
                        <label className="text-sm text-gray-600">Role</label>
                        <p className="text-gray-800 font-medium capitalize">
                          {userData.role || "user"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full"
                      placeholder="First Name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full"
                      placeholder="Last Name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full"
                      placeholder="Email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full"
                      placeholder="Phone"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full"
                      placeholder="Address"
                      rows="3"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="flex gap-4 col-span-2 justify-center mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 px-6 py-2 rounded-lg text-gray-900 font-semibold"
                    >
                      <Save className="inline mr-2 h-5 w-5" />
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-700 hover:bg-gray-800 px-6 py-2 rounded-lg text-white font-semibold"
                    >
                      <X className="inline mr-2 h-5 w-5" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {!editMode && (
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg flex-1 sm:flex-none"
                  >
                    <Edit3 className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">My Custom Orders</h2>
              <button
                onClick={retryFetchOrders}
                disabled={ordersLoading}
                className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg"
              >
                <RefreshCw className={`h-4 w-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-800">Loading your orders...</p>
              </div>
            ) : customOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No custom orders yet</h3>
                <p className="text-gray-600 mb-4">Start by creating your first custom clothing order!</p>
                <button
                  onClick={() => navigate("/customization")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-lg font-medium"
                >
                  Create Custom Order
                </button>
              </div>
            ) : (
              customOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 capitalize">
                        {order.clothingType || "Custom Order"}
                      </h3>
                      <p className="text-gray-600">Ordered on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 lg:mt-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status || "Unknown"}</span>
                      </span>
                      {order.status === "Pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Order"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Order"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingOrder === order._id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <input
                        type="text"
                        name="fabric"
                        value={orderFormData.fabric || ""}
                        onChange={handleOrderChange}
                        className="border p-2 rounded-lg"
                        placeholder="Fabric"
                      />
                      <input
                        type="text"
                        name="fabricColor"
                        value={orderFormData.fabricColor || ""}
                        onChange={handleOrderChange}
                        className="border p-2 rounded-lg"
                        placeholder="Fabric Color"
                      />
                      <input
                        type="text"
                        name="size"
                        value={orderFormData.size || ""}
                        onChange={handleOrderChange}
                        className="border p-2 rounded-lg"
                        placeholder="Size"
                      />
                      <div className="flex space-x-2 md:col-span-2">
                        <button
                          onClick={() => handleUpdateOrder(order._id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEditOrder}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label className="text-sm text-gray-600">Fabric</label>
                        <p className="font-medium">{order.fabric || "Not specified"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label className="text-sm text-gray-600">Color</label>
                        <p className="font-medium">{order.fabricColor || "Not specified"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label className="text-sm text-gray-600">Size</label>
                        <p className="font-medium">{order.size || "Not specified"}</p>
                      </div>
                      {order.measurements && Object.keys(order.measurements).some(key => order.measurements[key]) && (
                        <div className="md:col-span-3 bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600">Measurements</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {Object.entries(order.measurements).map(([key, value]) => 
                              value && (
                                <div key={key} className="text-sm">
                                  <span className="text-gray-600 capitalize">{key}:</span>
                                  <span className="font-medium ml-1">{value}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
