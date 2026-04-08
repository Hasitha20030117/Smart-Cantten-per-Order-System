import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/user";
import { Eye, EyeOff, Mail, Lock, X } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, user } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const closeToHome = () => navigate("/");
  const stop = (e) => e.stopPropagation();

  const validate = () => {
    let tempErrors = {};
    if (!email.trim()) tempErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      tempErrors.email = "Enter a valid email";

    if (!password.trim()) tempErrors.password = "Password is required";
    else if (password.length < 8)
      tempErrors.password = "Password must be at least 8 characters";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(email, password);
      if (user?.role === "admin") navigate("/admin-Dashboard");
      else navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 flex z-50" onClick={closeToHome}>
      {/* Left Image + Dark Overlay */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        <img
          src="/images/5.jpg"
          alt="fashion background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black/80 opacity-90"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="max-w-md text-gray-300">
            "Access your canteen account to place instant pre-orders and track your meal history with a seamless digital experience."
          </p>
        </div>
      </div>

      {/* Right Login Form */}
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
          <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Welcome Back
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Please enter your credentials to continue.
            </p>

            {/* API error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-yellow-400"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-12 py-2.5 border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-yellow-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forget-password")}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <div className="text-center pt-4 border-t border-gray-200">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors duration-200"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Login;
