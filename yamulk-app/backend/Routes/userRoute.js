import express from "express";
import {
  getUsers,
  login,
  register,
  updateProfile,
} from "../Controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/", protect, getUsers);       // now protected
userRouter.post("/", login);
userRouter.post("/register", register);
userRouter.patch("/updateProfile", protect, updateProfile);

export default userRouter;
