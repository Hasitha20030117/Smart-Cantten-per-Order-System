import {\n  BrowserRouter as Router,\n  Routes,\n  Route,\n  Navigate,\n  useLocation,\n} from "react-router-dom";\nimport { ThemeProvider } from "./contexts/ThemeContext";\nimport ChatBot from "./components/AI/chatbot";
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
import JuiceBar from "./pages/menu/JuiceBar";
import Basement from "./pages/menu/Basement";
import NewCanteen from "./pages/menu/NewCanteen";
import Anohana from "./pages/menu/Anohana";

import { useAuthStore } from "./store/user";

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
                : <HomePage />
              : <HomePage />
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
        <Route path="/menu/juice-bar" element={<JuiceBar />} />
        <Route path="/menu/basement" element={<Basement />} />
        <Route path="/menu/new-canteen" element={<NewCanteen />} />
        <Route path="/menu/anohana" element={<Anohana />} />

        {/* Profile - Now Public for Demo */}
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/user-profile" element={<UserProfile />} />


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

        <ChatBot />\n        <Toaster\n          position="top-right"\n          toastOptions={{\n            duration: 3000,\n            style: { background: "#363636", color: "#fff", dark: "dark:bg-slate-800 dark:text-white" },\n          }}\n        />\n      </Router>\n    </ThemeProvider>\n  );\n
}

export default App;
