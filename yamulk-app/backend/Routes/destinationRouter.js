import express from "express";
import {
  searchDestinations,
  getDestinationById,
  createDestination,
} from "../Controllers/destinationController.js";
import { protect } from "../middleware/authMiddleware.js";

const destinationRouter = express.Router();

destinationRouter.get("/", protect, searchDestinations);
destinationRouter.get("/:id", protect, getDestinationById);
destinationRouter.post("/", protect, createDestination);

export default destinationRouter;
