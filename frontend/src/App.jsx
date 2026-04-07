import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
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


import { useAuthStore } from "./store/user";
import { Home } from "lucide-react";

// ✅ Protected Route for Admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
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
    "/profile",
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
                : <HomePage />  // ✅ Customer sees HomePage
                : <HomePage />    // ✅ Public sees HomePage
          }
        />

        {/* Public Routes */}
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
        <Route path="/ContactPage" element={<ContactPage />} />
        <Route path="/FaqPage" element={<FaqPage />} />
        <Route path="/AboutUsPage" element={<AboutUsPage />} />
        <Route path="/canteen" element={<CanteenLanding />} />
        <Route path="/canteen/pay/:orderId" element={<PayForToken />} />
        <Route path="/canteen/pay/online/:paymentId" element={<OnlinePay />} />
        <Route path="/canteen/pay/qr/:paymentId" element={<QrPay />} />
        <Route path="/canteen/pay/slip/:paymentId" element={<SlipPay />} />
        <Route path="/canteen/receipt/:paymentId" element={<Receipt />} />
        <Route path="/canteen/my-payments" element={<MyPayments />} />
        <Route path="/bulk-order" element={<BulkOrderPage />} />
        <Route path="/meal-selection/:groupId" element={<MealSelectionPage />} />
        <Route path="/tokens" element={<TokenGenerationPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/create" element={<CreateOrderPage />} />
        

        {/* Customer Routes */}
        <Route
          path="/profile"
          element={
            <CustomerRoute>
              <UserProfile />
            </CustomerRoute>
          }
        />

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

    

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: "#363636", color: "#fff" },
        }}
      />
    </Router>
  );
}

export default App;
