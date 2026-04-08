import jwt from "jsonwebtoken";
import User from "../../models/UserManagement/User.js";

export const optionalAuth = async (req, _res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1] || null;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return next();
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (user) {
      req.user = user;
      req.userId = user._id.toString();
    }
  } catch (error) {
    console.log("optionalAuth skipped invalid token:", error.message);
  }

  next();
};
