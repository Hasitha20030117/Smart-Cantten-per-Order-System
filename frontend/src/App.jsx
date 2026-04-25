import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import ChatBot from "./components/AI/chatbot";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/userManagemnt/Login";
import Navbar from "./components/navigationBar";
import RegisterPage from "./components/userManagemnt/Register";
import ForgotPassword from "./components/userManagemnt/ForgotPassword";
import UserProfile from "./components/userManagemnt/UserProfile";
import VerifyEmail from "./components/userManagemnt/VerifyEmail";
import ResetPasswordPage from "./components/userManagemnt/ResetPasswordPage";
import AdminQuickAccess from "./components/userManagemnt/AdminQuickAccess";
import HomePage from "./components/HomePage"
import ContactPage from "./components/ContactPage";
import FaqPage from "./components/FaqPage";
import AboutUsPage from "./components/AboutUsPage";
import CanteenLanding from "./pages/canteen/CanteenLanding";
import PayForToken from "./pages/canteen/PayForToken";
import OnlinePay from "./pages/canteen/OnlinePay";
import QrPay from "./pages/canteen/QrPay";
import SlipPay from "./pages/canteen/SlipPay";
import Receipt from "./pages/canteen/Receipt";
import MyPayments from "./pages/canteen/MyPayments";
import CanteenAdminPayments from "./pages/canteen/AdminPayments";
import BulkOrderPage from "./pages/bulk/BulkOrderPage";
import MealSelectionPage from "./pages/bulk/MealSelectionPage";
import SubscriptionPage from "./pages/bulk/SubscriptionPage";
import TokenGenerationPage from "./pages/bulk/TokenGenerationPage";
import CreateOrderPage from "./pages/orders/CreateOrderPage";
import OrdersPage from "./pages/orders/OrdersPage";
import JuiceBar from "./pages/menu/JuiceBar";
import Basement from "./pages/menu/Basement";
import NewCanteen from "./pages/menu/NewCanteen";
import Anohana from "./pages/menu/Anohana";
import BreakfastPage from "./pages/menu/BreakfastPage";
import LunchPage from "./pages/menu/LunchPage";
import SnacksPage from "./pages/menu/SnacksPage";

import { useAuthStore } from "./store/user";

// ✅ Protected Route for Admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Allow test/demo access to admin dashboard
  const isTestMode = localStorage.getItem("ADMIN_TEST_MODE") === "true";
  
  if (!isTestMode && !isAuthenticated) return <Navigate to="/login" replace />;
  if (!isTestMode && user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

// ✅ Protected Route for Customers
const CustomerRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "customer") return <Navigate to="/admin/dashboard" replace />;
  return children;
};

// ✅ Conditional Navbar (always show on public & customer side)
const ConditionalNavbar = () => {
  const location = useLocation();

  const hideNavbarRoutes = [
    "/admin/dashboard", // hide on admin dashboard
    "/canteen/admin/payments",
  ];

  const isResetPasswordRoute = location.pathname.startsWith("/reset-password/");

  if (hideNavbarRoutes.some((route) => location.pathname.startsWith(route)) || isResetPasswordRoute) {
    return null;
  }

  return <Navbar />;
};

// ✅ Loading spinner while checking auth
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <ThemeProvider>
      <Router>
        <ConditionalNavbar />
        
        <Routes>
          {/* Root Route - redirect admin automatically */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? user?.role === "admin"
                  ? <Navigate to="/admin/dashboard" replace />
                  : <HomePage />
                : <Navigate to="/login" replace />
            }
          />

          {/* Public Auth Routes */}
          <Route
            path="/register"
            element={
              isAuthenticated
                ? user?.role === "admin"
                  ? <Navigate to="/admin/dashboard" replace />
                  : <Navigate to="/" replace />
                : <RegisterPage />
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated
                ? user?.role === "admin"
                  ? <Navigate to="/admin/dashboard" replace />
                  : <Navigate to="/" replace />
                : <Login />
            }
          />
          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/admin-quick-access" element={<AdminQuickAccess />} />

          {/* Protected App Routes */}
          <Route path="/ContactPage" element={<CustomerRoute><ContactPage /></CustomerRoute>} />
          <Route path="/FaqPage" element={<CustomerRoute><FaqPage /></CustomerRoute>} />
          <Route path="/AboutUsPage" element={<CustomerRoute><AboutUsPage /></CustomerRoute>} />
          <Route path="/canteen" element={<CustomerRoute><CanteenLanding /></CustomerRoute>} />
          <Route path="/canteen/pay/:orderId" element={<CustomerRoute><PayForToken /></CustomerRoute>} />
          <Route path="/canteen/pay/online/:paymentId" element={<CustomerRoute><OnlinePay /></CustomerRoute>} />
          <Route path="/canteen/pay/qr/:paymentId" element={<CustomerRoute><QrPay /></CustomerRoute>} />
          <Route path="/canteen/pay/slip/:paymentId" element={<CustomerRoute><SlipPay /></CustomerRoute>} />
          <Route path="/canteen/receipt/:paymentId" element={<CustomerRoute><Receipt /></CustomerRoute>} />
          <Route path="/canteen/my-payments" element={<CustomerRoute><MyPayments /></CustomerRoute>} />
          <Route path="/bulk-order" element={<CustomerRoute><BulkOrderPage /></CustomerRoute>} />
          <Route path="/meal-selection/:groupId" element={<CustomerRoute><MealSelectionPage /></CustomerRoute>} />
          <Route path="/tokens" element={<CustomerRoute><TokenGenerationPage /></CustomerRoute>} />
          <Route path="/subscription" element={<CustomerRoute><SubscriptionPage /></CustomerRoute>} />
          <Route path="/orders" element={<CustomerRoute><OrdersPage /></CustomerRoute>} />
          <Route path="/orders/create" element={<CustomerRoute><CreateOrderPage /></CustomerRoute>} />
          <Route path="/menu/juice-bar" element={<CustomerRoute><JuiceBar /></CustomerRoute>} />
          <Route path="/menu/basement" element={<CustomerRoute><Basement /></CustomerRoute>} />
          <Route path="/menu/new-canteen" element={<CustomerRoute><NewCanteen /></CustomerRoute>} />
          <Route path="/menu/anohana" element={<CustomerRoute><Anohana /></CustomerRoute>} />
          <Route path="/menu" element={<CustomerRoute><JuiceBar /></CustomerRoute>} />
          <Route path="/breakfast" element={<CustomerRoute><BreakfastPage /></CustomerRoute>} />
          <Route path="/lunch" element={<CustomerRoute><LunchPage /></CustomerRoute>} />
          <Route path="/snacks" element={<CustomerRoute><SnacksPage /></CustomerRoute>} />

          {/* Profile */}
          <Route path="/profile" element={<CustomerRoute><UserProfile /></CustomerRoute>} />
          <Route path="/user-profile" element={<CustomerRoute><UserProfile /></CustomerRoute>} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/canteen/admin/payments"
            element={
              <AdminRoute>
                <CanteenAdminPayments />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ChatBot />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: "#363636", color: "#fff", dark: "dark:bg-slate-800 dark:text-white" },
          }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
