import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/user";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  X,
  CheckCircle,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { signup, error, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Handle field changes + validate while typing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") checkPasswordStrength(value);
    validateField(name, value);
  };

  // Prevent invalid characters while typing
  const handleKeyPress = (e, type) => {
    if (type === "name") {
      if (!/^[a-zA-Z\s]*$/.test(e.key)) e.preventDefault();
    }
    if (type === "phone") {
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "#ef4444"; // red
    if (passwordStrength <= 50) return "#f59e0b"; // orange
    if (passwordStrength <= 75) return "#3b82f6"; // blue
    return "#10b981"; // green
  };

  const validateField = (name, value) => {
    let message = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim())
          message = `${name === "firstName" ? "First" : "Last"} name is required`;
        else if (!/^[A-Za-z\s]+$/.test(value)) message = "Only letters allowed";
        break;
      case "email":
        if (!value.trim()) message = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value))
          message = "Please enter a valid email";
        break;
      case "contact":
        if (!value.trim()) message = "Phone number is required";
        else if (!/^\d{10}$/.test(value))
          message = "Enter a valid 10-digit phone number";
        break;
      case "address":
        if (!value.trim()) message = "Address is required";
        break;
      case "password":
        if (value.length < 8) message = "Password must be at least 8 characters";
        break;
      case "confirmPassword":
        if (value !== formData.password) message = "Passwords do not match";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const validateForm = () => {
    let formErrors = {};
    Object.keys(formData).forEach((key) => validateField(key, formData[key]));
    if (!agreedToTerms) formErrors.terms = "Please accept the terms";
    setErrors((prev) => ({ ...prev, ...formErrors }));

    return Object.values(formErrors).every((e) => !e);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await signup(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.contact,
        formData.address,
        formData.password,
        formData.confirmPassword
      );
      navigate("/verify-email");
    } catch (err) {
      console.log(err);
    }
  };

  const closeToHome = () => navigate("/");
  const stop = (e) => e.stopPropagation();

  return (
    <div className="fixed inset-0 flex z-50" onClick={closeToHome}>
      {/* Left Side (Background + Overlay) */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        <img
          src="/images/5.jpg"
          alt="fashion background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black/80 opacity-90"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Platform</h1>
          <p className="max-w-md text-gray-300">
            "Create your account today to enjoy cashless payments, skip the long queues, and pre-order your favorite meals from anywhere.
          </p>
        </div>
      </div>

      {/* Right Side (Form Panel) */}
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

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Create Account
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Join us today! Fill in your details to get started.
            </p>

            <form className="space-y-4" onSubmit={handleSignUp}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                {/* First Name */}
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onKeyPress={(e) => handleKeyPress(e, "name")}
                      placeholder="First Name"
                      className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg ${
                        errors.firstName
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onKeyPress={(e) => handleKeyPress(e, "name")}
                      placeholder="Last Name"
                      className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg ${
                        errors.lastName
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg ${
                      errors.email ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    onKeyPress={(e) => handleKeyPress(e, "phone")}
                    maxLength={10}
                    placeholder="Phone Number"
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg ${
                      errors.contact ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.contact && (
                  <p className="text-xs text-red-500 mt-1">{errors.contact}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg ${
                      errors.address ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className={`w-full pl-10 pr-12 py-2.5 border-2 rounded-lg ${
                      errors.password ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundColor: getPasswordStrengthColor(),
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Password Strength:{" "}
                    {passwordStrength <= 25
                      ? "Weak"
                      : passwordStrength <= 50
                      ? "Fair"
                      : passwordStrength <= 75
                      ? "Good"
                      : "Strong"}
                  </p>
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    className={`w-full pl-10 pr-12 py-2.5 border-2 rounded-lg ${
                      errors.confirmPassword
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {formData.confirmPassword && (
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                      {formData.password === formData.confirmPassword ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 select-none"
                  >
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-yellow-600 hover:underline font-medium"
                    >
                      Terms & Conditions
                    </a>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-xs text-red-500 mt-1">{errors.terms}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !agreedToTerms}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? "Creating Account..." : "Create My Account"}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <span className="text-gray-600">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors duration-200"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Register;
