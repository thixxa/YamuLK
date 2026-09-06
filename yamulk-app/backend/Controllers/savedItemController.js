import SavedItem from "../Models/savedItemModel.js";
import Destination from "../Models/destinationModel.js";
import Trip from "../Models/tripsModel.js";

// GET /saved
export async function getSavedItems(req, res) {
  try {
    const savedItems = await SavedItem.find({ userId: req.user._id })
      .populate({
        path: "itemId",
        populate: {
          path: "destinationId",
          model: "Destination"
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: savedItems.length, savedItems });
  } catch (error) {
    console.error("Get saved items error:", error);
    return res.status(500).json({ message: "Error fetching saved items", error: error.message });
  }
}

// POST /saved
export async function saveItem(req, res) {
  try {
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({ message: "Missing itemType or itemId" });
    }

    if (itemType !== "destination" && itemType !== "trip") {
      return res.status(400).json({ message: "Invalid itemType. Must be destination or trip." });
    }

    // Verify item exists
    if (itemType === "destination") {
      const dest = await Destination.findById(itemId);
      if (!dest) return res.status(404).json({ message: "Destination not found" });
    } else {
      const trip = await Trip.findById(itemId);
      if (!trip) return res.status(404).json({ message: "Trip not found" });
    }

    const itemModel = itemType === "destination" ? "Destination" : "Trip";

    const newItem = new SavedItem({
      userId: req.user._id,
      itemType,
      itemId,
      itemModel,
    });

    await newItem.save();
    return res.status(201).json({ message: "Item saved successfully", savedItem: newItem });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Item is already saved" });
    }
    console.error("Save item error:", error);
    return res.status(500).json({ message: "Error saving item", error: error.message });
  }
}

// DELETE /saved/:id
export async function removeSavedItem(req, res) {
  try {
    // Delete by the savedItem document ID
    const deleted = await SavedItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Saved item not found" });
    }

    return res.status(200).json({ message: "Item removed successfully" });
  } catch (error) {
    console.error("Remove saved item error:", error);
    return res.status(500).json({ message: "Error removing item", error: error.message });
  }
}

// DELETE /saved/item/:itemId
export async function removeSavedItemByItemId(req, res) {
  try {
    // Delete by the target item ID (destinationId or tripId)
    const deleted = await SavedItem.findOneAndDelete({
      itemId: req.params.itemId,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Saved item not found" });
    }

    return res.status(200).json({ message: "Item removed successfully" });
  } catch (error) {
    console.error("Remove saved item by itemId error:", error);
    return res.status(500).json({ message: "Error removing item", error: error.message });
  }
}
