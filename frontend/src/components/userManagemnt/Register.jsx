import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/user";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  X,
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

  const { signup, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  

  {/* Validates individual fields and updates the error state.*/}
   
  const validateField = (name, value, currentFormData = formData) => {
    let message = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) message = `${name === "firstName" ? "First" : "Last"} name is required`;
        else if (!/^[A-Za-z\s]+$/.test(value)) message = "Only letters allowed";
        break;
      case "email":
        if (!value.trim()) message = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) message = "Please enter a valid email";
        break;
      case "contact":
        if (!value.trim()) message = "Phone number is required";
        else if (!/^\d{10}$/.test(value)) message = "Enter a valid 10-digit phone number";
        break;
      case "address":
        if (!value.trim()) message = "Address is required";
        break;
      case "password":
        if (value.length < 8) message = "Password must be at least 8 characters";
        break;
      case "confirmPassword":
        // Compares with the password currently in state
        if (value !== currentFormData.password) message = "Passwords do not match";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
    return message;
  };

  {/* Updates state and triggers validation/strength checks.
   */}
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // If password changes, re-check strength and re-validate the "Confirm" field
    if (name === "password") {
      checkPasswordStrength(value);
      validateField("confirmPassword", formData.confirmPassword, newFormData);
    }
    
    validateField(name, value, newFormData);
  };

  

  const handleKeyPress = (e, type) => {
    if (type === "name" && !/^[a-zA-Z\s]*$/.test(e.key)) e.preventDefault();
    if (type === "phone" && !/[0-9]/.test(e.key)) e.preventDefault();
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
    if (passwordStrength <= 25) return "#ef4444"; // Red
    if (passwordStrength <= 50) return "#f97316"; // Orange
    if (passwordStrength <= 75) return "#fb923c"; // Light Orange
    return "#10b981"; // Green
  };

  

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate all fields in the object
    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) isValid = false;
    });

    
    if (!agreedToTerms) {
      newErrors.terms = "Please accept the terms";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Trim all fields to remove leading/trailing whitespace
      const trimmedData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        address: formData.address.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      // Validate trimmed data is not empty
      if (!Object.values(trimmedData).every(val => val.length > 0)) {
        toast.error("All fields are required");
        return;
      }

      await signup(
        trimmedData.firstName,
        trimmedData.lastName,
        trimmedData.email,
        trimmedData.contact,
        trimmedData.address,
        trimmedData.password,
        trimmedData.confirmPassword
      );
      toast.success("Account created! Please verify your email.");
      navigate("/verify-email");
    } catch (err) {
      const errorMsg = err?.response?.data?.message || error || "Signup failed. Please try again.";
      console.error("Signup failed:", err);
      toast.error(errorMsg);
    }
  };

  const closeToHome = () => navigate("/");

  return (
    <div className="fixed inset-0 flex z-50 bg-gray-100" onClick={closeToHome}>
      {/* Left Branding Side */}
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
            Create your account today to enjoy cashless payments and pre-order your favorite meals.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full lg:w-2/5 bg-white flex flex-col relative overflow-y-auto p-6 sm:p-8 shadow-2xl"
      >
        <button
          onClick={closeToHome}
          className="absolute top-6 right-6 z-20 p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Create Account</h2>
            <p className="text-center text-gray-600 mb-6">Join us today!</p>

            <form className="space-y-4" onSubmit={handleSignUp}>
              {/* Names Row */}
              <div className="grid grid-cols-2 gap-3">
                {["firstName", "lastName"].map((field) => (
                  <div key={field}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, "name")}
                        placeholder={field === "firstName" ? "First Name" : "Last Name"}
                        className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
                          errors[field] ? "border-red-400" : "border-gray-200 focus:border-orange-500"
                        }`}
                      />
                    </div>
                    {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                  </div>
                ))}
              </div>

              {/* Email Field */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none ${
                      errors.email ? "border-red-400" : "border-gray-200 focus:border-orange-500"
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    name="contact"
                    maxLength={10}
                    value={formData.contact}
                    onChange={handleInputChange}
                    onKeyPress={(e) => handleKeyPress(e, "phone")}
                    placeholder="Phone Number"
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none ${
                      errors.contact ? "border-red-400" : "border-gray-200 focus:border-orange-500"
                    }`}
                  />
                </div>
                {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
              </div>

              {/* Address Field */}
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none ${
                      errors.address ? "border-red-400" : "border-gray-200 focus:border-orange-500"
                    }`}
                  />
                </div>
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className={`w-full pl-10 pr-12 py-2.5 border-2 rounded-lg focus:outline-none ${
                      errors.password ? "border-red-400" : "border-gray-200 focus:border-orange-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Strength Indicator */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${passwordStrength}%`, backgroundColor: getPasswordStrengthColor() }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    className={`w-full pl-10 pr-12 py-2.5 border-2 rounded-lg focus:outline-none ${
                      errors.confirmPassword ? "border-red-400" : "border-gray-200 focus:border-orange-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Terms Checkbox */}
              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                    I agree to the <span className="text-orange-600 hover:underline">Terms & Conditions</span>
                  </label>
                </div>
                {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !agreedToTerms}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-all shadow-lg active:scale-95"
              >
                {isLoading ? "Creating Account..." : "Create My Account"}
              </button>

              <div className="text-center pt-4 border-t">
                <span className="text-gray-600 text-sm">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-orange-600 font-semibold hover:text-orange-700 text-sm"
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