import Destination from "../Models/destinationModel.js";

// GET /destinations?search=sigiriya
export async function searchDestinations(req, res) {
  try {
    const search = req.query.search?.trim();

    if (!search) {
      return res.status(400).json({
        message: "Please provide a destination name",
      });
    }

    const destinations = await Destination.find({
      name: {
        $regex: search,
        $options: "i",
      },
    })
      .select(
        "name category province description imageURL location averageRating estimatedCost popularity"
      )
      .sort({ popularity: -1, averageRating: -1 })
      .limit(20);

    if (destinations.length === 0) {
      return res.status(404).json({
        message: "No destinations found",
        destinations: [],
      });
    }

    return res.status(200).json({
      count: destinations.length,
      destinations,
    });
  } catch (error) {
    console.error("Destination search error:", error);

    return res.status(500).json({
      message: "Could not search destinations",
    });
  }
}

// GET /destinations/:id
export async function getDestinationById(req, res) {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    return res.status(200).json(destination);
  } catch (error) {
    console.error("Get destination error:", error);

    return res.status(400).json({
      message: "Invalid destination ID",
    });
  }
}