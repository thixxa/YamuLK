import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";

export async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Token not found" });
      }
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }
  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
}

/**
 * adminOnly — must be chained AFTER protect.
 * Returns 403 Forbidden if the authenticated user is not an admin.
 */
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: admin access required" });
  }
  return next();
}
