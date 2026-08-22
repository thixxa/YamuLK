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
        return res.status(400).json({ message: "toekn not found" });
      }
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.user = await User.findById(decoded.id);

      return next();
    } catch (error) {
      return res.status(400).json({ message: "Protection Failed" });
    }
  }
  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
}
