import express from "express";
import { getSavedItems, saveItem, removeSavedItem, removeSavedItemByItemId } from "../Controllers/savedItemController.js";
import { protect } from "../middleware/authMiddleware.js";

const savedItemRouter = express.Router();

savedItemRouter.get("/", protect, getSavedItems);
savedItemRouter.post("/", protect, saveItem);
savedItemRouter.delete("/:id", protect, removeSavedItem);
savedItemRouter.delete("/item/:itemId", protect, removeSavedItemByItemId);

export default savedItemRouter;
