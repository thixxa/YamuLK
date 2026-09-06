import express from "express";
import { getBudgetByTrip, updateBudget } from "../Controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";

const budgetRouter = express.Router();

budgetRouter.get("/:tripId", protect, getBudgetByTrip);
budgetRouter.post("/:tripId", protect, updateBudget);

export default budgetRouter;
