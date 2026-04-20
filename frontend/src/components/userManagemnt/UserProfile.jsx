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
  Users,
  Gift,
} from "lucide-react";
import { useAuthStore } from "../../store/user";
import { CreditCard, TrendingUp, Star, Award, DollarSign, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios, { API_BASE_URL } from "../../lib/axios";
import toast from "react-hot-toast";

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
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedCanteenForConvert, setSelectedCanteenForConvert] = useState(null);
  const [convertPoints, setConvertPoints] = useState(0);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [donatePointsAmount, setDonatePointsAmount] = useState(5);
  const [donationComplete, setDonationComplete] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [mealCustomization, setMealCustomization] = useState({
    name: "",
    items: [],
    specialInstructions: "",
    image: null
  });
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOrderData, setEditingOrderData] = useState(null);
  const [rewardHistory, setRewardHistory] = useState([
    { date: '2026-04-10', action: 'Earned', points: 10, canteen: 'NewCanteen', amount: 100 },
    { date: '2026-04-09', action: 'Converted', points: -5, canteen: 'Juice Bar', amount: 50 },
    { date: '2026-04-08', action: 'Donated', points: -3, canteen: 'Little Heart Foundation', amount: 30 },
    { date: '2026-04-07', action: 'Earned', points: 7, canteen: 'Basement Canteen', amount: 70 }
  ]);

  // Charitable Organizations List
  const CHARITIES = [
    { 
      id: 1, 
      name: 'Little Heart Foundation', 
      icon: '❤️', 
      description: 'Help children with congenital heart diseases',
      website: 'www.littleheart.org' 
    },
    { 
      id: 2, 
      name: 'Education for All', 
      icon: '📚', 
      description: 'Provide quality education to underprivileged children',
      website: 'www.educationforall.org' 
    },
    { 
      id: 3, 
      name: 'Clean Water Initiative', 
      icon: '💧', 
      description: 'Ensure access to clean drinking water',
      website: 'www.cleanwater.org' 
    },
    { 
      id: 4, 
      name: 'Medical Aid Fund', 
      icon: '🏥', 
      description: 'Support free healthcare for the poor',
      website: 'www.medicalaid.org' 
    },
    { 
      id: 5, 
      name: 'Wildlife Conservation', 
      icon: '🦁', 
      description: 'Protect endangered species and habitats',
      website: 'www.wildlifecare.org' 
    },
    { 
      id: 6, 
      name: 'Hunger Relief Program', 
      icon: '🍜', 
      description: 'Feed hungry families in disaster areas',
      website: 'www.hungerrelief.org' 
    }
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    profilePic: null,
  });

  const [errors, setErrors] = useState({});

  // Disable edits in demo mode
  const isEditable = isAuthenticated && !isDemoMode;


  // Fetch user data - supports demo mode
  const fetchUserData = async () => {
    try {
      setError("");
      setLoading(true);
      setIsDemoMode(false);

      const userId = user?._id || 'demo'; 

      let userRes = await axios.get(`/user/selectUser/${userId}`);
      console.log("✅ API Response:", userRes.data);
      
      if (userRes.data?.success && userRes.data.user) {
        const profileUser = userRes.data.user;
        const hasRewards = profileUser.totalRewardPoints > 0 || 
                          (profileUser.rewardPoints && Object.keys(profileUser.rewardPoints).length > 0);
        console.log("Has rewards:", hasRewards, "Points:", profileUser.totalRewardPoints);
        
        if (hasRewards) {
          setUserData(profileUser);
          // Load reward history from backend if available
          if (profileUser.rewardHistory && Array.isArray(profileUser.rewardHistory)) {
            setRewardHistory(profileUser.rewardHistory);
          }
          setFormData({
            firstName: profileUser.firstName || "",
            lastName: profileUser.lastName || "",
            email: profileUser.email || "",
            phoneNumber: profileUser.phoneNumber || "",
            address: profileUser.address || "",
            profilePic: null,
          });
          return;
        }
      }

      if (isAuthenticated && user?._id) {
        userRes = await axios.get(`/user/SelectUser/${user._id}`);
        if (userRes.data?.user) {
          const profileUser = userRes.data.user;
          setUserData(profileUser);
          // Load reward history from backend if available
          if (profileUser.rewardHistory && Array.isArray(profileUser.rewardHistory)) {
            setRewardHistory(profileUser.rewardHistory);
          }
          setFormData({
            firstName: profileUser.firstName || "",
            lastName: profileUser.lastName || "",
            email: profileUser.email || "",
            phoneNumber: profileUser.phoneNumber || "",
            address: profileUser.address || "",
            profilePic: null,
          });
          return;
        }
      }

      setIsDemoMode(true);
      setUserData({
        firstName: "Demo",
        lastName: "User",
        email: "demo@smartcanteen.com",
        phoneNumber: "9876543210",
        address: "Smart Canteen Campus",
        role: "customer",
        totalRewardPoints: 10,
        rewardPoints: { 
          NewCanteen: 4, 
          "Juice Bar": 3,
          "Basement Canteen": 2,
          "Anohana Canteen": 1
        }
      });
      setFormData({
        firstName: "Demo",
        lastName: "User",
        email: "demo@smartcanteen.com",
        phoneNumber: "9876543210",
        address: "Smart Canteen Campus",
      });
      
    } catch (err) {
      console.error("Profile load error:", err);
      setIsDemoMode(true);
      setUserData({
        firstName: "Demo",
        lastName: "User",
        email: "demo@smartcanteen.com",
        phoneNumber: "9876543210",
        address: "Smart Canteen Campus",
        role: "customer",
        totalRewardPoints: 10,
        rewardPoints: { 
          NewCanteen: 4, 
          "Juice Bar": 3,
          "Basement Canteen": 2,
          "Anohana Canteen": 1
        }
      });
      setFormData({
        firstName: "Demo",
        lastName: "User",
        email: "demo@smartcanteen.com",
        phoneNumber: "9876543210",
        address: "Smart Canteen Campus",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomOrders = async () => {
    if (!isAuthenticated || !user?._id) {
      setCustomOrders([]);
      setOrdersLoading(false);
      return;
    }
    try {
      setOrdersLoading(true);
      const ordersRes = await axios.get(`/customization/user/${user._id}`);
      setCustomOrders(ordersRes.data || []);
    } catch (err) {
      console.warn("No custom orders:", err);
      setCustomOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchCustomOrders();
  }, [isAuthenticated, user]);

  // Sync auth store user into local userData so UI updates immediately
  useEffect(() => {
    if (user && typeof user.totalRewardPoints !== 'undefined') {
      setUserData((prev) => ({ ...(prev || {}), ...user }));
      // Also sync reward history if available from auth store
      if (user.rewardHistory && Array.isArray(user.rewardHistory)) {
        setRewardHistory(user.rewardHistory);
      }
      setIsDemoMode(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !userData) {
      console.warn("⚠️ userData is null after load, setting demo data");
      const demoData = {
        firstName: "Demo",
        lastName: "User",
        email: "demo@smartcanteen.com",
        phoneNumber: "9876543210",
        address: "Smart Canteen Campus",
        role: "customer",
        totalRewardPoints: 10,
        rewardPoints: { 
          NewCanteen: 4, 
          "Juice Bar": 3,
          "Basement Canteen": 2,
          "Anohana Canteen": 1
        }
      };
      setUserData(demoData);
      setIsDemoMode(true);
    }
  }, [loading, userData]);

  // Refresh user data when switching to rewards tab
  useEffect(() => {
    if (activeTab === "rewards" && isAuthenticated && user?._id) {
      fetchUserData();
    }
  }, [activeTab]);

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

  const convertPointsToRupees = (points) => {
    return (Number(points || 0) * 10).toLocaleString("en-IN");
  };

  const demoRewards = {
    totalRewardPoints: 50,
    rewardPoints: { 
      NewCanteen: 20, 
      "Juice Bar": 10,
      "Basement Canteen": 10,
      "Anohana Canteen": 10
    }
  };

  // Always use demo rewards if no real userData or if userData.totalRewardPoints is 0
  let rewardsToUse = userData && userData.totalRewardPoints > 0
    ? userData
    : demoRewards;
  let totalRewardPoints = rewardsToUse?.totalRewardPoints ?? 0;
  let rewardPointsByCanteen = rewardsToUse?.rewardPoints ?? {};
  if (rewardPointsByCanteen instanceof Map) {
    rewardPointsByCanteen = Object.fromEntries(rewardPointsByCanteen);
  }
  const totalRewardRupees = convertPointsToRupees(totalRewardPoints);

  const handleOpenConvertModal = (canteen, points) => {
    setSelectedCanteenForConvert({ canteen, points });
    setConvertPoints(points);
    setShowConvertModal(true);
  };

  const handleConvertPoints = async () => {
    if (!selectedCanteenForConvert) return;
    
    try {
      const rupeeValue = selectedCanteenForConvert.points * 10;
      const canteen = selectedCanteenForConvert.canteen;
      const points = selectedCanteenForConvert.points;
      
      // Zero out points for this canteen
      const updatedRewardPoints = { ...rewardPointsByCanteen };
      delete updatedRewardPoints[canteen];
      
      // Calculate new total
      const newTotal = Object.values(updatedRewardPoints).reduce((sum, p) => sum + p, 0);
      
      // Get current date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      
      // Add to history
      const newHistory = [
        {
          date: dateStr,
          action: 'Converted',
          points: -points,
          canteen: canteen,
          amount: rupeeValue
        },
        ...rewardHistory
      ];
      setRewardHistory(newHistory);
      
      // Update userData with new points and total
      setUserData(prev => ({
        ...prev,
        rewardPoints: updatedRewardPoints,
        totalRewardPoints: newTotal
      }));
      
      // Persist to backend
      try {
        await axios.post("/user/update-reward-points", {
          rewardPoints: updatedRewardPoints,
          totalRewardPoints: newTotal,
        });
      } catch (err) {
        console.warn("Backend update failed:", err);
      }

      // Refresh auth store from backend to keep everything in sync
      try {
        await useAuthStore.getState().fetchCurrentUser();
      } catch (err) {
        console.warn('Failed to refresh current user after conversion:', err);
      }
      
      // Show success toast
      toast.success(
        `✅ Discount Applied!\n${points} Points = Rs${rupeeValue}\n${canteen} points now: 0`, 
        { duration: 4000 }
      );
      
      // Close modal and reset
      setShowConvertModal(false);
      setSelectedCanteenForConvert(null);
    } catch (error) {
      console.error('Error converting points:', error);
      toast.error('Failed to convert points. Please try again.');
    }
  };

  const handleCancelConversion = async (transaction, index) => {
    const { action, points, canteen, amount } = transaction;
    
    try {
      if (action === 'Converted') {
        // Add points back to the canteen
        const updatedRewardPoints = { ...rewardPointsByCanteen };
        updatedRewardPoints[canteen] = (updatedRewardPoints[canteen] || 0) + Math.abs(points);
        const newTotal = Object.values(updatedRewardPoints).reduce((sum, p) => sum + p, 0);
        
        setUserData(prev => ({
          ...prev,
          rewardPoints: updatedRewardPoints,
          totalRewardPoints: newTotal
        }));

        // Persist to backend
        try {
          await axios.post("/user/update-reward-points", {
            rewardPoints: updatedRewardPoints,
            totalRewardPoints: newTotal,
          });
        } catch (err) {
          console.warn("Backend update failed:", err);
        }

        // Refresh auth store
        try {
          await useAuthStore.getState().fetchCurrentUser();
        } catch (err) {
          console.warn('Failed to refresh current user after cancelling conversion:', err);
        }
        
        toast.success(`✅ Conversion Cancelled! ${Math.abs(points)} points restored to ${canteen}`);
      } else if (action === 'Donated') {
        // Add points back to total
        const restoredTotal = totalRewardPoints + Math.abs(points);
        const updatedRewardPoints = rewardPointsByCanteen;
        
        setUserData(prev => ({
          ...prev,
          totalRewardPoints: restoredTotal,
          rewardPoints: updatedRewardPoints
        }));

        // Persist to backend
        try {
          await axios.post("/user/update-reward-points", {
            rewardPoints: updatedRewardPoints,
            totalRewardPoints: restoredTotal,
          });
        } catch (err) {
          console.warn("Backend update failed:", err);
        }

        // Refresh auth store
        try {
          await useAuthStore.getState().fetchCurrentUser();
        } catch (err) {
          console.warn('Failed to refresh current user after cancelling donation:', err);
        }
        
        toast.success(`✅ Donation Cancelled! ${Math.abs(points)} points restored from ${canteen}`);
      }
      
      // Remove from history
      setRewardHistory(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      toast.error('Failed to cancel transaction. Please try again.');
    }
  };

  const handleOpenDonateModal = () => {
    setShowDonateModal(true);
    setDonationComplete(false);
    setSelectedCharity(null);
    setDonatePointsAmount(5);
  };

  const handleSelectCharity = (charity) => {
    setSelectedCharity(charity);
  };

  const [donationSuccessMsg, setDonationSuccessMsg] = useState("");
  const handleExecuteDonation = async () => {
    if (!selectedCharity || !donatePointsAmount || donatePointsAmount <= 0 || donatePointsAmount > totalRewardPoints) {
      alert('❌ Please select a charity and valid points to donate');
      return;
    }
    setDonationComplete(true);
    setTimeout(async () => {
      try {
        const rupeeAmount = donatePointsAmount * 10;
        
        // Get today's date
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        // Add donation to history
        const donationTransaction = {
          date: dateStr,
          action: 'Donated',
          points: -donatePointsAmount,
          canteen: selectedCharity.name,
          amount: rupeeAmount
        };
        const newHistory = [donationTransaction, ...rewardHistory];
        setRewardHistory(newHistory);
        
        // Calculate new totals
        const newTotal = totalRewardPoints - donatePointsAmount;
        const updatedRewardPoints = rewardPointsByCanteen;
        
        // Update user points locally
        setUserData(prev => ({
          ...prev,
          totalRewardPoints: newTotal,
          rewardPoints: updatedRewardPoints
        }));
        
        // Persist to backend
        try {
          await axios.post("/user/update-reward-points", {
            rewardPoints: updatedRewardPoints,
            totalRewardPoints: newTotal,
          });
        } catch (err) {
          console.warn("Backend update failed:", err);
        }

        // Refresh auth store from backend to keep everything in sync
        try {
          await useAuthStore.getState().fetchCurrentUser();
        } catch (err) {
          console.warn('Failed to refresh current user after donation:', err);
        }
        
        setDonationSuccessMsg(
          `🎉 Donation Successful! Thank you for donating ${donatePointsAmount} points (Rs${rupeeAmount}) to ${selectedCharity.name}.`
        );
        setShowDonateModal(false);
        setDonationComplete(false);
        setSelectedCharity(null);
        setDonatePointsAmount(5);
        console.log(`💚 Donation logged: ${donatePointsAmount} points to ${selectedCharity.name}`);
      } catch (error) {
        console.error('Error processing donation:', error);
        setDonationSuccessMsg('❌ Donation failed. Please try again.');
        setDonationComplete(false);
      }
    }, 500);
  };

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

  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Profile...</h2>
          <p className="text-gray-600">
            {isDemoMode ? 'Demo ready with 10 Reward Points' : 'Fetching your data'}
          </p>
          <div className="mt-6 text-3xl font-bold text-yellow-600 bg-yellow-50 px-6 py-3 rounded-2xl">
            10 Points = <span className="text-green-600">Rs100</span>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-12">
          <Award className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Ready!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Demo mode: No login needed! <br />
            <span className="font-semibold text-yellow-600">10 Reward Points = Rs100 value</span>
          </p>
          <button 
            onClick={fetchUserData}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-3 rounded-2xl font-bold text-lg shadow-lg"
          >
            View Demo Profile
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

      {/* All original modals JSX unchanged - delete, convert, donate */}
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

      {showConvertModal && selectedCanteenForConvert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-12 w-12 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Convert Reward Points</h3>
              <p className="text-gray-600">Canteen: <span className="font-semibold">{selectedCanteenForConvert.canteen}</span></p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl mb-6 border border-yellow-200">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-1">Reward Points</p>
                <p className="text-4xl font-bold text-yellow-600">{selectedCanteenForConvert.points}</p>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="border-b-2 border-yellow-300 flex-1"></div>
                <span className="px-3 text-yellow-600 font-bold text-lg">×10</span>
                <div className="border-b-2 border-yellow-300 flex-1"></div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Rupee Value</p>
                <p className="text-4xl font-bold text-green-600">Rs{selectedCanteenForConvert.points * 10}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
              <p className="text-sm text-green-800"><strong>✓ Conversion successful!</strong></p>
              <p className="text-xs text-green-700 mt-2">Use this discount value during checkout at {selectedCanteenForConvert.canteen}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConvertModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button
                onClick={handleConvertPoints}
                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                Use Discount
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
          <button
            onClick={() => setActiveTab("rewards")}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${
              activeTab === "rewards"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Award className="inline mr-2 h-5 w-5" />
            Reward Points
          </button>
        </div>

        {activeTab === "profile" && userData && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Reward Points Summary */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-yellow-600" />
                Reward Points
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100 text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{totalRewardPoints}</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Total Points</div>
                  <div className="text-xs mt-1 text-yellow-700 font-medium">RS{totalRewardRupees}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{Object.keys(rewardPointsByCanteen).length}</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Canteens Unlocked</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 text-center">
                  <button 
                    onClick={() => setActiveTab("rewards")}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-1"
                  >
                    <Star className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="relative h-32 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>

            <div className="relative px-8 pb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center overflow-hidden">
                    {userData?.profilePic ? (
                      <img
                        src={userData.profilePic}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
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
                      <Mail className="h-5 w-5 text-yellow-600 mt-1" />
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="text-gray-800 font-medium">{userData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-yellow-600 mt-1" />
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="text-gray-800 font-medium">{userData.phoneNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-yellow-600 mt-1" />
                      <div>
                        <label className="text-sm text-gray-600">Address</label>
                        <p className="text-gray-800 font-medium">{userData.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Shield className="h-5 w-5 text-yellow-600 mt-1" />
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
                      className="border border-gray-300 focus:border-yellow-500 p-3 rounded-xl w-full focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all"
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
                      className="border border-gray-300 focus:border-yellow-500 p-3 rounded-xl w-full focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all"
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
                      className="border border-gray-300 focus:border-yellow-500 p-3 rounded-xl w-full focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all"
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
                      className="border border-gray-300 focus:border-yellow-500 p-3 rounded-xl w-full focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all"
                      placeholder="Phone"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="border border-gray-300 focus:border-yellow-500 p-3 rounded-xl w-full focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all"
                      placeholder="Address"
                      rows="3"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="flex gap-4 col-span-2 justify-center mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-gray-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <Save className="h-5 w-5" />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-gray-600 px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      <X className="h-5 w-5" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {!editMode && (
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex-1 sm:flex-none"
                  >
                    <Edit3 className="h-5 w-5" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue with ALL original rewards/orders tabs JSX - unchanged structure, only minor style improvements for consistency */}


        {activeTab === "rewards" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-8 w-8 mr-3 text-yellow-600" />
                My Reward Points
              </h2>
              
              {/* Rewards Preview Card - similar to BulkOrderPage */}
              <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center justify-between gap-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-green-500 p-4">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Reward Points</p>
                      <p className="text-4xl font-bold text-green-600">
                        {totalRewardPoints}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Total Value</p>
                    <p className="text-3xl font-bold text-green-600">
                      RS{totalRewardRupees}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">1 Point = Rs10</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-green-200 pt-4">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle size={18} />
                    <span className="font-semibold">Ready to use for conversions and donations!</span>
                  </div>
                  <button
                    onClick={() => {
                      const scrollElement = document.getElementById('reward-history');
                      if (scrollElement) scrollElement.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition shadow-lg whitespace-nowrap"
                  >
                    View History
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">{totalRewardPoints}</div>
                    <div className="text-sm text-gray-600 uppercase tracking-wide mb-1">Total Points</div>
                    <div className="text-2xl font-bold text-green-600">Rs{totalRewardRupees}</div>
                    <p className="text-xs text-gray-500 mt-2">1 Point = Rs10 discount</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setShowConvertModal(true)}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      <DollarSign className="inline h-5 w-5 mr-2" />
                      Convert Points
                    </button>
                    <button
                      onClick={handleOpenDonateModal}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Heart className="inline h-5 w-5 mr-2" />
                      Donate Points
                    </button>
                  </div>
                </div>

                {/* Canteen-wise points breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col gap-2">
                  {/* Earned from Bulk Order Banner */}
                  {rewardHistory.filter(t => t.action === 'Earned' && t.canteen.includes('Bulk Event')).length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🎉</div>
                        <div className="flex-1">
                          <p className="font-bold text-green-800">Earned from Bulk Order Creation!</p>
                          <div className="text-sm text-green-700 mt-1">
                            {rewardHistory
                              .filter(t => t.action === 'Earned' && t.canteen.includes('Bulk Event'))
                              .map((t, idx) => (
                                <div key={idx}>
                                  ✓ <span className="font-semibold">+{t.points} points</span> ({t.canteen}) - Rs{t.amount}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Earned from Custom Orders Banner */}
                  {rewardHistory.filter(t => t.action === 'Earned' && t.description && t.description.includes('custom order')).length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">✨</div>
                        <div className="flex-1">
                          <p className="font-bold text-blue-800">Earned from Custom Orders!</p>
                          <div className="text-sm text-blue-700 mt-1">
                            {rewardHistory
                              .filter(t => t.action === 'Earned' && t.description && t.description.includes('custom order'))
                              .map((t, idx) => (
                                <div key={idx}>
                                  ✓ <span className="font-semibold">+{t.points} points</span> ({t.canteen}) - Rs{t.amount}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="font-semibold text-gray-700 mb-2 flex items-center"><Gift className="h-5 w-5 mr-2 text-yellow-500" />Points by Canteen</div>
                  <ul className="divide-y divide-gray-100">
                    {Object.entries(rewardPointsByCanteen).map(([canteen, pts]) => (
                      <li key={canteen} className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-gray-50 transition">
                        <span className="text-gray-700 font-medium">{canteen}</span>
                        <span className="font-bold text-yellow-600 text-lg">{pts}</span>
                        <button
                          className="ml-4 px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition shadow-md hover:shadow-lg"
                          onClick={() => handleOpenConvertModal(canteen, pts)}
                        >Convert</button>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Points History Section - Inline */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                    Reward History
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-yellow-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                          <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">Points</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Canteen/Charity</th>
                          <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">Rs Amount</th>
                          <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {rewardHistory.length > 0 ? (
                          rewardHistory.map((transaction, index) => (
                            <tr key={index} className="hover:bg-yellow-50 transition">
                              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{formatDate(transaction.date)}</td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  transaction.action === 'Earned' ? 'bg-green-100 text-green-700' :
                                  transaction.action === 'Converted' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-pink-100 text-pink-700'
                                }`}>
                                  {transaction.action}
                                </span>
                              </td>
                              <td className={`px-3 py-2 whitespace-nowrap text-xs font-bold text-center ${
                                transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.points > 0 ? '+' : ''}{transaction.points}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-700">{transaction.canteen}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-center text-gray-800">Rs{transaction.amount}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-center">
                                {(transaction.action === 'Converted' || transaction.action === 'Donated') && (
                                  <button
                                    onClick={() => handleCancelConversion(transaction, index)}
                                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition shadow-md hover:shadow-lg"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-3 py-8 text-center text-gray-400 text-sm">No reward history yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders tab - original JSX */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800">My Custom Orders</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateOrderModal(true)}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Create Order</span>
                </button>
                <button
                  onClick={retryFetchOrders}
                  disabled={ordersLoading}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-gray-900 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <RefreshCw className={`h-5 w-5 ${ordersLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            {/* Display Custom Orders */}
            {customOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No custom orders yet</p>
                <p className="text-gray-400 text-sm mt-2">Create your first custom order to get started!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {customOrders.map((order, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-lg hover:shadow-xl transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-orange-600">{order.canteen}</p>
                        <h3 className="text-xl font-bold text-gray-800 mt-1">{order.name}</h3>
                      </div>
                      <div className="text-4xl">{order.canteen === 'Main Canteen' ? '🍽️' : order.canteen === 'Juice Bar' ? '🥤' : order.canteen === 'Basement Canteen' ? '🍜' : '🍱'}</div>
                    </div>
                    {order.specialInstructions && (
                      <div className="mb-4 p-3 bg-white rounded-xl border border-orange-100">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Special Instructions:</p>
                        <p className="text-sm text-gray-700">{order.specialInstructions}</p>
                      </div>
                    )}
                    {order.image && (
                      <div className="mb-4 rounded-xl overflow-hidden h-40 bg-gray-200">
                        <img src={order.image} alt={order.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingOrderId(order.id);
                          setEditingOrderData({
                            name: order.name,
                            canteen: order.canteen,
                            specialInstructions: order.specialInstructions,
                            image: order.image
                          });
                        }}
                        className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setCustomOrders(customOrders.filter(o => o.id !== order.id));
                          toast.success("Order deleted successfully!");
                        }}
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Edit Custom Order Modal */}
        {editingOrderId && editingOrderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-8 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                onClick={() => {
                  setEditingOrderId(null);
                  setEditingOrderData(null);
                }}
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 mb-4">
                  <Edit className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Edit Order</h2>
                <p className="text-gray-600">Update your meal customization</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Name *</label>
                  <input
                    type="text"
                    value={editingOrderData.name}
                    onChange={(e) => setEditingOrderData({ ...editingOrderData, name: e.target.value })}
                    placeholder="Enter meal name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Canteen</label>
                  <div className="p-3 bg-gray-100 rounded-xl border border-gray-300">
                    <p className="font-semibold text-gray-800">{editingOrderData.canteen}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
                  <textarea
                    value={editingOrderData.specialInstructions}
                    onChange={(e) => setEditingOrderData({ ...editingOrderData, specialInstructions: e.target.value })}
                    placeholder="Add any special requests"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                {editingOrderData.image && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Image</label>
                    <div className="rounded-xl overflow-hidden h-40 bg-gray-200">
                      <img src={editingOrderData.image} alt="current" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setEditingOrderId(null);
                    setEditingOrderData(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingOrderData.name.trim()) {
                      const updatedOrders = customOrders.map(order =>
                        order.id === editingOrderId
                          ? {
                              ...order,
                              name: editingOrderData.name,
                              specialInstructions: editingOrderData.specialInstructions,
                            }
                          : order
                      );
                      setCustomOrders(updatedOrders);
                      setEditingOrderId(null);
                      setEditingOrderData(null);
                      toast.success("✏️ Order updated successfully!");
                    } else {
                      toast.error("Please enter a meal name");
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Donation Modal - improved real-world style */}
        {showDonateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-8 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                onClick={() => setShowDonateModal(false)}
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="text-center mb-6">
                <Heart className="h-12 w-12 mx-auto text-pink-500 mb-2" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Donate Reward Points</h2>
                <p className="text-gray-600">Choose a charity and donate your points to make a real-world impact!</p>
              </div>

              {/* Step 1: Select Charity */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Charity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CHARITIES.map((charity) => (
                    <button
                      key={charity.id}
                      type="button"
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 shadow-sm hover:shadow-lg focus:outline-none ${selectedCharity?.id === charity.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'}`}
                      onClick={() => handleSelectCharity(charity)}
                    >
                      <span className="text-3xl">{charity.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-gray-800">{charity.name}</div>
                        <div className="text-xs text-gray-500">{charity.description}</div>
                        <div className="text-xs text-blue-600 underline">{charity.website}</div>
                      </div>
                      {selectedCharity?.id === charity.id && (
                        <CheckCircle className="h-5 w-5 text-pink-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Enter Points */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">How many points do you want to donate?</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={totalRewardPoints}
                    value={donatePointsAmount}
                    onChange={e => setDonatePointsAmount(Number(e.target.value))}
                    className="w-24 p-3 border border-gray-300 rounded-xl text-lg font-bold text-pink-600 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    disabled={donationComplete}
                  />
                  <span className="text-gray-700 font-medium">points</span>
                  <span className="ml-4 text-green-700 font-semibold">= RS{donatePointsAmount * 10}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">You have <span className="font-bold">{totalRewardPoints}</span> points available.</div>
              </div>

              {/* Step 3: Donate Button */}
              <div className="flex flex-col items-center gap-3">
                <button
                  className={`w-full px-6 py-3 rounded-xl font-bold text-white text-lg shadow-lg transition-all ${selectedCharity && donatePointsAmount > 0 && donatePointsAmount <= totalRewardPoints ? 'bg-pink-500 hover:bg-pink-600' : 'bg-gray-300 cursor-not-allowed'}`}
                  onClick={handleExecuteDonation}
                  disabled={!selectedCharity || donatePointsAmount <= 0 || donatePointsAmount > totalRewardPoints || donationComplete}
                >
                  {donationComplete ? 'Donating...' : 'Donate Now'}
                </button>
                {donationComplete && (
                  <div className="text-green-600 font-semibold flex items-center gap-2 mt-2">
                    <CheckCircle className="h-5 w-5" />
                    Donation in progress...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Custom Order Modal */}
        {showCreateOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-8 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                onClick={() => setShowCreateOrderModal(false)}
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 mb-4">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Custom Order</h2>
                <p className="text-gray-600">Select a canteen and customize your meal</p>
              </div>

              {/* Step 1: Select Canteen */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Choose a Canteen</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 1, name: 'Main Canteen', emoji: '🍽️', desc: 'Main dining' },
                    { id: 2, name: 'Juice Bar', emoji: '🥤', desc: 'Fresh juices' },
                    { id: 3, name: 'Basement Canteen', emoji: '🍜', desc: 'Asian cuisine' },
                    { id: 4, name: 'NewCanteen', emoji: '🍱', desc: 'Premium meals' },
                  ].map(canteen => (
                    <button
                      key={canteen.id}
                      onClick={() => setSelectedCanteen(canteen)}
                      className={`p-6 rounded-2xl border-2 transition transform hover:scale-105 ${
                        selectedCanteen?.id === canteen.id
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}
                    >
                      <div className="text-5xl mb-3">{canteen.emoji}</div>
                      <p className="font-bold text-gray-900">{canteen.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{canteen.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCanteen && (
                <>
                  {/* Step 2: Customize Meal */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Customize Your Meal</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Name *</label>
                        <input
                          type="text"
                          value={mealCustomization.name}
                          onChange={(e) => setMealCustomization({ ...mealCustomization, name: e.target.value })}
                          placeholder="Enter your meal name (e.g., Spicy Biryani)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
                        <textarea
                          value={mealCustomization.specialInstructions}
                          onChange={(e) => setMealCustomization({ ...mealCustomization, specialInstructions: e.target.value })}
                          placeholder="Add any special requests, dietary preferences, or ingredients to avoid"
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Meal Image</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setMealCustomization({ ...mealCustomization, image: e.target.files?.[0] || null })}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-orange-50 file:to-amber-50 file:text-orange-600 hover:file:from-orange-100 hover:file:to-amber-100 transition cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">📸 JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Canteen Info Display */}
                  <div className="mb-8 p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-orange-600">Selected Canteen:</span> {selectedCanteen.name}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowCreateOrderModal(false);
                        setSelectedCanteen(null);
                        setMealCustomization({ name: "", items: [], specialInstructions: "", image: null });
                      }}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (mealCustomization.name.trim()) {
                          // Points to earn from creating custom order
                          const pointsEarned = 0.5;
                          
                          // Update user reward points
                          const updatedUserData = {
                            ...userData,
                            totalRewardPoints: (userData?.totalRewardPoints || 0) + pointsEarned,
                          };
                          setUserData(updatedUserData);

                          // Add to reward history
                          const newHistoryEntry = {
                            date: new Date().toISOString(),
                            action: 'Earned',
                            points: pointsEarned,
                            canteen: selectedCanteen.name,
                            amount: pointsEarned * 10,
                            description: `Earned points from creating custom order: ${mealCustomization.name}`,
                          };
                          setRewardHistory([newHistoryEntry, ...rewardHistory]);

                          // Convert image to data URL if it exists
                          if (mealCustomization.image) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const newOrder = {
                                id: Date.now(),
                                name: mealCustomization.name,
                                canteen: selectedCanteen.name,
                                specialInstructions: mealCustomization.specialInstructions,
                                image: reader.result,
                                createdAt: new Date().toLocaleDateString(),
                                pointsEarned: pointsEarned,
                              };
                              setCustomOrders([newOrder, ...customOrders]);
                              toast.success(`✨ Order created! +${pointsEarned} reward points 🎉`);
                              setShowCreateOrderModal(false);
                              setSelectedCanteen(null);
                              setMealCustomization({ name: "", items: [], specialInstructions: "", image: null });
                            };
                            reader.readAsDataURL(mealCustomization.image);
                          } else {
                            const newOrder = {
                              id: Date.now(),
                              name: mealCustomization.name,
                              canteen: selectedCanteen.name,
                              specialInstructions: mealCustomization.specialInstructions,
                              image: null,
                              createdAt: new Date().toLocaleDateString(),
                              pointsEarned: pointsEarned,
                            };
                            setCustomOrders([newOrder, ...customOrders]);
                            toast.success(`✨ Order created! +${pointsEarned} reward points 🎉`);
                            setShowCreateOrderModal(false);
                            setSelectedCanteen(null);
                            setMealCustomization({ name: "", items: [], specialInstructions: "", image: null });
                          }
                        } else {
                          toast.error("Please enter a meal name");
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg hover:from-orange-600 hover:to-amber-600 transition transform hover:scale-105"
                    >
                      Create Order
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Donation Success Message */}
        {donationSuccessMsg && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 text-lg font-semibold">
            <CheckCircle className="h-6 w-6" />
            <span>{donationSuccessMsg}</span>
            <button className="ml-4 hover:bg-green-600 rounded-full p-1" onClick={() => setDonationSuccessMsg("")}> <X className="h-5 w-5" /> </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
