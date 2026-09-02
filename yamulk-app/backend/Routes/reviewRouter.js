import express from "express";
import { addReview } from "../Controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/:destinationId/addReview", protect, addReview);

export default reviewRouter;
