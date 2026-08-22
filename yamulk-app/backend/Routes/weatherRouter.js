import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getWeather } from "../Controllers/weatherController.js";

const weatherRouter = express.Router();

weatherRouter.get("/:destinationId", protect, getWeather);

export default weatherRouter;
