// routes/UserManagement/User.js  (ESM)

import express from "express";
import { verifyToken } from "../../middleware/UserManagement/verifyToken.js";
import {
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  logout,
  login,
  verifyEmail,
  forgetPassword,
  resetPassword,
  checkAuth,
} from "../../controllers/UserManagement/userController.js";

const router = express.Router();

// optional sanity check
console.log("verifyToken:", typeof verifyToken, "checkAuth:", typeof checkAuth);

router.get("/check-auth", verifyToken, checkAuth);
router.post("/addUser", addUser);
router.get("/AllUser", getAllUsers);
router.get("/SelectUser/:id", getUserById);
router.put("/updateUser/:id", updateUser);
router.delete("/deleteUser/:id", deleteUser);
router.post("/logout", logout);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

export default router;