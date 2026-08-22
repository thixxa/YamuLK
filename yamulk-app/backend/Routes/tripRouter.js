import express from "express";
import {
  getUserTrips,
  generateItinerary,
  deleteTrip,
  updateTrip,
} from "../Controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";

const tripRouter = express.Router();

tripRouter.get("/", protect, getUserTrips);
tripRouter.post("/", protect, generateItinerary);
tripRouter.delete("/:id", protect, deleteTrip);
tripRouter.patch("/:id", protect, updateTrip);

export default tripRouter;
