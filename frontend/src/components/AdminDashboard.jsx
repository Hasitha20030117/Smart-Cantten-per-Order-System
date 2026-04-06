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
  Grid
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
  Fastfood as LogoIcon
} from "@mui/icons-material";

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
    <Box sx={{ height: '100%', bgcolor: '#1A1A1A', color: 'white' }}>
      <Toolbar sx={{ px: 2, py: 3, display: 'flex', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#FF8C42', width: 32, height: 32 }}>
          <LogoIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Sliit<span style={{ color: '#FF8C42' }}>Byte</span>
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '12px',
                  bgcolor: isActive ? 'rgba(255, 140, 66, 0.15)' : 'transparent',
                  color: isActive ? '#FF8C42' : '#A0A0A0',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' },
                  transition: '0.2s ease',
                }}
              >
                <ListItemIcon sx={{ 
                    minWidth: 40, 
                    color: isActive ? '#FF8C42' : 'inherit' 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 400 }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ position: 'absolute', bottom: 20, width: '100%', px: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => {
            logout?.();
            navigate("/login");
          }}
          sx={{ borderRadius: '10px', textTransform: 'none' }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F8F9FA', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Mobile AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          color: '#1A1A1A',
          boxShadow: 'none',
          borderBottom: '1px solid #E0E0E0',
          display: { sm: 'none' }
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', boxShadow: '10px 0 30px rgba(0,0,0,0.02)' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, sm: 0 }
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, md: 4 }, 
            borderRadius: '24px', 
            minHeight: '85vh',
            border: '1px solid #EDEDED'
          }}
        >
          <Routes>
            <Route index element={<DashboardSummary />} />
            <Route path="All-user" element={<UserManagement />} />
            <Route path="products" element={<Typography variant="h5">Menu Management</Typography>} />
            <Route path="inventory" element={<Typography variant="h5">Inventory Tracking</Typography>} />
            <Route path="payment" element={<Typography variant="h5">Revenue & Payments</Typography>} />
            <Route path="feedback" element={<Typography variant="h5">Customer Feedback</Typography>} />
            <Route path="settings" element={<Typography variant="h5">System Settings</Typography>} />
          </Routes>
        </Paper>
      </Box>
    </Box>
  );
};

// Simple Stats Component for Home
const DashboardSummary = () => (
  <Box>
    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#1A1A1A' }}>
      Morning, Admin 👋
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
      Here’s what’s happening at the Canteen today.
    </Typography>
    
    <Grid container spacing={3}>
      {[
        { label: 'Pending Orders', val: '12', color: '#FF8C42' },
        { label: 'Completed Today', val: '148', color: '#4CAF50' },
        { label: 'Low Stock Alert', val: '5', color: '#F44336' }
      ].map((stat) => (
        <Grid item xs={12} sm={4} key={stat.label}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', borderLeft: `6px solid ${stat.color}` }}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, color: 'text.secondary' }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{stat.val}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default AdminDashboard;