import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Paper,
  Grid,
} from "@mui/material";

import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  RateReview as ReviewIcon,
  RestaurantMenu as FoodIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  Logout as LogoutIcon,
  Fastfood as LogoIcon,
} from "@mui/icons-material";

import { motion, AnimatePresence } from "framer-motion";
import UserManagement from "./userManagemnt/userManagement";
import { useAuthStore } from "../store/user";

const drawerWidth = 260;

const AdminDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Overview", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "Customers", icon: <PeopleIcon />, path: "/admin/dashboard/All-user" },
    { text: "Menu Items", icon: <FoodIcon />, path: "/admin/dashboard/products" },
    { text: "Inventory", icon: <InventoryIcon />, path: "/admin/dashboard/inventory" },
    { text: "Transactions", icon: <PaymentIcon />, path: "/admin/dashboard/payment" },
    { text: "Feedbacks", icon: <ReviewIcon />, path: "/admin/dashboard/feedback" },
    { text: "Settings", icon: <SettingsIcon />, path: "/admin/dashboard/settings" },
  ];

  const drawer = (
    <Box sx={{ height: "100%", bgcolor: "#111", color: "white" }}>
      {/* Logo */}
      <Toolbar sx={{ px: 2, py: 3, display: "flex", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "#FF8C42" }}>
          <LogoIcon />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Sliit<span style={{ color: "#FF8C42" }}>Byte</span>
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Menu */}
      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={motion.div}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: "12px",
                  bgcolor: isActive ? "rgba(255,140,66,0.15)" : "transparent",
                  color: isActive ? "#FF8C42" : "#aaa",
                  transition: "0.3s",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "#fff",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#FF8C42" : "inherit",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      <Box sx={{ position: "absolute", bottom: 20, width: "100%", px: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => {
            localStorage.removeItem("ADMIN_TEST_MODE");
            logout?.();
            navigate("/login");
          }}
          sx={{
            borderRadius: "10px",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Mobile AppBar */}
      <AppBar
        position="fixed"
        sx={{
          display: { sm: "none" },
          bgcolor: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          color: "#000",
        }}
      >
        <Toolbar>
          <IconButton onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Admin Panel</Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{ display: { xs: "block", sm: "none" } }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: "none",
              boxShadow: "10px 0 30px rgba(0,0,0,0.05)",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{
          flexGrow: 1,
          p: 4,
          mt: { xs: 8, sm: 0 },
        }}
      >
        <Paper
          sx={{
            p: 4,
            borderRadius: "20px",
            backdropFilter: "blur(10px)",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route index element={<DashboardSummary />} />
              <Route path="All-user" element={<UserManagement />} />
              <Route path="products" element={<Page title="Menu Management" />} />
              <Route path="inventory" element={<Page title="Inventory Tracking" />} />
              <Route path="payment" element={<Page title="Revenue & Payments" />} />
              <Route path="feedback" element={<Page title="Customer Feedback" />} />
              <Route path="settings" element={<Page title="System Settings" />} />
            </Routes>
          </AnimatePresence>
        </Paper>
      </Box>
    </Box>
  );
};

const Page = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  >
    <Typography variant="h5" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
  </motion.div>
);

// Dashboard Summary
const DashboardSummary = () => (
  <Box>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 800,
        background: "linear-gradient(90deg,#000,#555)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Morning, Admin 👋
    </Typography>

    <Typography sx={{ mb: 4, color: "text.secondary" }}>
      Here’s what’s happening today.
    </Typography>

    <Grid container spacing={3}>
      {[
        { label: "Pending Orders", val: "12", color: "#FF8C42" },
        { label: "Completed", val: "148", color: "#4CAF50" },
        { label: "Low Stock", val: "5", color: "#F44336" },
      ].map((stat) => (
        <Grid item xs={12} sm={4} key={stat.label}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "16px",
                borderLeft: `6px solid ${stat.color}`,
                "&:hover": {
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography variant="caption">{stat.label}</Typography>
              <Typography variant="h4">{stat.val}</Typography>
            </Paper>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default AdminDashboard;