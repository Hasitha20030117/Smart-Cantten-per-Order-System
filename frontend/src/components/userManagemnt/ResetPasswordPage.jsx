import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { X, Lock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useParams(); // Get token from URL

  const closeToHome = () => navigate("/");
  const stop = (e) => e.stopPropagation();

  const validatePasswords = () => {
    if (!password || !confirmPassword) {
      setError("Both fields are required");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:8070/user/reset-password/${token}`,
        { password },
        { withCredentials: true }
      );
      setIsSuccess(true);
      toast.success(response.data.message || "Password reset successfully!");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Error resetting password. Token may be invalid or expired."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex z-50" onClick={closeToHome}>
      {/* Left image + dark overlay */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        <img
          src="/images/bckg.jpg"
          alt="fashion background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black/80 opacity-90"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Reset Your Password</h1>
          <p className="max-w-md text-gray-300">
            Enter a new password below to securely update your account.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <aside
        onClick={stop}
        className="w-full lg:w-2/5 bg-white flex flex-col relative overflow-y-auto p-6 sm:p-8 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={closeToHome}
          className="absolute top-6 right-6 z-20 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>

            {!isSuccess ? (
              <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                      error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-yellow-400"
                    }`}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                      error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-yellow-400"
                    }`}
                  />
                </div>

                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {isSubmitting ? "Resetting..." : "Set New Password"}
                </button>
              </form>
            ) : (
              <div className="mt-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600">
                  Password has been successfully reset. You can now login with your new password.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-yellow-600 hover:underline text-sm font-medium"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ResetPassword;
