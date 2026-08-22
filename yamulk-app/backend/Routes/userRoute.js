import express from "express";
import { getUsers, login, register } from "../Controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.post("/", login);
userRouter.post("/register", register);

export default userRouter;
