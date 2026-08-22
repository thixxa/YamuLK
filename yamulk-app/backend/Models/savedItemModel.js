import mongoose from "mongoose";

const savedItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemType: {
      type: String,
      required: true,
      enum: ["destination", "trip"],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemModel",
    },
    itemModel: {
      type: String,
      required: true,
      enum: ["Destination", "Trip"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent saving the same item twice for the same user.
savedItemSchema.index(
  { userId: 1, itemType: 1, itemId: 1 },
  { unique: true }
);

const SavedItem = mongoose.model("SavedItem", savedItemSchema);

export default SavedItem;