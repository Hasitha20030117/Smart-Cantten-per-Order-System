import { create } from "zustand";
import axios from "../lib/axios";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  // CHANGED: add confirmPassword param; map to backend's expected keys
  signup: async (FirstName, LastName, Email, Contact, Address, password, confirmPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("/user/addUser", {
        firstName: FirstName,
        lastName: LastName,
        email: Email,
        phoneNumber: Contact,
        address: Address,
        password,
        confirmPassword, // <-- send this
      });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: error?.response?.data?.message || "Error signing up", isLoading: false }); // <-- safe optional chaining
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
      set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
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
}));
