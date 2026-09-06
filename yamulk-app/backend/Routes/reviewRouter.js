import express from "express";
import { addReview, getAllReviews } from "../Controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/:destinationId/addReview", protect, addReview);
reviewRouter.get("/:destinationId/allReviews", protect, getAllReviews);

export default reviewRouter;
