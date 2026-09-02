import express from "express";
import {
  getUsers,
  login,
  register,
  updatProfilePwd,
} from "../Controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.post("/", login);
userRouter.post("/register", register);
userRouter.patch("/updateProfile", protect, updatProfilePwd);

export default userRouter;
