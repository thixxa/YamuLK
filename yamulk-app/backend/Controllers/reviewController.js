import Destination from "../Models/destinationModel.js";
import Review from "../Models/reviewModel.js";

export async function addReview(req, res) {
  try {
    const id = req.params.destinationId;

    const isValidDestination = await Destination.findById(id);
    if (!isValidDestination) {
      return res.status(400).json({ message: "Invalid destination" });
    }

    const { rating, comment = "" } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating not found" });
    }

    const newReview = new Review({
      userId: req.user._id,
      destinationId: id,
      rating,
      comment,
    });
    await newReview.save();

    // Recalculate average rating for destination
    const stats = await Review.aggregate([
      { $match: { destinationId: isValidDestination._id } },  //Only look at the reviews that belong to THIS destination
      { $group: { _id: "$destinationId", avgRating: { $avg: "$rating" } } }, //Group them together and calculate the average
    ]);
    //Clean up and round the number
    const newAverage =
      stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;

    await Destination.findByIdAndUpdate(id, { averageRating: newAverage });
    
    return res.status(201).json({
      message: "Review saved successfully",
      review: newReview,
      newAverageRating: newAverage,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this destination" });
    }
    console.error("addReview error:", error);
    return res.status(500).json({ message: "Error adding review" });
  }
}
