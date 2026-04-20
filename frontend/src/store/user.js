import { create } from "zustand";
import axios from "../lib/axios";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,
  rewardPoints: {},
  totalRewardPoints: 0,

  // CHANGED: add confirmPassword param; map to backend's expected keys
  signup: async (FirstName, LastName, Email, Contact, Address, password, confirmPassword) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        firstName: FirstName,
        lastName: LastName,
        email: Email,
        phoneNumber: Contact,
        address: Address,
        password,
        confirmPassword,
      };
      console.log("Signup payload:", payload);
      
      const response = await axios.post("/user/addUser", payload);
      console.log("Signup response:", response.data);
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error signing up";
      console.error("Signup error:", {
        status: error?.response?.status,
        message: errorMessage,
        data: error?.response?.data,
        fullError: error
      });
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // CHANGED: add /user prefix
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("/user/login", { email, password });
      set({
        isAuthenticated: true,
        user: response.data.user,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error?.response?.data?.message || "Error logging in", isLoading: false });
      throw error;
    }
  },

  // CHANGED: /user/logout
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`/user/logout`);
      set({ user: null, isAuthenticated: false, error: null, isLoading: false });
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },

  // CHANGED: /user/verify-email
  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/user/verify-email`, { code });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error?.response?.data?.message || "Error verifying email", isLoading: false });
      throw error;
    }
  },

  // CHANGED: /user/check-auth
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`/user/check-auth`);
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isCheckingAuth: false,
        rewardPoints: response.data.user?.rewardPoints || {},
        totalRewardPoints: response.data.user?.totalRewardPoints || 0
      });
    } catch {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },

  fetchRewardPoints: async () => {
    try {
      const response = await axios.get('/user/points');
      set({
        rewardPoints: response.data.rewardPoints,
        totalRewardPoints: response.data.totalRewardPoints
      });
    } catch (error) {
      console.error('Error fetching reward points:', error);
    }
  },

  redeemPoints: async (pointsToRedeem, canteenId, orderTotal) => {
    try {
      const response = await axios.post('/user/redeem-points', {
        pointsToRedeem,
        canteenId,
        orderTotal
      });
      set({
        rewardPoints: response.data.remainingPointsByCanteen || {},
        totalRewardPoints: response.data.remainingPoints
      });
      return response.data;
    } catch (error) {
      console.error('Error redeeming points:', error);
      throw error;
    }
  },

  // Fetch current user data to refresh totalRewardPoints after bulk order
  fetchCurrentUser: async () => {
    try {
      if (!useAuthStore.getState().user?._id) return;
      const response = await axios.get(`/user/selectUser/${useAuthStore.getState().user._id}`);
      if (response.data?.success && response.data.user) {
        useAuthStore.getState().setUser(response.data.user);
      }
    } catch (error) {
      console.warn('Failed to fetch current user:', error);
    }
  },

  // CHANGED: /user/forgot-password
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/user/forget-password`, { email });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error?.response?.data?.message || "Error sending reset password email" });
      throw error;
    }
  },

  // CHANGED: /user/reset-password/${token}
  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`/user/reset-password/${token}`, { password });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error?.response?.data?.message || "Error resetting password" });
      throw error;
    }
  },

  // Add/Update user data (local state)
  setUser: (updatedUser) => {
    set((state) => ({
      user: updatedUser,
      totalRewardPoints: updatedUser?.totalRewardPoints || 0,
      rewardPoints: updatedUser?.rewardPoints || {}
    }));
  },
}));
