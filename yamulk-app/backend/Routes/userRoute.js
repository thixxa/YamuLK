import express from "express";
import {
  getUsers,
  login,
  register,
  updateProfile,
  googleLogin,
  forgotPassword,
  resetPassword,
} from "../Controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/", protect, adminOnly, getUsers);
userRouter.post("/", login);
userRouter.post("/register", register);
userRouter.post("/google", googleLogin);
userRouter.patch("/updateProfile", protect, updateProfile);

// Password reset — public routes (no auth required)
userRouter.post("/forgotPassword", forgotPassword);
userRouter.post("/resetPassword", resetPassword);

export default userRouter;
