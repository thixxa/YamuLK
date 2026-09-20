import express from "express";
import { addReview, getAllReviews, deleteReview } from "../Controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/:destinationId/addReview", protect, addReview);
reviewRouter.get("/:destinationId/allReviews", protect, getAllReviews);
reviewRouter.delete("/:reviewId", protect, deleteReview);

export default reviewRouter;
