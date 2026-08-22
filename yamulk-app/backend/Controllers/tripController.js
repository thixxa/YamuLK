import Trip from "../Models/tripsModel.js";

export async function getUserTrips(req, res) {
  try {
    const trips = await Trip.find({ userId: req.user._id })
      .populate("destinationId")
      .populate("budgetId")
      .sort({ createdAt: -1 });

    if (!trips) {
      return res.status(400).json({ message: "Trips are not found" });
    }
    return res.status(200).json({ count: trips.length, trips });
  } catch (error) {
    console.error("getUserTrips error:", error);

    return res.status(500).json({
      message: "Get user trips error",
      error: error.message,
    });
  }
}

export async function generateItinerary(req, res) {
  try {
    const {
      destinationId,
      travelDate,
      returnDate,
      people,
      transportMode,
      accommodationType,
      totalBudget,
      specialNotes,
    } = req.body;

    if (
      !destinationId ||
      !travelDate ||
      !returnDate ||
      !people ||
      !transportMode ||
      !accommodationType ||
      totalBudget === undefined ||
      totalBudget === null
    ) {
      return res.status(400).json({ message: "fields missing" });
    }

    // Date check
    const startDate = new Date(travelDate);
    const endDate = new Date(returnDate);

    if (endDate < startDate) {
      return res.status(400).json({
        message: "Return date cannot be before travel date",
      });
    }

    // Temporary itinerary
    const itinerary = `
      Day 1: Travel to the selected destination using ${transportMode}.
      Accommodation: ${accommodationType}.
      Trip group: ${people} person(s).
      Budget: Rs. ${totalBudget}.
      Notes: ${specialNotes || "None"}.
          `.trim();

    const newTrip = new Trip({
      userId: req.user._id,
      destinationId,
      travelDate,
      returnDate,
      people,
      transportMode,
      accommodationType,
      totalBudget,
      specialNotes: specialNotes || "",
      itinerary,
    });
    await newTrip.save();
    return res
      .status(200)
      .json({ message: "Trip saved Successfully", trip: newTrip });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "generate itinerary failed" });
  }
}

export async function deleteTrip(req, res) {
  try {
    const deletedTrip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedTrip) {
      return res.status(400).json({ message: "Trip not found" });
    }

    return res.status(200).json({ message: "Trip Deleted.." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "deleteTrip error", error: error });
  }
}

export async function updateTrip(req, res) {
  try {
    const allowedFields = [
      "destinationId",
      "travelDate",
      "returnDate",
      "people",
      "transportMode",
      "accommodationType",
      "totalBudget",
      "specialNotes",
      "itinerary",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    //date validation
    if (updates.travelDate && updates.returnDate) {
      if (new Date(updates.returnDate) < new Date(updates.travelDate)) {
        return res.status(400).json({
          message: "Return date cannot be before travel date",
        });
      }
    }

    const updatedTrip = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        $set: updates,   //only update the given updates
      },
      {
        returnDocument: "after",   //give the latest state of data
        runValidators: true,       //before update check the model rules
      }
    );

    if (!updatedTrip) {
      return res.status(404).json({
        message: "Trip not found or you are not authorized",
      });
    }

    return res.status(200).json({
      message: "Trip updated successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("Update trip error:", error);

    return res.status(400).json({
      message: "Could not update trip",
      error: error.message,
    });
  }
}
