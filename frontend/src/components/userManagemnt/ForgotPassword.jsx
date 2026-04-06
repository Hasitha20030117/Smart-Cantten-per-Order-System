import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/user";
import { X, Mail, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { forgotPassword, isLoading } = useAuthStore();

  const closeToHome = () => navigate("/");
  const stop = (e) => e.stopPropagation();

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      toast.success("Reset link sent (if the email exists).");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send reset email");
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
          <h1 className="text-4xl font-bold mb-4">Forgot Password?</h1>
          <p className="max-w-md text-gray-300">
            Enter your email and we’ll send a secure link to reset your password.
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
          className="absolute top-6 right-6 z-20 p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all duration-200"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h2>

            {!isSubmitted ? (
              <>
                <p className="text-gray-600 mb-6">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                        error
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-200 focus:border-orange-500"
                      }`}
                    />
                  </div>
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </>
            ) : (
              <div className="mt-4">
                {/* Note: I kept the checkmark green as it universally signifies 'success', but you can change 'bg-green-500' to 'bg-orange-500' if you want a strictly monochromatic theme! */}
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600">
                  If an account exists for <b>{email}</b>, you will receive a password reset link shortly.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto flex justify-center pt-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-orange-600 hover:text-orange-700 hover:underline text-sm font-medium flex items-center gap-1 transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </aside>
    </div>
  );
};

export default ForgotPassword;