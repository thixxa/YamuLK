import Trip from "../Models/tripsModel.js";
import Destination from "../Models/destinationModel.js";
import { GoogleGenAI } from "@google/genai";

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

    // Calculate trip duration
    const tripDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));

    // Fetch destination name for the prompt
    let destinationName = "the selected destination";
    try {
      const dest = await Destination.findById(destinationId);
      if (dest) destinationName = dest.name;
    } catch (err) {
      console.warn("Could not fetch destination for itinerary generation:", err);
    }

    let itinerary = "";

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        You are an expert travel planner for Sri Lanka. Create a day-by-day travel itinerary for a trip to ${destinationName}, Sri Lanka.
        
        Trip Details:
        - Duration: ${tripDays} days
        - Group Size: ${people} person(s)
        - Transport: ${transportMode}
        - Accommodation: ${accommodationType}
        - Total Budget: LKR ${totalBudget}
        - Special Notes/Preferences: ${specialNotes || "None"}
        
        Requirements:
        1. Format the response in clean, structural Markdown.
        2. Do not use a main # heading (e.g. no # Trip to Sigiriya). Start directly with ## Day 1.
        3. Break down each day logically (morning, afternoon, evening activities).
        4. Keep the suggestions realistic based on the budget and transport mode.
        5. Provide a brief summary of the trip at the end.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      itinerary = response.text || "";
    } catch (aiError) {
      console.error("AI Itinerary Generation failed, using fallback:", aiError.message);
      // Fallback itinerary if AI fails
      itinerary = `
## Basic Itinerary for ${destinationName}

**Day 1**
* Travel to ${destinationName} using ${transportMode}.
* Check in to your ${accommodationType}.
* Settle in and explore the local area.

**Trip Details**
* **Group:** ${people} person(s)
* **Budget:** Rs. ${totalBudget}
* **Notes:** ${specialNotes || "None"}
      `.trim();
    }

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
      return res.status(404).json({ message: "Trip not found or you are not authorized" });
    }

    return res.status(200).json({ message: "Trip Deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "deleteTrip error", error: error.message });
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
      "waypoints",
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
